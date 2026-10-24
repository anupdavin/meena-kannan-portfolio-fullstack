import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  ExternalLink, 
  Terminal, 
  Layers, 
  Shield, 
  Zap, 
  X, 
  Copy, 
  Check, 
  CheckCircle2,
  TrendingUp, 
  Activity,
  Code2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  category: 'Enterprise SaaS' | 'Microservices' | 'FinTech' | 'Real-Time' | 'Cloud Infra'
  tagline: string
  description: string
  clientType: string
  tech: string[]
  metrics: Record<string, string>
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
  image: string
}

const PROJECTS: Project[] = [
  {
    id: 'saas-platform',
    title: 'Meena Kannan Enterprise SaaS Platform',
    category: 'Enterprise SaaS',
    tagline: 'Multi-Tenant Portfolio & Project Management SaaS with Clean Architecture',
    description: 'Production-ready SaaS application featuring role-based multi-tenancy, JWT/OAuth2 security, automated audit logging, and Spring Boot 3 Clean Architecture.',
    clientType: 'For Enterprise B2B SaaS & Portfolio Operations',
    tech: ['Java 21', 'Spring Boot 3', 'React 19', 'PostgreSQL', 'Redis', 'Docker', 'Flyway'],
    metrics: {
      'Availability': '99.99%',
      'API Response': '< 80ms',
      'Tenancy Isolation': '100% RBAC',
      'Audit Coverage': '100%'
    },
    problemsSolved: [
      'Monolithic code coupling resolved via Clean Architecture & Domain-Driven Design (DDD)',
      'Slow database schema migrations automated via Flyway repeatable migration scripts',
      'Cross-tenant data leakage prevented with tenant-scoped JPA filters and Spring Security RBAC',
      'High database load mitigated with multi-tiered Redis caching'
    ],
    details: {
      challenge: 'Building a scalable multi-tenant SaaS architecture where each tenant requires strict isolation, real-time analytics, automated audit logging, and zero-downtime schema evolution.',
      solution: 'Implemented Clean Architecture separating presentation, application, domain, and infrastructure layers. Configured Spring Security with stateless JWT + OAuth2 (Google/GitHub), Redis caching, and Docker containerization.',
      architecture: 'Presentation (React 19 SPA) -> Spring Cloud Gateway -> Core Application Service -> Domain Aggregates -> PostgreSQL + Redis + Flyway.',
      impact: 'Delivered 99.99% uptime, reduced API response latency to sub-80ms, achieved 100% audit compliance for enterprise customers.'
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
    codeLanguage: 'Java 21',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'ecommerce-engine',
    title: 'Distributed Cloud E-Commerce Engine',
    category: 'Microservices',
    tagline: 'High-Throughput Event-Driven Microservices Processing 10K+ RPS',
    description: 'Resilient microservices platform decomposed from a legacy monolith into 12 domain services communicating via Apache Kafka event streaming.',
    clientType: 'For High-Volume Retail & Global Supply Chain',
    tech: ['Spring Boot 3', 'Apache Kafka', 'Redis Cluster', 'Docker', 'Kubernetes', 'AWS RDS'],
    metrics: {
      'Throughput': '10,000+ RPS',
      'Uptime SLA': '99.99%',
      'Cost Reduction': '40%',
      'P99 Latency': '< 140ms'
    },
    problemsSolved: [
      'Eliminated single-point-of-failure outages during peak traffic flash sales',
      'Prevented inventory overselling through distributed Redis locks and Kafka transactional messaging',
      'Reduced deployment downtime from 4 hours to instantaneous blue-green deployments',
      'Trimmed cloud computing costs by 40% using container autoscaling'
    ],
    details: {
      challenge: 'A legacy retail monolith frequently crashed under flash-sale spikes of 10,000 RPS, suffered database deadlocks, and required hours of maintenance windows for releases.',
      solution: 'Re-architected the system into 12 autonomous microservices with Apache Kafka for asynchronous order/payment/inventory events, Redis distributed locks for inventory, and Kubernetes HPA for autoscaling.',
      architecture: 'Ingress -> Spring Cloud Gateway -> Order Service -> Kafka Event Bus (Topics: order.created, payment.processed) -> Inventory & Shipping Consumers.',
      impact: 'Achieved 99.99% uptime, handled over 500,000 daily orders without loss, and cut monthly cloud infrastructure spend by 40%.'
    },
    codeSnippet: `@Service
@RequiredArgsConstructor
public class OrderEventProducer {
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;
    private final RedissonClient redissonClient;

    @Transactional
    public OrderResponse processOrder(OrderRequest request) {
        RLock lock = redissonClient.getLock("inventory:" + request.getProductId());
        try {
            if (lock.tryLock(3, 10, TimeUnit.SECONDS)) {
                Order order = orderRepository.save(Order.create(request));
                kafkaTemplate.send("orders.placed", order.getId().toString(), 
                    new OrderPlacedEvent(order));
                return OrderResponse.success(order.getId());
            }
            throw new InventoryLockedException("High demand lock in progress");
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }
}`,
    codeLanguage: 'Java 21 / Kafka',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'realtime-platform',
    title: 'High-Throughput Real-Time Task & Collaboration Platform',
    category: 'Real-Time',
    tagline: 'Sub-20ms WebSocket Event Stream for 50K+ Concurrent Users',
    description: 'Real-time collaborative task orchestration platform with live collaborative editing, WebSocket streaming, Redis Pub/Sub, and React 19 optimistic updates.',
    clientType: 'For Remote Teams & Operational Coordination',
    tech: ['React 19', 'TypeScript', 'Node.js', 'Spring Cloud', 'WebSocket', 'Redis Pub/Sub'],
    metrics: {
      'Concurrent Users': '50,000+',
      'Sync Latency': '< 20ms',
      'User Retention': '+95%',
      'Throughput': '1M+ msgs/min'
    },
    problemsSolved: [
      'Eliminated costly HTTP polling with bi-directional WebSocket channels',
      'Resolved simultaneous document edits with optimistic concurrency and operational transform',
      'Ensured resilient failover with Redis Pub/Sub clustered message brokers'
    ],
    details: {
      challenge: 'Distributed enterprise teams experienced out-of-sync project boards, laggy updates, and database bottlenecks due to constant 5-second polling intervals.',
      solution: 'Engineered a WebSocket connection mesh powered by Redis Pub/Sub backplane, supporting 50,000+ persistent connections with sub-20ms real-time state broadcasts.',
      architecture: 'Client (React 19 WebSocket Hook) <-> Nginx Load Balancer <-> Node/Spring WebSocket Cluster <-> Redis Pub/Sub Mesh <-> PostgreSQL State Store.',
      impact: 'Increased user engagement by 95%, reduced server network overhead by 80%, and achieved sub-20ms sync across global timezones.'
    },
    codeSnippet: `// WebSocket connection hook with exponential backoff & heartbeat
export function useRealtimeSubscription<T>(channel: string, onMessage: (data: T) => void) {
  useEffect(() => {
    const ws = new WebSocket(\`\${WS_ENDPOINT}/stream/\${channel}\`);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onMessage(payload);
      } catch (err) {
        console.error("Payload decode error:", err);
      }
    };
    return () => ws.close();
  }, [channel]);
}`,
    codeLanguage: 'TypeScript / React 19',
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'fintech-gateway',
    title: 'FinTech Transaction & Compliance Audit Gateway',
    category: 'FinTech',
    tagline: 'PCI-DSS Compliant Payment & Cryptographic Audit Trail System',
    description: 'High-security financial transaction engine handling $10M+ daily payment volume with zero double-spend anomalies, tokenization, and immutable audit logs.',
    clientType: 'For BFSI, Payment Gateways & Banking Systems',
    tech: ['Java 21', 'Spring Security', 'PostgreSQL', 'Redis', 'Docker', 'AWS KMS'],
    metrics: {
      'Daily Volume': '$10M+',
      'Double-Spend': '0.00%',
      'Compliance': 'PCI-DSS Tier 1',
      'Reconciliation': '99.999%'
    },
    problemsSolved: [
      'Eliminated duplicate charges with cryptographic idempotent tokens and distributed leases',
      'Met strict banking compliance with tamper-evident cryptographic audit logs',
      'Accelerated end-of-day bank reconciliation from 6 hours to under 10 minutes'
    ],
    details: {
      challenge: 'Handling multi-million dollar payment transactions with strict regulatory compliance, zero downtime tolerance, and guaranteed idempotent execution.',
      solution: 'Architected an idempotent payment execution pipeline with multi-layer token validation, AWS KMS envelope encryption, automated fraud risk scoring, and distributed reconciliation.',
      architecture: 'Payment Request -> API Gateway (TLS 1.3) -> Idempotency Filter -> Fraud Check Engine -> Core Gateway (AWS KMS) -> Bank Partner Settlement -> Cryptographic Audit Logger.',
      impact: 'Processed over $10M in daily volume without a single security failure, reduced reconciliation time by 90%, and passed PCI-DSS audits with zero findings.'
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
    githubUrl: 'https://github.com/meenak95/meena-kannan-portfolio-fullstack',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80'
  }
]

export default function ProjectsShowcase() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null)
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

  const categories = ['All', 'Enterprise SaaS', 'Microservices', 'Real-Time', 'FinTech']

  const filteredProjects = selectedFilter === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === selectedFilter)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
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
        <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-800/50 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ ./showcase --production-systems --featured</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white glow-text tracking-tight font-mono">
          Featured Enterprise Architecture Projects
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-mono text-xs sm:text-sm md:text-base">
          Real-world cloud-native applications, high-concurrency microservices, and enterprise full-stack SaaS solutions.
        </p>
      </motion.div>

      {/* Filter Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center sm:justify-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 sm:mb-12 w-full touch-scroll px-1">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedFilter(category)}
            className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs md:text-sm font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              selectedFilter === category
                ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20 glow-border'
                : 'bg-black/50 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
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
            className="group rounded-2xl bg-[#040e07]/90 border border-green-500/25 hover:border-green-400/60 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Project Visual Banner */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-900 border-b border-green-500/20">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040e07] via-transparent to-black/40" />
                
                {/* Top Badges */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2">
                  <Badge variant="cyan">{project.category}</Badge>
                </div>

                <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-[11px] sm:text-xs font-mono text-gray-300">
                  <span className="text-green-400 font-semibold truncate">{project.clientType}</span>
                </div>
              </div>

              {/* Project Body */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-white group-hover:text-green-300 transition-colors mb-2">
                  {project.title}
                </h3>
                
                <p className="text-[11px] sm:text-xs text-gray-400 font-mono mb-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 sm:py-3 border-y border-gray-800/80 mb-4 sm:mb-5">
                  {Object.entries(project.metrics).map(([label, val]) => (
                    <div key={label} className="text-center p-1.5 bg-black/40 rounded border border-gray-800/60">
                      <div className="text-xs font-bold font-mono text-green-400">{val}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono truncate">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
                  {project.tech.map(t => (
                    <span 
                      key={t}
                      className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 border border-green-500/20 text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Footer Actions */}
            <div className="p-4 sm:p-6 pt-0 flex items-center justify-between gap-2.5 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveModalProject(project)}
                className="w-full text-xs font-mono min-h-[40px] flex items-center justify-center cursor-pointer active:scale-98"
              >
                <span>View Architecture & Code</span>
                <Code2 className="w-3.5 h-3.5 ml-1.5" />
              </Button>

              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noreferrer"
                aria-label={`View Repository for ${project.title}`}
                className="w-10 h-10 rounded-lg border border-gray-800 bg-black hover:border-green-400 text-gray-400 hover:text-green-400 transition-colors flex items-center justify-center shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                title="View Source on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Project Detail Modal */}
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
              className="relative w-full max-w-4xl max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain touch-scroll rounded-t-2xl sm:rounded-2xl bg-[#030905]/98 border border-green-500/40 shadow-2xl z-10 p-4 sm:p-6 md:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-gray-800 mb-4 sm:mb-6 gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="cyan">{activeModalProject.category}</Badge>
                    <span className="text-[11px] font-mono text-gray-500">{activeModalProject.clientType}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-mono text-white glow-text leading-tight">
                    {activeModalProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-green-400 mt-1">
                    {activeModalProject.tagline}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModalProject(null)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-800 hover:border-red-400 hover:text-red-400 text-gray-400 transition-colors cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 sm:space-y-6">
                {/* Overview Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {Object.entries(activeModalProject.metrics).map(([k, v]) => (
                    <div key={k} className="p-2.5 sm:p-3 rounded-lg bg-black/60 border border-green-500/20 text-center">
                      <div className="text-sm sm:text-base font-bold font-mono text-green-400">{v}</div>
                      <div className="text-[10px] sm:text-xs font-mono text-gray-500">{k}</div>
                    </div>
                  ))}
                </div>

                {/* Challenge & Solution Architecture */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-red-500/20">
                    <h5 className="text-[11px] sm:text-xs font-bold font-mono text-red-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 shrink-0" /> Architectural Challenge
                    </h5>
                    <p className="text-[11px] sm:text-xs font-mono text-gray-300 leading-relaxed">
                      {activeModalProject.details.challenge}
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-green-500/20">
                    <h5 className="text-[11px] sm:text-xs font-bold font-mono text-green-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 shrink-0" /> Engineering Solution
                    </h5>
                    <p className="text-[11px] sm:text-xs font-mono text-gray-300 leading-relaxed">
                      {activeModalProject.details.solution}
                    </p>
                  </div>
                </div>

                {/* System Architecture Flow */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-black/50 border border-cyan-500/30">
                  <h5 className="text-[11px] sm:text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 shrink-0" /> System Topology & Flow
                  </h5>
                  <p className="text-[11px] sm:text-xs font-mono text-gray-300 leading-relaxed">
                    {activeModalProject.details.architecture}
                  </p>
                </div>

                {/* Problems Solved Checklist */}
                <div>
                  <h5 className="text-xs sm:text-sm font-bold font-mono text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Key Problems Solved
                  </h5>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeModalProject.problemsSolved.map(prob => (
                      <div key={prob} className="flex items-start gap-2 text-[11px] sm:text-xs font-mono text-gray-300 p-2 bg-black/40 rounded border border-gray-800">
                        <span className="text-green-400 mt-0.5">•</span>
                        <span>{prob}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Snippet Viewer */}
                <div className="rounded-xl overflow-hidden border border-green-500/30 bg-[#020904]">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#07190e] border-b border-green-500/20">
                    <span className="text-[11px] sm:text-xs font-mono text-green-400 flex items-center gap-1.5 sm:gap-2 truncate">
                      <Terminal className="w-3.5 h-3.5 shrink-0" />
                      Core Snippet ({activeModalProject.codeLanguage})
                    </span>
                    <button
                      onClick={() => copyCode(activeModalProject.codeSnippet)}
                      className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-green-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono text-green-300 overflow-x-auto leading-relaxed">
                    {activeModalProject.codeSnippet}
                  </pre>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-gray-800">
                  <Button variant="outline" size="sm" onClick={() => setActiveModalProject(null)} className="w-full sm:w-auto min-h-[40px]">
                    Close
                  </Button>
                  <a href={activeModalProject.githubUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full min-h-[40px]">
                      <Github className="w-4 h-4 mr-2" />
                      <span>View GitHub Repository</span>
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
