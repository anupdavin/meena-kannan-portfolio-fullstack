export interface SystemStepDef {
  step: number
  title: string
  activeNodeIds: string[]
  activeConnectionIds: string[]
  protocol: string
  latencyEst: string
  description: string
  impactMetric: string
}

export interface NodeRuntimeSpec {
  id: string
  label: string
  sublabel: string
  role: string
  category: 'ingress' | 'gateway' | 'compute' | 'cache' | 'database' | 'broker' | 'security'
  technology: string
  concurrencyModel: string
  p99Latency: string
  throughput: string
  resiliencePattern: string
  targetSla: string
  deepDive: string
}

export interface WorkbenchSystemConfig {
  id: string
  title: string
  tagline: string
  subsystems: Array<{
    id: string
    label: string
    sublabel?: string
    x: number
    y: number
    width: number
    height: number
    accentColor: string
  }>
  normalSteps: SystemStepDef[]
  failureSteps: SystemStepDef[]
  failureModeTitle: string
  failureModeDescription: string
  nodeSpecs: Record<string, NodeRuntimeSpec>
}

export const WORKBENCH_SYSTEMS: Record<string, WorkbenchSystemConfig> = {
  'saas-platform': {
    id: 'saas-platform',
    title: 'Multi-Tenant B2B IAM & Control Plane',
    tagline: 'Envoy Token Bucket, Sub-1.2ms Redis Verification, and PostgreSQL Row-Level Security',
    subsystems: [
      {
        id: 'zone-ingress',
        label: 'PUBLIC INGRESS ZONE',
        sublabel: 'TLS 1.3 / Edge PoPs',
        x: 25,
        y: 40,
        width: 200,
        height: 465,
        accentColor: '#38bdf8'
      },
      {
        id: 'zone-dmz',
        label: 'DMZ / ENVOY PROXY TIER',
        sublabel: 'Zero-Trust Perimeter',
        x: 245,
        y: 40,
        width: 225,
        height: 465,
        accentColor: '#10b981'
      },
      {
        id: 'zone-vpc',
        label: 'VPC PRIVATE WORKLOAD & DATA LAYER',
        sublabel: 'Isolated Tenant Subnets',
        x: 490,
        y: 40,
        width: 445,
        height: 465,
        accentColor: '#a855f7'
      }
    ],
    failureModeTitle: 'Token Bucket Exhaustion & 429 Shed',
    failureModeDescription: 'Simulates tenant token quota depletion: Envoy sheds traffic via HTTP 429 before upstream saturation and records an audit log to PostgreSQL.',
    normalSteps: [
      {
        step: 1,
        title: 'Client Ingress & TLS Termination',
        activeNodeIds: ['client-ingress', 'envoy-gateway'],
        activeConnectionIds: ['flow-client-envoy'],
        protocol: 'HTTPS / TLS 1.3',
        latencyEst: '12ms',
        description: 'Client sends signed JWT bearer token over mutual TLS 1.3 to Envoy edge proxy.',
        impactMetric: 'Ingress Rate: 24,500 req/s'
      },
      {
        step: 2,
        title: 'Redis Token Bucket & Cache Query',
        activeNodeIds: ['envoy-gateway', 'redis-cache'],
        activeConnectionIds: ['flow-envoy-redis'],
        protocol: 'RESP3 / Pipeline',
        latencyEst: '1.2ms',
        description: 'Envoy checks rate limiter bucket and verifies tenant public key cache in Redis.',
        impactMetric: 'Cache Hit Ratio: 99.4%'
      },
      {
        step: 3,
        title: 'Compute Claims & Context Propagation',
        activeNodeIds: ['envoy-gateway', 'spring-core'],
        activeConnectionIds: ['flow-envoy-spring'],
        protocol: 'gRPC / HTTP/2',
        latencyEst: '4.8ms',
        description: 'Authenticated payload routed to Spring Boot 3 core via gRPC using Java 21 Virtual Threads.',
        impactMetric: 'Active Threads: 4,200 Virtual'
      },
      {
        step: 4,
        title: 'PostgreSQL Row-Level Security Enforcement',
        activeNodeIds: ['spring-core', 'postgres-rls'],
        activeConnectionIds: ['flow-spring-postgres'],
        protocol: 'SQL / RLS Session',
        latencyEst: '8.2ms',
        description: 'Connection pool sets tenant_id session variable; Postgres RLS guarantees cryptographic tenant partition isolation.',
        impactMetric: 'P99 Latency: 14.2ms'
      }
    ],
    failureSteps: [
      {
        step: 1,
        title: 'Traffic Spike at Perimeter',
        activeNodeIds: ['client-ingress', 'envoy-gateway'],
        activeConnectionIds: ['flow-client-envoy'],
        protocol: 'HTTP/3 Surge',
        latencyEst: '14ms',
        description: 'Tenant triggers sudden burst exceeding allocated 10,000 req/s rate limit.',
        impactMetric: 'Burst Volume: 38,000 req/s'
      },
      {
        step: 2,
        title: 'Envoy Token Bucket Exhaustion',
        activeNodeIds: ['envoy-gateway'],
        activeConnectionIds: [],
        protocol: 'Rate Limiter',
        latencyEst: '0.4ms',
        description: 'Local token bucket counter drops to zero; backpressure circuit activates instantly.',
        impactMetric: 'Bucket Status: Depleted'
      },
      {
        step: 3,
        title: 'HTTP 429 Backpressure Shed',
        activeNodeIds: ['envoy-gateway', 'client-ingress'],
        activeConnectionIds: ['flow-envoy-shed'],
        protocol: 'HTTP 429 Shed',
        latencyEst: '0.8ms',
        description: 'Envoy rejects excess requests with HTTP 429 and Retry-After header, shielding downstream services.',
        impactMetric: 'Upstream Saturation: 0%'
      },
      {
        step: 4,
        title: 'Asynchronous Security Audit Log',
        activeNodeIds: ['envoy-gateway', 'postgres-rls'],
        activeConnectionIds: ['flow-envoy-audit'],
        protocol: 'Async WAL Stream',
        latencyEst: '5.2ms',
        description: 'Rate limit violation emitted asynchronously to PostgreSQL security audit partition.',
        impactMetric: 'Audit Log Integrity: 100%'
      }
    ],
    nodeSpecs: {
      'client-ingress': {
        id: 'client-ingress',
        label: 'B2B Client Ingress',
        sublabel: 'Enterprise Web & Mobile App',
        role: 'Presentation & Client Layer',
        category: 'ingress',
        technology: 'React 19 SPA, Swift iOS, TypeScript SDK',
        concurrencyModel: 'Concurrent Client Pools, HTTP/3 Multiplexing',
        p99Latency: '12.0ms',
        throughput: '25,000 req/s',
        resiliencePattern: 'Exponential backoff with full jitter on 429/503 responses',
        targetSla: '99.99% Availability',
        deepDive: 'Dispatches signed JWT bearer tokens with distributed tenant identity headers. Handles token refresh cycles invisibly.'
      },
      'envoy-gateway': {
        id: 'envoy-gateway',
        label: 'Envoy Edge Proxy',
        sublabel: 'Rate Limiter & Ingress Shield',
        role: 'Perimeter Security & API Routing',
        category: 'gateway',
        technology: 'Envoy Proxy v1.29, C++ Async Core',
        concurrencyModel: 'Event-driven Epoll Worker Threads',
        p99Latency: '1.8ms',
        throughput: '85,000 req/s',
        resiliencePattern: 'Local Token Bucket + Distributed Redis Rate Limiter Fallback',
        targetSla: '99.999% Availability',
        deepDive: 'Provides mTLS termination, rate limiting, and HTTP/2 multiplexing. Sheds unauthorized or excessive traffic at the perimeter.'
      },
      'redis-cache': {
        id: 'redis-cache',
        label: 'Redis 7.2 Sharded Cache',
        sublabel: 'Token Store & Key Quotas',
        role: 'Distributed In-Memory Key-Value Store',
        category: 'cache',
        technology: 'Redis 7.2 Cluster with Redis Raft',
        concurrencyModel: 'Single-Threaded Reactor Core per Shard',
        p99Latency: '1.2ms',
        throughput: '120,000 ops/s',
        resiliencePattern: 'Active-Active Replica Failover with 5-Node Sentinel Quorum',
        targetSla: '99.999% Availability',
        deepDive: 'Maintains tenant rate-limit counters and cached public verification keys. TTL configured to 300 seconds with LRU eviction.'
      },
      'spring-core': {
        id: 'spring-core',
        label: 'Spring Boot 3 Core',
        sublabel: 'Java 21 Virtual Threads Engine',
        role: 'Domain Business Logic & Security Context',
        category: 'compute',
        technology: 'Spring Boot 3.3, Java 21, Project Loom',
        concurrencyModel: 'Million-Scale Virtual Threads (M:N Carrier Scheduler)',
        p99Latency: '4.8ms',
        throughput: '32,000 req/s',
        resiliencePattern: 'Resilience4j Circuit Breaker with Thread Bulkheads',
        targetSla: '99.95% Availability',
        deepDive: 'Executes zero-allocation JWT claim validation and tenant context propagation via ScopedValue variables.'
      },
      'postgres-rls': {
        id: 'postgres-rls',
        label: 'PostgreSQL 16 Multi-Tenant',
        sublabel: 'Row-Level Security & WAL Stream',
        role: 'System of Record & Partitioned Storage',
        category: 'database',
        technology: 'PostgreSQL 16.2, pg_partman, Patroni HA',
        concurrencyModel: 'MVCC with Connection Pooler (PgBouncer Transaction Mode)',
        p99Latency: '8.2ms',
        throughput: '14,000 tx/s',
        resiliencePattern: 'Synchronous Physical WAL Replication with Automated Failover',
        targetSla: '99.99% Availability',
        deepDive: 'Enforces PostgreSQL Row-Level Security policies per tenant ID. Zero cross-tenant data leak risk at the database kernel level.'
      }
    }
  },

  'ecommerce-engine': {
    id: 'ecommerce-engine',
    title: 'Distributed Order Checkout & Saga Engine',
    tagline: 'Transactional Outbox Pattern, Debezium WAL CDC, and Kafka Partitioned Event Mesh',
    subsystems: [
      {
        id: 'zone-checkout',
        label: 'ORDER CHECKOUT DOMAIN (VPC-A)',
        sublabel: 'Local ACID Transactions',
        x: 25,
        y: 40,
        width: 415,
        height: 465,
        accentColor: '#38bdf8'
      },
      {
        id: 'zone-kafka',
        label: 'KAFKA EVENT MESH (MULTI-AZ)',
        sublabel: 'Strict Ordering per OrderKey',
        x: 460,
        y: 40,
        width: 220,
        height: 465,
        accentColor: '#f59e0b'
      },
      {
        id: 'zone-consumers',
        label: 'SAGA PARTICIPANT DOMAIN (VPC-B)',
        sublabel: 'Idempotent Consumer Services',
        x: 700,
        y: 40,
        width: 235,
        height: 465,
        accentColor: '#10b981'
      }
    ],
    failureModeTitle: 'Payment Gateway Timeout & Compensating Rollback',
    failureModeDescription: 'Simulates external payment provider outage: Payment failure triggers DLQ routing and automated compensating inventory cancellation.',
    normalSteps: [
      {
        step: 1,
        title: 'Atomic Local ACID Transaction',
        activeNodeIds: ['checkout-service', 'postgres-outbox'],
        activeConnectionIds: ['flow-checkout-db'],
        protocol: 'Local ACID Commit',
        latencyEst: '12.4ms',
        description: 'Checkout Service writes Order record and Outbox event atomically in a single local database transaction.',
        impactMetric: 'Atomic Guarantee: 100%'
      },
      {
        step: 2,
        title: 'Debezium CDC Log Mining',
        activeNodeIds: ['postgres-outbox', 'debezium-cdc'],
        activeConnectionIds: ['flow-db-debezium'],
        protocol: 'Debezium WAL CDC',
        latencyEst: '4.2ms',
        description: 'Debezium tails PostgreSQL Write-Ahead Log (WAL) to capture outbox commits without polling overhead.',
        impactMetric: 'WAL Lag: 0ms'
      },
      {
        step: 3,
        title: 'Partitioned Kafka Event Dispatch',
        activeNodeIds: ['debezium-cdc', 'kafka-pipe'],
        activeConnectionIds: ['flow-debezium-kafka'],
        protocol: 'Kafka Partitions 0..2',
        latencyEst: '3.1ms',
        description: 'Events published to order-events topic with key-based hash routing ensuring strict ordering.',
        impactMetric: 'Broker Throughput: 45,000 msg/s'
      },
      {
        step: 4,
        title: 'Payment & Inventory Parallel Commit',
        activeNodeIds: ['kafka-pipe', 'payment-service', 'inventory-service'],
        activeConnectionIds: ['flow-kafka-payment', 'flow-kafka-inventory'],
        protocol: 'Idempotent Consumer',
        latencyEst: '18.6ms',
        description: 'Payment and Inventory consumers process OrderCreated event with deduplication keys and commit state.',
        impactMetric: 'Saga State: COMPLETED'
      }
    ],
    failureSteps: [
      {
        step: 1,
        title: 'Order Placed & Event Dispatched',
        activeNodeIds: ['checkout-service', 'postgres-outbox', 'kafka-pipe'],
        activeConnectionIds: ['flow-checkout-db', 'flow-db-debezium', 'flow-debezium-kafka'],
        protocol: 'Event Pipeline',
        latencyEst: '15ms',
        description: 'Order event reaches Kafka partitioned queue successfully.',
        impactMetric: 'Event Queued: OK'
      },
      {
        step: 2,
        title: 'Payment Provider Gateway Timeout',
        activeNodeIds: ['payment-service'],
        activeConnectionIds: ['flow-kafka-payment'],
        protocol: 'REST / Timeout',
        latencyEst: '2500ms',
        description: 'External payment acquirer fails to respond within 2.5 second deadline.',
        impactMetric: 'HTTP Status: 504 Gateway Timeout'
      },
      {
        step: 3,
        title: 'Event Routing to Dead Letter Queue (DLQ)',
        activeNodeIds: ['payment-service', 'kafka-pipe'],
        activeConnectionIds: ['flow-payment-dlq'],
        protocol: 'DLQ Kafka Route',
        latencyEst: '2.1ms',
        description: 'Payment Service exhausts 3 retries and forwards failed event to payment-dlq topic.',
        impactMetric: 'DLQ Routed: 1 Event'
      },
      {
        step: 4,
        title: 'Compensating Inventory Rollback',
        activeNodeIds: ['kafka-pipe', 'inventory-service'],
        activeConnectionIds: ['flow-kafka-rollback'],
        protocol: 'Compensating Rollback',
        latencyEst: '6.4ms',
        description: 'Saga coordinator dispatches RollbackInventory event; reserved warehouse stock is atomically released.',
        impactMetric: 'Stock Drift: 0 Units'
      }
    ],
    nodeSpecs: {
      'checkout-service': {
        id: 'checkout-service',
        label: 'Checkout Orchestrator',
        sublabel: 'Kotlin / Spring Boot 3',
        role: 'Order Ingress & Saga Initiator',
        category: 'compute',
        technology: 'Kotlin 1.9, Spring Boot 3.3, Coroutines',
        concurrencyModel: 'Asynchronous Coroutine Dispatchers',
        p99Latency: '14.0ms',
        throughput: '18,000 req/s',
        resiliencePattern: 'Client Idempotency Key validation with distributed lease lock',
        targetSla: '99.99% Availability',
        deepDive: 'Receives checkout requests, validates stock locks, and executes atomic dual-table insertion into Orders and Outbox tables.'
      },
      'postgres-outbox': {
        id: 'postgres-outbox',
        label: 'PostgreSQL + Outbox',
        sublabel: 'Orders Table & Outbox Journal',
        role: 'Transactional System of Record',
        category: 'database',
        technology: 'PostgreSQL 16, pg_stat_statements',
        concurrencyModel: 'Read Committed / Repeatable Read Isolation',
        p99Latency: '9.8ms',
        throughput: '16,500 tx/s',
        resiliencePattern: 'Transactional Outbox eliminates dual-write race condition',
        targetSla: '99.999% Durability',
        deepDive: 'Stores orders and outbox event payloads within the identical database transaction, guaranteeing zero dual-write anomalies.'
      },
      'debezium-cdc': {
        id: 'debezium-cdc',
        label: 'Debezium CDC Connector',
        sublabel: 'Kafka Connect WAL Stream',
        role: 'Change Data Capture Engine',
        category: 'gateway',
        technology: 'Debezium 2.5, Kafka Connect Distributed',
        concurrencyModel: 'Dedicated WAL Log Miner Worker Thread',
        p99Latency: '4.2ms',
        throughput: '50,000 events/s',
        resiliencePattern: 'At-least-once delivery with persistent offset tracking in Kafka',
        targetSla: '99.99% Availability',
        deepDive: 'Extracts committed database transactions directly from PostgreSQL WAL logs without triggering SQL query execution load.'
      },
      'kafka-pipe': {
        id: 'kafka-pipe',
        label: 'Apache Kafka 3.6',
        sublabel: 'Partitioned Topic: order-events',
        role: 'Distributed Event Streaming Backbone',
        category: 'broker',
        technology: 'Apache Kafka 3.6, KRaft Consensus',
        concurrencyModel: 'Zero-Copy Sendfile with Multi-Lane Topic Partitions',
        p99Latency: '3.1ms',
        throughput: '120,000 msg/s',
        resiliencePattern: 'Min-ISR=2, Acks=all replication across 3 Availability Zones',
        targetSla: '99.999% Durability',
        deepDive: 'Partitions events by order_id hash. Guarantees FIFO message ordering per customer session without global serialization bottlenecks.'
      },
      'payment-service': {
        id: 'payment-service',
        label: 'Payment Service',
        sublabel: 'Acquirer Gateway Adapter',
        role: 'Saga Participant: Payment Settlement',
        category: 'compute',
        technology: 'Go 1.22, Stripe API, gRPC',
        concurrencyModel: 'Go Goroutines with Channel Multiplexing',
        p99Latency: '24.0ms',
        throughput: '8,500 tx/s',
        resiliencePattern: 'Dead Letter Queue routing with exponential backoff retries',
        targetSla: '99.95% Availability',
        deepDive: 'Settles payment authorizations with external payment gateways. Emits PaymentCompleted or PaymentFailed events to Kafka.'
      },
      'inventory-service': {
        id: 'inventory-service',
        label: 'Inventory Service',
        sublabel: 'Warehouse Stock Allocator',
        role: 'Saga Participant: Stock Reservation',
        category: 'compute',
        technology: 'Java 21, Spring Data JPA, Redis Cache',
        concurrencyModel: 'Virtual Thread Consumers',
        p99Latency: '8.5ms',
        throughput: '22,000 ops/s',
        resiliencePattern: 'Compensating transaction rollback on payment failure event',
        targetSla: '99.99% Availability',
        deepDive: 'Allocates and releases warehouse stock allocations. Supports idempotent compensating cancellations during distributed Saga aborts.'
      }
    }
  },

  'realtime-platform': {
    id: 'realtime-platform',
    title: 'Low-Latency Financial Tick Streaming Mesh',
    tagline: 'LMAX Disruptor RingBuffer, Redis Pub/Sub Shards, and Clustered WebSocket Distribution',
    subsystems: [
      {
        id: 'zone-exchange',
        label: 'MARKET FEED INGRESS ZONE',
        sublabel: 'UDP Multicast / FIX Feed',
        x: 25,
        y: 40,
        width: 200,
        height: 465,
        accentColor: '#38bdf8'
      },
      {
        id: 'zone-lmax',
        label: 'LMAX DISRUPTOR CORE',
        sublabel: 'Zero-GC Lock-Free RingBuffer',
        x: 245,
        y: 40,
        width: 225,
        height: 465,
        accentColor: '#10b981'
      },
      {
        id: 'zone-shards',
        label: 'REDIS PUB/SUB SHARDS',
        sublabel: 'Tick Fanout Shards',
        x: 490,
        y: 40,
        width: 205,
        height: 465,
        accentColor: '#f43f5e'
      },
      {
        id: 'zone-edge',
        label: 'EDGE WS GATEWAYS & CLIENTS',
        sublabel: 'Clustered Binary Stream',
        x: 715,
        y: 40,
        width: 220,
        height: 465,
        accentColor: '#a855f7'
      }
    ],
    failureModeTitle: 'Slow Consumer TCP Backpressure & Drop-Oldest Shed',
    failureModeDescription: 'Simulates client network saturation: Edge WebSocket gateway detects full TCP send buffer and drops stale market quotes to safeguard sub-2ms P99 SLA.',
    normalSteps: [
      {
        step: 1,
        title: 'UDP Multicast Tick Ingest',
        activeNodeIds: ['feed-ingest', 'lmax-disruptor'],
        activeConnectionIds: ['flow-feed-lmax'],
        protocol: 'UDP Multicast / NASDAQ ITCH',
        latencyEst: '0.2ms',
        description: 'Exchange sends high-frequency market quotes via UDP multicast; kernel bypass parses packets into memory.',
        impactMetric: 'Ingress Volume: 150,000 ticks/s'
      },
      {
        step: 2,
        title: 'Disruptor RingBuffer Sequencing',
        activeNodeIds: ['lmax-disruptor'],
        activeConnectionIds: [],
        protocol: 'Lock-Free Memory Barrier',
        latencyEst: '0.1ms',
        description: 'Pre-allocated 1M-slot ring buffer sequences tick entries using CPU cache line padding without garbage collection.',
        impactMetric: 'GC Pause Time: 0.0ms'
      },
      {
        step: 3,
        title: 'Redis Sharded Pub/Sub Broadcast',
        activeNodeIds: ['lmax-disruptor', 'redis-cluster'],
        activeConnectionIds: ['flow-lmax-redis'],
        protocol: 'Redis RESP Pub/Sub',
        latencyEst: '0.6ms',
        description: 'Disruptor publishes sorted quotes across memory-pinned Redis shards matching symbol hash keys.',
        impactMetric: 'Throughput: 150,000 ticks/s'
      },
      {
        step: 4,
        title: 'WebSocket Edge Distribution',
        activeNodeIds: ['redis-cluster', 'ws-gateways', 'client-terminals'],
        activeConnectionIds: ['flow-redis-ws', 'flow-ws-client'],
        protocol: 'Binary WebSocket Feed',
        latencyEst: '0.5ms',
        description: 'Netty WebSocket cluster streams delta quotes directly to institutional trader terminals.',
        impactMetric: 'End-to-End P99: 1.4ms'
      }
    ],
    failureSteps: [
      {
        step: 1,
        title: 'High-Frequency Ingest Sustained',
        activeNodeIds: ['feed-ingest', 'lmax-disruptor'],
        activeConnectionIds: ['flow-feed-lmax'],
        protocol: 'UDP Ingest',
        latencyEst: '0.2ms',
        description: 'Exchange ticks arrive at peak 180,000 ticks/second velocity.',
        impactMetric: 'Feed Ingest: 180k ticks/s'
      },
      {
        step: 2,
        title: 'Client TCP Socket Window Stalls',
        activeNodeIds: ['client-terminals', 'ws-gateways'],
        activeConnectionIds: ['flow-ws-client'],
        protocol: 'TCP Zero Window',
        latencyEst: '45ms',
        description: 'Slow client internet connection causes socket transmit buffer to saturate completely.',
        impactMetric: 'TCP Window: 0 Bytes'
      },
      {
        step: 3,
        title: 'Backpressure Drop-Oldest Frame Activation',
        activeNodeIds: ['ws-gateways'],
        activeConnectionIds: ['flow-ws-drop'],
        protocol: 'Drop-Oldest Policy',
        latencyEst: '0.1ms',
        description: 'WebSocket gateway discards intermediate tick frames and retains only the latest bid/ask snapshot.',
        impactMetric: 'Dropped Frames: 1,420 (Stale Quotes)'
      },
      {
        step: 4,
        title: 'P99 Latency Preserved for Fast Peers',
        activeNodeIds: ['lmax-disruptor', 'redis-cluster', 'ws-gateways'],
        activeConnectionIds: ['flow-lmax-redis', 'flow-redis-ws'],
        protocol: 'Active Protection',
        latencyEst: '1.4ms',
        description: 'Global system prevents queue explosion; all healthy trading desks continue receiving quotes at 1.4ms P99.',
        impactMetric: 'Healthy Desks P99: 1.4ms'
      }
    ],
    nodeSpecs: {
      'feed-ingest': {
        id: 'feed-ingest',
        label: 'Market Feed Ingest',
        sublabel: 'UDP Multicast / FIX Engine',
        role: 'Hardware Ingress & Kernel Bypass',
        category: 'ingress',
        technology: 'C++20, DPDK Kernel Bypass, Solarflare EF_VI',
        concurrencyModel: 'CPU-Pinned Poll Mode Drivers',
        p99Latency: '0.2ms',
        throughput: '250,000 msgs/s',
        resiliencePattern: 'Dual-feed A/B arbitration with automated packet deduplication',
        targetSla: '99.999% Availability',
        deepDive: 'Directly reads raw UDP multicast Ethernet packets from exchange feeds without Linux kernel network stack latency.'
      },
      'lmax-disruptor': {
        id: 'lmax-disruptor',
        label: 'LMAX RingBuffer',
        sublabel: 'Lock-Free Disruptor Core',
        role: 'Deterministic Tick Sequencer',
        category: 'compute',
        technology: 'Java 21, LMAX Disruptor 4.0, Unsafe Memory',
        concurrencyModel: 'Single Producer / Multi Consumer Sequence Barriers',
        p99Latency: '0.1ms',
        throughput: '6,000,000 events/s',
        resiliencePattern: 'Zero Allocation, RingBuffer memory pre-allocation eliminates GC',
        targetSla: '99.999% Availability',
        deepDive: 'Lock-free circular ring buffer with power-of-two slot sizing. Uses cache line padding to eliminate false sharing between CPU cores.'
      },
      'redis-cluster': {
        id: 'redis-cluster',
        label: 'Redis Pub/Sub Shards',
        sublabel: 'In-Memory Distribution Mesh',
        role: 'Tick Fanout & Multiplexing',
        category: 'cache',
        technology: 'Redis 7.2 Cluster, Unix Domain Sockets',
        concurrencyModel: 'Multi-Shard Event Loop',
        p99Latency: '0.6ms',
        throughput: '220,000 msgs/s',
        resiliencePattern: 'In-memory ephemeral fanout without disk persistence overhead',
        targetSla: '99.99% Availability',
        deepDive: 'Dispatches real-time ticker updates across symbol shards. Decouples core sequencing from edge WebSocket gateway delivery.'
      },
      'ws-gateways': {
        id: 'ws-gateways',
        label: 'WebSocket Edge Cluster',
        sublabel: 'Netty WebSocket Epoll Nodes',
        role: 'Edge Protocol Delivery',
        category: 'gateway',
        technology: 'Netty 4.1, Java 21, Epoll Transport',
        concurrencyModel: 'Non-blocking I/O Event Loops',
        p99Latency: '0.5ms',
        throughput: '150,000 ticks/s',
        resiliencePattern: 'Drop-oldest frame backpressure shed for slow TCP clients',
        targetSla: '99.99% Availability',
        deepDive: 'Maintains 50,000 concurrent long-lived binary WebSocket connections with custom delta compression.'
      },
      'client-terminals': {
        id: 'client-terminals',
        label: 'Trading Desks',
        sublabel: 'Institutional Client Terminals',
        role: 'Presentation & Trade Execution',
        category: 'ingress',
        technology: 'Electron, WebAssembly, SharedArrayBuffer',
        concurrencyModel: 'Web Workers with OffscreenCanvas',
        p99Latency: '1.4ms',
        throughput: '150,000 ticks/s',
        resiliencePattern: 'Auto-reconnect with sequence replay validation',
        targetSla: '99.99% Availability',
        deepDive: 'Renders millisecond order book ladders and candle charts directly via WebGL and WebAssembly.'
      }
    }
  },

  'fintech-gateway': {
    id: 'fintech-gateway',
    title: 'PCI-DSS Double-Entry Ledger & Tokenization Vault',
    tagline: 'mTLS Zero-Trust Ingress, AWS KMS Envelope Tokenization, and SERIALIZABLE Isolation',
    subsystems: [
      {
        id: 'zone-pci',
        label: 'PCI-DSS SCOPE INGRESS',
        sublabel: 'mTLS Hardware Termination',
        x: 25,
        y: 40,
        width: 200,
        height: 465,
        accentColor: '#38bdf8'
      },
      {
        id: 'zone-kms',
        label: 'HSM / AWS KMS VAULT',
        sublabel: 'FIPS 140-3 Hardware Boundary',
        x: 245,
        y: 40,
        width: 225,
        height: 465,
        accentColor: '#10b981'
      },
      {
        id: 'zone-ledger',
        label: 'ATOMIC CONCURRENCY TIER',
        sublabel: 'Double-Entry Invariant Core',
        x: 490,
        y: 40,
        width: 205,
        height: 465,
        accentColor: '#f59e0b'
      },
      {
        id: 'zone-db',
        label: 'IMMUTABLE LEDGER DB (SERIALIZABLE)',
        sublabel: 'Append-Only Hash Journal',
        x: 715,
        y: 40,
        width: 220,
        height: 465,
        accentColor: '#a855f7'
      }
    ],
    failureModeTitle: 'Concurrent Lock Contention & Jittered Idempotent Retry',
    failureModeDescription: 'Simulates simultaneous transaction attempts on identical account: Redis Redlock detects contention, triggering exponential jitter retry without duplicate journal creation.',
    normalSteps: [
      {
        step: 1,
        title: 'Banking Client mTLS Ingress',
        activeNodeIds: ['banking-ingress', 'kms-vault'],
        activeConnectionIds: ['flow-ingress-kms'],
        protocol: 'mTLS 1.3 / X.509',
        latencyEst: '14.2ms',
        description: 'Banking partner submits transaction instruction verified by strict mutual TLS and client certificate chain.',
        impactMetric: 'Auth Check: Cryptographic Pass'
      },
      {
        step: 2,
        title: 'AWS KMS Envelope Tokenization',
        activeNodeIds: ['kms-vault', 'redis-redlock'],
        activeConnectionIds: ['flow-kms-redlock'],
        protocol: 'KMS AES-GCM-256',
        latencyEst: '12.0ms',
        description: 'AWS KMS Hardware Security Module generates Data Encryption Key (DEK) to tokenize card PAN within memory boundary.',
        impactMetric: 'FIPS Standard: 140-3 Validated'
      },
      {
        step: 3,
        title: 'Distributed Redlock Acquisition',
        activeNodeIds: ['redis-redlock', 'ledger-core'],
        activeConnectionIds: ['flow-redlock-ledger'],
        protocol: 'Redis Redlock Lease',
        latencyEst: '2.4ms',
        description: 'Acquires atomic distributed lock on debited and credited account identifiers with 50ms lease window.',
        impactMetric: 'Lock Status: GRANTED'
      },
      {
        step: 4,
        title: 'Double-Entry Invariant & Immutable Commit',
        activeNodeIds: ['ledger-core', 'postgres-ledger'],
        activeConnectionIds: ['flow-ledger-postgres'],
        protocol: 'SERIALIZABLE Isolation',
        latencyEst: '16.8ms',
        description: 'Validates debits equal credits; executes immutable append-only insert with SHA-256 integrity hash.',
        impactMetric: 'Audit Trail: 100% Cryptographic'
      }
    ],
    failureSteps: [
      {
        step: 1,
        title: 'Simultaneous Payment Requests Submitted',
        activeNodeIds: ['banking-ingress'],
        activeConnectionIds: [],
        protocol: 'Concurrent mTLS',
        latencyEst: '14ms',
        description: 'Two separate checkout sessions target identical account concurrently within the same 5ms window.',
        impactMetric: 'Concurrency: 2 Requests'
      },
      {
        step: 2,
        title: 'Redlock Lock Contention Detected',
        activeNodeIds: ['redis-redlock'],
        activeConnectionIds: [],
        protocol: 'Redlock Conflict',
        latencyEst: '1.8ms',
        description: 'Redis distributed lock identifies active lock held on the account ID; second request is safely held.',
        impactMetric: 'Lock Conflict: 1 Rejected'
      },
      {
        step: 3,
        title: 'Idempotent Retry with Exponential Jitter',
        activeNodeIds: ['ledger-core', 'redis-redlock'],
        activeConnectionIds: ['flow-ledger-retry'],
        protocol: 'UUIDv7 Jitter Loop',
        latencyEst: '24ms',
        description: 'Engine computes 24ms randomized jitter sleep and retries lock acquisition with identical idempotency token.',
        impactMetric: 'Double-Spend Risk: ZERO'
      },
      {
        step: 4,
        title: 'Clean Sequential Commit Without Duplicate',
        activeNodeIds: ['ledger-core', 'postgres-ledger'],
        activeConnectionIds: ['flow-ledger-postgres'],
        protocol: 'Sequential Commit',
        latencyEst: '15.4ms',
        description: 'First transaction releases lock; retry acquires lock cleanly and commits single balanced journal entry.',
        impactMetric: 'Duplicate Entries: 0'
      }
    ],
    nodeSpecs: {
      'banking-ingress': {
        id: 'banking-ingress',
        label: 'mTLS Banking Ingress',
        sublabel: 'Zero-Trust Perimeter Shield',
        role: 'Hardware mTLS Termination',
        category: 'security',
        technology: 'Envoy Proxy, OpenSSL 3.2, HSM Cert Store',
        concurrencyModel: 'Async Event Driven',
        p99Latency: '14.2ms',
        throughput: '12,000 req/s',
        resiliencePattern: 'Strict mTLS certificate pinning and IP rate filtering',
        targetSla: '99.999% Availability',
        deepDive: 'Terminates mutual TLS 1.3 connections from institutional banking partners using dedicated hardware-backed certificates.'
      },
      'kms-vault': {
        id: 'kms-vault',
        label: 'AWS KMS Vault / HSM',
        sublabel: 'Envelope Tokenization Module',
        role: 'Cryptographic Key Management',
        category: 'security',
        technology: 'AWS KMS, CloudHSM, FIPS 140-3 Level 3',
        concurrencyModel: 'Hardware Parallel Crypto Accelerators',
        p99Latency: '12.0ms',
        throughput: '10,000 ops/s',
        resiliencePattern: 'Automated Multi-Region Key Replication',
        targetSla: '99.999% Availability',
        deepDive: 'Generates ephemeral 256-bit Data Encryption Keys (DEKs) for envelope tokenization of sensitive payment payloads.'
      },
      'redis-redlock': {
        id: 'redis-redlock',
        label: 'Redis Redlock Cluster',
        sublabel: 'Distributed Mutex Quorum',
        role: 'Atomic Concurrency Coordinator',
        category: 'cache',
        technology: 'Redis 7.2, Redlock Algorithm, 5-Node Quorum',
        concurrencyModel: 'Distributed Consensus Mutex',
        p99Latency: '2.4ms',
        throughput: '45,000 locks/s',
        resiliencePattern: 'Time-bounded auto-releasing lease timers prevent deadlocks',
        targetSla: '99.999% Availability',
        deepDive: 'Acquires distributed locks across 5 independent Redis master instances before allowing balance modifications.'
      },
      'ledger-core': {
        id: 'ledger-core',
        label: 'Ledger Core Engine',
        sublabel: 'Double-Entry Invariant Verifier',
        role: 'Financial Balance Reconciliation',
        category: 'compute',
        technology: 'Rust 1.78, Tokio Async, SQLx',
        concurrencyModel: 'Lock-Free Work Stealing Tokio Runtime',
        p99Latency: '4.2ms',
        throughput: '28,000 tx/s',
        resiliencePattern: 'Idempotency validation with UUIDv7 collision defense',
        targetSla: '99.999% Durability',
        deepDive: 'Verifies accounting balance invariants (Sum of Debits == Sum of Credits) with strict mathematical precision.'
      },
      'postgres-ledger': {
        id: 'postgres-ledger',
        label: 'Immutable Ledger DB',
        sublabel: 'SERIALIZABLE Append-Only Journal',
        role: 'Financial System of Record',
        category: 'database',
        technology: 'PostgreSQL 16, pg_cron, SHA-256 Hash Chain',
        concurrencyModel: 'SERIALIZABLE Isolation (SSI) via Predicate Locks',
        p99Latency: '16.8ms',
        throughput: '12,500 tx/s',
        resiliencePattern: 'SSI transaction serialization failure retry with jitter',
        targetSla: '99.999% Durability',
        deepDive: 'Operates under SERIALIZABLE isolation to guarantee absence of write skews. Append-only journal with cryptographic hash chain.'
      }
    }
  },
  'agentic-mcp-mesh': {
    id: 'agentic-mcp-mesh',
    title: 'Autonomous Agentic Orchestrator & MCP Mesh',
    tagline: 'LangGraph ReAct DAG Checkpointing, Java 21 LTS MCP Tool Gateway, and pgvector HNSW Episodic Memory',
    subsystems: [
      {
        id: 'zone-agents',
        label: 'AUTONOMOUS AGENT ORCHESTRATION',
        sublabel: 'ReAct DAG State Machine',
        x: 25,
        y: 40,
        width: 220,
        height: 465,
        accentColor: '#34d399'
      },
      {
        id: 'zone-mcp',
        label: 'MODEL CONTEXT PROTOCOL (MCP) BUS',
        sublabel: 'JSON-RPC 2.0 Stdio / SSE Transport',
        x: 265,
        y: 40,
        width: 240,
        height: 465,
        accentColor: '#ec4899'
      },
      {
        id: 'zone-tools',
        label: 'TOOL WORKERS & PERSISTENCE TIER',
        sublabel: 'Ephemeral Sandboxes & Memory Store',
        x: 525,
        y: 40,
        width: 410,
        height: 465,
        accentColor: '#38bdf8'
      }
    ],
    normalSteps: [
      {
        step: 1,
        title: 'Goal Ingestion & LangGraph DAG Plan Decomposition',
        activeNodeIds: ['langgraph-agent'],
        activeConnectionIds: ['flow-agent-vdb'],
        protocol: 'ReAct DAG / Prompt Decomposition',
        latencyEst: '320ms',
        description: 'User prompt is parsed into an acyclic plan of sub-tasks with hard step budgets.',
        impactMetric: 'Zero infinite recursion loops'
      },
      {
        step: 2,
        title: 'Semantic Tool Discovery via pgvector HNSW Index',
        activeNodeIds: ['langgraph-agent', 'pgvector-memory'],
        activeConnectionIds: ['flow-agent-vdb'],
        protocol: 'pgvector Cosine (1536d Float32)',
        latencyEst: '12ms',
        description: 'Dynamically retrieves relevant tool schemas matching sub-task intent, slashing context tokens by 76%.',
        impactMetric: '76% context token reduction'
      },
      {
        step: 3,
        title: 'MCP Handshake & JSON-RPC 2.0 Wire Dispatch',
        activeNodeIds: ['langgraph-agent', 'mcp-gateway'],
        activeConnectionIds: ['flow-agent-mcp'],
        protocol: 'JSON-RPC 2.0 over Stdio / SSE',
        latencyEst: '3.8ms',
        description: 'Dispatches typed tool calls to Java 21 MCP server without exposing ambient infrastructure credentials.',
        impactMetric: '0 ambient secrets exposed'
      },
      {
        step: 4,
        title: 'Ephemeral Docker Container Sandbox Execution',
        activeNodeIds: ['mcp-gateway', 'docker-sandbox'],
        activeConnectionIds: ['flow-mcp-sandbox'],
        protocol: 'gVisor Container / Linux cgroups',
        latencyEst: '68ms',
        description: 'Executes verified command inside disposable container with 512MB RAM and 30s watchdog.',
        impactMetric: '100% memory containment'
      },
      {
        step: 5,
        title: 'Observation Ingestion & Redis 7.2 State Checkpoint',
        activeNodeIds: ['docker-sandbox', 'redis-checkpointer', 'langgraph-agent'],
        activeConnectionIds: ['flow-sandbox-redis'],
        protocol: 'Redis Raft / Mutex Checkpoint',
        latencyEst: '8.4ms',
        description: 'Tool exit output verified against invariants; agent loop advances to next step or emits final answer.',
        impactMetric: '94.8% first-pass completion'
      }
    ],
    failureSteps: [
      {
        step: 1,
        title: 'Downstream MCP Server Returns HTTP 429 Too Many Requests',
        activeNodeIds: ['mcp-gateway'],
        activeConnectionIds: ['flow-agent-mcp'],
        protocol: 'HTTP/2 429 Rate Limit',
        latencyEst: '45ms',
        description: 'Downstream tool API rate limit hit during burst autonomous analysis.',
        impactMetric: '429 Rate limit detected'
      },
      {
        step: 2,
        title: 'Token Bucket Rate Limiter Trips Circuit Breaker',
        activeNodeIds: ['mcp-gateway', 'redis-checkpointer'],
        activeConnectionIds: ['flow-agent-mcp'],
        protocol: 'Circuit Breaker OPEN',
        latencyEst: '1.2ms',
        description: 'MCP gateway isolates failing server and routes requests to fallback buffer in Redis.',
        impactMetric: 'Zero workflow crashes'
      },
      {
        step: 3,
        title: 'Exponential Backoff Retries & Smooth Buffer Drain',
        activeNodeIds: ['mcp-gateway', 'docker-sandbox'],
        activeConnectionIds: ['flow-mcp-sandbox'],
        protocol: 'Exponential Backoff with Jitter',
        latencyEst: '350ms',
        description: 'Pending tool calls successfully execute as downstream rate limits recover.',
        impactMetric: '100% task recovery SLA'
      }
    ],
    failureModeTitle: 'Downstream MCP Rate Limit & Circuit Breaker Backpressure',
    failureModeDescription: 'Simulates API rate limit exhaustion on external tool servers. The Java 21 MCP Gateway activates token-bucket throttling and queues tool calls into a Redis backoff buffer without dropping agent workflow state.',
    nodeSpecs: {
      'langgraph-agent': {
        id: 'langgraph-agent',
        label: 'LangGraph ReAct Agent',
        sublabel: 'Acyclic DAG State Machine',
        role: 'Autonomous Agent Orchestration',
        category: 'compute',
        technology: 'Python 3.12, LangGraph, Java 21 Spring AI',
        concurrencyModel: 'Async Event Loop with Redis Checkpointing',
        p99Latency: '320ms',
        throughput: '1,200 agent loops/s',
        resiliencePattern: 'Acyclic DAG validation prevents infinite recursion',
        targetSla: '99.99% Availability',
        deepDive: 'Decomposes complex engineering goals into verifiable DAG sub-steps with hard cost ceilings.'
      },
      'pgvector-memory': {
        id: 'pgvector-memory',
        label: 'pgvector Episodic Memory',
        sublabel: 'HNSW Semantic Vector Index',
        role: 'Dynamic Tool & Memory Discovery',
        category: 'database',
        technology: 'PostgreSQL 16, pgvector (1536d Float32)',
        concurrencyModel: 'HNSW Beam-Search Graph Traversal (M=16, ef=64)',
        p99Latency: '11.8ms',
        throughput: '6,500 queries/s',
        resiliencePattern: 'Read-replica pooling with hot-standby promotion',
        targetSla: '99.99% Durability',
        deepDive: 'Indexes declared tool schemas and past agent episodic experiences for sub-15ms semantic matching.'
      },
      'mcp-gateway': {
        id: 'mcp-gateway',
        label: 'Java 21 MCP Gateway',
        sublabel: 'JSON-RPC 2.0 Stdio / SSE Transport',
        role: 'Decoupled Tool Protocol Bus',
        category: 'gateway',
        technology: 'Java 21 LTS, Spring Boot 3, GraalVM Native Image',
        concurrencyModel: 'Virtual Threads (Project Loom) per connection',
        p99Latency: '3.8ms',
        throughput: '35,000 rpc/s',
        resiliencePattern: 'Resilience4j Circuit Breaker & Token Bucket Limiter',
        targetSla: '99.999% Availability',
        deepDive: 'Stateless protocol bus implementing Anthropic Model Context Protocol specification with zero ambient credentials.'
      },
      'docker-sandbox': {
        id: 'docker-sandbox',
        label: 'Docker Tool Sandbox',
        sublabel: 'Ephemeral Container Worker',
        role: 'Isolated Command Execution',
        category: 'compute',
        technology: 'Docker, gVisor Runsc, Linux cgroups v2',
        concurrencyModel: 'Ephemeral disposable container per task',
        p99Latency: '68ms',
        throughput: '450 sandboxes/s',
        resiliencePattern: 'cgroups v2 512MB RAM limit + 30s SIGKILL watchdog',
        targetSla: '99.99% Isolation',
        deepDive: 'Runs potentially destructive operations inside isolated containers with strictly restricted network namespaces.'
      },
      'redis-checkpointer': {
        id: 'redis-checkpointer',
        label: 'Redis State Store',
        sublabel: 'Acyclic DAG Checkpointer',
        role: 'Workflow State Persistence',
        category: 'cache',
        technology: 'Redis 7.2 Cluster, Redis Raft Checkpoints',
        concurrencyModel: 'Single-Threaded Event Loop with In-Memory Pipelining',
        p99Latency: '1.4ms',
        throughput: '85,000 ops/s',
        resiliencePattern: 'AOF persistence with fsync every second',
        targetSla: '99.999% Availability',
        deepDive: 'Persists active agent workflow state machine checkpoints, enabling pause, resume, and human-in-the-loop approvals.'
      }
    }
  }
}
