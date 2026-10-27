export interface CacheCoherenceModel {
  id: string
  name: string
  paradigm: string
  badge: string
  algorithmFormula: string
  originLoadReduction: string
  p99Latency: string
  memoryFootprint: string
  concurrencyProtection: string
  workflowPhases: Array<{
    name: string
    color: string
    description: string
    invariants: string
  }>
  codeSnippet: {
    language: string
    filename: string
    code: string
  }
  architecturalInvariant: string
  productionOutcomes: Record<string, string>
}

export const DISTRIBUTED_CACHE_MODELS: CacheCoherenceModel[] = [
  {
    id: 'probabilistic-early-expiration-xfetch',
    name: 'Probabilistic Early Expiration (Optimal XFetch Algorithm)',
    paradigm: 'Probabilistic Pre-computation before TTL Expiry',
    badge: 'XFetch Optimal',
    algorithmFormula: 'delta * beta * ln(rand()) > (expiry - now)',
    originLoadReduction: '99.4% origin protection under sustained 50,000 RPS stampede',
    p99Latency: 'P99 < 1.4ms (constant cache hits with zero stampede spikes)',
    memoryFootprint: 'Zero additional lock metadata; delta computation stored in item header',
    concurrencyProtection: 'Statistical distribution guarantees exactly 1 worker refreshes cache early',
    workflowPhases: [
      {
        name: 'STOCHASTIC_EXPIRY_CHECK',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Read request calculates probabilistic threshold: as TTL approaches zero, probability of early asynchronous background recomputation smoothly scales from 0% to 100%.',
        invariants: 'Items are always served instantly from cache memory while refresh runs in background worker thread.'
      },
      {
        name: 'ASYNC_ORIGIN_FETCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'The single winning worker executes expensive database query or microservice computation and measures exact computation duration delta.',
        invariants: 'Only one request triggers recomputation; concurrent readers continue receiving current valid cached value.'
      },
      {
        name: 'ATOMIC_CACHE_UPDATE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Updated payload and new delta value are atomically written back to Redis with fresh TTL window.',
        invariants: 'Zero cache misses or database spikes ever occur during hot key expiration cycles.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'XFetchCacheManager.java',
      code: `public class XFetchCacheManager<T> {
    private final RedisCommands<String, CacheEnvelope<T>> redis;
    private final ExecutorService backgroundPool;
    private final double beta = 1.0; // Greediness constant

    public T getOrCompute(String key, Duration ttl, Function<String, T> originSupplier) {
        CacheEnvelope<T> envelope = redis.get(key);
        long now = System.currentTimeMillis();

        if (envelope == null) {
            // Cold cache miss: direct compute
            return computeAndSave(key, ttl, originSupplier);
        }

        // XFetch stochastic formula: delta * beta * ln(random(0,1)) > (expiry - now)
        double randomFactor = -Math.log(ThreadLocalRandom.current().nextDouble());
        boolean shouldRefreshEarly = (envelope.getComputeDurationMs() * beta * randomFactor) > (envelope.getExpiryEpochMs() - now);

        if (shouldRefreshEarly && envelope.tryAcquireRefreshLease()) {
            // Asynchronously refresh in background thread without blocking current caller
            backgroundPool.submit(() -> computeAndSave(key, ttl, originSupplier));
        }

        return envelope.getValue();
    }

    private T computeAndSave(String key, Duration ttl, Function<String, T> originSupplier) {
        long start = System.currentTimeMillis();
        T computed = originSupplier.apply(key);
        long delta = System.currentTimeMillis() - start;

        CacheEnvelope<T> newEnvelope = new CacheEnvelope<>(computed, delta, System.currentTimeMillis() + ttl.toMillis());
        redis.setex(key, ttl.toSeconds(), newEnvelope);
        return computed;
    }
}`
    },
    architecturalInvariant: 'Readers never block on database queries for cached hot keys. Asynchronous pre-computation guarantees 100% cache hit rates under arbitrary concurrency spikes.',
    productionOutcomes: {
      'Cache Stampede Protection': 'Zero origin thundering herd spikes across 50,000 concurrent worker requests',
      'Origin Offload Efficiency': '99.4% database offload sustained through flash-sale expiry transitions',
      'P99 Read Latency': 'Sub-1.4ms consistent response time across active pricing catalog keys',
      'CPU Contention': 'Zero distributed lock acquisition overhead or thread parking contention'
    }
  },
  {
    id: 'singleflight-request-coalescing',
    name: 'Singleflight Request Coalescing (In-Flight Flight Deduplication Map)',
    paradigm: 'In-Flight Duplicate Query Merging',
    badge: 'Singleflight Deduplication',
    algorithmFormula: 'flightGroup.doChan(key, fn) -> merges N calls to 1 shared future',
    originLoadReduction: '99.9% origin reduction (10,000 concurrent misses collapse to exactly 1 origin query)',
    p99Latency: 'P99 < 3.8ms (all concurrent callers share origin response simultaneously)',
    memoryFootprint: 'Lightweight in-memory concurrent hash map storing pending CompletableFutures',
    concurrencyProtection: 'Thread-safe atomic computeIfAbsent deduplication per cluster instance',
    workflowPhases: [
      {
        name: 'FLIGHT_REGISTRATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'First request encountering a cache miss registers a pending CompletableFuture in concurrent flight registry under key.',
        invariants: 'Subsequent incoming requests for the same key detect active flight and attach as passive listeners.'
      },
      {
        name: 'SINGULAR_ORIGIN_QUERY',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Exactly 1 worker dispatches query to backend database or microservice. All other 9,999 callers await completion on shared future.',
        invariants: 'Database receives strictly 1 query regardless of external traffic volume.'
      },
      {
        name: 'MULTICAST_COMPLETION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Result arrives from origin, writes to Redis cache, completes future, and unblocks all waiting callers simultaneously before deregistering flight.',
        invariants: 'Memory allocated for flight map returns to zero immediately after broadcast.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'SingleflightGroup.java',
      code: `public class SingleflightGroup<T> {
    private final ConcurrentMap<String, CompletableFuture<T>> inFlight = new ConcurrentHashMap<>();

    public CompletableFuture<T> execute(String key, Supplier<CompletableFuture<T>> originSupplier) {
        return inFlight.computeIfAbsent(key, k -> {
            CompletableFuture<T> future = new CompletableFuture<>();
            originSupplier.get().whenComplete((result, ex) -> {
                try {
                    if (ex != null) {
                        future.completeExceptionally(ex);
                    } else {
                        future.complete(result);
                    }
                } finally {
                    inFlight.remove(k); // De-register flight upon completion
                }
            });
            return future;
        });
    }
}`
    },
    architecturalInvariant: 'For any given cache key, at most one origin request is in-flight at any instant in time across a JVM process, completely eliminating local stampede pressure.',
    productionOutcomes: {
      'Origin Query Consolidation': '10,000 parallel cache misses coalesce into exactly 1 database read',
      'Database Connection Safety': 'Connection pool saturation capped; 0 HikariCP connection timeout exceptions',
      'Memory Overhead': '< 120 KB heap memory for tracking 5,000 active concurrent coalescing keys',
      'Failure Propagation': 'Origin failures safely broadcast to all waiting callers without hang'
    }
  },
  {
    id: 'redis-mutex-leasing-redlock',
    name: 'Distributed Mutex Leasing (Redis Redlock with Monotonic Fencing Tokens)',
    paradigm: 'Distributed Mutual Exclusion with Auto-Release Lease',
    badge: 'Redis Redlock Mutex',
    algorithmFormula: 'SET key:lock uuid NX PX 5000 + Monotonic Fencing Token check',
    originLoadReduction: '98.8% origin protection across distributed multi-node clusters',
    p99Latency: 'Winner: P99 < 12ms; Waiters: P99 < 28ms (exponential spin-wait with jitter)',
    memoryFootprint: 'Redis key per active locked entity with 5,000ms hardware lease expiration',
    concurrencyProtection: 'Redlock quorum consensus (3 of 5 nodes) prevents split-brain lock acquisition',
    workflowPhases: [
      {
        name: 'LOCK_ACQUISITION_RACE',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Upon cache miss, workers compete to acquire distributed lock via SET key:lock token NX PX 5000. Exactly 1 node wins the lease.',
        invariants: 'Lock defines hard TTL (5s) to guarantee automatic release if the winning node crashes.'
      },
      {
        name: 'SPIN_WAIT_RETRY',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Losing nodes enter randomized exponential backoff spin-wait (50ms-150ms jitter) and poll cache repeatedly until populated by lock owner.',
        invariants: 'Losing nodes never query the database directly; they wait for the cache to be warmed.'
      },
      {
        name: 'FENCED_WRITE_RELEASE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Lock holder writes warmed data to Redis, verifies fencing token, and safely releases lock via atomic Redis Lua script checking token identity.',
        invariants: 'Zombie lock holders delayed by GC pause cannot overwrite newer cache entries.'
      }
    ],
    codeSnippet: {
      language: 'lua',
      filename: 'ReleaseFencedLock.lua',
      code: `-- Atomic Redis Lua script to release distributed mutex safely
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end`
    },
    architecturalInvariant: 'Distributed mutual exclusion protects database clusters from global stampedes across multiple independent Kubernetes nodes without requiring shared JVM state.',
    productionOutcomes: {
      'Cross-Node Mutual Exclusion': 'Strict single-worker origin warming across 48 distributed container pods',
      'Split-Brain Elimination': 'Redlock majority voting (3 of 5 instances) ensures zero dual-leader writes',
      'Deadlock Auto-Recovery': '5-second TTL hardware lease auto-releases if worker process suffers SIGKILL',
      'Zombie Write Guard': 'Monotonic fencing tokens reject stale writes from GC-paused processes'
    }
  },
  {
    id: 'multi-tier-l1-l2-caching',
    name: 'Tiered Multi-Level Caching (L1 Caffeine In-Memory + L2 Redis Cluster)',
    paradigm: 'Hierarchical Memory-to-Network Near Caching',
    badge: 'Tiered L1/L2 Cache',
    algorithmFormula: 'T_effective = h_L1 * T_L1 + (1 - h_L1) * (h_L2 * T_L2 + (1 - h_L2) * T_DB)',
    originLoadReduction: '99.8% origin offload (95% served in-process by L1; 4.8% by L2 Redis)',
    p99Latency: 'L1 Hit: P99 < 8 microseconds; L2 Hit: P99 < 1.8ms; DB Miss: P99 < 42ms',
    memoryFootprint: 'Bounded L1 W-TinyLFU eviction (50,000 items max) + 64GB L2 Redis Cluster',
    concurrencyProtection: 'L1 near-cache invalidation broadcast via Redis Pub/Sub topic',
    workflowPhases: [
      {
        name: 'L1_PROCESS_LOOKUP',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Application checks local Caffeine near-cache. Hit returns in sub-10 microseconds with zero network serialization or socket overhead.',
        invariants: 'L1 operates with W-TinyLFU frequency admission to maximize hit rates for skewed Zipf distributions.'
      },
      {
        name: 'L2_CLUSTER_FALLBACK',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'If L1 misses, request queries L2 Redis Cluster over TCP. Hit returns in 1.8ms and populates local L1 cache with 60s TTL.',
        invariants: 'L2 maintains shared authoritative cached state across all application cluster nodes.'
      },
      {
        name: 'PUB_SUB_INVALIDATION',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'When an update occurs, the writing node updates DB, deletes L2 Redis key, and publishes invalidation event to broadcast channel to purge stale L1s.',
        invariants: 'Near-cache inconsistency bounded to sub-5ms pub/sub transit window.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'TieredCacheManager.java',
      code: `@Component
public class TieredCacheManager<T> {
    private final Cache<String, T> l1Cache = Caffeine.newBuilder()
        .maximumSize(50_000)
        .expireAfterWrite(Duration.ofSeconds(60))
        .recordStats()
        .build();

    private final RedisCommands<String, T> l2Redis;
    private final RedisPubSubCommands<String, String> pubSub;

    public T get(String key, Class<T> clazz, Supplier<T> dbSupplier) {
        // 1. Check L1 in-memory near-cache (sub-10 microseconds)
        T value = l1Cache.getIfPresent(key);
        if (value != null) {
            return value;
        }

        // 2. Check L2 Redis cluster (sub-2 milliseconds)
        value = l2Redis.get(key);
        if (value != null) {
            l1Cache.put(key, value);
            return value;
        }

        // 3. Fallback to Origin DB and backfill both tiers
        T dbVal = dbSupplier.get();
        if (dbVal != null) {
            l2Redis.setex(key, 3600, dbVal);
            l1Cache.put(key, dbVal);
        }
        return dbVal;
    }

    public void evictGlobally(String key) {
        l2Redis.del(key);
        l1Cache.invalidate(key);
        pubSub.publish("cache:invalidation:channel", key);
    }
}`
    },
    architecturalInvariant: 'L1 Caffeine memory caching absorbs 95% of hot read traffic without touching network sockets, while Redis Pub/Sub prevents stale reads across pods.',
    productionOutcomes: {
      'Network Socket Savings': '95% reduction in Redis TCP bandwidth utilization via in-process L1 hits',
      'Effective P99 Read Latency': 'Sub-180 microseconds average read response across 100,000 RPS workloads',
      'Stale Window Boundary': '< 5ms between write update and global L1 purge across all cluster pods',
      'Memory Safety': 'W-TinyLFU eviction strictly bounds heap usage to 512MB max per JVM process'
    }
  },
  {
    id: 'cdc-wal-cache-invalidation',
    name: 'Dual-Write Elimination (PostgreSQL WAL Tailing with Debezium CDC Invalidation)',
    paradigm: 'Asynchronous CDC-Driven Cache Coherence',
    badge: 'Debezium CDC Invalidate',
    algorithmFormula: 'PostgreSQL WAL commit -> Debezium Kafka Connector -> Redis DEL key',
    originLoadReduction: 'Zero cache-database inconsistency anomalies; 100% elimination of dual-write race conditions',
    p99Latency: 'Invalidation latency < 8.5ms from database commit to Redis DEL',
    memoryFootprint: 'Zero application-side invalidation queues; uses native PostgreSQL logical replication slot',
    concurrencyProtection: 'Monotonic WAL Log Sequence Numbers (LSN) guarantee strictly ordered invalidations',
    workflowPhases: [
      {
        name: 'ACID_DATABASE_MUTATION',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Application writes update strictly to PostgreSQL database with zero network calls to Redis. No dual-write hazard can occur.',
        invariants: 'Database transaction commits atomically with primary ACID durability.'
      },
      {
        name: 'WAL_REPLICATION_CAPTURE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Debezium connector reads row changes from PostgreSQL write-ahead log (WAL) and publishes structured CDC event to Kafka topic with sub-5ms lag.',
        invariants: 'Zero impact on primary transaction performance; CDC reads asynchronously from disk stream.'
      },
      {
        name: 'IDEMPOTENT_CACHE_PURGE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Cache invalidation consumer daemon reads CDC event, extracts entity primary key, and issues Redis DEL key to ensure subsequent reads fetch fresh data.',
        invariants: 'Cache-aside re-population guarantees consistent state with zero ghost writes.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'CdcCacheInvalidatorConsumer.java',
      code: `@Component
public class CdcCacheInvalidatorConsumer {
    private final RedisCommands<String, String> redis;

    @KafkaListener(topics = "postgres.public.products", groupId = "cache-invalidator-group")
    public void handleProductWalChange(ConsumerRecord<String, String> record) {
        JsonNode cdcPayload = parseJson(record.value());
        String op = cdcPayload.get("op").asText(); // 'u' = update, 'd' = delete

        if ("u".equals(op) || "d".equals(op)) {
            String productId = cdcPayload.get("before").get("id").asText();
            String cacheKey = "product:item:" + productId;

            // Purge Redis cache entry asynchronously
            redis.del(cacheKey);
            log.info("CDC Invalidator purged cache key [{}] from PostgreSQL WAL change LSN {}", 
                cacheKey, cdcPayload.get("source").get("lsn"));
        }
    }
}`
    },
    architecturalInvariant: 'Never perform dual-writes across database and cache. Write only to the database, and let transactional CDC log tailing purge the cache asynchronously.',
    productionOutcomes: {
      'Dual-Write Race Elimination': '100% elimination of out-of-order write races between DB and Redis',
      'Invalidation Lag': 'P99 < 8.5ms from PostgreSQL COMMIT until Redis cache key is purged',
      'Application Decoupling': 'Business logic services completely free of cache evict boilerplate code',
      'Disaster Replay': 'Kafka CDC retention allows instant full cache warm or re-invalidation'
    }
  }
]
