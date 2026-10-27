export interface EventStreamRecord {
  id: string
  streamId: string
  sequence: number
  eventType: string
  timestamp: string
  payload: Record<string, string | number | boolean>
  metadata: {
    correlationId: string
    causationId: string
    actor: string
    schemaVersion: number
  }
}

export interface EventSourcingModel {
  id: string
  name: string
  paradigm: string
  badge: string
  algorithmFormula: string
  replayEfficiency: string
  storageEfficiency: string
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

export const EVENT_SOURCING_MODELS: EventSourcingModel[] = [
  {
    id: 'append-only-event-store',
    name: 'Append-Only Event Store (UUIDv7 Streams & Optimistic Concurrency Control)',
    paradigm: 'Immutable Append-Only Log with Monotonic Version Guarding',
    badge: 'Append-Only Stream',
    algorithmFormula: 'INSERT INTO event_store (stream_id, version, payload) VALUES ($1, $2, $3) WHERE version = current_version + 1',
    replayEfficiency: 'Sub-180ms cold replay for 1,000 raw events; linear O(N) event folding',
    storageEfficiency: 'Zstandard compressed JSONB payloads with UUIDv7 monotonic chronological indexing',
    concurrencyProtection: 'Optimistic locking on aggregate version prevents parallel write collisions (OCC 409 Conflict)',
    workflowPhases: [
      {
        name: 'STREAM_ACQUISITION',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Aggregate root receives inbound command and evaluates business invariants against current in-memory aggregate state.',
        invariants: 'Commands are strictly rejected if business preconditions fail before writing to event store.'
      },
      {
        name: 'OCC_VERSION_VALIDATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'New domain events are appended to the stream with expected aggregate version check (version = current + 1).',
        invariants: 'Concurrent append collision immediately aborts transaction with VersionConflictException without corrupting log.'
      },
      {
        name: 'EVENT_BUS_PUBLICATION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Committed events are streamed via PostgreSQL Transactional Outbox Debezium CDC to Kafka partition key stream_id.',
        invariants: 'Zero dual-write distributed transaction anomalies between database commit and Kafka bus.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'PostgresEventStoreRepository.java',
      code: `public class PostgresEventStoreRepository implements EventStore {
    private final JdbcClient jdbc;
    private final ObjectMapper mapper;

    @Transactional
    public void appendEvents(UUID streamId, long expectedVersion, List<DomainEvent> events) {
        long currentVersion = getCurrentVersion(streamId);
        if (currentVersion != expectedVersion) {
            throw new OptimisticConcurrencyException(
                "Stream " + streamId + " conflict. Expected " + expectedVersion + " but found " + currentVersion
            );
        }

        long nextVersion = currentVersion;
        for (DomainEvent event : events) {
            nextVersion++;
            jdbc.sql("""
                INSERT INTO event_store (event_id, stream_id, version, event_type, payload, metadata, created_at)
                VALUES (:eventId, :streamId, :version, :type, :payload::jsonb, :meta::jsonb, NOW())
            """)
            .param("eventId", UuidCreator.getTimeOrderedEpoch()) // UUIDv7
            .param("streamId", streamId)
            .param("version", nextVersion)
            .param("type", event.getClass().getSimpleName())
            .param("payload", mapper.writeValueAsString(event))
            .param("meta", mapper.writeValueAsString(event.getMetadata()))
            .update();
        }
    }
}`
    },
    architecturalInvariant: 'The event store is strictly append-only. Zero UPDATE or DELETE mutations are ever executed against the historical log table, guaranteeing complete cryptographic auditability.',
    productionOutcomes: {
      'Audit Compliance': '100% immutable event provenance conforming to SOC2 and PCI-DSS immutable ledger rules',
      'Collision Rate': '0.00% silent write loss; all concurrent write races resolved by OCC version checks',
      'Write Throughput': '14,500 event appends per second sustained on PostgreSQL Aurora read-write instance',
      'Storage Growth': '68% compression ratio via Zstandard JSONB dictionary compression'
    }
  },
  {
    id: 'point-in-time-replay',
    name: 'Point-in-Time State Reconstruction (Deterministic Event Folding)',
    paradigm: 'Temporal State Materialization & Audit Replay',
    badge: 'Deterministic Replay',
    algorithmFormula: 'State_t = foldl(applyEvent, InitialState, Events[0..t])',
    replayEfficiency: 'Sub-22ms state restoration up to target timestamp or sequence number',
    storageEfficiency: 'Zero redundant intermediate state storage; pure mathematical functional fold',
    concurrencyProtection: 'Pure deterministic state transition functions guarantee 100% reproducible aggregate state',
    workflowPhases: [
      {
        name: 'STREAM_DISPATCH',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Event store queries historical events for aggregate root filtered by streamId where sequence <= targetSequence.',
        invariants: 'Historical queries use covering index (stream_id, version ASC) for sequential disk read efficiency.'
      },
      {
        name: 'EVENT_FOLDING',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Aggregate sequentially applies each event to private state through pure transition methods with zero side effects.',
        invariants: 'State transition handlers must be strictly idempotent and free of IO, system clock, or random calls.'
      },
      {
        name: 'TEMPORAL_AUDIT_VERIFY',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Reconstructed state represents exact mathematical state of entity at that precise historical microsecond.',
        invariants: 'Auditors and SREs can inspect any historical entity state without maintaining point-in-time backups.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'OrderAggregate.java',
      code: `public class OrderAggregate {
    private UUID orderId;
    private OrderStatus status = OrderStatus.INITIAL;
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private final List<OrderItem> items = new ArrayList<>();
    private long version = 0L;

    // Pure functional folding reducer: State_t = apply(State_{t-1}, Event_t)
    public void apply(DomainEvent event) {
        switch (event) {
            case OrderPlacedEvent e -> {
                this.orderId = e.orderId();
                this.status = OrderStatus.PLACED;
                this.totalAmount = e.initialAmount();
            }
            case ItemAddedEvent e -> {
                this.items.add(new OrderItem(e.sku(), e.quantity(), e.price()));
                this.totalAmount = this.totalAmount.add(e.price().multiply(BigDecimal.valueOf(e.quantity())));
            }
            case DiscountAppliedEvent e -> {
                this.totalAmount = this.totalAmount.subtract(e.discountAmount());
            }
            case OrderShippedEvent e -> {
                this.status = OrderStatus.SHIPPED;
            }
            default -> throw new IllegalStateException("Unhandled event type: " + event.getClass());
        }
        this.version++;
    }
}`
    },
    architecturalInvariant: 'Aggregate state is a pure projection of its past events. State transitions are deterministic and repeatable across arbitrary replay iterations.',
    productionOutcomes: {
      'Audit Reconstruction': 'Any historical entity state reconstructed in sub-22ms without restore tapes',
      'Deterministic Fidelity': '100% reproducible state verification across 10,000 automated fuzz test runs',
      'Time-Travel Debugging': 'Production bugs reproduced in dev by replaying customer event streams to exact failure sequence',
      'Zero Data Loss': 'Zero implicit row updates; every delta explicitly recorded with timestamp and actor metadata'
    }
  },
  {
    id: 'snapshot-materialization',
    name: 'Snapshot Materialization Engine (Periodic Aggregated Checkpoints)',
    paradigm: 'O(1) State Restoration with Delta Event Catch-up',
    badge: 'Checkpoint Snapshot',
    algorithmFormula: 'Snapshot_k + foldl(applyEvent, Snapshot_k.state, Events[k..N]) where k = floor(N / 100) * 100',
    replayEfficiency: '99.0% latency reduction (replays from 180ms down to 1.8ms by loading snapshot at event 100 + 4 delta events)',
    storageEfficiency: 'Compact binary Protobuf or JSONB snapshot stored in dedicated checkpoints table',
    concurrencyProtection: 'Snapshot creation runs asynchronously in background worker without blocking active write streams',
    workflowPhases: [
      {
        name: 'THRESHOLD_EVALUATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'After successful event append, worker evaluates: if (version - lastSnapshotVersion >= 100), schedule snapshot job.',
        invariants: 'Write path remains non-blocking; snapshot job is dispatched to async thread pool.'
      },
      {
        name: 'ASYNC_CHECKPOINT_PERSIST',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Background worker serializes full aggregate state and writes to snapshot_checkpoints table with snapshot_version.',
        invariants: 'Snapshots are immutable point-in-time caches; losing snapshots causes zero data loss as events remain intact.'
      },
      {
        name: 'O1_HYDRATION_FASTPATH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Aggregate loading query loads latest snapshot checkpoint (version K) and replays only residual delta events (K+1 to N).',
        invariants: 'Aggregate load latency is strictly bounded under 2.5ms regardless of whether aggregate has 100 or 1,000,000 events.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'SnapshotterService.java',
      code: `public class SnapshotterService {
    private final SnapshotRepository snapshotRepo;
    private final EventStore eventStore;
    private final ExecutorService asyncPool;
    private static final int SNAPSHOT_FREQUENCY = 100;

    public OrderAggregate loadAggregate(UUID streamId) {
        // 1. Fetch latest snapshot checkpoint if exists
        Optional<Snapshot<OrderAggregate>> snapshot = snapshotRepo.findLatest(streamId);
        
        long startVersion = snapshot.map(Snapshot::version).orElse(0L);
        OrderAggregate aggregate = snapshot.map(Snapshot::state).orElseGet(OrderAggregate::new);

        // 2. Load only events appended AFTER the snapshot version
        List<DomainEvent> deltaEvents = eventStore.readEvents(streamId, startVersion + 1);
        for (DomainEvent event : deltaEvents) {
            aggregate.apply(event);
        }

        return aggregate;
    }

    public void triggerSnapshotIfNeeded(UUID streamId, OrderAggregate state, long version) {
        if (version % SNAPSHOT_FREQUENCY == 0) {
            asyncPool.submit(() -> snapshotRepo.save(new Snapshot<>(streamId, version, state)));
        }
    }
}`
    },
    architecturalInvariant: 'Snapshots are purely performance optimizations and can be evicted or rebuilt at will. The append-only event stream remains the single authoritative source of truth.',
    productionOutcomes: {
      'Hydration Latency': 'Aggregate restoration latency reduced from 180ms down to 1.8ms (99.0% improvement)',
      'Database I/O': '92% reduction in disk reads during high-frequency aggregate hydration cycles',
      'Long-Lived Entities': 'Aggregates with over 500,000 historical events load within constant 2.2ms P99 SLA',
      'Crash Recovery': 'Zero data loss risk upon snapshot corruption; automatic fallback to raw stream replay'
    }
  },
  {
    id: 'cqrs-read-projections',
    name: 'CQRS Read Projections via Debezium CDC (Polyglot View Materialization)',
    paradigm: 'Asynchronous Command-Query Responsibility Segregation',
    badge: 'Polyglot Read Models',
    algorithmFormula: 'EventStore (WAL) -> Debezium CDC -> Kafka (Ordered Partition) -> Projection Consumer -> Elasticsearch / PostgreSQL View',
    replayEfficiency: 'Sub-8ms end-to-end event propagation from write aggregate to read projection',
    storageEfficiency: 'Denormalized flat query models optimized for sub-1.2ms single-key GET queries',
    concurrencyProtection: 'Monotonic sequence deduplication prevents duplicate out-of-order projection updates',
    workflowPhases: [
      {
        name: 'COMMAND_ACCEPTANCE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Command side validates invariants, writes events to event_store, and returns HTTP 202 Accepted with streamId.',
        invariants: 'Write side possesses zero knowledge of read views, indexes, or downstream projection schemas.'
      },
      {
        name: 'CDC_STREAM_CAPTURE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Debezium CDC connector tails PostgreSQL WAL and streams mutations to Kafka topic events.orders partitioned by streamId.',
        invariants: 'Order of events within an aggregate partition is strictly preserved by Kafka partition ordering.'
      },
      {
        name: 'READ_VIEW_UPSERT',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Independent projection worker consumes events and denormalizes data into Elasticsearch for full-text search and Postgres for fast queries.',
        invariants: 'Projections are completely idempotent using monotonic sequence deduplication to absorb replay duplicates.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'OrderProjectionConsumer.java',
      code: `@Component
public class OrderProjectionConsumer {
    private final ElasticsearchClient esClient;
    private final JdbcClient jdbc;

    @KafkaListener(topics = "events.orders", groupId = "order-read-projection")
    public void onEvent(DomainEnvelope envelope, Acknowledgment ack) {
        String eventType = envelope.eventType();
        UUID streamId = envelope.streamId();
        long version = envelope.version();

        // Idempotent upsert: ignore duplicate or out-of-order events
        int rows = jdbc.sql("""
            INSERT INTO order_read_view (order_id, status, total, last_version)
            VALUES (:id, :status, :total, :ver)
            ON CONFLICT (order_id) DO UPDATE
            SET status = EXCLUDED.status,
                total = EXCLUDED.total,
                last_version = EXCLUDED.last_version
            WHERE EXCLUDED.last_version > order_read_view.last_version
        """)
        .param("id", streamId)
        .param("status", envelope.status())
        .param("total", envelope.totalAmount())
        .param("ver", version)
        .update();

        // Async update to search index
        esClient.index(i -> i.index("orders-search").id(streamId.toString()).document(envelope));
        ack.acknowledge();
    }
}`
    },
    architecturalInvariant: 'Read models are completely decoupled from write schemas. Read stores can be dropped and rebuilt from scratch at any time by replaying Kafka topics from offset 0.',
    productionOutcomes: {
      'Query Performance': 'P99 read latency drops to sub-1.2ms via pre-joined denormalized query views',
      'Database Scaling': 'Eliminates 95% of join contention on write-heavy primary transactional database',
      'Polyglot Freedom': 'Different read views target best-fit storage (Elasticsearch for search, Redis for caches, Postgres for analytics)',
      'Zero Write Downtime': 'Read models can be re-indexed in parallel blue-green deployments without pausing writes'
    }
  },
  {
    id: 'event-schema-upcasting',
    name: 'Event Schema Evolution with In-Flight Upcasters (Zero-Downtime Event V1 to V2)',
    paradigm: 'On-The-Fly Event Transformation without Database Mutation',
    badge: 'Schema Upcasting',
    algorithmFormula: 'UpcasterChain: EventV1 -> UpcasterV1toV2(json) -> UpcasterV2toV3(json) -> AggregateDeserializer',
    replayEfficiency: 'Sub-45 microseconds per upcast event during stream deserialization',
    storageEfficiency: 'Historical event store remains 100% immutable; no risky in-place column or JSON migrations',
    concurrencyProtection: 'Deterministic stateless upcaster functions guarantee non-breaking schema backward compatibility',
    workflowPhases: [
      {
        name: 'RAW_JSON_DESERIALIZE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Event store reads historical event row containing schema_version = 1 from immutable database table.',
        invariants: 'Historical database rows are never altered, maintaining cryptographic hash and audit validity.'
      },
      {
        name: 'UPCASTER_CHAIN_EVALUATE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Deserialization pipeline routes JSON node through registered chain of upcasters: V1 -> V2 (adding default currency USD) -> V3 (split name into first/last).',
        invariants: 'Upcasters are pure transformations producing compliant modern schema envelopes in memory.'
      },
      {
        name: 'TYPED_EVENT_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Modern Java 21 record class instantiated with fully upcasted V3 schema and applied to aggregate root.',
        invariants: 'Domain application code only deals with the latest event schema version; legacy fields never leak into domain.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'OrderPlacedEventUpcaster.java',
      code: `public class OrderPlacedEventUpcaster implements EventUpcaster {
    private static final String TARGET_TYPE = "OrderPlacedEvent";

    @Override
    public boolean canUpcast(String eventType, int schemaVersion) {
        return TARGET_TYPE.equals(eventType) && schemaVersion == 1;
    }

    @Override
    public JsonNode upcast(JsonNode oldJson, ObjectNode metadata) {
        ObjectNode newJson = oldJson.deepCopy();

        // Schema evolution: V1 had 'amount' as flat double without currency.
        // V2 introduces multi-currency support: 'currencyCode' defaults to 'USD'.
        if (!newJson.has("currencyCode")) {
            newJson.put("currencyCode", "USD");
        }

        // Tag envelope with updated schema version
        metadata.put("schemaVersion", 2);
        return newJson;
    }
}`
    },
    architecturalInvariant: 'Historical events are immutable and must never be migrated via destructive database DDL or DML. Schema changes are handled strictly in application code through deterministic upcaster chains.',
    productionOutcomes: {
      'Schema Migrations': 'Zero database table locks or data-loss risks during major domain schema evolution cycles',
      'Deployment Agility': 'Blue-green and canary deployments run concurrently across old and new schema versions',
      'Upcast Overhead': 'Sub-45 microseconds added latency per event during deserialization phase',
      'Code Cleanliness': 'Domain aggregate model only maintains latest domain classes; zero legacy if/else branches in business logic'
    }
  }
]

export const SEED_EVENT_STREAM: EventStreamRecord[] = [
  {
    id: 'evt-01934a10-7001-7000-8000-000000000001',
    streamId: 'ord-8849-ae12',
    sequence: 1,
    eventType: 'OrderPlacedEvent',
    timestamp: '2026-10-28T00:01:10.120Z',
    payload: {
      orderId: 'ord-8849-ae12',
      customerId: 'cust-9021',
      totalAmount: 180.50,
      currency: 'USD'
    },
    metadata: {
      correlationId: 'req-corr-001',
      causationId: 'cmd-create-order',
      actor: 'system-gateway',
      schemaVersion: 2
    }
  },
  {
    id: 'evt-01934a10-7002-7000-8000-000000000002',
    streamId: 'ord-8849-ae12',
    sequence: 2,
    eventType: 'ItemAddedEvent',
    timestamp: '2026-10-28T00:01:12.450Z',
    payload: {
      sku: 'SKU-K8S-BOOK',
      quantity: 2,
      unitPrice: 45.00,
      category: 'technical-books'
    },
    metadata: {
      correlationId: 'req-corr-002',
      causationId: 'cmd-add-item',
      actor: 'user-browser',
      schemaVersion: 2
    }
  },
  {
    id: 'evt-01934a10-7003-7000-8000-000000000003',
    streamId: 'ord-8849-ae12',
    sequence: 3,
    eventType: 'ShippingAddressSetEvent',
    timestamp: '2026-10-28T00:01:15.890Z',
    payload: {
      country: 'SG',
      postalCode: '048624',
      tier: 'EXPRESS_NEXT_DAY'
    },
    metadata: {
      correlationId: 'req-corr-003',
      causationId: 'cmd-set-shipping',
      actor: 'user-browser',
      schemaVersion: 2
    }
  },
  {
    id: 'evt-01934a10-7004-7000-8000-000000000004',
    streamId: 'ord-8849-ae12',
    sequence: 4,
    eventType: 'DiscountCodeAppliedEvent',
    timestamp: '2026-10-28T00:01:18.230Z',
    payload: {
      code: 'DEV-ARCHITECT-20',
      discountAmount: 20.00,
      newTotal: 160.50
    },
    metadata: {
      correlationId: 'req-corr-004',
      causationId: 'cmd-apply-coupon',
      actor: 'promo-engine',
      schemaVersion: 2
    }
  },
  {
    id: 'evt-01934a10-7005-7000-8000-000000000005',
    streamId: 'ord-8849-ae12',
    sequence: 5,
    eventType: 'PaymentAuthorizedEvent',
    timestamp: '2026-10-28T00:01:22.010Z',
    payload: {
      gateway: 'Stripe',
      authCode: 'ch_3N4yX8K2a',
      amountCaptured: 160.50,
      status: 'CAPTURED'
    },
    metadata: {
      correlationId: 'req-corr-005',
      causationId: 'cmd-authorize-payment',
      actor: 'payment-saga',
      schemaVersion: 2
    }
  },
  {
    id: 'evt-01934a10-7006-7000-8000-000000000006',
    streamId: 'ord-8849-ae12',
    sequence: 6,
    eventType: 'OrderShippedEvent',
    timestamp: '2026-10-28T00:01:30.550Z',
    payload: {
      carrier: 'DHL_EXPRESS',
      trackingNumber: 'SG-99823104',
      estimatedDelivery: '2026-10-29'
    },
    metadata: {
      correlationId: 'req-corr-006',
      causationId: 'cmd-ship-order',
      actor: 'logistics-worker',
      schemaVersion: 2
    }
  }
]
