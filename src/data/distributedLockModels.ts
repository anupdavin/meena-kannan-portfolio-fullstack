// Distributed Consensus-Backed Lock Manager (DLM) & Mutex Leases Models
// Production architectural specifications for Redis Redlock multi-node quorum leases,
// etcd Raft monotonic revision leases, ZooKeeper ephemeral sequential locks,
// storage-level fencing token validation, and distributed reader-writer shared locks.

export interface LockClusterNode {
  id: string;
  name: string;
  endpoint: string;
  engine: 'Redis Standalone' | 'etcd Raft Member' | 'ZooKeeper Ensemble';
  role: 'Voter' | 'Follower' | 'Leader';
  status: 'ONLINE' | 'GC_STALLED' | 'ISOLATED';
  activeLeasesCount: number;
  lastHeartbeatMs: number;
}

export interface DistributedLockModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  acquisitionLatency: string;
  leaseTtlSla: string;
  safetyGuaranteeSla: string;
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

export interface SyntheticLockRequest {
  clientId: string;
  resourceKey: string;
  requestedTtlMs: number;
  fencingToken: number;
  acquiredAt: string;
  lockStatus: 'ACQUIRED' | 'WAITING' | 'REJECTED' | 'EXPIRED';
}

export const INITIAL_LOCK_NODES: LockClusterNode[] = [
  {
    id: 'node-dlm-1',
    name: 'DLM Node 1',
    endpoint: 'redlock-01.infra.internal:6379',
    engine: 'Redis Standalone',
    role: 'Voter',
    status: 'ONLINE',
    activeLeasesCount: 142,
    lastHeartbeatMs: 2
  },
  {
    id: 'node-dlm-2',
    name: 'DLM Node 2',
    endpoint: 'redlock-02.infra.internal:6379',
    engine: 'Redis Standalone',
    role: 'Voter',
    status: 'ONLINE',
    activeLeasesCount: 142,
    lastHeartbeatMs: 3
  },
  {
    id: 'node-dlm-3',
    name: 'DLM Node 3',
    endpoint: 'redlock-03.infra.internal:6379',
    engine: 'Redis Standalone',
    role: 'Voter',
    status: 'ONLINE',
    activeLeasesCount: 142,
    lastHeartbeatMs: 2
  },
  {
    id: 'node-dlm-4',
    name: 'DLM Node 4',
    endpoint: 'redlock-04.infra.internal:6379',
    engine: 'Redis Standalone',
    role: 'Voter',
    status: 'ONLINE',
    activeLeasesCount: 142,
    lastHeartbeatMs: 4
  },
  {
    id: 'node-dlm-5',
    name: 'DLM Node 5',
    endpoint: 'redlock-05.infra.internal:6379',
    engine: 'Redis Standalone',
    role: 'Voter',
    status: 'ONLINE',
    activeLeasesCount: 142,
    lastHeartbeatMs: 3
  }
];

export const DISTRIBUTED_LOCK_MODELS: DistributedLockModel[] = [
  {
    id: 'redis-redlock-quorum-leases',
    name: 'Redis Redlock Multi-Node Quorum Leases',
    category: 'Distributed Mutual Exclusion',
    badge: 'Quorum Consensus',
    acquisitionLatency: 'sub-2.4ms (majority across 5 independent Redis nodes)',
    leaseTtlSla: 'Validity = TTL - elapsed_time - clock_drift (typically 5,000ms TTL -> 4,980ms valid)',
    safetyGuaranteeSla: 'Clock drift epsilon validation guaranteeing zero stale lease overlaps',
    algorithmFormula: 'Q = floor(N/2) + 1 = 3/5 nodes && (T_acquired - T_start) < TTL',
    blastRadiusContainment: 'Isolated node stalls or network partitions cannot form split-brain locks without majority consensus',
    architecturalInvariant: 'A lock is considered valid if and only if acquired from at least 3 of 5 independent nodes before total elapsed acquisition time exceeds lock validity threshold',
    description: 'Multi-master distributed locking algorithm proposed by Salvatore Sanfilippo (antirez). Clients obtain timestamped leases from N independent instances in parallel without master-replica replication race conditions, calculating net validity after clock drift epsilon subtraction.',
    workflowPhases: [
      {
        name: 'Parallel Acquisition Attempt',
        description: 'Client generates random 128-bit cryptographic token and dispatches SET resource_key token NX PX 5000 to all 5 Redis nodes asynchronously.',
        invariants: 'Per-node timeout bounded to 5ms-50ms preventing hanging connections on crashed instances.'
      },
      {
        name: 'Quorum Validation & Drift Epsilon',
        description: 'Client verifies it acquired the key on at least 3 of 5 nodes and total elapsed time is less than lock TTL.',
        invariants: 'Net validity window = TTL - acquisition_duration - (TTL * clock_drift_drift_rate + 2ms).'
      },
      {
        name: 'Safe Key Release with Lua CAS',
        description: 'Release executes atomic Lua script on all instances: if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end.',
        invariants: 'Ensures a client never deletes a lock held by a subsequent tenant after accidental expiration.'
      }
    ],
    productionOutcomes: {
      'Lock Acquisition P99': 'sub-2.4ms across 5-node cluster',
      'Double-Lock Rate': '0.00% under high-frequency concurrency races',
      'Fault Tolerance': '2 simultaneous node failures tolerated with zero service disruption',
      'Clean Release SLA': '100% token validation on Lua script release'
    },
    specCode: `// Spring Boot 3 / Redisson Redlock Enterprise Configuration
@Configuration
public class RedlockConfiguration {

    @Bean
    public RedissonClient redlockClient() {
        Config config = new Config();
        config.useReplicatedServers()
              .setScanInterval(2000)
              .addNodeAddress(
                  "redis://redlock-01.infra.internal:6379",
                  "redis://redlock-02.infra.internal:6379",
                  "redis://redlock-03.infra.internal:6379",
                  "redis://redlock-04.infra.internal:6379",
                  "redis://redlock-05.infra.internal:6379"
              )
              .setConnectTimeout(50)
              .setTimeout(100);
        return Redisson.create(config);
    }

    public boolean executeWithRedlock(String lockKey, long waitTimeMs, long leaseTimeMs, Runnable task) {
        RLock lock1 = client1.getLock(lockKey);
        RLock lock2 = client2.getLock(lockKey);
        RLock lock3 = client3.getLock(lockKey);
        RedissonRedLock redLock = new RedissonRedLock(lock1, lock2, lock3);
        try {
            boolean isLocked = redLock.tryLock(waitTimeMs, leaseTimeMs, TimeUnit.MILLISECONDS);
            if (isLocked) {
                task.run();
                return true;
            }
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        } finally {
            if (redLock.isHeldByCurrentThread()) {
                redLock.unlock();
            }
        }
    }
}`
  },
  {
    id: 'etcd-raft-monotonic-leases',
    name: 'etcd Raft Monotonic Revision Leases',
    category: 'Linearizable Distributed Consensus',
    badge: 'Raft Linearizable',
    acquisitionLatency: 'sub-1.8ms (Raft consensus quorum commit to WAL)',
    leaseTtlSla: 'Heartbeat keep-alive every TTL/3 (sub-500ms auto-revocation on client partition)',
    safetyGuaranteeSla: 'Raft consensus linearizable revisions guaranteeing zero split-brain locks',
    algorithmFormula: 'LinearizableRead(header.revision) + Txn(Compare(createRevision(key) == 0))',
    blastRadiusContainment: 'Raft quorum eliminates split-brain dual leaders; automatic keep-alive loss releases dead client locks',
    architecturalInvariant: 'Every key lease is associated with a monotonically increasing 64-bit Raft store revision number, guaranteeing strict linearizable mutual exclusion without clock synchronization assumptions.',
    description: 'etcd v3 distributed lock provider relying on Raft consensus state machine replication. Atomic transactions evaluate createRevision == 0 to guarantee that exactly one client claims the lease, while continuous keep-alive streaming revokes the lease if a client crashes or encounters a JVM GC pause.',
    workflowPhases: [
      {
        name: 'Lease Grant & Keep-Alive Stream',
        description: 'Client requests lease with 5-second TTL from etcd cluster and launches background gRPC KeepAlive streaming channel.',
        invariants: 'Client renews lease every TTL/3 seconds; cluster revokes lease if 3 consecutive keep-alive pings fail.'
      },
      {
        name: 'Atomic Compare-and-Swap Transaction',
        description: 'Client submits etcd Txn: If CreateRevision(key) == 0 Then Put(key, lease_id) Else Watch(key).',
        invariants: 'Only the winner with CreateRevision == 0 proceeds to execute the critical section.'
      },
      {
        name: 'Linearizable Watch Event Stream',
        description: 'Waiting clients stream Watch events on the lock key revision rather than busy-polling the cluster.',
        invariants: 'Eliminates thundering herd polling storms when a long-running lock is released.'
      }
    ],
    productionOutcomes: {
      'Linearizability Guarantee': 'Strict linearizable consistency (Jepsen verified)',
      'Lease Revocation SLA': 'sub-600ms automatic lock cleanup on client crash',
      'Watch Notification Latency': 'sub-0.8ms push notification to waiting candidates',
      'Zero Split-Brain': 'Raft leader election eliminates dual-master locks'
    },
    specCode: `// Java 21 etcd v3 Jetcd Distributed Lock Implementation
import io.etcd.jetcd.ByteSequence;
import io.etcd.jetcd.Client;
import io.etcd.jetcd.Lock;
import io.etcd.jetcd.lease.LeaseKeepAliveResponse;
import io.grpc.stub.StreamObserver;

public class EtcdDistributedLockManager {
    private final Client etcdClient;
    private final Lock lockClient;

    public EtcdDistributedLockManager(String... endpoints) {
        this.etcdClient = Client.builder().endpoints(endpoints).build();
        this.lockClient = etcdClient.getLockClient();
    }

    public void executeWithLinearizableLock(String lockName, long ttlSeconds, Runnable criticalSection) throws Exception {
        ByteSequence lockKey = ByteSequence.from(lockName, StandardCharsets.UTF_8);
        long leaseId = etcdClient.getLeaseClient().grant(ttlSeconds).get().getID();

        // Maintain automated keep-alive streaming
        etcdClient.getLeaseClient().keepAlive(leaseId, new StreamObserver<LeaseKeepAliveResponse>() {
            @Override public void onNext(LeaseKeepAliveResponse res) {}
            @Override public void onError(Throwable t) {}
            @Override public void onCompleted() {}
        });

        // Acquire lock bound to lease
        ByteSequence acquiredKey = lockClient.lock(lockKey, leaseId).get().getKey();
        try {
            criticalSection.run();
        } finally {
            lockClient.unlock(acquiredKey).get();
            etcdClient.getLeaseClient().revoke(leaseId).get();
        }
    }
}`
  },
  {
    id: 'zookeeper-ephemeral-sequential-znodes',
    name: 'ZooKeeper Ephemeral Sequential Znodes',
    category: 'FIFO Fair Queue Locks',
    badge: 'Zab Fair Queue',
    acquisitionLatency: 'sub-3.1ms (Zab consensus atomic broadcast)',
    leaseTtlSla: 'Bound to ephemeral session timeout (typically 2,000ms tick time)',
    safetyGuaranteeSla: 'Strict FIFO queue ordering with herd-effect elimination via next-lowest watch',
    algorithmFormula: 'min(sequential_znodes) -> Lock Holder; next_lower_znode -> Watch Target',
    blastRadiusContainment: 'Herd effect eliminated by watching only the preceding sequence znode rather than the root parent',
    architecturalInvariant: 'A client holds the distributed lock if and only if its ephemeral sequential znode sequence number is the smallest in the lock directory.',
    description: 'Apache Curator / ZooKeeper recipe using ephemeral sequential znodes (/locks/resource/guid-lock-0000000001). Clients watch only the preceding sequence node in the directory, completely eliminating the herd effect during high-concurrency lock release.',
    workflowPhases: [
      {
        name: 'Ephemeral Sequential Znode Creation',
        description: 'Client creates ephemeral sequential node /locks/order-101/lock- with ZooKeeper session.',
        invariants: 'ZooKeeper guarantees monotonic 32-bit counter appended to node name.'
      },
      {
        name: 'Preceding Node Watcher Attachment',
        description: 'Client fetches children of /locks/order-101; if its node is lowest, lock is acquired; otherwise client sets watcher on next-lowest node.',
        invariants: 'Exactly one client wakes up when any lock is released, eliminating $O(N)$ thundering herds.'
      },
      {
        name: 'Session Expiration Auto-Cleanup',
        description: 'If client JVM crashes or network disconnects beyond session timeout, ZooKeeper automatically deletes the ephemeral node.',
        invariants: 'Zero orphan locks left in the ensemble on ungraceful worker termination.'
      }
    ],
    productionOutcomes: {
      'Herd Effect Reduction': '100% elimination of thundering herd re-broadcasts',
      'Fairness Metric': 'Strict FIFO queue ordering of pending lock requests',
      'Session Ephemerality': 'Sub-2s automated cleanup on node disconnect',
      'Throughput Capacity': '12,000+ lock acquisitions per second on 5-node ensemble'
    },
    specCode: `// Apache Curator InterProcessMutex Java 21 Recipe
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;
import java.util.concurrent.TimeUnit;

public class ZooKeeperCuratorLockManager {
    private final CuratorFramework client;

    public ZooKeeperCuratorLockManager(CuratorFramework client) {
        this.client = client;
    }

    public boolean executeWithFairLock(String resourceId, long maxWaitMs, Runnable criticalSection) {
        String lockPath = "/enterprise/locks/" + resourceId;
        InterProcessMutex mutex = new InterProcessMutex(client, lockPath);
        try {
            boolean acquired = mutex.acquire(maxWaitMs, TimeUnit.MILLISECONDS);
            if (acquired) {
                try {
                    criticalSection.run();
                    return true;
                } finally {
                    mutex.release();
                }
            }
            return false;
        } catch (Exception e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}`
  },
  {
    id: 'monotonic-fencing-tokens',
    name: 'Monotonic Fencing Token Storage Gate',
    category: 'Storage Layer Protection',
    badge: 'Kleppmann Fencing',
    acquisitionLatency: 'sub-0.35ms (Atomic SQL generation epoch increment)',
    leaseTtlSla: 'Strict inequality: Write accepted iff write_token > storage_token_floor',
    safetyGuaranteeSla: '100% rejection of post-GC zombie writes at storage layer (HTTP 409)',
    algorithmFormula: 'UPDATE resource SET val = :val, fencing_token = :token WHERE id = :id AND fencing_token < :token',
    blastRadiusContainment: 'Late writes from zombie clients that paused during long GC cycles are rejected with HTTP 409 Conflict',
    architecturalInvariant: 'No distributed lock service can guarantee mutual exclusion across asynchronous networks without storage-level monotonic fencing token validation.',
    description: 'Martin Kleppmann fencing token theorem. Even with perfectly functioning Redis or etcd lock services, a client can experience a long JVM stop-the-world GC pause after acquiring a lock, during which the lease expires. Storage layer validation ensures zombie writes are rejected.',
    workflowPhases: [
      {
        name: 'Monotonic Token Minting',
        description: 'Lock service increments monotonic 64-bit sequence generator upon granting lock (e.g., Token 341).',
        invariants: 'Strict monotonic guarantee: Each lock grant receives strictly higher sequence number.'
      },
      {
        name: 'GC Pause & Lease Expiry Simulation',
        description: 'Client 1 pauses for 10 seconds; lock service expires lease and grants Token 342 to Client 2, who writes to storage.',
        invariants: 'Storage floor token is updated to 342.'
      },
      {
        name: 'Zombie Write Rejection at Storage Gate',
        description: 'Client 1 wakes up and attempts mutation with Token 341. Storage engine checks: 341 < 342 -> REJECT with 409 Conflict.',
        invariants: 'Zero silent data corruption or overwritten ledger transactions.'
      }
    ],
    productionOutcomes: {
      'Zombie Write Rejection Rate': '100% rejection of expired post-pause client writes',
      'Database Overhead': 'sub-0.35ms atomic integer comparison in WHERE clause',
      'Data Corruption Prevention': 'Zero lost updates or corrupted inventory balances',
      'Audit Traceability': 'Every mutation logs the authoring fencing token'
    },
    specCode: `// PostgreSQL Atomic Fencing Token Storage Invariant Check
@Repository
public class ProtectedStorageRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean writeWithFencingToken(String resourceId, String payload, long fencingToken) {
        String sql = """
            UPDATE bank_accounts
            SET balance_cents = balance_cents + ?,
                last_fencing_token = ?,
                updated_at = NOW()
            WHERE account_id = ?
              AND last_fencing_token < ?
            """;

        int rowsUpdated = jdbcTemplate.update(
            sql,
            Long.parseLong(payload),
            fencingToken,
            resourceId,
            fencingToken
        );

        if (rowsUpdated == 0) {
            throw new FencingTokenStaleException(
                "Write rejected: fencing token " + fencingToken +
                " is stale or superseded by concurrent leader."
            );
        }
        return true;
    }
}`
  },
  {
    id: 'distributed-rw-shared-leases',
    name: 'Distributed Reader-Writer Shared Leases',
    category: 'High-Concurrency Shared Leases',
    badge: 'Write-Preference RW',
    acquisitionLatency: 'sub-1.1ms for concurrent readers; sub-2.8ms for exclusive writers',
    leaseTtlSla: 'Shared Read: multi-lease concurrency (up to 500 readers); Exclusive Write: single tenant lease',
    safetyGuaranteeSla: 'Write-preference starvation prevention with concurrent shared read leases',
    algorithmFormula: 'Readers: ReadCount++ iff WritersWaiting == 0 && WriteHeld == false',
    blastRadiusContainment: 'Write-preference queue prevents continuous reader traffic from starving critical mutation writes',
    architecturalInvariant: 'Multiple concurrent readers may hold shared leases simultaneously, but an exclusive writer blocks all new readers and acquires sole access once active readers finish.',
    description: 'Distributed implementation of the classical Reader-Writer lock with write-preference semantics. Enables 500+ parallel microservices to read cached database projections concurrently while allowing atomic schema or ledger updates to claim exclusive priority without write starvation.',
    workflowPhases: [
      {
        name: 'Shared Read Lease Acquisition',
        description: 'Reader microservice inspects writer_waiting flag; if false, it atomically increments reader_counter in Redis hash.',
        invariants: 'Readers share access without mutual blocking; reads scale horizontally.'
      },
      {
        name: 'Write-Preference Queue Staging',
        description: 'Writer flags writer_waiting = true; incoming reader requests are paused in lightweight queue.',
        invariants: 'Guarantees writer cannot be starved by an endless stream of incoming readers.'
      },
      {
        name: 'Exclusive Drain & Write Lease Grant',
        description: 'Once existing active readers drain to zero, writer acquires exclusive lock and executes state transition.',
        invariants: 'Strict mutual exclusion during writer execution.'
      }
    ],
    productionOutcomes: {
      'Read Throughput': '45,000+ shared reads/sec without lock contention',
      'Write Starvation Rate': '0.0% with write-preference priority queuing',
      'Lock Upgrade SLA': 'sub-3.5ms average writer queue drain latency',
      'Resource Utilization': '98% cache read efficiency without serial blocking'
    },
    specCode: `// Redis Lua Script for Write-Preference Reader-Writer Lock
local resource = KEYS[1]
local mode = ARGV[1]     -- "READ" or "WRITE"
local clientId = ARGV[2]
local ttl = tonumber(ARGV[3])

local writeKey = resource .. ":write"
local readersKey = resource .. ":readers"
local writerWaitingKey = resource .. ":writer_waiting"

if mode == "READ" then
    -- Check if writer is active or waiting
    if redis.call("EXISTS", writeKey) == 1 or redis.call("EXISTS", writerWaitingKey) == 1 then
        return 0 -- Rejected / Must wait
    end
    redis.call("HINCRBY", readersKey, clientId, 1)
    redis.call("EXPIRE", readersKey, ttl)
    return 1 -- Shared Read Lock Granted
elseif mode == "WRITE" then
    -- Signal intent to write (blocks new readers)
    redis.call("SET", writerWaitingKey, clientId, "PX", ttl)
    -- Check if readers are currently active
    local activeReaders = redis.call("HLEN", readersKey)
    if activeReaders > 0 or redis.call("EXISTS", writeKey) == 1 then
        return 2 -- Queued / Waiting for readers to drain
    end
    -- Exclusive Write Lock Granted
    redis.call("DEL", writerWaitingKey)
    redis.call("SET", writeKey, clientId, "PX", ttl)
    return 3
end`
  }
];

export const DISTRIBUTED_LOCK_PARADIGMS = DISTRIBUTED_LOCK_MODELS;
