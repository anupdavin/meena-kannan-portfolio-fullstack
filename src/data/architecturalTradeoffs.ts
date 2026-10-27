export interface TradeoffCriterion {
  label: string
  scoreA: number // 1 to 5
  scoreB: number
  scoreC?: number
  note: string
}

export interface TradeoffOption {
  name: string
  paradigm: string
  bestFor: string
  avoidWhen: string
  productionMetric: string
  invariant: string
}

export interface ArchitecturalTradeoff {
  id: string
  title: string
  category: 'Distributed Transactions' | 'AI & Context' | 'Concurrency & JVM' | 'Protocols & APIs'
  summary: string
  options: TradeoffOption[]
  criteria: TradeoffCriterion[]
  productionVerdict: string
  caseStudy: string
}

export const ARCHITECTURAL_TRADEOFFS: ArchitecturalTradeoff[] = [
  {
    id: 'distributed-transactions',
    title: 'Choreographed Saga vs Orchestrated Saga vs Two-Phase Commit',
    category: 'Distributed Transactions',
    summary: 'Evaluating consistency models, failure isolation, and operational latency across high-throughput distributed transaction boundaries.',
    options: [
      {
        name: 'Choreographed Saga',
        paradigm: 'Event-Driven (Kafka / Transactional Outbox CDC)',
        bestFor: 'High-throughput microservices with low domain coupling (< 5 participants)',
        avoidWhen: 'Complex transaction graphs with circular dependencies or > 10 services',
        productionMetric: '< 80ms p99 latency, 0 coordinator bottlenecks',
        invariant: 'Idempotency keys enforced on every event consumer; Debezium CDC ensures zero loss'
      },
      {
        name: 'Orchestrated Saga',
        paradigm: 'Centralized State Machine (Temporal / Step Functions)',
        bestFor: 'Complex multi-step business transactions requiring centralized audit trails',
        avoidWhen: 'Ultra-low latency microservices where coordinator RPC hop is unacceptable',
        productionMetric: 'Deterministic state replay, centralized error triage',
        invariant: 'Orchestrator state persistence isolated in partitioned PostgreSQL cluster'
      },
      {
        name: 'Two-Phase Commit (2PC)',
        paradigm: 'XA Distributed Transactions / Coordinator Lock',
        bestFor: 'Legacy monolithic databases where strict ACID serializability is legally mandated',
        avoidWhen: 'Cloud-native multi-region distributed microservices (violates CAP availability)',
        productionMetric: 'High lock contention, > 350ms p99 latency under load',
        invariant: 'Blocking coordinator hold locks until all resource managers vote commit'
      }
    ],
    criteria: [
      { label: 'Throughput & Scalability', scoreA: 5, scoreB: 4, scoreC: 2, note: 'Choreography scales linearly without a central bottleneck' },
      { label: 'Observability & Debugging', scoreA: 3, scoreB: 5, scoreC: 4, note: 'Orchestrators provide direct state machine introspection' },
      { label: 'Partition Fault Tolerance', scoreA: 5, scoreB: 4, scoreC: 1, note: '2PC coordinator crash leaves distributed transactions locked indefinitely' },
      { label: 'Implementation Simplicity', scoreA: 3, scoreB: 4, scoreC: 2, note: 'Choreography requires meticulous event schema governance' }
    ],
    productionVerdict: 'For modern cloud-native checkout and payment processing, Choreographed Saga paired with Debezium Outbox CDC delivers the optimal balance of sub-80ms p99 latency and fault isolation.',
    caseStudy: 'Implemented in Meena Kannan enterprise SaaS payment platform handling $40M+ annual transaction volume.'
  },
  {
    id: 'ai-context-augmentation',
    title: 'Hybrid RAG vs Domain Fine-Tuning vs In-Context Prompt Caching',
    category: 'AI & Context',
    summary: 'Balancing factual grounding, latency overhead, inference GPU cost, and compliance guardrails for enterprise generative AI systems.',
    options: [
      {
        name: 'Hybrid RAG',
        paradigm: 'BM25 Keyword + Dense pgvector + Cohere Rerank',
        bestFor: 'Dynamic, frequently updated enterprise knowledge bases requiring strict provenance citation',
        avoidWhen: 'Tasks requiring fundamental style or format transformation without reference docs',
        productionMetric: '< 180ms chunk retrieval + rerank, zero hallucination on citation',
        invariant: 'Context window isolation with cosine distance threshold filter (similarity >= 0.78)'
      },
      {
        name: 'Domain Fine-Tuning',
        paradigm: 'Weight Adaptation (LoRA / QLoRA / Full Parameters)',
        bestFor: 'Teaching proprietary dialect, code generation syntax, or rigid output schemas',
        avoidWhen: 'Volatile knowledge bases; retraining cost and model drift prevent real-time updates',
        productionMetric: 'Zero retrieval latency hop, high training compute expense',
        invariant: 'Requires curated dataset of > 10,000 verified question-answer pairs'
      },
      {
        name: 'Prompt Caching',
        paradigm: 'Extended Context KV Cache Reuse (Anthropic / DeepSeek)',
        bestFor: 'Large static system instructions, stable API schemas, and repetitive context anchors',
        avoidWhen: 'Dynamic multi-tenant datasets where cache misses incur full latency penalties',
        productionMetric: 'Sub-15ms prompt processing, 90% input token cost reduction',
        invariant: 'Cache prefix must match byte-for-byte; invalidation triggers on schema change'
      }
    ],
    criteria: [
      { label: 'Knowledge Freshness', scoreA: 5, scoreB: 1, scoreC: 4, note: 'RAG updates dynamically on next document ingestion' },
      { label: 'Hallucination Mitigation', scoreA: 5, scoreB: 2, scoreC: 4, note: 'Explicit citation anchors prevent ungrounded generation' },
      { label: 'Inference Latency', scoreA: 3, scoreB: 5, scoreC: 5, note: 'Fine-tuning and prompt caching eliminate retrieval roundtrips' },
      { label: 'Operational Cost Efficiency', scoreA: 4, scoreB: 2, scoreC: 5, note: 'Fine-tuning requires dedicated GPU clusters for continuous training' }
    ],
    productionVerdict: 'Hybrid RAG is mandated for enterprise compliance where answers must reference auditable documents; Prompt Caching is layered to eliminate redundant token costs for static API definitions.',
    caseStudy: 'Engineered into the portfolio conversational assistant and ByteByteGo AI codex grounding 1,500+ daily developer queries.'
  },
  {
    id: 'concurrency-runtime',
    title: 'Java 21 Virtual Threads vs Reactive WebFlux vs OS Platform Threads',
    category: 'Concurrency & JVM',
    summary: 'Analyzing thread scheduling models, stack allocation, debugging ergonomics, and database pool tuning under massive I/O concurrency.',
    options: [
      {
        name: 'Virtual Threads (Loom)',
        paradigm: 'User-Mode Fibers on ForkJoinPool Carrier Threads',
        bestFor: 'High-throughput I/O blocking workloads (HTTP, JDBC, Kafka) with imperative simplicity',
        avoidWhen: 'CPU-intensive cryptographic hashing or image processing with zero I/O wait',
        productionMetric: '10x concurrent connections, < 1KB initial stack per fiber',
        invariant: 'Synchronized blocks replaced with ReentrantLock to prevent thread carrier pinning'
      },
      {
        name: 'Reactive WebFlux',
        paradigm: 'Event Loop Non-Blocking (Project Reactor / Netty)',
        bestFor: 'Streaming continuous push protocols (Server-Sent Events, WebSockets) with backpressure',
        avoidWhen: 'Teams requiring standard imperative debugging and legacy blocking JDBC drivers',
        productionMetric: 'Ultra-low thread count (< 16 OS threads), steep cognitive learning curve',
        invariant: 'Thread hopping breaks standard ThreadLocal logging without Reactor Context propagation'
      },
      {
        name: 'OS Platform Threads',
        paradigm: '1:1 Kernel Thread Model (Tomcat / Jetty Standard)',
        bestFor: 'Simple low-concurrency internal enterprise CRUD apps with predictable load',
        avoidWhen: 'Modern microservices handling > 1,000 concurrent blocking I/O calls per container',
        productionMetric: '1MB stack per thread; thread exhaustion and context switch storm under load',
        invariant: 'Requires strict thread pool ceiling (max-threads=200) to prevent OS OutOfMemoryError'
      }
    ],
    criteria: [
      { label: 'I/O Concurrency Scale', scoreA: 5, scoreB: 5, scoreC: 2, note: 'Virtual threads and Reactive handle 50k+ concurrent sockets' },
      { label: 'Developer Ergonomics & Debugging', scoreA: 5, scoreB: 2, scoreC: 4, note: 'Virtual threads retain natural imperative sequential stack traces' },
      { label: 'Backpressure Control', scoreA: 3, scoreB: 5, scoreC: 2, note: 'Reactive Streams enforce native pull-push flow control' },
      { label: 'Ecosystem Compatibility', scoreA: 5, scoreB: 3, scoreC: 5, note: 'Virtual threads work transparently with standard blocking libraries' }
    ],
    productionVerdict: 'Java 21 Virtual Threads obsolete reactive complexity for standard I/O microservices by offering 10x concurrency while preserving readable sequential debugging and seamless OpenTelemetry tracing.',
    caseStudy: 'Modernized enterprise payment gateway backend, reducing p99 latency by 45% during peak 5,000 req/sec flash sales.'
  },
  {
    id: 'service-protocols',
    title: 'gRPC Protobuf vs REST OpenAPI vs Model Context Protocol (MCP)',
    category: 'Protocols & APIs',
    summary: 'Comparing serialization formats, transport efficiency, schema rigidity, and autonomous tool integration across modern distributed topologies.',
    options: [
      {
        name: 'gRPC (Protobuf)',
        paradigm: 'Binary Serialization over HTTP/2 Multiplexing',
        bestFor: 'East-west high-throughput internal microservice communication and streaming telemetry',
        avoidWhen: 'Direct public web client consumption without Envoy gRPC-Web proxy bridging',
        productionMetric: 'Sub-5ms internal RPC latency, 60% bandwidth reduction vs JSON',
        invariant: 'Strict protocol buffer versioning with backward-compatible field tag numbers'
      },
      {
        name: 'REST / OpenAPI',
        paradigm: 'Human-Readable JSON over HTTP/1.1 & HTTP/2',
        bestFor: 'North-south public ingress APIs, third-party partner integrations, and browser clients',
        avoidWhen: 'High-frequency internal chatter where JSON parsing and header overhead degrade latency',
        productionMetric: 'Universal HTTP caching, self-describing OpenAPI schemas',
        invariant: 'HTTP status codes conform to RFC standards with idempotent PUT/DELETE semantics'
      },
      {
        name: 'Model Context Protocol (MCP)',
        paradigm: 'JSON-RPC 2.0 over Stdio / Server-Sent Events (SSE)',
        bestFor: 'Sandboxed agentic AI tool declaration, file discovery, and dynamic capability negotiation',
        avoidWhen: 'Standard high-volume database reads or synchronous microservice RPC pipelines',
        productionMetric: '< 8ms handshake discovery, zero ambient authority security',
        invariant: 'Stateless tool declaration contracts evaluated under strict authorization tokens'
      }
    ],
    criteria: [
      { label: 'Wire Efficiency & Latency', scoreA: 5, scoreB: 3, scoreC: 3, note: 'Protobuf binary encoding outclasses text-based JSON' },
      { label: 'Tooling & Developer Adoption', scoreA: 4, scoreB: 5, scoreC: 3, note: 'REST is globally supported by every web client and browser' },
      { label: 'Agentic AI Specialization', scoreA: 2, scoreB: 2, scoreC: 5, note: 'MCP is explicitly engineered for LLM tool binding and reflection' },
      { label: 'Streaming & Multiplexing', scoreA: 5, scoreB: 3, scoreC: 4, note: 'HTTP/2 bidirectional streaming enables real-time duplex channels' }
    ],
    productionVerdict: 'gRPC dominates internal high-density service communication; REST remains standard for client ingress; Model Context Protocol (MCP) serves as the dedicated contract uniting autonomous agents with enterprise infrastructure.',
    caseStudy: 'Architected in multi-tier enterprise systems powering real-time microservices alongside autonomous AI agent sandboxes.'
  }
]
