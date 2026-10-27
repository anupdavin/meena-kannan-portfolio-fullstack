export interface IdempotencyRecord {
  id: string
  idempotencyKey: string
  status: 'RESERVED_IN_FLIGHT' | 'COMMITTED_COMPLETED' | 'CONFLICT_REJECTED' | 'EXPIRED_EVICTED'
  fencingToken: number
  requestMethod: string
  endpoint: string
  requestSha256: string
  cachedResponseCode: number
  cachedResponseBody: Record<string, string | number | boolean>
  ttlSecondsRemaining: number
  createdAt: string
}

export interface IdempotencyModel {
  id: string
  name: string
  paradigm: string
  badge: string
  algorithmFormula: string
  dedupLatency: string
  doubleExecutionDefense: string
  storageModel: string
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

export const IDEMPOTENCY_MODELS: IdempotencyModel[] = [
  {
    id: 'redis-redlock-fencing-tokens',
    name: 'Redis Redlock Distributed Locking with Monotonic Fencing Tokens',
    paradigm: 'Quorum Lease Allocation with Monotonically Incrementing Token Validation',
    badge: 'Redlock Fencing',
    algorithmFormula: 'acquireLock(key, ttl=5000ms) -> token = INCR key:token -> writeDB(token) WHERE token >= db.token',
    dedupLatency: 'Sub-1.2ms distributed lock acquisition across 5 Redis nodes',
    doubleExecutionDefense: 'Monotonic fencing token strictly invalidates delayed zombie write attempts',
    storageModel: 'Redis in-memory string key with sliding TTL and atomic INCR counter',
    workflowPhases: [
      {
        name: 'QUORUM_LOCK_ACQUIRE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Client attempts lock acquisition across 5 independent Redis instances with a strict 5000ms validity window.',
        invariants: 'Lock is granted only if quorum (3 of 5 nodes) responds affirmative within 15ms clock-drift ceiling.'
      },
      {
        name: 'FENCING_TOKEN_GENERATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Redis atomically increments monotonic fencing counter, assigning an unforgeable integer token to the active lease holder.',
        invariants: 'Each subsequent lease is guaranteed a strictly higher token number ($T_{k+1} > T_k$).'
      },
      {
        name: 'DATABASE_TOKEN_VALIDATION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Database evaluates write condition: UPDATE orders SET ... WHERE order_id = :id AND fencing_token < :token.',
        invariants: 'Zombie clients awakened after prolonged GC pause are blocked; database rejects writes with stale tokens.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'RedlockFencingTokenManager.java',
      code: `public class RedlockFencingTokenManager {
    private final RedissonClient redisson;
    private final JdbcClient jdbc;

    public ExecutionResult executeIdempotent(String idempotencyKey, OrderCommand command) {
        RLock lock = redisson.getLock("lock:" + idempotencyKey);
        try {
            // Acquire lease with 5000ms timeout
            if (!lock.tryLock(500, 5000, TimeUnit.MILLISECONDS)) {
                return ExecutionResult.lockedConflict();
            }

            // Monotonic fencing token generator
            RAtomicLong tokenCounter = redisson.getAtomicLong("token:" + idempotencyKey);
            long fencingToken = tokenCounter.incrementAndGet();

            // CAS write to database guarded by token
            int rowsUpdated = jdbc.sql("""
                UPDATE orders
                SET status = :status,
                    fencing_token = :token,
                    updated_at = NOW()
                WHERE order_id = :id
                  AND fencing_token < :token
            """)
            .param("status", command.status())
            .param("token", fencingToken)
            .param("id", command.orderId())
            .update();

            if (rowsUpdated == 0) {
                throw new StaleFencingTokenException("Write rejected: newer token already committed.");
            }
            return ExecutionResult.success(fencingToken);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}`
    },
    architecturalInvariant: 'Distributed locks alone do not guarantee mutual exclusion in asynchronous networks with GC pauses. Monotonic fencing tokens checked at storage layer provide absolute linearizable write safety.',
    productionOutcomes: {
      'Double-Spend Elimination': '0.00% double billing across 2,400,000 flash sale transactions',
      'Lock Acquisition P99': '1.18ms latency across 5-node AWS ElastiCache Redis cluster',
      'Zombie Write Rejection': '100% of delayed JVM pause writes detected and rejected by database token check',
      'Lease Safety SLA': '5000ms auto-expiration prevents permanent deadlocks if client node dies'
    }
  },
  {
    id: 'sliding-window-ingress-dedup',
    name: 'IETF RFC 9110 Sliding Window Ingress Idempotency Gate',
    paradigm: 'Two-Phase Reserve-and-Commit Ingress Filter with In-Flight Mutex',
    badge: 'RFC 9110 Gate',
    algorithmFormula: 'SET key:status IN_FLIGHT NX EX 120 -> execute() -> SET key:res payload EX 86400',
    dedupLatency: 'Sub-0.8ms cached response short-circuit returning identical HTTP 201 Created',
    doubleExecutionDefense: 'Concurrent parallel requests for the same key receive HTTP 409 Conflict with Retry-After',
    storageModel: 'Tiered Redis cluster caching with 24-hour rolling TTL retention',
    workflowPhases: [
      {
        name: 'INGRESS_HEADER_VALIDATE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Envoy gateway extracts Idempotency-Key header (UUIDv4) and evaluates key syntax and presence in Redis cache.',
        invariants: 'Missing Idempotency-Key on mutating POST/PUT endpoints is rejected with HTTP 400 Bad Request.'
      },
      {
        name: 'IN_FLIGHT_RESERVATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Gateway executes atomic Redis SET NX EX 120 key status=IN_FLIGHT. If key already exists, gateway inspects state.',
        invariants: 'If status is IN_FLIGHT, concurrent duplicate request is immediately halted with HTTP 409 Conflict.'
      },
      {
        name: 'CACHED_PAYLOAD_COMMIT',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Upon business transaction completion, worker overwrites key with status=COMPLETED and serialized response body with 24h TTL.',
        invariants: 'Subsequent retries receive identical cached HTTP status, headers, and body in sub-0.8ms without hitting database.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'IdempotencyFilter.java',
      code: `@Component
public class IdempotencyFilter implements WebFilter {
    private final RedisTemplate<String, String> redis;
    private final ObjectMapper mapper;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String key = exchange.getRequest().getHeaders().getFirst("Idempotency-Key");
        if (key == null) return chain.filter(exchange);

        String redisKey = "idempotency:" + key;
        return redis.opsForValue().setIfAbsent(redisKey, "IN_FLIGHT", Duration.ofSeconds(120))
            .flatMap(isNew -> {
                if (Boolean.TRUE.equals(isNew)) {
                    // First arrival: execute pipeline and record response
                    return chain.filter(new IdempotentResponseCaptureWrapper(exchange, redisKey));
                } else {
                    // Replayed request: return cached response immediately
                    return redis.opsForValue().get(redisKey)
                        .flatMap(cached -> {
                            if ("IN_FLIGHT".equals(cached)) {
                                exchange.getResponse().setStatusCode(HttpStatus.CONFLICT);
                                exchange.getResponse().getHeaders().add("Retry-After", "2");
                                return exchange.getResponse().setComplete();
                            }
                            IdempotentResponse resp = mapper.readValue(cached, IdempotentResponse.class);
                            return writeCachedResponse(exchange, resp);
                        });
                }
            });
    }
}`
    },
    architecturalInvariant: 'Clients must receive the exact same response for retried requests with identical idempotency keys, and the business logic must execute exactly once regardless of network retries.',
    productionOutcomes: {
      'Cache Hit Fast-Path': '99.4% of duplicate mobile network retry requests served from Redis cache in sub-0.8ms',
      'Database Load Shedding': '42% reduction in transactional database write load during intermittent client connectivity',
      'Concurrent Collision Rate': '100% of concurrent race requests resolved via HTTP 409 Conflict with Retry-After',
      'RFC Compliance': 'Full compliance with IETF draft-ietf-httpapi-idempotency-key-header specification'
    }
  },
  {
    id: 'database-unique-cas-locks',
    name: 'Database Unique Constraint with Atomic Compare-and-Swap (CAS)',
    paradigm: 'ACID Transactional Deduplication Ledger with Upsert Response Caching',
    badge: 'DB Unique CAS',
    algorithmFormula: 'INSERT INTO idempotency_ledger (key, hash, status) VALUES (...) ON CONFLICT (key) DO NOTHING',
    dedupLatency: 'Sub-1.8ms execution utilizing composite B-tree index on (idempotency_key, tenant_id)',
    doubleExecutionDefense: 'PostgreSQL row-level lock and unique constraint eliminates duplicate writes with 0.00% anomaly',
    storageModel: 'PostgreSQL ACID table partitioned monthly with auto-vacuum compaction',
    workflowPhases: [
      {
        name: 'TRANSACTION_UPSERT_ATTEMPT',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Command repository wraps business mutation and idempotency record insert into a single atomic PostgreSQL ACID transaction.',
        invariants: 'Zero distributed 2PC overhead; deduplication status and business entity commit simultaneously in database WAL.'
      },
      {
        name: 'UNIQUE_COLLISION_INTERCEPT',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'If idempotency_key violates UNIQUE constraint, ON CONFLICT DO NOTHING returns 0 rows updated.',
        invariants: 'Database engine handles lock arbitration at kernel level; zero unhandled duplicate key exceptions.'
      },
      {
        name: 'SAVED_RESPONSE_READBACK',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'On conflict, query immediately reads committed response payload from idempotency_ledger and returns cached result to caller.',
        invariants: 'Business entity is not modified; total operation completes in sub-1.8ms with zero side-effects.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'PostgresIdempotentLedgerRepository.java',
      code: `public class PostgresIdempotentLedgerRepository {
    private final JdbcClient jdbc;

    @Transactional
    public TransactionResult processIdempotentOrder(String key, String payloadHash, OrderEntity order) {
        // Attempt atomic insert into idempotency ledger
        int rows = jdbc.sql("""
            INSERT INTO idempotency_ledger (idempotency_key, payload_hash, status, response_body, created_at)
            VALUES (:key, :hash, 'PROCESSING', NULL, NOW())
            ON CONFLICT (idempotency_key) DO NOTHING
        """)
        .param("key", key)
        .param("hash", payloadHash)
        .update();

        if (rows == 0) {
            // Duplicate detected: read back existing committed response
            return jdbc.sql("SELECT status, response_body FROM idempotency_ledger WHERE idempotency_key = :key")
                .param("key", key)
                .query(TransactionResult.class)
                .single();
        }

        // Fresh request: execute business logic and commit response
        orderRepository.save(order);
        jdbc.sql("UPDATE idempotency_ledger SET status = 'COMPLETED', response_body = :body WHERE idempotency_key = :key")
            .param("body", order.toJson())
            .param("key", key)
            .update();

        return TransactionResult.fresh(order);
    }
}`
    },
    architecturalInvariant: 'When Redis caches fail or expire, the database ACID unique constraint serves as the unbreakable source of truth, guaranteeing zero duplicate business mutations.',
    productionOutcomes: {
      'Duplicate Prevention': '100.00% elimination of double database mutations even under Redis cluster restart',
      'ACID Atomicity': 'Zero orphan idempotency locks; commits atomically with the business entity in same WAL frame',
      'Partition Query Speed': 'P99 read latency of 1.6ms on 100M+ row partitioned idempotency table',
      'Storage Overhead': 'Compact 128-byte index footprint per transaction with 30-day automated partition drops'
    }
  },
  {
    id: 'webhook-at-least-once-dedup',
    name: 'Webhook At-Least-Once Replay Protection & Reconciliation Ledger',
    paradigm: 'Event ID Deduplication & Idempotent Consumer State Machine',
    badge: 'Webhook Ledger',
    algorithmFormula: 'if (SELECT 1 FROM processed_webhooks WHERE event_id = $1) return HTTP 200 OK without side effects',
    dedupLatency: 'Sub-0.9ms lookup preventing duplicate credit balance increments on Stripe/PayPal retries',
    doubleExecutionDefense: '0.00% double-credit risk during aggressive third-party payment provider webhook retries',
    storageModel: 'Hot Redis set for 48h active deduplication backed by cold PostgreSQL audit trail',
    workflowPhases: [
      {
        name: 'WEBHOOK_SIGNATURE_VERIFY',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Ingress worker verifies HMAC-SHA256 signature from Stripe/Adyen header (Stripe-Signature) with timestamp drift check (<300s).',
        invariants: 'Unsigned or expired webhook requests are rejected before touching deduplication ledger.'
      },
      {
        name: 'EVENT_ID_DEDUPLICATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Worker queries hot Redis SET processed:webhooks with external event_id (e.g. evt_3N4yX8K2a).',
        invariants: 'If event_id exists in set, handler returns HTTP 200 OK immediately with body {"status":"already_processed"}.'
      },
      {
        name: 'STATE_MACHINE_TRANSITION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'If fresh, event_id added to Redis and Postgres ledger; entity state machine advances from PENDING to SETTLED.',
        invariants: 'Customer account balance credited exactly once, regardless of whether Stripe retries 15 times.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'StripeWebhookDeduplicationHandler.java',
      code: `@RestController
@RequestMapping("/webhooks/stripe")
public class StripeWebhookDeduplicationHandler {
    private final StringRedisTemplate redis;
    private final WebhookAuditRepository auditRepo;
    private final LedgerService ledgerService;

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sig) {
        Event event = Webhook.constructEvent(payload, sig, endpointSecret);
        String eventId = event.getId();

        // 48-hour deduplication window in Redis
        Boolean isNew = redis.opsForValue().setIfAbsent("webhook:evt:" + eventId, "PROCESSED", Duration.ofHours(48));
        if (Boolean.FALSE.equals(isNew)) {
            // Acknowledge duplicate cleanly so Stripe stops retrying
            return ResponseEntity.ok("Event already reconciled.");
        }

        // Process business outcome
        auditRepo.record(eventId, event.getType());
        ledgerService.creditCustomerAccount(event);
        return ResponseEntity.ok("Reconciled successfully.");
    }
}`
    },
    architecturalInvariant: 'Third-party webhooks guarantee at-least-once delivery, not exactly-once. Consumer endpoints must acknowledge duplicates with HTTP 200 OK while suppressing business duplicate side effects.',
    productionOutcomes: {
      'Duplicate Payment Credit': '0.00% double-credit anomaly over $450M processed payment volume',
      'Provider Retry Absorption': 'Absorbs up to 25 retries per webhook without customer account disruption',
      'Ingress SLA': 'Webhook acknowledgement within 18ms meeting Stripe sub-500ms webhook timeout requirement',
      'Storage Efficiency': 'Redis SET key eviction after 48 hours keeps RAM footprint under 45MB'
    }
  },
  {
    id: 'cryptographic-request-fingerprinting',
    name: 'Cryptographic Request Fingerprinting with SHA-256 Payload Hash',
    paradigm: 'Deterministic Request Canonicalization & Key-Tampering Detection',
    badge: 'SHA-256 Fingerprint',
    algorithmFormula: 'Fingerprint = SHA256(Method + \n + Path + \n + CanonicalBody); if (savedHash != hash) abort(422)',
    dedupLatency: 'Sub-35 microseconds SHA-256 hashing overhead before ingress filter evaluation',
    doubleExecutionDefense: 'Detects and rejects replayed idempotency keys attached to mutated or tampered payloads',
    storageModel: '64-character hexadecimal hash string stored within idempotency envelope metadata',
    workflowPhases: [
      {
        name: 'CANONICAL_BODY_SERIALIZE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Incoming JSON request payload normalized by sorting object keys recursively and stripping non-semantic whitespace.',
        invariants: 'Canonicalization ensures semantically identical JSON objects produce exact identical byte hashes.'
      },
      {
        name: 'SHA256_HASH_GENERATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Ingress filter computes SHA-256 digest over concatenation of HTTP Method, URI path, and canonicalized body bytes.',
        invariants: 'Hash calculation executes in sub-35 microseconds using optimized native Java 21 MessageDigest.'
      },
      {
        name: 'TAMPER_DETECTION_CHECK',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'If idempotency key already exists but incoming SHA-256 hash does not match saved hash, gateway throws HTTP 422 Unprocessable Entity.',
        invariants: 'Guarantees attackers or misconfigured clients cannot hijack existing idempotency keys for different operations.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'RequestFingerprintValidator.java',
      code: `public class RequestFingerprintValidator {
    private final MessageDigest digest = MessageDigest.getInstance("SHA-256");
    private final ObjectMapper canonicalMapper = new ObjectMapper().configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

    public String computeFingerprint(String method, String uri, Object requestBody) throws Exception {
        String canonicalJson = canonicalMapper.writeValueAsString(requestBody);
        String rawString = method + "\n" + uri + "\n" + canonicalJson;
        byte[] hash = digest.digest(rawString.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    public void validateKeyIntegrity(String key, String incomingHash, String savedHash) {
        if (!MessageDigest.isEqual(incomingHash.getBytes(), savedHash.getBytes())) {
            throw new IdempotencyKeyTamperedException(
                "Idempotency key " + key + " was previously used with a different request payload."
            );
        }
    }
}`
    },
    architecturalInvariant: 'An idempotency key is cryptographically bound to its original request payload. Reusing an existing key with altered parameters must be aggressively rejected with HTTP 422 to prevent key-squatting.',
    productionOutcomes: {
      'Key Tampering Defense': '100% of malicious or buggy key-reuse attempts intercepted with HTTP 422',
      'Hashing Overhead': 'Sub-35 microseconds added latency during ingress request filtration',
      'Canonical Precision': '0 false positives on valid identical re-submissions regardless of JSON field ordering',
      'Security Audit': 'Provides cryptographically verifiable audit trail linking idempotency keys to payload digests'
    }
  }
]

export const SEED_IDEMPOTENCY_RECORDS: IdempotencyRecord[] = [
  {
    id: 'rec-idem-001',
    idempotencyKey: 'idem-ord-884192-a1b2',
    status: 'COMMITTED_COMPLETED',
    fencingToken: 1042,
    requestMethod: 'POST',
    endpoint: '/api/v1/orders/checkout',
    requestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    cachedResponseCode: 201,
    cachedResponseBody: {
      orderId: 'ord-884192',
      status: 'CONFIRMED',
      totalUsd: 384.50,
      fencingToken: 1042,
      receiptNumber: 'REC-2026-99214'
    },
    ttlSecondsRemaining: 82400,
    createdAt: '2026-10-28T02:00:10.120Z'
  },
  {
    id: 'rec-idem-002',
    idempotencyKey: 'idem-wh-stripe-ch-3N4yX8',
    status: 'COMMITTED_COMPLETED',
    fencingToken: 1043,
    requestMethod: 'POST',
    endpoint: '/webhooks/stripe',
    requestSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    cachedResponseCode: 200,
    cachedResponseBody: {
      eventId: 'evt_3N4yX8K2a',
      reconciled: true,
      balanceCreditSgd: 14500.00
    },
    ttlSecondsRemaining: 71200,
    createdAt: '2026-10-28T02:05:22.450Z'
  },
  {
    id: 'rec-idem-003',
    idempotencyKey: 'idem-tx-lock-concur-99',
    status: 'RESERVED_IN_FLIGHT',
    fencingToken: 1044,
    requestMethod: 'PUT',
    endpoint: '/api/v1/accounts/transfer',
    requestSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    cachedResponseCode: 409,
    cachedResponseBody: {
      error: 'IDEMPOTENCY_IN_FLIGHT',
      message: 'Transaction currently executing in worker pool. Retry after 2000ms.'
    },
    ttlSecondsRemaining: 95,
    createdAt: '2026-10-28T02:12:00.890Z'
  },
  {
    id: 'rec-idem-004',
    idempotencyKey: 'idem-ord-tamper-probe',
    status: 'CONFLICT_REJECTED',
    fencingToken: 1045,
    requestMethod: 'POST',
    endpoint: '/api/v1/orders/checkout',
    requestSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    cachedResponseCode: 422,
    cachedResponseBody: {
      error: 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH',
      message: 'Idempotency-Key previously bound to different payload hash. Request rejected.'
    },
    ttlSecondsRemaining: 85900,
    createdAt: '2026-10-28T02:14:15.330Z'
  },
  {
    id: 'rec-idem-005',
    idempotencyKey: 'idem-sub-tier-upgrade',
    status: 'COMMITTED_COMPLETED',
    fencingToken: 1046,
    requestMethod: 'POST',
    endpoint: '/api/v1/subscriptions/upgrade',
    requestSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    cachedResponseCode: 200,
    cachedResponseBody: {
      subscriptionId: 'sub-ent-9982',
      newTier: 'ENTERPRISE_ARCHITECT',
      billingCycle: 'ANNUAL'
    },
    ttlSecondsRemaining: 64000,
    createdAt: '2026-10-28T02:18:40.000Z'
  },
  {
    id: 'rec-idem-006',
    idempotencyKey: 'idem-slot-expired-key',
    status: 'EXPIRED_EVICTED',
    fencingToken: 1040,
    requestMethod: 'POST',
    endpoint: '/api/v1/reports/export',
    requestSha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    cachedResponseCode: 410,
    cachedResponseBody: {
      error: 'IDEMPOTENCY_SLOT_EXPIRED',
      message: 'Idempotency slot past 24h retention window. New key required.'
    },
    ttlSecondsRemaining: 0,
    createdAt: '2026-10-27T01:00:00.000Z'
  }
]
