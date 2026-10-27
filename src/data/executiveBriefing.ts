export interface ExecutiveBriefingData {
  candidateName: string
  targetRole: string
  experienceYears: string
  location: string
  coreValueProposition: string
  pillars: {
    title: string
    technologies: string
    description: string
    invariant: string
  }[]
  verifiedOutcomes: {
    metric: string
    before: string
    after: string
    impact: string
  }[]
  governingAdrs: {
    id: string
    title: string
    impact: string
  }[]
  engagementModels: {
    roleTitle: string
    scope: string
    availability: string
  }[]
  contact: {
    email: string
    linkedin: string
    github: string
    resumeUrl: string
  }
}

export const EXECUTIVE_BRIEFING: ExecutiveBriefingData = {
  candidateName: 'Meena Kannan',
  targetRole: 'Lead Full-Stack & Principal Cloud Solutions Architect',
  experienceYears: '8+ Years Production Scale',
  location: 'Singapore (Open to Global Remote / Strategic Advisory)',
  coreValueProposition: 'Senior engineering leader and systems architect specializing in high-throughput distributed microservices, multi-tenant enterprise SaaS, and resilient cloud systems with Java 21 LTS, Spring Boot 3, and AWS. Proven track record eliminating architectural bottlenecks: cutting P99 latency by 84%, reducing AWS compute costs by 68%, and architecting enterprise-grade Agentic AI & Model Context Protocol (MCP) infrastructure.',
  pillars: [
    {
      title: 'High-Throughput Microservices & Event-Driven Architecture',
      technologies: 'Java 21 LTS, Spring Boot 3, Apache Kafka, Debezium CDC, Redis Cluster, AWS EKS',
      description: 'Architecting asynchronous choreographed sagas, transactional outbox patterns, and idempotent consumers handling 15,000+ peak transactions per second with zero distributed lock contention.',
      invariant: 'Eventual consistency guaranteed in <180ms without distributed 2PC row deadlocks'
    },
    {
      title: 'Multi-Tenant Cloud Security & Zero-Trust Governance',
      technologies: 'PostgreSQL 16 (RLS), AWS KMS, Spring Security, PgBouncer, Docker, Terraform',
      description: 'Designing kernel-enforced multi-tenant isolation via PostgreSQL Row-Level Security, FIPS 140-3 HSM envelope encryption, and append-only ledgers passing PCI-DSS Tier 1 and SOC-2 compliance.',
      invariant: '100% cryptographic tenant isolation with zero cross-tenant query leaks'
    },
    {
      title: 'Modern Agentic AI & Model Context Protocol (MCP) Mesh',
      technologies: 'Anthropic MCP Standard, Java 21 Spring AI, LangGraph, Python 3.12, pgvector HNSW',
      description: 'Building decoupled autonomous agent infrastructure: LangGraph ReAct DAG state checkpointing, sub-15ms semantic tool discovery via pgvector, and disposable Docker sandboxes with 512MB cgroups limits.',
      invariant: '76% context token reduction and 100% container sandbox isolation'
    }
  ],
  verifiedOutcomes: [
    {
      metric: 'B2B SaaS P99 Query Latency',
      before: '480ms',
      after: '78ms',
      impact: '-84% faster response time under 2,500 req/s load'
    },
    {
      metric: 'RDS Host Compute Spend',
      before: '$12,000/mo',
      after: '$3,840/mo',
      impact: '-68% monthly cost reduction via PgBouncer connection multiplexing'
    },
    {
      metric: 'WebSocket Concurrency Scale',
      before: '8,000 conns',
      after: '50,000+ conns',
      impact: '6.25x capacity expansion at -72% JVM heap via Java 21 Virtual Threads'
    },
    {
      metric: 'FinTech Double-Spend Defect Rate',
      before: '0.35% error rate',
      after: '0.00% zero defects',
      impact: 'Zero double-spend anomalies across $10M+ daily settlement volume'
    }
  ],
  governingAdrs: [
    { id: 'ADR-001', title: 'Row-Level Security Multi-Tenancy vs Database-per-Tenant', impact: '-68% RDS spend, 78ms P99' },
    { id: 'ADR-002', title: 'Choreographed Saga & Transactional Outbox vs 2PC', impact: '15,000+ sustained TPS, 0 deadlocks' },
    { id: 'ADR-003', title: 'Java 21 Virtual Threads vs Reactive WebFlux', impact: '50k+ WebSockets, -72% JVM heap' },
    { id: 'ADR-004', title: 'Cryptographic Double-Entry Ledger vs Mutable Balances', impact: '0.00% double-spend defects' },
    { id: 'ADR-005', title: 'Zero-Trust Envoy mTLS Mesh vs Ambient Perimeter', impact: '100% mutual workload verification' },
    { id: 'ADR-006', title: 'Decoupled Model Context Protocol (MCP) Mesh vs Hardcoded Tools', impact: '-76% token spend, 100% sandboxed' }
  ],
  engagementModels: [
    {
      roleTitle: 'Principal Cloud & Systems Solutions Architect',
      scope: 'Full-time enterprise leadership across distributed architecture, cloud modernization, and engineering squad scaling.',
      availability: 'Available for Enterprise Roles'
    },
    {
      roleTitle: 'Distributed Systems & Microservices Modernization Lead',
      scope: 'Decomposing legacy monoliths into high-throughput Kafka event-driven architectures with zero downtime.',
      availability: 'Direct Squad Leadership'
    },
    {
      roleTitle: 'Fractional Chief Architect / AI & Cloud Systems Advisory',
      scope: 'Strategic guidance on Model Context Protocol, vector retrieval systems, and cost optimization.',
      availability: 'Advisory Engagements'
    }
  ],
  contact: {
    email: 'meenakannan.architect@gmail.com',
    linkedin: 'https://linkedin.com/in/meena-kannan',
    github: 'https://github.com/meenak95',
    resumeUrl: '/Meena_Kannan_Senior_Architect_Resume.pdf'
  }
}
