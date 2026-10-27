import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from 'lucide-react'
import { ARCHITECTURAL_DECISIONS } from '@/data/architecturalDecisions'
import { ARCHITECTURAL_TRADEOFFS } from '@/data/architecturalTradeoffs'
import { ARCHITECTURE_SYSTEMS } from '@/data/architectureSystems'
import { ARCHITECTURE_EVOLUTIONS } from '@/data/architectureEvolutions'
import { CHAOS_DRILLS } from '@/data/chaosDrills'
import { GATEWAY_ROUTES } from '@/data/gatewayRoutes'
import { DISTRIBUTED_TRACES } from '@/data/distributedTraces'
import { KAFKA_TOPIC_STREAMS } from '@/data/kafkaStreams'
import { RATE_LIMITING_ALGORITHMS } from '@/data/rateLimitingAlgorithms'
import { MULTI_REGION_STRATEGIES } from '@/data/multiRegionReplication'
import { DATABASE_SHARDING_STRATEGIES } from '@/data/databaseSharding'
import { EDGE_CDN_STRATEGIES } from '@/data/edgeCdnCaching'
import { CIRCUIT_BREAKER_PATTERNS } from '@/data/circuitBreakers'
import { CONCURRENCY_MODELS } from '@/data/distributedConcurrency'
import { CONSENSUS_MODELS } from '@/data/raftConsensus'
import { VECTOR_SEARCH_MODELS } from '@/data/vectorSearch'
import { TRAFFIC_PRIORITY_MODELS } from '@/data/trafficPriority'
import { DISTRIBUTED_SAGA_MODELS } from '@/data/distributedSagas'
import { DISTRIBUTED_CACHE_MODELS } from '@/data/distributedCache'
import { EVENT_SOURCING_MODELS } from '@/data/eventSourcing'
import { DLQ_RETRY_MODELS } from '@/data/dlqRetryModels'
import { IDEMPOTENCY_MODELS } from '@/data/idempotencyModels'
import { ATOMIC_COMMIT_PARADIGMS } from '@/data/atomicCommitModels'
import { FEATURE_FLAG_MODELS } from '@/data/featureFlagModels'
import { TENANT_ISOLATION_MODELS } from '@/data/tenantIsolationModels'
import { ZERO_TRUST_MESH_MODELS } from '@/data/zeroTrustMeshModels'
import { EXECUTIVE_BRIEFING } from '@/data/executiveBriefing'

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
  'briefing',
  'pitch',
  'executive',
  'dossier',
  'architecture',
  'diff',
  'evolution',
  'migration',
  'chaos',
  'resilience',
  'drill',
  'drills',
  'runbook',
  'runbooks',
  'gateway',
  'ingress',
  'routes',
  'proxy',
  'trace',
  'traces',
  'spans',
  'otel',
  'jaeger',
  'kafka',
  'streams',
  'topics',
  'lag',
  'ratelimit',
  'throttling',
  'tokenbucket',
  'leakybucket',
  'replication',
  'multiregion',
  'crdt',
  'splitbrain',
  'aurora',
  'sharding',
  'consistenthashing',
  'reshard',
  'ring',
  'cdn',
  'cachepurge',
  'surrogate',
  'stale',
  'circuitbreaker',
  'bulkhead',
  'resilience4j',
  'backoff',
  'concurrency',
  'deadlock',
  'twophase',
  'occ',
  'mvcc',
  'raft',
  'consensus',
  'paxos',
  'election',
  'vectorsearch',
  'hnsw',
  'ivfpq',
  'rrf',
  'embeddings',
  'qos',
  'priorityqueue',
  'wfq',
  'codel',
  'loadshedding',
  'sagas',
  'orchestration',
  'choreography',
  'compensation',
  'outbox',
  'cache',
  'stampede',
  'xfetch',
  'singleflight',
  'coalesce',
  'eventsourcing',
  'cqrs',
  'snapshot',
  'replay',
  'upcaster',
  'dlq',
  'retry',
  'poisonpill',
  'backoffjitter',
  'parkinglot',
  'idempotency',
  'dedup',
  'fencingtoken',
  'idempotentkey',
  'replayhammer',
  'atomiccommit',
  'twophasecommit',
  '2pc',
  '3pc',
  'indoubt',
  'coordinator',
  'featureflag',
  'featureflags',
  'flags',
  'canary',
  'murmurhash',
  'openfeature',
  'killswitch',
  'rls',
  'tenantisolation',
  'multitenancy',
  'kmsenvelope',
  'leakprobe',
  'zerotrust',
  'spiffe',
  'mtls',
  'svid',
  'meshpolicy',
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
  { label: '[ $ briefing ]', cmd: 'briefing' },
  { label: '[ $ architecture ]', cmd: 'architecture' },
  { label: '[ $ diff ]', cmd: 'diff' },
  { label: '[ $ chaos ]', cmd: 'chaos' },
  { label: '[ $ gateway ]', cmd: 'gateway' },
  { label: '[ $ trace ]', cmd: 'trace' },
  { label: '[ $ kafka ]', cmd: 'kafka' },
  { label: '[ $ ratelimit ]', cmd: 'ratelimit' },
  { label: '[ $ multiregion ]', cmd: 'multiregion' },
  { label: '[ $ sharding ]', cmd: 'sharding' },
  { label: '[ $ cdn ]', cmd: 'cdn' },
  { label: '[ $ circuitbreaker ]', cmd: 'circuitbreaker' },
  { label: '[ $ concurrency ]', cmd: 'concurrency' },
  { label: '[ $ raft ]', cmd: 'raft' },
  { label: '[ $ vectorsearch ]', cmd: 'vectorsearch' },
  { label: '[ $ qos ]', cmd: 'qos' },
  { label: '[ $ sagas ]', cmd: 'sagas' },
  { label: '[ $ cache ]', cmd: 'cache' },
  { label: '[ $ eventsourcing ]', cmd: 'eventsourcing' },
  { label: '[ $ dlq ]', cmd: 'dlq' },
  { label: '[ $ idempotency ]', cmd: 'idempotency' },
  { label: '[ $ 2pc ]', cmd: '2pc' },
  { label: '[ $ flags ]', cmd: 'featureflag' },
  { label: '[ $ rls ]', cmd: 'rls' },
  { label: '[ $ mtls ]', cmd: 'mtls' },
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
  '  briefing        - Print 1-page Executive Architecture Dossier & recruiter pitch memo',
  '  skills          - Print summary of core technology stack & competencies',
  '  projects        - List featured systems, or type "project <id>" for deep architecture review',
  '  experience      - Output career journey, or type "experience <id>" for deep milestone review',
  '  diff            - Compare Legacy Monolith anti-patterns vs Modern Mesh (or "diff <id>")',
  '  chaos           - Execute automated chaos disaster recovery drills & SLA logs (or "chaos <id>")',
  '  gateway         - Inspect Envoy API gateway routes, mTLS & filters (or "gateway <id>")',
  '  trace           - Inspect OpenTelemetry distributed traces & span flamegraphs (or "trace <id>")',
  '  kafka           - Inspect Kafka event topics, partition lag & ISR quorums (or "kafka <id>")',
  '  ratelimit       - Evaluate distributed rate limiters & traffic shaping algorithms (or "ratelimit <id>")',
  '  multiregion     - Inspect multi-region replication topologies & conflict resolution (or "replication <id>")',
  '  sharding        - Inspect database sharding topologies & consistent hash ring (or "sharding <id>")',
  '  cdn             - Inspect Edge CDN caching, surrogate-key purges & SWR flows (or "cdn <id>")',
  '  circuitbreaker  - Evaluate distributed circuit breakers, bulkheads & backoff jitter (or "circuitbreaker <id>")',
  '  concurrency     - Inspect distributed deadlock detection & 2PL vs OCC concurrency (or "concurrency <id>")',
  '  qos             - Inspect distributed QoS schedulers, token bucket & WFQ (or "qos <id>")',
  '  sagas           - Inspect distributed Saga orchestration, choreography & compensation (or "sagas <id>")',
  '  cache           - Inspect distributed cache stampede protection & mutex leasing (or "cache <id>")',
  '  eventsourcing   - Inspect distributed event sourcing, CQRS & snapshotting (or "eventsourcing <id>")',
  '  dlq             - Inspect dead-letter queue, poison-pill quarantine & retries (or "dlq <id>")',
  '  idempotency     - Inspect distributed idempotency keys, fencing tokens & CAS locks (or "idempotency <id>")',
  '  2pc             - Inspect 2PC vs Saga execution, non-blocking 3PC & TrueTime (or "2pc <id>")',
  '  flags           - Inspect dynamic feature flags, MurmurHash3 bucketing & canary rollback (or "flags <id>")',
  '  rls             - Inspect multi-tenant Row-Level Security, schema routing & KMS envelope (or "rls <id>")',
  '  mtls            - Inspect Zero-Trust SPIFFE/SPIRE workload identity & Envoy mTLS (or "mtls <id>")',
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
      case 'briefing':
      case 'pitch':
      case 'executive':
      case 'dossier':
        output = [
          '================================================================================',
          `EXECUTIVE ARCHITECTURE BRIEFING: ${EXECUTIVE_BRIEFING.candidateName}`,
          `Role       : ${EXECUTIVE_BRIEFING.targetRole}`,
          `Scale      : ${EXECUTIVE_BRIEFING.experienceYears} | Location: ${EXECUTIVE_BRIEFING.location}`,
          '================================================================================',
          '',
          'CORE VALUE PROPOSITION:',
          `  ${EXECUTIVE_BRIEFING.coreValueProposition}`,
          '',
          'ARCHITECTURAL PILLARS & INVARIANTS:',
          ...EXECUTIVE_BRIEFING.pillars.flatMap((p, idx) => [
            `  ${idx + 1}. ${p.title}`,
            `     Stack     : ${p.technologies}`,
            `     Invariant : ${p.invariant}`,
            ''
          ]),
          'QUANTIFIED PRODUCTION BUSINESS IMPACTS:',
          ...EXECUTIVE_BRIEFING.verifiedOutcomes.map(o => 
            `  - ${o.metric.padEnd(32, ' ')}: ${o.before} -> ${o.after} (${o.impact})`
          ),
          '',
          'VERIFIED ARCHITECTURAL DECISION RECORDS (ADRs):',
          ...EXECUTIVE_BRIEFING.governingAdrs.map(a => 
            `  [${a.id}] ${a.title} -> ${a.impact}`
          ),
          '',
          'TARGET ENGAGEMENT MODELS:',
          ...EXECUTIVE_BRIEFING.engagementModels.map(m => 
            `  * ${m.roleTitle} [${m.availability}]`
          ),
          '',
          'DIRECT CONTACT & RESUME DOWNLOAD:',
          `  Email    : ${EXECUTIVE_BRIEFING.contact.email}`,
          `  LinkedIn : ${EXECUTIVE_BRIEFING.contact.linkedin}`,
          `  Resume   : ${EXECUTIVE_BRIEFING.contact.resumeUrl} (type "download" or "resume")`,
          '================================================================================'
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
        if (sub === 'diff' || sub === 'evolution' || args.some(a => a.toLowerCase().includes('diff') || a.toLowerCase().includes('evolution'))) {
          output = [
            'Routing to Architecture Evolution & Monolith-to-Mesh Comparison Diff (#architecture-evolution-diff):',
            '  1. Multi-Tenant SaaS     : DB Contention -> PostgreSQL Row-Level Security (RLS)',
            '  2. Distributed Checkout  : 2PC Distributed Row Locks -> Choreographed Saga CDC',
            '  3. Real-Time Streaming   : OS Thread Exhaustion -> Java 21 Virtual Threads',
            '  4. FinTech Gateway       : Mutable Balance Writes -> Append-Only Cryptographic Ledger',
            '  5. Autonomous Agentic AI : Monolithic Prompt Stuffing -> Decoupled Model Context Protocol',
            '--------------------------------------------------------------------------------',
            'Interactive Explorer: Live in #architecture-evolution-diff with visual diff slider.'
          ]
          break
        }
        if (sub === 'chaos' || sub === 'resilience' || sub === 'drills' || args.some(a => a.toLowerCase().includes('chaos') || a.toLowerCase().includes('drill'))) {
          output = [
            'Routing to Enterprise SLA & Chaos Engineering Drill Matrix (#architecture-chaos-matrix):',
            '  1. AWS AZ Network Blackhole : PgBouncer circuit breaker, Aurora replica promotion in 11.8s',
            '  2. Kafka Poison Pill        : Non-blocking DLQ routing in 12ms, 0 consumer lag',
            '  3. WebSocket Herd           : Redis Sentinel election in 1.35s, 50k Virtual Threads parked',
            '  4. Banking 504 Timeout      : Redis Redlock idempotency lease, 0 double charges',
            '  5. MCP Tool Sandbox OOM     : Linux cgroups v2 512MB SIGKILL in <2ms, ReAct DAG fallback',
            '--------------------------------------------------------------------------------',
            'Interactive Simulator: Live in #architecture-chaos-matrix with live terminal execution trace.'
          ]
          break
        }
        if (sub === 'gateway' || sub === 'ingress' || sub === 'routes' || args.some(a => a.toLowerCase().includes('gateway') || a.toLowerCase().includes('ingress'))) {
          output = [
            'Routing to Enterprise API Gateway & Ingress Routing Playground (#architecture-api-gateway):',
            '  1. Multi-Tenant IAM Ingress  : Envoy SPIFFE mTLS, JWT claims injection, P99 < 8.2ms',
            '  2. Distributed Saga Checkout : Redis Redlock idempotency gate, JSON to gRPC transcoding',
            '  3. Real-Time WebSocket Loom  : 101 Switching Protocols, 50k sockets, drop-tail ring buffer',
            '  4. FinTech Vault Tokenizer   : HSM mTLS termination, AWS KMS PAN card tokenization in <2ms',
            '  5. Agentic AI & MCP Ingress  : gVisor sandbox container gate, token quota circuit breaker',
            '--------------------------------------------------------------------------------',
            'Interactive Playground: Live in #architecture-api-gateway with live request simulator.'
          ]
          break
        }
        if (sub === 'trace' || sub === 'traces' || sub === 'spans' || sub === 'otel' || args.some(a => a.toLowerCase().includes('trace') || a.toLowerCase().includes('span') || a.toLowerCase().includes('otel'))) {
          output = [
            'Routing to Distributed Tracing & OpenTelemetry Span Flamegraph (#architecture-distributed-tracing):',
            '  1. SaaS IAM Auth Trace      : Envoy -> mTLS -> WAF -> PostgreSQL RLS (24.5ms)',
            '  2. Saga Checkout Trace      : Redlock -> Order Outbox -> Debezium CDC -> Kafka (48.2ms)',
            '  3. WebSocket Collab Trace   : 101 Switch -> Redis Pub/Sub -> 50k Virtual Threads (9.8ms)',
            '  4. FinTech Settlement Trace : HSM -> AWS KMS Tokenize -> Double-Entry ACID (32.4ms)',
            '  5. Agentic AI & MCP Trace   : ReAct DAG -> gVisor Sandbox -> pgvector HNSW (64.2ms)',
            '--------------------------------------------------------------------------------',
            'Interactive Inspector: Live in #architecture-distributed-tracing with span flamegraph.'
          ]
          break
        }
        if (sub === 'kafka' || sub === 'streams' || sub === 'topics' || sub === 'lag' || args.some(a => a.toLowerCase().includes('kafka') || a.toLowerCase().includes('stream') || a.toLowerCase().includes('topic'))) {
          output = [
            'Routing to Kafka Event Streams & Partition Lag Monitor (#architecture-event-streams):',
            '  1. orders.v1.events        : Saga Order Lifecycle (8 partitions, 15,000 TPS, zstd)',
            '  2. tenants.v1.audit        : SaaS Security Audit (6 partitions, 5,000 TPS, lz4)',
            '  3. collab.v1.workspace-deltas : Real-Time Deltas (12 partitions, 50k frames/sec)',
            '  4. payments.v1.settlement  : FinTech Double-Entry (6 partitions, 3,000 TPS, zstd)',
            '  5. agent.v1.mcp-telemetry  : MCP Tool Execution Bus (8 partitions, 10,000 TPS)',
            '--------------------------------------------------------------------------------',
            'Interactive Monitor: Live in #architecture-event-streams with partition lag & ISR quorums.'
          ]
          break
        }
        if (sub === 'ratelimit' || sub === 'throttling' || sub === 'tokenbucket' || sub === 'leakybucket' || args.some(a => a.toLowerCase().includes('rate') || a.toLowerCase().includes('throttle') || a.toLowerCase().includes('bucket'))) {
          output = [
            'Routing to Distributed Rate Limiting & Traffic Shaping (#architecture-rate-limiter):',
            '  1. Token Bucket Rate Limiter     : Multi-Tenant SaaS Edge Ingress (5k tokens, ADR-004)',
            '  2. Leaky Bucket Traffic Smoother : E-Commerce Saga Constant Egress (15k queue, ADR-001)',
            '  3. Fixed Window Counter          : Real-Time WebSocket Handshakes (50k/min, ADR-003)',
            '  4. Sliding Window Log            : FinTech PCI-DSS Strict Assurance (3k/min, ADR-005)',
            '  5. Sliding Window Counter        : Agentic MCP Tool Execution Quotas (10k/min, ADR-006)',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-rate-limiter with burst slider & Redis Lua scripts.'
          ]
          break
        }
        if (sub === 'replication' || sub === 'multiregion' || sub === 'crdt' || sub === 'splitbrain' || args.some(a => a.toLowerCase().includes('replicat') || a.toLowerCase().includes('region') || a.toLowerCase().includes('crdt'))) {
          output = [
            'Routing to Multi-Region Database Replication & Conflict Resolution (#architecture-multi-region):',
            '  1. Aurora Global Database    : Physical Storage Layer Replication (RPO < 1s, RTO < 1m)',
            '  2. DynamoDB Global Tables    : Active-Active Multi-Master with Last-Write-Wins (LWW)',
            '  3. Conflict-Free Data Types  : State-Based CRDTs (PN-Counters, LWW-Set, Monotonic Lattice)',
            '  4. Raft Consensus Ranges     : Multi-Region Quorum with HLC TrueTime (Strict Serializability)',
            '  5. Async Eventual CDC Fabric : Debezium + Kafka MirrorMaker 2 (Zero Loop Mirrored Fabric)',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-multi-region with WAN split-brain simulator.'
          ]
          break
        }
        if (sub === 'sharding' || sub === 'consistenthashing' || sub === 'reshard' || sub === 'ring' || args.some(a => a.toLowerCase().includes('shard') || a.toLowerCase().includes('ring') || a.toLowerCase().includes('hash'))) {
          output = [
            'Routing to Database Sharding & Consistent Hashing Topology (#architecture-database-sharding):',
            '  1. Consistent Hashing Ring  : Virtual Nodes on 360-degree integer circle (minimal K/N churn)',
            '  2. Hash Modulo Partitioning : Deterministic MurmurHash3 integer modulo (uniform distribution)',
            '  3. Range-Based Sharding     : Contiguous lexicographical/temporal intervals (local range scans)',
            '  4. Directory-Based Lookup   : Dynamic metadata router with Redis L1 cache (VIP shard isolation)',
            '  5. Geo-Partitioning         : Sovereign regulatory clusters (GDPR Frankfurt, CCPA Virginia)',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-database-sharding with hash ring & rebalance simulator.'
          ]
          break
        }
        if (sub === 'cdn' || sub === 'caching' || sub === 'cachepurge' || sub === 'surrogate' || sub === 'stale' || args.some(a => a.toLowerCase().includes('cdn') || a.toLowerCase().includes('purge') || a.toLowerCase().includes('cache'))) {
          output = [
            'Routing to Edge CDN Caching & Stale-While-Revalidate Invalidation Sandbox (#architecture-edge-cdn):',
            '  1. Surrogate-Key Tag Purge  : Instant targeted invalidation across 300+ PoPs (<150ms)',
            '  2. Stale-While-Revalidate   : RFC 5861 asynchronous background origin refresh (sub-4ms hit)',
            '  3. Origin Shield Hierarchy  : AWS CloudFront REC concentrating regional misses (99.1% offload)',
            '  4. Collapsed Forwarding     : Mutex lock consolidating parallel misses into 1 query',
            '  5. Edge Compute Workers     : V8 isolate JWT validation and micro-routing at the edge (1.8ms)',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-edge-cdn with PoP mesh & purge simulator.'
          ]
          break
        }
        if (sub === 'circuitbreaker' || sub === 'bulkhead' || sub === 'resilience4j' || sub === 'backoff' || args.some(a => a.toLowerCase().includes('circuit') || a.toLowerCase().includes('breaker') || a.toLowerCase().includes('bulkhead'))) {
          output = [
            'Routing to Distributed Circuit Breakers & Cascading Fault Mesh Sandbox (#architecture-circuit-breaker):',
            '  1. Resilience4j Sliding Window  : Ring-buffer error rate thresholding (CLOSED -> OPEN -> HALF-OPEN)',
            '  2. Semaphore Thread Bulkhead    : Dependency isolation protecting core execution threads',
            '  3. Exponential Backoff & Jitter : Decorrelated full jitter breaking thundering retry storms',
            '  4. Adaptive Concurrency Vegas   : Gradient queue delay tracking avoiding bufferbloat',
            '  5. Envoy Outlier Ejection       : Passive health checking evicting 5xx unhealthy hosts',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-circuit-breaker with synthetic burst & state transitions.'
          ]
          break
        }
        if (sub === 'concurrency' || sub === 'deadlock' || sub === 'twophase' || sub === 'occ' || sub === 'mvcc' || args.some(a => a.toLowerCase().includes('concurren') || a.toLowerCase().includes('deadlock') || a.toLowerCase().includes('2pl') || a.toLowerCase().includes('occ'))) {
          output = [
            'Routing to Distributed Concurrency & Deadlock Detection Sandbox (#architecture-distributed-concurrency):',
            '  1. Strict 2PL (Wait-Die) : Timestamp seniority deadlock prevention (0 cycles)',
            '  2. Lock-Free OCC         : Backward validation phase (0 lock contention, +310% throughput)',
            '  3. PostgreSQL MVCC       : Row version chains & visibility maps (readers never block writers)',
            '  4. Tarjan WFG Detector   : O(V + E) SCC directed cycle search & lowest-cost victim abort',
            '  5. Redlock DLM           : Multi-master Redis quorum leases with monotonic fencing tokens',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-distributed-concurrency with WFG cycle break simulator.'
          ]
          break
        }
        if (sub === 'raft' || sub === 'consensus' || sub === 'paxos' || sub === 'election' || args.some(a => a.toLowerCase().includes('raft') || a.toLowerCase().includes('consensus') || a.toLowerCase().includes('paxos'))) {
          output = [
            'Routing to Distributed Consensus & Raft Leader Election State Machine (#architecture-raft-consensus):',
            '  1. Raft Leader Election   : Randomized election timers (150-300ms) with majority vote quorum',
            '  2. Raft Log Replication   : Replicated State Machine (RSM) with AppendEntries & commitIndex',
            '  3. Multi-Raft Quorums     : WAN network partition tolerance (majority commits, minority freezes)',
            '  4. Joint Consensus        : Dynamic two-phase cluster membership migration (Cold,new safety)',
            '  5. Multi-Paxos vs Raft    : Synod Phase 1/2 ballot evaluation vs strong leader streaming',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-raft-consensus with 5-node cluster simulation.'
          ]
          break
        }
        if (sub === 'vectorsearch' || sub === 'hnsw' || sub === 'ivfpq' || sub === 'rrf' || sub === 'embeddings' || args.some(a => a.toLowerCase().includes('vector') || a.toLowerCase().includes('hnsw') || a.toLowerCase().includes('embedding'))) {
          output = [
            'Routing to Distributed Sharded Vector Search & HNSW Indexing Sandbox (#architecture-vector-search):',
            '  1. HNSW Graph Skip-List    : O(log N) multi-layer proximity search (M=16, efSearch=64, 98.4% recall)',
            '  2. IVF-PQ Quantization     : 8.2x RAM compression with Asymmetric Distance Computation (ADC)',
            '  3. Sharded Vector Routing  : Horizontal scatter-gather partition fabric with bounded Top-K min-heap merge',
            '  4. Hybrid Dense-Sparse RRF : Non-parametric Reciprocal Rank Fusion blending BM25 and pgvector (+28.4% MRR)',
            '  5. Quantization Profiler   : SIMD hardware-accelerated integer dot-products (FP32 vs FP16 vs INT8)',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-vector-search with 2D vector space projection probe.'
          ]
          break
        }
        if (sub === 'qos' || sub === 'priority' || sub === 'wfq' || sub === 'codel' || sub === 'loadshedding' || args.some(a => a.toLowerCase().includes('qos') || a.toLowerCase().includes('wfq') || a.toLowerCase().includes('priority'))) {
          output = [
            'Routing to Distributed Token-Bucket API Shaper & Bounded Priority Queuing (#architecture-traffic-priority):',
            '  1. Tenant Priority Queuing : Multi-tier FIFO (VIP vs Pro vs Free) with WFQ anti-starvation credits',
            '  2. Weighted Fair Queuing   : Virtual clock GPS scheduler tagged by virtual finish times (F_i)',
            '  3. Controlled Delay (CoDel): AQM bufferbloat mitigation dropping packets when sojourn delay > 5ms',
            '  4. Dual-Rate Token Bucket  : RFC 2698 CIR vs PIR dynamic surge metering with green/yellow/red tags',
            '  5. Graceful Load Shedding  : Adaptive CPU-triggered drop-tail returning sub-1.2ms HTTP 429 Retry-After',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-traffic-priority with multi-queue drain visualizer.'
          ]
          break
        }
        if (sub === 'sagas' || sub === 'orchestration' || sub === 'choreography' || sub === 'compensation' || sub === 'outbox' || args.some(a => a.toLowerCase().includes('saga') || a.toLowerCase().includes('compensation'))) {
          output = [
            'Routing to Distributed Saga Orchestration & Compensation Sandbox (#architecture-distributed-sagas):',
            '  1. Orchestrated Saga       : Centralized Temporal workflow coordinator with deterministic activity history',
            '  2. Choreographed Saga      : Decoupled Kafka domain event bus with Transactional Outbox CDC',
            '  3. Backward Compensation   : Semantic undo log executing idempotent rollback actions across microservices',
            '  4. Forward Recovery        : Dead-letter queue isolation with exponential jitter retry for transient faults',
            '  5. Dual-Write Outbox       : Debezium CDC tailing PostgreSQL WAL eliminating dual-write inconsistencies',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-distributed-sagas with interactive failure injection.'
          ]
          break
        }
        if (sub === 'cache' || sub === 'stampede' || sub === 'xfetch' || sub === 'singleflight' || sub === 'coalesce' || args.some(a => a.toLowerCase().includes('stampede') || a.toLowerCase().includes('xfetch') || a.toLowerCase().includes('singleflight'))) {
          output = [
            'Routing to Distributed Cache Stampede & Multi-Tier Mutex Leasing (#architecture-distributed-cache):',
            '  1. Probabilistic Refresh   : XFetch algorithm evaluating delta * beta * ln(rand) to pre-warm before TTL expiry',
            '  2. Singleflight Coalescing : Wait-group mutex map collapsing 10,000 concurrent stampedes into 1 DB flight',
            '  3. Redis Mutex Leasing     : Quorum distributed locks with monotonic fencing tokens and atomic Lua releases',
            '  4. L1/L2 Tiered Caching    : L1 Caffeine near-cache (sub-10us) + L2 Redis Cluster (sub-2ms) with 99.99% offload',
            '  5. CDC WAL Invalidation    : Transactional Debezium streaming from PostgreSQL WAL to Redis Pub/Sub',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-distributed-cache with 5k concurrent stampede simulator.'
          ]
          break
        }
        if (sub === 'eventsourcing' || sub === 'cqrs' || sub === 'snapshot' || sub === 'replay' || sub === 'upcaster' || args.some(a => a.toLowerCase().includes('eventsourcing') || a.toLowerCase().includes('cqrs') || a.toLowerCase().includes('snapshot'))) {
          output = [
            'Routing to Distributed Event Sourcing & CQRS Snapshotting Sandbox (#architecture-event-sourcing):',
            '  1. Append-Only Event Store : UUIDv7 monotonic streams with OCC version collision protection',
            '  2. Point-In-Time Replay    : Deterministic O(N) event folding for temporal state reconstruction',
            '  3. Snapshot Checkpoints    : Periodic snapshots every 100 events cutting replay from 180ms to 1.8ms',
            '  4. CQRS Read Projections   : Debezium CDC streaming to Elasticsearch & Postgres denormalized views',
            '  5. Schema Upcasting        : In-flight V1 to V2 event transformation without database schema mutations',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-event-sourcing with scrubbing time-travel slider.'
          ]
          break
        }
        if (sub === 'dlq' || sub === 'retry' || sub === 'poisonpill' || sub === 'backoffjitter' || sub === 'parkinglot' || args.some(a => a.toLowerCase().includes('dlq') || a.toLowerCase().includes('retry') || a.toLowerCase().includes('poison'))) {
          output = [
            'Routing to Distributed Dead-Letter Queue (DLQ) & Non-Blocking Retry Matrix (#architecture-dlq-retry):',
            '  1. Decorrelated Jitter     : Non-harmonic backoff scaling sleep = min(cap, random(base, sleep * 3))',
            '  2. Staggered Delay Topics  : Asynchronous 10s, 1m, 5m Kafka delay tiers eliminating head-of-line blocking',
            '  3. Poison Pill Quarantine  : Instant sub-2ms bypass to parking lot for non-retryable schema errors',
            '  4. Idempotent DLQ Replay   : Rate-limited 250 msg/s re-injection guarded by circuit breaker and Redis locks',
            '  5. Causal Reconciliation   : Causal watermarking preventing delayed events from overwriting modern state',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-dlq-retry with poison-pill injector and replay stepper.'
          ]
          break
        }
        if (sub === 'idempotency' || sub === 'dedup' || sub === 'fencingtoken' || sub === 'idempotentkey' || sub === 'replayhammer' || args.some(a => a.toLowerCase().includes('idem') || a.toLowerCase().includes('dedup') || a.toLowerCase().includes('fencing'))) {
          output = [
            'Routing to Distributed Idempotency Key & Two-Phase Ingress Committer (#architecture-idempotency):',
            '  1. Redlock Fencing Tokens  : Quorum lease with monotonic counter token invalidating delayed zombie writes',
            '  2. RFC 9110 Ingress Gate   : Two-phase reserve-and-commit filter with in-flight mutex & 24h cached status',
            '  3. DB Unique CAS Locks     : PostgreSQL atomic INSERT ON CONFLICT DO NOTHING with zero side-effects',
            '  4. Webhook Replay Ledger   : Stripe/Adyen at-least-once deduplication ledger with 0.00% double-credit risk',
            '  5. SHA-256 Fingerprinting  : Canonical payload digestion intercepting key tampering with HTTP 422',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-idempotency with duplicate hammer & tamper probes.'
          ]
          break
        }
        if (sub === '2pc' || sub === 'atomiccommit' || sub === 'twophasecommit' || sub === '3pc' || sub === 'indoubt' || args.some(a => a.toLowerCase().includes('2pc') || a.toLowerCase().includes('commit'))) {
          output = [
            'Routing to Distributed Two-Phase Commit (2PC) vs Saga Sandbox (#architecture-atomic-commit):',
            '  1. Classical 2PC XA        : Prepare-Commit protocol with coordinator in-doubt abort recovery',
            '  2. Non-Blocking 3PC        : Can-Commit, Pre-Commit, Do-Commit with election timeout quorum',
            '  3. Choreographed Saga      : Asynchronous PostgreSQL Outbox CDC tailing eliminating 2PC row locks',
            '  4. Dual-Write Reconciler   : Causal watermarking reconciling storage drift between SQL and Search',
            '  5. Paxos/Raft TrueTime     : Spanner-style external consistency commit timestamps over Raft groups',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-atomic-commit with coordinator crash injector.'
          ]
          break
        }
        if (sub === 'flags' || sub === 'featureflag' || sub === 'featureflags' || sub === 'canary' || sub === 'murmurhash' || args.some(a => a.toLowerCase().includes('flag') || a.toLowerCase().includes('canary'))) {
          output = [
            'Routing to Dynamic Feature Flagging & Canary Traffic Splitter (#architecture-feature-flags):',
            '  1. MurmurHash3 Bucketing   : Deterministic user hashing (MurmurHash3 % 100) with sub-0.25us evaluation',
            '  2. OpenFeature Evaluator   : Multi-attribute contextual rule engine for tenant tiers and geo targeting',
            '  3. Canary Splitter Circuit : Graduated rollout (1% to 100%) with automated 1.5% error rate kill-switch',
            '  4. Ephemeral SSE Stream    : Edge configuration distribution pushing deltas to 100k pods in sub-120ms',
            '  5. Flag Debt Sentinel      : Telemetry tracker identifying stale and deprecated feature flags for cleanup',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-feature-flags with rollout slider & canary simulator.'
          ]
          break
        }
        if (sub === 'rls' || sub === 'tenantisolation' || sub === 'multitenancy' || sub === 'kmsenvelope' || sub === 'leakprobe' || args.some(a => a.toLowerCase().includes('rls') || a.toLowerCase().includes('tenant'))) {
          output = [
            'Routing to Distributed Multi-Tenant RLS & Cryptographic Isolation (#architecture-tenant-isolation):',
            '  1. PostgreSQL Session RLS  : SET LOCAL app.current_tenant with FORCE ROW LEVEL SECURITY (sub-0.35ms)',
            '  2. Schema-per-Tenant       : Multi-tenant HikariCP DataSource router with search_path catalogs',
            '  3. AWS KMS Envelope DEK    : AES-256-GCM with tenant AAD context and sub-second crypto-shredding',
            '  4. Cross-Tenant Leak Probe : Zero-trust AST parameter inspection intercepting foreign ID tampering (403)',
            '  5. Noisy-Neighbor QoS      : Weighted Redis token bucket limiting surges while preserving co-tenant 100% SLA',
            '--------------------------------------------------------------------------------',
            'Interactive Sandbox: Live in #architecture-tenant-isolation with live penetration probe & KMS rotation.'
          ]
          break
        }
        output = [
          'ByteByteGo Interactive Architecture Lab Navigator:',
          '--------------------------------------------------------------------------------',
          'Explore Meena Kannan\'s production distributed architectures & system designs:',
          '  [ 1 ] "architecture systems"   : 5 Enterprise Workbenches (#architecture-workbench)',
          '  [ 2 ] "architecture ai"        : 5-Pillar ByteByteGo AI Codex (#architecture-ai-codex)',
          '  [ 3 ] "architecture adr"       : 6 Production Governance ADRs (#architecture-adr-ledger)',
          '  [ 4 ] "architecture tradeoffs" : System Design Decision Matrix (#architecture-tradeoff-matrix)',
          '  [ 5 ] "architecture diff"      : Monolith-to-Mesh Comparison Diffs (#architecture-evolution-diff)',
          '  [ 6 ] "architecture chaos"     : Chaos Disaster Recovery Drills (#architecture-chaos-matrix)',
          '  [ 7 ] "architecture gateway"   : Ingress Routing & Envoy Filters (#architecture-api-gateway)',
          '  [ 8 ] "architecture trace"     : OpenTelemetry Distributed Tracing (#architecture-distributed-tracing)',
          '  [ 9 ] "architecture kafka"     : Kafka Event Streams & Partition Lag (#architecture-event-streams)',
          '  [ 10 ] "architecture ratelimit": Distributed Rate Limiting Algorithms (#architecture-rate-limiter)',
          '  [ 11 ] "architecture multiregion": Multi-Region Database Replication (#architecture-multi-region)',
          '  [ 12 ] "architecture sharding": Database Sharding & Consistent Hashing (#architecture-database-sharding)',
          '  [ 13 ] "architecture cdn"     : Edge CDN Caching & Invalidation (#architecture-edge-cdn)',
          '  [ 14 ] "architecture circuitbreaker": Distributed Circuit Breaker Mesh (#architecture-circuit-breaker)',
          '  [ 15 ] "architecture concurrency": Concurrency & Deadlock Detection (#architecture-distributed-concurrency)',
          '  [ 16 ] "architecture raft"    : Distributed Raft Consensus Engine (#architecture-raft-consensus)',
          '  [ 17 ] "architecture vectorsearch": Distributed Vector Search & HNSW (#architecture-vector-search)',
          '  [ 18 ] "architecture qos"     : Distributed QoS & Traffic Priority (#architecture-traffic-priority)',
          '  [ 19 ] "architecture sagas"   : Distributed Sagas & Compensations (#architecture-distributed-sagas)',
          '  [ 20 ] "architecture cache"   : Distributed Cache Stampede & Coherence (#architecture-distributed-cache)',
          '  [ 21 ] "architecture eventsourcing": Distributed Event Sourcing & CQRS (#architecture-event-sourcing)',
          '  [ 22 ] "architecture dlq"     : Dead-Letter Queue & Retry Matrix (#architecture-dlq-retry)',
          '  [ 23 ] "architecture idempotency": Distributed Idempotency & CAS Locks (#architecture-idempotency)',
          '  [ 24 ] "architecture 2pc"     : Distributed 2PC vs Saga & Atomic Commit (#architecture-atomic-commit)',
          '  [ 25 ] "architecture flags"   : Dynamic Feature Flags & Canary Rollout (#architecture-feature-flags)',
          '  [ 26 ] "architecture rls"     : Multi-Tenant RLS & Cryptographic Isolation (#architecture-tenant-isolation)',
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
      case 'diff':
      case 'evolution':
      case 'migration': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = ARCHITECTURE_EVOLUTIONS.find(e => 
            e.id === target ||
            e.id.includes(target) ||
            e.systemName.toLowerCase().includes(target) ||
            (target === '1' && e.id === 'saas-rls') ||
            (target === '2' && e.id === 'saga-outbox') ||
            (target === '3' && e.id === 'virtual-threads') ||
            (target === '4' && e.id === 'double-entry') ||
            (target === '5' && e.id === 'mcp-mesh')
          )
          if (matched) {
            output = [
              `Architecture Evolution Diff: ${matched.systemName}`,
              `Headline : ${matched.headline}`,
              `Category : ${matched.category} | Governance: ${matched.adrReference}`,
              '--------------------------------------------------------------------------------',
              `Migration Strategy: ${matched.migrationStrategy}`,
              '',
              '[-] V1: LEGACY MONOLITH (ANTI-PATTERN):',
              `    Architecture : ${matched.legacyArchitecture.title}`,
              `    Bottleneck   : ${matched.legacyArchitecture.bottleneck}`,
              '    Anti-Patterns:',
              ...matched.legacyArchitecture.antiPatterns.map(p => `      * [X] ${p}`),
              '    Legacy Telemetry Baseline:',
              ...Object.entries(matched.legacyArchitecture.telemetry).map(([k, v]) => `      * ${k}: ${v}`),
              '',
              '[+] V2: MODERN DISTRIBUTED CLOUD (INVARIANT ENFORCED):',
              `    Architecture : ${matched.modernArchitecture.title}`,
              `    Solution     : ${matched.modernArchitecture.solution}`,
              '    Invariants Enforced:',
              ...matched.modernArchitecture.invariantsEnforced.map(inv => `      * [OK] ${inv}`),
              '    Modern Telemetry Verified:',
              ...Object.entries(matched.modernArchitecture.telemetry).map(([k, v]) => `      * ${k}: ${v}`),
              '',
              'QUANTIFIED METRIC DELTAS & VERIFIED IMPACT:',
              ...matched.keyDeltas.map(d => `  - ${d.metric.padEnd(30, ' ')}: ${d.before} -> ${d.after} (${d.improvement})`),
              '--------------------------------------------------------------------------------',
              'Full visual diff slider & code available in #architecture-evolution-diff.'
            ]
            break
          }
        }

        output = [
          'Architecture Evolution & Monolith-to-Mesh Comparison Diffs:',
          '--------------------------------------------------------------------------------',
          'Inspect how legacy monolith anti-patterns were decomposed into modern cloud systems:',
          '',
          ...ARCHITECTURE_EVOLUTIONS.flatMap((e, idx) => [
            `${idx + 1}. [ ${e.id} ] : ${e.systemName} (${e.category})`,
            `   Focus     : ${e.headline}`,
            `   ADR Gov   : ${e.adrReference}`,
            `   Deep Dive : "diff ${idx + 1}" or "diff ${e.id.split('-')[0]}" (e.g. "diff saas", "diff saga", "diff loom", "diff fintech", "diff mcp")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "diff <id>" (e.g. "diff 1" or "diff saga") to inspect granular before/after telemetry.'
        ]
        break
      }
      case 'chaos':
      case 'resilience':
      case 'drill':
      case 'drills':
      case 'runbook':
      case 'runbooks': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = CHAOS_DRILLS.find(d => 
            d.id === target ||
            d.id.includes(target) ||
            d.systemName.toLowerCase().includes(target) ||
            d.title.toLowerCase().includes(target) ||
            (target === '1' && d.id === 'az-partition-failover') ||
            (target === '2' && d.id === 'kafka-poison-pill-isolation') ||
            (target === '3' && d.id === 'websocket-thundering-herd') ||
            (target === '4' && d.id === 'banking-rail-timeout-idempotency') ||
            (target === '5' && d.id === 'mcp-sandbox-oom-sigkill')
          )
          if (matched) {
            output = [
              `Chaos Engineering Drill: ${matched.title}`,
              `System   : ${matched.systemName}`,
              `Category : ${matched.category} | Governance: ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              `Failure Injected: ${matched.injectedFault}`,
              '',
              'SRE HYPOTHESIS & INVARIANTS:',
              `  ${matched.sreHypothesis}`,
              '  Invariants Enforced:',
              ...matched.steadyStateInvariants.map(inv => `    * [OK] ${inv}`),
              '',
              'VERIFIED SLA & RESILIENCE TELEMETRY:',
              `  - Recovery Point Objective (RPO) : ${matched.impactMetrics.rpo}`,
              `  - Recovery Time Objective (RTO)  : ${matched.impactMetrics.rto}`,
              `  - Availability SLA Target        : ${matched.impactMetrics.availabilitySla}`,
              `  - Data Divergence Rate           : ${matched.impactMetrics.divergenceRate}`,
              `  - Max Latency Spike              : ${matched.impactMetrics.maxLatencySpike}`,
              '',
              'DISASTER RECOVERY EXECUTION TRACE:',
              ...matched.executionTrace.map(s => 
                `  [${s.timestamp}] ${s.phase.padEnd(14, ' ')} : ${s.actor} -> ${s.action} (${s.status.toUpperCase()}) | ${s.detail}`
              ),
              '',
              'SRE PRODUCTION RUNBOOK COMMAND:',
              ...matched.runbookSnippet.command.split('\n').map(line => `  ${line}`),
              '--------------------------------------------------------------------------------',
              'Full interactive execution simulator available in #architecture-chaos-matrix.'
            ]
            break
          }
        }

        output = [
          'Enterprise SLA & Chaos Engineering Drill Matrix:',
          '--------------------------------------------------------------------------------',
          'Inspect automated disaster recovery scenarios across all 5 distributed cloud architectures:',
          '',
          ...CHAOS_DRILLS.flatMap((d, idx) => [
            `${idx + 1}. [ ${d.id} ] : ${d.title}`,
            `   Target System : ${d.systemName} (${d.category})`,
            `   Failure Mode  : ${d.failureType}`,
            `   Recovery SLA  : RPO = ${d.impactMetrics.rpo} | RTO = ${d.impactMetrics.rto}`,
            `   Deep Dive     : "chaos ${idx + 1}" or "chaos ${d.id.split('-')[0]}" (e.g. "chaos saas", "chaos kafka", "chaos websocket", "chaos banking", "chaos mcp")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "chaos <id>" (e.g. "chaos 1" or "chaos mcp") to inspect step-by-step trace and SRE runbook.'
        ]
        break
      }
      case 'gateway':
      case 'ingress':
      case 'routes':
      case 'proxy': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = GATEWAY_ROUTES.find(r => 
            r.id === target ||
            r.id.includes(target) ||
            r.routePath.toLowerCase().includes(target) ||
            r.systemName.toLowerCase().includes(target) ||
            r.title.toLowerCase().includes(target) ||
            (target === '1' && r.id === 'saas-iam-ingress') ||
            (target === '2' && r.id === 'saga-checkout-ingress') ||
            (target === '3' && r.id === 'realtime-websocket-ingress') ||
            (target === '4' && r.id === 'fintech-vault-ingress') ||
            (target === '5' && r.id === 'agentic-mcp-ingress')
          )
          if (matched) {
            output = [
              `API Gateway Ingress Route: ${matched.title}`,
              `Route Path : ${matched.method} ${matched.routePath}`,
              `Target     : ${matched.systemName} -> ${matched.upstreamService}`,
              `Protocol   : ${matched.protocol} | Governance: ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              `Summary: ${matched.summary}`,
              '',
              'INGRESS SLA & THROUGHPUT TARGETS:',
              `  - Rate Limit SLA    : ${matched.rateLimitSla}`,
              `  - Latency Target    : ${matched.latencyTarget}`,
              '',
              'ENVOY FILTER PIPELINE & OVERHEAD:',
              ...matched.filters.map(f => 
                `  * [${f.type.toUpperCase()}] ${f.name.padEnd(30, ' ')} (+${f.overheadMs.toFixed(1)}ms) : ${f.description}`
              ),
              '',
              'SAMPLE REQUEST HEADERS:',
              ...Object.entries(matched.sampleRequest.headers).map(([k, v]) => `  ${k}: ${v}`),
              '',
              'SAMPLE UPSTREAM RESPONSE:',
              `  Status: ${matched.sampleResponse.statusCode} ${matched.sampleResponse.statusText}`,
              ...Object.entries(matched.sampleResponse.headers).map(([k, v]) => `  ${k}: ${v}`),
              `  Payload: ${matched.sampleResponse.bodySnippet}`,
              '--------------------------------------------------------------------------------',
              'Full interactive sandbox simulator available in #architecture-api-gateway.'
            ]
            break
          }
        }

        output = [
          'Enterprise API Gateway & Ingress Routing Sandbox:',
          '--------------------------------------------------------------------------------',
          'Inspect Envoy zero-trust ingress routes and security filter pipelines across 5 architectures:',
          '',
          ...GATEWAY_ROUTES.flatMap((r, idx) => [
            `${idx + 1}. [ ${r.method} ${r.routePath} ] : ${r.title}`,
            `   Target Service : ${r.upstreamService} (${r.protocol})`,
            `   SLA Target     : ${r.latencyTarget} | ${r.rateLimitSla}`,
            `   Deep Dive      : "gateway ${idx + 1}" or "gateway ${r.id.split('-')[0]}" (e.g. "gateway saas", "gateway saga", "gateway realtime", "gateway fintech", "gateway mcp")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "gateway <id>" (e.g. "gateway 1" or "gateway mcp") to inspect filter overhead and Envoy YAML.'
        ]
        break
      }
      case 'trace':
      case 'traces':
      case 'spans':
      case 'otel':
      case 'jaeger': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = DISTRIBUTED_TRACES.find(t => 
            t.traceId === target ||
            t.traceId.includes(target) ||
            t.rootEndpoint.toLowerCase().includes(target) ||
            t.systemName.toLowerCase().includes(target) ||
            t.title.toLowerCase().includes(target) ||
            (target === '1' && t.traceId === 'trace_saas_auth_01') ||
            (target === '2' && t.traceId === 'trace_saga_checkout_02') ||
            (target === '3' && t.traceId === 'trace_collab_broadcast_03') ||
            (target === '4' && t.traceId === 'trace_fintech_settlement_04') ||
            (target === '5' && t.traceId === 'trace_agentic_mcp_05')
          )
          if (matched) {
            output = [
              `OpenTelemetry Distributed Trace: ${matched.title}`,
              `Trace ID   : ${matched.traceId}`,
              `Endpoint   : ${matched.rootEndpoint} | Duration: ${matched.totalDurationMs.toFixed(1)}ms`,
              `System     : ${matched.systemName} (${matched.category})`,
              `Governance : ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              `Summary: ${matched.summary}`,
              `Critical Path Bottleneck: ${matched.criticalBottleneck}`,
              '',
              'DISTRIBUTED SPAN TIMELINE & HIERARCHY:',
              ...matched.spans.map(s => {
                const percent = ((s.durationMs / matched.totalDurationMs) * 100).toFixed(0)
                const flag = s.isCriticalPath ? '[CRITICAL]' : '          '
                return `  [+${s.startTimeMs.toFixed(1).padStart(4, ' ')}ms] ${flag} ${s.serviceName} :: ${s.operationName} (${s.durationMs.toFixed(1)}ms, ${percent}%)`
              }),
              '',
              'CRITICAL SPAN ATTRIBUTES:',
              ...Object.entries(matched.spans.find(s => s.isCriticalPath && s.parentSpanId)?.tags || matched.spans[0].tags).map(([k, v]) => `  * ${k}: ${v}`),
              '--------------------------------------------------------------------------------',
              'Full visual span flamegraph available in #architecture-distributed-tracing.'
            ]
            break
          }
        }

        output = [
          'Distributed Tracing & OpenTelemetry Span Flamegraph:',
          '--------------------------------------------------------------------------------',
          'Inspect end-to-end W3C distributed trace spans and latency bottlenecks across 5 architectures:',
          '',
          ...DISTRIBUTED_TRACES.flatMap((t, idx) => [
            `${idx + 1}. [ ${t.traceId} ] : ${t.title}`,
            `   Endpoint      : ${t.rootEndpoint} (${t.systemName})`,
            `   Latency & Spans: ${t.totalDurationMs.toFixed(1)}ms (${t.spans.length} spans)`,
            `   Bottleneck    : ${t.criticalBottleneck}`,
            `   Deep Dive     : "trace ${idx + 1}" or "trace ${t.traceId.split('_')[1]}" (e.g. "trace saas", "trace saga", "trace collab", "trace fintech", "trace mcp")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "trace <id>" (e.g. "trace 1" or "trace mcp") to inspect span timeline and tags.'
        ]
        break
      }
      case 'kafka':
      case 'streams':
      case 'topics':
      case 'lag': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = KAFKA_TOPIC_STREAMS.find(k => 
            k.topicId === target ||
            k.topicId.includes(target) ||
            k.systemId === target ||
            k.systemName.toLowerCase().includes(target) ||
            (target === '1' && k.topicId === 'orders.v1.events') ||
            (target === '2' && k.topicId === 'tenants.v1.audit') ||
            (target === '3' && k.topicId === 'collab.v1.workspace-deltas') ||
            (target === '4' && k.topicId === 'payments.v1.settlement') ||
            (target === '5' && k.topicId === 'agent.v1.mcp-telemetry')
          )
          if (matched) {
            output = [
              `Kafka Event Topic: ${matched.title}`,
              `Topic ID    : ${matched.topicId}`,
              `Target System: ${matched.systemName}`,
              `Category    : ${matched.category}`,
              `Governing ADR: ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              `Partitions  : ${matched.partitionsCount} (Replication: ${matched.replicationFactor}x, Cleanup: ${matched.cleanupPolicy})`,
              `Retention   : ${matched.retentionHours} hours (Compression: ${matched.compressionType})`,
              `Throughput  : ${matched.targetThroughputTps} (P99 Publish: ${matched.p99PublishLatency})`,
              '--------------------------------------------------------------------------------',
              'CONSUMER GROUPS & LAG:',
              ...matched.consumerGroups.map(cg =>
                `  * [${cg.state}] Group: ${cg.groupId} (${cg.protocol}, ${cg.membersCount} members, Lag: ${cg.totalLag})`
              ),
              '',
              'PARTITION OFFSET TOPOLOGY:',
              ...matched.partitions.map(p =>
                `  P-${p.partitionId} [${p.leaderBroker.split('.')[0]}] :: LogEnd: ${p.logEndOffset} | Consumer: ${p.consumerOffset} | Lag: ${p.lag} | ISR: ${p.isr.length}/${p.replicas.length}`
              ),
              '--------------------------------------------------------------------------------',
              'Full live partition lag monitor available in #architecture-event-streams.'
            ]
            break
          }
        }

        output = [
          'Kafka Event Streams & Partition Lag Monitor:',
          '--------------------------------------------------------------------------------',
          'Inspect enterprise Kafka event streams, partition topologies & consumer lag across 5 systems:',
          '',
          ...KAFKA_TOPIC_STREAMS.flatMap((k, idx) => [
            `${idx + 1}. [ ${k.topicId} ] : ${k.title}`,
            `   System        : ${k.systemName}`,
            `   Partitions    : ${k.partitionsCount} parts (Throughput: ${k.targetThroughputTps}, Latency: ${k.p99PublishLatency})`,
            `   Consumer Groups: ${k.consumerGroups.map(cg => `${cg.groupId} (lag: ${cg.totalLag})`).join(', ')}`,
            `   Deep Dive     : "kafka ${idx + 1}" or "kafka ${k.topicId.split('.')[0]}" (e.g. "kafka orders", "kafka tenants", "kafka collab", "kafka payments", "kafka agent")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "kafka <id>" (e.g. "kafka 1" or "kafka orders") to inspect partition offset ledger.'
        ]
        break
      }
      case 'ratelimit':
      case 'throttling':
      case 'tokenbucket':
      case 'leakybucket': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = RATE_LIMITING_ALGORITHMS.find(a => 
            a.id === target ||
            a.id.includes(target) ||
            a.systemId === target ||
            a.algorithmName.toLowerCase().includes(target) ||
            a.systemName.toLowerCase().includes(target) ||
            (target === '1' && a.id === 'token-bucket') ||
            (target === '2' && a.id === 'leaky-bucket') ||
            (target === '3' && a.id === 'fixed-window') ||
            (target === '4' && (a.id === 'sliding-log' || a.id === 'sliding-window-log')) ||
            (target === '5' && (a.id === 'sliding-counter' || a.id === 'sliding-window-counter'))
          )
          if (matched) {
            output = [
              `Rate Limiting Algorithm: ${matched.algorithmName}`,
              `Algorithm ID : ${matched.id}`,
              `Target System: ${matched.systemName}`,
              `Category     : ${matched.category}`,
              `Governing ADR: ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              `Capacity     : ${matched.capacityLimit}`,
              `Refill Rate  : ${matched.refillRate}`,
              `Burst Profile: ${matched.burstTolerance}`,
              `Complexity   : Time ${matched.timeComplexity} | Memory ${matched.memoryComplexity}`,
              '--------------------------------------------------------------------------------',
              'ARCHITECTURAL TRADE-OFFS & GUARANTEES:',
              ...matched.pros.map(p => `  + [PRO] ${p}`),
              ...matched.cons.map(c => `  - [CON] ${c}`),
              '',
              'ATOMIC REDIS LUA SCRIPT:',
              ...matched.redisScriptSnippet.split('\n').slice(0, 10).map(line => `  ${line}`),
              '  ... [Run "copy lua" in #architecture-rate-limiter to inspect complete script]',
              '--------------------------------------------------------------------------------',
              'Full interactive rate limiter simulator available in #architecture-rate-limiter.'
            ]
            break
          }
        }

        output = [
          'Distributed Rate Limiting & Traffic Shaping Algorithms:',
          '--------------------------------------------------------------------------------',
          'Evaluate 5 production rate limiting algorithms & Redis Lua atomic scripts across systems:',
          '',
          ...RATE_LIMITING_ALGORITHMS.flatMap((a, idx) => [
            `${idx + 1}. [ ${a.id} ] : ${a.algorithmName}`,
            `   System        : ${a.systemName} (${a.category})`,
            `   Capacity & Refill: ${a.capacityLimit} | ${a.refillRate}`,
            `   Complexity    : ${a.timeComplexity} / ${a.memoryComplexity}`,
            `   Deep Dive     : "ratelimit ${idx + 1}" or "ratelimit ${a.id.split('-')[0]}" (e.g. "ratelimit token", "ratelimit leaky", "ratelimit fixed", "ratelimit sliding")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "ratelimit <id>" (e.g. "ratelimit 1" or "ratelimit token") to inspect Redis Lua evaluator.'
        ]
        break
      }
      case 'replication':
      case 'multiregion':
      case 'crdt':
      case 'splitbrain':
      case 'aurora': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = MULTI_REGION_STRATEGIES.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.strategyName.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'aurora-global') ||
            (target === '2' && m.id === 'dynamodb-global') ||
            (target === '3' && m.id === 'crdt-mesh') ||
            (target === '4' && m.id === 'raft-consensus') ||
            (target === '5' && m.id === 'kafka-mirrormaker')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Multi-Region Strategy: ${matched.name} (${matched.subtitle})`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm   : ${matched.strategyName}`,
              `Topology Model  : ${matched.topology}`,
              `Consensus Quorum: ${matched.consensusModel}`,
              `SLA Targets     : RPO: ${matched.rpoTarget} | RTO: ${matched.rtoTarget}`,
              `Consistency     : ${matched.consistencyLevel}`,
              `Conflict Rule   : ${matched.conflictResolution}`,
              `Governing ADR   : ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              'GLOBAL REGION TOPOLOGY:',
              ...matched.regions.map(r => `  * ${r.name} [${r.role.toUpperCase()}] :: Ping: ${r.pingMs}ms | Lag: ${r.replicationLagMs}ms | Conns: ${r.activeConnections}`),
              '--------------------------------------------------------------------------------',
              `CONFLICT ARBITRATION SCENARIO: "${matched.conflictScenario.title}"`,
              `  - Write A (${matched.conflictScenario.writeA.region}): ${matched.conflictScenario.writeA.payload}`,
              `  - Write B (${matched.conflictScenario.writeB.region}): ${matched.conflictScenario.writeB.payload}`,
              `  - Rule: ${matched.conflictScenario.resolutionRule}`,
              `  - Outcome: ${matched.conflictScenario.resolvedOutcome}`,
              '--------------------------------------------------------------------------------',
              'Full live cross-region simulator available in #architecture-multi-region.'
            ]
            break
          }
        }

        output = [
          'Multi-Region Database Replication & Conflict Resolution Simulator:',
          '--------------------------------------------------------------------------------',
          'Explore 5 multi-region replication architectures across global data centers:',
          '',
          ...MULTI_REGION_STRATEGIES.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.subtitle})`,
            `   Paradigm      : ${m.strategyName} | Consensus: ${m.consensusModel.split(' ')[0]}`,
            `   SLA Targets   : RPO: ${m.rpoTarget} | RTO: ${m.rtoTarget}`,
            `   Conflict Model: ${m.conflictResolution.split(' ')[0]} | Consistency: ${m.consistencyLevel.split(' ')[0]}`,
            `   Deep Dive     : "multiregion ${idx + 1}" or "multiregion ${m.id.split('-')[0]}" (e.g. "multiregion aurora", "multiregion dynamodb", "multiregion crdt", "multiregion raft")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "multiregion <id>" (e.g. "multiregion 1" or "multiregion crdt") to inspect conflict arbitration.'
        ]
        break
      }
      case 'sharding':
      case 'consistenthashing':
      case 'reshard':
      case 'ring': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = DATABASE_SHARDING_STRATEGIES.find(s =>
            s.id === target ||
            s.id.includes(target) ||
            s.name.toLowerCase().includes(target) ||
            s.strategyName.toLowerCase().includes(target) ||
            (target === '1' && s.id === 'consistent-hashing') ||
            (target === '2' && s.id === 'hash-modulo') ||
            (target === '3' && s.id === 'range-based') ||
            (target === '4' && s.id === 'directory-lookup') ||
            (target === '5' && s.id === 'geo-partitioning')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Database Sharding Strategy: ${matched.name} (${matched.subtitle})`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm   : ${matched.strategyName}`,
              `Algorithm       : ${matched.partitionAlgorithm}`,
              `Rebalance Cost  : ${matched.rebalancingOverhead}`,
              `Hotspot Guard   : ${matched.hotspotResilience}`,
              `Cross-Shard Cost: ${matched.crossShardJoinComplexity}`,
              `Governing ADR   : ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              'SHARD CLUSTER TOPOLOGY:',
              ...matched.shards.map(sh => `  * ${sh.name} [${sh.status.toUpperCase()}] :: Range: ${sh.assignedRange} | Keys: ${sh.keyCount.toLocaleString()} | Storage: ${sh.storageUsageGb}GB | CPU: ${sh.cpuUtilizationPct}%`),
              '--------------------------------------------------------------------------------',
              'SAMPLE ROUTING PROBES:',
              ...matched.routingProbes.map(rp => `  - Key "${rp.key}" (${rp.entityType}) -> ${rp.targetShardName} | Hash: ${rp.hashHex}`),
              '--------------------------------------------------------------------------------',
              `PRODUCTION WORKLOAD: ${matched.productionUseCase.system}`,
              `  Entity        : ${matched.productionUseCase.entity}`,
              `  Throughput    : ${matched.productionUseCase.workload}`,
              `  Justification : ${matched.productionUseCase.justification}`,
              '--------------------------------------------------------------------------------',
              'Full live interactive hash ring visualizer available in #architecture-database-sharding.'
            ]
            break
          }
        }

        output = [
          'Database Sharding & Consistent Hashing Topology Playground:',
          '--------------------------------------------------------------------------------',
          'Explore 5 horizontal database sharding architectures across distributed clusters:',
          '',
          ...DATABASE_SHARDING_STRATEGIES.flatMap((s, idx) => [
            `${idx + 1}. [ ${s.id} ] : ${s.name} (${s.subtitle})`,
            `   Paradigm      : ${s.strategyName} | ADR: ${s.governingAdr}`,
            `   Partitioning  : ${s.partitionAlgorithm.split('(')[0].trim()}`,
            `   Rebalance Cost: ${s.rebalancingOverhead.split(':')[0]}`,
            `   Deep Dive     : "sharding ${idx + 1}" or "sharding ${s.id.split('-')[0]}" (e.g. "sharding ring", "sharding hash", "sharding range", "sharding directory", "sharding geo")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "sharding <id>" (e.g. "sharding 1" or "sharding ring") to inspect shard topology and probes.'
        ]
        break
      }
      case 'cdn':
      case 'cachepurge':
      case 'surrogate':
      case 'stale': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = EDGE_CDN_STRATEGIES.find(c => 
            c.id === target ||
            c.id.includes(target) ||
            c.name.toLowerCase().includes(target) ||
            c.strategyName.toLowerCase().includes(target) ||
            (target === '1' && c.id === 'surrogate-key-purge') ||
            (target === '2' && c.id === 'stale-while-revalidate') ||
            (target === '3' && c.id === 'origin-shield-hierarchy') ||
            (target === '4' && c.id === 'collapsed-forwarding') ||
            (target === '5' && c.id === 'edge-compute-workers')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Edge CDN Architecture: ${matched.name} (${matched.subtitle})`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.strategyName}`,
              `Cache Header Policy : ${matched.cachePolicyHeader}`,
              `Purge Propagation   : ${matched.purgeLatencyTarget}`,
              `Origin Offload Ratio: ${matched.originOffloadPct}%`,
              `Stampede Defense    : ${matched.stampedeProtection}`,
              `Governing ADR       : ${matched.governingAdr}`,
              '--------------------------------------------------------------------------------',
              'GLOBAL EDGE POP TOPOLOGY:',
              ...matched.pops.map(p =>
                `  * ${p.city} [${p.region}] :: Latency: ${p.edgeLatencyMs}ms | Hit Ratio: ${p.hitRatioPct}% | Cached: ${Math.round(p.cachedObjects / 1000)}k objects`
              ),
              '--------------------------------------------------------------------------------',
              'SURROGATE KEY TAG SPECIFICATIONS:',
              ...matched.surrogateKeys.map(k =>
                `  - Tag: "${k.tag}" (${k.scope}) -> Path: ${k.resourcePath}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION WORKLOAD JUSTIFICATION:',
              `  System: ${matched.productionUseCase.system}`,
              `  Entity: ${matched.productionUseCase.entity} (${matched.productionUseCase.workload})`,
              `  Reason: "${matched.productionUseCase.justification}"`,
              '--------------------------------------------------------------------------------',
              'Full live PoP mesh & tag purge simulator in #architecture-edge-cdn.'
            ]
            break
          }
        }

        output = [
          'Edge CDN Caching & Stale-While-Revalidate Invalidation Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 edge caching architectures across 300+ global data centers:',
          '',
          ...EDGE_CDN_STRATEGIES.flatMap((c, idx) => [
            `${idx + 1}. [ ${c.id} ] : ${c.name} (${c.subtitle})`,
            `   Paradigm      : ${c.strategyName} | Offload: ${c.originOffloadPct}%`,
            `   Purge Target  : ${c.purgeLatencyTarget}`,
            `   Stampede Guard: ${c.stampedeProtection.split(' ')[0]}`,
            `   Deep Dive     : "cdn ${idx + 1}" or "cdn ${c.id.split('-')[0]}" (e.g. "cdn surrogate", "cdn stale", "cdn origin", "cdn collapsed", "cdn edge")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "cdn <id>" (e.g. "cdn 1" or "cdn surrogate") to inspect purge mechanics.'
        ]
        break
      }
      case 'circuitbreaker':
      case 'bulkhead':
      case 'resilience4j':
      case 'backoff': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = CIRCUIT_BREAKER_PATTERNS.find(b => 
            b.id === target ||
            b.id.includes(target) ||
            b.name.toLowerCase().includes(target) ||
            b.badge.toLowerCase().includes(target) ||
            (target === '1' && b.id === 'resilience4j-sliding-window') ||
            (target === '2' && b.id === 'semaphore-thread-bulkhead') ||
            (target === '3' && b.id === 'exponential-backoff-full-jitter') ||
            (target === '4' && b.id === 'adaptive-concurrency-vegas') ||
            (target === '5' && b.id === 'envoy-outlier-ejection')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Circuit Breaker Pattern: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Failure Threshold   : ${matched.failureThreshold}`,
              `Target Latency      : ${matched.targetLatency}`,
              `Blast Containment   : ${matched.blastRadiusContainment}`,
              `Recovery Mechanism  : ${matched.recoveryMechanism}`,
              '--------------------------------------------------------------------------------',
              'FINITE STATE MACHINE BEHAVIOR:',
              ...matched.stateMachine.states.map(s =>
                `  * State [${s.name}] :: ${s.description} -> ${s.behavior}`
              ),
              '--------------------------------------------------------------------------------',
              'STATE TRANSITION TRIGGERS:',
              ...matched.stateMachine.transitions.map(t =>
                `  - ${t.from} -> ${t.to} : ${t.trigger}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live circuit state machine simulator in #architecture-circuit-breaker.'
            ]
            break
          }
        }

        output = [
          'Distributed Circuit Breaker & Cascading Fault Mesh Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 fault-tolerance and cascading failure prevention patterns:',
          '',
          ...CIRCUIT_BREAKER_PATTERNS.flatMap((b, idx) => [
            `${idx + 1}. [ ${b.id} ] : ${b.name} (${b.badge})`,
            `   Paradigm      : ${b.paradigm}`,
            `   Threshold     : ${b.failureThreshold}`,
            `   Blast Radius  : ${b.blastRadiusContainment}`,
            `   Deep Dive     : "circuitbreaker ${idx + 1}" or "circuitbreaker ${b.id.split('-')[0]}" (e.g. "circuitbreaker resilience4j", "circuitbreaker bulkhead", "circuitbreaker backoff", "circuitbreaker vegas", "circuitbreaker outlier")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "circuitbreaker <id>" (e.g. "circuitbreaker 1" or "circuitbreaker resilience4j") to inspect state machine rules.'
        ]
        break
      }
      case 'concurrency':
      case 'deadlock':
      case 'twophase':
      case 'occ':
      case 'mvcc': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = CONCURRENCY_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'strict-2pl-wait-die') ||
            (target === '2' && m.id === 'optimistic-concurrency-control') ||
            (target === '3' && m.id === 'mvcc-snapshot-isolation') ||
            (target === '4' && m.id === 'wait-for-graph-tarjan') ||
            (target === '5' && m.id === 'distributed-lock-manager-redlock')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Concurrency Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Lock Overhead       : ${matched.lockOverhead}`,
              `Deadlock Strategy   : ${matched.deadlockStrategy}`,
              `Isolation Level     : ${matched.isolationLevel}`,
              `Scale Profile       : ${matched.scaleProfile}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live Wait-For Graph cycle detection & Tarjan abort simulator in #architecture-distributed-concurrency.'
            ]
            break
          }
        }

        output = [
          'Distributed Concurrency & Deadlock Control Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 distributed concurrency, locking, and deadlock detection models:',
          '',
          ...CONCURRENCY_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Deadlock Rule : ${m.deadlockStrategy}`,
            `   Isolation     : ${m.isolationLevel}`,
            `   Deep Dive     : "concurrency ${idx + 1}" or "concurrency ${m.id.split('-')[0]}" (e.g. "concurrency 2pl", "concurrency occ", "concurrency mvcc", "concurrency tarjan", "concurrency redlock")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "concurrency <id>" (e.g. "concurrency 1" or "concurrency tarjan") to inspect transaction locks.'
        ]
        break
      }
      case 'raft':
      case 'consensus':
      case 'paxos':
      case 'election': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = CONSENSUS_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'raft-leader-election') ||
            (target === '2' && m.id === 'raft-log-replication') ||
            (target === '3' && m.id === 'multi-raft-split-brain') ||
            (target === '4' && m.id === 'joint-consensus-reconfiguration') ||
            (target === '5' && m.id === 'paxos-synod-comparison')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Distributed Consensus Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Quorum Requirement  : ${matched.quorumRequirement}`,
              `Election Timeout    : ${matched.electionTimeoutRange}`,
              `Split-Brain Defense : ${matched.splitBrainDefense}`,
              `Log Invariant       : ${matched.logConsistencyInvariant}`,
              '--------------------------------------------------------------------------------',
              'PROTOCOL PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live 5-node Raft cluster simulation in #architecture-raft-consensus.'
            ]
            break
          }
        }

        output = [
          'Distributed Consensus & Raft Leader Election State Machine Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 consensus, log replication, and quorum management paradigms:',
          '',
          ...CONSENSUS_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Quorum Rule   : ${m.quorumRequirement}`,
            `   Split-Brain   : ${m.splitBrainDefense}`,
            `   Deep Dive     : "raft ${idx + 1}" or "raft ${m.id.split('-')[0]}" (e.g. "raft election", "raft log", "raft partition", "raft joint", "raft paxos")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "raft <id>" (e.g. "raft 1" or "raft election") to inspect consensus state transitions.'
        ]
        break
      }
      case 'vectorsearch':
      case 'hnsw':
      case 'ivfpq':
      case 'rrf':
      case 'embeddings': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = VECTOR_SEARCH_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'hnsw-skip-list-graphs') ||
            (target === '2' && m.id === 'ivf-pq-quantization') ||
            (target === '3' && m.id === 'sharded-vector-routing') ||
            (target === '4' && m.id === 'hybrid-dense-sparse-rrf') ||
            (target === '5' && m.id === 'vector-quantization-profiler')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Vector Search Architecture: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Search Complexity   : ${matched.searchComplexity}`,
              `Memory Profile      : ${matched.memoryProfile}`,
              `Indexing Rate       : ${matched.indexingThroughput}`,
              `Recall Accuracy     : ${matched.recallAccuracy}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive 2D hyperspace probe and HNSW beam traversal in #architecture-vector-search.'
            ]
            break
          }
        }

        output = [
          'Distributed Sharded Vector Search & HNSW Indexing Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 vector search, quantization, and hybrid retrieval architectures:',
          '',
          ...VECTOR_SEARCH_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Complexity    : ${m.searchComplexity}`,
            `   Recall Target : ${m.recallAccuracy}`,
            `   Deep Dive     : "vectorsearch ${idx + 1}" or "vectorsearch ${m.id.split('-')[0]}" (e.g. "vectorsearch hnsw", "vectorsearch ivf", "vectorsearch sharded", "vectorsearch rrf", "vectorsearch quantization")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "vectorsearch <id>" (e.g. "vectorsearch 1" or "vectorsearch hnsw") to inspect index traversal.'
        ]
        break
      }
      case 'qos':
      case 'priorityqueue':
      case 'wfq':
      case 'codel':
      case 'loadshedding': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = TRAFFIC_PRIORITY_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'multi-tier-tenant-priority-queue') ||
            (target === '2' && m.id === 'weighted-fair-queuing-wfq') ||
            (target === '3' && m.id === 'controlled-delay-codel-aqm') ||
            (target === '4' && m.id === 'dynamic-surge-token-bucket') ||
            (target === '5' && m.id === 'graceful-load-shedding-backpressure')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Traffic Priority Architecture: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Algorithm Overhead  : ${matched.algorithmComplexity}`,
              `Queue Overhead      : ${matched.queueOverhead}`,
              `Throughput Capacity : ${matched.throughputProfile}`,
              `Latency Target      : ${matched.latencyGuarantee}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive multi-queue packet drain and CoDel monitor in #architecture-traffic-priority.'
            ]
            break
          }
        }

        output = [
          'Distributed Token-Bucket API Shaper & Bounded Priority Queuing Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 QoS, traffic shaping, and bufferbloat mitigation architectures:',
          '',
          ...TRAFFIC_PRIORITY_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Complexity    : ${m.algorithmComplexity}`,
            `   Latency SLA   : ${m.latencyGuarantee}`,
            `   Deep Dive     : "qos ${idx + 1}" or "qos ${m.id.split('-')[0]}" (e.g. "qos tenant", "qos wfq", "qos codel", "qos token", "qos shedding")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "qos <id>" (e.g. "qos 1" or "qos wfq") to inspect queue drain and credit mechanics.'
        ]
        break
      }
      case 'sagas':
      case 'orchestration':
      case 'choreography':
      case 'compensation':
      case 'outbox': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = DISTRIBUTED_SAGA_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'orchestrated-saga-temporal') ||
            (target === '2' && m.id === 'choreographed-saga-kafka') ||
            (target === '3' && m.id === 'backward-compensation-recovery') ||
            (target === '4' && m.id === 'forward-recovery-retry') ||
            (target === '5' && m.id === 'dual-write-atomic-outbox')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Distributed Saga Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Coordination Style  : ${matched.coordinationModel}`,
              `Coupling Model      : ${matched.couplingType}`,
              `Fault Recovery      : ${matched.faultRecoveryStyle}`,
              `Isolation Guarantee : ${matched.isolationGuarantee}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'SAGA ACTIVITIES & COMPENSATING TRANSACTIONS:',
              ...matched.steps.map((s, idx) =>
                `  ${idx + 1}. [${s.service}] Forward: ${s.action} | Compensate: ${s.compensatingAction} (${s.durationMs}ms)`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive transaction stepper and failure injection in #architecture-distributed-sagas.'
            ]
            break
          }
        }

        output = [
          'Distributed Saga Orchestration vs Choreography & Compensation State Engine:',
          '--------------------------------------------------------------------------------',
          'Explore 5 distributed transaction and compensation architectures across microservices:',
          '',
          ...DISTRIBUTED_SAGA_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Coordination  : ${m.coordinationModel.split(';')[0]}`,
            `   Fault Style   : ${m.faultRecoveryStyle}`,
            `   Deep Dive     : "sagas ${idx + 1}" or "sagas ${m.id.split('-')[0]}" (e.g. "sagas temporal", "sagas kafka", "sagas backward", "sagas forward", "sagas outbox")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "sagas <id>" (e.g. "sagas 1" or "sagas temporal") to inspect forward activities and compensation logic.'
        ]
        break
      }
      case 'cache':
      case 'stampede':
      case 'xfetch':
      case 'singleflight':
      case 'coalesce': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = DISTRIBUTED_CACHE_MODELS.find(m => 
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'xfetch-probabilistic-early-expiration') ||
            (target === '2' && m.id === 'singleflight-request-coalescing') ||
            (target === '3' && m.id === 'redis-mutex-leasing-redlock') ||
            (target === '4' && m.id === 'tiered-multi-level-l1-l2-caching') ||
            (target === '5' && m.id === 'cdc-wal-invalidation-debezium')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Cache Coherence Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Algorithm Formula   : ${matched.algorithmFormula}`,
              `Origin Protection   : ${matched.originLoadReduction}`,
              `P99 Latency Target  : ${matched.p99Latency}`,
              `Memory Footprint    : ${matched.memoryFootprint}`,
              `Concurrency Defense : ${matched.concurrencyProtection}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive cache stampede surge generator in #architecture-distributed-cache.'
            ]
            break
          }
        }

        output = [
          'Distributed Cache Stampede, Multi-Tier Coherence & Mutex Leasing Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 high-scale cache coherence and stampede mitigation architectures:',
          '',
          ...DISTRIBUTED_CACHE_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm      : ${m.paradigm}`,
            `   Origin Offload: ${m.originLoadReduction.split('(')[0]}`,
            `   P99 Latency   : ${m.p99Latency.split('(')[0]}`,
            `   Deep Dive     : "cache ${idx + 1}" or "cache ${m.id.split('-')[0]}" (e.g. "cache xfetch", "cache singleflight", "cache redis", "cache tiered", "cache cdc")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "cache <id>" (e.g. "cache 1" or "cache xfetch") to inspect stochastic early expiration and coalescing.'
        ]
        break
      }
      case 'eventsourcing':
      case 'cqrs':
      case 'snapshot':
      case 'replay':
      case 'upcaster': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = EVENT_SOURCING_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'append-only-event-store') ||
            (target === '2' && m.id === 'point-in-time-replay') ||
            (target === '3' && m.id === 'snapshot-materialization') ||
            (target === '4' && m.id === 'cqrs-read-projections') ||
            (target === '5' && m.id === 'event-schema-upcasting')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Event Sourcing Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Algorithm Formula   : ${matched.algorithmFormula}`,
              `Replay Efficiency   : ${matched.replayEfficiency}`,
              `Storage Efficiency  : ${matched.storageEfficiency}`,
              `Concurrency Defense : ${matched.concurrencyProtection}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive time-travel scrubber in #architecture-event-sourcing.'
            ]
            break
          }
        }

        output = [
          'Distributed Event Sourcing, CQRS & Snapshot Materialization Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise event-driven architectures & temporal state models:',
          '',
          ...EVENT_SOURCING_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm   : ${m.paradigm}`,
            `   Replay SLA : ${m.replayEfficiency.split(';')[0]}`,
            `   Storage    : ${m.storageEfficiency.split(';')[0]}`,
            `   Deep Dive  : "eventsourcing ${idx + 1}" or "eventsourcing ${m.id.split('-')[0]}" (e.g. "eventsourcing append", "eventsourcing replay", "eventsourcing snapshot", "eventsourcing cqrs", "eventsourcing upcast")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "eventsourcing <id>" (e.g. "eventsourcing 1" or "eventsourcing snapshot") to inspect replay invariants.'
        ]
        break
      }
      case 'dlq':
      case 'retry':
      case 'poisonpill':
      case 'backoffjitter':
      case 'parkinglot': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = DLQ_RETRY_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'exponential-decorrelated-jitter') ||
            (target === '2' && m.id === 'staggered-retry-topics') ||
            (target === '3' && m.id === 'poison-pill-quarantine') ||
            (target === '4' && m.id === 'idempotent-dlq-replay-stepper') ||
            (target === '5' && m.id === 'out-of-order-dlq-reconciliation')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `DLQ & Retry Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Algorithm Formula   : ${matched.algorithmFormula}`,
              `Recovery SLA        : ${matched.recoveryLatency}`,
              `Poison Pill Defense : ${matched.poisonPillIsolation}`,
              `HoL Blocking Guard  : ${matched.headOfLineBlockingDefense}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive poison pill and retry simulator in #architecture-dlq-retry.'
            ]
            break
          }
        }

        output = [
          'Distributed Dead-Letter Queue (DLQ) & Non-Blocking Retry Matrix Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise fault isolation and poison-pill retry architectures:',
          '',
          ...DLQ_RETRY_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm   : ${m.paradigm}`,
            `   Recovery   : ${m.recoveryLatency.split(';')[0]}`,
            `   Isolation  : ${m.poisonPillIsolation.split(';')[0]}`,
            `   Deep Dive  : "dlq ${idx + 1}" or "dlq ${m.id.split('-')[0]}" (e.g. "dlq jitter", "dlq staggered", "dlq poison", "dlq replay", "dlq reconciliation")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "dlq <id>" (e.g. "dlq 1" or "dlq poison") to inspect backoff algorithms and quarantine rules.'
        ]
        break
      }
      case 'idempotency':
      case 'dedup':
      case 'fencingtoken':
      case 'idempotentkey':
      case 'replayhammer': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = IDEMPOTENCY_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'redis-redlock-fencing-tokens') ||
            (target === '2' && m.id === 'sliding-window-ingress-dedup') ||
            (target === '3' && m.id === 'database-unique-cas-locks') ||
            (target === '4' && m.id === 'webhook-at-least-once-dedup') ||
            (target === '5' && m.id === 'cryptographic-request-fingerprinting')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Idempotency Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Core Paradigm       : ${matched.paradigm}`,
              `Algorithm Formula   : ${matched.algorithmFormula}`,
              `Deduplication SLA   : ${matched.dedupLatency}`,
              `Double-Exec Defense : ${matched.doubleExecutionDefense}`,
              `Storage Ledger      : ${matched.storageModel}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive duplicate hammer and replay simulator in #architecture-idempotency.'
            ]
            break
          }
        }

        output = [
          'Distributed Idempotency Key & Two-Phase Ingress Committer Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise deduplication and linearizable execution architectures:',
          '',
          ...IDEMPOTENCY_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Paradigm   : ${m.paradigm}`,
            `   Latency    : ${m.dedupLatency.split(';')[0]}`,
            `   Defense    : ${m.doubleExecutionDefense.split(';')[0]}`,
            `   Deep Dive  : "idempotency ${idx + 1}" or "idempotency ${m.id.split('-')[0]}" (e.g. "idempotency redlock", "idempotency sliding", "idempotency cas", "idempotency webhook", "idempotency sha256")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "idempotency <id>" (e.g. "idempotency 1" or "idempotency redlock") to inspect fencing tokens and CAS locks.'
        ]
        break
      }
      case 'atomiccommit':
      case 'twophasecommit':
      case '2pc':
      case '3pc':
      case 'indoubt':
      case 'coordinator': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = ATOMIC_COMMIT_PARADIGMS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.title.toLowerCase().includes(target) ||
            m.category.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'two-phase-commit') ||
            (target === '2' && m.id === 'three-phase-commit') ||
            (target === '3' && m.id === 'choreographed-outbox-saga') ||
            (target === '4' && m.id === 'dual-write-drift-reconciler') ||
            (target === '5' && m.id === 'paxos-truetime-commit')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Atomic Commit Model: ${matched.title}`,
              '--------------------------------------------------------------------------------',
              `Category            : ${matched.category}`,
              `Tagline             : ${matched.tagline}`,
              `Blocking Invariant  : ${matched.blockingNature}`,
              `Line Throughput     : ${matched.throughputTps}`,
              `P99 Latency         : ${matched.latencyP99}`,
              `Recovery Guarantee  : ${matched.recoveryGuarantee}`,
              '--------------------------------------------------------------------------------',
              'STATE TRANSITIONS & INVARIANTS:',
              ...matched.steps.map(s =>
                `  * [${s.phase}] (${s.actor}) -> Invariant: ${s.invariant}`
              ),
              '--------------------------------------------------------------------------------',
              `Trade-Off Summary: ${matched.tradeOffSummary}`,
              '--------------------------------------------------------------------------------',
              'Full live interactive coordinator crash and drift reconciler in #architecture-atomic-commit.'
            ]
            break
          }
        }

        output = [
          'Distributed Two-Phase Commit (2PC) vs Saga & Dual-Write Invariant Matrix:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise atomic commit and distributed coordination architectures:',
          '',
          ...ATOMIC_COMMIT_PARADIGMS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.title}`,
            `   Category   : ${m.category}`,
            `   Blocking   : ${m.blockingNature}`,
            `   Throughput : ${m.throughputTps}`,
            `   Deep Dive  : "2pc ${idx + 1}" or "2pc ${m.id.split('-')[0]}" (e.g. "2pc 1", "2pc 2", "2pc saga", "2pc drift", "2pc paxos")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "2pc <id>" (e.g. "2pc 1" or "2pc saga") to inspect step invariants and failure recovery.'
        ]
        break
      }
      case 'featureflag':
      case 'featureflags':
      case 'flags':
      case 'canary':
      case 'murmurhash':
      case 'openfeature':
      case 'killswitch': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = FEATURE_FLAG_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'murmurhash3-consistent-bucketing') ||
            (target === '2' && m.id === 'openfeature-contextual-rules') ||
            (target === '3' && m.id === 'canary-traffic-splitter-circuit') ||
            (target === '4' && m.id === 'sse-edge-flag-streaming') ||
            (target === '5' && m.id === 'flag-debt-deprecation-sentinel')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Feature Flag Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Category            : ${matched.category}`,
              `Algorithm Formula   : ${matched.algorithmFormula}`,
              `Evaluation Latency  : ${matched.evaluationLatency}`,
              `Rollback Guarantee  : ${matched.rollbackGuarantee}`,
              `Uniformity Metric   : ${matched.distributionUniformity}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive rollout slider and canary circuit breaker in #architecture-feature-flags.'
            ]
            break
          }
        }

        output = [
          'Distributed Dynamic Feature Flagging & Canary Traffic Splitter Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise dynamic flag evaluation and canary routing architectures:',
          '',
          ...FEATURE_FLAG_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Category   : ${m.category}`,
            `   Latency    : ${m.evaluationLatency.split(';')[0]}`,
            `   Rollback   : ${m.rollbackGuarantee.split(';')[0]}`,
            `   Deep Dive  : "flags ${idx + 1}" or "flags ${m.id.split('-')[0]}" (e.g. "flags murmur", "flags openfeature", "flags canary", "flags sse", "flags debt")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "flags <id>" (e.g. "flags 1" or "flags canary") to inspect rollout invariants.'
        ]
        break
      }
      case 'rls':
      case 'tenantisolation':
      case 'multitenancy':
      case 'kmsenvelope':
      case 'leakprobe': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = TENANT_ISOLATION_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'postgres-rls-session-context') ||
            (target === '2' && m.id === 'dynamic-schema-per-tenant') ||
            (target === '3' && m.id === 'kms-envelope-encryption') ||
            (target === '4' && m.id === 'cross-tenant-leak-probe') ||
            (target === '5' && m.id === 'tenant-noisy-neighbor-qos')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Multi-Tenant Isolation Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Category            : ${matched.category}`,
              `Isolation Latency   : ${matched.isolationLatency}`,
              `Leak Prevention SLA : ${matched.leakPreventionGuarantee}`,
              `Mathematical Formula: ${matched.algorithmFormula}`,
              `Blast Radius Guard  : ${matched.blastRadiusContainment}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & SECURITY INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Security Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive penetration probe & KMS rotation simulator in #architecture-tenant-isolation.'
            ]
            break
          }
        }

        output = [
          'Distributed Multi-Tenant Row-Level Security & Cryptographic Isolation Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise tenant isolation & kernel relational security architectures:',
          '',
          ...TENANT_ISOLATION_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Category   : ${m.category}`,
            `   Overhead   : ${m.isolationLatency.split(';')[0]}`,
            `   Guarantee  : ${m.leakPreventionGuarantee.split(';')[0]}`,
            `   Deep Dive  : "rls ${idx + 1}" or "rls ${m.id.split('-')[0]}" (e.g. "rls postgres", "rls dynamic", "rls kms", "rls cross", "rls tenant")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "rls <id>" (e.g. "rls 1" or "rls kms") to inspect tenant security policies.'
        ]
        break
      }
      case 'zerotrust':
      case 'spiffe':
      case 'mtls':
      case 'svid':
      case 'meshpolicy': {
        const target = args[0]?.toLowerCase().trim()
        if (target) {
          const matched = ZERO_TRUST_MESH_MODELS.find(m =>
            m.id === target ||
            m.id.includes(target) ||
            m.name.toLowerCase().includes(target) ||
            m.badge.toLowerCase().includes(target) ||
            (target === '1' && m.id === 'spiffe-spire-workload-attestation') ||
            (target === '2' && m.id === 'envoy-mtls-san-validation') ||
            (target === '3' && m.id === 'dynamic-rbac-authorization-policy') ||
            (target === '4' && m.id === 'zero-trust-egress-sni-filtering') ||
            (target === '5' && m.id === 'ebpf-kernel-socket-enforcement')
          )
          if (matched) {
            output = [
              '--------------------------------------------------------------------------------',
              `Zero-Trust Service Mesh Model: ${matched.name} [${matched.badge}]`,
              '--------------------------------------------------------------------------------',
              `Category            : ${matched.category}`,
              `Handshake Overhead  : ${matched.handshakeLatency}`,
              `Verification SLA    : ${matched.identityVerificationSla}`,
              `Mathematical Formula: ${matched.algorithmFormula}`,
              `Blast Radius Guard  : ${matched.blastRadiusContainment}`,
              '--------------------------------------------------------------------------------',
              'WORKFLOW PHASES & CRYPTOGRAPHIC INVARIANTS:',
              ...matched.workflowPhases.map(p =>
                `  * [${p.name}] :: ${p.description} -> Invariant: ${p.invariants}`
              ),
              '--------------------------------------------------------------------------------',
              'PRODUCTION OUTCOMES & INVARIANTS:',
              ...Object.entries(matched.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
              '',
              `Architectural Invariant: "${matched.architecturalInvariant}"`,
              '--------------------------------------------------------------------------------',
              'Full live interactive mTLS handshake & SVID rotation simulator in #architecture-zero-trust-mesh.'
            ]
            break
          }
        }

        output = [
          'Distributed Zero-Trust Service Mesh & Envoy SPIFFE/SPIRE Mutual TLS Sandbox:',
          '--------------------------------------------------------------------------------',
          'Explore 5 enterprise cryptographic workload identity & mTLS mesh architectures:',
          '',
          ...ZERO_TRUST_MESH_MODELS.flatMap((m, idx) => [
            `${idx + 1}. [ ${m.id} ] : ${m.name} (${m.badge})`,
            `   Category   : ${m.category}`,
            `   Latency    : ${m.handshakeLatency.split(';')[0]}`,
            `   SLA        : ${m.identityVerificationSla.split(';')[0]}`,
            `   Deep Dive  : "mtls ${idx + 1}" or "mtls ${m.id.split('-')[0]}" (e.g. "mtls spiffe", "mtls envoy", "mtls dynamic", "mtls zero", "mtls ebpf")`,
            ''
          ]),
          '--------------------------------------------------------------------------------',
          'Tip: Run "mtls <id>" (e.g. "mtls 1" or "mtls spiffe") to inspect cryptographic SVID invariants.'
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
            'Available Domains: Systems, ADR Governance, AI Codex, Trade-Off Matrix, Evolution Diffs, Chaos Drills, API Gateway, Distributed Traces, Kafka Event Streams, Distributed Rate Limiting, Multi-Region Replication, Database Sharding, Edge CDN Caching, Circuit Breakers, Concurrency & Deadlocks, Raft Consensus, Vector Search, Traffic Priority & QoS, Distributed Sagas & Compensations, Distributed Cache Stampede & Coherence, Distributed Event Sourcing & CQRS, Distributed DLQ & Retries, Distributed Idempotency & CAS Locks, Distributed 2PC vs Saga Commit & Drift Reconciler, Dynamic Feature Flagging & Canary Splitter, Multi-Tenant RLS & Cryptographic Isolation, Zero-Trust Service Mesh & SPIFFE mTLS'
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

        // 5. Search Evolution Diffs
        ARCHITECTURE_EVOLUTIONS.forEach(e => {
          if (
            e.systemName.toLowerCase().includes(query) ||
            e.headline.toLowerCase().includes(query) ||
            e.category.toLowerCase().includes(query) ||
            e.legacyArchitecture.title.toLowerCase().includes(query) ||
            e.modernArchitecture.title.toLowerCase().includes(query)
          ) {
            results.push(
              `[Evolution Diff] ${e.systemName}: ${e.headline}`,
              `  Governing  : ${e.adrReference} (${e.category})`,
              `  Anchor     : #architecture-evolution-diff`,
              ''
            )
          }
        })

        // 6. Search Chaos Drills
        CHAOS_DRILLS.forEach(d => {
          if (
            d.title.toLowerCase().includes(query) ||
            d.systemName.toLowerCase().includes(query) ||
            d.category.toLowerCase().includes(query) ||
            d.failureType.toLowerCase().includes(query) ||
            d.injectedFault.toLowerCase().includes(query) ||
            d.sreHypothesis.toLowerCase().includes(query) ||
            d.governingAdr.toLowerCase().includes(query)
          ) {
            results.push(
              `[Chaos Drill] ${d.title}`,
              `  Recovery   : RTO: ${d.impactMetrics.rto} | RPO: ${d.impactMetrics.rpo}`,
              `  Anchor     : #architecture-chaos-matrix`,
              ''
            )
          }
        })

        // 7. Search Gateway Routes
        GATEWAY_ROUTES.forEach(r => {
          if (
            r.title.toLowerCase().includes(query) ||
            r.routePath.toLowerCase().includes(query) ||
            r.systemName.toLowerCase().includes(query) ||
            r.upstreamService.toLowerCase().includes(query) ||
            r.protocol.toLowerCase().includes(query) ||
            r.summary.toLowerCase().includes(query) ||
            r.governingAdr.toLowerCase().includes(query)
          ) {
            results.push(
              `[Gateway Ingress] ${r.method} ${r.routePath}`,
              `  Target     : ${r.upstreamService} (${r.latencyTarget})`,
              `  Anchor     : #architecture-api-gateway`,
              ''
            )
          }
        })

        // 8. Search Distributed Traces
        DISTRIBUTED_TRACES.forEach(t => {
          if (
            t.title.toLowerCase().includes(query) ||
            t.rootEndpoint.toLowerCase().includes(query) ||
            t.systemName.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.criticalBottleneck.toLowerCase().includes(query) ||
            t.summary.toLowerCase().includes(query) ||
            t.governingAdr.toLowerCase().includes(query) ||
            t.spans.some(s => s.operationName.toLowerCase().includes(query) || s.serviceName.toLowerCase().includes(query))
          ) {
            results.push(
              `[Distributed Trace] ${t.title}`,
              `  Endpoint   : ${t.rootEndpoint} (${t.totalDurationMs.toFixed(1)}ms)`,
              `  Anchor     : #architecture-distributed-tracing`,
              ''
            )
          }
        })

        // 9. Search Kafka Event Streams
        KAFKA_TOPIC_STREAMS.forEach(k => {
          if (
            k.title.toLowerCase().includes(query) ||
            k.topicId.toLowerCase().includes(query) ||
            k.systemName.toLowerCase().includes(query) ||
            k.category.toLowerCase().includes(query) ||
            k.summary.toLowerCase().includes(query) ||
            k.governingAdr.toLowerCase().includes(query) ||
            k.consumerGroups.some(cg => cg.groupId.toLowerCase().includes(query))
          ) {
            results.push(
              `[Kafka Event Stream] ${k.title}`,
              `  Topic      : ${k.topicId} (${k.partitionsCount} parts, ${k.targetThroughputTps})`,
              `  Anchor     : #architecture-event-streams`,
              ''
            )
          }
        })

        // 10. Search Distributed Rate Limiting
        RATE_LIMITING_ALGORITHMS.forEach(a => {
          if (
            a.algorithmName.toLowerCase().includes(query) ||
            a.id.toLowerCase().includes(query) ||
            a.systemName.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query) ||
            a.governingAdr.toLowerCase().includes(query) ||
            a.pros.some(p => p.toLowerCase().includes(query)) ||
            a.cons.some(c => c.toLowerCase().includes(query))
          ) {
            results.push(
              `[Rate Limiter] ${a.algorithmName}`,
              `  Algorithm  : ${a.id} (${a.capacityLimit}, ${a.refillRate})`,
              `  Anchor     : #architecture-rate-limiter`,
              ''
            )
          }
        })

        // 11. Search Multi-Region Database Replication
        MULTI_REGION_STRATEGIES.forEach(m => {
          if (
            m.name.toLowerCase().includes(query) ||
            m.id.toLowerCase().includes(query) ||
            m.strategyName.toLowerCase().includes(query) ||
            m.subtitle.toLowerCase().includes(query) ||
            m.topology.toLowerCase().includes(query) ||
            m.summary.toLowerCase().includes(query) ||
            m.governingAdr.toLowerCase().includes(query) ||
            m.productionUseCase.system.toLowerCase().includes(query) ||
            m.regions.some(r => r.name.toLowerCase().includes(query) || r.id.toLowerCase().includes(query))
          ) {
            results.push(
              `[Multi-Region Replication] ${m.name}`,
              `  Strategy   : ${m.strategyName} (${m.consensusModel.split(' ')[0]})`,
              `  Anchor     : #architecture-multi-region`,
              ''
            )
          }
        })

        // 12. Search Database Sharding & Consistent Hashing
        DATABASE_SHARDING_STRATEGIES.forEach(s => {
          if (
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.strategyName.toLowerCase().includes(query) ||
            s.subtitle.toLowerCase().includes(query) ||
            s.partitionAlgorithm.toLowerCase().includes(query) ||
            s.summary.toLowerCase().includes(query) ||
            s.governingAdr.toLowerCase().includes(query) ||
            s.productionUseCase.system.toLowerCase().includes(query) ||
            s.shards.some(sh => sh.name.toLowerCase().includes(query) || sh.id.toLowerCase().includes(query)) ||
            s.routingProbes.some(rp => rp.key.toLowerCase().includes(query) || rp.targetShardName.toLowerCase().includes(query))
          ) {
            results.push(
              `[Database Sharding] ${s.name}`,
              `  Strategy   : ${s.strategyName} (${s.shards.length} Shards)`,
              `  Anchor     : #architecture-database-sharding`,
              ''
            )
          }
        })

        // 13. Search Edge CDN Caching & Invalidation
        EDGE_CDN_STRATEGIES.forEach(c => {
          if (
            c.name.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query) ||
            c.strategyName.toLowerCase().includes(query) ||
            c.subtitle.toLowerCase().includes(query) ||
            c.cachePolicyHeader.toLowerCase().includes(query) ||
            c.summary.toLowerCase().includes(query) ||
            c.governingAdr.toLowerCase().includes(query) ||
            c.productionUseCase.system.toLowerCase().includes(query) ||
            c.pops.some(p => p.city.toLowerCase().includes(query) || p.region.toLowerCase().includes(query)) ||
            c.surrogateKeys.some(sk => sk.tag.toLowerCase().includes(query) || sk.resourcePath.toLowerCase().includes(query))
          ) {
            results.push(
              `[Edge CDN Caching] ${c.name}`,
              `  Strategy   : ${c.strategyName} (${c.originOffloadPct}% offload)`,
              `  Anchor     : #architecture-edge-cdn`,
              ''
            )
          }
        })

        // 14. Search Distributed Circuit Breakers & Fault Tolerance
        CIRCUIT_BREAKER_PATTERNS.forEach(b => {
          if (
            b.name.toLowerCase().includes(query) ||
            b.id.toLowerCase().includes(query) ||
            b.paradigm.toLowerCase().includes(query) ||
            b.badge.toLowerCase().includes(query) ||
            b.failureThreshold.toLowerCase().includes(query) ||
            b.architecturalInvariant.toLowerCase().includes(query) ||
            b.stateMachine.states.some(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
          ) {
            results.push(
              `[Circuit Breaker] ${b.name}`,
              `  Paradigm   : ${b.paradigm} (${b.badge})`,
              `  Anchor     : #architecture-circuit-breaker`,
              ''
            )
          }
        })

        // 15. Search Distributed Concurrency & Deadlocks
        CONCURRENCY_MODELS.forEach(c => {
          if (
            c.name.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query) ||
            c.paradigm.toLowerCase().includes(query) ||
            c.badge.toLowerCase().includes(query) ||
            c.deadlockStrategy.toLowerCase().includes(query) ||
            c.isolationLevel.toLowerCase().includes(query) ||
            c.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Distributed Concurrency] ${c.name}`,
              `  Paradigm   : ${c.paradigm} (${c.badge})`,
              `  Deadlock   : ${c.deadlockStrategy}`,
              `  Anchor     : #architecture-distributed-concurrency`,
              ''
            )
          }
        })

        // 16. Search Distributed Consensus & Raft
        CONSENSUS_MODELS.forEach(c => {
          if (
            c.name.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query) ||
            c.paradigm.toLowerCase().includes(query) ||
            c.badge.toLowerCase().includes(query) ||
            c.quorumRequirement.toLowerCase().includes(query) ||
            c.logConsistencyInvariant.toLowerCase().includes(query) ||
            c.splitBrainDefense.toLowerCase().includes(query) ||
            c.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Distributed Consensus] ${c.name}`,
              `  Paradigm   : ${c.paradigm} (${c.badge})`,
              `  Quorum     : ${c.quorumRequirement}`,
              `  Anchor     : #architecture-raft-consensus`,
              ''
            )
          }
        })

        // 17. Search Distributed Vector Search & HNSW
        VECTOR_SEARCH_MODELS.forEach(v => {
          if (
            v.name.toLowerCase().includes(query) ||
            v.id.toLowerCase().includes(query) ||
            v.paradigm.toLowerCase().includes(query) ||
            v.badge.toLowerCase().includes(query) ||
            v.searchComplexity.toLowerCase().includes(query) ||
            v.memoryProfile.toLowerCase().includes(query) ||
            v.recallAccuracy.toLowerCase().includes(query) ||
            v.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Vector Search] ${v.name}`,
              `  Paradigm   : ${v.paradigm} (${v.badge})`,
              `  Complexity : ${v.searchComplexity}`,
              `  Anchor     : #architecture-vector-search`,
              ''
            )
          }
        })

        // 18. Search Distributed QoS & Priority Queuing
        TRAFFIC_PRIORITY_MODELS.forEach(p => {
          if (
            p.name.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.paradigm.toLowerCase().includes(query) ||
            p.badge.toLowerCase().includes(query) ||
            p.algorithmComplexity.toLowerCase().includes(query) ||
            p.queueOverhead.toLowerCase().includes(query) ||
            p.throughputProfile.toLowerCase().includes(query) ||
            p.latencyGuarantee.toLowerCase().includes(query) ||
            p.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Traffic Priority QoS] ${p.name}`,
              `  Paradigm   : ${p.paradigm} (${p.badge})`,
              `  Latency    : ${p.latencyGuarantee}`,
              `  Anchor     : #architecture-traffic-priority`,
              ''
            )
          }
        })

        // 19. Search Distributed Sagas & Compensation
        DISTRIBUTED_SAGA_MODELS.forEach(s => {
          if (
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.paradigm.toLowerCase().includes(query) ||
            s.badge.toLowerCase().includes(query) ||
            s.coordinationModel.toLowerCase().includes(query) ||
            s.couplingType.toLowerCase().includes(query) ||
            s.faultRecoveryStyle.toLowerCase().includes(query) ||
            s.isolationGuarantee.toLowerCase().includes(query) ||
            s.architecturalInvariant.toLowerCase().includes(query) ||
            s.steps.some(st => st.name.toLowerCase().includes(query) || st.service.toLowerCase().includes(query) || st.action.toLowerCase().includes(query))
          ) {
            results.push(
              `[Distributed Saga] ${s.name}`,
              `  Paradigm   : ${s.paradigm} (${s.badge})`,
              `  Recovery   : ${s.faultRecoveryStyle}`,
              `  Anchor     : #architecture-distributed-sagas`,
              ''
            )
          }
        })

        // 20. Search Distributed Cache Stampede & Coherence
        DISTRIBUTED_CACHE_MODELS.forEach(c => {
          if (
            c.name.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query) ||
            c.paradigm.toLowerCase().includes(query) ||
            c.badge.toLowerCase().includes(query) ||
            c.algorithmFormula.toLowerCase().includes(query) ||
            c.p99Latency.toLowerCase().includes(query) ||
            c.originLoadReduction.toLowerCase().includes(query) ||
            c.memoryFootprint.toLowerCase().includes(query) ||
            c.concurrencyProtection.toLowerCase().includes(query) ||
            c.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Distributed Cache] ${c.name}`,
              `  Paradigm   : ${c.paradigm} (${c.badge})`,
              `  Latency    : ${c.p99Latency.split('(')[0]}`,
              `  Anchor     : #architecture-distributed-cache`,
              ''
            )
          }
        })

        // 21. Search Distributed Event Sourcing & CQRS
        EVENT_SOURCING_MODELS.forEach(e => {
          if (
            e.name.toLowerCase().includes(query) ||
            e.id.toLowerCase().includes(query) ||
            e.paradigm.toLowerCase().includes(query) ||
            e.badge.toLowerCase().includes(query) ||
            e.algorithmFormula.toLowerCase().includes(query) ||
            e.replayEfficiency.toLowerCase().includes(query) ||
            e.storageEfficiency.toLowerCase().includes(query) ||
            e.concurrencyProtection.toLowerCase().includes(query) ||
            e.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Event Sourcing & CQRS] ${e.name}`,
              `  Paradigm   : ${e.paradigm} (${e.badge})`,
              `  Replay SLA : ${e.replayEfficiency.split(';')[0]}`,
              `  Anchor     : #architecture-event-sourcing`,
              ''
            )
          }
        })

        // 22. Search Distributed DLQ & Retries
        DLQ_RETRY_MODELS.forEach(d => {
          if (
            d.name.toLowerCase().includes(query) ||
            d.id.toLowerCase().includes(query) ||
            d.paradigm.toLowerCase().includes(query) ||
            d.badge.toLowerCase().includes(query) ||
            d.algorithmFormula.toLowerCase().includes(query) ||
            d.recoveryLatency.toLowerCase().includes(query) ||
            d.poisonPillIsolation.toLowerCase().includes(query) ||
            d.headOfLineBlockingDefense.toLowerCase().includes(query) ||
            d.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[DLQ & Retries] ${d.name}`,
              `  Paradigm   : ${d.paradigm} (${d.badge})`,
              `  Recovery   : ${d.recoveryLatency.split(';')[0]}`,
              `  Anchor     : #architecture-dlq-retry`,
              ''
            )
          }
        })

        // 23. Search Distributed Idempotency & Ingress Committer
        IDEMPOTENCY_MODELS.forEach(i => {
          if (
            i.name.toLowerCase().includes(query) ||
            i.id.toLowerCase().includes(query) ||
            i.paradigm.toLowerCase().includes(query) ||
            i.badge.toLowerCase().includes(query) ||
            i.algorithmFormula.toLowerCase().includes(query) ||
            i.dedupLatency.toLowerCase().includes(query) ||
            i.doubleExecutionDefense.toLowerCase().includes(query) ||
            i.storageModel.toLowerCase().includes(query) ||
            i.architecturalInvariant.toLowerCase().includes(query)
          ) {
            results.push(
              `[Idempotency & CAS] ${i.name}`,
              `  Paradigm   : ${i.paradigm} (${i.badge})`,
              `  Defense    : ${i.doubleExecutionDefense.split(';')[0]}`,
              `  Anchor     : #architecture-idempotency`,
              ''
            )
          }
        })

        // 24. Search Distributed 2PC vs Saga & Invariant Committer
        ATOMIC_COMMIT_PARADIGMS.forEach(a => {
          if (
            a.title.toLowerCase().includes(query) ||
            a.id.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query) ||
            a.tagline.toLowerCase().includes(query) ||
            a.blockingNature.toLowerCase().includes(query) ||
            a.recoveryGuarantee.toLowerCase().includes(query) ||
            a.description.toLowerCase().includes(query) ||
            a.tradeOffSummary.toLowerCase().includes(query)
          ) {
            results.push(
              `[2PC vs Saga Commit] ${a.title}`,
              `  Category   : ${a.category} (${a.blockingNature})`,
              `  Throughput : ${a.throughputTps}`,
              `  Anchor     : #architecture-atomic-commit`,
              ''
            )
          }
        })

        // 25. Search Distributed Dynamic Feature Flags & Canary Splitter
        FEATURE_FLAG_MODELS.forEach(f => {
          if (
            f.name.toLowerCase().includes(query) ||
            f.id.toLowerCase().includes(query) ||
            f.category.toLowerCase().includes(query) ||
            f.badge.toLowerCase().includes(query) ||
            f.algorithmFormula.toLowerCase().includes(query) ||
            f.evaluationLatency.toLowerCase().includes(query) ||
            f.rollbackGuarantee.toLowerCase().includes(query) ||
            f.architecturalInvariant.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query)
          ) {
            results.push(
              `[Feature Flags & Canary] ${f.name}`,
              `  Category   : ${f.category} (${f.badge})`,
              `  Rollback   : ${f.rollbackGuarantee.split(';')[0]}`,
              `  Anchor     : #architecture-feature-flags`,
              ''
            )
          }
        })

        // 26. Search Multi-Tenant Isolation & RLS
        TENANT_ISOLATION_MODELS.forEach(t => {
          if (
            t.name.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.badge.toLowerCase().includes(query) ||
            t.algorithmFormula.toLowerCase().includes(query) ||
            t.isolationLatency.toLowerCase().includes(query) ||
            t.leakPreventionGuarantee.toLowerCase().includes(query) ||
            t.architecturalInvariant.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
          ) {
            results.push(
              `[Multi-Tenant RLS] ${t.name}`,
              `  Category   : ${t.category} (${t.badge})`,
              `  Overhead   : ${t.isolationLatency.split(';')[0]}`,
              `  Anchor     : #architecture-tenant-isolation`,
              ''
            )
          }
        })

        // 27. Search Zero-Trust Service Mesh & Envoy SPIFFE mTLS
        ZERO_TRUST_MESH_MODELS.forEach(z => {
          if (
            z.name.toLowerCase().includes(query) ||
            z.id.toLowerCase().includes(query) ||
            z.category.toLowerCase().includes(query) ||
            z.badge.toLowerCase().includes(query) ||
            z.algorithmFormula.toLowerCase().includes(query) ||
            z.handshakeLatency.toLowerCase().includes(query) ||
            z.identityVerificationSla.toLowerCase().includes(query) ||
            z.architecturalInvariant.toLowerCase().includes(query) ||
            z.description.toLowerCase().includes(query)
          ) {
            results.push(
              `[Zero-Trust Service Mesh] ${z.name}`,
              `  Category   : ${z.category} (${z.badge})`,
              `  Handshake  : ${z.handshakeLatency.split(';')[0]}`,
              `  Anchor     : #architecture-zero-trust-mesh`,
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
