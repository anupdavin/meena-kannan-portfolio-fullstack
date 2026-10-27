// Distributed Read-Write Quorum & Tunable Consistency Models
// Production architectural specifications for Dynamo-style strict quorums (R + W > N),
// sloppy quorums with hinted handoff, anti-entropy Merkle tree range synchronization,
// tunable consistency levels (ONE, QUORUM, LOCAL_QUORUM, ALL), and vector clock reconciliation.

export interface ReplicaNode {
  id: string;
  name: string;
  role: 'PRIMARY' | 'HINT_HOLDER' | 'REPLICA';
  datacenter: string;
  status: 'ONLINE' | 'PARTITIONED' | 'REPAIRING';
  version: number;
  data: {
    key: string;
    value: string;
    timestamp: number;
  };
  hintCount: number;
}

export interface QuorumConsistencyModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  readLatencySla: string;
  writeThroughputSla: string;
  consistencyGuarantee: string;
  isolationGuarantee?: string;
  algorithmFormula: string;
  blastRadiusContainment: string;
  architecturalInvariant: string;
  description: string;
  workflowPhases: {
    name: string;
    description: string;
    invariants: string;
  }[];
  productionOutcomes: Record<string, string>;
  specCode: string;
}

export const INITIAL_REPLICAS: ReplicaNode[] = [
  {
    id: 'node-01',
    name: 'replica-us-east-1a',
    role: 'PRIMARY',
    datacenter: 'us-east-1',
    status: 'ONLINE',
    version: 4,
    data: {
      key: 'user:1042:balance',
      value: '2650000',
      timestamp: 1730055000000
    },
    hintCount: 0
  },
  {
    id: 'node-02',
    name: 'replica-us-east-1b',
    role: 'PRIMARY',
    datacenter: 'us-east-1',
    status: 'ONLINE',
    version: 4,
    data: {
      key: 'user:1042:balance',
      value: '2650000',
      timestamp: 1730055000000
    },
    hintCount: 0
  },
  {
    id: 'node-03',
    name: 'replica-us-east-1c',
    role: 'PRIMARY',
    datacenter: 'us-east-1',
    status: 'ONLINE',
    version: 3,
    data: {
      key: 'user:1042:balance',
      value: '2150000',
      timestamp: 1730050000000
    },
    hintCount: 0
  },
  {
    id: 'node-04',
    name: 'replica-us-west-2a',
    role: 'REPLICA',
    datacenter: 'us-west-2',
    status: 'ONLINE',
    version: 4,
    data: {
      key: 'user:1042:balance',
      value: '2650000',
      timestamp: 1730055000000
    },
    hintCount: 0
  },
  {
    id: 'node-05',
    name: 'replica-us-west-2b',
    role: 'REPLICA',
    datacenter: 'us-west-2',
    status: 'ONLINE',
    version: 4,
    data: {
      key: 'user:1042:balance',
      value: '2650000',
      timestamp: 1730055000000
    },
    hintCount: 0
  }
];

export const QUORUM_CONSISTENCY_MODELS: QuorumConsistencyModel[] = [
  {
    id: 'strict-quorum-consensus',
    name: 'Dynamo-Style Strict Quorum (R + W > N) & Read Repair',
    category: 'Distributed Quorum Storage',
    badge: 'Strict Quorum Engine',
    readLatencySla: '1.45 ms P99',
    writeThroughputSla: '45,000 TPS',
    consistencyGuarantee: 'Strong Eventual Consistency with Read Repair',
    algorithmFormula: 'Intersection = R + W - N > 0 guarantees Q_read intersect Q_write != empty',
    blastRadiusContainment: 'Read repair confines stale replica divergence to local background asynchronous writes.',
    architecturalInvariant: 'If R + W > N, at least one node in the read quorum contains the latest acknowledged write.',
    description: 'In leaderless distributed databases (e.g. Amazon DynamoDB, Apache Cassandra, ScyllaDB), strict quorum consensus guarantees that a client reading from R replicas and writing to W replicas across a cluster of N replicas will always observe the latest state, because the read quorum and write quorum mathematically overlap by at least one replica (|R cap W| >= 1). When a read operation detects a version discrepancy among the responding replicas, the coordinator returns the freshest version to the client immediately and dispatches an asynchronous Read Repair write to the out-of-date nodes, converging the cluster without locking read threads.',
    workflowPhases: [
      {
        name: 'Coordinator Scatter-Gather Dispatch',
        description: 'The coordinator node receives a client read or write request, computes the key consistent hash token, selects N primary replicas on the hash ring, and broadcasts concurrent RPCs to R or W nodes.',
        invariants: 'Coordinator communicates over low-latency cluster gossip fabric; fanout overhead bounded by O(N).'
      },
      {
        name: 'Quorum Overlap & Timestamp Comparison',
        description: 'The coordinator gathers responses until reaching the quorum threshold (e.g. 3 of 5). It compares monotonic timestamps or vector clocks across responses; the record with the highest timestamp is selected as authoritative.',
        invariants: 'Mathematical quorum overlap guarantee: (3 + 3 = 6 > 5) guarantees at least 1 overlapping node.'
      },
      {
        name: 'Asynchronous Read Repair Trigger',
        description: 'If any replica in the read quorum returned a stale version, the coordinator constructs an asynchronous write payload containing the latest record and sends it to the divergent node.',
        invariants: 'Read repair executes on background worker threads; client response latency is not blocked.'
      },
      {
        name: 'Replica Acknowledgment & Settlement',
        description: 'The divergent replica commits the repaired payload into its commit log and MemTable, incrementing its local version counter to match the quorum head.',
        invariants: 'Zero data divergence across replicas after read repair sweep.'
      }
    ],
    productionOutcomes: {
      'Read Repair Latency': 'Sub-2.4 ms asynchronous patch',
      'Quorum Overlap SLA': '100% linearizable overlap when R+W > N',
      'Read P99 Latency': '1.45 ms at 50,000 queries/sec',
      'Cluster Partition Defense': 'Survives floor((N-1)/2) simultaneous node failures'
    },
    specCode: `// Dynamo Strict Quorum & Read Repair Specification
public final class StrictQuorumCoordinator {
    private final int N; // Total replication factor (e.g., 5)
    private final int R; // Read quorum size (e.g., 3)
    private final int W; // Write quorum size (e.g., 3)

    public record ReplicaResponse(String nodeId, String value, long timestamp) {}

    public StrictQuorumCoordinator(int N, int R, int W) {
        if (R + W <= N) {
            throw new IllegalArgumentException("Strict quorum requires R + W > N (Overlap guaranteed)");
        }
        this.N = N;
        this.R = R;
        this.W = W;
    }

    public String executeQuorumRead(String key, java.util.List<ReplicaResponse> responses) {
        if (responses.size() < R) {
            throw new IllegalStateException("Read quorum failed: received " + responses.size() + "/" + R);
        }

        // Find response with highest monotonic timestamp
        ReplicaResponse authoritative = responses.stream()
            .max(java.util.Comparator.comparingLong(ReplicaResponse::timestamp))
            .orElseThrow();

        // Identify stale replicas requiring read repair
        java.util.List<String> staleNodes = responses.stream()
            .filter(r -> r.timestamp() < authoritative.timestamp())
            .map(ReplicaResponse::nodeId)
            .toList();

        if (!staleNodes.isEmpty()) {
            dispatchAsyncReadRepair(key, authoritative, staleNodes);
        }

        return authoritative.value();
    }

    private void dispatchAsyncReadRepair(String key, ReplicaResponse fresh, java.util.List<String> staleNodes) {
        // Dispatches background write to stale replicas without blocking client thread
        for (String node : staleNodes) {
            System.out.printf("[Read Repair] Syncing node %s with value=%s ts=%d%n", node, fresh.value(), fresh.timestamp());
        }
    }
}`
  },
  {
    id: 'sloppy-quorum-hinted-handoff',
    name: 'Sloppy Quorum with Hinted Handoff for High Availability',
    category: 'Partition-Tolerant Storage',
    badge: 'Sloppy Quorum Engine',
    readLatencySla: '0.85 ms P99',
    writeThroughputSla: '65,000 TPS',
    consistencyGuarantee: 'High Availability (AP) with Monotonic Delivery',
    algorithmFormula: 'SloppyQuorum = First W reachable nodes on Ring; Handoff = Stream hints on peer revival',
    blastRadiusContainment: 'Network partitions never reject writes; hints are isolated in local SSD buffers until reconnection.',
    architecturalInvariant: 'A hinted write is delivered to the target replica with monotonic ordering once node is marked ALIVE.',
    description: 'During catastrophic network partitions or node outages where primary replicas for a key range are unreachable, strict quorum systems reject writes with exceptions. Under Sloppy Quorum with Hinted Handoff, the coordinator continues to accept writes by routing mutations to healthy neighboring nodes on the hash ring. The temporary recipient stores the mutation in a local Hinted Handoff directory. As soon as Serf/gossip failure detectors confirm that the partitioned primary replica has recovered, the neighbor streams the hints back to the primary, guaranteeing 99.999% write availability without data loss.',
    workflowPhases: [
      {
        name: 'Partition Detection & Primary Failure',
        description: 'The coordinator attempts to contact designated primary replicas. If primary nodes fail to respond within the RPC timeout (default 500ms), they are marked temporarily unreachable.',
        invariants: 'RPC timeout is bounded; fallback triggers before client socket timeout.'
      },
      {
        name: 'Sloppy Quorum Selection on Hash Ring',
        description: 'The coordinator walks the consistent hash ring clockwise past the failed primary, selecting the first available healthy neighbor node to act as a surrogate proxy.',
        invariants: 'Surrogate selection is deterministic across all coordinators.'
      },
      {
        name: 'Local Hint Storage & Quarantine',
        description: 'The surrogate node writes the mutation to its disk-backed Hinted Handoff queue with metadata: [TargetNodeId, Key, Value, MonotonicTimestamp, ExpiryWindow].',
        invariants: 'Hints are stored in append-only log files; RAM overhead is bounded.'
      },
      {
        name: 'Gossip Heartbeat Recovery & Handoff Sweep',
        description: 'When the failed node recovers and rejoins the gossip cluster, the surrogate node detects the node transition to ALIVE and streams all queued hints to the recovered primary in background batches.',
        invariants: 'Batch transfer rate is throttled (default 500 hints/sec) to avoid saturating recovering node CPU.'
      }
    ],
    productionOutcomes: {
      'Write Availability SLA': '99.999% uptime during node partitions',
      'Hint Delivery Window': 'Sub-4.5s upon node heartbeat restoration',
      'Throughput during Partition': '65,000 TPS without client backpressure',
      'Hint Storage Footprint': 'Bounded 500MB per surrogate node'
    },
    specCode: `// Sloppy Quorum with Hinted Handoff Specification
public final class HintedHandoffManager {
    
    public record Hint(
        String targetNodeId,
        String key,
        String payload,
        long timestamp,
        long expiryMs
    ) {}

    private final java.util.concurrent.ConcurrentLinkedQueue<Hint> hintBuffer = new java.util.concurrent.ConcurrentLinkedQueue<>();

    public void storeHint(String targetNodeId, String key, String payload, long timestamp) {
        long expiry = System.currentTimeMillis() + java.time.Duration.ofHours(3).toMillis();
        Hint hint = new Hint(targetNodeId, key, payload, timestamp, expiry);
        hintBuffer.offer(hint);
        System.out.printf("[Hinted Handoff] Buffered mutation for offline node %s (key=%s)%n", targetNodeId, key);
    }

    public int deliverHints(String recoveredNodeId, java.util.function.Consumer<Hint> deliveryTarget) {
        int delivered = 0;
        java.util.Iterator<Hint> iterator = hintBuffer.iterator();

        while (iterator.hasNext()) {
            Hint hint = iterator.next();
            if (hint.targetNodeId().equals(recoveredNodeId)) {
                if (System.currentTimeMillis() <= hint.expiryMs()) {
                    deliveryTarget.accept(hint);
                    delivered++;
                }
                iterator.remove(); // Safely remove delivered or expired hint
            }
        }
        System.out.printf("[Hinted Handoff] Flushed %d hints to recovered node %s%n", delivered, recoveredNodeId);
        return delivered;
    }
}`
  },
  {
    id: 'anti-entropy-merkle-sync',
    name: 'Anti-Entropy Background Merkle Tree Range Synchronization',
    category: 'Storage Synchronization',
    badge: 'Merkle Tree Engine',
    readLatencySla: '0.45 ms P99',
    writeThroughputSla: '58,000 TPS',
    consistencyGuarantee: 'Sub-Linear Bandwidth Divergence Healing',
    algorithmFormula: 'RootHash(A) == RootHash(B) -> 100% Invariant Match with O(1) Network Exchange',
    blastRadiusContainment: 'Divergence checks exchange only cryptographic hashes; raw row data is transmitted only for mismatches.',
    architecturalInvariant: 'If two subtrees share identical cryptographic root hashes, all child records are bit-for-bit identical.',
    description: 'When hinted handoffs expire or replicas experience prolonged network partitions, replicas can drift out of synchronization. Anti-Entropy repair resolves this without requiring full table scans or heavy network transfers by constructing hierarchical binary Merkle trees over key token ranges. Replicas exchange root hashes: if the roots match, the entire key range is proven identical in O(1) time. If roots differ, the nodes traverse down the branches, comparing child hashes until pinpointing the exact differing keys and exchanging only the missing mutations.',
    workflowPhases: [
      {
        name: 'Token Range Partitioning & Tree Generation',
        description: 'The replica divides its local key token range into 32,768 leaf buckets. It hashes each key and value using SHA-256 and computes the bottom-up hierarchical Merkle tree.',
        invariants: 'Tree generation runs during low-traffic maintenance windows; CPU priority throttled.'
      },
      {
        name: 'Root Hash Exchange & Verification',
        description: 'Two peer replicas exchange top-level root hashes over gRPC. If Root(A) == Root(B), the synchronization routine terminates immediately with zero row transfer.',
        invariants: 'Validation cost is O(1) network overhead (64 bytes transferred).'
      },
      {
        name: 'Hierarchical Subtree Traversal',
        description: 'When root hashes differ, the coordinator requests child node hashes. At each level of the tree, identical branches are pruned, isolating the divergence to a tiny percentage of leaf buckets.',
        invariants: 'Search complexity is O(log N) branch hops; network payload reduced by 99.8%.'
      },
      {
        name: 'Targeted Streamed Mutation Repair',
        description: 'Replicas stream only the specific rows belonging to the mismatched leaf buckets, updating local SSTables and re-computing the divergent hash branch.',
        invariants: '100% replica consistency restored with sub-linear network bandwidth consumption.'
      }
    ],
    productionOutcomes: {
      'Network Bandwidth Savings': '99.8% reduction vs full table scans',
      'Detection Complexity': 'O(1) root hash verification',
      'Sync Convergence Speed': 'Sub-1.2s for 10M record ranges',
      'SSTable Read Latch Stall': '0.00 ms (Lock-free background sweep)'
    },
    specCode: `// Anti-Entropy Merkle Tree Synchronization Specification
public final class MerkleTreeSyncCoordinator {
    
    public record MerkleNode(String hash, MerkleNode left, MerkleNode right, long rangeStart, long rangeEnd) {
        public boolean isLeaf() {
            return left == null && right == null;
        }
    }

    public static java.util.List<Long> findDivergentRanges(MerkleNode nodeA, MerkleNode nodeB) {
        java.util.List<Long> divergentRanges = new java.util.ArrayList<>();
        compareTrees(nodeA, nodeB, divergentRanges);
        return divergentRanges;
    }

    private static void compareTrees(MerkleNode a, MerkleNode b, java.util.List<Long> divergent) {
        // Step 1: If hashes match, entire subtree is identical -> Prune search!
        if (a == null || b == null || a.hash().equals(b.hash())) {
            return;
        }

        // Step 2: If leaf reached and hashes differ, record range for mutation streaming
        if (a.isLeaf() && b.isLeaf()) {
            divergent.add(a.rangeStart());
            return;
        }

        // Step 3: Descend down child branches
        if (a.left() != null && b.left() != null) {
            compareTrees(a.left(), b.left(), divergent);
        }
        if (a.right() != null && b.right() != null) {
            compareTrees(a.right(), b.right(), divergent);
        }
    }
}`
  },
  {
    id: 'tunable-consistency-matrix',
    name: 'Tunable Consistency Levels (ONE, QUORUM, LOCAL_QUORUM, ALL)',
    category: 'SLA & Policy Routing',
    badge: 'Tunable SLA Engine',
    readLatencySla: '0.38 ms to 8.5 ms',
    writeThroughputSla: '72,000 TPS',
    consistencyGuarantee: 'Per-Query Tunable Consistency Policy',
    algorithmFormula: 'Cost = Latency(Level) vs Strong Linearizability Probability',
    blastRadiusContainment: 'Query-level consistency overrides prevent slow cross-region nodes from degrading fast local UI reads.',
    architecturalInvariant: 'LOCAL_QUORUM guarantees strong consistency within local DC while eliminating cross-region WAN round trips.',
    description: 'Enterprise applications possess heterogeneous consistency requirements: financial ledger balance checks require linearizable QUORUM or ALL consistency, whereas user activity logging and shopping cart counts perform best with ONE or LOCAL_QUORUM for sub-millisecond responses. Tunable consistency allows engineers to select the exact trade-off between write throughput, read latency, and anomaly risk per query without re-architecting the underlying cluster infrastructure.',
    workflowPhases: [
      {
        name: 'Query Consistency Level Binding',
        description: 'The application specifies consistency level in the query header (e.g. ConsistencyLevel.LOCAL_QUORUM for payment operations or ConsistencyLevel.ONE for user session touches).',
        invariants: 'Policy bound at statement execution time with zero connection pool re-negotiation.'
      },
      {
        name: 'Coordinator Response Quorum Gate',
        description: 'The coordinator fires asynchronous requests to all replicas in the replica set but releases the client response thread as soon as the required threshold (e.g. 1 replica or local DC majority) acknowledges.',
        invariants: 'Client thread releases immediately on threshold; remaining replicas complete asynchronously.'
      },
      {
        name: 'Cross-Region WAN Latency Decoupling',
        description: 'Under LOCAL_QUORUM, write quorums require majority confirmation only from nodes within the caller local AWS availability zone or region, bounding p99 latency to sub-2ms.',
        invariants: 'Cross-region replication continues in background; inter-datacenter fiber blips do not fail queries.'
      },
      {
        name: 'SLA Monitoring & Degradation Alarm',
        description: 'Prometheus metrics track quorum response latency percentiles; if LOCAL_QUORUM latency exceeds 5ms, traffic routing can gracefully degrade non-critical queries to ConsistencyLevel.ONE.',
        invariants: 'Automated fallback governed by sliding window circuit breaker.'
      }
    ],
    productionOutcomes: {
      'Level ONE P99 Latency': '0.38 ms at 75,000 queries/sec',
      'LOCAL_QUORUM P99': '1.45 ms within local datacenter',
      'QUORUM P99 Latency': '2.20 ms multi-node linearizable',
      'Level ALL P99 Latency': '8.50 ms cross-region strict synchronous'
    },
    specCode: `// Tunable Consistency Levels Policy Specification
public enum ConsistencyLevel {
    ONE(1, false, "Sub-0.4ms fast reads; risks reading stale data if replica lagged"),
    TWO(2, false, "Requires 2 replica confirmations"),
    LOCAL_QUORUM(3, true, "Majority within local datacenter; eliminates cross-DC WAN latency"),
    QUORUM(3, false, "Strict majority across entire global cluster (R + W > N)"),
    ALL(5, false, "Synchronous confirmation from all N replicas; zero tolerance for offline nodes");

    private final int requiredAcks;
    private final boolean localDatacenterOnly;
    private final String description;

    ConsistencyLevel(int requiredAcks, boolean localDatacenterOnly, String description) {
        this.requiredAcks = requiredAcks;
        this.localDatacenterOnly = localDatacenterOnly;
        this.description = description;
    }

    public int getRequiredAcks() { return requiredAcks; }
    public boolean isLocalDatacenterOnly() { return localDatacenterOnly; }
    public String getDescription() { return description; }
}`
  },
  {
    id: 'vector-clock-reconciler',
    name: 'Vector Clocks vs Last-Write-Wins (LWW) Multi-Master Conflict Reconciler',
    category: 'Causal Concurrency Control',
    badge: 'Vector Clock Engine',
    readLatencySla: '0.90 ms P99',
    writeThroughputSla: '52,000 TPS',
    consistencyGuarantee: 'Causal Invariant Ordering & Sibling Detection',
    algorithmFormula: 'VC_A <= VC_B iff forall k, VC_A[k] <= VC_B[k]; Concurrent if neither dominates',
    blastRadiusContainment: 'Concurrent divergent writes produce explicit sibling records rather than silently overwriting data.',
    architecturalInvariant: 'Vector clocks guarantee that causally preceded updates are never lost due to NTP clock drift.',
    description: 'In distributed multi-master databases, concurrent writes to the same key across disparate continents produce conflicting mutations. Naive systems use Last-Write-Wins (LWW) with wall-clock timestamps, which can silently discard legitimate customer updates when server clocks drift by even a few milliseconds. In contrast, Vector Clocks maintain an array of [NodeId: Counter] causality counters. If two vector clocks are concurrent (neither dominates the other), the engine preserves both versions as siblings, allowing domain-specific merge functions (e.g. shopping cart union or balance compensation) to resolve conflicts without data loss.',
    workflowPhases: [
      {
        name: 'Vector Clock Ingestion & Increment',
        description: 'When a node modifies a key, it increments its own logical counter in the vector clock tuple: VC[LocalNode] = VC[LocalNode] + 1.',
        invariants: 'Counter strictly monotonic; clock size scales with active coordinator count O(K).'
      },
      {
        name: 'Causal Dominance Evaluation',
        description: 'When comparing two version clocks VC_A and VC_B, the engine checks whether every component in A is <= B. If VC_A dominates, version B is accepted as a clean descendant.',
        invariants: 'Dominance check executes in sub-0.1 microseconds.'
      },
      {
        name: 'Concurrent Sibling Materialization',
        description: 'If neither clock dominates, the mutation is classified as concurrent. The storage engine preserves both versions as siblings under the same primary key.',
        invariants: 'Zero silent data loss; concurrent writes are visibly exposed.'
      },
      {
        name: 'Application-Level Semantic Merge',
        description: 'On subsequent reads, the application or resolver executes a semantic merge (e.g. Set union of items or max balance), writes the merged record with a unified vector clock, and collapses the siblings.',
        invariants: 'Siblings collapsed in-place; subsequent readers observe clean single version.'
      }
    ],
    productionOutcomes: {
      'Silent Data Overwrite': '0.00% (Guaranteed zero lost updates)',
      'Clock Drift Vulnerability': 'Zero (Pure logical causality tracking)',
      'Sibling Merge Latency': 'Sub-1.2 ms application resolution',
      'Concurrent Conflict Resolution': '100% deterministic union convergence'
    },
    specCode: `// Vector Clock Causality & Conflict Reconciler Specification
public final class VectorClock implements Comparable<VectorClock> {
    private final java.util.Map<String, Long> clock = new java.util.HashMap<>();

    public VectorClock() {}

    public VectorClock(VectorClock other) {
        this.clock.putAll(other.clock);
    }

    public synchronized void increment(String nodeId) {
        clock.put(nodeId, clock.getOrDefault(nodeId, 0L) + 1);
    }

    public enum ComparisonResult {
        GREATER_THAN, // This clock dominates (is a descendant)
        LESS_THAN,    // Other clock dominates (is an ancestor)
        EQUAL,        // Identical causality
        CONCURRENT    // Concurrent conflict -> Siblings must be merged!
    }

    public ComparisonResult compareCausality(VectorClock other) {
        boolean greater = false;
        boolean lesser = false;

        java.util.Set<String> allNodes = new java.util.HashSet<>(this.clock.keySet());
        allNodes.addAll(other.clock.keySet());

        for (String node : allNodes) {
            long v1 = this.clock.getOrDefault(node, 0L);
            long v2 = other.clock.getOrDefault(node, 0L);

            if (v1 > v2) greater = true;
            if (v1 < v2) lesser = true;
        }

        if (greater && !lesser) return ComparisonResult.GREATER_THAN;
        if (!greater && lesser) return ComparisonResult.LESS_THAN;
        if (!greater && !lesser) return ComparisonResult.EQUAL;
        return ComparisonResult.CONCURRENT; // Concurrent branch!
    }

    @Override
    public int compareTo(VectorClock o) {
        ComparisonResult res = compareCausality(o);
        return switch (res) {
            case GREATER_THAN -> 1;
            case LESS_THAN -> -1;
            default -> 0;
        };
    }
}`
  }
];
