// Distributed Two-Phase Commit (2PC) vs Saga & Dual-Write Invariant Models
// Production architectural models for atomic commit coordination, non-blocking 3PC,
// transactional outbox sagas, dual-write drift reconciliation, and Paxos/TrueTime commit protocols.

export interface CommitParticipant {
  id: string;
  name: string;
  role: string;
  engine: string;
  state: 'IDLE' | 'VOTING' | 'PREPARED' | 'COMMITTED' | 'ABORTED' | 'IN_DOUBT';
  locksHeld: number;
  walLogOffset: string;
  latencyMs: number;
}

export interface AtomicCommitParadigm {
  id: string;
  title: string;
  category: string;
  tagline: string;
  blockingNature: 'Strictly Blocking' | 'Non-Blocking (Fail-Stop)' | 'Non-Blocking (Eventual)' | 'Self-Healing Audit' | 'Consensus Non-Blocking';
  throughputTps: string;
  latencyP99: string;
  recoveryGuarantee: string;
  description: string;
  tradeOffSummary: string;
  steps: {
    phase: string;
    action: string;
    actor: string;
    invariant: string;
  }[];
  specCode: string;
}

export interface InvariantDriftItem {
  entityId: string;
  primaryStore: string;
  secondaryStore: string;
  primaryCrc: string;
  secondaryCrc: string;
  driftStatus: 'IN_SYNC' | 'DRIFT_DETECTED' | 'RECONCILING' | 'HEALED';
  deltaFields: string[];
  lastReconciledMsAgo: number;
}

export const ATOMIC_COMMIT_PARADIGMS: AtomicCommitParadigm[] = [
  {
    id: 'two-phase-commit',
    title: 'Classical Two-Phase Commit (2PC) with In-Doubt Lock Recovery',
    category: 'ACID Distributed Transactions',
    tagline: 'XA protocol with atomic prepare and commit phases, vulnerable to coordinator crash lock freeze',
    blockingNature: 'Strictly Blocking',
    throughputTps: '380 - 650 TPS',
    latencyP99: '42.8ms',
    recoveryGuarantee: 'Strict Linearizable Atomicity (All or Nothing)',
    description: 'Coordinates atomic commits across heterogeneous resources via an XA transaction manager. In Phase 1 (Prepare), coordinator broadcasts VOTE_REQUEST and each participant writes PREPARED to its local WAL holding exclusive row locks. In Phase 2, if all voted YES, coordinator writes COMMIT log and broadcasts GLOBAL_COMMIT. If coordinator crashes between prepare and commit, participants remain locked in IN_DOUBT state until coordinator recovery log replay completes.',
    tradeOffSummary: 'Guarantees 100.0% strict ACID serializability across databases, but introduces severe tail-latency amplification and availability collapse during coordinator partition or network blackholes.',
    steps: [
      {
        phase: 'Phase 1: Prepare Vote',
        action: 'Coordinator dispatches VOTE_REQUEST to all participants; participants acquire exclusive table locks and flush PREPARED WAL entry.',
        actor: 'Coordinator -> Participants',
        invariant: 'Participant cannot unilateral abort once PREPARED is written to persistent disk.'
      },
      {
        phase: 'Phase 1: Vote Aggregation',
        action: 'Participants reply with VOTE_COMMIT (YES) or VOTE_ABORT (NO). Coordinator aggregates votes with monotonic timeout timer.',
        actor: 'Participants -> Coordinator',
        invariant: 'If any single participant votes NO or times out, coordinator state transitions to GLOBAL_ABORT.'
      },
      {
        phase: 'Phase 2: Global Decision Log',
        action: 'Coordinator appends COMMIT or ABORT decision to local write-ahead log with fsync before notifying any participant.',
        actor: 'Coordinator Engine',
        invariant: 'Decision becomes irrevocable the instant the coordinator WAL entry hits non-volatile storage.'
      },
      {
        phase: 'Phase 2: Decision Dispatch & ACK',
        action: 'Coordinator broadcasts GLOBAL_COMMIT to all participants. Participants execute commit, release exclusive locks, and reply with ACK.',
        actor: 'Coordinator -> Participants',
        invariant: 'All held row locks are released only upon successful Phase 2 execution.'
      }
    ],
    specCode: `// Java 21 LTS - XA Distributed 2PC Coordinator with In-Doubt Journal
public class XaTwoPhaseCommitCoordinator {
    private final WalJournal walJournal;
    private final List<XaParticipantResource> participants;
    private final Duration prepareTimeout = Duration.ofMillis(1500);

    public CommitResult executeDistributedTransaction(TransactionContext ctx) {
        String txId = ctx.getTransactionId();
        walJournal.record(txId, TransactionState.STARTING);

        // Phase 1: Prepare
        List<VoteResult> votes = new CopyOnWriteArrayList<>();
        boolean allPrepared = participants.parallelStream().allMatch(p -> {
            try {
                VoteResult vote = p.prepare(txId, prepareTimeout);
                votes.add(vote);
                return vote.isPrepared();
            } catch (Exception e) {
                return false;
            }
        });

        if (!allPrepared) {
            walJournal.record(txId, TransactionState.ABORTING);
            broadcastDecision(txId, Decision.GLOBAL_ABORT);
            return CommitResult.aborted("One or more participants failed prepare phase");
        }

        // Irrevocable Phase 2: WAL commit record fsync
        walJournal.recordWithFsync(txId, TransactionState.COMMITTED);

        // Phase 2: Commit Dispatch
        broadcastDecision(txId, Decision.GLOBAL_COMMIT);
        walJournal.record(txId, TransactionState.TERMINATED);
        return CommitResult.success();
    }
}`
  },
  {
    id: 'three-phase-commit',
    title: 'Three-Phase Commit (3PC) with Non-Blocking PreCommit Quorum',
    category: 'Non-Blocking Consensus Protocols',
    tagline: 'Skeen protocol adding PreCommit intermediate phase to eliminate coordinator crash lock blocking',
    blockingNature: 'Non-Blocking (Fail-Stop)',
    throughputTps: '1,200 - 1,800 TPS',
    latencyP99: '68.4ms (3-RTT)',
    recoveryGuarantee: 'Non-Blocking under Fail-Stop Node Crashes',
    description: 'Extends 2PC by splitting Phase 2 into two decoupled states: PreCommit and DoCommit. In Phase 1 (CanCommit?), coordinator queries resource readiness. In Phase 2 (PreCommit), coordinator announces that all resources voted YES, allowing participants to know that no resource will abort. In Phase 3 (DoCommit), transactions are finalized. If coordinator fails, participants elect a backup coordinator that inspects participant states to safely proceed or abort without blocking indefinitely.',
    tradeOffSummary: 'Eliminates unbounded blocking under fail-stop coordinator crashes, but incurs 3 network round-trips (3-RTT) and remains vulnerable to split-brain inconsistencies during network partitions.',
    steps: [
      {
        phase: 'Phase 1: CanCommit Query',
        action: 'Coordinator sends CanCommit request. Participants check capacity, schema constraints, and reply with YES or NO.',
        actor: 'Coordinator -> Participants',
        invariant: 'No exclusive write locks are held yet; resources merely verify capability to lock.'
      },
      {
        phase: 'Phase 2: PreCommit Broadcast',
        action: 'Upon unanimous YES votes, coordinator issues PreCommit. Participants acquire locks and prepare to finalize.',
        actor: 'Coordinator -> Participants',
        invariant: 'Once PreCommit is acknowledged, participants know that no peer voted NO.'
      },
      {
        phase: 'Phase 3: DoCommit Execution',
        action: 'Coordinator issues DoCommit. Participants apply mutations, release locks, and reply with HaveCommitted.',
        actor: 'Coordinator -> Participants',
        invariant: 'Any participant timing out in PreCommit state can safely commit via elected backup coordinator.'
      }
    ],
    specCode: `// Rust - Three-Phase Commit Finite State Machine (3PC)
pub enum ThreePhaseState {
    Init,
    CanCommitSent,
    PreCommitAcknowledged,
    DoCommitted,
    Aborted,
}

pub struct NonBlocking3pcCoordinator {
    state: ThreePhaseState,
    participants: Vec<ParticipantAddress>,
}

impl NonBlocking3pcCoordinator {
    pub async fn execute_3pc(&mut self, tx_id: &str) -> Result<(), CommitError> {
        // Step 1: CanCommit (1st RTT)
        let can_commit = self.broadcast_can_commit(tx_id).await?;
        if !can_commit.is_unanimous() {
            self.broadcast_abort(tx_id).await?;
            return Err(CommitError::ParticipantVeto);
        }

        // Step 2: PreCommit (2nd RTT)
        self.state = ThreePhaseState::CanCommitSent;
        self.broadcast_pre_commit(tx_id).await?;
        self.state = ThreePhaseState::PreCommitAcknowledged;

        // Step 3: DoCommit (3rd RTT)
        self.broadcast_do_commit(tx_id).await?;
        self.state = ThreePhaseState::DoCommitted;
        Ok(())
    }
}`
  },
  {
    id: 'choreographed-outbox-saga',
    title: 'Choreographed Saga with Transactional CDC Outbox',
    category: 'Event-Driven Eventual Consistency',
    tagline: 'Zero distributed locks with local ACID transaction log tailing and asynchronous Kafka compensation',
    blockingNature: 'Non-Blocking (Eventual)',
    throughputTps: '18,500 - 24,000 TPS',
    latencyP99: '1.2ms (Ingress) / 11.4ms (Eventual)',
    recoveryGuarantee: 'Eventual Consistency via Backward Compensation Log',
    description: 'Decouples distributed services by replacing synchronous distributed locking with local ACID transactions coupled to a Transactional Outbox table. Changes to application state and outbox events are committed in a single atomic database transaction. Debezium CDC tails PostgreSQL WAL and streams events to Kafka. Downstream participants consume events idempotently and publish success or failure events. If a downstream step fails, reverse compensation events are dispatched.',
    tradeOffSummary: 'Achieves 30x higher throughput and zero lock blocking compared to 2PC, but trades off immediate read-your-writes consistency for bounded eventual consistency ($t_{lag} < 12ms$).',
    steps: [
      {
        phase: 'Step 1: Local ACID Outbox Write',
        action: 'Service inserts domain state and outbox record into PostgreSQL in a single atomic ACID transaction.',
        actor: 'Ingress Order Service',
        invariant: 'Zero dual-write gap: domain write and event queue are physically committed together in one WAL record.'
      },
      {
        phase: 'Step 2: Debezium CDC Log Streaming',
        action: 'Debezium tails PostgreSQL pg_logical replication slot and streams outbox event to Apache Kafka topic with partition key.',
        actor: 'Debezium CDC Engine',
        invariant: 'Zero polling overhead; stream events are ordered monotonically per aggregate ID.'
      },
      {
        phase: 'Step 3: Idempotent Consumer Dispatch',
        action: 'Payment and Inventory services process event with unique idempotency key and publish OrderCompleted or PaymentFailed.',
        actor: 'Downstream Microservices',
        invariant: 'Re-delivered events are deduplicated via hot Redis key check in sub-0.8ms.'
      },
      {
        phase: 'Step 4: Backward Compensation (On Failure)',
        action: 'If payment fails, PaymentFailed event triggers reverse compensation stack: inventory unreserved, order marked void.',
        actor: 'Saga Event Mesh',
        invariant: 'Zero double-spend; compensation handlers are strictly idempotent and replay-safe.'
      }
    ],
    specCode: `// TypeScript - Transactional Outbox Pattern with PostgreSQL & Debezium
export async function createOrderWithOutbox(
  db: DatabasePool, 
  order: OrderInput
): Promise<string> {
  return await db.transaction(async (tx) => {
    // 1. Insert domain entity
    const orderId = crypto.randomUUID();
    await tx.query(
      'INSERT INTO orders (id, customer_id, amount, status) VALUES ($1, $2, $3, $4)',
      [orderId, order.customerId, order.amount, 'PENDING']
    );

    // 2. Insert outbox record in same physical transaction
    const outboxPayload = JSON.stringify({
      orderId,
      customerId: order.customerId,
      amount: order.amount,
      createdAt: new Date().toISOString()
    });

    await tx.query(
      \`INSERT INTO outbox_events 
        (aggregate_type, aggregate_id, event_type, payload) 
       VALUES ('ORDER', $1, 'OrderCreated', $2)\`,
      [orderId, outboxPayload]
    );

    return orderId;
  });
}`
  },
  {
    id: 'dual-write-drift-reconciler',
    title: 'Dual-Write Invariant Reconciliation & Self-Healing Engine',
    category: 'Resilience & Audit Governance',
    tagline: 'Cryptographic CRC-32 checksum sliding window detecting and auto-healing data drift between stores',
    blockingNature: 'Self-Healing Audit',
    throughputTps: '50,000 entities / min scanned',
    latencyP99: 'Sub-4.5ms drift detection',
    recoveryGuarantee: 'Cryptographic Eventual Convergence ($Divergence = 0.00%$)',
    description: 'Protects systems where primary transactional datastores (PostgreSQL OLTP) asynchronously update secondary read engines (Elasticsearch search indices, Redis caches, and analytical replicas). A continuous background reconciliation worker computes cryptographic sliding-window CRC-32 checksums across primary and secondary records. When silent data corruption, dropped Kafka events, or network partition drops cause data drift, the reconciler auto-dispatches targeted repair mutations.',
    tradeOffSummary: 'Provides absolute auditability and automated healing for asynchronous eventual architectures, with configurable audit sampling rates to prevent primary database read pressure.',
    steps: [
      {
        phase: 'Phase 1: Sliding Window Partition Checksum',
        action: 'Background auditor scans partition records in chunks of 500 and computes CRC-32 hash of canonicalized field states.',
        actor: 'Reconciliation Daemon',
        invariant: 'Canonical field sorting guarantees hash equivalence regardless of JSON key serialization order.'
      },
      {
        phase: 'Phase 2: Secondary Store State Comparison',
        action: 'Auditor issues batch query to Elasticsearch/Redis for identical key range and compares partition hash trees.',
        actor: 'Auditor -> Secondary Store',
        invariant: 'If partition root hashes match, entire 500-record block is certified consistent in 1 single comparison.'
      },
      {
        phase: 'Phase 3: Targeted Leaf Drift Isolation',
        action: 'If root hashes diverge, auditor drills into individual records and flags exact field mismatches.',
        actor: 'Drift Evaluator',
        invariant: 'Isolates corrupted entity IDs in sub-12ms without table locking or blocking live application writes.'
      },
      {
        phase: 'Phase 4: Compensating Repair Injection',
        action: 'Auditor synthesizes fresh CDC synchronization event to Kafka retry topic to force downstream re-materialization.',
        actor: 'Self-Healing Committer',
        invariant: 'Secondary store state converges monotonically to primary source-of-truth state.'
      }
    ],
    specCode: `// Go - Sliding Window Invariant Drift Detector & Reconciler
type PartitionAuditResult struct {
    PartitionID int    \`json:"partition_id"\`
    PrimaryCRC  uint32 \`json:"primary_crc"\`
    ReplicaCRC  uint32 \`json:"replica_crc"\`
    DriftDetected bool \`json:"drift_detected"\`
}

func (r *Reconciler) VerifyPartition(ctx context.Context, partID int) (*PartitionAuditResult, error) {
    primaryRecords, err := r.pgRepo.FetchPartitionSlice(ctx, partID)
    if err != nil {
        return nil, err
    }

    replicaRecords, err := r.esRepo.FetchPartitionSlice(ctx, partID)
    if err != nil {
        return nil, err
    }

    pHash := crc32.ChecksumIEEE(canonicalSerialize(primaryRecords))
    rHash := crc32.ChecksumIEEE(canonicalSerialize(replicaRecords))

    result := &PartitionAuditResult{
        PartitionID:   partID,
        PrimaryCRC:    pHash,
        ReplicaCRC:    rHash,
        DriftDetected: pHash != rHash,
    }

    if result.DriftDetected {
        go r.scheduleCompensatingSync(primaryRecords, replicaRecords)
    }

    return result, nil
}`
  },
  {
    id: 'paxos-truetime-commit',
    title: 'Paxos/Raft-Assisted Atomic Commit (Google Spanner TrueTime Paradigm)',
    category: 'Consensus-Backed Distributed ACID',
    tagline: 'Multi-Paxos replicated coordinator with TrueTime commit wait guaranteeing external linearizability',
    blockingNature: 'Consensus Non-Blocking',
    throughputTps: '9,500 - 14,000 TPS',
    latencyP99: '18.2ms',
    recoveryGuarantee: 'Linearizable External Consistency ($T_1 < T_2 \\implies Commit(T_1) < Commit(T_2)$)',
    description: 'The architecture utilized by Google Cloud Spanner and CockroachDB to achieve globally distributed linearizable transactions without single-point-of-failure coordinator stalls. Each participant partition is backed by an independent Paxos or Multi-Raft replicated group. The coordinator itself is a replicated Paxos group. TrueTime synchronized hardware GPS/atomic clocks provide bounded uncertainty intervals $[t.earliest, t.latest]$. The coordinator enforces a commit wait: $CommitWait = 2 \\cdot \\epsilon$ (typically $< 7ms$), ensuring subsequent transactions observe monotonic physical time order globally.',
    tradeOffSummary: 'Delivers full multi-region ACID serializability and instant consensus failover without manual split-brain recovery, but requires GPS/atomic clock sync or hybrid logical clock (HLC) bounded error budgets.',
    steps: [
      {
        phase: 'Phase 1: Paxos-Replicated Prepare',
        action: 'Leader of each participant Paxos group appends PREPARED record to its local replicated log across majority replicas.',
        actor: 'Participant Paxos Groups',
        invariant: 'Node crash does not stall transaction: Paxos follower promotes to leader and inherits prepared state.'
      },
      {
        phase: 'Phase 2: TrueTime Timestamp Assignment',
        action: 'Coordinator queries TrueTime API and assigns commit timestamp $s = \\max(TT.now().latest, \\text{prepared_timestamps})$.',
        actor: 'Coordinator Paxos Leader',
        invariant: 'Guarantees commit timestamp is strictly greater than all previous transaction timestamps.'
      },
      {
        phase: 'Phase 3: Replicated Commit Log & TrueTime Wait',
        action: 'Coordinator logs COMMIT to its Paxos group and executes commit wait until $TT.now().earliest > s$.',
        actor: 'Coordinator Leader',
        invariant: 'No client can observe transaction state until real physical time has passed $s$, proving linearizability.'
      },
      {
        phase: 'Phase 4: Non-Blocking Participant Release',
        action: 'Coordinator notifies participant leaders. Participants commit in their local Paxos logs and release locks.',
        actor: 'Coordinator -> Participants',
        invariant: 'Complete immunity to coordinator machine crashes: Paxos lease ensures seamless failover.'
      }
    ],
    specCode: `// Spanner TrueTime Linearizable Commit Protocol Pseudocode
class SpannerCommitCoordinator {
    private final TrueTime trueTime = TrueTime.getInstance();
    private final PaxosGroup coordinatorPaxos;

    public void commitTransaction(TransactionId txId, Set<PaxosGroupId> participants) {
        // Step 1: Request prepared timestamps from participant Paxos leaders
        long maxPreparedTs = participants.parallelStream()
            .mapToLong(p -> p.getLeader().replicatedPrepare(txId))
            .max()
            .orElse(0L);

        // Step 2: Assign monotonic commit timestamp using TrueTime bounds
        TimeInterval now = trueTime.now();
        long commitTs = Math.max(now.getLatest(), maxPreparedTs + 1);

        // Step 3: Replicate COMMIT record across coordinator Paxos majority
        coordinatorPaxos.replicateLog(new CommitRecord(txId, commitTs));

        // Step 4: Enforce TrueTime Commit Wait (2 * epsilon)
        // Ensures no external client can see results before real physical time passes commitTs
        while (trueTime.now().getEarliest() <= commitTs) {
            Thread.onSpinWait();
        }

        // Step 5: Broadcast commit timestamp to participants
        participants.forEach(p -> p.getLeader().applyCommit(txId, commitTs));
    }
}`
  }
];

export const INITIAL_PARTICIPANTS: CommitParticipant[] = [
  {
    id: 'node-order-db',
    name: 'Order Service DB',
    role: 'Primary Participant',
    engine: 'PostgreSQL 16 (XA Resource)',
    state: 'IDLE',
    locksHeld: 0,
    walLogOffset: '0x1F800B',
    latencyMs: 1.4
  },
  {
    id: 'node-inventory-db',
    name: 'Inventory Warehouse DB',
    role: 'Secondary Participant',
    engine: 'MySQL 8.4 (InnoDB XA)',
    state: 'IDLE',
    locksHeld: 0,
    walLogOffset: '0x0A992C',
    latencyMs: 2.1
  },
  {
    id: 'node-payment-vault',
    name: 'Payment Settlement Vault',
    role: 'PCI-DSS Participant',
    engine: 'CockroachDB / HSM API',
    state: 'IDLE',
    locksHeld: 0,
    walLogOffset: '0x4E101A',
    latencyMs: 3.8
  }
];

export const INITIAL_DRIFT_ITEMS: InvariantDriftItem[] = [
  {
    entityId: 'ORD-9021-TX',
    primaryStore: 'PostgreSQL Orders (Status: CONFIRMED)',
    secondaryStore: 'Elasticsearch Index (Status: CONFIRMED)',
    primaryCrc: '0x8A4B12E0',
    secondaryCrc: '0x8A4B12E0',
    driftStatus: 'IN_SYNC',
    deltaFields: [],
    lastReconciledMsAgo: 142
  },
  {
    entityId: 'ORD-9022-TX',
    primaryStore: 'PostgreSQL Orders (Amount: $249.00, Fee: $4.98)',
    secondaryStore: 'Redis Search Cache (Amount: $249.00, Fee: $0.00)',
    primaryCrc: '0xFE3910A1',
    secondaryCrc: '0x7B1109C2',
    driftStatus: 'DRIFT_DETECTED',
    deltaFields: ['fee_amount', 'updated_at'],
    lastReconciledMsAgo: 12
  },
  {
    entityId: 'ORD-9023-TX',
    primaryStore: 'PostgreSQL Orders (State: REFUNDED, Items: 0)',
    secondaryStore: 'Read Replica DB (State: REFUNDED, Items: 0)',
    primaryCrc: '0x14C789FF',
    secondaryCrc: '0x14C789FF',
    driftStatus: 'IN_SYNC',
    deltaFields: [],
    lastReconciledMsAgo: 580
  },
  {
    entityId: 'ORD-9024-TX',
    primaryStore: 'PostgreSQL Orders (Tax: $18.50, VAT_Exempt: true)',
    secondaryStore: 'Elasticsearch Index (Tax: $0.00, VAT_Exempt: false)',
    primaryCrc: '0xCC09418B',
    secondaryCrc: '0x1188AF2D',
    driftStatus: 'DRIFT_DETECTED',
    deltaFields: ['tax_total', 'vat_exempt_flag'],
    lastReconciledMsAgo: 4
  }
];
