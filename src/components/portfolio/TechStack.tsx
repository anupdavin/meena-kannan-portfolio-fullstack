import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Cloud, 
  Database, 
  Layout, 
  GitMerge, 
  Search, 
  Sparkles, 
  Terminal
} from 'lucide-react'

interface Technology {
  name: string
  tier: 'Principal Mastery' | 'Enterprise Production' | 'System Architecture'
  productionScale: string
  years: string
  description: string
  productionUse: string
  tags: string[]
}

interface CategoryData {
  icon: any
  color: string
  border: string
  technologies: Technology[]
}

const TECH_DATA: Record<string, CategoryData> = {
  'Backend & JVM': {
    icon: Server,
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    technologies: [
      { 
        name: 'Java 21 LTS', 
        tier: 'Principal Mastery',
        productionScale: '10,000+ RPS / Virtual Threads',
        years: '7+ yrs',
        description: 'Virtual threads (Loom), records, sealed classes, pattern matching, memory footprint optimization',
        productionUse: 'Engineered core enterprise backends handling 10,000+ RPS with sub-80ms P99 execution.',
        tags: ['JVM', 'Concurrency', 'Loom', 'OOP']
      },
      { 
        name: 'Spring Boot 3', 
        tier: 'Principal Mastery',
        productionScale: 'Autonomous Microservices',
        years: '6+ yrs',
        description: 'REST APIs, Spring MVC, Spring Data JPA, Actuator observability, native image compilation',
        productionUse: 'Standardized microservices architecture with Clean Architecture boundaries across 3 squads.',
        tags: ['Microservices', 'REST', 'Actuator']
      },
      { 
        name: 'Spring Security & OAuth2', 
        tier: 'Enterprise Production',
        productionScale: 'Stateless JWT / RBAC',
        years: '5+ yrs',
        description: 'JWT validation filters, OAuth2 authorization code flows, RBAC role hierarchies, secure credential handling',
        productionUse: 'Enforced tenant-scoped security filters with zero cross-tenant leakage across 1,200+ tenants.',
        tags: ['JWT', 'OAuth2', 'RBAC', 'Auth']
      },
      { 
        name: 'Hibernate / JPA', 
        tier: 'Enterprise Production',
        productionScale: 'Zero N+1 / L2 Cache',
        years: '6+ yrs',
        description: 'Entity lifecycle management, batch query fetching to eliminate N+1 overhead, Redis L2 caching',
        productionUse: 'Optimized relational query plans, cutting P99 latency from 480ms to 78ms.',
        tags: ['ORM', 'SQL Optimization', 'Transactions']
      },
      { 
        name: 'Spring Cloud', 
        tier: 'System Architecture',
        productionScale: 'Resilience4j / Gateway',
        years: '4+ yrs',
        description: 'Spring Cloud Gateway, Resilience4j circuit breakers, client-side load balancing, distributed tracing',
        productionUse: 'Prevented cascading node outages under high load via bulkhead isolation and automatic fallbacks.',
        tags: ['Gateway', 'Circuit Breaker', 'Resilience4j']
      },
      { 
        name: 'Node.js & Express', 
        tier: 'Enterprise Production',
        productionScale: 'WebSocket Streaming',
        years: '5+ yrs',
        description: 'Non-blocking event loop, WebSocket servers, lightweight asynchronous event ingestion',
        productionUse: 'Built high-concurrency WebSocket channels supporting 50,000+ concurrent connections.',
        tags: ['JavaScript', 'WebSockets', 'Async']
      }
    ]
  },
  'Cloud & DevOps': {
    icon: Cloud,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    technologies: [
      { 
        name: 'AWS Cloud Services', 
        tier: 'Principal Mastery',
        productionScale: 'Multi-AZ 99.99% SLA',
        years: '5+ yrs',
        description: 'EKS, RDS Multi-AZ, S3, ECS Fargate Graviton, KMS encryption, Route53, IAM least privilege',
        productionUse: 'Architected multi-AZ AWS cloud deployments maintaining 99.99% availability.',
        tags: ['EC2', 'RDS', 'S3', 'CloudWatch']
      },
      { 
        name: 'Docker & Containers', 
        tier: 'Principal Mastery',
        productionScale: '800MB -> 120MB Optimized',
        years: '6+ yrs',
        description: 'Multi-stage Docker builds, Alpine minimal runtimes, layer caching, secure non-root containers',
        productionUse: 'Containerized all microservices with image size reduction from 800MB to 120MB.',
        tags: ['Containers', 'Compose', 'Optimization']
      },
      { 
        name: 'Kubernetes (K8s)', 
        tier: 'System Architecture',
        productionScale: 'Karpenter Autoscaling',
        years: '4+ yrs',
        description: 'Deployments, StatefulSets, Ingress controllers, Horizontal Pod Autoscaling (HPA), Karpenter spot bin-packing',
        productionUse: 'Automated pod autoscaling during 15,000 TPS traffic spikes with Karpenter node bin-packing.',
        tags: ['K8s', 'Orchestration', 'Autoscaling']
      },
      { 
        name: 'CI/CD & GitHub Actions', 
        tier: 'Enterprise Production',
        productionScale: '48h -> 15min Deploy Cycle',
        years: '5+ yrs',
        description: 'Automated test matrices, SonarQube quality gates, Trivy container scans, zero-downtime rollouts',
        productionUse: 'Accelerated release turnaround from 48 hours to under 15 minutes with automated rollback safety.',
        tags: ['DevOps', 'Automation', 'Pipelines']
      },
      { 
        name: 'Terraform (IaC)', 
        tier: 'Enterprise Production',
        productionScale: 'Multi-Environment IaC',
        years: '3+ yrs',
        description: 'Declarative cloud provisioning, remote S3 state locking with DynamoDB, reusable environment modules',
        productionUse: 'Automated multi-region infrastructure provisioning with repeatable staging and production parity.',
        tags: ['IaC', 'Cloud Provisioning']
      },
      { 
        name: 'Prometheus & Grafana', 
        tier: 'Enterprise Production',
        productionScale: '45m -> 4m Incident MTTD',
        years: '4+ yrs',
        description: 'JVM Micrometer metrics, P99 latency histograms, alertmanager routing, custom Grafana dashboards',
        productionUse: 'Established proactive alerting that reduced Mean Time to Detect (MTTD) from 45 minutes to 4 minutes.',
        tags: ['Monitoring', 'Observability', 'Metrics']
      }
    ]
  },
  'Databases & Streams': {
    icon: Database,
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    technologies: [
      { 
        name: 'PostgreSQL', 
        tier: 'Principal Mastery',
        productionScale: 'Row-Level Security / ACID',
        years: '6+ yrs',
        description: 'Row-Level Security (RLS), partial B-tree and GIN indexing, JSONB queries, PgBouncer transaction pooling',
        productionUse: 'Primary ACID datastore supporting 25M+ rows with composite indexes and tenant isolation.',
        tags: ['SQL', 'Indexing', 'HikariCP', 'ACID']
      },
      { 
        name: 'Redis', 
        tier: 'Principal Mastery',
        productionScale: 'Redisson Leases / < 1ms Read',
        years: '5+ yrs',
        description: 'In-memory caching, Redisson distributed locks, session storage, Pub/Sub clustered backplanes',
        productionUse: 'Eliminated 70% of database read queries and enforced distributed checkout mutexes.',
        tags: ['Caching', 'PubSub', 'Distributed Lock']
      },
      { 
        name: 'Apache Kafka', 
        tier: 'System Architecture',
        productionScale: '15k+ TPS / KRaft Cluster',
        years: '4+ yrs',
        description: 'Partitioned event streaming, consumer groups, idempotent producers, Transactional Outbox integration',
        productionUse: 'Decoupled checkout from fulfillment with Debezium CDC and idempotent consumer groups.',
        tags: ['Streaming', 'Event-Driven', 'Consumers']
      },
      { 
        name: 'Oracle DB', 
        tier: 'Enterprise Production',
        productionScale: '25M+ Financial Records',
        years: '5+ yrs',
        description: 'PL/SQL stored procedures, execution plan analysis, enterprise clustering, data partitioning',
        productionUse: 'Maintained high-volume enterprise financial ledgers with zero-data-loss replication.',
        tags: ['PL/SQL', 'Enterprise']
      },
      { 
        name: 'Flyway / Liquibase', 
        tier: 'Enterprise Production',
        productionScale: '50+ Zero-Downtime Migrations',
        years: '5+ yrs',
        description: 'Version-controlled database schema migrations, repeatable scripts, blue/green schema evolution',
        productionUse: 'Executed 50+ zero-downtime database schema evolutions across multi-tenant environments.',
        tags: ['Migrations', 'Version Control']
      }
    ]
  },
  'Frontend & UI': {
    icon: Layout,
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    technologies: [
      { 
        name: 'React 19 & Next.js', 
        tier: 'Principal Mastery',
        productionScale: 'Optimistic UI / Concurrent Mode',
        years: '6+ yrs',
        description: 'Server components, concurrent transitions, optimistic mutations, modular component architecture',
        productionUse: 'Engineered responsive financial portals with sub-20ms optimistic state reconciliation.',
        tags: ['React', 'SPA', 'Hooks']
      },
      { 
        name: 'TypeScript', 
        tier: 'Principal Mastery',
        productionScale: '100% Strict Type Safety',
        years: '5+ yrs',
        description: 'Strict type checking, discriminated unions, generic utility types, compile-time API contracts',
        productionUse: 'Enforced end-to-end type safety between backend DTOs and client presentation layers.',
        tags: ['Type Safety', 'Generics', 'Contracts']
      },
      { 
        name: 'Tailwind CSS 4', 
        tier: 'Principal Mastery',
        productionScale: 'Swiss Technical Editorial',
        years: '4+ yrs',
        description: 'Design system tokens, responsive grid layouts, high-contrast accessible typography',
        productionUse: 'Engineered high-density technical editorial interfaces with strict contrast standards.',
        tags: ['CSS', 'Design Systems', 'Responsive']
      },
      { 
        name: 'Framer Motion', 
        tier: 'Enterprise Production',
        productionScale: '60 FPS Micro-Interactions',
        years: '3+ yrs',
        description: 'Hardware-accelerated layout transitions, spring physics, orchestrated packet flow animations',
        productionUse: 'Created 60 FPS architectural workbench visualizations with smooth SVG packet flows.',
        tags: ['Animation', 'Interactivity']
      }
    ]
  },
  'Architecture & Patterns': {
    icon: GitMerge,
    color: 'text-teal-400',
    border: 'border-teal-500/40',
    technologies: [
      { 
        name: 'Clean Architecture & DDD', 
        tier: 'Principal Mastery',
        productionScale: 'Zero-Framework Domain Core',
        years: '6+ yrs',
        description: 'Bounded contexts, aggregate roots, ports and adapters, domain event dispatchers',
        productionUse: 'Isolated core business rules from infrastructure dependencies, enabling safe framework upgrades.',
        tags: ['Architecture', 'DDD', 'Maintainability']
      },
      { 
        name: 'Microservices Patterns', 
        tier: 'System Architecture',
        productionScale: 'Saga / CQRS / Outbox Pattern',
        years: '5+ yrs',
        description: 'Choreographed Sagas, Transactional Outbox, CQRS read models, circuit breakers, dead-letter queues',
        productionUse: 'Decomposed monolithic legacy codebases into autonomous, resilient microservices.',
        tags: ['Patterns', 'Saga', 'CQRS']
      },
      { 
        name: 'JUnit 5 & Testcontainers', 
        tier: 'Enterprise Production',
        productionScale: '90%+ Integration Coverage',
        years: '6+ yrs',
        description: 'Unit testing, Mockito, real database and Kafka integration testing using disposable Docker containers',
        productionUse: 'Ensured deterministic test suites that reduced defect escape rate from 16% to under 4%.',
        tags: ['TDD', 'Integration Testing', 'Containers']
      },
      { 
        name: 'REST & OpenAPI / Swagger', 
        tier: 'Principal Mastery',
        productionScale: '150+ Contract Endpoints',
        years: '7+ yrs',
        description: 'Contract-first API design, idempotent HTTP semantics, OpenAPI 3 specifications, SDK generation',
        productionUse: 'Authored 150+ standardized enterprise endpoints with automated schema verification.',
        tags: ['API Design', 'OpenAPI', 'Contracts']
      }
    ]
  }
}

export default function TechStack() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Backend & JVM')
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null)
  const [activeTech, setActiveTech] = useState<Technology | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter technologies based on search query or category
  const filteredTechs = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const all: Technology[] = []
      Object.values(TECH_DATA).forEach(cat => {
        cat.technologies.forEach(t => {
          if (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some(tag => tag.toLowerCase().includes(q))
          ) {
            all.push(t)
          }
        })
      })
      return all
    }
    return TECH_DATA[selectedCategory].technologies
  }, [searchQuery, selectedCategory])

  const currentBenchmarkTech = hoveredTech || activeTech || filteredTechs[0]

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
          <span>PRODUCTION COMPETENCIES & BENCHMARKS</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-editorial">
          Technical Arsenal & Core Stack
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
          Proven enterprise technologies mastered through building, deploying, and scaling distributed production systems.
        </p>
      </motion.div>

      {/* Controls: Horizontal Scroll Category Selector & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1.5 w-full md:w-auto shrink-0 touch-scroll px-1">
          {Object.entries(TECH_DATA).map(([category, data]) => {
            const Icon = data.icon
            const isSelected = selectedCategory === category && !searchQuery
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchQuery('')
                  setActiveTech(null)
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs md:text-sm font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>{category}</span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setActiveTech(null)
            }}
            placeholder="Search skill (e.g. Kafka, Java)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 text-slate-200 text-base md:text-xs font-mono rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Grid of Skill Cards */}
      <motion.div 
        key={searchQuery ? 'search' : selectedCategory}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5"
      >
        {filteredTechs.map((tech, index) => {
          const isSelected = activeTech?.name === tech.name
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setActiveTech(isSelected ? null : tech)}
              onHoverStart={() => setHoveredTech(tech)}
              onHoverEnd={() => setHoveredTech(null)}
              className={`group p-4 sm:p-5 rounded-2xl bg-[#090e18]/90 border transition-all duration-300 specular-card cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15' 
                  : 'border-slate-800/90 hover:border-emerald-500/50'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`text-base font-bold font-editorial transition-colors ${
                      isSelected ? 'text-emerald-300' : 'text-white group-hover:text-emerald-300'
                    }`}>
                      {tech.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">{tech.years} in enterprise</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                    {tech.tier}
                  </span>
                </div>

                {/* Production Scale Badge Strip (Replaces arbitrary percentage bar) */}
                <div className="my-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Scale Metric:</span>
                  <span className="text-emerald-400 font-bold text-xs truncate">{tech.productionScale}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-3 sm:mb-4">
                  {tech.description}
                </p>

                {/* Mobile expanded production benchmark inside card */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="sm:hidden mb-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[11px] font-sans text-slate-200"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 text-[10px] font-mono">
                      <Sparkles className="w-3 h-3" />
                      <span>PRODUCTION BENCHMARK:</span>
                    </div>
                    {tech.productionUse}
                  </motion.div>
                )}
              </div>

              {/* Tags and Production Snippet */}
              <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {tech.tags.map(tag => (
                    <span key={tag} className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="sm:hidden text-[9px] text-emerald-400 font-mono">
                  {isSelected ? '▲ close' : '▼ impact'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Interactive Detail Drawer on Desktop/Tablet */}
      {currentBenchmarkTech && (
        <motion.div 
          key={currentBenchmarkTech.name}
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="hidden sm:block mt-8 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0a1220] to-slate-900 border border-slate-800 backdrop-blur-md shadow-2xl specular-card"
        >
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-mono text-xs">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold">PRODUCTION BENCHMARK & ARCHITECTURAL IMPACT</span>
          </div>
          <h4 className="text-xl font-bold font-editorial text-white mb-2">{currentBenchmarkTech.name}</h4>
          <p className="text-slate-300 font-sans text-sm leading-relaxed">
            {currentBenchmarkTech.productionUse}
          </p>
        </motion.div>
      )}
    </div>
  )
}
