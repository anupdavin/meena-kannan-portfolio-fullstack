export interface ArchitectureNode {
  id: string
  label: string
  sublabel: string
  role: string
  category: 'client' | 'gateway' | 'compute' | 'cache' | 'event' | 'database' | 'security' | 'external'
  x: number // SVG X coordinate (0-800)
  y: number // SVG Y coordinate (0-440)
  width: number
  height: number
  color: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue' | 'teal'
  iconName: string
  protocol: string
  techBadge: string
  metricLabel: string
  metricValue: string
  specs: {
    technology: string
    concurrencyModel: string
    resiliencePattern: string
    disasterRecovery: string
    targetSla: string
    deepDive: string
  }
}

export interface ArchitectureEdge {
  id: string
  from: string
  to: string
  pathD: string // SVG bezier curve
  label: string
  protocol: string
  activeInSteps: number[]
}

export interface StepFlow {
  stepNumber: number
  title: string
  sourceNodeId: string
  targetNodeId: string
  payloadTag: string
  detailedExplanation: string
  impactMetric: string
  latencyEst: string
}

export interface ChaosScenario {
  id: string
  name: string
  scenarioDescription: string
  triggerStep: number
  affectedNodeId: string
  resilientOutcome: string
  recoveryBadge: string
}

export interface ArchitectureSystem {
  id: string
  projectId: string
  title: string
  tagline: string
  viewBox: string
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
  steps: StepFlow[]
  chaosScenarios: ChaosScenario[]
}

export const ARCHITECTURE_SYSTEMS: Record<string, ArchitectureSystem> = {
  'saas-platform': {
    id: 'saas-platform',
    projectId: 'saas-platform',
    title: 'Enterprise Multi-Tenant SaaS Architecture',
    tagline: 'Clean Architecture with Strict Tenant Isolation, JWT/OAuth2, and Sub-80ms Latency',
    viewBox: '0 0 820 440',
    nodes: [
      {
        id: 'saas-client',
        label: 'React 19 Client',
        sublabel: 'Enterprise SPA / Mobile',
        role: 'Client & Presentation Layer',
        category: 'client',
        x: 40,
        y: 180,
        width: 140,
        height: 70,
        color: 'cyan',
        iconName: 'Laptop',
        protocol: 'HTTPS / TLS 1.3',
        techBadge: 'React 19 + TS',
        metricLabel: 'P99 TTFB',
        metricValue: '< 65ms',
        specs: {
          technology: 'React 19 SPA, TypeScript, Vite, TanStack Query',
          concurrencyModel: 'Concurrent Mode, Optimistic Mutations, Virtualized Render Lists',
          resiliencePattern: 'Automatic token refresh with exponential backoff on network drop',
          disasterRecovery: 'Client-side offline state persistence & optimistic rollback on 5xx',
          targetSla: '99.99% Availability',
          deepDive: 'Dispatches authenticated REST requests with signed JWT bearer tokens and tenant context headers.'
        }
      },
      {
        id: 'saas-gateway',
        label: 'Spring Cloud Gateway',
        sublabel: 'Ingress & Rate Limiter',
        role: 'API Perimeter & Routing',
        category: 'gateway',
        x: 230,
        y: 180,
        width: 150,
        height: 70,
        color: 'emerald',
        iconName: 'Shield',
        protocol: 'HTTP/2 :8080',
        techBadge: 'Spring Cloud',
        metricLabel: 'Throughput',
        metricValue: '15,000 RPS',
        specs: {
          technology: 'Spring Cloud Gateway, Netty Reactive Engine, Token Bucket Filter',
          concurrencyModel: 'Event-loop non-blocking I/O with Project Reactor',
          resiliencePattern: 'Tenant-aware rate limiting (100 req/sec per tenant), IP reputation screening',
          disasterRecovery: 'Graceful circuit breaking via Resilience4j to static fallback responses',
          targetSla: '99.999% Ingress Uptime',
          deepDive: 'Terminates TLS 1.3, extracts tenant_id from JWT claims, and enforces tenant token-bucket rate limits.'
        }
      },
      {
        id: 'saas-auth',
        label: 'Auth & RBAC Vault',
        sublabel: 'OAuth2 / Stateless JWT',
        role: 'Security & Identity Broker',
        category: 'security',
        x: 230,
        y: 50,
        width: 150,
        height: 65,
        color: 'purple',
        iconName: 'KeyRound',
        protocol: 'OIDC / JWKS',
        techBadge: 'Spring Security',
        metricLabel: 'Verify Time',
        metricValue: '< 0.5ms',
        specs: {
          technology: 'Spring Security 6, OAuth2 Resource Server, Nimbus Jose JWT',
          concurrencyModel: 'Stateless cryptographic verification using cached JWKS RSA public keys',
          resiliencePattern: 'Self-contained signed claims; zero database lookup needed for token validation',
          disasterRecovery: 'Fallback to secondary IdP keystore upon rotation mismatch',
          targetSla: '100% RBAC Isolation',
          deepDive: 'Verifies asymmetric RSA-256 signatures, unpacks tenant permissions, and rejects forged claims.'
        }
      },
      {
        id: 'saas-core',
        label: 'Core SaaS App Layer',
        sublabel: 'Clean Arch / Virtual Threads',
        role: 'Domain Business Logic',
        category: 'compute',
        x: 430,
        y: 180,
        width: 160,
        height: 70,
        color: 'blue',
        iconName: 'Cpu',
        protocol: 'Java 21 Loom',
        techBadge: 'Spring Boot 3',
        metricLabel: 'Exec Time',
        metricValue: '< 18ms',
        specs: {
          technology: 'Java 21, Spring Boot 3, Clean Architecture (DDD), Project Loom',
          concurrencyModel: 'Virtual Threads (Project Loom) handling 10,000+ simultaneous requests without thread starvation',
          resiliencePattern: 'ThreadLocal scoped TenantContextHolder with mandatory cleanup filters',
          disasterRecovery: 'Graceful container restart under Kubernetes with blue-green rolling deploys',
          targetSla: '99.99% Availability',
          deepDive: 'Executes use-case command handlers, enforces domain invariants, and sets tenant-isolated queries.'
        }
      },
      {
        id: 'saas-cache',
        label: 'Redis Cache Cluster',
        sublabel: 'Tenant-Prefixed Keys',
        role: 'Distributed In-Memory Cache',
        category: 'cache',
        x: 430,
        y: 330,
        width: 160,
        height: 65,
        color: 'rose',
        iconName: 'Zap',
        protocol: 'RESP3 :6379',
        techBadge: 'Redis 7 Cluster',
        metricLabel: 'Hit Ratio',
        metricValue: '94.6%',
        specs: {
          technology: 'Redis 7 Cluster, Redis Enterprise, Lettuce driver with connection pool',
          concurrencyModel: 'In-memory single-threaded reactor with asynchronous multiplexing',
          resiliencePattern: 'Tenant-isolated keyspaces (`tenant:{id}:projects:{uuid}`) with 300s sliding TTL',
          disasterRecovery: 'Master-replica automatic sentinel failover in < 2 seconds',
          targetSla: '< 1ms Read P99',
          deepDive: 'Eliminates repetitive database lookups, providing sub-millisecond cached project and metadata retrieval.'
        }
      },
      {
        id: 'saas-db',
        label: 'Multi-Tenant PostgreSQL',
        sublabel: 'Row-Level Security (RLS)',
        role: 'Persistent Relational Store',
        category: 'database',
        x: 640,
        y: 180,
        width: 150,
        height: 70,
        color: 'amber',
        iconName: 'Database',
        protocol: 'pg_wire / JDBC',
        techBadge: 'PostgreSQL 16',
        metricLabel: 'ACID SLA',
        metricValue: '99.999%',
        specs: {
          technology: 'PostgreSQL 16, HikariCP Connection Pool, Flyway Database Migrations',
          concurrencyModel: 'MVCC multi-version concurrency control with Read Committed isolation',
          resiliencePattern: 'PostgreSQL Row-Level Security (RLS) enforcing `tenant_id = current_setting(...)` at the database kernel',
          disasterRecovery: 'Continuous WAL streaming replication to multi-AZ hot standby replica',
          targetSla: 'Zero Data Leakage',
          deepDive: 'Guarantees 100% cryptographic tenant boundary enforcement directly in the database kernel.'
        }
      },
      {
        id: 'saas-audit',
        label: 'Flyway & Audit Logger',
        sublabel: 'Immutable Audit Trail',
        role: 'Compliance & Schema Ops',
        category: 'security',
        x: 640,
        y: 330,
        width: 150,
        height: 65,
        color: 'teal',
        iconName: 'FileCheck',
        protocol: 'JDBC Hook',
        techBadge: 'Flyway + JPA',
        metricLabel: 'Audit SLA',
        metricValue: '100% SOC2',
        specs: {
          technology: 'Flyway Versioned Migrations, Spring Data JPA Entity Audit Listeners',
          concurrencyModel: 'Asynchronous event listeners publishing to immutable append-only audit tables',
          resiliencePattern: 'Zero-downtime blue/green schema evolution with backward-compatible migrations',
          disasterRecovery: 'WORM (Write Once Read Many) replicated audit storage',
          targetSla: '100% Audit Traceability',
          deepDive: 'Records every create/update action with tenant identifier, operator principal, and cryptographic checksum.'
        }
      }
    ],
    edges: [
      { id: 'e1', from: 'saas-client', to: 'saas-gateway', pathD: 'M 180 215 C 200 215, 210 215, 230 215', label: 'HTTPS / TLS 1.3', protocol: 'REST', activeInSteps: [1, 6] },
      { id: 'e2', from: 'saas-gateway', to: 'saas-auth', pathD: 'M 305 180 C 305 150, 305 130, 305 115', label: 'Validate Token', protocol: 'JWKS', activeInSteps: [2] },
      { id: 'e3', from: 'saas-gateway', to: 'saas-core', pathD: 'M 380 215 C 400 215, 410 215, 430 215', label: 'Tenant Context', protocol: 'HTTP/2', activeInSteps: [3] },
      { id: 'e4', from: 'saas-core', to: 'saas-cache', pathD: 'M 510 250 C 510 280, 510 300, 510 330', label: 'L2 Cache Check', protocol: 'RESP3', activeInSteps: [4] },
      { id: 'e5', from: 'saas-core', to: 'saas-db', pathD: 'M 590 215 C 610 215, 620 215, 640 215', label: 'Tenant RLS Query', protocol: 'JDBC', activeInSteps: [5] },
      { id: 'e6', from: 'saas-db', to: 'saas-audit', pathD: 'M 715 250 C 715 280, 715 300, 715 330', label: 'Immutable Audit Log', protocol: 'Internal', activeInSteps: [5] }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Authenticated Ingress Request',
        sourceNodeId: 'saas-client',
        targetNodeId: 'saas-gateway',
        payloadTag: 'GET /api/v1/projects (Bearer JWT)',
        detailedExplanation: 'Client sends HTTPS request containing signed JWT bearer token and X-Tenant-ID header over TLS 1.3.',
        impactMetric: 'Latency < 12ms',
        latencyEst: '12ms'
      },
      {
        stepNumber: 2,
        title: 'Step 2: Stateless Token Verification & Rate Check',
        sourceNodeId: 'saas-gateway',
        targetNodeId: 'saas-auth',
        payloadTag: 'Verify JWT Claims (tenant: org_enterprise_4)',
        detailedExplanation: 'Spring Cloud Gateway checks the cached RSA JWKS keys, verifies the signature, and applies token-bucket rate limits.',
        impactMetric: 'Auth < 0.5ms',
        latencyEst: '0.5ms'
      },
      {
        stepNumber: 3,
        title: 'Step 3: Virtual Thread Dispatch & Tenant Scoping',
        sourceNodeId: 'saas-gateway',
        targetNodeId: 'saas-core',
        payloadTag: 'TenantContextHolder.set("org_4")',
        detailedExplanation: 'Request dispatched to Java 21 Project Loom Virtual Thread. Clean Architecture use-case handler initializes tenant scope.',
        impactMetric: 'Thread Init < 1ms',
        latencyEst: '1ms'
      },
      {
        stepNumber: 4,
        title: 'Step 4: Multi-Tier L2 Redis Cache Probe',
        sourceNodeId: 'saas-core',
        targetNodeId: 'saas-cache',
        payloadTag: 'HGET tenant:org_4:projects:list',
        detailedExplanation: 'Core service probes Redis with tenant-isolated key. On cache hit, returns in 0.8ms; on cache miss, cascades to DB.',
        impactMetric: 'Cache Hit 94.6%',
        latencyEst: '0.8ms'
      },
      {
        stepNumber: 5,
        title: 'Step 5: Kernel-Level PostgreSQL RLS Enforcement',
        sourceNodeId: 'saas-core',
        targetNodeId: 'saas-db',
        payloadTag: 'SET LOCAL app.current_tenant="org_4"',
        detailedExplanation: 'Hibernate sets tenant session variable. PostgreSQL Row-Level Security policy filters rows strictly for this tenant.',
        impactMetric: 'Zero Leakage Guarantee',
        latencyEst: '15ms'
      },
      {
        stepNumber: 6,
        title: 'Step 6: Write-Through Cache & Sanitized Response',
        sourceNodeId: 'saas-gateway',
        targetNodeId: 'saas-client',
        payloadTag: 'HTTP 200 OK [JSON Payload (sub-80ms)]',
        detailedExplanation: 'Data serialized into DTOs, written back to Redis with 300s TTL, and delivered to the client with sub-80ms total round-trip.',
        impactMetric: 'Total P99 < 78ms',
        latencyEst: '78ms'
      }
    ],
    chaosScenarios: [
      {
        id: 'chaos-redis-down',
        name: 'Simulate Redis Cache Failure',
        scenarioDescription: 'Simulates primary Redis node failure during high-load traffic.',
        triggerStep: 4,
        affectedNodeId: 'saas-cache',
        resilientOutcome: 'Resilience4j Circuit Breaker gracefully falls back directly to PostgreSQL read replicas. API response degrades by only 14ms with zero 500 errors.',
        recoveryBadge: 'Circuit Breaker Fallback Active'
      },
      {
        id: 'chaos-cross-tenant-probe',
        name: 'Simulate Cross-Tenant Injection Attempt',
        scenarioDescription: 'Simulates a malicious actor attempting to inject SQL to access another tenant data.',
        triggerStep: 5,
        affectedNodeId: 'saas-db',
        resilientOutcome: 'PostgreSQL Row-Level Security (RLS) kernel-level policy rejects the query with 0 rows returned. Instant security alert logged to SOC2 audit trail.',
        recoveryBadge: 'RLS Kernel Defense Blocked'
      }
    ]
  },

  'ecommerce-engine': {
    id: 'ecommerce-engine',
    projectId: 'ecommerce-engine',
    title: 'High-Throughput E-Commerce Microservices Engine',
    tagline: 'Event-Driven Apache Kafka Streaming, Redisson Distributed Locks, 10K+ RPS',
    viewBox: '0 0 820 440',
    nodes: [
      {
        id: 'ecom-traffic',
        label: 'Flash-Sale Ingress',
        sublabel: '10,000+ RPS Traffic Spike',
        role: 'Client Demand Generator',
        category: 'client',
        x: 40,
        y: 180,
        width: 140,
        height: 70,
        color: 'cyan',
        iconName: 'Users',
        protocol: 'HTTPS / HTTP/2',
        techBadge: '10K+ RPS',
        metricLabel: 'Peak Load',
        metricValue: '10,450 RPS',
        specs: {
          technology: 'Distributed global buyers hitting flash-sale checkout endpoints simultaneously',
          concurrencyModel: 'Massive parallel requests with strict ordering requirements per user session',
          resiliencePattern: 'Client-side jitter retry with exponential backoff',
          disasterRecovery: 'AWS CloudFront edge caching for static assets',
          targetSla: '99.99% Availability',
          deepDive: 'Generates intense traffic bursts where multiple buyers compete for identical inventory SKUs.'
        }
      },
      {
        id: 'ecom-alb',
        label: 'AWS ALB & K8s Ingress',
        sublabel: 'Layer 7 Load Balancer',
        role: 'Traffic Distribution',
        category: 'gateway',
        x: 220,
        y: 180,
        width: 150,
        height: 70,
        color: 'emerald',
        iconName: 'Layers',
        protocol: 'HTTP/2 :443',
        techBadge: 'AWS EKS ALB',
        metricLabel: 'HPA Trigger',
        metricValue: '12 -> 48 Pods',
        specs: {
          technology: 'AWS Application Load Balancer, Kubernetes Ingress Controller',
          concurrencyModel: 'Least outstanding requests algorithm across Kubernetes worker nodes',
          resiliencePattern: 'Horizontal Pod Autoscaler (HPA) triggering pod scaling at > 65% CPU threshold',
          disasterRecovery: 'Multi-AZ active-active deployment across 3 availability zones',
          targetSla: 'Zero Single Point of Failure',
          deepDive: 'Distributes raw HTTP/2 traffic smoothly to autoscaled Order Microservice pods.'
        }
      },
      {
        id: 'ecom-lock',
        label: 'Redisson Lock Mesh',
        sublabel: 'Distributed Mutex on SKU',
        role: 'Inventory Anti-Overselling Guard',
        category: 'security',
        x: 220,
        y: 50,
        width: 150,
        height: 65,
        color: 'rose',
        iconName: 'Lock',
        protocol: 'RESP3 / RedLock',
        techBadge: 'Redis 7 Cluster',
        metricLabel: 'Lock Acquire',
        metricValue: '< 0.8ms',
        specs: {
          technology: 'Redisson Client, Redis 7 In-Memory Cluster, RedLock Algorithm',
          concurrencyModel: 'Distributed spinlock with fair queuing (Wait: 3s, Lease TTL: 5s)',
          resiliencePattern: 'Automatic Watchdog lock renewal preventing deadlocks if a pod crashes while holding lock',
          disasterRecovery: 'Redis Sentinel automatic failover with multi-node quorum',
          targetSla: '0.00% Inventory Oversell',
          deepDive: 'Acquires distributed lock on SKU (`inventory:PRO-99`) ensuring exact physical inventory consistency.'
        }
      },
      {
        id: 'ecom-order',
        label: 'Order Microservice',
        sublabel: 'Transactional Outbox Pods',
        role: 'Order Ingestion & Saga Orchestrator',
        category: 'compute',
        x: 420,
        y: 180,
        width: 150,
        height: 70,
        color: 'blue',
        iconName: 'Server',
        protocol: 'Spring Boot 3',
        techBadge: 'Java 21 LTS',
        metricLabel: 'P99 Latency',
        metricValue: '< 42ms',
        specs: {
          technology: 'Java 21, Spring Boot 3, Spring Data JPA, Debezium CDC Connector',
          concurrencyModel: 'Reactive non-blocking controllers paired with Transactional Outbox pattern',
          resiliencePattern: 'Atomic DB write committing order and outbox record in a single transaction',
          disasterRecovery: 'Automatic pod rescheduling via Kubernetes self-healing daemon',
          targetSla: '100% Data Consistency',
          deepDive: 'Processes order command, locks inventory, commits local ACID transaction, and dispatches to Kafka.'
        }
      },
      {
        id: 'ecom-kafka',
        label: 'Apache Kafka Cluster',
        sublabel: 'Partitioned Event Bus',
        role: 'Asynchronous Event Backbone',
        category: 'event',
        x: 420,
        y: 330,
        width: 150,
        height: 65,
        color: 'purple',
        iconName: 'Share2',
        protocol: 'SASL_SSL :9092',
        techBadge: 'Kafka 3.7 KRaft',
        metricLabel: 'Event Lag',
        metricValue: '0 msgs',
        specs: {
          technology: 'Apache Kafka 3.7 with KRaft consensus (ZooKeeper-less), 12 partitions per topic',
          concurrencyModel: 'Log-based distributed append-only partitioning keyed by `order_id`',
          resiliencePattern: 'In-Sync Replicas (min.insync.replicas=2), acks=all for zero message loss',
          disasterRecovery: 'Cross-cluster MirrorMaker 2 active-passive replication to secondary AWS region',
          targetSla: '50,000+ msgs/sec',
          deepDive: 'Decouples order ingestion from downstream payment, inventory, and logistics consumers.'
        }
      },
      {
        id: 'ecom-consumers',
        label: 'Autonomous Consumers',
        sublabel: 'Payment, Inventory & Shipping',
        role: 'Decoupled Worker Services',
        category: 'compute',
        x: 630,
        y: 330,
        width: 160,
        height: 65,
        color: 'amber',
        iconName: 'Box',
        protocol: 'Kafka Consumer',
        techBadge: 'Spring Cloud Stream',
        metricLabel: 'Processing',
        metricValue: '< 15ms',
        specs: {
          technology: 'Spring Kafka, ConcurrentKafkaListenerContainerFactory, Idempotent Consumers',
          concurrencyModel: 'Parallel consumer groups scaling horizontally up to partition count',
          resiliencePattern: 'Dead Letter Topic (DLT) retry with exponential backoff on payment gateway hiccups',
          disasterRecovery: 'Offset rewind capability to reprocess streams in disaster scenarios',
          targetSla: 'Exactly-Once Semantics',
          deepDive: 'Independently consume order events, charge credit cards, deduct warehouse bins, and trigger shipment.'
        }
      },
      {
        id: 'ecom-aurora',
        label: 'AWS Aurora PostgreSQL',
        sublabel: 'Multi-AZ Read Replicas',
        role: 'Transactional State Store',
        category: 'database',
        x: 630,
        y: 180,
        width: 160,
        height: 70,
        color: 'teal',
        iconName: 'Database',
        protocol: 'Aurora pg_wire',
        techBadge: 'Aurora Multi-AZ',
        metricLabel: 'Uptime SLA',
        metricValue: '99.99%',
        specs: {
          technology: 'AWS Aurora PostgreSQL Serverless v2 with 3 distributed read replicas',
          concurrencyModel: 'Distributed storage engine with 6-way replication across 3 Availability Zones',
          resiliencePattern: 'Automatic crash recovery in under 30 seconds with zero data loss (RPO=0)',
          disasterRecovery: 'Automated continuous incremental backups to Amazon S3',
          targetSla: 'Sub-10ms P95 Reads',
          deepDive: 'Stores order ledgers, customer receipts, and historical order status records.'
        }
      }
    ],
    edges: [
      { id: 'e1', from: 'ecom-traffic', to: 'ecom-alb', pathD: 'M 180 215 C 195 215, 205 215, 220 215', label: '10K+ Flash RPS', protocol: 'HTTP/2', activeInSteps: [1] },
      { id: 'e2', from: 'ecom-alb', to: 'ecom-order', pathD: 'M 370 215 C 390 215, 400 215, 420 215', label: 'Route to Pods', protocol: 'HTTP/2', activeInSteps: [2] },
      { id: 'e3', from: 'ecom-order', to: 'ecom-lock', pathD: 'M 420 195 C 370 195, 370 82, 370 82', label: 'Acquire RedLock', protocol: 'RESP3', activeInSteps: [3] },
      { id: 'e4', from: 'ecom-order', to: 'ecom-aurora', pathD: 'M 570 215 C 590 215, 610 215, 630 215', label: 'ACID Outbox Write', protocol: 'pg_wire', activeInSteps: [4] },
      { id: 'e5', from: 'ecom-order', to: 'ecom-kafka', pathD: 'M 495 250 C 495 280, 495 300, 495 330', label: 'orders.placed', protocol: 'Kafka', activeInSteps: [5] },
      { id: 'e6', from: 'ecom-kafka', to: 'ecom-consumers', pathD: 'M 570 362 C 590 362, 610 362, 630 362', label: 'Consumer Fanout', protocol: 'Kafka', activeInSteps: [6] }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Flash-Sale Traffic Spike (10,000+ RPS)',
        sourceNodeId: 'ecom-traffic',
        targetNodeId: 'ecom-alb',
        payloadTag: 'POST /checkout {sku: "PRO-99", qty: 1}',
        detailedExplanation: '10,000+ buyers click checkout concurrently. AWS ALB terminates SSL and balances requests across worker nodes.',
        impactMetric: 'Peak 10,450 RPS',
        latencyEst: '5ms'
      },
      {
        stepNumber: 2,
        title: 'Step 2: Kubernetes Horizontal Pod Autoscaling',
        sourceNodeId: 'ecom-alb',
        targetNodeId: 'ecom-order',
        payloadTag: 'K8s HPA: Scaling 12 -> 48 Pods',
        detailedExplanation: 'Kubernetes detects sudden throughput spike and scales Order pods dynamically, absorbing the surge smoothly.',
        impactMetric: 'Zero Request Drops',
        latencyEst: '3ms'
      },
      {
        stepNumber: 3,
        title: 'Step 3: Redisson Distributed Mutex Lock Acquisition',
        sourceNodeId: 'ecom-order',
        targetNodeId: 'ecom-lock',
        payloadTag: 'RLock.tryLock("inv:sku-99", 3s, 5s)',
        detailedExplanation: 'Order pod acquires Redis distributed lock on SKU within 0.8ms. Only 1 request holds the lock, eliminating race conditions.',
        impactMetric: 'Zero Overselling',
        latencyEst: '0.8ms'
      },
      {
        stepNumber: 4,
        title: 'Step 4: Atomic Local ACID Transaction & Outbox Commit',
        sourceNodeId: 'ecom-order',
        targetNodeId: 'ecom-aurora',
        payloadTag: 'COMMIT [orders + outbox_events]',
        detailedExplanation: 'Order record written to Aurora DB with status PENDING, and lock released in finally block in under 5ms total.',
        impactMetric: 'ACID Durability',
        latencyEst: '12ms'
      },
      {
        stepNumber: 5,
        title: 'Step 5: Transactional Outbox Event Publishing to Kafka',
        sourceNodeId: 'ecom-order',
        targetNodeId: 'ecom-kafka',
        payloadTag: 'Kafka: topic[orders.placed] partition_7',
        detailedExplanation: 'Debezium CDC tail reads the outbox table and publishes the OrderPlacedEvent to Kafka topic with zero message loss.',
        impactMetric: 'Kafka Lag: 0',
        latencyEst: '4ms'
      },
      {
        stepNumber: 6,
        title: 'Step 6: Asynchronous Consumer Fanout & Fulfillment',
        sourceNodeId: 'ecom-kafka',
        targetNodeId: 'ecom-consumers',
        payloadTag: 'Fanout: Payment + Inventory + Logistics',
        detailedExplanation: 'Payment microservice charges card, Inventory service decrements physical bin, and customer receives confirmation in 140ms.',
        impactMetric: 'P99 Latency < 140ms',
        latencyEst: '15ms'
      }
    ],
    chaosScenarios: [
      {
        id: 'chaos-lock-contention',
        name: 'Simulate 500 Orders on 1 Remaining Item',
        scenarioDescription: 'Simulates extreme lock contention where 500 requests fight for 1 remaining inventory unit.',
        triggerStep: 3,
        affectedNodeId: 'ecom-lock',
        resilientOutcome: 'Redisson distributed lock allows the first request to purchase the unit; the remaining 499 requests gracefully receive instant "Item Out of Stock" without a single database crash or oversell.',
        recoveryBadge: 'Strict Mutex Isolation'
      },
      {
        id: 'chaos-consumer-crash',
        name: 'Simulate Payment Consumer Crash',
        scenarioDescription: 'Simulates the Payment Service crashing during checkout processing.',
        triggerStep: 6,
        affectedNodeId: 'ecom-consumers',
        resilientOutcome: 'Kafka persists events in partitioned log. Kubernetes restarts the Payment Service pod; consumer resumes reading from committed offset with zero lost orders.',
        recoveryBadge: 'Kafka Offset Recovery Active'
      }
    ]
  },

  'realtime-platform': {
    id: 'realtime-platform',
    projectId: 'realtime-platform',
    title: 'Real-Time WebSocket Event Stream Platform',
    tagline: '50K+ Concurrent WebSockets, Sub-20ms Redis Pub/Sub Mesh, React 19 State Sync',
    viewBox: '0 0 820 440',
    nodes: [
      {
        id: 'rt-clients',
        label: '50K+ Active Users',
        sublabel: 'Global Collaborative Clients',
        role: 'Real-Time Collaborators',
        category: 'client',
        x: 40,
        y: 180,
        width: 140,
        height: 70,
        color: 'cyan',
        iconName: 'Laptop',
        protocol: 'WSS (Secure WebSocket)',
        techBadge: 'React 19 SPA',
        metricLabel: 'Active Sockets',
        metricValue: '52,400 Conns',
        specs: {
          technology: 'React 19, TypeScript, RFC 6455 WebSockets with custom exponential backoff reconnect',
          concurrencyModel: 'Optimistic UI updates rendering instant drag/drop changes before server confirmation',
          resiliencePattern: 'Heartbeat ping-pong every 25 seconds with exponential backoff auto-reconnect',
          disasterRecovery: 'Local state cache ensuring zero work lost during temporary disconnects',
          targetSla: 'Sub-20ms Sync',
          deepDive: '50,000+ persistent duplex connections sending collaborative editing mutations in real time.'
        }
      },
      {
        id: 'rt-nginx',
        label: 'Nginx Sticky LB',
        sublabel: 'WebSocket TLS Terminator',
        role: 'Connection Ingress',
        category: 'gateway',
        x: 220,
        y: 180,
        width: 150,
        height: 70,
        color: 'emerald',
        iconName: 'Shield',
        protocol: 'WSS Upgrade :443',
        techBadge: 'Nginx Epoll',
        metricLabel: 'Max Capacity',
        metricValue: '60,000 Sockets',
        specs: {
          technology: 'Nginx high-performance reverse proxy with Linux Epoll socket multiplexing',
          concurrencyModel: 'Asynchronous non-blocking event-driven I/O handling 100K+ concurrent file descriptors',
          resiliencePattern: 'IP-hash session persistence routing client reconnects to existing socket gateways',
          disasterRecovery: 'Active-passive keepalived pair with virtual IP takeover',
          targetSla: '99.999% Ingress SLA',
          deepDive: 'Terminates TLS framing and upgrades HTTP GET to persistent bidirectional WebSocket sockets.'
        }
      },
      {
        id: 'rt-gateway',
        label: 'WebSocket Gateway Mesh',
        sublabel: 'Clustered Spring & Node Pods',
        role: 'Socket Multiplexer',
        category: 'compute',
        x: 420,
        y: 180,
        width: 150,
        height: 70,
        color: 'blue',
        iconName: 'Server',
        protocol: 'STOMP / Binary WSS',
        techBadge: 'Spring Boot 3 Netty',
        metricLabel: 'Throughput',
        metricValue: '1M+ msgs/min',
        specs: {
          technology: 'Spring Boot 3 WebSocket with Netty reactive engine, clustered into 10 worker pods',
          concurrencyModel: 'Epoll worker threads managing 5,000 persistent sockets per pod without memory leak',
          resiliencePattern: 'Heartbeat monitoring dropping ghost connections after 60s silence',
          disasterRecovery: 'Automatic pod draining with graceful client redistribution on deployments',
          targetSla: '99.99% Availability',
          deepDive: 'Manages user subscriptions to board channels and serializes outgoing mutation frames.'
        }
      },
      {
        id: 'rt-pubsub',
        label: 'Redis Pub/Sub Mesh',
        sublabel: 'Sub-2ms Inter-Pod Broadcast',
        role: 'Backplane Message Bus',
        category: 'cache',
        x: 420,
        y: 330,
        width: 150,
        height: 65,
        color: 'rose',
        iconName: 'Share2',
        protocol: 'RESP3 Pub/Sub',
        techBadge: 'Redis 7 Mesh',
        metricLabel: 'Broadcast',
        metricValue: '< 1.8ms',
        specs: {
          technology: 'Redis 7 Clustered Pub/Sub channels keyed by `channel:board:{id}`',
          concurrencyModel: 'In-memory pub/sub broadcasting messages to all 10 gateway pods simultaneously',
          resiliencePattern: 'Lightweight memory footprint: Redis holds zero message history, pure real-time transit',
          disasterRecovery: 'Dual-replicated Redis sentinels with 1.5s automatic leader election',
          targetSla: 'Sub-2ms Broadcast',
          deepDive: 'Bridges isolated WebSocket pods so User A on Pod 1 immediately reaches User B on Pod 8.'
        }
      },
      {
        id: 'rt-crdt',
        label: 'OT & CRDT Resolver',
        sublabel: 'Conflict-Free Synchronization',
        role: 'Concurrent Logic Engine',
        category: 'security',
        x: 420,
        y: 50,
        width: 150,
        height: 65,
        color: 'purple',
        iconName: 'GitBranch',
        protocol: 'In-Memory Engine',
        techBadge: 'CRDT / OT',
        metricLabel: 'Conflicts',
        metricValue: '0 Lost Edits',
        specs: {
          technology: 'Operational Transformation (OT) algorithm paired with Vector Clocks `[A:14, B:9]`',
          concurrencyModel: 'Deterministic state machine merging simultaneous conflicting card edits without database locking',
          resiliencePattern: 'Last-Write-Wins (LWW) timestamping for scalar fields; OT for collaborative text',
          disasterRecovery: 'Re-sync vector clock snapshot delivered upon client reconnection',
          targetSla: '100% Convergence',
          deepDive: 'Resolves simultaneous edits on the same project board with mathematical conflict convergence.'
        }
      },
      {
        id: 'rt-db',
        label: 'Write-Behind PostgreSQL',
        sublabel: '500ms Buffer Batcher',
        role: 'Persistent Document Store',
        category: 'database',
        x: 630,
        y: 180,
        width: 160,
        height: 70,
        color: 'amber',
        iconName: 'Database',
        protocol: 'pg_wire / JDBC',
        techBadge: 'PostgreSQL 16',
        metricLabel: 'Load Saved',
        metricValue: '-80% IOPS',
        specs: {
          technology: 'PostgreSQL 16 with JSONB delta storage, buffered by in-memory ring buffers',
          concurrencyModel: 'Write-behind worker collapsing 100 rapid card moves into 1 bulk database write every 500ms',
          resiliencePattern: 'Prevents database thrashing during fast collaborative whiteboard drag-and-drop',
          disasterRecovery: 'Continuous WAL archiving with point-in-time recovery to S3',
          targetSla: '99.999% Durability',
          deepDive: 'Buffers high-frequency edits in memory and writes consolidated state snapshots every 500ms.'
        }
      }
    ],
    edges: [
      { id: 'e1', from: 'rt-clients', to: 'rt-nginx', pathD: 'M 180 215 C 195 215, 205 215, 220 215', label: 'WSS Handshake', protocol: 'WSS', activeInSteps: [1] },
      { id: 'e2', from: 'rt-nginx', to: 'rt-gateway', pathD: 'M 370 215 C 390 215, 400 215, 420 215', label: 'Persistent TCP', protocol: 'STOMP', activeInSteps: [2] },
      { id: 'e3', from: 'rt-gateway', to: 'rt-crdt', pathD: 'M 495 180 C 495 150, 495 130, 495 115', label: 'Vector Clock Check', protocol: 'Internal', activeInSteps: [3] },
      { id: 'e4', from: 'rt-gateway', to: 'rt-pubsub', pathD: 'M 495 250 C 495 280, 495 300, 495 330', label: 'PUBLISH Mutation', protocol: 'RESP3', activeInSteps: [4] },
      { id: 'e5', from: 'rt-pubsub', to: 'rt-gateway', pathD: 'M 430 330 C 410 300, 410 250, 430 220', label: 'Fanout to Pods', protocol: 'RESP3', activeInSteps: [5] },
      { id: 'e6', from: 'rt-gateway', to: 'rt-db', pathD: 'M 570 215 C 590 215, 610 215, 630 215', label: '500ms Batch Flush', protocol: 'JDBC', activeInSteps: [6] }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: User Moves Task Card (Optimistic UI Update)',
        sourceNodeId: 'rt-clients',
        targetNodeId: 'rt-nginx',
        payloadTag: 'WSS: MOVE card_42 -> "IN_PROGRESS"',
        detailedExplanation: 'User in London drags card. React 19 UI updates instantly (0ms latency), and sends binary WSS frame with vector clock.',
        impactMetric: 'Local Latency 0ms',
        latencyEst: '0ms'
      },
      {
        stepNumber: 2,
        title: 'Step 2: Nginx Epoll Ingress Multiplexing',
        sourceNodeId: 'rt-nginx',
        targetNodeId: 'rt-gateway',
        payloadTag: 'Route to Gateway Pod #4',
        detailedExplanation: 'Nginx multiplexes persistent WebSocket socket and forwards delta frame directly to WebSocket Pod #4.',
        impactMetric: 'Ingress < 2ms',
        latencyEst: '2ms'
      },
      {
        stepNumber: 3,
        title: 'Step 3: Operational Transform (OT) Conflict Resolution',
        sourceNodeId: 'rt-gateway',
        targetNodeId: 'rt-crdt',
        payloadTag: 'OT Verify: vClock [A:14, B:9]',
        detailedExplanation: 'OT engine validates mutation timestamp against server vector clock. Validates zero conflicting card ownership.',
        impactMetric: 'Zero Lost Edits',
        latencyEst: '0.5ms'
      },
      {
        stepNumber: 4,
        title: 'Step 4: Inter-Pod Broadcast via Redis Pub/Sub Backplane',
        sourceNodeId: 'rt-gateway',
        targetNodeId: 'rt-pubsub',
        payloadTag: 'PUBLISH channel:board_891',
        detailedExplanation: 'Pod #4 publishes mutation to Redis Pub/Sub backplane. Redis fans out message to all 10 gateway pods in sub-2ms.',
        impactMetric: 'Redis Fanout < 1.8ms',
        latencyEst: '1.8ms'
      },
      {
        stepNumber: 5,
        title: 'Step 5: Real-Time Push to All Subscribed Collaborators',
        sourceNodeId: 'rt-pubsub',
        targetNodeId: 'rt-clients',
        payloadTag: 'WSS PUSH: card_42 moved (< 18ms total)',
        detailedExplanation: 'Other gateway pods receive event and broadcast to clients in New York, Tokyo, and Singapore in under 18ms global round-trip.',
        impactMetric: 'Total Sync < 18ms',
        latencyEst: '18ms'
      },
      {
        stepNumber: 6,
        title: 'Step 6: Asynchronous Write-Behind Database Consolidation',
        sourceNodeId: 'rt-gateway',
        targetNodeId: 'rt-db',
        payloadTag: 'Batch Flush 100 Deltas -> PostgreSQL',
        detailedExplanation: 'In-memory ring buffer consolidates 100 rapid card drags into 1 database update every 500ms, slashing DB load by 80%.',
        impactMetric: '80% DB Load Saved',
        latencyEst: '500ms buffer'
      }
    ],
    chaosScenarios: [
      {
        id: 'chaos-ws-disconnect',
        name: 'Simulate Gateway Pod Crash',
        scenarioDescription: 'Simulates the sudden termination of a WebSocket gateway pod holding 5,000 active sockets.',
        triggerStep: 2,
        affectedNodeId: 'rt-gateway',
        resilientOutcome: 'React 19 client detects socket severance, executes exponential backoff reconnect to healthy pod within 1.2s, sends its last vector clock, and receives delta synchronization with zero data loss.',
        recoveryBadge: 'Auto-Reconnect & Delta Sync'
      }
    ]
  },

  'fintech-gateway': {
    id: 'fintech-gateway',
    projectId: 'fintech-gateway',
    title: 'FinTech Transaction & Compliance Audit Gateway',
    tagline: 'PCI-DSS Compliant, Cryptographic Idempotency Leases, AWS KMS Envelope Vault',
    viewBox: '0 0 820 440',
    nodes: [
      {
        id: 'fin-client',
        label: 'Merchant Checkout',
        sublabel: '$10M+ Daily Transaction Volume',
        role: 'Financial Originator',
        category: 'client',
        x: 40,
        y: 180,
        width: 140,
        height: 70,
        color: 'cyan',
        iconName: 'ShieldCheck',
        protocol: 'mTLS 1.3 / HTTPS',
        techBadge: 'PCI-DSS Compliant',
        metricLabel: 'Double-Spend',
        metricValue: '0.00%',
        specs: {
          technology: 'Merchant POS, E-Commerce Checkout API over mutual TLS 1.3 with client certificate authentication',
          concurrencyModel: 'High-value asynchronous payment dispatch with unique client-generated UUIDv4 idempotency keys',
          resiliencePattern: 'Cryptographic request signature validation (`X-Signature: HMAC-SHA256`)',
          disasterRecovery: 'Client automated retry queue with idempotent replay safety',
          targetSla: 'Zero Financial Loss',
          deepDive: 'Sends payment execution commands requiring 100% idempotent single-charge guarantees.'
        }
      },
      {
        id: 'fin-gw',
        label: 'PCI-DSS Security Perimeter',
        sublabel: 'Mutual TLS & WAF Gateway',
        role: 'Perimeter Defense',
        category: 'gateway',
        x: 220,
        y: 180,
        width: 150,
        height: 70,
        color: 'emerald',
        iconName: 'Shield',
        protocol: 'Strict TLS 1.3 Ciphers',
        techBadge: 'Spring Cloud Gateway',
        metricLabel: 'Compliance',
        metricValue: 'PCI-DSS Tier 1',
        specs: {
          technology: 'Spring Cloud Gateway hardened for PCI-DSS Tier 1, strictly enforcing TLS 1.3 ciphers',
          concurrencyModel: 'Non-blocking packet inspection with IP whitelisting and rate anomaly detection',
          resiliencePattern: 'Instant connection termination on cipher mismatch or invalid client certificates',
          disasterRecovery: 'Multi-region AWS CloudFront Anycast failover',
          targetSla: '100% Compliance Pass',
          deepDive: 'Terminates mutual TLS, verifies merchant identity certificates, and intercepts replay attacks.'
        }
      },
      {
        id: 'fin-idem',
        label: 'Idempotency Lease Guard',
        sublabel: 'Atomic Redis Distributed Lease',
        role: 'Replay Attack Prevention',
        category: 'security',
        x: 220,
        y: 50,
        width: 150,
        height: 65,
        color: 'rose',
        iconName: 'KeyRound',
        protocol: 'RESP3 Atomic SETNX',
        techBadge: 'Redis 7 Cluster',
        metricLabel: 'Check Time',
        metricValue: '< 0.6ms',
        specs: {
          technology: 'Redis 7 with atomic Lua scripts and `SETNX idem:{uuid} "PROCESSING" EX 60` lease locks',
          concurrencyModel: 'Atomic lock acquisition guaranteeing exactly one execution per idempotency key',
          resiliencePattern: 'On duplicate request detection, returns existing cached receipt immediately without charging card twice',
          disasterRecovery: 'Redis Multi-AZ replication with synchronous commit for idempotency keys',
          targetSla: '100% Idempotent',
          deepDive: 'Guarantees zero double-charge anomalies even if merchant client re-submits during network delays.'
        }
      },
      {
        id: 'fin-kms',
        label: 'AWS KMS Envelope Vault',
        sublabel: 'Hardware Security Module (HSM)',
        role: 'Cryptographic Tokenizer',
        category: 'security',
        x: 420,
        y: 50,
        width: 150,
        height: 65,
        color: 'purple',
        iconName: 'Lock',
        protocol: 'AWS KMS / AES-256-GCM',
        techBadge: 'FIPS 140-2 Level 3',
        metricLabel: 'Encryption',
        metricValue: 'AES-256-GCM',
        specs: {
          technology: 'AWS Key Management Service (KMS) backed by FIPS 140-2 Level 3 Hardware Security Modules',
          concurrencyModel: 'Ephemeral Data Encryption Key (DEK) generation per transaction; memory zeroing immediately after encryption',
          resiliencePattern: 'Cardholder PAN is tokenized into irreversible cryptographic tokens; zero plaintext touches disk',
          disasterRecovery: 'AWS KMS multi-region replica keys with automatic failover',
          targetSla: 'Zero Plaintext Exposure',
          deepDive: 'Tokenizes sensitive card numbers into secure envelopes, ensuring zero raw card data in application memory.'
        }
      },
      {
        id: 'fin-core',
        label: 'Core Settlement Engine',
        sublabel: 'Serializable Isolation Ledger',
        role: 'Financial Orchestrator',
        category: 'compute',
        x: 420,
        y: 180,
        width: 150,
        height: 70,
        color: 'blue',
        iconName: 'Cpu',
        protocol: 'Spring Boot 3',
        techBadge: 'Serializable Tx',
        metricLabel: 'Isolation',
        metricValue: 'SERIALIZABLE',
        specs: {
          technology: 'Java 21, Spring Boot 3, Spring Transaction Manager with `SERIALIZABLE` isolation level',
          concurrencyModel: 'Strict serializable transactions preventing phantom reads and write skews',
          resiliencePattern: 'Two-phase commit coordinator with automatic transaction rollback upon partner bank timeouts',
          disasterRecovery: 'Redundant container instances with active standby failover',
          targetSla: '99.999% Reconciliation',
          deepDive: 'Orchestrates card settlement, balance reservation, and interbank gateway dispatch.'
        }
      },
      {
        id: 'fin-bank',
        label: 'Banking Partner Rail',
        sublabel: 'SWIFT / FedNow / Visa Direct',
        role: 'Interbank Settlement Network',
        category: 'external',
        x: 630,
        y: 180,
        width: 160,
        height: 70,
        color: 'amber',
        iconName: 'Building2',
        protocol: 'ISO 8583 / AS2',
        techBadge: 'FedNow / Visa Rail',
        metricLabel: 'Clearing Time',
        metricValue: '< 650ms',
        specs: {
          technology: 'ISO 8583 financial interchange messaging over dedicated leased MPLS lines',
          concurrencyModel: 'Asynchronous clearinghouse dispatch with authorization reversal timeouts',
          resiliencePattern: 'Automated end-of-day bank reconciliation reconciling 100% of ledger balances',
          disasterRecovery: 'Secondary backup banking partner rail (FedNow secondary rail)',
          targetSla: '99.999% SLA Uptime',
          deepDive: 'Direct integration with banking partners executing fund clearing and settlement authorization.'
        }
      },
      {
        id: 'fin-ledger',
        label: 'Cryptographic Audit Ledger',
        sublabel: 'Immutable Chained WORM Store',
        role: 'Compliance & Audit Integrity',
        category: 'database',
        x: 630,
        y: 330,
        width: 160,
        height: 65,
        color: 'teal',
        iconName: 'FileCheck',
        protocol: 'HMAC-SHA256 Hash Chain',
        techBadge: 'WORM Immutable DB',
        metricLabel: 'Audit Integrity',
        metricValue: '100% Tamper-Proof',
        specs: {
          technology: 'Append-only PostgreSQL WORM tables with HMAC-SHA256 hash chaining (blockchain-style merkle tree)',
          concurrencyModel: 'Sequential hash calculation signing previous block hash into current transaction receipt',
          resiliencePattern: 'Any modification of historic records breaks cryptographic verification immediately',
          disasterRecovery: 'Air-gapped secondary replica with write-once-read-many permissions',
          targetSla: '100% Compliance Pass',
          deepDive: 'Signs every transaction with a cryptographic hash chain, guaranteeing tamper-evident audit records.'
        }
      }
    ],
    edges: [
      { id: 'e1', from: 'fin-client', to: 'fin-gw', pathD: 'M 180 215 C 195 215, 205 215, 220 215', label: 'mTLS 1.3 Charge', protocol: 'mTLS', activeInSteps: [1] },
      { id: 'e2', from: 'fin-gw', to: 'fin-idem', pathD: 'M 295 180 C 295 150, 295 130, 295 115', label: 'Check Idempotency', protocol: 'RESP3', activeInSteps: [2] },
      { id: 'e3', from: 'fin-gw', to: 'fin-kms', pathD: 'M 370 195 C 400 195, 400 82, 420 82', label: 'Tokenize Card', protocol: 'KMS', activeInSteps: [3] },
      { id: 'e4', from: 'fin-gw', to: 'fin-core', pathD: 'M 370 215 C 390 215, 400 215, 420 215', label: 'Dispatch Charge', protocol: 'Internal', activeInSteps: [4] },
      { id: 'e5', from: 'fin-core', to: 'fin-bank', pathD: 'M 570 215 C 590 215, 610 215, 630 215', label: 'ISO 8583 Settlement', protocol: 'ISO 8583', activeInSteps: [5] },
      { id: 'e6', from: 'fin-core', to: 'fin-ledger', pathD: 'M 495 250 C 495 300, 560 362, 630 362', label: 'HMAC-SHA256 Log', protocol: 'JDBC', activeInSteps: [6] }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Merchant Transmits Payment with Idempotency Key',
        sourceNodeId: 'fin-client',
        targetNodeId: 'fin-gw',
        payloadTag: 'mTLS POST /charge ($5,000) Key: "idem_89a"',
        detailedExplanation: 'Merchant initiates $5,000 charge over mutual TLS 1.3 with X-Idempotency-Key and HMAC request signature.',
        impactMetric: 'TLS Handshake < 8ms',
        latencyEst: '8ms'
      },
      {
        stepNumber: 2,
        title: 'Step 2: Atomic Idempotency Lease Acquisition',
        sourceNodeId: 'fin-gw',
        targetNodeId: 'fin-idem',
        payloadTag: 'Redis SETNX idem:89a "PROCESSING" EX 60',
        detailedExplanation: 'Redis executes atomic lease lock. If key already exists with status COMPLETED, returns existing receipt without double-charging.',
        impactMetric: '0.00% Double-Spend',
        latencyEst: '0.6ms'
      },
      {
        stepNumber: 3,
        title: 'Step 3: AWS KMS Hardware Security Module Tokenization',
        sourceNodeId: 'fin-gw',
        targetNodeId: 'fin-kms',
        payloadTag: 'KMS Envelope: Encrypt Card -> Token',
        detailedExplanation: 'AWS KMS HSM generates Data Encryption Key (DEK), encrypts card PAN with AES-256-GCM, and zeroes plaintext RAM bytes.',
        impactMetric: 'FIPS 140-2 Level 3',
        latencyEst: '12ms'
      },
      {
        stepNumber: 4,
        title: 'Step 4: Serializable Isolation Transaction Execution',
        sourceNodeId: 'fin-gw',
        targetNodeId: 'fin-core',
        payloadTag: 'Begin Serializable Tx (#89410)',
        detailedExplanation: 'Core engine starts serializable transaction, reserving merchant balance and establishing audit checkpoints.',
        impactMetric: 'Zero Write Skews',
        latencyEst: '4ms'
      },
      {
        stepNumber: 5,
        title: 'Step 5: Banking Rail Clearing (FedNow / Visa Direct)',
        sourceNodeId: 'fin-core',
        targetNodeId: 'fin-bank',
        payloadTag: 'ISO 8583 Message: AUTH_APPROVED',
        detailedExplanation: 'Formats ISO 8583 payload and clears funds through bank rail. Bank returns authorization code AUTH_9924.',
        impactMetric: 'Bank Auth < 650ms',
        latencyEst: '650ms'
      },
      {
        stepNumber: 6,
        title: 'Step 6: Cryptographic Audit Hash Chaining & Receipt',
        sourceNodeId: 'fin-core',
        targetNodeId: 'fin-ledger',
        payloadTag: 'HMAC-SHA256 Block #10892 Chained',
        detailedExplanation: 'Signs receipt with SHA-256 hash chaining to previous block, marks idempotency key COMPLETED, and returns HTTP 200.',
        impactMetric: '100% Tamper-Evident',
        latencyEst: '5ms'
      }
    ],
    chaosScenarios: [
      {
        id: 'chaos-duplicate-retry',
        name: 'Simulate Network Timeout & Duplicate Merchant Swipe',
        scenarioDescription: 'Simulates a merchant experiencing a network timeout and aggressively re-submitting the identical $5,000 charge.',
        triggerStep: 2,
        affectedNodeId: 'fin-idem',
        resilientOutcome: 'The second request hits the Redis Idempotency Lease, detects status "COMPLETED", and immediately returns the cached $5,000 receipt without charging the cardholder a second time.',
        recoveryBadge: 'Double-Charge Blocked (100% Safe)'
      }
    ]
  }
}
