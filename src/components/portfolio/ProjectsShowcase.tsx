import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Terminal, 
  Layers, 
  Shield, 
  Zap, 
  X, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  GitBranch,
  ArrowRight,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ByteByteGoDiagram from '@/components/architecture/ByteByteGoDiagram'

export interface ArchitecturalDecisionRecord {
  adrId: string
  title: string
  status: string
  contextAndScaleBottleneck: string
  architectureChosen: string
  tradeOffAccepted: string
  verificationAndTelemetry: string
  context?: string
  decision?: string
  tradeOffs?: string[]
  consequences?: string
}

export interface Project {
  id: string
  title: string
  category: 'Enterprise SaaS' | 'Microservices' | 'FinTech' | 'Real-Time' | 'Cloud Infra' | 'AI Systems & MCP'
  tagline: string
  description: string
  clientType: string
  tech: string[]
  problemStatement: string
  architectureHighlights: string[]
  metrics: Record<string, string>
  diagramNodes: string[]
  adr: ArchitecturalDecisionRecord
  problemsSolved: string[]
  details: {
    challenge: string
    solution: string
    architecture: string
    impact: string
  }
  codeSnippet: string
  codeLanguage: string
  githubUrl: string
  liveUrl?: string
}

const PROJECTS: Project[] = [
  {
    id: 'saas-platform',
    title: 'Multi-Tenant B2B IAM & Subscription Core',
    category: 'Enterprise SaaS',
    tagline: 'Multi-Tenant B2B Identity, RBAC & Subscription Engine with Clean Architecture',
    description: 'Production-hardened B2B identity, role-based access control, and subscription management engine featuring row-level multi-tenancy, JWT/OAuth2 security, automated audit trails, and Spring Boot 3 Clean Architecture.',
    clientType: 'For Enterprise B2B SaaS & Financial Platforms',
    tech: ['Java 21', 'Spring Boot 3', 'React 19', 'PostgreSQL', 'Redis', 'Docker', 'Flyway'],
    problemStatement: 'Multi-tenant enterprise customers suffered cross-tenant database resource contention, noisy-neighbor query latency exceeding 480ms P99, and compliance bottlenecks when attempting to maintain strict tenant isolation across 1,200+ accounts.',
    architectureHighlights: [
      'Hexagonal Architecture (Ports & Adapters)',
      'PostgreSQL Row-Level Security (RLS)',
      'Tenant-Prefixed Redis L2 Cache with Cache-Aside'
    ],
    metrics: {
      'P99 Latency': '480ms -> 78ms',
      'RDS Host Spend': '-68% ($12k to $3.8k/mo)',
      'Tenant Isolation': '100% RLS Policy Pass',
      'Availability': '99.99% Multi-AZ SLA'
    },
    diagramNodes: [
      'React 19 Client',
      'Spring Cloud Gateway (JWT/RLS)',
      'Spring Boot 3 (Virtual Threads)',
      'PostgreSQL (Tenant RLS Policies)',
      'Redis Cache-Aside Namespace'
    ],
    adr: {
      adrId: 'ADR-001',
      title: 'Row-Level Security (RLS) Multi-Tenancy vs Database-per-Tenant',
      status: 'ACCEPTED & IMPLEMENTED',
      contextAndScaleBottleneck: 'Multi-tenant enterprise customers suffered database connection pool starvation and noisy-neighbor query latency exceeding 480ms P99 across 1,200+ tenant accounts. Provisioning dedicated database instances per tenant was projected to exceed $12,000/month with severe migration latency.',
      architectureChosen: 'Adopted shared-schema multi-tenancy enforced by PostgreSQL Row-Level Security (RLS) policies tied to tenant session variables, integrated with Spring Data JPA tenant interceptors and tenant-scoped Redis cache keyspaces.',
      tradeOffAccepted: 'Accepted write amplification on tenant-filtered indexes and the engineering overhead of automated cross-tenant security regression suites in exchange for avoiding connection pool fragmentation across thousands of separate databases.',
      verificationAndTelemetry: 'P99 read latency dropped from 480ms to 78ms under 2,500 req/s load via composite (tenant_id, id) B-tree indexing and PgBouncer pooling, slashing RDS compute costs by 68% ($12,000 to $3,840/mo) with zero data isolation leaks recorded across 1,200+ enterprise tenants.',
      context: 'Multi-tenant enterprise customers suffered database connection pool starvation and noisy-neighbor query latency exceeding 480ms P99 across 1,200+ tenant accounts. Provisioning dedicated database instances per tenant was projected to exceed $12,000/month with severe migration latency.',
      decision: 'Adopted shared-schema multi-tenancy enforced by PostgreSQL Row-Level Security (RLS) policies tied to tenant session variables, integrated with Spring Data JPA tenant interceptors and tenant-scoped Redis cache keyspaces.',
      tradeOffs: [
        'Accepted tenant-filter overhead on query plans in exchange for avoiding thousands of idle connection pools.',
        'Eliminated dedicated database maintenance overhead, shrinking monthly RDS costs from $12,000 to $3,840/mo.',
        'Enforced zero data leakage mathematically via PostgreSQL session-bound RLS policies and automated security suites.'
      ],
      consequences: 'P99 read latency dropped from 480ms to 78ms under 2,500 req/s load, lowering AWS RDS spend by 68% ($12,000 to $3,840/mo) and passing SOC-2 Type II audits with 100% compliance.'
    },
    problemsSolved: [
      'Eliminated cross-tenant query interference, cutting P99 database wait times from 480ms to 78ms via composite partial indexes and PgBouncer pooling',
      'Cut AWS RDS hosting expenses by 68% ($12,000/mo to $3,840/mo) by replacing database-per-tenant provisioning with PostgreSQL Row-Level Security',
      'Prevented cross-tenant data leakage by binding tenant context to PostgreSQL session parameters in Spring Security filter chains',
      'Automated zero-downtime schema evolution across 1,200+ tenants using Flyway idempotent migration scripts'
    ],
    details: {
      challenge: 'Scaling a B2B SaaS platform across 1,200+ enterprise tenants without runaway RDS database provisioning costs, connection pool starvation, or risk of cross-tenant data leakage.',
      solution: 'Architected Hexagonal Clean Architecture decoupling domain rules from persistence. Combined PostgreSQL Row-Level Security with tenant-scoped Redis L2 caching and stateless JWT tokens carrying verified tenant claims.',
      architecture: 'Presentation (React 19 SPA) -> Spring Cloud Gateway (JWT Verification) -> Application Core (Virtual Threads) -> Domain Aggregates -> PostgreSQL (Tenant RLS) + Redis Cluster.',
      impact: 'Reduced P99 latency from 480ms to 78ms, lowered AWS RDS spend by 68% ($12k to $3.8k/mo), and maintained 99.99% multi-AZ uptime with zero compliance infractions.'
    },
    codeSnippet: `@RestController
@RequestMapping("/api/v1/projects")
@RequiredByRole("ROLE_TENANT_ADMIN")
public class ProjectController {
    private final CreateProjectUseCase createProjectUseCase;

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(
            @AuthenticationPrincipal TenantPrincipal principal,
            @Valid @RequestBody CreateProjectRequest request) {
        
        Project project = createProjectUseCase.execute(
            TenantId.of(principal.getTenantId()),
            request.toCommand()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ProjectResponseDTO.fromDomain(project));
    }
}`,
    codeLanguage: 'Java 21 LTS',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack'
  },
  {
    id: 'ecommerce-engine',
    title: 'Distributed Order Checkout & Saga Engine',
    category: 'Microservices',
    tagline: 'High-Throughput Microservices with Choreographed Saga & Transactional Outbox',
    description: 'Resilient microservices platform decomposed from a legacy monolith into autonomous domain services communicating via Choreographed Saga orchestration, Transactional Outbox pattern (Debezium CDC), and idempotent Kafka consumers.',
    clientType: 'For High-Volume Retail & Global Supply Chains',
    tech: ['Spring Boot 3', 'Apache Kafka', 'Debezium CDC', 'Redis Cluster', 'Docker', 'Kubernetes', 'AWS RDS'],
    problemStatement: 'A legacy retail monolith frequently crashed under flash-sale spikes of 15,000 RPS, generating distributed database deadlocks, cart checkout timeouts exceeding 3.5 seconds, and concurrent inventory overselling anomalies.',
    architectureHighlights: [
      'Choreographed Saga Orchestration',
      'Transactional Outbox Pattern (Debezium CDC)',
      'Idempotent Kafka Consumers with Redis Mutex'
    ],
    metrics: {
      'Throughput': '15k+ Peak TPS',
      'P99 Latency': '3.5s -> 138ms',
      'Oversell Rate': '0.00% Defect Rate',
      'Compute Spend': '-42% ($28k to $16.2k/mo)'
    },
    diagramNodes: [
      'Client / Mobile App Ingress',
      'Kong API Gateway (Rate Limiter)',
      'Order Service (Spring Boot 3 Outbox)',
      'Debezium Outbox CDC (Log Miner)',
      'Apache Kafka Cluster (order.placed)',
      'Inventory & Payment Consumers'
    ],
    adr: {
      adrId: 'ADR-002',
      title: 'Choreographed Saga & Transactional Outbox vs Two-Phase Commit (2PC)',
      status: 'ACCEPTED & IMPLEMENTED',
      contextAndScaleBottleneck: 'Coordinating order checkout, inventory reservation, and payment processing under 15,000+ TPS flash-sale surges. Synchronous Two-Phase Commit (2PC) coordinators introduced distributed locks and cascading deadlocks that degraded checkout response latency to over 3.5 seconds.',
      architectureChosen: 'Architected an asynchronous Choreographed Saga pattern with Transactional Outbox. Order services commit business entities and outbox events in a single atomic ACID transaction; Debezium CDC tails the PostgreSQL WAL to publish order events to partitioned Apache Kafka topics for idempotent processing.',
      tradeOffAccepted: 'Accepted eventual consistency replication lag (averaging 35ms) and the engineering complexity of implementing explicit compensating transactions (such as automatic inventory replenishment on payment rejection) in place of immediate global ACID consistency.',
      verificationAndTelemetry: 'Load testing at 15,000 TPS demonstrated P99 checkout latency dropped from 3.5s to 138ms, with 0.00% double-spend or overselling anomalies across 500,000 simulated orders, while Kubernetes HPA worker scaling reduced cloud compute expenses by 42% ($28,000 to $16,240/mo).',
      context: 'Coordinating order checkout, inventory reservation, and payment processing under 15,000+ TPS flash-sale surges. Synchronous Two-Phase Commit (2PC) coordinators introduced distributed locks and cascading deadlocks that degraded checkout response latency to over 3.5 seconds.',
      decision: 'Architected an asynchronous Choreographed Saga pattern with Transactional Outbox. Order services commit business entities and outbox events in a single atomic ACID transaction; Debezium CDC tails the PostgreSQL WAL to publish order events to partitioned Apache Kafka topics for idempotent processing.',
      tradeOffs: [
        'Replaced blocking distributed transaction coordinators with asynchronous event choreography.',
        'Sustained 15,000+ peak TPS with zero inventory oversell anomalies.',
        'Accepted eventual consistency lag (average 35ms), writing compensating handlers for order cancellation workflows.'
      ],
      consequences: 'Eliminated flash-sale downtime, dropped P99 checkout latency from 3.5s to 138ms, and sustained zero oversell defects under 15,000 TPS.'
    },
    problemsSolved: [
      'Eliminated 2PC database deadlocks, dropping P99 checkout latency from 3.5s to 138ms via asynchronous Kafka event streaming',
      'Prevented inventory overselling anomalies during 15,000 TPS flash sales through Redis Redisson distributed mutex leases',
      'Guaranteed zero message loss dual-writes using PostgreSQL Transactional Outbox tailed by Debezium CDC into Kafka',
      'Lowered monthly cloud compute bills by 42% ($28,000 to $16,240/mo) via Kubernetes Karpenter spot instance bin-packing'
    ],
    details: {
      challenge: 'A legacy retail monolith frequently crashed under flash-sale spikes of 15,000 RPS, suffered database deadlocks, and required hours of maintenance windows for releases.',
      solution: 'Re-architected the checkout flow into autonomous microservices with Choreographed Saga orchestration, Transactional Outbox pattern (Debezium CDC), and idempotent Kafka consumers backed by Redis distributed leases.',
      architecture: 'Client -> Kong API Gateway -> Order Service -> Postgres Outbox Table -> Debezium CDC -> Kafka (order.placed) -> Payment & Inventory Consumers.',
      impact: 'Achieved 99.99% uptime, handled over 500,000 daily orders without loss, and cut monthly cloud infrastructure spend by 42% ($28k to $16.2k/mo).'
    },
    codeSnippet: `@Service
@RequiredArgsConstructor
public class OrderSagaCoordinator {
    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final RedissonClient redisson;

    @Transactional
    public OrderResponse checkout(CheckoutCommand cmd) {
        // Idempotency check via Redis distributed mutex
        RLock lock = redisson.getLock("checkout:user:" + cmd.getUserId());
        try {
            if (!lock.tryLock(3, 10, TimeUnit.SECONDS)) {
                throw new ConcurrentCheckoutException("Checkout in progress");
            }
            // 1. Persist domain entity
            Order order = orderRepository.save(Order.initiate(cmd));
            // 2. Transactional Outbox: atomic commit in same database transaction
            OutboxEvent event = OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(order.getId().toString())
                .eventType("OrderCreatedEvent")
                .payload(JsonMapper.toJson(new OrderCreatedEvent(order)))
                .build();
            outboxRepository.save(event); // Debezium CDC streams this to Kafka
            return OrderResponse.accepted(order.getId());
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }
}`,
    codeLanguage: 'Java 21 / Saga / Outbox',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack'
  },
  {
    id: 'realtime-platform',
    title: 'Low-Latency Financial Tick Streaming Mesh',
    category: 'Real-Time',
    tagline: 'Sub-20ms WebSocket Event Mesh for 50,000+ Concurrent Market Feeds',
    description: 'High-throughput financial tick streaming mesh and live order-book aggregation engine delivering sub-20ms market updates to 50,000+ concurrent subscribers via WebSocket clustering, Redis Pub/Sub backplane, and React 19 optimistic rendering.',
    clientType: 'For Financial Market Data & High-Frequency Trading Portals',
    tech: ['React 19', 'TypeScript', 'Node.js', 'Spring Cloud', 'WebSocket', 'Redis Pub/Sub', 'TimescaleDB'],
    problemStatement: 'A financial market data portal suffered 4,200ms HTTP polling latency, 85% server CPU saturation, and frequent dropped packets when broadcasting high-volume tick updates to 50,000+ active traders.',
    architectureHighlights: [
      'Clustered WebSocket Gateway Mesh',
      'Redis Pub/Sub Distributed Backplane',
      'React 19 Optimistic State Reconciliation'
    ],
    metrics: {
      'Fanout Latency': '4,200ms -> 18ms',
      'Concurrent Feeds': '50,000+ Active Traders',
      'Egress Bandwidth': '-78% (1.8Gbps -> 390Mbps)',
      'Throughput': '1.2M+ ticks/min'
    },
    diagramNodes: [
      'Trader React 19 Client',
      'Nginx Edge TLS 1.3 Termination',
      'Spring WebSocket Gateway Pods',
      'Redis Pub/Sub Clustered Backplane',
      'TimescaleDB Historical Tick Store'
    ],
    adr: {
      adrId: 'ADR-003',
      title: 'Redis Clustered Pub/Sub Backplane for Horizontal WebSocket Fanout vs HTTP Polling',
      status: 'ACCEPTED & IMPLEMENTED',
      contextAndScaleBottleneck: 'Broadcasting high-frequency financial tick data and order-book snapshots to 50,000+ concurrent market participants. Periodic 4-second HTTP polling overwhelmed edge load balancers, saturated server network bandwidth at 1.8 Gbps, and introduced intolerable 4,200ms price dissemination lag.',
      architectureChosen: 'Deployed a horizontal mesh of stateless Spring WebSocket gateway pods interconnected by a Redis Clustered Pub/Sub in-memory backplane, delivering tick delta broadcasts directly to React 19 clients using binary ArrayBuffer encodings.',
      tradeOffAccepted: 'Accepted in-memory Redis message buffer limits (requiring strict backpressure policies and client drop-frame strategies under network congestion) in exchange for eliminating polling round-trip HTTP request overhead.',
      verificationAndTelemetry: 'Production benchmark telemetry confirmed message dissemination latency plummeted from 4,200ms to 18ms P99 across 50,000 simultaneous connections, while server egress bandwidth consumption dropped 78% (from 1.8 Gbps to 390 Mbps) handling 1.2M+ ticks per minute.',
      context: 'Broadcasting high-frequency financial tick data and order-book snapshots to 50,000+ concurrent market participants. Periodic 4-second HTTP polling overwhelmed edge load balancers, saturated server network bandwidth at 1.8 Gbps, and introduced intolerable 4,200ms price dissemination lag.',
      decision: 'Deployed a horizontal mesh of stateless Spring WebSocket gateway pods interconnected by a Redis Clustered Pub/Sub in-memory backplane, delivering tick delta broadcasts directly to React 19 clients using binary ArrayBuffer encodings.',
      tradeOffs: [
        'Eliminated HTTP polling headers and connection handshakes, shrinking network egress bandwidth by 78%.',
        'Reduced price broadcast propagation latency from 4,200ms to 18ms across 50,000 concurrent sockets.',
        'Accepted memory-bounded broker buffers, implementing drop-oldest backpressure heuristics for slow consumers.'
      ],
      consequences: 'Slashed tick broadcast latency from 4,200ms to 18ms, reduced server bandwidth by 78% (1.8 Gbps to 390 Mbps), and sustained 50,000+ concurrent market streams.'
    },
    problemsSolved: [
      'Reduced tick update dissemination latency from 4,200ms to 18ms via clustered WebSocket connections and Redis Pub/Sub',
      'Cut network egress bandwidth by 78% (1.8 Gbps to 390 Mbps) by replacing repetitive HTTP polling with persistent binary WebSockets',
      'Eliminated database CPU spikes by decoupling real-time broadcast fanout from relational persistence engines',
      'Maintained sustained 60 FPS UI rendering under peak tick volume using React 19 concurrent transitions and optimistic tick reconciliation'
    ],
    details: {
      challenge: 'High-frequency market price feeds delivered via HTTP polling suffered 4.2-second delays, high server CPU load, and network saturation during volatile market open spikes.',
      solution: 'Engineered a stateful WebSocket connection mesh coordinated by an in-memory Redis Pub/Sub backplane, delivering sub-20ms tick broadcasts to 50,000+ persistent browser sessions.',
      architecture: 'Trader React 19 SPA <-> Nginx Load Balancer <-> Spring WebSocket Gateway Pods <-> Redis Pub/Sub Mesh <-> TimescaleDB Tick Store.',
      impact: 'Reduced tick sync latency from 4,200ms to 18ms, trimmed egress network overhead by 78% (1.8 Gbps to 390 Mbps), and sustained 1.2M+ messages/min under peak volatility.'
    },
    codeSnippet: `// Low-latency binary market tick subscription with auto-reconnect heartbeat
export function useFinancialTickSubscription(symbol: string, onTick: (tick: MarketTick) => void) {
  useEffect(() => {
    const ws = new WebSocket(\`\${TICK_STREAM_URL}/ticks/\${symbol}\`);
    ws.binaryType = 'arraybuffer';
    ws.onmessage = (event) => {
      try {
        const tick = decodeBinaryTickFrame(event.data as ArrayBuffer);
        onTick(tick);
      } catch (err) {
        console.error("Tick binary decode error:", err);
      }
    };
    return () => ws.close();
  }, [symbol, onTick]);
}`,
    codeLanguage: 'TypeScript / React 19',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack'
  },
  {
    id: 'fintech-gateway',
    title: 'PCI-DSS Double-Entry Ledger & Tokenization Vault',
    category: 'FinTech',
    tagline: 'PCI-DSS Compliant Payment Clearing & Cryptographic Double-Entry Ledger',
    description: 'High-security financial settlement engine and credit/debit transaction vault processing $10M+ daily payment volume with mathematical double-entry guarantees, zero double-spend anomalies, and AWS KMS envelope tokenization.',
    clientType: 'For Tier-1 Banking Rails, Payment Processors & FinTech Gateways',
    tech: ['Java 21', 'Spring Security', 'PostgreSQL', 'Redis', 'Docker', 'AWS KMS'],
    problemStatement: 'A payment clearing gateway suffered intermittent gateway network timeouts and duplicate transaction retries across partner banking rails, resulting in a 0.35% double-charge rate and a 6-hour manual nightly reconciliation bottleneck.',
    architectureHighlights: [
      'Cryptographic Idempotency Pipeline',
      'Append-Only Double-Entry Ledger',
      'AWS KMS Envelope Tokenization Vault'
    ],
    metrics: {
      'Daily Volume': '$10M+ Settlement',
      'Double-Spend Rate': '0.35% -> 0.00%',
      'P99 Latency': '820ms -> 84ms',
      'Reconciliation': '6 hrs -> 8 mins'
    },
    diagramNodes: [
      'Merchant Payment Client',
      'TLS 1.3 Ingress Guard (mTLS)',
      'Redis Idempotency Lease Filter',
      'Spring Security (AWS KMS Vault)',
      'PostgreSQL Double-Entry Ledger',
      'Bank Partner Settlement Rails'
    ],
    adr: {
      adrId: 'ADR-004',
      title: 'Cryptographic Idempotency Keys with Append-Only Double-Entry Ledger vs Mutable Balances',
      status: 'ACCEPTED & IMPLEMENTED',
      contextAndScaleBottleneck: 'Payment networks encounter packet loss, mobile retries, and network timeouts. Mutable balance records risked distributed race conditions, phantom ledger discrepancies, and a 0.35% duplicate charge rate during retry waves across partner banking rails.',
      architectureChosen: 'Implemented a multi-tier idempotency pipeline with Redis atomic distributed leases coupled with an append-only double-entry ledger where every transaction creates immutable debit and credit legs with SHA-256 hash chains, tokenizing cardholder data via AWS KMS envelope encryption.',
      tradeOffAccepted: 'Accepted write amplification (recording two immutable journal entries per transaction) and strict SERIALIZABLE isolation requirements on ledger accounts in exchange for guaranteed balance invariant consistency and automated audibility.',
      verificationAndTelemetry: 'Processed over $10M daily transaction volume with 0.00% double-spend defects (down from 0.35% baseline), collapsed nightly bank reconciliation runtime from 6 hours to 8 minutes via automated ledger balancing, and passed PCI-DSS Tier-1 security audits with zero findings.',
      context: 'Payment networks encounter packet loss, mobile retries, and network timeouts. Mutable balance records risked distributed race conditions, phantom ledger discrepancies, and a 0.35% duplicate charge rate during retry waves across partner banking rails.',
      decision: 'Implemented a multi-tier idempotency pipeline with Redis atomic distributed leases coupled with an append-only double-entry ledger where every transaction creates immutable debit and credit legs with SHA-256 hash chains, tokenizing cardholder data via AWS KMS envelope encryption.',
      tradeOffs: [
        'Enforced zero double-spend defects mathematically, eliminating a 0.35% duplicate transaction error rate.',
        'Collapsed nightly settlement reconciliation runtimes from 6 hours to 8 minutes.',
        'Accepted write amplification from append-only journal entries to ensure tamper-evident accounting trails.'
      ],
      consequences: 'Achieved zero double-spend anomalies across $10M+ daily settlement, cut reconciliation cycles from 6 hours to 8 minutes, and achieved PCI-DSS Tier 1 certification.'
    },
    problemsSolved: [
      'Eliminated payment duplicate charges (reduced from 0.35% to 0.00%) via Redis distributed mutex locks and cryptographic idempotency tokens',
      'Accelerated end-of-day banking reconciliation from 6 hours to 8 minutes using append-only double-entry ledger balancing',
      'Achieved full PCI-DSS Level 1 compliance by isolating PAN data in an AWS KMS envelope-encrypted tokenization vault',
      'Cut P99 payment gateway latency from 820ms to 84ms through connection pooling and asynchronous notification webhooks'
    ],
    details: {
      challenge: 'Handling multi-million dollar payment transactions with strict regulatory compliance, zero downtime tolerance, and guaranteed idempotent execution.',
      solution: 'Architected an idempotent payment execution pipeline with multi-layer token validation, AWS KMS envelope encryption, automated fraud risk scoring, and distributed reconciliation.',
      architecture: 'Payment Request -> API Gateway (TLS 1.3) -> Idempotency Filter -> Fraud Check Engine -> Core Gateway (AWS KMS) -> Bank Partner Settlement -> Cryptographic Audit Logger.',
      impact: 'Processed over $10M in daily volume without a single security failure, reduced reconciliation time by 90% (6 hours to 8 minutes), and passed PCI-DSS audits with zero findings.'
    },
    codeSnippet: `@Service
public class IdempotentPaymentExecutor {
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionReceipt processPayment(PaymentExecutionCommand cmd) {
        // Enforce cryptographic idempotency key check
        String key = "idem:" + cmd.getIdempotencyKey();
        if (Boolean.FALSE.equals(redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING", 60, TimeUnit.SECONDS))) {
            return transactionLedger.fetchPriorReceipt(cmd.getIdempotencyKey());
        }
        
        KmsToken tokenizedCard = securityVault.tokenize(cmd.getPayload());
        PaymentResult result = bankGateway.executeCharge(tokenizedCard, cmd.getAmount());
        return transactionLedger.recordAndSign(result);
    }
}`,
    codeLanguage: 'Java 21 / Security',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack'
  },
  {
    id: 'agentic-mcp-mesh',
    title: 'Autonomous Agentic Orchestrator & Model Context Protocol (MCP) Mesh',
    category: 'AI Systems & MCP',
    tagline: 'LangGraph ReAct DAG Checkpointing, Java 21 LTS MCP Tool Gateway & pgvector Memory',
    description: 'Enterprise autonomous AI agent orchestration mesh featuring LangGraph acyclic DAG state machine checkpointing, high-throughput Java 21 LTS Model Context Protocol (MCP) tool gateway, and pgvector HNSW episodic memory for sub-15ms semantic tool discovery.',
    clientType: 'For Enterprise AI Platforms, Autonomous Agentic Swarms & Developer Platforms',
    tech: ['Java 21 LTS', 'Spring AI', 'LangGraph', 'Python 3.12', 'pgvector', 'Redis 7.2', 'Docker', 'GraalVM'],
    problemStatement: 'Autonomous AI agents suffered from unpredictable token blowups ($450/incident), tool hallucination, infinite plan loops, and security risks when granted ambient host OS permissions without isolation.',
    architectureHighlights: [
      'Acyclic ReAct DAG State Machine',
      'Decoupled MCP JSON-RPC 2.0 Bus',
      'HNSW Vector Semantic Tool Discovery',
      'Ephemeral Docker Sandbox Isolation'
    ],
    metrics: {
      'Token Spend': '-76% Dynamic Discovery',
      'P99 Latency': '3.8ms MCP Handshake',
      'Safety Containment': '100% Cgroups Sandbox',
      'Task Success': '94.8% First-Pass Rate'
    },
    diagramNodes: [
      'LangGraph ReAct Agent',
      'pgvector Episodic Memory',
      'Java 21 MCP Gateway',
      'Docker Tool Sandbox',
      'Redis State Store'
    ],
    adr: {
      adrId: 'ADR-006',
      title: 'Decoupled Model Context Protocol (MCP) Mesh vs Monolithic Tool Calling',
      status: 'ACCEPTED & IMPLEMENTED',
      contextAndScaleBottleneck: 'Direct hardcoded tool calling in monolithic LLM apps leaked cloud API keys into prompt contexts and lacked runtime isolation. An errant agent code execution script could delete host directories or exhaust $500 in unbudgeted external API calls within minutes.',
      architectureChosen: 'Adopted Anthropic Model Context Protocol (MCP) over JSON-RPC 2.0 with a Java 21 LTS tool gateway, isolating all tool executions into ephemeral Docker containers with 512MB RAM cgroups and 30s watchdogs, paired with pgvector HNSW dynamic tool indexing.',
      tradeOffAccepted: 'Accepted slight JSON-RPC serialization overhead (<4ms) in exchange for absolute least-privilege security boundaries, dynamic token reduction, and zero ambient credential leakage.',
      verificationAndTelemetry: 'Cut prompt context consumption by 76% via semantic tool schema retrieval, eliminated 100% of unauthorized sandbox breakout attempts, and achieved 94.8% first-pass autonomous task completion across 5,000+ benchmark runs.',
      context: 'Direct hardcoded tool calling in monolithic LLM apps leaked cloud API keys into prompt contexts and lacked runtime isolation. An errant agent code execution script could delete host directories or exhaust $500 in unbudgeted external API calls within minutes.',
      decision: 'Adopted Anthropic Model Context Protocol (MCP) over JSON-RPC 2.0 with a Java 21 LTS tool gateway, isolating all tool executions into ephemeral Docker containers with 512MB RAM cgroups and 30s watchdogs, paired with pgvector HNSW dynamic tool indexing.',
      tradeOffs: [
        'Reduced token consumption by 76% via dynamic tool discovery rather than stuffing 50+ tool schemas into every prompt',
        'Isolated all tool executions in 512MB disposable containers to guarantee zero host pollution',
        'Accepted 3.8ms JSON-RPC wire latency overhead to decouple models from execution infrastructure'
      ],
      consequences: 'Secured 100% containment of tool code execution, prevented ambient credential leakage, and achieved sub-4ms tool dispatch latency.'
    },
    problemsSolved: [
      'Eliminated infinite plan loops through LangGraph acyclic DAG cycle detection and step spending ceilings',
      'Slashed prompt token costs by 76% using pgvector HNSW semantic tool schema retrieval',
      'Protected infrastructure with 100% containment via disposable Docker containers and Linux cgroups v2',
      'Achieved sub-4ms tool dispatch using Java 21 Virtual Threads (Project Loom) and JSON-RPC 2.0'
    ],
    details: {
      challenge: 'Orchestrating autonomous agents across enterprise databases and APIs without leaking credentials, hallucinating tool parameters, or runaway execution loops.',
      solution: 'Implemented an enterprise MCP mesh with LangGraph ReAct planning, vector tool schema retrieval, GraalVM native MCP gateway, and container sandboxing.',
      architecture: 'Agent Request -> LangGraph DAG Planner -> pgvector HNSW Discovery -> Java 21 MCP Gateway (JSON-RPC 2.0) -> Docker Sandbox (cgroups) -> Redis Raft Checkpoint.',
      impact: 'Saved 76% in context token spend, achieved 94.8% first-pass completion, and delivered 100% sandbox isolation.'
    },
    codeSnippet: `@Service
public class McpToolExecutionGateway {
    private final McpSchemaRegistry schemaRegistry;
    private final DockerSandboxPool sandboxPool;

    @Tool(name = "execute_sandboxed_command", description = "Executes command in ephemeral gVisor container")
    public ToolExecutionResult dispatch(JsonRpcToolCall call) {
        // Enforce least-privilege token validation without ambient secrets
        McpSecurityContext.validateCallerPermissions(call.callerToken(), call.toolName());

        // Spawn disposable container with 512MB cgroups limit and 30s watchdog
        try (ContainerSandbox sandbox = sandboxPool.acquireDisposable(512, Duration.ofSeconds(30))) {
            ExecutionOutput output = sandbox.runIsolated(call.parameters());
            return ToolExecutionResult.success(output.stdout(), output.exitCode());
        } catch (ContainerTimeoutException ex) {
            return ToolExecutionResult.failure("WATCHDOG_TIMEOUT_EXCEEDED", 124);
        }
    }
}`,
    codeLanguage: 'Java 21 / Spring AI',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack'
  }
]

export default function ProjectsShowcase() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null)
  const [modalActiveTab, setModalActiveTab] = useState<'blueprint' | 'adr' | 'lifecycle' | 'code'>('blueprint')
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (activeModalProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModalProject])

  const categories = ['All', 'Enterprise SaaS', 'Microservices', 'Real-Time', 'FinTech', 'AI Systems & MCP']

  const filteredProjects = selectedFilter === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === selectedFilter)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const openBlueprintModal = (project: Project) => {
    setActiveModalProject(project)
    setModalActiveTab('blueprint')
  }

  const openAdrModal = (project: Project) => {
    setActiveModalProject(project)
    setModalActiveTab('adr')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/50 mb-3 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>PRODUCTION SYSTEMS ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-editorial">
          Enterprise Systems & Interactive Architecture Workbenches
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
          Self-explanatory, event-driven distributed architectures with animated packet flows, zero-oversell mutexes, and high-concurrency microservices.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center sm:justify-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 sm:mb-12 w-full touch-scroll px-1">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedFilter(category)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs md:text-sm font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              selectedFilter === category
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {filteredProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="group rounded-2xl bg-[#090e18]/90 border border-slate-800/90 hover:border-emerald-500/50 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col justify-between specular-card"
          >
            <div>
              {/* Architecture Interactive Preview */}
              <div className="relative">
                <ByteByteGoDiagram 
                  systemId={project.id} 
                  variant="preview" 
                  onOpenWorkbench={() => openBlueprintModal(project)}
                />

                {/* Category Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900/90 border border-slate-700 text-cyan-300 backdrop-blur-md">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Project Body */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold truncate">
                    {project.clientType}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-editorial text-white group-hover:text-emerald-300 transition-colors mb-2">
                  {project.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-400 font-sans mb-3 leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Problem Statement Card */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 mb-3.5">
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Scale & Business Bottleneck</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>

                {/* Architecture Highlights */}
                <div className="mb-3.5">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Key Architectural Patterns</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.architectureHighlights.map(pattern => (
                      <span 
                        key={pattern}
                        className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-200"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Request Lifecycle Flow Preview */}
                <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800/90 mb-4 overflow-x-auto touch-scroll">
                  <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <GitBranch className="w-3 h-3 shrink-0" />
                      Request Lifecycle Flow
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">End-to-End</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-max py-0.5">
                    {project.diagramNodes.map((node, nIdx) => (
                      <div key={nIdx} className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-200 whitespace-nowrap shadow-sm">
                          {node}
                        </span>
                        {nIdx < project.diagramNodes.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-emerald-400/70 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 sm:py-3 border-y border-slate-800/80 mb-4">
                  {Object.entries(project.metrics).map(([label, val]) => (
                    <div key={label} className="text-center p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/60">
                      <div className="text-xs font-bold font-mono text-emerald-400">{val}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
                  {project.tech.map(t => (
                    <span 
                      key={t}
                      className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Footer Actions */}
            <div className="p-4 sm:p-6 pt-0 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openBlueprintModal(project)}
                  className="w-full text-xs font-mono min-h-[40px] flex items-center justify-center cursor-pointer active:scale-98 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 transition-all border-slate-700 text-slate-200"
                  aria-label={`View Architecture Blueprint for ${project.title}`}
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>View Architecture Blueprint</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openAdrModal(project)}
                  className="w-full text-xs font-mono min-h-[40px] flex items-center justify-center cursor-pointer active:scale-98 bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all border-slate-700 text-cyan-300"
                  aria-label={`Read Architectural Decision Record for ${project.title}`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  <span>Read ADR</span>
                </Button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-500">
                  {project.adr.adrId}: {project.adr.title.substring(0, 34)}...
                </span>
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label={`View Repository for ${project.title}`}
                  className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 hover:border-emerald-400 text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  title="View Source on GitHub"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source Code</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Project Detail Modal with Architecture Blueprint, ADR, & Code */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalProject(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md overscroll-contain"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-5xl max-h-[92dvh] sm:max-h-[92vh] overflow-y-auto overscroll-contain touch-scroll rounded-t-2xl sm:rounded-2xl bg-[#080d19] border border-slate-700 shadow-2xl z-10 p-4 sm:p-6 md:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-4 sm:mb-6 gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {activeModalProject.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{activeModalProject.clientType}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {activeModalProject.adr.adrId}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white leading-tight">
                    {activeModalProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-emerald-400 mt-1">
                    {activeModalProject.tagline}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModalProject(null)}
                  aria-label="Close project modal"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-slate-800 hover:border-red-400 hover:text-red-400 text-slate-400 transition-colors cursor-pointer flex items-center justify-center shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto touch-scroll">
                <button
                  onClick={() => setModalActiveTab('blueprint')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    modalActiveTab === 'blueprint'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Architecture Blueprint</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('adr')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    modalActiveTab === 'adr'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Architectural Decision Record (ADR)</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('lifecycle')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    modalActiveTab === 'lifecycle'
                      ? 'bg-purple-500 text-white font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Request Flow & Problems</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('code')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    modalActiveTab === 'code'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Implementation Code</span>
                </button>
              </div>

              {/* Modal Body: Active Tab Content */}
              <div className="space-y-6">
                {modalActiveTab === 'blueprint' && (
                  <div className="space-y-6">
                    {/* Interactive Workbench Visualizer */}
                    <div>
                      <ByteByteGoDiagram 
                        systemId={activeModalProject.id} 
                        variant="workbench" 
                      />
                    </div>

                    {/* Overview Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {Object.entries(activeModalProject.metrics).map(([k, v]) => (
                        <div key={k} className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                          <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">{v}</div>
                          <div className="text-[10px] sm:text-xs font-mono text-slate-400">{k}</div>
                        </div>
                      ))}
                    </div>

                    {/* Challenge & Solution Architecture */}
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-red-500/20">
                        <h5 className="text-[11px] sm:text-xs font-bold font-mono text-red-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 shrink-0" /> Architectural Challenge
                        </h5>
                        <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                          {activeModalProject.details.challenge}
                        </p>
                      </div>

                      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                        <h5 className="text-[11px] sm:text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 shrink-0" /> Engineering Solution
                        </h5>
                        <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                          {activeModalProject.details.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'adr' && (
                  <div className="space-y-5">
                    {/* ADR Header Banner */}
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold">
                            {activeModalProject.adr.adrId}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            [{activeModalProject.adr.status}]
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">Architecture Governance Standard</span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold font-editorial text-white mb-2">
                        {activeModalProject.adr.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                        Formal architectural record documenting context, evaluated trade-offs, and downstream engineering consequences.
                      </p>
                    </div>

                    {/* 1. Context & Scale Bottleneck */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        1. Context & Scale Bottleneck
                      </h5>
                      <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                        {activeModalProject.adr.contextAndScaleBottleneck}
                      </p>
                    </div>

                    {/* 2. Architecture Chosen */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                      <h5 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        2. Architecture Chosen
                      </h5>
                      <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                        {activeModalProject.adr.architectureChosen}
                      </p>
                    </div>

                    {/* 3. Trade-Off Accepted */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h5 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        3. Trade-Off Accepted
                      </h5>
                      <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                        {activeModalProject.adr.tradeOffAccepted}
                      </p>
                    </div>

                    {/* 4. Verification & Telemetry */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30">
                      <h5 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        4. Verification & Telemetry
                      </h5>
                      <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                        {activeModalProject.adr.verificationAndTelemetry}
                      </p>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'lifecycle' && (
                  <div className="space-y-6">
                    {/* Visual Node Flow */}
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <h5 className="text-xs sm:text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-emerald-400" />
                        Request Lifecycle & Network Path
                      </h5>
                      <div className="space-y-3">
                        {activeModalProject.diagramNodes.map((node, nIdx) => (
                          <div key={nIdx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              {nIdx + 1}
                            </span>
                            <div className="flex-1 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-mono text-white font-semibold">{node}</span>
                              <span className="text-[10px] font-mono text-slate-500">Tier {nIdx + 1} Subsystem</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Problems Solved Checklist */}
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold font-mono text-white mb-2 sm:mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        Key Problems Solved
                      </h5>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {activeModalProject.problemsSolved.map(prob => (
                          <div key={prob} className="flex items-start gap-2 text-xs font-sans text-slate-300 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{prob}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'code' && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#060a12]">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-[#0d1424] border-b border-slate-800">
                      <span className="text-[11px] sm:text-xs font-mono text-emerald-400 flex items-center gap-1.5 sm:gap-2 truncate">
                        <Terminal className="w-3.5 h-3.5 shrink-0" />
                        Production Implementation ({activeModalProject.codeLanguage})
                      </span>
                      <button
                        onClick={() => copyCode(activeModalProject.codeSnippet)}
                        aria-label="Copy production code snippet"
                        className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 sm:p-4 text-[11px] sm:text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                      {activeModalProject.codeSnippet}
                    </pre>
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Meena Kannan Architectural Portfolio</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveModalProject(null)} 
                      className="min-h-[40px] border-slate-700 text-slate-300"
                    >
                      Close
                    </Button>
                    <a href={activeModalProject.githubUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" className="min-h-[40px] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                        <Github className="w-4 h-4 mr-2" />
                        <span>View Repository</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
