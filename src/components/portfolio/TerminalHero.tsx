import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Cloud, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check, 
  RotateCcw, 
  Server, 
  Send,
  Bot,
  Activity,
  FileText,
  GitCompare,
  Sliders,
  Flame,
  Globe,
  GitCommit,
  Radio,
  Globe2,
  Database,
  CloudLightning,
  ShieldAlert,
  GitFork,
  GitMerge,
  Search,
  History,
  AlertOctagon,
  Lock,
  Scale,
  ToggleLeft,
  Fingerprint,
  Shield,
  Split
} from 'lucide-react'
import HeroArchitectureTopology from '@/components/architecture/HeroArchitectureTopology'

type FileTab = 'java' | 'k8s' | 'metrics' | 'mcp'

interface TabContent {
  id: FileTab
  filename: string
  language: string
  icon: any
  badge: string
  lines: string[]
}

const TABS: TabContent[] = [
  {
    id: 'java',
    filename: 'MeenaKannanArchitect.java',
    language: 'Java 21 LTS',
    icon: Code2,
    badge: 'Clean Architecture',
    lines: [
      '/**',
      ' * @author Meena Kannan',
      ' * @role Senior Full-Stack Cloud & Software Architect',
      ' * @spec Clean Architecture & Domain-Driven Design (DDD)',
      ' */',
      '@EnterpriseSystem(resilience = High, scale = Enterprise)',
      'public class MeenaKannanArchitect implements CloudArchitect {',
      '    private final String role = "Senior Full-Stack & Solutions Architect";',
      '    private final int enterpriseExperienceYears = 8;',
      '    private final Set<String> coreSpecialties = Set.of(',
      '        "Java 21", "Spring Boot 3", "Distributed Microservices",',
      '        "React 19", "PostgreSQL", "Kafka", "AWS Cloud Native"',
      '    );',
      '',
      '    // Proven business impact delivered across global systems',
      '    public ArchitectureMetrics deliverBusinessOutcomes() {',
      '        return ArchitectureMetrics.builder()',
      '            .productionUptime("99.99% SLA")',
      '            .latencyReduction("65% faster response")',
      '            .cloudCostReduction("40% monthly savings")',
      '            .highThroughput("10,000+ RPS handled")',
      '            .build();',
      '    }',
      '}'
    ]
  },
  {
    id: 'k8s',
    filename: 'cluster-deployment.yaml',
    language: 'Kubernetes / AWS',
    icon: Cloud,
    badge: 'Cloud Native',
    lines: [
      'apiVersion: apps/v1',
      'kind: Deployment',
      'metadata:',
      '  name: meena-enterprise-microservice',
      '  namespace: production',
      'spec:',
      '  replicas: 12',
      '  strategy:',
      '    type: RollingUpdate',
      '    rollingUpdate:',
      '      maxSurge: 25%',
      '      maxUnavailable: 0',
      '  template:',
      '    spec:',
      '      containers:',
      '      - name: core-api',
      '        image: registry.cloud.io/meena/spring-boot-3:latest',
      '        resources:',
      '          limits: { cpu: "2000m", memory: "4Gi" }',
      '          requests: { cpu: "500m", memory: "1Gi" }',
      '        env:',
      '        - name: SPRING_PROFILES_ACTIVE',
      '          value: "production,cloud-native,kafka-streams"'
    ]
  },
  {
    id: 'metrics',
    filename: 'telemetry-metrics.json',
    language: 'JSON / Actuator',
    icon: Server,
    badge: 'Live Telemetry',
    lines: [
      '{',
      '  "service": "enterprise-mesh-gateway",',
      '  "status": "HEALTHY",',
      '  "telemetry": {',
      '    "uptime_sla": "99.99%",',
      '    "p99_latency_ms": 42.8,',
      '    "peak_throughput_rps": 10450,',
      '    "active_instances": 12,',
      '    "cache_hit_ratio": "94.6%",',
      '    "kafka_lag": 0,',
      '    "vulnerabilities": 0,',
      '    "cloud_cost_optimization": "-40%"',
      '  },',
      '  "deployment": "AWS EKS Multi-AZ"',
      '}'
    ]
  },
  {
    id: 'mcp',
    filename: 'mcp-server-config.json',
    language: 'JSON-RPC / MCP',
    icon: Bot,
    badge: 'Model Context Protocol',
    lines: [
      '{',
      '  "protocol": "Model Context Protocol (MCP)",',
      '  "version": "2024-11-05",',
      '  "server": "enterprise-architecture-tools",',
      '  "transports": ["stdio", "sse"],',
      '  "capabilities": {',
      '    "tools": [',
      '      "query_database_topology",',
      '      "inspect_kafka_consumer_lag",',
      '      "simulate_chaos_partition"',
      '    ],',
      '    "resources": [',
      '      "postgres://schema/audit_log",',
      '      "kafka://cluster/payment_events"',
      '    ]',
      '  },',
      '  "runtime": "Java 21 LTS / GraalVM Native"',
      '}'
    ]
  }
]

const VALUE_PROPS = [
  { icon: ShieldCheck, text: '99.99% SLA Uptime', desc: 'Fault-tolerant distributed systems', color: 'text-emerald-400', border: 'border-emerald-500/30' },
  { icon: TrendingUp, text: '40% Cost Reduction', desc: 'Optimized cloud & microservices', color: 'text-cyan-400', border: 'border-cyan-500/30' },
  { icon: Zap, text: '10K+ Requests/Sec', desc: 'Sub-80ms API response latency', color: 'text-purple-400', border: 'border-purple-500/30' },
]

const ARCHITECTURE_ENGINES = [
  { id: 'architecture-ai-codex', label: 'AI Codex', badge: 'ByteByteGo', icon: Bot, border: 'border-teal-500/40 text-teal-300 hover:bg-teal-500/10' },
  { id: 'architecture-workbench', label: 'Workbench', badge: '5 Systems', icon: Activity, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-adr-ledger', label: 'ADR Ledger', badge: 'ADR-001-006', icon: FileText, border: 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10' },
  { id: 'architecture-tradeoff-matrix', label: 'Trade-Offs', badge: 'Matrix', icon: GitCompare, border: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
  { id: 'architecture-evolution-diff', label: 'Evolution Diff', badge: 'Mesh Diff', icon: Sliders, border: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10' },
  { id: 'architecture-chaos-matrix', label: 'Chaos Drills', badge: 'SRE Matrix', icon: Flame, border: 'border-orange-500/40 text-orange-300 hover:bg-orange-500/10' },
  { id: 'architecture-api-gateway', label: 'API Gateway', badge: 'Envoy', icon: Globe, border: 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10' },
  { id: 'architecture-distributed-tracing', label: 'Tracing', badge: 'OTel Spans', icon: GitCommit, border: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/10' },
  { id: 'architecture-event-streams', label: 'Kafka Streams', badge: 'ISR Lag', icon: Radio, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-rate-limiter', label: 'Rate Limiter', badge: 'Redis Lua', icon: Sliders, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-multi-region', label: 'Multi-Region', badge: 'CRDT & Raft', icon: Globe2, border: 'border-sky-500/40 text-sky-300 hover:bg-sky-500/10' },
  { id: 'architecture-database-sharding', label: 'DB Sharding', badge: 'Ring Topology', icon: Database, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-edge-cdn', label: 'Edge CDN', badge: 'SWR Shield', icon: CloudLightning, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-circuit-breaker', label: 'Circuit Breaker', badge: 'Resilience4j', icon: ShieldAlert, border: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10' },
  { id: 'architecture-distributed-concurrency', label: 'Concurrency', badge: 'Tarjan WFG', icon: GitFork, border: 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10' },
  { id: 'architecture-raft-consensus', label: 'Raft Consensus', badge: 'Quorum RSM', icon: Radio, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-vector-search', label: 'Vector Search', badge: 'HNSW Graph', icon: Search, border: 'border-teal-500/40 text-teal-300 hover:bg-teal-500/10' },
  { id: 'architecture-traffic-priority', label: 'QoS Priority', badge: 'WFQ Shaper', icon: Sliders, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-distributed-sagas', label: 'Sagas & CDC', badge: 'Temporal Saga', icon: GitMerge, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-distributed-cache', label: 'Cache Stampede', badge: 'XFetch Mutex', icon: Database, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-event-sourcing', label: 'Event Sourcing', badge: 'CQRS Replay', icon: History, border: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
  { id: 'architecture-dlq-retry', label: 'DLQ Retries', badge: 'Poison Pill DLQ', icon: AlertOctagon, border: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10' },
  { id: 'architecture-idempotency', label: 'Idempotency', badge: 'Redlock CAS', icon: Lock, border: 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10' },
  { id: 'architecture-atomic-commit', label: '2PC vs Saga', badge: 'XA & 3PC', icon: Scale, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-feature-flags', label: 'Feature Flags', badge: 'Canary Rollout', icon: ToggleLeft, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-tenant-isolation', label: 'Multi-Tenant RLS', badge: 'Postgres RLS', icon: Fingerprint, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  { id: 'architecture-zero-trust-mesh', label: 'Zero-Trust Mesh', badge: 'SPIFFE mTLS', icon: Shield, border: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' },
  { id: 'architecture-split-brain-resolver', label: 'Split-Brain Resolver', badge: 'Quorum Fencing', icon: Split, border: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
  { id: 'architecture-gslb-anycast', label: 'BGP Anycast', badge: 'GSLB AS13335', icon: Globe, border: 'border-sky-500/40 text-sky-300 hover:bg-sky-500/10' },
  { id: 'architecture-distributed-lock', label: 'DLM Locks', badge: 'Redlock & etcd', icon: Lock, border: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
  { id: 'architecture-webhook-ingress', label: 'Webhook Ingress', badge: 'HMAC & Kafka', icon: Radio, border: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
]

export default function TerminalHero() {
  const [cockpitMode, setCockpitMode] = useState<'topology' | 'manifest'>('topology')
  const [activeTab, setActiveTab] = useState<FileTab>('java')
  const [currentLine, setCurrentLine] = useState(() => TABS[0].lines.length)
  const [currentChar, setCurrentChar] = useState(0)
  const [copied, setCopied] = useState(false)

  const activeContent = useMemo(() => {
    return TABS.find(t => t.id === activeTab) || TABS[0]
  }, [activeTab])

  // Typewriter effect - runs smoothly when replaying code
  useEffect(() => {
    const lines = activeContent.lines || []
    if (currentLine >= lines.length) {
      return
    }

    const line = lines[currentLine] || ''
    const timer = setTimeout(() => {
      if (currentChar < line.length) {
        setCurrentChar(c => c + 1)
      } else {
        setCurrentChar(0)
        setCurrentLine(l => l + 1)
      }
    }, Math.random() * 12 + 6)

    return () => clearTimeout(timer)
  }, [currentChar, currentLine, activeContent])

  // Derive displayedCode deterministically to prevent out-of-sync or sparse array states
  const displayedCode = useMemo(() => {
    const lines = activeContent.lines || []
    const result: string[] = []
    const targetLine = Math.min(currentLine, Math.max(0, lines.length - 1))

    for (let i = 0; i <= targetLine && i < lines.length; i++) {
      const lineStr = lines[i] || ''
      if (i < currentLine) {
        result.push(lineStr)
      } else {
        result.push(lineStr.substring(0, Math.min(currentChar, lineStr.length)))
      }
    }
    return result.length > 0 ? result : ['']
  }, [activeContent, currentLine, currentChar])

  const copyCurrentSnippet = () => {
    navigator.clipboard.writeText((activeContent.lines || []).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const restartTyping = () => {
    setCurrentLine(0)
    setCurrentChar(0)
  }

  const handleTabChange = (tabId: FileTab) => {
    setActiveTab(tabId)
    const targetTab = TABS.find(t => t.id === tabId)
    setCurrentLine(targetTab ? targetTab.lines.length : 0)
    setCurrentChar(0)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14 z-10">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Live Architectural Metrics & SLA Baseline */}
      <div className="mb-5 sm:mb-6 p-2.5 sm:p-3 rounded-2xl bg-[#090e18]/80 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white font-bold tracking-tight">ARCHITECTURE TARGETS:</span>
          <span className="text-emerald-400 font-semibold">Active-Active Multi-Region</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Target SLA:</span>
            <span className="text-emerald-300 font-bold tabular-nums">99.99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">P99 Latency:</span>
            <span className="text-cyan-300 font-bold tabular-nums">&lt;45ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Cache Hit:</span>
            <span className="text-purple-300 font-bold tabular-nums">94.6%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Scale Strategy:</span>
            <span className="text-amber-300 font-bold">HPA Auto-Scale</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Hero Narrative, Title & CTAs */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7 }} 
          className="lg:col-span-6 space-y-5 sm:space-y-6 min-w-0 w-full"
        >
          {/* Availability & Featured Architecture Lab Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Available for Enterprise Roles & Strategic Consulting</span>
            </div>
            <a
              href="#architecture-ai-codex"
              className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3 sm:py-1.5 rounded-full bg-teal-500/10 border border-teal-500/40 hover:border-teal-400 text-teal-300 text-[11px] sm:text-xs font-mono transition-all cursor-pointer group"
              aria-label="Jump to ByteByteGo AI Terms Infographic"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>ByteByteGo AI Terms Infographic</span>
              <span className="text-teal-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </a>
          </div>

          {/* Heading */}
          <div className="space-y-2.5 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-editorial">
              Hi, I'm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 block sm:inline">
                Meena Kannan
              </span>
            </h1>

            <div className="text-base sm:text-xl text-slate-200 font-editorial flex items-center gap-2 pt-1 font-semibold">
              <span className="text-emerald-400">&gt;</span>
              <span>Senior Full-Stack & Cloud Solutions Architect</span>
            </div>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
              Architecting mission-critical distributed microservices, multi-tenant enterprise SaaS, and resilient cloud infrastructure with <strong className="text-white font-semibold">Java 21</strong>, <strong className="text-emerald-300 font-semibold">Spring Boot 3</strong>, <strong className="text-cyan-300 font-semibold">React 19</strong>, and <strong className="text-teal-300 font-semibold">AWS</strong>.
            </p>
          </div>

          {/* Value Propositions Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
            {VALUE_PROPS.map((prop, idx) => (
              <motion.div
                key={prop.text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className={`p-3 rounded-xl bg-slate-950/60 border ${prop.border} backdrop-blur-sm hover:border-slate-700 transition-all`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <prop.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${prop.color} shrink-0`} />
                  <span className={`text-xs font-bold font-mono ${prop.color}`}>{prop.text}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans leading-tight">{prop.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Streamlined CTAs: Primary Action + Secondary Action */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => scrollToSection('architecture')}
              aria-label="Explore ByteByteGo Architecture Lab"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-sans font-bold text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer group active:scale-[0.98] min-h-[46px]"
            >
              <span>Explore ByteByteGo Architecture</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#architecture-ai-codex"
              aria-label="View ByteByteGo AI Terms Infographic"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-xs sm:text-sm bg-teal-500/15 border border-teal-500/40 text-teal-300 hover:text-white hover:bg-teal-500/25 hover:border-teal-400 transition-all cursor-pointer active:scale-[0.98] min-h-[46px]"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>AI Terms Infographic (5 Terms)</span>
            </a>

            <a
              href="/Meena_Kannan_Senior_Architect_Resume.pdf"
              download="Meena_Kannan_Senior_Architect_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Download Meena Kannan's Resume PDF"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-xs sm:text-sm bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 transition-all cursor-pointer active:scale-[0.98] min-h-[46px]"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Executive CV (PDF)</span>
            </a>

            <button
              onClick={() => scrollToSection('contact')}
              aria-label="Navigate to Contact Section"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get in Touch</span>
            </button>
          </div>

          {/* Quick Production Metrics Strip */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center sm:text-left font-mono">
            <div className="p-2 sm:p-0 bg-slate-950/40 sm:bg-transparent rounded-lg border border-slate-800 sm:border-none">
              <span className="text-emerald-400 font-extrabold text-base sm:text-xl block tabular-nums">8+ Yrs</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Enterprise Dev</span>
            </div>
            <div className="p-2 sm:p-0 bg-slate-950/40 sm:bg-transparent rounded-lg border border-slate-800 sm:border-none">
              <span className="text-cyan-400 font-extrabold text-base sm:text-xl block tabular-nums">99.99%</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">System SLA</span>
            </div>
            <div className="p-2 sm:p-0 bg-slate-950/40 sm:bg-transparent rounded-lg border border-slate-800 sm:border-none">
              <span className="text-purple-400 font-extrabold text-base sm:text-xl block tabular-nums">10K+</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Peak RPS</span>
            </div>
            <div className="p-2 sm:p-0 bg-slate-950/40 sm:bg-transparent rounded-lg border border-slate-800 sm:border-none">
              <span className="text-teal-400 font-extrabold text-base sm:text-xl block tabular-nums">40%</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Cloud Saved</span>
            </div>
          </div>

          {/* 12 Live Architecture Engines Fast-Jump Dock */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                31 Interactive Architecture Engines
              </span>
              <span className="text-slate-500 text-[10px]">Direct Fast Jump &darr;</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ARCHITECTURE_ENGINES.map((eng) => (
                <button
                  key={eng.id}
                  onClick={() => scrollToSection(eng.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border text-[11px] font-mono transition-all cursor-pointer ${eng.border}`}
                  aria-label={`Jump directly to ${eng.label}`}
                >
                  <eng.icon className="w-3 h-3 shrink-0" />
                  <span>{eng.label}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">{eng.badge}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Multi-Tab Code Terminal Cockpit */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, delay: 0.15 }} 
          className="lg:col-span-6 min-w-0 w-full"
        >
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl specular-card">
            
            {/* Terminal Window Top Bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0b1220] border-b border-slate-800">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-mono text-slate-400">
                  {cockpitMode === 'topology' ? 'system-topology.svg' : 'architecture-spec.manifest'}
                </span>
              </div>

              {/* View Switcher: Interactive Topology vs Code Spec */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] font-mono">
                <button
                  onClick={() => setCockpitMode('topology')}
                  className={`px-2 sm:px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    cockpitMode === 'topology'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                  aria-label="View Live Interactive Architecture Topology"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Architecture Canvas</span>
                </button>

                <button
                  onClick={() => setCockpitMode('manifest')}
                  className={`px-2 sm:px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    cockpitMode === 'manifest'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                  aria-label="View Code and Architecture Manifest"
                >
                  <Code2 className="w-3 h-3 text-cyan-400" />
                  <span>Code Manifest</span>
                </button>
              </div>
            </div>

            {cockpitMode === 'topology' ? (
              <HeroArchitectureTopology />
            ) : (
              <div>
                {/* File Switcher Tabs and Sub-Header Controls */}
                <div className="flex items-center justify-between bg-[#080d19] border-b border-slate-800 px-2 pt-1 gap-1">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none touch-scroll">
                    {TABS.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-t-lg font-mono text-[11px] sm:text-xs transition-all cursor-pointer shrink-0 border-t border-l border-r ${
                            isActive
                              ? 'bg-[#070b14] text-emerald-400 border-slate-700 shadow-sm'
                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                          }`}
                        >
                          <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="truncate max-w-[140px] sm:max-w-none">{tab.filename}</span>
                          {isActive && (
                            <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] text-emerald-300 border border-emerald-500/30">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Controls: Replay & Copy */}
                  <div className="flex items-center gap-1 sm:gap-2 text-xs font-mono pb-1 shrink-0">
                    <button
                      onClick={restartTyping}
                      title="Replay Code Animation"
                      aria-label="Replay Code Animation"
                      className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={copyCurrentSnippet}
                      title="Copy Code"
                      aria-label="Copy Code Snippet"
                      className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Code Output Body */}
                <div className="p-3 sm:p-5 font-mono text-[11px] sm:text-xs md:text-sm overflow-x-auto min-h-[240px] sm:min-h-[380px] max-h-[320px] sm:max-h-[460px] leading-relaxed selection:bg-emerald-700 selection:text-white bg-[#060a12] touch-scroll">
                  {displayedCode.map((rawLine, idx) => {
                    const line = typeof rawLine === 'string' ? rawLine : ''
                    let colorClass = 'text-emerald-300'
                    if (line.startsWith('/**') || line.startsWith(' *') || line.startsWith('#')) colorClass = 'text-slate-500 italic'
                    else if (line.startsWith('//')) colorClass = 'text-slate-500 italic'
                    else if (line.startsWith('@')) colorClass = 'text-yellow-300 font-semibold'
                    else if (line.includes('public class') || line.includes('public ArchitectureMetrics') || line.includes('implements')) colorClass = 'text-purple-400 font-semibold'
                    else if (line.includes('private final') || line.includes('apiVersion:') || line.includes('kind:')) colorClass = 'text-cyan-300'
                    else if (line.includes('return') || line.includes('new') || line.includes('spec:') || line.includes('metadata:')) colorClass = 'text-pink-400'
                    else if (line.includes('"')) colorClass = 'text-teal-200'

                    return (
                      <div key={idx} className="flex gap-2 sm:gap-3 hover:bg-slate-800/40 px-1 rounded transition-colors">
                        <span className="w-4 sm:w-6 text-right text-slate-600 select-none text-[10px] sm:text-[11px] pt-[2px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className={`${colorClass} break-all sm:break-normal`}>
                          {line}
                          {idx === currentLine && currentLine < activeContent.lines.length && (
                            <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4 bg-emerald-400 ml-1 cursor-blink align-middle" />
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Terminal Window Footer */}
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0a101d] border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">{activeContent.language}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-500 hidden sm:inline">{activeContent.lines.length} lines</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Validated Architecture Spec</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>

      </div>
    </div>
  )
}
