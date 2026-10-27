export interface SagaStep {
  id: string
  name: string
  service: string
  action: string
  compensatingAction: string
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED'
  durationMs: number
  payloadSummary: string
  undoSummary: string
}

export interface DistributedSagaModel {
  id: string
  name: string
  paradigm: string
  badge: string
  coordinationModel: string
  couplingType: string
  faultRecoveryStyle: string
  isolationGuarantee: string
  observabilityModel: string
  workflowPhases: Array<{
    name: string
    color: string
    description: string
    invariants: string
  }>
  steps: SagaStep[]
  codeSnippet: {
    language: string
    filename: string
    code: string
  }
  architecturalInvariant: string
  productionOutcomes: Record<string, string>
}

export const DISTRIBUTED_SAGA_MODELS: DistributedSagaModel[] = [
  {
    id: 'orchestrated-saga-temporal',
    name: 'Orchestrated Saga (Centralized Temporal / Camunda State Machine)',
    paradigm: 'Centralized Orchestration with Deterministic Workflow History',
    badge: 'Temporal Orchestrator',
    coordinationModel: 'Centralized state machine coordinator dispatching gRPC command activities',
    couplingType: 'Explicit unidirectional control flow; services expose idempotent endpoints',
    faultRecoveryStyle: 'Automated backward compensation executed sequentially by orchestrator',
    isolationGuarantee: 'Semantic isolation via Pending states; no global lock held across services',
    observabilityModel: 'Single pane of glass: execution graph and activity history fully deterministic',
    workflowPhases: [
      {
        name: 'WORKFLOW_INVOCATION',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Client triggers OrderCheckoutWorkflow via Temporal gRPC SDK. Orchestrator initializes deterministic execution history and assigns unique SagaId.',
        invariants: 'Saga state is persisted to append-only event history before any activity is scheduled.'
      },
      {
        name: 'ACTIVITY_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Orchestrator schedules activity tasks sequentially to worker queues: CreateOrder, ReserveInventory, AuthorizePayment, and DispatchFulfillment.',
        invariants: 'Every activity task defines explicit heartbeat timeouts, schedule-to-start limits, and maximum retry policies.'
      },
      {
        name: 'COMPENSATION_TRIGGER',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'If any non-retryable activity error occurs (e.g., PaymentDeclined), orchestrator halts forward execution and initiates backward compensation stack.',
        invariants: 'Compensating activities are invoked in exact reverse order of successfully completed forward steps.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        name: 'Create Pending Order',
        service: 'OrderService',
        action: 'orderRepository.save(order.withStatus(PENDING))',
        compensatingAction: 'orderRepository.updateStatus(orderId, CANCELLED)',
        status: 'PENDING',
        durationMs: 14,
        payloadSummary: 'Order #ORD-8491 created with status PENDING_PAYMENT',
        undoSummary: 'Order #ORD-8491 marked as CANCELLED with reason PAYMENT_REJECTED'
      },
      {
        id: 'step-2',
        name: 'Reserve Inventory Items',
        service: 'InventoryService',
        action: 'inventoryClient.reserveStock(skuList, quantity)',
        compensatingAction: 'inventoryClient.releaseStockReservation(reservationId)',
        status: 'PENDING',
        durationMs: 22,
        payloadSummary: 'Reserved 2 units of SKU-TECH-904 with 15-minute lease',
        undoSummary: 'Released stock reservation RES-2041 back to active warehouse pool'
      },
      {
        id: 'step-3',
        name: 'Process Stripe Payment',
        service: 'PaymentService',
        action: 'paymentGateway.chargeToken(token, amount, idempotencyKey)',
        compensatingAction: 'paymentGateway.refundCharge(chargeId, idempotencyKey)',
        status: 'PENDING',
        durationMs: 48,
        payloadSummary: 'Auth & capture $249.50 via Visa ending in 4242',
        undoSummary: 'Full refund of $249.50 issued to original payment method'
      },
      {
        id: 'step-4',
        name: 'Dispatch Warehouse Fulfillment',
        service: 'FulfillmentService',
        action: 'warehouseClient.scheduleDispatch(orderId, shippingAddress)',
        compensatingAction: 'warehouseClient.cancelDispatchManifest(manifestId)',
        status: 'PENDING',
        durationMs: 31,
        payloadSummary: 'Generated dispatch manifest MAN-9912 for Next-Day Priority',
        undoSummary: 'Cancelled dispatch manifest MAN-9912 prior to carrier handover'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'OrderCheckoutWorkflowImpl.java',
      code: `@WorkflowInterface
public interface OrderCheckoutWorkflow {
    @WorkflowMethod
    OrderConfirmation executeCheckout(CheckoutRequest request);
}

public class OrderCheckoutWorkflowImpl implements OrderCheckoutWorkflow {
    private final ActivityOptions options = ActivityOptions.newBuilder()
        .setStartToCloseTimeout(Duration.ofSeconds(10))
        .setRetryOptions(RetryOptions.newBuilder().setMaximumAttempts(3).build())
        .build();

    private final OrderActivities orderActivities = 
        Workflow.newActivityStub(OrderActivities.class, options);
    private final InventoryActivities inventoryActivities = 
        Workflow.newActivityStub(InventoryActivities.class, options);
    private final PaymentActivities paymentActivities = 
        Workflow.newActivityStub(PaymentActivities.class, options);

    @Override
    public OrderConfirmation executeCheckout(CheckoutRequest request) {
        Saga saga = new Saga(new Saga.Options.Builder().setParallelCompensation(false).build());
        try {
            // Step 1: Create pending order
            String orderId = orderActivities.createPendingOrder(request);
            saga.addCompensation(orderActivities::cancelOrder, orderId);

            // Step 2: Reserve inventory
            String reservationId = inventoryActivities.reserveStock(request.getItems());
            saga.addCompensation(inventoryActivities::releaseStock, reservationId);

            // Step 3: Authorize payment
            String chargeId = paymentActivities.chargePayment(orderId, request.getPaymentToken());
            saga.addCompensation(paymentActivities::refundPayment, chargeId);

            return new OrderConfirmation(orderId, "COMPLETED");
        } catch (ActivityFailure e) {
            // Reverses all executed operations in exact LIFO order
            saga.compensate();
            throw Workflow.wrap(e);
        }
    }
}`
    },
    architecturalInvariant: 'The orchestrator maintains full deterministic replay state. No distributed two-phase commit locks are held; consistency is achieved via ordered compensating activities.',
    productionOutcomes: {
      'Blast Radius Containment': 'Failures in payment isolate to local order without blocking database connection pools',
      'Observability SLA': 'Zero phantom executions: 100% of workflows observable via Temporal event timeline',
      'Throughput Capacity': '12,500 active concurrent Saga instances per orchestrator worker node',
      'Recovery Latency': 'Sub-180ms automated backward compensation upon payment provider timeout'
    }
  },
  {
    id: 'choreographed-saga-kafka',
    name: 'Choreographed Saga (Decoupled Kafka Event Mesh & Transactional Outbox)',
    paradigm: 'Decentralized Event Choreography with Event Sourcing',
    badge: 'Kafka Event Mesh',
    coordinationModel: 'Decentralized pub/sub; services publish domain events and react autonomously',
    couplingType: 'Loose asynchronous event coupling; no single point of failure coordinator',
    faultRecoveryStyle: 'Reactive compensation via failure domain events (e.g. OrderPaymentFailedEvent)',
    isolationGuarantee: 'Eventual consistency through idempotent message handlers and UUIDv7 idempotency keys',
    observabilityModel: 'Distributed tracing required (OpenTelemetry W3C traceparent headers across Kafka)',
    workflowPhases: [
      {
        name: 'EVENT_PUBLICATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'OrderService records order and atomically inserts OrderCreatedEvent into PostgreSQL outbox table within the same local ACID transaction.',
        invariants: 'Dual-write hazard eliminated: outbox row guarantees at-least-once delivery to Kafka topic.'
      },
      {
        name: 'AUTONOMOUS_CONSUMPTION',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'InventoryService and PaymentService consume events independently from respective partition consumer groups without direct RPC coupling.',
        invariants: 'Every consumer enforces idempotency by checking message ID in Redis or PostgreSQL deduplication table.'
      },
      {
        name: 'REACTIVE_COMPENSATION',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'When PaymentService detects an error, it publishes PaymentFailedEvent. Upstream InventoryService reacts by releasing stock reservations.',
        invariants: 'Failure events propagate asynchronously through dedicated failure topics to execute undo actions.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        name: 'Publish OrderCreatedEvent',
        service: 'OrderService',
        action: 'kafkaProducer.send("orders.v1", orderCreatedJson)',
        compensatingAction: 'kafkaProducer.send("orders.v1", orderCancelledJson)',
        status: 'PENDING',
        durationMs: 8,
        payloadSummary: 'Published OrderCreatedEvent to topic orders.v1 with key #ORD-8491',
        undoSummary: 'Published OrderCancelledEvent to trigger compensation in consumer mesh'
      },
      {
        id: 'step-2',
        name: 'Consume OrderCreated -> Emit InventoryReserved',
        service: 'InventoryService',
        action: 'kafkaProducer.send("inventory.v1", stockReservedJson)',
        compensatingAction: 'kafkaProducer.send("inventory.v1", stockReleasedJson)',
        status: 'PENDING',
        durationMs: 16,
        payloadSummary: 'Emitted InventoryReservedEvent with reservationId RES-2041',
        undoSummary: 'Emitted InventoryReleasedEvent resetting reserved quantity counter'
      },
      {
        id: 'step-3',
        name: 'Consume InventoryReserved -> Charge Card',
        service: 'PaymentService',
        action: 'kafkaProducer.send("payments.v1", paymentCapturedJson)',
        compensatingAction: 'kafkaProducer.send("payments.v1", paymentRefundedJson)',
        status: 'PENDING',
        durationMs: 42,
        payloadSummary: 'Captured payment $249.50 and emitted PaymentCapturedEvent',
        undoSummary: 'Emitted PaymentFailedEvent triggering downstream compensation cascade'
      },
      {
        id: 'step-4',
        name: 'Consume PaymentCaptured -> Finalize Shipping',
        service: 'FulfillmentService',
        action: 'kafkaProducer.send("fulfillment.v1", shipmentDispatchedJson)',
        compensatingAction: 'kafkaProducer.send("fulfillment.v1", shipmentAbortedJson)',
        status: 'PENDING',
        durationMs: 25,
        payloadSummary: 'Emitted ShipmentScheduledEvent for automated warehouse conveyor',
        undoSummary: 'Emitted ShipmentAbortedEvent halting automated packing slip'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'InventoryEventConsumer.java',
      code: `@Component
public class InventoryEventConsumer {
    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final IdempotencyValidator idempotencyValidator;

    @KafkaListener(topics = "orders.v1", groupId = "inventory-saga-group")
    public void handleOrderEvents(ConsumerRecord<String, OrderEvent> record) {
        String eventId = record.headers().lastHeader("X-Event-ID").value().toString();
        if (!idempotencyValidator.tryAcquireLock(eventId, Duration.ofMinutes(10))) {
            return; // Duplicate event skipped
        }

        OrderEvent event = record.value();
        if (event instanceof OrderCreatedEvent created) {
            try {
                String reservationId = inventoryRepository.reserve(created.skuList());
                kafkaTemplate.send("inventory.v1", created.orderId(), 
                    new InventoryReservedEvent(created.orderId(), reservationId));
            } catch (InsufficientStockException ex) {
                kafkaTemplate.send("inventory.v1", created.orderId(), 
                    new InventoryReservationFailedEvent(created.orderId(), ex.getMessage()));
            }
        } else if (event instanceof PaymentFailedEvent failed) {
            // Reactive compensation triggered by downstream payment decline
            inventoryRepository.releaseReservation(failed.orderId());
            kafkaTemplate.send("inventory.v1", failed.orderId(),
                new InventoryReleasedEvent(failed.orderId()));
        }
    }
}`
    },
    architecturalInvariant: 'No service directly calls another service. Microservices communicate solely by consuming and emitting immutable domain events via partitioned Kafka topics.',
    productionOutcomes: {
      'Service Decoupling': 'Zero compile-time or runtime RPC dependencies between billing, inventory, and orders',
      'Scalability Factor': '65,000 TPS event consumption across 32 Kafka topic partitions',
      'Fault Isolation': 'If PaymentService is temporarily down, inventory reservations queue safely in Kafka',
      'Event Retention': '7-day compaction window allows point-in-time state reconstruction'
    }
  },
  {
    id: 'backward-compensation-recovery',
    name: 'Backward Compensation Recovery (Semantic Undo Log with Idempotent Reversal)',
    paradigm: 'LIFO Compensating Transaction Reversal',
    badge: 'Semantic Undo Log',
    coordinationModel: 'Stack-based compensation engine executing compensating activities in strict reverse order',
    couplingType: 'Coupled to compensating endpoints; each forward operation must define an idempotent undo',
    faultRecoveryStyle: 'Strict backward rollback; returns system to a consistent baseline state upon failure',
    isolationGuarantee: 'Semantic compensation: intermediate dirty reads mitigated via compensating credit transactions',
    observabilityModel: 'Compensating activity correlation IDs and failure audit trails in dedicated ledger',
    workflowPhases: [
      {
        name: 'FORWARD_EXECUTION_STACK',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'As forward steps succeed, their corresponding compensating actions are pushed onto an in-memory or persisted LIFO stack with serialized undo payloads.',
        invariants: 'No step proceeds until the previous step is confirmed and its compensating token is registered.'
      },
      {
        name: 'FAILURE_INTERCEPTION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'An unrecoverable business failure is caught (e.g. Card Expired or Risk Fraud Block). Normal execution is aborted immediately.',
        invariants: 'The current step does not register compensation; only previously completed steps are reversed.'
      },
      {
        name: 'LIFO_COMPENSATION_DRAIN',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'Compensation engine pops each action in reverse order (Step N-1, Step N-2 ... Step 1) and dispatches undo requests with exponential retry.',
        invariants: 'Compensating actions cannot fail permanently; they must be retried until successful or alerted to dead-letter queue.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        name: '1. Order Entry Created',
        service: 'OrderService',
        action: 'orders.insert({ id: "ORD-8491", state: "SUBMITTED" })',
        compensatingAction: 'orders.update({ id: "ORD-8491", state: "ABORTED" })',
        status: 'PENDING',
        durationMs: 12,
        payloadSummary: 'Order status SUBMITTED recorded in customer profile',
        undoSummary: 'Order status switched to ABORTED; customer notified of cancellation'
      },
      {
        id: 'step-2',
        name: '2. Stock Allocated in Warehouse',
        service: 'WarehouseService',
        action: 'warehouse.allocate({ bin: "B-42", units: 2 })',
        compensatingAction: 'warehouse.deallocate({ bin: "B-42", units: 2 })',
        status: 'PENDING',
        durationMs: 19,
        payloadSummary: 'Hardware units locked in Bin B-42 at Dallas fulfillment center',
        undoSummary: 'Units unlocked in Bin B-42 and restored to available inventory pool'
      },
      {
        id: 'step-3',
        name: '3. Payment Authorization',
        service: 'PaymentService',
        action: 'stripe.charges.create({ amount: 24950, currency: "usd" })',
        compensatingAction: 'stripe.refunds.create({ charge: chargeId })',
        status: 'PENDING',
        durationMs: 45,
        payloadSummary: 'Stripe API call initiated for credit card authorization',
        undoSummary: 'Stripe refund executed with reverse transfer reference'
      },
      {
        id: 'step-4',
        name: '4. Shipping Label Created',
        service: 'LogisticsService',
        action: 'fedex.shipments.create({ weight: 1.4, service: "2DAY" })',
        compensatingAction: 'fedex.shipments.cancel({ trackingNumber: trackId })',
        status: 'PENDING',
        durationMs: 28,
        payloadSummary: 'FedEx barcode generated and scheduled for pickup',
        undoSummary: 'FedEx pickup manifest voided before driver dispatch'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'BackwardCompensationManager.java',
      code: `public class BackwardCompensationManager {
    private final Deque<CompensatingAction> compensationStack = new ArrayDeque<>();
    private final MeterRegistry meterRegistry;

    public void registerCompensation(String stepName, Runnable action) {
        compensationStack.push(new CompensatingAction(stepName, action));
    }

    public void executeCompensationCascade(String sagaId, Throwable cause) {
        log.warn("Executing backward compensation for Saga: {}. Root cause: {}", sagaId, cause.getMessage());
        meterRegistry.counter("saga.compensation.triggered", "sagaId", sagaId).increment();

        while (!compensationStack.isEmpty()) {
            CompensatingAction compensating = compensationStack.pop();
            boolean success = false;
            int attempt = 0;

            while (!success && attempt < 5) {
                try {
                    attempt++;
                    compensating.action().run();
                    success = true;
                    log.info("Successfully compensated step: [{}] for Saga: {}", compensating.stepName(), sagaId);
                } catch (Exception ex) {
                    log.error("Compensating action failed for step: [{}], attempt: {}", compensating.stepName(), attempt, ex);
                    backoffSleep(attempt);
                }
            }

            if (!success) {
                // Escalate to Dead-Letter Queue for manual SRE intervention
                publishToDeadLetterQueue(sagaId, compensating);
            }
        }
    }
}`
    },
    architecturalInvariant: 'Every compensating transaction must be strictly idempotent. A compensating transaction may be called multiple times during network retries without causing double-reversals.',
    productionOutcomes: {
      'Double-Spend Prevention': '0.00% double-spend or double-refund occurrences across all rollback drills',
      'Rollback Completion Rate': '99.98% of compensation flows complete automatically within 3 retries',
      'Dead-Letter Quarantine': 'Sub-20ms DLQ routing for irrecoverable downstream partner outages',
      'Audit Ledger Compliance': 'SOC2 and PCI-DSS compliant immutable append-only compensation logs'
    }
  },
  {
    id: 'forward-recovery-retry',
    name: 'Forward Recovery (Idempotent Retries with Exponential Jitter & DLQ Fallback)',
    paradigm: 'Forward-Only Resilient Eventual Consistency',
    badge: 'Forward Recovery',
    coordinationModel: 'Persistent task scheduler with automated exponential backoff retry and circuit-breaker quarantine',
    couplingType: 'Loose coupling with idempotent retry semantics; no backward compensation needed',
    faultRecoveryStyle: 'Forward retry until success; applies to operations that cannot or should not be reversed',
    isolationGuarantee: 'At-least-once delivery with end-to-end consumer idempotency filtering',
    observabilityModel: 'Retry attempts counter, backoff jitter distribution, and dead-letter queue metrics',
    workflowPhases: [
      {
        name: 'TRANSIENT_FAULT_DETECTION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Step encounters a retryable transient failure (e.g. HTTP 503 Service Unavailable, DB connection pool timeout, or socket timeout).',
        invariants: 'Errors are classified into retryable (network/load) vs fatal (invalid account/bad request).'
      },
      {
        name: 'EXPONENTIAL_JITTER_BACKOFF',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Scheduler suspends task and reschedules execution using full jitter: delay = random(0, min(maxDelay, baseDelay * 2^attempt)).',
        invariants: 'Full jitter breaks retry harmonics, preventing synchronized thundering herd spikes.'
      },
      {
        name: 'FORWARD_COMPLETION_OR_DLQ',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Operation succeeds on subsequent attempt. If maxAttempts (e.g. 5) is exceeded, message routes to Dead-Letter Queue with full diagnostic context.',
        invariants: 'Business invariants remain intact: downstream systems eventually process the valid payload.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        name: 'Order Acceptance & Ledger Validation',
        service: 'LedgerService',
        action: 'ledger.recordPendingTransaction(orderId, amount)',
        compensatingAction: 'None (Forward Recovery Guarantee)',
        status: 'PENDING',
        durationMs: 15,
        payloadSummary: 'Transaction ledger entry written with deterministic digest',
        undoSummary: 'Forward recovery paradigm: will retry until verified committed'
      },
      {
        id: 'step-2',
        name: 'Tax Calculation & Compliance Gating',
        service: 'TaxService',
        action: 'taxEngine.calculateWithRetry(address, lineItems)',
        compensatingAction: 'None (Forward Recovery Guarantee)',
        status: 'PENDING',
        durationMs: 38,
        payloadSummary: 'Computed sales tax rates via Avalara cloud gateway',
        undoSummary: 'Exponential retry active: transient 504 handled via backoff'
      },
      {
        id: 'step-3',
        name: 'Loyalty Reward Points Redemption',
        service: 'RewardsService',
        action: 'rewardsClient.debitPoints(userId, 500, idempotencyKey)',
        compensatingAction: 'None (Forward Recovery Guarantee)',
        status: 'PENDING',
        durationMs: 27,
        payloadSummary: 'Debited 500 reward points ($5.00 equivalent value)',
        undoSummary: 'Idempotency key prevents duplicate point subtractions'
      },
      {
        id: 'step-4',
        name: 'Transactional Email & SMS Notification',
        service: 'NotificationService',
        action: 'notificationQueue.enqueue(orderConfirmationTemplate)',
        compensatingAction: 'None (Forward Recovery Guarantee)',
        status: 'PENDING',
        durationMs: 18,
        payloadSummary: 'Enqueued customer receipt notification for SES/Twilio',
        undoSummary: 'Message delivery guaranteed via persistent SQS retry loop'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'ForwardRecoveryActivityExecutor.java',
      code: `public class ForwardRecoveryActivityExecutor {
    private static final int MAX_ATTEMPTS = 5;
    private static final long BASE_DELAY_MS = 200;
    private static final long MAX_DELAY_MS = 10_000;

    public <T> T executeWithForwardRecovery(String taskId, Callable<T> activity) {
        int attempt = 0;
        while (attempt < MAX_ATTEMPTS) {
            try {
                attempt++;
                return activity.call();
            } catch (TransientException ex) {
                if (attempt >= MAX_ATTEMPTS) {
                    routeToDeadLetterQueue(taskId, ex);
                    throw new SagaFatalException("Max retry attempts exhausted for task: " + taskId, ex);
                }
                long sleepMs = calculateFullJitter(attempt);
                log.warn("Task {} encountered transient fault. Retrying attempt {}/{} in {}ms", 
                    taskId, attempt, MAX_ATTEMPTS, sleepMs);
                Thread.sleep(sleepMs);
            }
        }
        throw new IllegalStateException("Unreachable state");
    }

    private long calculateFullJitter(int attempt) {
        long exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * (1L << attempt));
        return ThreadLocalRandom.current().nextLong(exponential);
    }
}`
    },
    architecturalInvariant: 'Forward recovery is applied when the cost or impossibility of rolling back exceeds the cost of retrying until success (e.g. sending customer receipts, billing tax compliance).',
    productionOutcomes: {
      'Eventual Consistency SLA': '99.999% of transiently failing activities resolve within 4 retry cycles',
      'Thundering Herd Elimination': 'Full jitter flattens recovery traffic spikes by 78%',
      'Operational Overhead': 'Automated retry reduces manual engineer pager interventions by 86%',
      'Data Loss Guarantee': '0 lost transaction payloads due to persistent dead-letter queue staging'
    }
  },
  {
    id: 'dual-write-atomic-outbox',
    name: 'Dual-Write Atomic Outbox (PostgreSQL ACID Transaction with Debezium CDC)',
    paradigm: 'Transactional Outbox with Change Data Capture',
    badge: 'Transactional Outbox CDC',
    coordinationModel: 'Local database ACID transaction writing business entities and outbox events together',
    couplingType: 'Zero network dual-write coupling; database transaction log is single source of truth',
    faultRecoveryStyle: 'Crash-resilient log replay via Debezium CDC tailing PostgreSQL Write-Ahead Log (WAL)',
    isolationGuarantee: 'Strict serializability locally; at-least-once message delivery to Kafka cluster',
    observabilityModel: 'WAL replication slot lag, Debezium offset advancement, and consumer deduplication rate',
    workflowPhases: [
      {
        name: 'ATOMIC_LOCAL_TRANSACTION',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Application writes to orders table and inserts an event record into outbox_table within the exact same database BEGIN...COMMIT transaction.',
        invariants: 'Dual-write anomaly eliminated: either both entity and event are saved, or neither is.'
      },
      {
        name: 'CDC_LOG_TAILING',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Debezium connector connects to PostgreSQL logical replication slot, tails WAL stream, and streams outbox inserts to Kafka topic with sub-10ms lag.',
        invariants: 'Zero performance impact on primary queries; Debezium reads asynchronously from replication stream.'
      },
      {
        name: 'CONSUMER_DEDUPLICATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Downstream microservice checks incoming UUIDv7 message key against processed_events table before executing business logic.',
        invariants: 'Exactly-once processing semantics achieved at the application boundary.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        name: 'Begin Local ACID Transaction',
        service: 'OrderService',
        action: 'BEGIN; INSERT INTO orders ...; INSERT INTO outbox_events ...; COMMIT;',
        compensatingAction: 'Transactional rollback (Automatic on error prior to commit)',
        status: 'PENDING',
        durationMs: 11,
        payloadSummary: 'Order row #ORD-8491 and Outbox event record inserted atomically',
        undoSummary: 'PostgreSQL WAL ensures zero partial commits or phantom events'
      },
      {
        id: 'step-2',
        name: 'PostgreSQL WAL Stream Generated',
        service: 'PostgreSQL Engine',
        action: 'pg_logical_slot.peek_changes() reads transaction commit record',
        compensatingAction: 'None (Committed WAL is immutable append-only ledger)',
        status: 'PENDING',
        durationMs: 4,
        payloadSummary: 'WAL LSN 0/16B2940 recorded in logical replication slot',
        undoSummary: 'Immutable WAL entry available for crash-recovery replays'
      },
      {
        id: 'step-3',
        name: 'Debezium CDC Publishes to Kafka',
        service: 'Debezium Connector',
        action: 'kafkaProducer.send("orders.cdc.v1", outboxRow.payload())',
        compensatingAction: 'Kafka message compaction and consumer deduplication',
        status: 'PENDING',
        durationMs: 9,
        payloadSummary: 'Streamed outbox record to orders.cdc.v1 topic partition 4',
        undoSummary: 'Offset acknowledged upon majority in-sync replica (ISR) replication'
      },
      {
        id: 'step-4',
        name: 'Consumer Deduplication & Action',
        service: 'FulfillmentService',
        action: 'INSERT INTO processed_events (event_id) VALUES (?) ON CONFLICT DO NOTHING;',
        compensatingAction: 'Idempotent skip on duplicate event key',
        status: 'PENDING',
        durationMs: 14,
        payloadSummary: 'Checked UUIDv7 key 018ecc90-1120-741a-9821-6893c5d79124',
        undoSummary: 'Duplicate delivery safely recognized and skipped in 0.4ms'
      }
    ],
    codeSnippet: {
      language: 'sql',
      filename: 'TransactionalOutboxSchema.sql',
      code: `-- 1. Schema for ACID Transactional Outbox
CREATE TABLE orders (
    order_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE outbox_events (
    event_id UUID PRIMARY KEY,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Atomic Application Write: Zero Dual-Write Risk
BEGIN;
  INSERT INTO orders (order_id, customer_id, total_amount, status)
  VALUES ('a7801b70-36e2-4660-8438-efea923d8541', 'c2098d51-1b94-4361-9c88-294b4e941198', 249.50, 'PENDING');

  INSERT INTO outbox_events (event_id, aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    uuidv7(),
    'Order',
    'a7801b70-36e2-4660-8438-efea923d8541',
    'OrderCreatedEvent',
    '{"orderId": "a7801b70-36e2-4660-8438-efea923d8541", "amount": 249.50, "items": ["SKU-904"]}'::jsonb
  );
COMMIT;
-- Debezium CDC engine tails postgresql WAL replication slot and emits event to Kafka.`
    },
    architecturalInvariant: 'Never perform network dual-writes across both database and message broker. Write events atomically to the local database outbox table, and stream them asynchronously via CDC log-tailing.',
    productionOutcomes: {
      'Dual-Write Elimination': '100% elimination of 2-phase network race conditions and split state',
      'CDC Streaming Lag': 'Sub-8ms replication lag from PostgreSQL commit to Kafka partition ingestion',
      'Primary DB Overhead': '< 1.5% CPU overhead on PostgreSQL master node during peak 10,000 RPS write load',
      'Replay Capability': 'Re-indexing and disaster reconstruction supported via WAL offset rewind'
    }
  }
]
