import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from 'lucide-react'
import { ARCHITECTURAL_DECISIONS } from '@/data/architecturalDecisions'
import { ARCHITECTURAL_TRADEOFFS } from '@/data/architecturalTradeoffs'
import { ARCHITECTURE_SYSTEMS } from '@/data/architectureSystems'

interface HistoryEntry {
  command: string
  output: string | string[]
  isError?: boolean
}

const AVAILABLE_COMMANDS = [
  'help',
  'whoami',
  'skills',
  'projects',
  'project',
  'experience',
  'exp',
  'timeline',
  'contact',
  'hire',
  'architecture',
  'adr',
  'decisions',
  'tradeoffs',
  'compare',
  'find',
  'search',
  'stats',
  'metrics',
  'benchmark',
  'ai-codex',
  'codex',
  'bytebytego',
  'infographic',
  'poster',
  'ai',
  'ai-terms',
  'paradigms',
  'capacity',
  'sizing',
  'calculator',
  'mcp',
  'model-context-protocol',
  'resume',
  'curl-resume',
  'download',
  'clear',
  'echo',
  'date',
  'sudo',
  'easteregg'
]

const QUICK_CHIPS = [
  { label: '[ $ whoami ]', cmd: 'whoami' },
  { label: '[ $ architecture ]', cmd: 'architecture' },
  { label: '[ $ find kafka ]', cmd: 'find kafka' },
  { label: '[ $ tradeoffs ]', cmd: 'tradeoffs' },
  { label: '[ $ adr ]', cmd: 'adr' },
  { label: '[ $ bytebytego ]', cmd: 'bytebytego' },
  { label: '[ $ ai-codex ]', cmd: 'ai-codex' },
  { label: '[ $ capacity ]', cmd: 'capacity' },
  { label: '[ $ mcp ]', cmd: 'mcp' },
  { label: '[ $ skills ]', cmd: 'skills' },
  { label: '[ $ metrics ]', cmd: 'metrics' },
  { label: '[ $ contact ]', cmd: 'contact' },
  { label: '[ $ projects ]', cmd: 'projects' },
  { label: '[ $ hire ]', cmd: 'hire' },
  { label: '[ $ stats ]', cmd: 'stats' },
  { label: '[ $ help ]', cmd: 'help' }
]

const COMMAND_HELP = [
  'Available Commands:',
  '  help            - Show this command reference list',
  '  whoami          - Display Meena Kannan\'s professional background & role',
  '  skills          - Print summary of core technology stack & competencies',
  '  projects        - List featured systems, or type "project <id>" for deep architecture review',
  '  experience      - Output career journey, or type "experience <id>" for deep milestone review',
  '  find <query>    - Search cross-cutting architecture systems, ADRs, AI codex & trade-offs',
  '  tradeoffs       - Evaluate system design decision trade-offs (or "compare <topic>")',
  '  stats           - View production performance & impact metrics (99.99% SLA)',
  '  metrics         - Print live architecture cluster telemetry, throughput & cache stats',
  '  benchmark       - Run simulated synthetic latency benchmark across distributed services',
  '  bytebytego      - Display ByteByteGo 5-pillar AI systems architecture infographic',
  '  ai-codex        - Display ByteByteGo 5-pillar AI systems architecture codex',
  '  capacity        - Calculate AI architecture capacity, Vector DB RAM & RAG budgets',
  '  mcp             - Inspect enterprise Model Context Protocol (MCP) server architecture',
  '  architecture    - Display Clean Architecture, DDD & Saga design principles',
  '  adr             - Inspect enterprise Architectural Decision Records (ADR-001..ADR-006)',
  '  hire            - Check current availability & consulting engagement models',
  '  contact         - Display direct contact channels & copy-email action',
  '  resume          - Open / download senior solutions architect technical CV (PDF)',
  '  curl-resume     - Fetch resume metadata via curl-style output',
  '  download        - Download official PDF resume',
  '  date            - Show current system timestamp (UTC)',
  '  echo [text]     - Print arbitrary text to screen',
  '  clear           - Clear terminal history',
  '  easteregg       - Run a fun surprise terminal routine'
]

const PROJECT_DETAILS: Record<string, string[]> = {
  '1': [
    '--------------------------------------------------------------------------------',
    '[Project 1] Multi-Tenant B2B IAM & Subscription Core (Enterprise SaaS)',
    'Client Type : Tier-1 Enterprise B2B SaaS & Financial Platforms',
    'Tech Stack  : Java 21, Spring Boot 3, React 19, PostgreSQL, Redis, Docker, Flyway',
    '--------------------------------------------------------------------------------',
    'Problem Driver & Bottleneck:',
    '  Multi-tenant customers suffered database connection starvation and noisy-neighbor',
    '  query latency exceeding 480ms P99 across 1,200+ tenant accounts.',
    '',
    'Architecture Solution:',
    '  Hexagonal Architecture with PostgreSQL Row-Level Security (RLS) policies bound to',
    '  tenant session context in Spring Security filter chains + Redis L2 cache-aside.',
    '',
    'Production Impact Metrics:',
    '  + P99 Latency   : 480ms -> 78ms (-84%)',
    '  + RDS Hosting   : -68% ($12k -> $3.8k/mo spend reduction)',
    '  + Tenant Safety : 100% RLS Policy Isolation Pass',
    '  + Availability  : 99.99% Multi-AZ SLA Uptime',
    '',
    'Architectural Decision Record (ADR):',
    '  ADR-001: Row-Level Security Shared Schema vs Database-per-Tenant.',
    '  Accepted write amplification on tenant-filtered indexes to avoid idle pool exhaustion.',
    '--------------------------------------------------------------------------------'
  ],
  '2': [
    '--------------------------------------------------------------------------------',
    '[Project 2] Distributed Order Checkout & Saga Engine (Microservices)',
    'Client Type : High-Volume Retail & Global Supply Chains',
    'Tech Stack  : Spring Boot 3, Apache Kafka, Debezium CDC, Redis Cluster, EKS, RDS',
    '--------------------------------------------------------------------------------',
    'Problem Driver & Bottleneck:',
    '  Legacy retail monolith crashed under 15,000 RPS flash-sale surges, generating',
    '  distributed database deadlocks and checkout timeouts exceeding 3.5 seconds.',
    '',
    'Architecture Solution:',
    '  Asynchronous Choreographed Saga with Transactional Outbox (Debezium CDC tailing',
    '  PostgreSQL WAL). Idempotent consumers coordinate inventory with Redis mutex leases.',
    '',
    'Production Impact Metrics:',
    '  + Throughput    : 15,000+ Peak TPS Sustained',
    '  + P99 Latency   : 3.5s -> 138ms',
    '  + Overselling   : 0.00% Defect / Double-Spend Rate',
    '  + Compute Spend : -42% ($28k -> $16.2k/mo via Kubernetes HPA)',
    '',
    'Architectural Decision Record (ADR):',
    '  ADR-002: Choreographed Saga & Transactional Outbox vs Two-Phase Commit (2PC).',
    '  Accepted 35ms eventual consistency lag in exchange for zero distributed lock blocking.',
    '--------------------------------------------------------------------------------'
  ],
  '3': [
    '--------------------------------------------------------------------------------',
    '[Project 3] High-Throughput Real-Time Task & State Engine (Real-Time)',
    'Client Type : Collaborative Enterprise Workflow & Telemetry Platforms',
    'Tech Stack  : Java 21 Virtual Threads, Redis Pub/Sub, WebSockets, PostgreSQL, Docker',
    '--------------------------------------------------------------------------------',
    'Problem Driver & Bottleneck:',
    '  Traditional OS thread-per-connection exhausted JVM memory at 8,000 concurrent WebSockets,',
    '  causing connection drops and 450ms state propagation lag.',
    '',
    'Architecture Solution:',
    '  Java 21 Virtual Threads dispatcher paired with Redis Pub/Sub channel sharding for',
    '  cross-node broadcast and optimistic concurrency state merging.',
    '',
    'Production Impact Metrics:',
    '  + Concurrent WS : 50,000+ Concurrent WebSockets per Node',
    '  + Sync Latency  : <20ms Multi-Region Event Propagation',
    '  + Memory Footprint: -72% JVM Heap Usage under Full Connection Saturation',
    '',
    'Architectural Decision Record (ADR):',
    '  ADR-003: Java 21 Virtual Threads vs Reactive WebFlux for WebSockets.',
    '  Preserved synchronous debugging traces while achieving 50k+ connection capacity.',
    '--------------------------------------------------------------------------------'
  ],
  '4': [
    '--------------------------------------------------------------------------------',
    '[Project 4] FinTech Payment & Compliance Gateway (FinTech)',
    'Client Type : Regulated Payment Institutions & Cross-Border Money Movement',
    'Tech Stack  : Java 21, Spring Boot 3, AWS CloudHSM, PostgreSQL (Partitioned), Kafka',
    '--------------------------------------------------------------------------------',
    'Problem Driver & Bottleneck:',
    '  High-frequency financial transactions required double-entry immutable ledgers,',
    '  strict PCI-DSS tokenization, and zero-loss auditability under $10M+ daily volume.',
    '',
    'Architecture Solution:',
    '  Append-only double-entry ledger with cryptographic SHA-256 chain verification,',
    '  envelope encryption via AWS CloudHSM, and partition-keyed Kafka audit streams.',
    '',
    'Production Impact Metrics:',
    '  + Daily Volume  : $10M+ Daily Settled Volume',
    '  + Reconciliation: 100% Zero-Discrepancy Automated Daily Audits',
    '  + P99 Latency   : 65ms Signature Verification & Ledger Commit',
    '',
    'Architectural Decision Record (ADR):',
    '  ADR-004: Immutable Double-Entry Ledger with Cryptographic Hash Chaining.',
    '  Passed SOC-2 Type II and PCI-DSS Level 1 compliance with zero findings.',
    '--------------------------------------------------------------------------------'
  ],
  '5': [
    '--------------------------------------------------------------------------------',
    '[Project 5] Autonomous Agentic Orchestrator & MCP Mesh (AI Systems & MCP)',
    'Client Type : Enterprise AI Platforms, Autonomous Agentic Swarms & Developer Platforms',
    'Tech Stack  : Java 21 LTS, Spring AI, LangGraph, Python 3.12, pgvector, Redis 7.2, Docker',
    '--------------------------------------------------------------------------------',
    'Problem Driver & Bottleneck:',
    '  Autonomous AI agents suffered from unpredictable token blowups ($450/incident),',
    '  tool hallucination, infinite plan loops, and security risks from ambient credentials.',
    '',
    'Architecture Solution:',
    '  Acyclic ReAct DAG State Machine in LangGraph with dynamic semantic tool discovery via',
    '  pgvector HNSW indexes, Java 21 LTS MCP Gateway, and ephemeral Docker sandbox cgroups.',
    '',
    'Production Impact Metrics:',
    '  + Token Spend   : -76% Dynamic Schema Discovery',
    '  + P99 Latency   : 3.8ms MCP JSON-RPC Handshake',
    '  + Containment   : 100% Cgroups 512MB RAM & 30s Watchdog',
    '  + Task Success  : 94.8% First-Pass Autonomous Rate',
    '',
    'Architectural Decision Record (ADR):',
    '  ADR-006: Decoupled Model Context Protocol (MCP) Mesh vs Monolithic Tool Calling.',
    '  Secured least-privilege containment with zero ambient secrets exposed to models.',
    '--------------------------------------------------------------------------------'
  ]
}

const MILESTONE_DETAILS: Record<string, string[]> = {
  '1': [
    '--------------------------------------------------------------------------------',
    '[2022 - Present] Lead Full-Stack & Cloud Solutions Architect',
    'Domain   : Enterprise Cloud Modernization | Tier-1 Financial & SaaS (Singapore/Global)',
    'Scope    : Squad leadership (12+ engineers across 3 squads), monolith decomposition',
    '--------------------------------------------------------------------------------',
    'Architectural Deliverables & Impact:',
    '  * Zero-Downtime Microservices Migration: Decomposed legacy core into autonomous',
    '    Kafka event-driven services with Spring Boot 3 & Java 21 Virtual Threads.',
    '    Metric: System SLA improved 99.85% -> 99.99% under 12,000 peak req/s.',
    '  * AWS Cloud Spend Optimization: Cut monthly spend by 38% ($42,000 -> $26,000/mo)',
    '    via ECS Fargate Graviton, Karpenter spot bin-packing, and two-tier Redis caching.',
    '  * Squad Velocity & CI/CD: Automated GitHub Actions with Testcontainers validation,',
    '    slashing release turnaround from 48 hours to under 15 minutes.',
    'Key Patterns: Clean Architecture, Choreographed Saga, Transactional Outbox, Virtual Threads',
    '--------------------------------------------------------------------------------'
  ],
  '2': [
    '--------------------------------------------------------------------------------',
    '[2020 - 2022] Senior Full-Stack & Distributed Systems Engineer',
    'Domain   : Distributed Systems Core & High-Frequency Ingest Infrastructure (FinTech)',
    'Scope    : Non-blocking payment APIs, real-time WebSocket meshes, KMS tokenization',
    '--------------------------------------------------------------------------------',
    'Architectural Deliverables & Impact:',
    '  * High-Throughput APIs: Non-blocking REST & gRPC ingest pipelines serving 50k+ active',
    '    sessions with sub-90ms P99 latency during flash-trading surges.',
    '  * Real-Time Broadcast Latency: Clustered WebSocket mesh backed by Redis Pub/Sub,',
    '    reducing sync latency from 5,000ms HTTP polling to 18ms instant broadcasts.',
    '  * Zero-Leakage Data Security: AWS KMS envelope encryption and tokenized vault storage',
    '    passing SOC-2 Type II audit with zero findings across 3.5M+ customer records.',
    'Key Patterns: Clustered WebSockets, Redis Pub/Sub, Envelope Encryption, gRPC',
    '--------------------------------------------------------------------------------'
  ],
  '3': [
    '--------------------------------------------------------------------------------',
    '[2018 - 2020] Full-Stack Software Engineer',
    'Domain   : Enterprise SaaS & Workflow Automation',
    'Scope    : Multi-tenant billing engine, PostgreSQL query optimization, webhook queues',
    '--------------------------------------------------------------------------------',
    'Architectural Deliverables & Impact:',
    '  * Database Latency Reduction: Optimized SQL query plans and composite partial indexes',
    '    over 25M+ rows in PostgreSQL, reducing execution latency by 65%.',
    '  * Asynchronous Webhook Queue: Zero packet loss on $2M+ monthly transaction alerts.',
    '  * Automated Test Harness: JUnit & Mockito suites driving defect escapes down by 75%.',
    'Key Patterns: Hexagonal Architecture, Composite Indexing, Asynchronous Webhooks',
    '--------------------------------------------------------------------------------'
  ],
  '4': [
    '--------------------------------------------------------------------------------',
    '[2016 - 2018] Software Engineer & Solutions Developer',
    'Domain   : Relational Database Optimization & Enterprise Core Services',
    'Scope    : Inventory management systems, responsive portals, telemetry monitoring',
    '--------------------------------------------------------------------------------',
    'Architectural Deliverables & Impact:',
    '  * Relational DB Optimization: Tuned HikariCP connection pools, boosting reporting',
    '    throughput 4.2x from 250 to 1,050 queries per second (QPS).',
    '  * Modular Component Library: TypeScript & React UI system cutting release cycles from',
    '    6 weeks down to 3.5 weeks.',
    '  * Production Observability: Prometheus & Grafana alerting dropping MTTD from 45m to 4m.',
    'Key Patterns: HikariCP Pool Tuning, Prometheus Metrics, Modular UI Systems',
    '--------------------------------------------------------------------------------'
  ]
}

export default function InteractiveCli() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: 'welcome',
      output: [
        'MeenaOS Terminal v3.2.0 [x86_64-cloud-native-linux]',
        'Architecture Cluster: ONLINE • High-Performance Shell Ready.',
        'Type "help" to view commands, or click any quick-action chip directly above the prompt.',
        '--------------------------------------------------------------------------------'
      ]
    }
  ])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [executedCommands, setExecutedCommands] = useState<string[]>([])
  
  const terminalBodyRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isInitialMount = useRef(true)

  // Internal terminal container scroll (NEVER scrolls the window)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [history])

  const focusInputSafely = useCallback(() => {
    // Only auto-focus container clicks on pointer/desktop devices to avoid unwanted keyboard jumps on mobile
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [])

  const executeCommand = (cmdToRun: string) => {
    const rawCmd = cmdToRun.trim()
    if (!rawCmd) return

    setExecutedCommands(prev => [...prev, rawCmd])
    setHistoryIndex(null)

    const [cmd, ...args] = rawCmd.split(' ')
    const normalized = cmd.toLowerCase()
    let output: string | string[] = ''
    let isError = false

    switch (normalized) {
      case 'help':
        output = COMMAND_HELP
        break
      case 'whoami':
        output = [
          'Name       : Meena Kannan',
          'Role       : Senior Full-Stack Software Engineer & Cloud Solutions Architect',
          'Experience : 8+ Years building enterprise Java, Spring Boot 3, React 19 & AWS systems',
          'Focus Area : Clean Architecture, Choreographed Sagas, Distributed Microservices, Cloud Native',
          'Status     : OPEN to Senior / Staff / Architect roles & Strategic B2B Consulting',
          'Location   : Remote / Global (Singapore / India with US/EU timezone overlap)'
        ]
        break
      case 'skills':
        output = [
          '[Backend]       Java 21 LTS (Virtual Threads), Spring Boot 3, Spring Security, Spring Cloud, Node.js',
          '[Cloud/DevOps]  AWS (EKS, EC2, S3, RDS, Lambda), Docker, Kubernetes, Terraform, GitHub Actions CI/CD',
          '[Databases]     PostgreSQL (ACID/RLS), Redis cluster L2 caching, Apache Kafka (CDC Outbox), Flyway',
          '[Frontend]      React 19, TypeScript, Next.js, Tailwind CSS 4, Framer Motion, WebSockets',
          '[Architecture]  Clean Architecture, DDD, Choreographed Saga, Transactional Outbox, CQRS',
          '[AI Systems]    Model Context Protocol (MCP), RAG, pgvector (HNSW), Agentic AI Loops, LRMs'
        ]
        break
      case 'project':
      case 'projects': {
        const query = args[0]?.toLowerCase()
        if (query) {
          if (query === '1' || query.includes('saas') || query.includes('iam')) {
            output = PROJECT_DETAILS['1']
            break
          }
          if (query === '2' || query.includes('saga') || query.includes('ecommerce') || query.includes('checkout')) {
            output = PROJECT_DETAILS['2']
            break
          }
          if (query === '3' || query.includes('realtime') || query.includes('task') || query.includes('websocket')) {
            output = PROJECT_DETAILS['3']
            break
          }
          if (query === '4' || query.includes('fintech') || query.includes('payment') || query.includes('gateway')) {
            output = PROJECT_DETAILS['4']
            break
          }
          if (query === '5' || query.includes('ai') || query.includes('agent') || query.includes('mcp') || query.includes('mesh')) {
            output = PROJECT_DETAILS['5']
            break
          }
        }
        output = [
          'Enterprise Architecture Projects:',
          '  1. Multi-Tenant B2B IAM Core   : 1,200+ tenants, PostgreSQL RLS, 78ms P99, -68% RDS spend',
          '  2. Distributed Checkout Engine : 15k+ TPS, Choreographed Saga, Debezium CDC, Kafka',
          '  3. Real-Time Task Engine       : 50K+ WebSockets, Java 21 Virtual Threads, Redis Pub/Sub',
          '  4. FinTech Payment Gateway     : $10M+ daily volume, Immutable double-entry ledger, PCI-DSS',
          '  5. Agentic MCP Mesh Orchestrator: LangGraph ReAct DAG, Java 21 MCP Gateway, pgvector HNSW',
          '--------------------------------------------------------------------------------',
          'Tip: Type "project <id>" (e.g. "project 5" or "project mcp") to inspect deep architecture telemetry.'
        ]
        break
      }
      case 'stats':
        output = [
          'Production Impact Metrics:',
          '  * System SLA Uptime     : 99.99% Production Reliability',
          '  * Peak Throughput       : 15,000+ Transactions/Second (TPS)',
          '  * Database Query Speed  : -65% Latency Reduction via Redis L2 & Index Tuning',
          '  * Cloud Infrastructure  : 40% Monthly Spend Cut via EKS Autoscaling & Graviton',
          '  * CI/CD Deployment Time : 2 Days -> Under 15 Minutes'
        ]
        break
      case 'metrics':
        output = [
          'Enterprise Mesh Gateway Telemetry (Live Production Stats):',
          '  [Uptime SLA]            99.99% Availability across 3 AWS Availability Zones',
          '  [P99 Latency]           42.8ms (Sub-50ms target met)',
          '  [Peak Throughput]       15,450 Requests / Second (RPS)',
          '  [Active Pod Replicas]   12 Autonomous K8s Pods (Horizontal Pod Autoscaler)',
          '  [Cache Hit Ratio]       94.6% Multi-Tier L2 Redis Cluster',
          '  [Kafka Consumer Lag]    0 partitions lag (Real-Time CDC Streams)',
          '  [Cloud Cost Reduction]  -40% via AWS Graviton & Karpenter Dynamic Sizing'
        ]
        break
      case 'benchmark':
        output = [
          'Executing Synthetic Cluster Latency Benchmark (10,000 Concurrent Synthetic Probes)...',
          '  =============================================================',
          '  Connection: HTTP/2.0 TLSv1.3 | Target: api.mesh.production',
          '  [p50 Latency] :  12.4 ms',
          '  [p90 Latency] :  28.1 ms',
          '  [p95 Latency] :  36.5 ms',
          '  [p99 Latency] :  42.8 ms',
          '  [Error Rate]  :   0.00% (0 dropped frames, circuit breakers nominal)',
          '  =============================================================',
          'Result: All SLA benchmarks PASSED. Architecture ready for high-concurrency enterprise load.'
        ]
        break
      case 'bytebytego':
      case 'infographic':
      case 'poster':
      case 'ai-codex':
      case 'codex':
      case 'ai':
      case 'ai-terms':
      case 'paradigms': {
        const sub = args[0]?.toLowerCase()
        if (sub) {
          if (sub.includes('agent')) {
            output = [
              '--------------------------------------------------------------------------------',
              '[AI Paradigm 1] Agentic AI (Autonomous Perception-Action Systems)',
              'Category      : Autonomous Systems',
              'Protocol      : ReAct / Plan-and-Solve (DAG Loop)',
              'Latency Target: < 2.5s per reasoning iteration',
              'Production Stk: Python LangGraph, Java 21 Spring AI, Docker Sandboxes',
              '--------------------------------------------------------------------------------',
              'Definition:',
              '  Goal-driven AI agent operating in continuous perception-action loops with',
              '  short-term and long-term memory, dynamic tool calling, and invariant checking.',
              '',
              'Key Invariant:',
              '  Dynamic acyclic dependency validation prevents deadlock loops in multi-agent routing.',
              '',
              'Real-World Deployments:',
              '  + AutoGPT, Devin, LangGraph Multi-Agent Workflows, Antigravity Autonomous Daemons',
              '--------------------------------------------------------------------------------'
            ]
            break
          }
          if (sub.includes('lrm') || sub.includes('reason')) {
            output = [
              '--------------------------------------------------------------------------------',
              '[AI Paradigm 2] Large Reasoning Models (LRM)',
              'Category      : Cognitive Models',
              'Protocol      : Chain-of-Thought (CoT) with Self-Reflection',
              'Latency Target: Adaptive test-time compute (5s - 60s)',
              'Production Stk: Reinforcement Learning via Verifiable Rewards (RLVR)',
              '--------------------------------------------------------------------------------',
              'Definition:',
              '  Multi-step reasoning LLM using deliberate test-time compute and chain-of-thought traces.',
              '',
              'Key Invariant:',
              '  Backtracking search over intermediate reasoning steps before final answer emission.',
              '',
              'Real-World Deployments:',
              '  + OpenAI o3/o4, DeepSeek-R1, Anthropic Claude Extended Thinking',
              '--------------------------------------------------------------------------------'
            ]
            break
          }
          if (sub.includes('vector')) {
            output = [
              '--------------------------------------------------------------------------------',
              '[AI Paradigm 3] Vector Database (High-Dimensional Semantic Indexing)',
              'Category      : Storage & Embeddings',
              'Protocol      : HNSW (Hierarchical Navigable Small World) / IVFFlat',
              'Latency Target: < 15ms P99 similarity retrieval',
              'Production Stk: PostgreSQL 16 + pgvector, Redis Vector Search, Qdrant',
              '--------------------------------------------------------------------------------',
              'Definition:',
              '  High-dimensional similarity search engine indexed for nearest neighbors over dense embeddings.',
              '',
              'Key Invariant:',
              '  Cosine and dot product distance calculation across 1,536d - 3,072d float vectors.',
              '',
              'Real-World Deployments:',
              '  + PostgreSQL pgvector, Pinecone, Weaviate, Milvus, Qdrant',
              '--------------------------------------------------------------------------------'
            ]
            break
          }
          if (sub.includes('rag')) {
            output = [
              '--------------------------------------------------------------------------------',
              '[AI Paradigm 4] Retrieval-Augmented Generation (RAG)',
              'Category      : Context Augmentation',
              'Protocol      : Hybrid Keyword (BM25) + Semantic Dense Vector Re-ranking',
              'Latency Target: < 180ms chunk retrieval + rerank',
              'Production Stk: LangChain, Cohere Rerank-3, AWS Bedrock Knowledge Bases',
              '--------------------------------------------------------------------------------',
              'Definition:',
              '  Grounding generative models with real-time enterprise external knowledge without fine-tuning.',
              '',
              'Key Invariant:',
              '  Strict provenance citation and context window boundary isolation prevents hallucinations.',
              '',
              'Real-World Deployments:',
              '  + Enterprise Legal & Financial RAG, Perplexity AI, ChatGPT with Files',
              '--------------------------------------------------------------------------------'
            ]
            break
          }
          if (sub.includes('mcp')) {
            output = [
              '--------------------------------------------------------------------------------',
              '[AI Paradigm 5] Model Context Protocol (MCP)',
              'Category      : Agent Protocols',
              'Protocol      : JSON-RPC 2.0 over Stdio / Server-Sent Events (SSE)',
              'Latency Target: < 8ms local tool discovery & handshake',
              'Production Stk: Java 21 LTS / Spring Boot 3 / GraalVM Native Image',
              '--------------------------------------------------------------------------------',
              'Definition:',
              '  Open standard protocol connecting AI models to secure local and cloud tools without credential leaks.',
              '',
              'Key Invariant:',
              '  Stateless tool declaration schemas with zero ambient authority and read-replica isolation.',
              '',
              'Real-World Deployments:',
              '  + Claude Desktop MCP, Cursor IDE MCP Tools, GitHub & PostgreSQL MCP Servers',
              '--------------------------------------------------------------------------------'
            ]
            break
          }
        }
        output = [
          'ByteByteGo AI & Distributed Systems Architecture Codex:',
          '  1. Agentic AI           : Goal-driven perception/action loop (Memory, Tools, Invariants)',
          '                            Stack: Python LangGraph, Java 21 Spring AI, Docker Sandboxes',
          '  2. Large Reasoning (LRM): Multi-step Chain-of-Thought (CoT) internal verification traces',
          '                            Stack: Test-Time Compute (RLVR), Self-Correction backtracking',
          '  3. Vector Database      : High-dimensional similarity search over dense embeddings',
          '                            Stack: PostgreSQL 16 + pgvector (HNSW Index), Qdrant',
          '  4. RAG Pipeline         : Hybrid BM25 keyword + semantic dense vector context augmentation',
          '                            Stack: LangChain, Cohere Rerank-3, AWS Bedrock Knowledge Bases',
          '  5. MCP Interface        : Model Context Protocol (Host -> Client -> MCP Server Tool bus)',
          '                            Stack: JSON-RPC 2.0 over Stdio/SSE, Claude Desktop & Cursor tools',
          '--------------------------------------------------------------------------------',
          'Tip: Type "ai agent", "ai lrm", "ai vector", "ai rag", or "ai mcp" for deep-dive specs.',
          'Interactive Visualizer: Live in the #architecture section ("AI Terms You Need to Know").'
        ]
        break
      }
      case 'capacity':
      case 'sizing':
      case 'calculator': {
        const sub = args[0]?.toLowerCase()
        if (sub === 'vector' || sub === 'vectordb') {
          output = [
            '--------------------------------------------------------------------------------',
            '[Capacity Sizing] Vector Database (pgvector / HNSW)',
            'Scale Metric  : 1,000,000 vectors @ 1536d (Float32)',
            'Raw Storage   : 5.72 GB (count * dim * 4 bytes)',
            'Graph Overhead: +7.15 GB (1.25x M=16 HNSW bidirectional edges)',
            'Total RAM Req : 15.44 GB (includes 20% OS page buffer)',
            'Search Latency: < 12ms p95 retrieval',
            'Recommended   : AWS r6g.xlarge (32GB RAM, 4 vCPU) with EBS gp3',
            'Key Invariant : HNSW graph index must reside 100% in RAM to prevent disk seeks.',
            '--------------------------------------------------------------------------------'
          ]
          break
        }
        if (sub === 'rag') {
          output = [
            '--------------------------------------------------------------------------------',
            '[Capacity Sizing] Retrieval-Augmented Generation (RAG)',
            'Retrieval     : Top-5 chunks @ 512 tokens = 2,560 context tokens',
            'Context Sat   : 2.0% of 128k context window',
            'Reranker p95  : < 35ms (Cohere Rerank-3 cross-encoder neural ranking)',
            'Daily Budget  : 50,000 queries -> $19.20/day (standard) -> $7.49/day (prompt-cached)',
            'Cloud Savings : 61% reduction via KV-cache reuse on common prefix documents',
            'Key Invariant : Isolated context boundaries eliminate prompt injection and dilution.',
            '--------------------------------------------------------------------------------'
          ]
          break
        }
        if (sub === 'lrm' || sub === 'reasoning') {
          output = [
            '--------------------------------------------------------------------------------',
            '[Capacity Sizing] Large Reasoning Model (Test-Time Compute)',
            'Reasoning Cap : 2,048 tokens per query (Medium effort)',
            'Verification  : 4 - 6 intermediate self-reflection CoT passes with backtracking',
            'Mean Latency  : ~6.4s end-to-end to verified solution',
            'Accuracy      : 97.8% empirical pass rate on formal verification suites',
            'Cluster Spec  : 4x NVIDIA H100 SXM5 with vLLM continuous batching',
            'Key Invariant : Deliberate test-time compute exchanges latency for logical correctness.',
            '--------------------------------------------------------------------------------'
          ]
          break
        }
        output = [
          'Enterprise Architecture Sizing & Capacity Simulator:',
          '  + capacity vector : Calculate Vector DB RAM, HNSW overhead, and AWS instance tier',
          '  + capacity rag    : Calculate RAG context window saturation, rerank latency & costs',
          '  + capacity lrm    : Calculate LRM test-time compute budget, latency & GPU cluster',
          '--------------------------------------------------------------------------------',
          'Interactive Visualizer: Select "Capacity Planner" tab in the #architecture-ai-codex section.'
        ]
        break
      }
      case 'experience':
      case 'exp':
      case 'timeline': {
        const query = args[0]?.toLowerCase()
        if (query) {
          if (query === '1' || query.includes('lead') || query.includes('recent') || query.includes('architect')) {
            output = MILESTONE_DETAILS['1']
            break
          }
          if (query === '2' || query.includes('fintech') || query.includes('distributed')) {
            output = MILESTONE_DETAILS['2']
            break
          }
          if (query === '3' || query.includes('saas') || query.includes('billing')) {
            output = MILESTONE_DETAILS['3']
            break
          }
          if (query === '4' || query.includes('web') || query.includes('inventory') || query.includes('core')) {
            output = MILESTONE_DETAILS['4']
            break
          }
        }
        output = [
          'Career Journey & Architecture Leadership Milestones:',
          '  [1] 2022 - Present : Lead Full-Stack & Solutions Architect (99.99% SLA, -38% AWS spend, 3 squads)',
          '  [2] 2020 - 2022    : Senior Full-Stack Engineer (50k+ sessions, 18ms sync, Zero-leakage KMS)',
          '  [3] 2018 - 2020    : Full-Stack Software Engineer (-65% SQL query latency over 25M+ rows)',
          '  [4] 2016 - 2018    : Software Engineer & Developer (4.2x DB throughput, 45m -> 4m MTTD)',
          '--------------------------------------------------------------------------------',
          'Tip: Type "experience <id>" (e.g. "experience 1" or "exp lead") for full metric details.'
        ]
        break
      }
      case 'contact':
        output = [
          'Direct Contact Channels:',
          '  Email    : meenakannan.dev@gmail.com (or click "Copy Email" in contact section)',
          '  LinkedIn : https://www.linkedin.com/in/meena-kannan',
          '  GitHub   : https://github.com/meenak95',
          '  Response : All enterprise B2B inquiries answered within 24 hours'
        ]
        break
      case 'hire':
        output = [
          'Availability: OPEN to new opportunities and strategic architecture contracts',
          'Primary Engagement Models:',
          '  1. Full-Time Senior / Lead / Staff Software Engineer or Cloud Solutions Architect',
          '  2. Enterprise Microservices Architecture & Modernization Consulting',
          '  3. Monolith to Distributed Microservices Decomposition (Saga + Kafka Outbox)',
          '  4. Full-Stack SaaS MVP to Resilient Production Architecture'
        ]
        break
      case 'architecture': {
        const sub = args[0]?.toLowerCase()
        if (sub === 'ai' || sub === 'codex' || args.some(a => a.toLowerCase().includes('ai') || a.toLowerCase().includes('codex'))) {
          output = [
            'Routing to ByteByteGo AI & Distributed Systems Architecture Codex (#architecture-ai-codex):',
            '  1. Agentic AI           : Goal-driven perception/action loop (Memory, Tools, Invariants)',
            '  2. Large Reasoning (LRM): Multi-step Chain-of-Thought (CoT) internal verification traces',
            '  3. Vector Database      : High-dimensional similarity search over dense embeddings',
            '  4. RAG Pipeline         : Hybrid BM25 keyword + semantic dense vector context augmentation',
            '  5. MCP Interface        : Model Context Protocol (Host -> Client -> MCP Server Tool bus)',
            '--------------------------------------------------------------------------------',
            'Interactive Visualizer: Live in #architecture-ai-codex ("AI Terms You Need to Know").'
          ]
          break
        }
        if (sub === 'adr' || sub === 'decisions' || args.some(a => a.toLowerCase().includes('adr'))) {
          output = [
            'Routing to Architectural Decision Records (ADR) Ledger (#architecture-adr-ledger):',
            '  - ADR-001: Choreographed Saga Pattern for Payment Processing',
            '  - ADR-002: Transactional Outbox Pattern with Debezium CDC',
            '  - ADR-003: Java 21 Virtual Threads for High-Throughput I/O',
            '  - ADR-004: Dual-Tier Caching Architecture (Caffeine L1 + Redis L2)',
            '  - ADR-005: Zero-Trust Envoy Edge Ingress with mTLS',
            '  - ADR-006: Model Context Protocol (MCP) Enterprise Architecture',
            '--------------------------------------------------------------------------------',
            'Interactive Explorer: Live in #architecture-adr-ledger.'
          ]
          break
        }
        if (sub === 'tradeoffs' || sub === 'compare' || args.some(a => a.toLowerCase().includes('tradeoff') || a.toLowerCase().includes('compare'))) {
          output = [
            'Routing to System Design Decision Matrix & Tradeoffs (#architecture-tradeoff-matrix):',
            '  1. Distributed Transactions : Choreographed Saga vs Orchestrated Saga vs Two-Phase Commit',
            '  2. AI Context Augmentation  : Hybrid RAG vs Domain Fine-Tuning vs In-Context Prompt Caching',
            '  3. Concurrency Runtimes     : Java 21 Virtual Threads vs Reactive WebFlux vs OS Platform Threads',
            '  4. Service Protocols        : gRPC Protobuf vs REST OpenAPI vs Model Context Protocol (MCP)',
            '--------------------------------------------------------------------------------',
            'Interactive Explorer: Live in #architecture-tradeoff-matrix.'
          ]
          break
        }
        if (sub === 'systems' || sub === 'workbench' || args.some(a => a.toLowerCase().includes('system') || a.toLowerCase().includes('workbench'))) {
          output = [
            'Routing to ByteByteGo Interactive Distributed Workbench (#architecture-workbench):',
            '  1. Cloud-Native SaaS Core : Multi-tenant auth, Redis cache cluster, PostgreSQL read replica',
            '  2. High-Throughput E-Commerce : Choreographed Saga, Kafka CDC outbox, order state machine',
            '  3. Real-Time Collaboration : 50K+ WebSockets, Redis pub/sub mesh, optimistic mutations',
            '  4. FinTech Payment Gateway : Tokenized vault, idempotent charge verification, KMS encryption',
            '--------------------------------------------------------------------------------',
            'Interactive Simulator: Live in #architecture-workbench with live chaos injection.'
          ]
          break
        }
        output = [
          'ByteByteGo Interactive Architecture Lab Navigator:',
          '--------------------------------------------------------------------------------',
          'Explore Meena Kannan\'s production distributed architectures & system designs:',
          '  [ 1 ] "architecture systems"   : 4 Enterprise Workbenches (#architecture-workbench)',
          '  [ 2 ] "architecture ai"        : 5-Pillar ByteByteGo AI Codex (#architecture-ai-codex)',
          '  [ 3 ] "architecture adr"       : 6 Production Governance ADRs (#architecture-adr-ledger)',
          '  [ 4 ] "architecture tradeoffs" : System Design Decision Matrix (#architecture-tradeoff-matrix)',
          '--------------------------------------------------------------------------------',
          'Clean Architecture Principles Enforced:',
          '  + Domain Isolation     : Core business domains decouple from libraries and vendor SDKs',
          '  + Dependency Inversion : High-level policies do not depend on low-level infrastructure',
          '  + Eventual Consistency : Choreographed Sagas replace blocking 2PC locks',
          '  + Zero Data Loss       : Transactional Outbox pattern guarantees atomic dual-writes'
        ]
        break
      }
      case 'adr':
      case 'decisions': {
        const targetId = args[0]?.toUpperCase()
        if (targetId) {
          const match = ARCHITECTURAL_DECISIONS.find(
            a => a.id.toUpperCase() === targetId || a.id.toUpperCase().endsWith(targetId.replace('ADR-', ''))
          )
          if (match) {
            output = [
              '--------------------------------------------------------------------------------',
              `[${match.id}] ${match.title}`,
              `Status: ${match.status} | Date: ${match.date} | Pattern: ${match.pattern}`,
              '--------------------------------------------------------------------------------',
              'Context:',
              `  ${match.context}`,
              '',
              'Decision:',
              `  ${match.decision}`,
              '',
              'Verified Outcomes:',
              ...match.consequences.positive.map(p => `  + ${p}`),
              '',
              'Tradeoffs & Constraints:',
              ...match.consequences.negative.map(n => `  - ${n}`),
              '',
              `Affected Services: ${match.affectedSystems.join(', ')}`,
              '--------------------------------------------------------------------------------'
            ]
            break
          }
        }
        output = [
          'Architectural Decision Records (ADR) Ledger:',
          '--------------------------------------------------------------------------------',
          ...ARCHITECTURAL_DECISIONS.map(a => `  [${a.id}] (${a.status}) ${a.title}`),
          '--------------------------------------------------------------------------------',
          'Tip: Type "adr <id>" (e.g. "adr ADR-001" or "adr 1") to view full context and tradeoffs.',
          'Full interactive viewer available above in #architecture.'
        ]
        break
      }
      case 'tradeoffs':
      case 'compare': {
        const subArg = args[0]?.toLowerCase()
        if (subArg) {
          const matched = ARCHITECTURAL_TRADEOFFS.find(t => 
            t.id === subArg ||
            t.id.includes(subArg) ||
            t.category.toLowerCase().includes(subArg) ||
            t.title.toLowerCase().includes(subArg)
          )
          if (matched) {
            output = [
              `Architectural Decision Matrix: ${matched.title}`,
              '--------------------------------------------------------------------------------',
              `Category : ${matched.category}`,
              `Scope    : ${matched.summary}`,
              '--------------------------------------------------------------------------------',
              'Paradigms Evaluated:',
              ...matched.options.flatMap((opt, idx) => [
                `  [Option ${String.fromCharCode(65 + idx)}] ${opt.name} (${opt.paradigm})`,
                `    Best For     : ${opt.bestFor}`,
                `    Avoid When   : ${opt.avoidWhen}`,
                `    Telemetry    : ${opt.productionMetric}`,
                `    Invariant    : ${opt.invariant}`
              ]),
              '--------------------------------------------------------------------------------',
              'Evaluation Scoring (1 - 5 Scale):',
              ...matched.criteria.map(c => 
                `  - ${c.label.padEnd(28, ' ')}: [A: ${c.scoreA}/5] [B: ${c.scoreB}/5] ${c.scoreC !== undefined ? `[C: ${c.scoreC}/5]` : ''} (${c.note})`
              ),
              '--------------------------------------------------------------------------------',
              'Principal Architect Production Verdict:',
              `  ${matched.productionVerdict}`,
              `  Case Study: ${matched.caseStudy}`
            ]
            break
          }
        }

        output = [
          'System Design Architectural Trade-Off Matrix:',
          '--------------------------------------------------------------------------------',
          'Evaluate multi-paradigm system design decisions, latency bounds, and invariants.',
          '',
          ...ARCHITECTURAL_TRADEOFFS.flatMap((t, idx) => [
            `${idx + 1}. [ ${t.id} ] : ${t.title}`,
            `   Category  : ${t.category}`,
            `   Paradigms : ${t.options.map(o => o.name).join(' vs ')}`,
            `   Deep Dive : "compare ${t.id.split('-')[0]}" (e.g. "compare saga", "compare ai", "compare concurrency", "compare service")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "compare saga" or "compare ai" for granular side-by-side evaluation metrics.'
        ]
        break
      }
      case 'find':
      case 'search': {
        const query = args.join(' ').toLowerCase().trim()
        if (!query) {
          output = [
            'Architecture Topology Search:',
            '--------------------------------------------------------------------------------',
            'Search cross-cutting distributed systems, ADRs, AI paradigms, and trade-offs.',
            'Usage: find <query> (e.g. "find kafka", "find redis", "find mcp", "find saga")',
            'Available Domains: Systems, ADR Governance, AI Codex, Trade-Off Matrix'
          ]
          break
        }

        const results: string[] = []

        // 1. Search Distributed Systems
        Object.values(ARCHITECTURE_SYSTEMS).forEach(s => {
          if (
            s.title.toLowerCase().includes(query) ||
            s.tagline.toLowerCase().includes(query) ||
            s.nodes.some(n => 
              n.label.toLowerCase().includes(query) ||
              n.sublabel.toLowerCase().includes(query) ||
              n.techBadge.toLowerCase().includes(query) ||
              n.specs.technology.toLowerCase().includes(query)
            )
          ) {
            results.push(
              `[Distributed System] ${s.title}`,
              `  Highlights : ${s.tagline}`,
              `  Anchor     : #architecture-workbench`,
              ''
            )
          }
        })

        // 2. Search AI Codex
        const aiTerms = [
          { name: 'Agentic AI', desc: 'Goal-driven perception/action loops, DAG memory, LangGraph workflows' },
          { name: 'Large Reasoning Model (LRM)', desc: 'Test-time compute, Chain-of-Thought (CoT), RLVR self-reflection' },
          { name: 'Vector Database', desc: 'HNSW indexing, pgvector similarity search, dense embeddings' },
          { name: 'Retrieval Augmented Generation (RAG)', desc: 'Hybrid BM25 keyword + dense vector rerank, context isolation' },
          { name: 'Model Context Protocol (MCP)', desc: 'JSON-RPC 2.0 tool server protocol, stdio/SSE transports' }
        ]
        aiTerms.forEach(t => {
          if (t.name.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query)) {
            results.push(
              `[AI Systems Codex] ${t.name}`,
              `  Concept    : ${t.desc}`,
              `  Anchor     : #architecture-ai-codex`,
              ''
            )
          }
        })

        // 3. Search ADRs
        ARCHITECTURAL_DECISIONS.forEach(a => {
          if (
            a.id.toLowerCase().includes(query) ||
            a.title.toLowerCase().includes(query) ||
            a.context.toLowerCase().includes(query) ||
            a.decision.toLowerCase().includes(query) ||
            a.pattern.toLowerCase().includes(query)
          ) {
            results.push(
              `[ADR Record] ${a.id}: ${a.title}`,
              `  Decision   : ${a.pattern} (${a.status})`,
              `  Anchor     : #architecture-adr-ledger`,
              ''
            )
          }
        })

        // 4. Search Trade-Offs
        ARCHITECTURAL_TRADEOFFS.forEach(t => {
          if (
            t.title.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.summary.toLowerCase().includes(query) ||
            t.productionVerdict.toLowerCase().includes(query) ||
            t.options.some(o => o.name.toLowerCase().includes(query) || o.paradigm.toLowerCase().includes(query))
          ) {
            results.push(
              `[Trade-Off Matrix] ${t.title}`,
              `  Verdict    : ${t.productionVerdict}`,
              `  Anchor     : #architecture-tradeoff-matrix`,
              ''
            )
          }
        })

        if (results.length === 0) {
          output = [
            `No direct architecture matches found for "${query}".`,
            'Try searching for: kafka, redis, mcp, postgres, saga, threads, or rag.',
            'Tip: Explore the live visual components in #architecture.'
          ]
        } else {
          output = [
            `Architecture Topology Search: "${query}" (${Math.floor(results.length / 4)} Pattern Matches)`,
            '--------------------------------------------------------------------------------',
            ...results,
            '--------------------------------------------------------------------------------',
            'Deep Navigation: Use Fast Jump anchors in #architecture to inspect live components.'
          ]
        }
        break
      }
      case 'mcp':
      case 'model-context-protocol':
        output = [
          'Model Context Protocol (MCP) Enterprise Architecture Specification:',
          '--------------------------------------------------------------------------------',
          'Protocol Spec   : Model Context Protocol (v2024-11-05 standard)',
          'Architecture    : MCP Host <--> Protocol Transport <--> MCP Server Tool Bus',
          'Supported Trans : stdio (local subprocess), Server-Sent Events (SSE / HTTP)',
          'Runtime Engine  : Java 21 LTS / Spring Boot 3 / GraalVM Native Image',
          '--------------------------------------------------------------------------------',
          'Enterprise Capabilities & Tool Handlers:',
          '  [Tools]     : query_database_topology, inspect_kafka_lag, simulate_chaos_partition',
          '  [Resources] : postgres://schema/audit_log, kafka://cluster/payment_events',
          '  [Prompts]   : architecture_audit_review, security_compliance_scan',
          '--------------------------------------------------------------------------------',
          'Zero-Trust Security Isolation:',
          '  + Read-only database topology queries execute against restricted read replicas',
          '  + Production DB credentials never leak to agent contexts or LLM prompts',
          '  + Tool invocations enforce strict schema validation via JSON-RPC 2.0',
          '--------------------------------------------------------------------------------',
          'Explore live: See "Model Context Protocol" in the ByteByteGo AI Architecture Codex.'
        ]
        break
      case 'resume':
      case 'download':
      case 'curl-resume':
        window.open('/Meena_Kannan_Senior_Architect_Resume.pdf', '_blank')
        output = [
          'HTTP/2 200 OK [Document: Meena_Kannan_Senior_Architect_Resume.pdf]',
          'Content-Type: application/pdf',
          'Content-Disposition: attachment; filename="Meena_Kannan_Senior_Architect_Resume.pdf"',
          'Status: Initiated PDF view & download in new tab.',
          'Direct Link: /Meena_Kannan_Senior_Architect_Resume.pdf',
          'Summary: 8+ Years Enterprise Architecture, Java 21 LTS, Spring Boot 3, React 19, AWS Cloud Native'
        ]
        break
      case 'date':
        output = `System UTC: ${new Date().toUTCString()}`
        break
      case 'echo':
        output = args.join(' ') || '(empty echo)'
        break
      case 'sudo':
        output = 'Permission denied: Meena is the supreme administrator of this cloud cluster.'
        break
      case 'clear':
      case 'cls':
        setHistory([])
        setInput('')
        return
      case 'easteregg':
        output = [
          '           __  __ _____ _____ _   _          ',
          '          |  \\/  | ____| ____| \\ | |   /\\    ',
          '          | |\\/| |  _| |  _| |  \\| |  /  \\   ',
          '          | |  | | |___| |___| |\\  | / /\\ \\  ',
          '          |_|  |_|_____|_____|_| \\_|/_/  \\_\\ ',
          '                                             ',
          '"Clean code always looks like it was written by someone who cares." (Robert C. Martin)'
        ]
        break
      default:
        output = `command not found: "${rawCmd}". Type "help" or click one of the quick chips above.`
        isError = true
    }

    setHistory(prev => [...prev, { command: rawCmd, output, isError }])
    setInput('')
  }

  const handleCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    executeCommand(input)
  }

  const handleQuickChipClick = (cmd: string) => {
    setInput(cmd)
    // Small timeout to allow input to visually reflect the command before execution
    setTimeout(() => {
      executeCommand(cmd)
    }, 40)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (executedCommands.length === 0) return
      const nextIdx = historyIndex === null ? executedCommands.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIdx)
      setInput(executedCommands[nextIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const nextIdx = historyIndex + 1
      if (nextIdx >= executedCommands.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(nextIdx)
        setInput(executedCommands[nextIdx])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const query = input.trim().toLowerCase()
      if (!query) return
      const matches = AVAILABLE_COMMANDS.filter(c => c.startsWith(query) || (input.length > 0 && c === input))
      if (matches.length === 1) {
        setInput(matches[0])
      } else if (matches.length > 1) {
        const currentIdx = matches.indexOf(input)
        const nextMatch = matches[(currentIdx + 1) % matches.length]
        setInput(nextMatch)
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50 mb-3">
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>$ /bin/interactive_shell --interactive</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white glow-text tracking-tight font-mono">
          Interactive Terminal CLI
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mt-2 font-mono text-xs sm:text-sm">
          Execute terminal commands or click the quick-action chips directly above the prompt to inspect architecture and stack.
        </p>
      </motion.div>

      {/* Terminal Shell Window */}
      <div 
        onClick={focusInputSafely} 
        className="rounded-2xl overflow-hidden border border-slate-800 bg-[#090e18]/95 shadow-2xl backdrop-blur-xl cursor-text"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0d1424] border-b border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/70" />
            <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-mono text-slate-400 flex items-center gap-1 sm:gap-1.5">
              <TerminalIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
              <span>meena@cloud:~</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 hidden sm:inline">
              [Enter] to submit • [Tab] autocomplete • [↑/↓] history
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setHistory([])
              }}
              title="Clear terminal"
              aria-label="Clear terminal history"
              className="text-slate-500 hover:text-red-400 transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal History - Scrollable container */}
        <div 
          ref={terminalBodyRef}
          aria-live="polite"
          aria-atomic="false"
          className="p-3 sm:p-5 font-mono text-[11px] sm:text-xs md:text-sm min-h-[260px] sm:min-h-[340px] max-h-[380px] sm:max-h-[480px] overflow-y-auto space-y-2.5 sm:space-y-3 leading-relaxed touch-scroll overscroll-contain"
        >
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 text-xs sm:text-sm">
                <span className="text-cyan-400">
                  <span className="hidden sm:inline">meena@cloud:~$</span>
                  <span className="sm:hidden">~$</span>
                </span>
                <span className="text-white">{item.command}</span>
              </div>
              <div className={`${item.isError ? 'text-red-400' : 'text-slate-300'} pl-2 sm:pl-4 text-[11px] sm:text-xs md:text-sm overflow-x-auto touch-scroll`}>
                {Array.isArray(item.output) ? (
                  item.output.map((line, lIdx) => (
                    <div key={lIdx} className="leading-relaxed whitespace-pre font-mono text-[10px] sm:text-xs md:text-sm">{line}</div>
                  ))
                ) : (
                  <div className="whitespace-pre-wrap break-words">{item.output}</div>
                )}
              </div>
            </div>
          ))}

          {/* Clickable Quick-Action Chips directly above terminal prompt */}
          <div className="pt-2 pb-1 border-t border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-scroll">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 shrink-0 select-none">
              Quick Run:
            </span>
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.cmd}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickChipClick(chip.cmd)
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0d1527] border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/15 text-emerald-300 hover:text-white font-mono text-[11px] transition-all cursor-pointer active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-sm"
                aria-label={`Execute command ${chip.cmd}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Active Prompt Line */}
          <form 
            onSubmit={handleCommand} 
            className="flex items-center gap-1.5 sm:gap-2 pt-1 text-emerald-400"
          >
            <span className="text-cyan-400 select-none text-xs sm:text-sm font-semibold shrink-0">
              <span className="hidden sm:inline">meena@cloud:~$</span>
              <span className="sm:hidden">~$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              aria-label="CLI Command Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type command (e.g. whoami, architecture, skills)..."
              className="flex-1 bg-transparent border-none outline-none text-emerald-100 font-mono text-base md:text-sm p-0 m-0 placeholder:text-slate-600 focus:ring-0"
              spellCheck={false}
              autoComplete="off"
            />
            <button 
              type="submit" 
              aria-label="Execute Command"
              className="text-slate-500 hover:text-emerald-400 transition-colors p-1.5 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded cursor-pointer"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
