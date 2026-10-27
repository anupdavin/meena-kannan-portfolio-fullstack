// Distributed Snapshot Isolation & Multi-Version Concurrency Control (MVCC) Models
// Production architectural specifications for PostgreSQL tuple header visibility (xmin/xmax),
// CockroachDB Hybrid Logical Clock (HLC) read restarts, Google Spanner TrueTime commit-wait,
// Git-like copy-on-write branchable time-travel versions, and lock-free epoch-based VACUUM reclamation.

export interface TupleVersion {
  versionId: string;
  rowKey: string;
  xmin: number;
  xmax: number | null;
  cid: number;
  ctid: string;
  status: 'ACTIVE' | 'DEAD_RECLAIMABLE' | 'FROZEN';
  data: {
    accountId: string;
    holder: string;
    balance: number;
    currency: string;
    tier: string;
    timestamp: string;
  };
  hlc: {
    physicalMs: number;
    logicalCounter: number;
  };
}

export interface ActiveTransaction {
  xid: number;
  name: string;
  isolationLevel: 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SNAPSHOT_ISOLATION' | 'SERIALIZABLE';
  snapshotXmin: number;
  snapshotXmax: number;
  snapshotActiveList: number[];
  state: 'COMMITTED' | 'ACTIVE' | 'ABORTED';
  startedAtHlc: string;
}

export interface MvccSnapshotModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  readLatencySla: string;
  writeThroughputSla: string;
  isolationGuarantee: string;
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

export const INITIAL_TUPLE_VERSIONS: TupleVersion[] = [
  {
    versionId: 'v1',
    rowKey: 'acc-1042',
    xmin: 100,
    xmax: 102,
    cid: 0,
    ctid: '(0,1)',
    status: 'FROZEN',
    data: {
      accountId: 'acc-1042',
      holder: 'Apex Global Logistics',
      balance: 1000000,
      currency: 'USD',
      tier: 'ENTERPRISE',
      timestamp: '2026-10-27 12:00:00 UTC'
    },
    hlc: {
      physicalMs: 1730030400000,
      logicalCounter: 0
    }
  },
  {
    versionId: 'v2',
    rowKey: 'acc-1042',
    xmin: 102,
    xmax: 105,
    cid: 0,
    ctid: '(0,2)',
    status: 'DEAD_RECLAIMABLE',
    data: {
      accountId: 'acc-1042',
      holder: 'Apex Global Logistics',
      balance: 1450000,
      currency: 'USD',
      tier: 'ENTERPRISE',
      timestamp: '2026-10-27 14:15:00 UTC'
    },
    hlc: {
      physicalMs: 1730038500000,
      logicalCounter: 1
    }
  },
  {
    versionId: 'v3',
    rowKey: 'acc-1042',
    xmin: 105,
    xmax: 108,
    cid: 0,
    ctid: '(0,3)',
    status: 'DEAD_RECLAIMABLE',
    data: {
      accountId: 'acc-1042',
      holder: 'Apex Global Logistics',
      balance: 1280000,
      currency: 'USD',
      tier: 'ENTERPRISE_VIP',
      timestamp: '2026-10-27 16:30:00 UTC'
    },
    hlc: {
      physicalMs: 1730046600000,
      logicalCounter: 0
    }
  },
  {
    versionId: 'v4',
    rowKey: 'acc-1042',
    xmin: 108,
    xmax: null,
    cid: 0,
    ctid: '(0,4)',
    status: 'ACTIVE',
    data: {
      accountId: 'acc-1042',
      holder: 'Apex Global Logistics',
      balance: 2150000,
      currency: 'USD',
      tier: 'ENTERPRISE_VIP',
      timestamp: '2026-10-27 18:45:00 UTC'
    },
    hlc: {
      physicalMs: 1730054700000,
      logicalCounter: 2
    }
  }
];

export const INITIAL_TRANSACTIONS: ActiveTransaction[] = [
  {
    xid: 101,
    name: 'Tx-Audit-Analytics',
    isolationLevel: 'SNAPSHOT_ISOLATION',
    snapshotXmin: 101,
    snapshotXmax: 101,
    snapshotActiveList: [],
    state: 'COMMITTED',
    startedAtHlc: '1730030400000-0'
  },
  {
    xid: 104,
    name: 'Tx-Quarterly-Reporting',
    isolationLevel: 'REPEATABLE_READ',
    snapshotXmin: 102,
    snapshotXmax: 105,
    snapshotActiveList: [103],
    state: 'COMMITTED',
    startedAtHlc: '1730038500000-1'
  },
  {
    xid: 107,
    name: 'Tx-Live-Payment-Hold',
    isolationLevel: 'SNAPSHOT_ISOLATION',
    snapshotXmin: 105,
    snapshotXmax: 108,
    snapshotActiveList: [106],
    state: 'COMMITTED',
    startedAtHlc: '1730046600000-0'
  },
  {
    xid: 109,
    name: 'Tx-Realtime-Checkout-Reader',
    isolationLevel: 'SNAPSHOT_ISOLATION',
    snapshotXmin: 108,
    snapshotXmax: 110,
    snapshotActiveList: [109],
    state: 'ACTIVE',
    startedAtHlc: '1730054700000-2'
  }
];

export const MVCC_SNAPSHOT_MODELS: MvccSnapshotModel[] = [
  {
    id: 'postgres-mvcc-tuple-visibility',
    name: 'PostgreSQL Tuple Header Visibility (xmin/xmax)',
    category: 'Storage Engine MVCC',
    badge: 'PostgreSQL Heap Engine',
    readLatencySla: '0.42 ms P99',
    writeThroughputSla: '48,000 TPS',
    isolationGuarantee: 'Snapshot Isolation & Non-Blocking Reads',
    algorithmFormula: 'Visible(T) = (xmin committed ^ xmin < Snapshot.xmin ^ (xmax = 0 v xmax > Snapshot.xmax v xmax in Active))',
    blastRadiusContainment: 'Readers never block writers; writers never block readers via append-only physical heap tuples.',
    architecturalInvariant: '32-bit transaction wraparound mitigated by vacuum freeze resetting t_infomask to HEAP_XMIN_FROZEN.',
    description: 'PostgreSQL implements Multi-Version Concurrency Control by storing multiple physical versions of rows directly inside data pages. Every tuple header contains t_xmin (the creating transaction ID), t_xmax (the deleting or updating transaction ID), and t_ctid (physical pointer to the updated tuple version). When a transaction executes under Snapshot Isolation or Repeatable Read, it acquires an instantaneous transaction snapshot consisting of [xmin:xmax:active_list]. Rows created by active or newer transactions are transparently filtered out, allowing long-running analytics queries to read consistent point-in-time states without acquiring shared read locks or degrading concurrent OLTP payment writes.',
    workflowPhases: [
      {
        name: 'Snapshot Acquisition & Monotonic Epoch Binding',
        description: 'Transaction requests a snapshot from the global ProcArray, capturing the oldest in-flight transaction (xmin), highest assigned transaction plus one (xmax), and the exact array of concurrent active transactions.',
        invariants: 'Snapshot is strictly monotonic and zero-copy; ProcArray lock held for less than 1.5 microseconds.'
      },
      {
        name: 'Tuple Header Inspection & Visibility Determination',
        description: 'For each candidate tuple, the executor evaluates t_infomask hint bits. If t_xmin is committed and prior to the snapshot xmin, and t_xmax is either zero or belongs to an uncommitted or future transaction, the tuple is deemed visible.',
        invariants: 'Non-blocking read execution: readers never acquire shared table or row locks, eliminating lock contention.'
      },
      {
        name: 'HOT (Heap-Only Tuples) Update Traversal',
        description: 'When an UPDATE does not modify an indexed column and the page has available space, PostgreSQL writes the new tuple version into the same page and updates the prior tuple t_ctid pointer without updating secondary indexes.',
        invariants: 'Index page writes reduced by up to 92%; secondary indexes maintain pointers to the initial root tuple.'
      },
      {
        name: 'Autovacuum Horizon Freezing & Dead Tuple Scavenging',
        description: 'Autovacuum scans data pages with old xmin values, sets HEAP_XMIN_FROZEN in the infomask to defend against 32-bit transaction ID wraparound, and marks dead tuples (xmax < OldestXmin) for line pointer reuse.',
        invariants: 'Zero transaction ID wraparound data loss; space reclaimed in-place without exclusive table locking.'
      }
    ],
    productionOutcomes: {
      'Read Lock Overhead': '0.00% (Fully lock-free reads)',
      'HOT Optimization Rate': '89.4% updates bypass index rewrite',
      'P99 Read Latency': '0.42 ms at 50,000 queries/sec',
      'Wraparound Protection': '2.0 Billion transaction freeze buffer'
    },
    specCode: `// PostgreSQL Snapshot Visibility & Header Evaluation Specification
public final class PostgresHeapTupleVisibility {
    
    public record Snapshot(
        long xmin,          // Earliest active transaction at snapshot creation
        long xmax,          // Highest assigned transaction ID + 1
        long[] activeXids   // Array of concurrent active transactions
    ) {
        public boolean isTransactionActive(long xid) {
            for (long active : activeXids) {
                if (active == xid) return true;
            }
            return false;
        }
    }

    public enum VisibilityResult {
        VISIBLE,
        INVISIBLE_TOO_NEW,
        INVISIBLE_ACTIVE_WRITER,
        INVISIBLE_DELETED
    }

    public static VisibilityResult evaluateVisibility(
        long currentXid,
        long tupleXmin,
        long tupleXmax,
        boolean xminCommitted,
        boolean xmaxCommitted,
        Snapshot snapshot
    ) {
        // Rule 1: Inserting transaction is current transaction
        if (tupleXmin == currentXid) {
            if (tupleXmax == 0) return VisibilityResult.VISIBLE;
            if (tupleXmax == currentXid) return VisibilityResult.INVISIBLE_DELETED;
            return VisibilityResult.VISIBLE;
        }

        // Rule 2: Tuple inserted by an uncommitted transaction
        if (!xminCommitted) {
            return VisibilityResult.INVISIBLE_ACTIVE_WRITER;
        }

        // Rule 3: Tuple inserted after snapshot acquisition
        if (tupleXmin >= snapshot.xmax() || snapshot.isTransactionActive(tupleXmin)) {
            return VisibilityResult.INVISIBLE_TOO_NEW;
        }

        // Rule 4: Tuple has not been deleted or updated
        if (tupleXmax == 0) {
            return VisibilityResult.VISIBLE;
        }

        // Rule 5: Deleting transaction is active or committed after our snapshot
        if (!xmaxCommitted || tupleXmax >= snapshot.xmax() || snapshot.isTransactionActive(tupleXmax)) {
            return VisibilityResult.VISIBLE; // Deletion is not yet visible to our snapshot
        }

        // Rule 6: Tuple was deleted and committed prior to our snapshot
        return VisibilityResult.INVISIBLE_DELETED;
    }
}`
  },
  {
    id: 'cockroachdb-hlc-read-restarts',
    name: 'CockroachDB Hybrid Logical Clock (HLC) with Read Restarts',
    category: 'Distributed Geo-Replicated MVCC',
    badge: 'CockroachDB HLC Engine',
    readLatencySla: '1.85 ms P99',
    writeThroughputSla: '36,000 TPS',
    isolationGuarantee: 'Strict Serializable & Non-Blocking Geo-Reads',
    algorithmFormula: 'HLC.update(peer.l, peer.c) = <max(l_now, peer.l, physical_time), c_next>',
    blastRadiusContainment: 'Read restarts confine causality drift to local transaction retries without global coordinator locks.',
    architecturalInvariant: 'Read timestamp bounded by max_offset window; causal order guaranteed across multi-region clusters.',
    description: 'CockroachDB coordinates distributed transactions across multi-region datacenters without requiring atomic GPS/Rubidium clocks by combining physical NTP wall clocks with Lamport logical counters into Hybrid Logical Clocks (HLC). Every MVCC key is stored as Key@Timestamp. When a node receives a message, its HLC clock advances monotonically. If a reader encounters an MVCC revision within its clock uncertainty interval (read_timestamp, read_timestamp + max_offset], it triggers an internal Read Restart at the higher timestamp, ensuring strict serializability and external consistency across continents without distributed 2PC read locking.',
    workflowPhases: [
      {
        name: 'HLC Clock Synchronization & Monotonic Advancement',
        description: 'Physical NTP wall time is combined with a 16-bit logical counter. When receiving gRPC RPCs from peer ranges, the local HLC updates to max(local.l, peer.l, physical_time) with incremented logical counter.',
        invariants: 'Logical ordering respects physical causality; maximum clock skew capped at max_offset (default 250ms).'
      },
      {
        name: 'Timestamp-Prefixed Key Versioning in Pebble Storage',
        description: 'Keys in Pebble (LSM storage) are formatted as [UserKey, HLC_Timestamp_Descending]. Point lookups seek directly to UserKey@ReadTimestamp, instantly discovering the latest committed version at that historical time.',
        invariants: 'SSTable Bloom filters allow sub-1.2ms key existence checks; older revisions naturally flushed to disk.'
      },
      {
        name: 'Clock Uncertainty Window & Read Restart Handling',
        description: 'If a transaction encounters a version committed within its uncertainty window (read_ts < v.ts <= read_ts + max_offset), the engine bumps the read timestamp to v.ts and restarts the read phase transparently.',
        invariants: 'Read restarts occur in less than 0.08% of transactions; eliminate stale reads caused by NTP drift.'
      },
      {
        name: 'Write Intent Resolution & Pipelining',
        description: 'Writers place inline Write Intents pointing to their transaction record. Readers encountering an unresolved intent inspect the central transaction status; if committed, the reader resolves the intent inline.',
        invariants: 'Inline intent resolution amortizes commit overhead across subsequent readers.'
      }
    ],
    productionOutcomes: {
      'Clock Hardware Dependency': 'Zero (Standard NTP cloud servers)',
      'Read Restart Rate': '0.042% during normal operations',
      'Cross-Region Read P99': '1.85 ms local range leases',
      'Serializable Throughput': '36,000 ACID TPS globally'
    },
    specCode: `// CockroachDB Hybrid Logical Clock (HLC) Implementation Specification
public final class HybridLogicalClock {
    private long physicalTime;
    private int logicalCounter;
    private final long maxOffsetMs;

    public record HlcTimestamp(long physicalTimeMs, int logicalCounter) implements Comparable<HlcTimestamp> {
        @Override
        public int compareTo(HlcTimestamp other) {
            int cmp = Long.compare(this.physicalTimeMs, other.physicalTimeMs);
            return cmp != 0 ? cmp : Integer.compare(this.logicalCounter, other.logicalCounter);
        }

        @Override
        public String toString() {
            return physicalTimeMs + "." + String.format("%04d", logicalCounter);
        }
    }

    public HybridLogicalClock(long maxOffsetMs) {
        this.maxOffsetMs = maxOffsetMs;
        this.physicalTime = System.currentTimeMillis();
        this.logicalCounter = 0;
    }

    public synchronized HlcTimestamp now() {
        long physicalNow = System.currentTimeMillis();
        if (physicalNow > physicalTime) {
            physicalTime = physicalNow;
            logicalCounter = 0;
        } else {
            logicalCounter++;
        }
        return new HlcTimestamp(physicalTime, logicalCounter);
    }

    public synchronized HlcTimestamp updateOnReceive(HlcTimestamp msgTimestamp) {
        long physicalNow = System.currentTimeMillis();
        
        // Assert clock skew does not exceed maximum allowable drift
        if (msgTimestamp.physicalTimeMs() - physicalNow > maxOffsetMs) {
            throw new IllegalStateException("Clock drift exceeded maxOffsetMs: " + (msgTimestamp.physicalTimeMs() - physicalNow));
        }

        if (physicalNow > physicalTime && physicalNow > msgTimestamp.physicalTimeMs()) {
            physicalTime = physicalNow;
            logicalCounter = 0;
        } else if (msgTimestamp.physicalTimeMs() == physicalTime) {
            logicalCounter = Math.max(logicalCounter, msgTimestamp.logicalCounter()) + 1;
        } else if (msgTimestamp.physicalTimeMs() > physicalTime) {
            physicalTime = msgTimestamp.physicalTimeMs();
            logicalCounter = msgTimestamp.logicalCounter() + 1;
        } else {
            logicalCounter++;
        }
        return new HlcTimestamp(physicalTime, logicalCounter);
    }
}`
  },
  {
    id: 'spanner-truetime-external-consistency',
    name: 'Google Cloud Spanner External Consistency TrueTime Snapshot Reads',
    category: 'Global Distributed Consensus MVCC',
    badge: 'Spanner TrueTime Engine',
    readLatencySla: '0.95 ms P99',
    writeThroughputSla: '52,000 TPS',
    isolationGuarantee: 'External Consistency (Linearizability) & Lock-Free Global Reads',
    algorithmFormula: 'TrueTime.now() = [t_earliest, t_latest] with Commit-Wait: wait until TrueTime.now().earliest > s',
    blastRadiusContainment: 'Commit-wait bounds external causality globally, allowing multi-datacenter snapshot reads with 0 locks.',
    architecturalInvariant: 'If transaction T2 starts after T1 commits, T2 commit timestamp s2 > s1 is mathematically guaranteed.',
    description: 'Google Cloud Spanner achieves external consistency (linearizability) across global datacenters using TrueTime, a synchronized time API backed by atomic rubidium clocks and GPS receivers with bounded clock uncertainty epsilon (typically 1 to 7ms). By enforcing the TrueTime Commit-Wait rule, the write coordinator assigns a commit timestamp s >= t_latest and delays the client acknowledgment until TrueTime.now().earliest > s. Consequently, read-only transactions can execute at any historical timestamp without locks, across all shards and continents, yielding consistent snapshot queries with sub-millisecond local latency.',
    workflowPhases: [
      {
        name: 'TrueTime API Uncertainty Sampling',
        description: 'The transaction coordinator invokes TrueTime.now(), receiving a time interval [earliest, latest] where the absolute real time t_abs is guaranteed to reside. Uncertainty epsilon equals (latest - earliest) / 2.',
        invariants: 'Clock drift strictly bounded by atomic and GPS quorum hardware; master daemon syncs every 1000ms.'
      },
      {
        name: 'Monotonic Commit Timestamp Assignment',
        description: 'The coordinator assigns commit timestamp s = max(TrueTime.now().latest, highest_prior_timestamp + 1). The assigned timestamp is strictly greater than all past transaction timestamps.',
        invariants: 'Commit timestamp s is guaranteed to be in the future relative to the transaction start time.'
      },
      {
        name: 'Two-Epsilon Commit-Wait Enforcement',
        description: 'Before releasing write locks or acknowledging success to the client, the coordinator sleeps until TrueTime.now().earliest > s. This ensures that the commit timestamp s has passed in absolute real time everywhere on Earth.',
        invariants: 'Commit-wait duration averages 2 to 6 milliseconds; guarantees global causal order without inter-DC locks.'
      },
      {
        name: 'Lock-Free Stale & Snapshot Read Serving',
        description: 'Any reader can request a snapshot read at timestamp T_read <= s. Multi-Paxos replicas evaluate their local safe time; if replica.safe_time >= T_read, it serves the query locally without cross-region RPCs.',
        invariants: '100% lock-free reads; zero coordinator communication; sub-millisecond read latency.'
      }
    ],
    productionOutcomes: {
      'Read Lock Overhead': '0.00% (Pure non-blocking Paxos reads)',
      'Uncertainty Bound (epsilon)': '1.8 ms average clock error',
      'Commit-Wait Delay': '3.6 ms average wait before ACK',
      'Global Read Latency': '0.95 ms from local read replicas'
    },
    specCode: `// Google Spanner TrueTime & Commit-Wait Specification
public final class TrueTimeCommitCoordinator {
    
    public record TimeInterval(long earliestMs, long latestMs) {
        public long uncertaintyMs() {
            return (latestMs - earliestMs) / 2;
        }
    }

    public interface TrueTimeProvider {
        TimeInterval now();
    }

    private final TrueTimeProvider trueTime;

    public TrueTimeCommitCoordinator(TrueTimeProvider trueTime) {
        this.trueTime = trueTime;
    }

    public long commitTransaction(long lastAssignedTimestamp) throws InterruptedException {
        // Step 1: Query TrueTime uncertainty interval
        TimeInterval interval = trueTime.now();

        // Step 2: Assign commit timestamp s >= latest
        long s = Math.max(interval.latestMs(), lastAssignedTimestamp + 1);

        // Step 3: Enforce Commit-Wait: sleep until TrueTime.now().earliest > s
        while (true) {
            TimeInterval current = trueTime.now();
            if (current.earliestMs() > s) {
                break; // Commit-wait satisfied! Absolute real time has passed s.
            }
            long sleepDuration = Math.max(1, s - current.earliestMs());
            Thread.sleep(sleepDuration);
        }

        // Return committed timestamp s to caller
        return s;
    }
}`
  },
  {
    id: 'git-temporal-time-travel-tables',
    name: 'Git-Like Copy-on-Write Branchable Table States & Time-Travel Scrubber',
    category: 'Persistent Temporal Storage Engine',
    badge: 'Copy-on-Write Tree Engine',
    readLatencySla: '1.20 ms P99',
    writeThroughputSla: '42,000 TPS',
    isolationGuarantee: 'Immutable Historical Time-Travel & Instant Zero-Copy Branching',
    algorithmFormula: 'Root_t+1 = PathCopy(Root_t, ModifiedNodes) with Shared Immutable Leaves',
    blastRadiusContainment: 'Branching is O(1) pointer replication; historical states are immutable and physically protected.',
    architecturalInvariant: 'Historical versions retain byte-for-byte immutability; AS OF queries require zero reconstruction rollback.',
    description: 'Modern analytical and hybrid databases (e.g. Apache Iceberg, Delta Lake, Dolt) employ functional, persistent copy-on-write B-trees and append-only parquet manifests to offer Git-like database capabilities. Modifying a row does not overwrite existing data; instead, it writes a new leaf node and path-copies ancestors up to a new root pointer, sharing identical unchanged subtrees with historical versions. This enables instant zero-copy schema branching for staging environments, audit compliance, and sub-2ms AS OF SYSTEM TIME time-travel queries across historical horizons.',
    workflowPhases: [
      {
        name: 'Immutable Path-Copying & Functional Tree Advancement',
        description: 'When mutating records, the storage engine copies only the path from the root down to the modified leaf node. Unmodified branches are referenced by pointer without duplicating data.',
        invariants: 'Write amplification bounded by O(log N); identical leaves shared across thousands of commit generations.'
      },
      {
        name: 'Atomic Generation Root Pointer Swap',
        description: 'A new table generation root pointer is written atomically via CAS to the metadata catalog. Previous roots remain immutable and queryable at their respective commit hashes or timestamps.',
        invariants: 'Sub-millisecond commit latency; zero exclusive table-level locks held during writes.'
      },
      {
        name: 'AS OF SYSTEM TIME Time-Travel Resolution',
        description: 'Queries specifying AS OF SYSTEM TIME or commit ID perform a binary search on the catalog commit index, acquire the historical root pointer, and traverse the historical tree directly.',
        invariants: 'Instantaneous historical queries without replay logs or undo segments; zero CPU reconstruction penalty.'
      },
      {
        name: 'Zero-Copy Virtual Schema Branching',
        description: 'Developers or CI/CD pipelines can branch a 50-Terabyte database in sub-100ms by creating a named reference pointing to the existing root hash, allowing isolated chaos testing without physical duplication.',
        invariants: 'Storage overhead for a new branch is exactly zero bytes until branch mutations occur.'
      }
    ],
    productionOutcomes: {
      'Branch Creation Latency': '48 ms (Zero-copy root reference)',
      'Time-Travel Query SLA': '1.20 ms P99 AS OF lookups',
      'Historical Tree Sharing': '94.2% shared immutable blocks',
      'Rollback Latency': 'Sub-10 ms pointer reset'
    },
    specCode: `// Git-Like Copy-on-Write Table Engine Specification
public final class CopyOnWriteTableEngine<K extends Comparable<K>, V> {
    
    public record Node<K, V>(K key, V value, Node<K, V> left, Node<K, V> right) {}

    public record TableCommit<K, V>(
        String commitId,
        long timestampMs,
        Node<K, V> rootNode,
        String parentCommitId
    ) {}

    private final java.util.concurrent.ConcurrentNavigableMap<Long, TableCommit<K, V>> commitHistory = 
        new java.util.concurrent.ConcurrentSkipListMap<>();

    public Node<K, V> insert(Node<K, V> node, K key, V value) {
        if (node == null) {
            return new Node<>(key, value, null, null);
        }
        int cmp = key.compareTo(node.key());
        if (cmp < 0) {
            // Path-copy: allocate new parent node, re-use unmodified right subtree
            return new Node<>(node.key(), node.value(), insert(node.left(), key, value), node.right());
        } else if (cmp > 0) {
            // Path-copy: allocate new parent node, re-use unmodified left subtree
            return new Node<>(node.key(), node.value(), node.left(), insert(node.right(), key, value));
        } else {
            // Key update: new node with updated value, retaining children
            return new Node<>(key, value, node.left(), node.right());
        }
    }

    public V queryAsOfTime(long targetTimestampMs, K key) {
        java.util.Map.Entry<Long, TableCommit<K, V>> entry = commitHistory.floorEntry(targetTimestampMs);
        if (entry == null) return null;
        return search(entry.getValue().rootNode(), key);
    }

    private V search(Node<K, V> node, K key) {
        if (node == null) return null;
        int cmp = key.compareTo(node.key());
        if (cmp < 0) return search(node.left(), key);
        if (cmp > 0) return search(node.right(), key);
        return node.value();
    }
}`
  },
  {
    id: 'epoch-horizon-lockfree-gc',
    name: 'Lock-Free Epoch-Based Garbage Collection & VACUUM Freezing Engine',
    category: 'Storage Reclamation & Engine Hygiene',
    badge: 'Lock-Free Epoch GC',
    readLatencySla: '0.35 ms P99',
    writeThroughputSla: '55,000 TPS',
    isolationGuarantee: 'Lock-Free Dead Tuple Reclamation & Zero Query Stall',
    algorithmFormula: 'Horizon = min_{T in Active}(T.snapshotXmin) -> Reclaim tuples where xmax < Horizon',
    blastRadiusContainment: 'Background VACUUM runs cooperatively with worker thread yield limits to prevent I/O starvation.',
    architecturalInvariant: 'Tuples with xmax < Horizon are dead to all future transactions and can be safely reclaimed in-place.',
    description: 'In an append-only MVCC database, frequent UPDATE and DELETE operations generate dead tuple versions that degrade cache locality and bloat disk storage. Lock-Free Epoch-Based Garbage Collection tracks active reader snapshots via a monotonic global horizon. Any tuple version whose xmax is older than the oldest active transaction snapshot is provably invisible to all current and future queries. The background VACUUM engine reclaims dead line pointers, compacts fragmented pages, and freezes tuple xmins without acquiring table-level exclusive locks or interrupting active OLTP workflows.',
    workflowPhases: [
      {
        name: 'Global Epoch Horizon Calculation',
        description: 'The background cleaner queries the transaction manager to compute OldestXmin = min(active_snapshots.xmin). All tuples with xmax < OldestXmin are guaranteed unreferenced.',
        invariants: 'Horizon lookup executes in sub-2 microseconds; zero transaction blocking.'
      },
      {
        name: 'In-Page Line Pointer Defragmentation',
        description: 'The engine inspects page ItemId arrays, marks dead line pointers as LP_DEAD, and shifts remaining live tuple payloads to defragment contiguous free space within the 8KB page.',
        invariants: 'Page reorganization completes with lightweight buffer pin; zero table locks.'
      },
      {
        name: 'Secondary Index Leaf Pruning',
        description: 'VACUUM sweeps B-Tree index pages corresponding to dead heap tuples, removing dead index keys and posting space reclamation vouchers into the Free Space Map (FSM).',
        invariants: 'Index pages pruned concurrently with active index scans using read-intent latches.'
      },
      {
        name: 'Vacuum Cost-Based Delay & I/O Throttling',
        description: 'The vacuum worker accumulates cost counters (vacuum_cost_page_hit, vacuum_cost_page_miss, vacuum_cost_page_dirty). When reaching the cost limit, it sleeps for vacuum_cost_delay (2ms), preventing disk I/O saturation.',
        invariants: 'Application p99 query latency degradation kept below 2.5% during intense background sweeps.'
      }
    ],
    productionOutcomes: {
      'Storage Bloat Reduction': '87.5% reclaimed page footprint',
      'OLTP Throughput Impact': 'Sub-1.8% during active vacuum',
      'P99 VACUUM Pause': '0.00 ms (Lock-free cooperative yield)',
      'Free Space Map Utilization': '96.2% reused line pointers'
    },
    specCode: `// Lock-Free Epoch-Based Dead Tuple Garbage Collection Specification
public final class EpochBasedVacuumEngine {
    
    public record DeadTuple(long xidCreated, long xidDeleted, int pageId, int tupleOffset) {}

    public record PageStats(int totalTuples, int liveTuples, int deadTuples, int freeSpaceBytes) {}

    public static class VacuumMetrics {
        public long deadTuplesReclaimed = 0;
        public long pagesCompacted = 0;
        public long bytesReclaimed = 0;
    }

    public static VacuumMetrics runLockFreeSweep(
        long globalHorizonXmin,
        java.util.List<DeadTuple> candidateTuples,
        int vacuumCostLimit
    ) {
        VacuumMetrics metrics = new VacuumMetrics();
        int accumulatedCost = 0;

        for (DeadTuple tuple : candidateTuples) {
            // Check if tuple is provably dead to all current and future transactions
            if (tuple.xidDeleted() > 0 && tuple.xidDeleted() < globalHorizonXmin) {
                // Safely reclaim tuple line pointer without table locks
                metrics.deadTuplesReclaimed++;
                metrics.bytesReclaimed += 128; // Average tuple payload size

                accumulatedCost += 2; // Simulated vacuum_cost_page_dirty
                if (accumulatedCost >= vacuumCostLimit) {
                    try {
                        Thread.sleep(2); // Yield CPU/disk I/O to OLTP traffic
                        accumulatedCost = 0;
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        return metrics;
    }
}`
  }
];
