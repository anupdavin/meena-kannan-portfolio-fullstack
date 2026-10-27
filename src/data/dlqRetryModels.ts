export interface DlqRetryModel {
  id: string
  name: string
  paradigm: string
  badge: string
  algorithmFormula: string
  recoveryLatency: string
  poisonPillIsolation: string
  headOfLineBlockingDefense: string
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

export interface DlqQueueItem {
  id: string
  messageId: string
  topic: string
  partition: number
  offset: number
  retryCount: number
  maxRetries: number
  errorType: 'SERIALIZATION_POISON_PILL' | 'DOWNSTREAM_HTTP_503' | 'DB_DEADLOCK_TRANSIENT' | 'SCHEMA_VERSION_MISMATCH'
  errorMessage: string
  payloadSummary: string
  timestamp: string
  status: 'PENDING_RETRY' | 'QUARANTINED_DLQ' | 'REPLAYED_SUCCESS' | 'DISCARDED_TOMBSTONE'
}

export const DLQ_RETRY_MODELS: DlqRetryModel[] = [
  {
    id: 'exponential-decorrelated-jitter',
    name: 'Exponential Backoff with Decorrelated Jitter',
    paradigm: 'Non-Harmonic Algorithmic Delay Scaling',
    badge: 'Decorrelated Jitter',
    algorithmFormula: 'sleep_i = min(cap, random(base, sleep_{i-1} * 3))',
    recoveryLatency: 'Average 1.8s backoff absorption; zero synchronized client herd spikes',
    poisonPillIsolation: 'Transient network glitch absorber; fails over to DLQ after 5 attempts',
    headOfLineBlockingDefense: 'Local in-memory delayed retries; consumer yields thread without stalling commits',
    workflowPhases: [
      {
        name: 'INITIAL_FAILURE_DETECT',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'Downstream microservice or database returns transient error (HTTP 503 Service Unavailable or LockAcquisitionException).',
        invariants: 'Error classification distinguishes retryable transient failures from fatal schema poison pills.'
      },
      {
        name: 'DECORRELATED_DELAY_CALC',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Backoff timer computes delay using decorrelated jitter: sleep = min(cap, random(base, previousSleep * 3)).',
        invariants: 'Randomization completely breaks harmonic resonance across concurrent worker threads.'
      },
      {
        name: 'CONTROLLED_RETRY_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Message is re-evaluated after delay. If successful, offset advances; if threshold exhausted, dispatched to DLQ.',
        invariants: 'Maximum retry budget prevents infinite loops and memory leakage.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'DecorrelatedJitterBackoff.java',
      code: `public class DecorrelatedJitterBackoff {
    private final long baseMs;
    private final long capMs;
    private final ThreadLocalRandom random = ThreadLocalRandom.current();

    public DecorrelatedJitterBackoff(long baseMs, long capMs) {
        this.baseMs = baseMs;
        this.capMs = capMs;
    }

    // AWS Decorrelated Jitter: sleep_i = min(cap, random(base, sleep_{i-1} * 3))
    public long calculateNextSleep(long previousSleepMs) {
        long ceiling = Math.max(baseMs, previousSleepMs * 3);
        long randomized = random.nextLong(baseMs, ceiling + 1);
        return Math.min(capMs, randomized);
    }
}`
    },
    architecturalInvariant: 'Harmonic retry synchronization is strictly forbidden. Decorrelated jitter guarantees that retry attempts from concurrent clients are uniformly distributed over time.',
    productionOutcomes: {
      'Thundering Herd Reduction': '76% reduction in peak downstream connection surges during outage recovery',
      'Transient Success Rate': '98.2% of transient network timeouts resolved within 3 retry attempts',
      'CPU Thread Contention': 'Zero busy-spinning; Virtual Threads unmount cleanly during backoff delays',
      'SLA Preservation': 'Protects downstream services from being overwhelmed during brownouts'
    }
  },
  {
    id: 'staggered-retry-topics',
    name: 'Non-Blocking Staggered Retry Topics (Kafka Delay Escalation)',
    paradigm: 'Asynchronous Multi-Topic Staged Delay Pipeline',
    badge: 'Staggered Delay Topics',
    algorithmFormula: 'Topic Progression: orders.v1 -> orders.retry.10s -> orders.retry.1m -> orders.retry.5m -> orders.dlq',
    recoveryLatency: '10s, 60s, 300s graduated escalation delays without blocking partition offsets',
    poisonPillIsolation: 'Poison pill immediately redirected to next delay tier; main topic processes subsequent records in sub-2ms',
    headOfLineBlockingDefense: 'Zero Head-of-Line (HoL) blocking; partition commit advances immediately upon republish',
    workflowPhases: [
      {
        name: 'INSTANT_PARTITION_UNBLOCK',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Failed message is acknowledged on main topic after republishing envelope with retry headers to orders.retry.10s.',
        invariants: 'Main topic consumer never sleeps; high-priority traffic continues flowing at full line rate.'
      },
      {
        name: 'STAGGERED_DELAY_CONSUMPTION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Dedicated retry consumer reads from retry topic and pauses partition until message timestamp reaches target delay.',
        invariants: 'Partition pause/resume is isolated entirely to the dedicated retry consumer group.'
      },
      {
        name: 'GRADUATED_DLQ_ESCALATION',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Success on retry terminates cycle. Continued failure escalates to 1m, 5m, and finally orders.dlq.',
        invariants: 'Total retry hop count is monotonically tracked in message Kafka record headers.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'StaggeredRetryProducer.java',
      code: `public class StaggeredRetryProducer {
    private final KafkaTemplate<String, Object> kafka;

    public void routeToNextRetryTier(ConsumerRecord<String, Object> record, Exception cause) {
        int attempt = HeaderUtils.getInt(record.headers(), "x-retry-attempt", 0) + 1;
        String nextTopic = switch (attempt) {
            case 1 -> "orders.retry.10s";
            case 2 -> "orders.retry.1m";
            case 3 -> "orders.retry.5m";
            default -> "orders.dlq";
        };

        ProducerRecord<String, Object> retryRecord = new ProducerRecord<>(nextTopic, record.key(), record.value());
        retryRecord.headers().add("x-retry-attempt", ByteBuffer.allocate(4).putInt(attempt).array());
        retryRecord.headers().add("x-original-topic", record.topic().getBytes(StandardCharsets.UTF_8));
        retryRecord.headers().add("x-exception-message", cause.getMessage().getBytes(StandardCharsets.UTF_8));
        retryRecord.headers().add("x-retry-timestamp", ByteBuffer.allocate(8).putLong(System.currentTimeMillis()).array());

        kafka.send(retryRecord);
    }
}`
    },
    architecturalInvariant: 'Primary event stream partitions must never be blocked by failing records. Asynchronous dead-letter and retry routing guarantees zero head-of-line stalls.',
    productionOutcomes: {
      'Head-of-Line Blocking': '0.00% partition stall; 15,000 TPS maintained on primary stream while retries run',
      'Retry Topic Isolation': 'Failing records isolated to dedicated consumer groups with scaled resources',
      'Traceability': '100% of retry attempts tagged with original partition, offset, and exception headers',
      'Recovery Rate': '94.8% of temporary third-party outages recover in retry.1m or retry.5m tiers'
    }
  },
  {
    id: 'poison-pill-quarantine',
    name: 'Poison Pill Quarantine & Dead-Letter Parking Lot',
    paradigm: 'Instant Non-Retryable Error Isolation & Triage',
    badge: 'Quarantine Parking Lot',
    algorithmFormula: 'if (isNonRetryable(ex) || attempts >= maxAttempts) -> routeToParkingLot(msg)',
    recoveryLatency: 'Sub-4ms instantaneous routing directly to persistent quarantine table',
    poisonPillIsolation: '100% containment of unparseable JSON, Jackson Deserialization, and schema corruptions',
    headOfLineBlockingDefense: 'Zero retries attempted for fatal corruptions; bypassed immediately to parking lot',
    workflowPhases: [
      {
        name: 'FATAL_ERROR_INTERCEPTION',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'Error handler catches fatal deserialization errors, malformed cryptographic signatures, or schema version breaches.',
        invariants: 'Non-retryable errors are explicitly tagged to prevent futile retry loops.'
      },
      {
        name: 'PARKING_LOT_QUARANTINE',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Message payload, original partition coordinates, and full stack trace persisted to dlq_quarantine table.',
        invariants: 'Original raw byte payload is preserved unmodified for engineering triage.'
      },
      {
        name: 'SRE_ALERT_PAGER_DISPATCH',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'High-severity webhook fires to SRE Datadog / PagerDuty channel with payload sample and schema mismatch details.',
        invariants: 'SRE triage dashboard provides 1-click inspection, schema fix, and replay triggers.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'PoisonPillQuarantineHandler.java',
      code: `public class PoisonPillQuarantineHandler implements CommonErrorHandler {
    private final JdbcClient jdbc;
    private final MeterRegistry metrics;

    @Override
    public boolean handleOne(Exception thrownException, ConsumerRecord<?, ?> record, Consumer<?, ?> consumer, MessageListenerContainer container) {
        if (isPoisonPill(thrownException)) {
            // Quarantine instantly without burning retry attempts
            jdbc.sql("""
                INSERT INTO dlq_quarantine (id, topic, partition_id, offset_id, payload, error_class, error_msg, quarantined_at)
                VALUES (:id, :topic, :part, :off, :payload::jsonb, :errClass, :errMsg, NOW())
            """)
            .param("id", UUID.randomUUID())
            .param("topic", record.topic())
            .param("part", record.partition())
            .param("off", record.offset())
            .param("payload", String.valueOf(record.value()))
            .param("errClass", thrownException.getClass().getName())
            .param("errMsg", thrownException.getMessage())
            .update();

            metrics.counter("kafka.poison_pill.quarantined", "topic", record.topic()).increment();
            return true; // Mark as handled to advance offset
        }
        return false; // Delegate to transient retry pipeline
    }

    private boolean isPoisonPill(Throwable ex) {
        return ex instanceof JsonParseException || ex instanceof DeserializationException;
    }
}`
    },
    architecturalInvariant: 'Poison pills must never enter retry loops. Malformed or non-retryable payloads are quarantined immediately to protect system stability and error budgets.',
    productionOutcomes: {
      'Consumer Crash Loop': 'Zero consumer pod crash-loop-backoffs caused by corrupt or malformed payloads',
      'Triage Velocity': 'MTTR for schema poison-pills dropped from 4 hours to 12 minutes via quarantine UI',
      'Audit Preservation': 'Raw unparseable byte payloads preserved 100% intact for forensic security review',
      'Throughput Impact': 'Sub-1ms quarantine dispatch preserves high-speed event consumer streaming'
    }
  },
  {
    id: 'idempotent-dlq-replay-stepper',
    name: 'Idempotent Dead-Letter Message Replay with Circuit Guard',
    paradigm: 'Controlled Batched Re-Injection with Idempotency Locks',
    badge: 'Idempotent Replay',
    algorithmFormula: 'acquireRedisLease(msgId) -> reprocess(msg) -> onConflict(msgId): markProcessed()',
    recoveryLatency: 'Batch replay rate limited to 250 msgs/sec to avoid overwhelming repaired downstream',
    poisonPillIsolation: 'Circuit guard trips if replay error rate exceeds 5%, auto-pausing re-injection',
    headOfLineBlockingDefense: 'Replay occurs via dedicated sidecar worker without affecting live production ingestion',
    workflowPhases: [
      {
        name: 'CIRCUIT_HEALTH_CHECK',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Replay worker queries downstream service health endpoint and active circuit breaker state before commencing batch.',
        invariants: 'Replay is strictly prohibited if target service circuit breaker is in OPEN or degraded state.'
      },
      {
        name: 'IDEMPOTENCY_LEASE_ACQUIRE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'For each quarantined record, worker acquires Redis idempotency lease key replay:lock:{messageId}.',
        invariants: 'Guarantees zero double-execution if multiple operators trigger replay concurrently.'
      },
      {
        name: 'RATE_LIMITED_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Messages are re-injected into primary topic with token-bucket rate limiter capping throughput at 250 msgs/sec.',
        invariants: 'Target service receives smooth, controlled traffic without secondary brownout.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'IdempotentDlqReplayer.java',
      code: `public class IdempotentDlqReplayer {
    private final RedissonClient redisson;
    private final KafkaTemplate<String, Object> kafka;
    private final RateLimiter rateLimiter = RateLimiter.create(250.0); // 250 msg/s ceiling

    public ReplayResult replayMessage(DlqRecord record) {
        rateLimiter.acquire();
        String lockKey = "dlq:replay:lock:" + record.messageId();
        RLock lock = redisson.getLock(lockKey);

        try {
            if (!lock.tryLock(500, 10000, TimeUnit.MILLISECONDS)) {
                return ReplayResult.SKIPPED_CONCURRENT_REPLAY;
            }

            // Verify message has not already been successfully processed
            if (isAlreadyProcessed(record.messageId())) {
                return ReplayResult.SKIPPED_DUPLICATE;
            }

            // Re-inject into origin primary topic with replayed header
            ProducerRecord<String, Object> replayed = new ProducerRecord<>(record.topic(), record.key(), record.payload());
            replayed.headers().add("x-replayed-from-dlq", "true".getBytes(StandardCharsets.UTF_8));
            kafka.send(replayed).get(5, TimeUnit.SECONDS);

            markProcessed(record.messageId());
            return ReplayResult.SUCCESS;
        } catch (Exception ex) {
            return ReplayResult.FAILED_RETRY;
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}`
    },
    architecturalInvariant: 'DLQ replay operations must be strictly idempotent and rate-limited. Replay batches must never trigger secondary brownouts or duplicate business side effects.',
    productionOutcomes: {
      'Duplicate Execution': '0.00% double-spend or duplicate billing transactions during batch DLQ replays',
      'Downstream Protection': 'Rate-limited 250 msg/s injection maintains downstream p99 latency under 45ms',
      'Circuit Guard Safety': 'Automated replay abort within 100ms if target service error rate spikes over 5%',
      'Operational Efficiency': '1-click batch replay restores 10,000 quarantined records without engineering scripts'
    }
  },
  {
    id: 'out-of-order-dlq-reconciliation',
    name: 'Out-of-Order DLQ Event Reconciliation (Causal Watermarking)',
    paradigm: 'Causal Sequence Healing & State Rebase',
    badge: 'Causal Watermarking',
    algorithmFormula: 'Version Check: if (event.version < aggregate.version) -> applyTombstoneOrCompensation()',
    recoveryLatency: 'Sub-15ms reconciliation against aggregate current state and event store log',
    poisonPillIsolation: 'Prevents obsolete delayed events from overwriting modern entity state',
    headOfLineBlockingDefense: 'Entities continue processing subsequent live events; DLQ recovery executes state rebase',
    workflowPhases: [
      {
        name: 'CAUSAL_VERSION_EVALUATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'When replaying an event delayed in DLQ for hours, worker queries aggregate current version in event store.',
        invariants: 'Replayed events must never blindly overwrite newer versions of the entity.'
      },
      {
        name: 'SEMANTIC_RECONCILIATION_CHOICE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Algorithm evaluates: (A) If stream is still at expected version, apply directly. (B) If stream moved ahead, evaluate commutative merge.',
        invariants: 'Non-commutative events trigger compensating delta events rather than state overwrites.'
      },
      {
        name: 'COMMUTATIVE_STATE_APPLY',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Entity state is updated with causal watermark, and audit log records delayed historical reconciliation event.',
        invariants: 'Audit trail clearly records that event was applied out-of-order with original timestamp preserved.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'CausalReconciliationHandler.java',
      code: `public class CausalReconciliationHandler {
    private final EventStore eventStore;

    public ReconciliationDecision reconcile(UUID streamId, DomainEvent delayedEvent) {
        long currentVersion = eventStore.getCurrentVersion(streamId);
        long eventExpectedVersion = delayedEvent.getMetadata().getExpectedVersion();

        if (currentVersion == eventExpectedVersion) {
            // Pristine causal match: apply directly to stream
            eventStore.append(streamId, currentVersion, delayedEvent);
            return ReconciliationDecision.APPLIED_IN_ORDER;
        }

        if (currentVersion > eventExpectedVersion) {
            // Stream has progressed while event was in DLQ
            if (delayedEvent.isCommutative()) {
                // E.g. CreditRefundEvent or TagAddedEvent: rebase on latest version
                DomainEvent rebasedEvent = delayedEvent.rebaseTo(currentVersion + 1);
                eventStore.append(streamId, currentVersion, rebasedEvent);
                return ReconciliationDecision.REBASED_AND_APPLIED;
            } else {
                // Non-commutative conflict (e.g. OrderShipped vs CancelRequested)
                eventStore.appendCompensation(streamId, new ManualAuditRequiredEvent(delayedEvent));
                return ReconciliationDecision.FLAGGED_FOR_MANUAL_REVIEW;
            }
        }

        throw new IllegalStateException("Causal anomaly: stream version behind event");
    }
}`
    },
    architecturalInvariant: 'Delayed DLQ events must never corrupt entity causal consistency. Non-commutative out-of-order events are rebased or flagged for compensation.',
    productionOutcomes: {
      'State Divergence': '0.00% causal state divergence when replaying events delayed by multiple days',
      'Commutative Resolution': '88.4% of delayed events resolved automatically via CRDT commutative merge rules',
      'Audit Compliance': '100% immutable provenance preserved with both original and reconciliation timestamps',
      'Operational Safety': 'Zero accidental overwrites of customer cancellations by delayed fulfillment events'
    }
  }
]

export const SEED_DLQ_ITEMS: DlqQueueItem[] = [
  {
    id: 'dlq-item-001',
    messageId: 'msg-99214-a1',
    topic: 'orders.v1.events',
    partition: 3,
    offset: 104289,
    retryCount: 4,
    maxRetries: 4,
    errorType: 'SERIALIZATION_POISON_PILL',
    errorMessage: 'JsonParseException: Unrecognized token \'NaN\' at [Source: (byte[]) line: 1, column: 48]',
    payloadSummary: '{"orderId":"ord-99214","amount":NaN,"currency":"USD"}',
    timestamp: '2026-10-28T01:10:14.220Z',
    status: 'QUARANTINED_DLQ'
  },
  {
    id: 'dlq-item-002',
    messageId: 'msg-99215-b2',
    topic: 'orders.v1.events',
    partition: 1,
    offset: 219803,
    retryCount: 2,
    maxRetries: 4,
    errorType: 'DOWNSTREAM_HTTP_503',
    errorMessage: 'HttpServerErrorException$ServiceUnavailable: 503 Service Unavailable from payment-vault-az1',
    payloadSummary: '{"orderId":"ord-99215","amount":420.00,"cardRef":"tok_9821a"}',
    timestamp: '2026-10-28T01:12:05.110Z',
    status: 'PENDING_RETRY'
  },
  {
    id: 'dlq-item-003',
    messageId: 'msg-99216-c3',
    topic: 'payments.v1.settlement',
    partition: 7,
    offset: 89412,
    retryCount: 3,
    maxRetries: 4,
    errorType: 'DB_DEADLOCK_TRANSIENT',
    errorMessage: 'CannotAcquireLockException: ERROR: deadlock detected between process 4921 and process 4928',
    payloadSummary: '{"settlementId":"stl-8891","batchCount":250,"payoutUsd":12500.00}',
    timestamp: '2026-10-28T01:13:30.840Z',
    status: 'PENDING_RETRY'
  },
  {
    id: 'dlq-item-004',
    messageId: 'msg-99217-d4',
    topic: 'tenants.v1.audit',
    partition: 2,
    offset: 54109,
    retryCount: 4,
    maxRetries: 4,
    errorType: 'SCHEMA_VERSION_MISMATCH',
    errorMessage: 'SchemaValidationException: Field \'tenantSpiffeId\' required in schema v3 but missing in record v1',
    payloadSummary: '{"tenantId":"t-tier1-acme","action":"PERMISSION_REVOKE","actor":"admin"}',
    timestamp: '2026-10-28T01:14:48.330Z',
    status: 'QUARANTINED_DLQ'
  }
]
