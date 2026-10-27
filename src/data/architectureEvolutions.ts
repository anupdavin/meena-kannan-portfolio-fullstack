export interface ArchitectureMetricDelta {
  metric: string
  before: string
  after: string
  improvement: string
  deltaType: 'positive' | 'neutral'
}

export interface ArchitectureEvolutionItem {
  id: string
  systemName: string
  category: 'Enterprise SaaS' | 'Microservices' | 'Real-Time' | 'FinTech' | 'AI Systems & MCP'
  headline: string
  adrReference: string
  migrationStrategy: string
  legacyArchitecture: {
    title: string
    architectureType: string
    bottleneck: string
    antiPatterns: string[]
    telemetry: Record<string, string>
    codeSnippetTitle: string
    codeSnippet: string
  }
  modernArchitecture: {
    title: string
    architectureType: string
    solution: string
    invariantsEnforced: string[]
    telemetry: Record<string, string>
    codeSnippetTitle: string
    codeSnippet: string
  }
  keyDeltas: ArchitectureMetricDelta[]
}

export const ARCHITECTURE_EVOLUTIONS: ArchitectureEvolutionItem[] = [
  {
    id: 'saas-rls',
    systemName: 'Multi-Tenant B2B IAM Core',
    category: 'Enterprise SaaS',
    headline: 'Eliminating Database Connection Starvation & Noisy Neighbors via PostgreSQL RLS',
    adrReference: 'ADR-001',
    migrationStrategy: 'Phased Zero-Downtime Migration: Implemented composite (tenant_id, id) indexes, validated session-bound RLS policies on staging shadow traffic, and introduced PgBouncer transaction-mode connection pooling.',
    legacyArchitecture: {
      title: 'Legacy Monolith Database-per-Tenant Model',
      architectureType: 'Physical Database Fragmentation Anti-Pattern',
      bottleneck: 'Managing 1,200+ distinct database connection pools starved RDS compute resources at 200 concurrent tenants, producing 480ms P99 query latency and $12,000/mo cloud bills.',
      antiPatterns: [
        'Unpooled idle connection pools across 1,200 individual tenant schemas',
        'Noisy-neighbor query spikes causing cascading database connection timeouts',
        'Cross-tenant migration scripts requiring multi-hour maintenance downtime windows',
        'Absence of automated kernel-level row isolation policies'
      ],
      telemetry: {
        'P99 Latency': '480ms',
        'RDS Hosting Spend': '$12,000/mo',
        'Pool Saturation': '98.5% (starvation)',
        'Tenant Safety': 'Manual Audit Dependent'
      },
      codeSnippetTitle: 'Legacy: Unbounded Connection Pool per Tenant',
      codeSnippet: `// ANTI-PATTERN: Dynamically allocating HikariDataSource per tenant
public DataSource getTenantDataSource(String tenantId) {
    return tenantDataSources.computeIfAbsent(tenantId, id -> {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://db.prod:5432/tenant_" + id);
        config.setMaximumPoolSize(20); // 1,200 tenants * 20 = 24,000 idle conns!
        return new HikariDataSource(config);
    });
}`
    },
    modernArchitecture: {
      title: 'Shared-Schema PostgreSQL Row-Level Security (RLS) + PgBouncer',
      architectureType: 'Kernel-Enforced Tenant Partitioning',
      solution: 'Shared PostgreSQL 16 schema governed by kernel-level Row-Level Security policies tied to session variables, multiplexed through PgBouncer with tenant-scoped Redis L2 cache-aside.',
      invariantsEnforced: [
        'PostgreSQL RLS policies strictly bound to tenant session variables',
        'PgBouncer transaction-mode pooling capping active connections to 80',
        'Tenant-scoped Redis L2 cache keyspaces (tenant:{id}:entity:{uuid})',
        'Composite B-tree indexes on (tenant_id, created_at DESC) for sub-80ms scans'
      ],
      telemetry: {
        'P99 Latency': '78ms (-84%)',
        'RDS Hosting Spend': '$3,840/mo (-68%)',
        'Pool Saturation': '18% nominal',
        'Tenant Safety': '100% Kernel Enforced'
      },
      codeSnippetTitle: 'Modern: PostgreSQL RLS Policy & Session Binding',
      codeSnippet: `-- PRODUCTION INVARIANT: Kernel-enforced tenant isolation
CREATE POLICY tenant_isolation_policy ON enterprise_accounts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE enterprise_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_accounts FORCE ROW LEVEL SECURITY;`
    },
    keyDeltas: [
      { metric: 'P99 Query Latency', before: '480ms', after: '78ms', improvement: '-84% faster response', deltaType: 'positive' },
      { metric: 'Monthly RDS Host Spend', before: '$12,000/mo', after: '$3,840/mo', improvement: '-68% cost reduction', deltaType: 'positive' },
      { metric: 'Active DB Connections', before: '2,400+ conns', after: '80 pooled conns', improvement: '-96% pool compression', deltaType: 'positive' },
      { metric: 'Data Isolation SLA', before: 'App-tier checks', after: 'Postgres RLS kernel', improvement: '100% cryptographically guaranteed', deltaType: 'positive' }
    ]
  },
  {
    id: 'saga-outbox',
    systemName: 'Distributed E-Commerce Checkout',
    category: 'Microservices',
    headline: 'Replacing Blocking Two-Phase Commit (2PC) with Choreographed Saga & Debezium CDC',
    adrReference: 'ADR-002',
    migrationStrategy: 'Eventual Consistency Transition: Replaced synchronous REST distributed transaction locks with transactional outbox tables tailed by Debezium CDC into Apache Kafka, backed by automated compensating transactions.',
    legacyArchitecture: {
      title: 'Synchronous Two-Phase Commit (2PC) & REST Locks',
      architectureType: 'Distributed Lock Contention Anti-Pattern',
      bottleneck: 'Coordinating inventory, payment, and order microservices through blocking 2PC locks collapsed under 15,000 RPS flash-sale surges with 3.5s latency and distributed deadlocks.',
      antiPatterns: [
        'Distributed two-phase commit transactions holding row locks across services',
        'Synchronous REST daisy-chains where 1 slow service blocks the entire thread pool',
        'Dual-write race conditions producing phantom inventory overselling',
        'Cascading service timeouts causing cascading blast-radius failures'
      ],
      telemetry: {
        'Throughput Ceiling': '850 TPS',
        'P99 Latency': '3,500ms',
        'Oversell Defect Rate': '0.42%',
        'Deadlock Frequency': '18 per hour'
      },
      codeSnippetTitle: 'Legacy: Blocking Two-Phase Commit Coordinator',
      codeSnippet: `// ANTI-PATTERN: Synchronous 2PC coordinator holding remote locks
@Transactional(timeout = 30)
public OrderReceipt checkoutLegacy(OrderCommand cmd) {
    inventoryClient.lockStock(cmd.getItemId(), cmd.getQty()); // Remote HTTP lock!
    paymentGateway.chargeCard(cmd.getPaymentMethod(), cmd.getAmount());
    shippingClient.reserveSlot(cmd.getShippingAddress());
    return orderRepository.save(new Order(cmd)); // High risk of distributed deadlock!
}`
    },
    modernArchitecture: {
      title: 'Asynchronous Choreographed Saga with Transactional Outbox (Debezium CDC)',
      architectureType: 'Event-Driven Non-Blocking Consistency',
      solution: 'Asynchronous Saga orchestration driven by Debezium CDC tailing PostgreSQL WAL into partitioned Kafka topics, coordinated by Redis distributed mutex leases and automated compensations.',
      invariantsEnforced: [
        'Atomic local commits with Transactional Outbox table in same ACID boundary',
        'Debezium CDC tailing WAL to eliminate dual-write partial failures',
        'Idempotent Kafka consumers tracking processed message IDs in Redis',
        'Automated reverse compensating transactions restoring balance in <180ms'
      ],
      telemetry: {
        'Throughput Ceiling': '15,000+ Sustained TPS',
        'P99 Latency': '138ms (-96%)',
        'Oversell Defect Rate': '0.00% Zero Defects',
        'Deadlock Frequency': '0 (Locks eliminated)'
      },
      codeSnippetTitle: 'Modern: Transactional Outbox with Debezium CDC',
      codeSnippet: `// PRODUCTION INVARIANT: Atomic local write with Transactional Outbox
@Transactional
public OrderPlacedResult processCheckout(OrderCommand cmd) {
    Order order = orderRepository.save(Order.createPending(cmd));
    outboxRepository.save(new OutboxEvent(
        "ORDER_PLACED", 
        order.getId(), 
        jsonSerializer.serialize(order)
    ));
    return new OrderPlacedResult(order.getId(), OrderStatus.ACCEPTED);
}`
    },
    keyDeltas: [
      { metric: 'Peak Order Throughput', before: '850 TPS', after: '15,000+ TPS', improvement: '17.6x throughput scale', deltaType: 'positive' },
      { metric: 'P99 Checkout Latency', before: '3,500ms', after: '138ms', improvement: '-96% latency drop', deltaType: 'positive' },
      { metric: 'Flash-Sale Overselling', before: '0.42% error rate', after: '0.00% zero defects', improvement: 'Zero double-spend rate', deltaType: 'positive' },
      { metric: 'Distributed Deadlocks', before: '18 / hour', after: '0 (event-driven)', improvement: 'Complete elimination', deltaType: 'positive' }
    ]
  },
  {
    id: 'virtual-threads',
    systemName: 'Real-Time Streaming Engine',
    category: 'Real-Time',
    headline: 'Scaling from 8,000 to 50,000+ WebSockets via Java 21 Virtual Threads & Redis Pub/Sub',
    adrReference: 'ADR-003',
    migrationStrategy: 'Concurrency Modernization: Replaced synchronous OS platform thread-per-connection thread pools with Java 21 Project Loom virtual threads and Redis channel sharding, preserving synchronous code readability.',
    legacyArchitecture: {
      title: 'Synchronous OS Thread-per-Connection Dispatcher',
      architectureType: 'Kernel OS Thread Memory Saturation',
      bottleneck: 'Heavy OS platform threads (1MB stack per thread) exhausted JVM memory at 8,000 concurrent WebSockets, triggering OutOfMemoryError crashes and 450ms multi-region broadcast lag.',
      antiPatterns: [
        '1:1 mapping of WebSocket connection to 1MB OS platform kernel thread',
        'Thread pool exhaustion under sudden traffic bursts or network disconnects',
        'Unpartitioned single Redis channel causing broadcast lock contention',
        'Complex non-blocking callback pyramids difficult to trace and debug'
      ],
      telemetry: {
        'Max Concurrent WS': '8,000 connections',
        'JVM Heap Consumption': '14.2 GB under load',
        'Sync Broadcast P99': '450ms',
        'Thread Context Switches': '42,000 / sec'
      },
      codeSnippetTitle: 'Legacy: Heavy Platform Thread Pool Allocation',
      codeSnippet: `// ANTI-PATTERN: Fixed pool of heavy 1MB OS platform threads
ExecutorService legacyPool = Executors.newFixedThreadPool(1000);
public void handleWebSocket(WebSocketSession session) {
    legacyPool.submit(() -> {
        while (session.isOpen()) {
            Message msg = session.readBlocking(); // Holds 1MB OS thread captive!
            broadcastToClients(msg);
        }
    });
}`
    },
    modernArchitecture: {
      title: 'Java 21 Virtual Threads (Project Loom) + Sharded Redis Pub/Sub',
      architectureType: 'User-Mode Fiber Multiplexing',
      solution: 'Java 21 Virtual Threads spawned per WebSocket session with sub-kilobyte heap footprints, backed by consistent-hash sharded Redis Pub/Sub channels for sub-20ms broadcast.',
      invariantsEnforced: [
        'Virtual threads unmount from carrier threads during blocking I/O',
        'Consistent-hash Redis channel partitioning across 16 shards',
        'Optimistic state merging with vector clocks for collaborative edits',
        'Standard synchronous debugging stack traces with zero async callback fragmentation'
      ],
      telemetry: {
        'Max Concurrent WS': '50,000+ connections',
        'JVM Heap Consumption': '3.8 GB (-72%)',
        'Sync Broadcast P99': '< 20ms (-95%)',
        'Thread Context Switches': '< 1,200 / sec'
      },
      codeSnippetTitle: 'Modern: Virtual Thread per Connection with Loom',
      codeSnippet: `// PRODUCTION INVARIANT: Java 21 lightweight virtual thread per session
ExecutorService virtualPool = Executors.newVirtualThreadPerTaskExecutor();
public void handleWebSocket(WebSocketSession session) {
    virtualPool.submit(() -> {
        while (session.isOpen()) {
            Message msg = session.readBlocking(); // Carrier thread released immediately!
            redisShardedBus.publish(session.getChannelId(), msg);
        }
    });
}`
    },
    keyDeltas: [
      { metric: 'Concurrent WebSocket Capacity', before: '8,000 conns', after: '50,000+ conns', improvement: '6.25x scale expansion', deltaType: 'positive' },
      { metric: 'JVM Heap Usage at Saturation', before: '14.2 GB', after: '3.8 GB', improvement: '-72% memory savings', deltaType: 'positive' },
      { metric: 'Cross-Region Broadcast Latency', before: '450ms', after: '< 20ms', improvement: '-95% latency reduction', deltaType: 'positive' },
      { metric: 'Carrier CPU Utilization', before: '92% (thrashing)', after: '24% (nominal)', improvement: 'Clean I/O offloading', deltaType: 'positive' }
    ]
  },
  {
    id: 'double-entry',
    systemName: 'FinTech Payment & Ledger Vault',
    category: 'FinTech',
    headline: 'Eliminating 0.35% Double-Spend Rate via Append-Only Cryptographic Double-Entry Ledger',
    adrReference: 'ADR-004',
    migrationStrategy: 'Auditing Transformation: Eliminated mutable balance UPDATE queries in favor of an append-only double-entry journal with SHA-256 hash chaining, distributed Redis idempotency leases, and AWS KMS card tokenization.',
    legacyArchitecture: {
      title: 'Mutable Account Balance Updates & Non-Idempotent Swipes',
      architectureType: 'Mutable State & Race Condition Anti-Pattern',
      bottleneck: 'Mobile retries and banking network timeouts generated distributed race conditions in mutable balance records, producing a 0.35% double-charge defect rate and 6-hour nightly reconciliation cycles.',
      antiPatterns: [
        'Direct "UPDATE accounts SET balance = balance - amount" without audit trail',
        'Lack of cryptographic idempotency tokens on client payment dispatch',
        'Cardholder PAN stored in application database with basic database encryption',
        'Manual database script reconciliation required every night'
      ],
      telemetry: {
        'Daily Settled Volume': '$1.2M',
        'Double-Charge Defect Rate': '0.35%',
        'Nightly Reconciliation': '6 hours',
        'PCI-DSS Compliance Level': 'Tier 3 (Gaps found)'
      },
      codeSnippetTitle: 'Legacy: Mutable Balance Race Condition',
      codeSnippet: `// ANTI-PATTERN: Direct mutable update prone to distributed race conditions
@Transactional
public void deductFunds(String accountId, BigDecimal amount) {
    Account acc = accountRepository.findById(accountId);
    acc.setBalance(acc.getBalance().subtract(amount)); // Write skew risk!
    accountRepository.save(acc);
    // If bank connection drops here, retry causes double deduction!
}`
    },
    modernArchitecture: {
      title: 'Append-Only Double-Entry Ledger with Cryptographic Hash Chaining & KMS',
      architectureType: 'Mathematical Balance Invariance',
      solution: 'Append-only ledger where every movement records immutable debit and credit legs with SHA-256 block hash chaining under SERIALIZABLE isolation, protected by Redis atomic idempotency leases and AWS KMS envelope tokenization.',
      invariantsEnforced: [
        'Total Debits must strictly equal Total Credits (Sum == 0.00)',
        'Redis distributed idempotency lock with UUIDv7 prevents replay within 60s',
        'Append-only journal entries sealed with SHA-256 cryptographic hash chain',
        'Cardholder data converted to non-reversible tokens via AWS KMS HSM envelope'
      ],
      telemetry: {
        'Daily Settled Volume': '$10M+ Settlement',
        'Double-Charge Defect Rate': '0.00% Zero Defects',
        'Nightly Reconciliation': '8 minutes (-97%)',
        'PCI-DSS Compliance Level': 'Tier 1 Certified (0 findings)'
      },
      codeSnippetTitle: 'Modern: Append-Only Double-Entry Journal',
      codeSnippet: `// PRODUCTION INVARIANT: Immutable double-entry with hash chaining
@Transactional(isolation = Isolation.SERIALIZABLE)
public LedgerReceipt postTransaction(PaymentCommand cmd) {
    LedgerEntry debitLeg = LedgerEntry.debit(cmd.getSourceAccount(), cmd.getAmount());
    LedgerEntry creditLeg = LedgerEntry.credit(cmd.getDestAccount(), cmd.getAmount());
    String priorHash = ledgerRepository.findLatestBlockHash();
    String chainHash = DigestUtils.sha256Hex(priorHash + debitLeg + creditLeg);
    return ledgerRepository.saveAllAndChain(List.of(debitLeg, creditLeg), chainHash);
}`
    },
    keyDeltas: [
      { metric: 'Double-Spend Defect Rate', before: '0.35% error rate', after: '0.00% zero defects', improvement: 'Zero double-spend anomalies', deltaType: 'positive' },
      { metric: 'Nightly Bank Reconciliation', before: '6 hours', after: '8 minutes', improvement: '-97% runtime acceleration', deltaType: 'positive' },
      { metric: 'Daily Transaction Capacity', before: '$1.2M / day', after: '$10M+ / day', improvement: '8.3x volume scaling', deltaType: 'positive' },
      { metric: 'Regulatory Compliance Audit', before: 'Tier 3 (3 findings)', after: 'Tier 1 (0 findings)', improvement: '100% audit pass rate', deltaType: 'positive' }
    ]
  },
  {
    id: 'mcp-mesh',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    category: 'AI Systems & MCP',
    headline: 'Slashing 76% Context Tokens & Preventing Breakouts via Decoupled Model Context Protocol Mesh',
    adrReference: 'ADR-006',
    migrationStrategy: 'Decoupled Protocol Migration: Transitioned from hardcoded monolithic tool prompt injections to an asynchronous Model Context Protocol (MCP) JSON-RPC 2.0 gateway with pgvector HNSW tool retrieval and disposable Docker sandboxes.',
    legacyArchitecture: {
      title: 'Monolithic Prompt-Stuffed Tool Calling & Ambient OS Access',
      architectureType: 'Prompt Saturation & Ambient Privilege Risk',
      bottleneck: 'Injecting 50+ tool schemas into every prompt exhausted context tokens ($450/incident), while granting uncontained host OS execution led to hallucinated file deletion risks.',
      antiPatterns: [
        'Stuffing all 50+ tool schemas into every model prompt regardless of task relevance',
        'Passing ambient cloud credentials and API keys directly into LLM prompt contexts',
        'Unrestricted host OS command execution without cgroups or container isolation',
        'Unbounded ReAct loops generating infinite recursion and unexpected $500 bills'
      ],
      telemetry: {
        'Tool Context Token Cost': '42,000 tokens / prompt',
        'First-Pass Success Rate': '68.2%',
        'Sandbox Isolation Level': '0% (ambient host permissions)',
        'Handshake Serialization': 'Non-standard custom JSON'
      },
      codeSnippetTitle: 'Legacy: Monolithic Prompt Schema Stuffing',
      codeSnippet: `// ANTI-PATTERN: Injecting all tool schemas directly into system prompt
String systemPrompt = "You are an assistant. Here are all 50 tools: " 
    + allTools.stream().map(Tool::getJsonSchema).collect(joining(", "))
    + "\\nRun commands on the host directly using Runtime.getRuntime().exec()";
// Exposes API keys, costs $0.15 per message, and risks host compromise!`
    },
    modernArchitecture: {
      title: 'Decoupled Java 21 MCP Gateway + pgvector HNSW & Docker Sandbox',
      architectureType: 'Least-Privilege JSON-RPC Protocol Bus',
      solution: 'Anthropic Model Context Protocol (MCP) JSON-RPC 2.0 bus over stdio/SSE with LangGraph ReAct DAG planning, pgvector semantic tool discovery, and disposable Docker sandboxes (512MB RAM, 30s watchdog).',
      invariantsEnforced: [
        'Dynamic semantic tool discovery via pgvector HNSW index (-76% tokens)',
        'Zero ambient credentials exposed to models; granular per-tool token authentication',
        'Hard 512MB RAM cap + 30-second SIGKILL watchdog via Linux cgroups v2',
        'LangGraph acyclic DAG validation preventing infinite plan recursion'
      ],
      telemetry: {
        'Tool Context Token Cost': '9,800 tokens (-76%)',
        'First-Pass Success Rate': '94.8% (+26.6%)',
        'Sandbox Isolation Level': '100% Cgroups Contained',
        'Handshake Serialization': 'JSON-RPC 2.0 over Stdio / SSE'
      },
      codeSnippetTitle: 'Modern: Decoupled MCP Tool Gateway Dispatcher',
      codeSnippet: `// PRODUCTION INVARIANT: Decoupled MCP tool execution in disposable sandbox
@Service
public class McpGatewayService {
    @Tool(name = "execute_sandboxed")
    public ToolResult execute(@Payload ToolCall call) {
        McpSecurityContext.verifyLeastPrivilegeToken(call.token());
        try (ContainerSandbox box = sandboxPool.acquire(512, Duration.ofSeconds(30))) {
            return box.runIsolated(call.parameters());
        } // Ephemeral container automatically destroyed on block exit!
    }
}`
    },
    keyDeltas: [
      { metric: 'Prompt Context Token Overhead', before: '42,000 tokens', after: '9,800 tokens', improvement: '-76% token cost savings', deltaType: 'positive' },
      { metric: 'Autonomous Task Completion', before: '68.2% first pass', after: '94.8% first pass', improvement: '+26.6% accuracy gain', deltaType: 'positive' },
      { metric: 'Runtime Isolation Security', before: 'Host OS permissions', after: 'gVisor + cgroups v2', improvement: '100% sandboxed containment', deltaType: 'positive' },
      { metric: 'Tool Dispatch Handshake', before: 'Custom JSON parse', after: 'JSON-RPC 2.0 Wire', improvement: '3.8ms P99 wire latency', deltaType: 'positive' }
    ]
  }
]
