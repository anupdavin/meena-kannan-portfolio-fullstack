export interface ArchitecturalDecisionRecord {
  id: string
  title: string
  status: 'Accepted' | 'Implemented' | 'Superseded'
  date: string
  context: string
  decision: string
  consequences: {
    positive: string[]
    negative: string[]
  }
  pattern: string
  affectedSystems: string[]
}

export const ARCHITECTURAL_DECISIONS: ArchitecturalDecisionRecord[] = [
  {
    id: 'ADR-001',
    title: 'Choreographed Saga Pattern for Distributed Payments Settlement',
    status: 'Accepted',
    date: '2024-03-15',
    context: 'Synchronous two-phase commit (2PC) across multi-region microservices created blocking database locks, driving P99 latencies past 850ms and risking cascading outages during network partitions.',
    decision: 'Adopt an asynchronous choreographed saga coordinated through Apache Kafka partition keys. Each participant executes a local ACID transaction and emits domain events with compensating rollback handlers for failed stages.',
    consequences: {
      positive: [
        'Eliminated cross-service database locks and cut P99 settlement latency from 850ms to 78ms.',
        'High horizontal scalability with independent service deployments.',
        'Guaranteed eventual consistency with automated compensating refund events.'
      ],
      negative: [
        'Increased cognitive complexity for debugging distributed transaction states across event logs.',
        'Requires strict consumer idempotency via unique idempotency keys.'
      ]
    },
    pattern: 'Distributed Saga Pattern',
    affectedSystems: ['Payment Gateway', 'Ledger Service', 'Notification Pipeline']
  },
  {
    id: 'ADR-002',
    title: 'Transactional Outbox with Debezium CDC for Kafka Event Streaming',
    status: 'Accepted',
    date: '2024-06-20',
    context: 'Dual-write vulnerability between PostgreSQL order records and Kafka event publications caused message loss and phantom events whenever network disconnects occurred mid-execution.',
    decision: 'Implement the Transactional Outbox pattern. Orders and domain events are committed atomically to a single PostgreSQL ACID transaction. Debezium tails PostgreSQL Write-Ahead Logs (WAL) via logical replication to stream events reliably into Kafka.',
    consequences: {
      positive: [
        'Guaranteed at-least-once message delivery with zero dual-write race conditions.',
        'Zero impact on API response latency as event publishing is detached from request threads.',
        'Auditable persistence of all domain state changes in PostgreSQL outbox table.'
      ],
      negative: [
        'Requires managing Debezium Kafka Connect infrastructure and monitoring WAL replication lag.',
        'Requires downstream consumers to implement deduplication mechanisms.'
      ]
    },
    pattern: 'Transactional Outbox (CDC)',
    affectedSystems: ['Order Management', 'Inventory Service', 'Kafka Infrastructure']
  },
  {
    id: 'ADR-003',
    title: 'Java 21 Virtual Threads (Project Loom) for High-Concurrency Microservices',
    status: 'Accepted',
    date: '2024-09-10',
    context: 'Traditional platform OS threads exhausted memory under 10,000 concurrent I/O connections. Reactive WebFlux resolved scaling but incurred steep debugging curves, lost stack traces, and third-party blocking library friction.',
    decision: 'Standardize enterprise microservices on Java 21 LTS with Virtual Threads (Project Loom) and Spring Boot 3. Use thread-per-request concurrency while virtual threads unmount during blocking database and network calls.',
    consequences: {
      positive: [
        'Supported 10,000+ concurrent requests on standard ECS Fargate containers with minimal RAM footprint.',
        'Preserved synchronous, readable code flow and native stack traces for APM diagnostics.',
        'Full compatibility with standard JDBC drivers and HikariCP connection pools.'
      ],
      negative: [
        'Careful audit required to prevent thread pinning on legacy synchronized blocks (replaced with ReentrantLock).',
        'Database connection pool limits remain the primary bottleneck rather than OS thread capacity.'
      ]
    },
    pattern: 'Virtual Threads Concurrency',
    affectedSystems: ['Core Banking Engine', 'Account APIs', 'Audit Log Service']
  },
  {
    id: 'ADR-004',
    title: 'Dual-Tier Caching: Local Caffeine L1 with Clustered Redis L2',
    status: 'Accepted',
    date: '2024-11-05',
    context: 'Hot-key subscription checks on high-traffic API routes overwhelmed Redis cluster nodes with 180,000 reads/sec, inducing latency spikes and network saturation.',
    decision: 'Introduce a two-tier caching topology: in-process Caffeine cache (L1, 30s TTL, single-flight stampede protection) backed by clustered Redis (L2, 10m TTL) with Redis Pub/Sub cache invalidation broadcasts.',
    consequences: {
      positive: [
        '92% reduction in Redis network I/O traffic with sub-1ms local L1 cache hits.',
        'Protected databases from thundering-herd stampedes during flash sales or cache expiry.',
        'Graceful degraded read fallback to L2 if local instance memory is reclaimed.'
      ],
      negative: [
        'Potential for short window (sub-second) L1 cache divergence across horizontally scaled pods.',
        'Added memory overhead on JVM heap for L1 cache allocations.'
      ]
    },
    pattern: 'Two-Tier Caching (L1/L2)',
    affectedSystems: ['Auth Token Validator', 'Tenant Subscription Service', 'API Gateway']
  },
  {
    id: 'ADR-005',
    title: 'Zero-Trust Envoy Edge Ingress with mTLS and Ephemeral SPIFFE Tokens',
    status: 'Accepted',
    date: '2025-01-18',
    context: 'Expanding multi-tenant infrastructure across AWS EKS and hybrid nodes required cryptographically verifiable identity boundaries without static API keys or hardcoded VPC peering rules.',
    decision: 'Deploy Envoy proxy perimeter with mutual TLS (mTLS) and SPIFFE/SPIRE workload identities. Route incoming requests through cryptographic token exchange and JWT claim authorization at the edge.',
    consequences: {
      positive: [
        'Eliminated long-lived service account secrets and hardcoded credentials across clusters.',
        'Granular zero-trust network policies enforceable at layer 7.',
        'Automated 24-hour cryptographic certificate rotation without connection termination.'
      ],
      negative: [
        'Sidecar CPU overhead on microservice pods (approx 1.5% compute overhead).',
        'Added operational complexity in managing SPIRE server control planes.'
      ]
    },
    pattern: 'Zero-Trust Mesh & Perimeter Shield',
    affectedSystems: ['Envoy Edge Gateway', 'Identity Service', 'Inter-Service Communication']
  },
  {
    id: 'ADR-006',
    title: 'Model Context Protocol (MCP) Standard for Enterprise AI Tool Integration',
    status: 'Accepted',
    date: '2025-04-02',
    context: 'Ad-hoc OpenAI function calling and proprietary agent schemas created fragmented integrations, vendor lock-in, and brittle maintenance overhead across autonomous internal workflows.',
    decision: 'Standardize all enterprise agent-to-tool connections on the open Model Context Protocol (MCP) over standardized JSON-RPC transports. Decouple LLM reasoning engines from backend data repositories.',
    consequences: {
      positive: [
        'Vendor-neutral schema allowing interchangeable use of Claude, Gemini, and open models.',
        'Clear separation of privileges: tools expose discrete, typed contracts with schema validation.',
        'Reusable tool servers for database querying, document retrieval, and CI execution.'
      ],
      negative: [
        'Requires protocol translation layers for non-JSON-RPC legacy enterprise services.',
        'Requires robust timeout and circuit-breaking controls on asynchronous tool RPCs.'
      ]
    },
    pattern: 'Model Context Protocol (JSON-RPC)',
    affectedSystems: ['AI Assistant Engine', 'Enterprise Knowledge Retriever', 'Developer CLI']
  }
]
