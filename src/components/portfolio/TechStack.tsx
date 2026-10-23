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
  Terminal,
  CheckCircle2,
  Cpu
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Technology {
  name: string
  level: number
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
    color: 'text-green-400',
    border: 'border-green-500/40',
    technologies: [
      { 
        name: 'Java 21 LTS', 
        level: 96, 
        years: '7+ yrs',
        description: 'Virtual threads (Project Loom), records, pattern matching, memory optimization, high concurrency',
        productionUse: 'Engineered core enterprise backends handling 10,000+ RPS with sub-second execution.',
        tags: ['JVM', 'Concurrency', 'Loom', 'OOP']
      },
      { 
        name: 'Spring Boot 3', 
        level: 95, 
        years: '6+ yrs',
        description: 'REST APIs, Spring MVC, Spring Data JPA, Actuator observability, reactive WebFlux',
        productionUse: 'Production foundation for multi-tenant SaaS & 12+ decoupled microservices.',
        tags: ['Microservices', 'REST', 'Actuator']
      },
      { 
        name: 'Spring Security & OAuth2', 
        level: 90, 
        years: '5+ yrs',
        description: 'JWT tokens, OAuth2 authorization code flows, RBAC role permissions, secure password hashing',
        productionUse: 'Hardened identity provider integrations for Google/GitHub sign-on & tenant boundaries.',
        tags: ['JWT', 'OAuth2', 'RBAC', 'Auth']
      },
      { 
        name: 'Hibernate / JPA', 
        level: 92, 
        years: '6+ yrs',
        description: 'Entity lifecycle, complex Criteria queries, N+1 query elimination, second-level Redis caching',
        productionUse: 'Optimized high-volume database queries reducing retrieval latency by 65%.',
        tags: ['ORM', 'SQL Optimization', 'Transactions']
      },
      { 
        name: 'Spring Cloud', 
        level: 88, 
        years: '4+ yrs',
        description: 'Eureka service discovery, Spring Cloud Gateway, Resilience4j circuit breakers, config management',
        productionUse: 'Fault-tolerant distributed service communication with automatic fallback routing.',
        tags: ['Gateway', 'Circuit Breaker', 'Resilience4j']
      },
      { 
        name: 'Node.js & Express', 
        level: 85, 
        years: '5+ yrs',
        description: 'Event-driven I/O, asynchronous processing, WebSocket servers, micro-utilities',
        productionUse: 'Real-time WebSocket event notifications and lightweight webhook listeners.',
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
        level: 90, 
        years: '5+ yrs',
        description: 'EC2, S3, RDS, ECS/Fargate, Lambda serverless, CloudWatch, Route53, IAM least-privilege',
        productionUse: 'Architected multi-region AWS cloud deployments with 99.99% availability.',
        tags: ['EC2', 'RDS', 'S3', 'CloudWatch']
      },
      { 
        name: 'Docker & Containers', 
        level: 94, 
        years: '6+ yrs',
        description: 'Multi-stage Docker builds, minimal alpine images, layer caching, Docker Compose stacks',
        productionUse: 'Containerized all microservices with image size reduction from 800MB to 120MB.',
        tags: ['Containers', 'Compose', 'Optimization']
      },
      { 
        name: 'Kubernetes (K8s)', 
        level: 85, 
        years: '4+ yrs',
        description: 'Deployments, StatefulSets, Services, Ingress, Horizontal Pod Autoscaling (HPA), ConfigMaps',
        productionUse: 'Automated pod autoscaling during peak load traffic spikes without manual intervention.',
        tags: ['K8s', 'Orchestration', 'Autoscaling']
      },
      { 
        name: 'CI/CD & GitHub Actions', 
        level: 92, 
        years: '5+ yrs',
        description: 'Automated test pipelines, security scanning (SonarQube/Trivy), container registry publish, auto-deploy',
        productionUse: 'Cut deployment cycles from 2 days to under 15 minutes with zero-downtime releases.',
        tags: ['DevOps', 'Automation', 'Pipelines']
      },
      { 
        name: 'Terraform (IaC)', 
        level: 80, 
        years: '3+ yrs',
        description: 'Infrastructure as Code, state management, reusable modules for cloud resources',
        productionUse: 'Automated infrastructure provisioning across staging and production environments.',
        tags: ['IaC', 'Cloud Provisioning']
      },
      { 
        name: 'Prometheus & Grafana', 
        level: 86, 
        years: '4+ yrs',
        description: 'JVM metrics, micrometer integration, latency histograms, automated alerting dashboards',
        productionUse: 'Real-time observability of production microservices and proactive incident resolution.',
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
        level: 93, 
        years: '6+ yrs',
        description: 'ACID compliance, B-tree & GIN indexing, JSONB queries, connection pooling (HikariCP), partitioning',
        productionUse: 'Primary transactional database for enterprise multi-tenant SaaS platforms.',
        tags: ['SQL', 'Indexing', 'HikariCP', 'ACID']
      },
      { 
        name: 'Redis', 
        level: 92, 
        years: '5+ yrs',
        description: 'In-memory caching, distributed locks (Redisson), session storage, Pub/Sub channels, cache invalidation',
        productionUse: 'Reduced database load by 70% with sub-5ms cached response times.',
        tags: ['Caching', 'PubSub', 'Distributed Lock']
      },
      { 
        name: 'Apache Kafka', 
        level: 88, 
        years: '4+ yrs',
        description: 'Distributed event streaming, partitioned topics, consumer groups, exactly-once semantics',
        productionUse: 'Event-driven order and notification backbone processing 1M+ messages daily.',
        tags: ['Streaming', 'Event-Driven', 'Consumers']
      },
      { 
        name: 'Oracle DB', 
        level: 85, 
        years: '5+ yrs',
        description: 'PL/SQL stored procedures, execution plans, enterprise clustering, legacy data migrations',
        productionUse: 'Supported critical enterprise financial records and automated schema migrations.',
        tags: ['PL/SQL', 'Enterprise']
      },
      { 
        name: 'Flyway / Liquibase', 
        level: 90, 
        years: '5+ yrs',
        description: 'Version-controlled database schema migrations, repeatable migrations, zero-downtime upgrades',
        productionUse: 'Managed 50+ seamless database schema evolutions across dev and production.',
        tags: ['Migrations', 'Version Control']
      }
    ]
  },
  'Frontend & UI': {
    icon: Layout,
    color: 'text-yellow-400',
    border: 'border-yellow-500/40',
    technologies: [
      { 
        name: 'React 19 & Next.js', 
        level: 93, 
        years: '6+ yrs',
        description: 'Hooks, concurrent features, server components, state management, custom reusable component libraries',
        productionUse: 'Built performant, highly responsive dashboards with instantaneous client-side navigation.',
        tags: ['React', 'SPA', 'Hooks']
      },
      { 
        name: 'TypeScript', 
        level: 92, 
        years: '5+ yrs',
        description: 'Strict type safety, generics, utility types, compile-time contract enforcement with backend APIs',
        productionUse: 'Eliminated runtime undefined bugs across complex frontend state management.',
        tags: ['Type Safety', 'Generics', 'Contracts']
      },
      { 
        name: 'Tailwind CSS 4', 
        level: 95, 
        years: '4+ yrs',
        description: 'Utility-first styling, design system tokens, responsive grid layouts, custom glow animations',
        productionUse: 'Rapid creation of pixel-perfect cyberpunk and corporate design systems.',
        tags: ['CSS', 'Design Systems', 'Responsive']
      },
      { 
        name: 'Framer Motion', 
        level: 88, 
        years: '3+ yrs',
        description: 'Layout animations, staggered entries, spring physics, gesture-driven interactions',
        productionUse: 'Crafted smooth 60fps micro-interactions and interactive portfolio animations.',
        tags: ['Animation', 'Interactivity']
      }
    ]
  },
  'Architecture & Testing': {
    icon: GitMerge,
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    technologies: [
      { 
        name: 'Clean Architecture & DDD', 
        level: 95, 
        years: '6+ yrs',
        description: 'Separation of concerns, domain models, ports & adapters, dependency inversion',
        productionUse: 'Architected maintainable SaaS systems enabling new feature releases without regressions.',
        tags: ['Architecture', 'DDD', 'Maintainability']
      },
      { 
        name: 'Microservices Patterns', 
        level: 92, 
        years: '5+ yrs',
        description: 'API Gateway, CQRS, Saga distributed transactions, Event Sourcing, Circuit Breakers',
        productionUse: 'Decomposed monolithic enterprise codebases into independent, scalable microservices.',
        tags: ['Patterns', 'Saga', 'CQRS']
      },
      { 
        name: 'JUnit 5 & Testcontainers', 
        level: 92, 
        years: '6+ yrs',
        description: 'Unit testing, Mockito, real database integration testing with disposable Docker containers',
        productionUse: 'Achieved 90%+ code coverage with deterministic, zero-flakiness test suites.',
        tags: ['TDD', 'Integration Testing', 'Containers']
      },
      { 
        name: 'REST & OpenAPI / Swagger', 
        level: 96, 
        years: '7+ yrs',
        description: 'Idempotent HTTP verbs, HATEOAS, contract-first API design, Swagger 3 documentation',
        productionUse: 'Documented 150+ REST endpoints with automated client SDK generation.',
        tags: ['API Design', 'OpenAPI', 'Contracts']
      }
    ]
  }
}

export default function TechStack() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Backend & JVM')
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null)
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-green-400 bg-green-950/40 px-3 py-1 rounded-full border border-green-800/50 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ ls -la /skills/ --verbose</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white glow-text tracking-tight font-mono">
          Technical Arsenal & Core Stack
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mt-3 font-mono text-sm md:text-base">
          Proven enterprise technologies mastered through building and scaling production software systems.
        </p>
      </motion.div>

      {/* Controls: Category Selector & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {Object.entries(TECH_DATA).map(([category, data]) => {
            const Icon = data.icon
            const isSelected = selectedCategory === category && !searchQuery
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchQuery('')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-green-500/20 text-green-300 border border-green-400 shadow-md shadow-green-500/10 glow-border'
                    : 'bg-black/40 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-green-400' : 'text-gray-500'}`} />
                <span>{category}</span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skill (e.g. Kafka, Java, Docker)..."
            className="w-full pl-9 pr-4 py-2 bg-[#040e07] border border-green-500/30 text-green-200 text-xs font-mono rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Grid of Skill Cards */}
      <motion.div 
        key={searchQuery ? 'search' : selectedCategory}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredTechs.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={() => setHoveredTech(tech)}
            onHoverEnd={() => setHoveredTech(null)}
            className="group p-5 rounded-xl bg-[#040d07]/90 border border-green-500/20 hover:border-green-400/60 transition-all duration-300 glow-card hover:bg-green-500/[0.03] cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold font-mono text-white group-hover:text-green-300 transition-colors">
                  {tech.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-500">{tech.years}</span>
                  <span className="px-2 py-0.5 rounded bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-mono font-bold">
                    {tech.level}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress value={tech.level} className="mb-3.5 h-1.5" />

              {/* Description */}
              <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4">
                {tech.description}
              </p>
            </div>

            {/* Tags and Production Snippet */}
            <div className="pt-3 border-t border-gray-800/80">
              <div className="flex flex-wrap gap-1.5">
                {tech.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-gray-800 text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Detail Drawer on Hover */}
      {hoveredTech && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-8 p-5 rounded-xl bg-gradient-to-r from-green-950/40 via-black to-cyan-950/40 border border-green-500/40 backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-1 text-green-400 font-mono text-xs">
            <Sparkles className="w-4 h-4" />
            <span>PRODUCTION BENCHMARK & IMPACT</span>
          </div>
          <h4 className="text-xl font-bold font-mono text-white mb-2">{hoveredTech.name}</h4>
          <p className="text-gray-300 font-mono text-sm leading-relaxed">
            {hoveredTech.productionUse}
          </p>
        </motion.div>
      )}
    </div>
  )
}
