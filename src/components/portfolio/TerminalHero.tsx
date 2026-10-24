import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  ArrowRight, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Zap, 
  Layers, 
  Database,
  Cloud,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Play,
  RotateCcw,
  ChevronDown,
  FileCode,
  FileText,
  Server
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type FileTab = 'java' | 'k8s' | 'metrics'

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
      '    private final int enterpriseExperienceYears = 7;',
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
  }
]

const VALUE_PROPS = [
  { icon: ShieldCheck, text: '99.99% SLA Uptime', desc: 'Fault-tolerant distributed systems', color: 'text-green-400', border: 'border-green-500/30' },
  { icon: TrendingUp, text: '40% Cost Reduction', desc: 'Optimized cloud & microservices', color: 'text-cyan-400', border: 'border-cyan-500/30' },
  { icon: Zap, text: '10K+ Requests/Sec', desc: 'Sub-80ms API response latency', color: 'text-purple-400', border: 'border-purple-500/30' },
]

export default function TerminalHero() {
  const [activeTab, setActiveTab] = useState<FileTab>('java')
  const [displayedCode, setDisplayedCode] = useState<string[]>([''])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [copied, setCopied] = useState(false)

  const activeContent = useMemo(() => {
    return TABS.find(t => t.id === activeTab) || TABS[0]
  }, [activeTab])

  // Reset typewriter when tab changes
  useEffect(() => {
    setDisplayedCode([''])
    setCurrentLine(0)
    setCurrentChar(0)
    setIsTypingComplete(false)
  }, [activeTab])

  // Typewriter effect
  useEffect(() => {
    const lines = activeContent.lines
    if (currentLine >= lines.length) {
      setIsTypingComplete(true)
      return
    }

    const line = lines[currentLine]
    const timer = setTimeout(() => {
      if (currentChar < line.length) {
        setDisplayedCode(prev => {
          const next = [...prev]
          next[currentLine] = line.substring(0, currentChar + 1)
          return next
        })
        setCurrentChar(c => c + 1)
      } else {
        setCurrentChar(0)
        setCurrentLine(l => l + 1)
        setDisplayedCode(prev => [...prev, ''])
      }
    }, Math.random() * 18 + 10)

    return () => clearTimeout(timer)
  }, [currentChar, currentLine, activeContent])

  const copyCurrentSnippet = () => {
    navigator.clipboard.writeText(activeContent.lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const restartTyping = () => {
    setDisplayedCode([''])
    setCurrentLine(0)
    setCurrentChar(0)
    setIsTypingComplete(false)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-16 z-10">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Hero Narrative, Title & CTAs */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7 }} 
          className="lg:col-span-6 space-y-5 sm:space-y-6 min-w-0 w-full"
        >
          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] sm:text-xs md:text-sm font-mono shadow-sm">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500"></span>
            </span>
            <span className="hidden sm:inline">Available for Enterprise Roles & Strategic Consulting</span>
            <span className="sm:hidden">Available for Roles & Consulting</span>
          </div>

          {/* Terminal Command Prompt Line & Headings */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="text-cyan-400 font-mono text-[11px] sm:text-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
              <span className="text-gray-500">$</span>
              <span>./initialize --architect --lead-engineer</span>
              <span className="w-1.5 h-3.5 bg-cyan-400 cursor-blink ml-0.5" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-mono">
              Hi, I'm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 glow-text block sm:inline">
                Meena Kannan
              </span>
            </h1>

            <div className="text-base sm:text-xl text-gray-200 font-mono flex items-center gap-2 pt-1 font-semibold">
              <span className="text-green-400">&gt;</span>
              <span>Senior Full-Stack & Cloud Solutions Architect</span>
            </div>

            <p className="text-gray-400 text-xs sm:text-base leading-relaxed max-w-xl font-mono">
              Architecting mission-critical distributed microservices, multi-tenant enterprise SaaS, and resilient cloud infrastructure with <strong className="text-green-300 font-semibold">Java 21</strong>, <strong className="text-cyan-300 font-semibold">Spring Boot 3</strong>, <strong className="text-purple-300 font-semibold">React 19</strong>, and <strong className="text-emerald-300 font-semibold">AWS</strong>.
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
                className={`p-2.5 sm:p-3 rounded-xl bg-black/60 border ${prop.border} backdrop-blur-sm hover:bg-green-500/5 transition-all`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <prop.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${prop.color} shrink-0`} />
                  <span className={`text-xs font-bold font-mono ${prop.color}`}>{prop.text}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono leading-tight">{prop.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Action CTAs: Balanced 2-column mobile grid & flex row on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2">
            <button
              onClick={() => scrollToSection('projects')}
              aria-label="Explore Projects"
              className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all cursor-pointer group active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="/Meena_Kannan_Senior_Architect_Resume.pdf"
              download="Meena_Kannan_Senior_Architect_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Download Meena Kannan's Resume PDF"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-mono text-xs sm:text-sm bg-green-500/10 border border-green-500/40 text-green-300 hover:text-black hover:bg-green-400 hover:border-green-400 transition-all cursor-pointer active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 group-hover:text-black shrink-0" />
              <span>Resume PDF</span>
            </a>

            <button
              onClick={() => scrollToSection('contact')}
              aria-label="Navigate to Contact Section"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-mono text-xs sm:text-sm bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:text-black hover:bg-cyan-400 hover:border-cyan-400 transition-all cursor-pointer active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-black shrink-0" />
              <span>Get In Touch</span>
            </button>

            <button
              onClick={() => scrollToSection('about')}
              aria-label="View Clean Architecture Blueprint"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-mono font-semibold text-xs sm:text-sm bg-black/70 border border-green-500/40 text-green-300 hover:border-green-400 hover:text-white transition-all cursor-pointer active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" />
              <span className="truncate">Clean Arch</span>
            </button>

            <button
              onClick={() => scrollToSection('terminal')}
              aria-label="Open Interactive CLI Terminal"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-mono text-xs sm:text-sm bg-black/50 border border-gray-800 text-gray-400 hover:text-green-300 hover:border-green-500/40 transition-all cursor-pointer active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>Open CLI</span>
            </button>
          </div>

          {/* Quick Production Metrics Strip */}
          <div className="pt-4 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center sm:text-left font-mono">
            <div className="p-2 sm:p-0 bg-black/40 sm:bg-transparent rounded-lg border border-gray-800 sm:border-none">
              <span className="text-green-400 font-extrabold text-base sm:text-xl block">7+ Yrs</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 sm:text-gray-500">Enterprise Dev</span>
            </div>
            <div className="p-2 sm:p-0 bg-black/40 sm:bg-transparent rounded-lg border border-gray-800 sm:border-none">
              <span className="text-cyan-400 font-extrabold text-base sm:text-xl block">99.99%</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 sm:text-gray-500">System SLA</span>
            </div>
            <div className="p-2 sm:p-0 bg-black/40 sm:bg-transparent rounded-lg border border-gray-800 sm:border-none">
              <span className="text-purple-400 font-extrabold text-base sm:text-xl block">10K+</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 sm:text-gray-500">Peak RPS</span>
            </div>
            <div className="p-2 sm:p-0 bg-black/40 sm:bg-transparent rounded-lg border border-gray-800 sm:border-none">
              <span className="text-emerald-400 font-extrabold text-base sm:text-xl block">40%</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 sm:text-gray-500">Cloud Saved</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Multi-Tab Code Terminal Cockpit */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, delay: 0.15 }} 
          className="lg:col-span-6 min-w-0 w-full"
        >
          <div className="rounded-2xl overflow-hidden border border-green-500/35 bg-[#030a05]/95 shadow-2xl glow-card backdrop-blur-xl">
            
            {/* Terminal Window Top Bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#06160b] border-b border-green-500/25">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition-opacity" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80 hover:opacity-100 transition-opacity" />
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-mono text-gray-400">
                  meena-session
                </span>
              </div>

              {/* Controls: Replay & Copy */}
              <div className="flex items-center gap-1 sm:gap-2 text-xs font-mono">
                <button
                  onClick={restartTyping}
                  title="Replay Code Animation"
                  className="p-1.5 rounded text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={copyCurrentSnippet}
                  title="Copy Code"
                  className="flex items-center gap-1 px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-green-500/10 transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center bg-[#040e07] border-b border-green-500/20 px-2 pt-1 gap-1 overflow-x-auto scrollbar-none touch-scroll">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-t-lg font-mono text-[11px] sm:text-xs transition-all cursor-pointer shrink-0 border-t border-l border-r ${
                      isActive
                        ? 'bg-[#030a05] text-green-400 border-green-500/40 shadow-sm'
                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-green-400' : 'text-gray-500'}`} />
                    <span className="truncate max-w-[140px] sm:max-w-none">{tab.filename}</span>
                    {isActive && (
                      <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-green-500/20 text-[9px] text-green-300 border border-green-500/30">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Code Output Body */}
            <div className="p-3 sm:p-5 font-mono text-[11px] sm:text-xs md:text-sm overflow-x-auto min-h-[240px] sm:min-h-[380px] max-h-[320px] sm:max-h-[460px] leading-relaxed selection:bg-green-700 selection:text-white bg-[#020703]/90 touch-scroll">
              {displayedCode.map((line, idx) => {
                let colorClass = 'text-green-300'
                if (line.startsWith('/**') || line.startsWith(' *') || line.startsWith('#')) colorClass = 'text-gray-500 italic'
                else if (line.startsWith('//')) colorClass = 'text-emerald-600 italic'
                else if (line.startsWith('@')) colorClass = 'text-yellow-300 font-semibold'
                else if (line.includes('public class') || line.includes('public ArchitectureMetrics') || line.includes('implements')) colorClass = 'text-purple-300 font-semibold'
                else if (line.includes('private final') || line.includes('apiVersion:') || line.includes('kind:')) colorClass = 'text-cyan-300'
                else if (line.includes('return') || line.includes('new') || line.includes('spec:') || line.includes('metadata:')) colorClass = 'text-pink-400'
                else if (line.includes('"')) colorClass = 'text-emerald-200'

                return (
                  <div key={idx} className="flex gap-2 sm:gap-3 hover:bg-green-500/5 px-1 rounded transition-colors">
                    <span className="w-4 sm:w-6 text-right text-gray-600 select-none text-[10px] sm:text-[11px] pt-[2px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className={`${colorClass} break-all sm:break-normal`}>
                      {line}
                      {idx === currentLine && currentLine < activeContent.lines.length && (
                        <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4 bg-green-400 ml-1 cursor-blink align-middle" />
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Terminal Window Footer */}
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#05140b] border-t border-green-500/20 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-400" />
                <span className="text-green-300">{activeContent.language}</span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-gray-500 hidden sm:inline">{activeContent.lines.length} lines</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-gray-400">Execution Ready</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Interactive "Scroll to Explore" Indicator */}
      <div className="mt-8 sm:mt-12 flex justify-center">
        <button
          onClick={() => scrollToSection('about')}
          className="group flex flex-col items-center gap-2 text-gray-500 hover:text-green-400 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 group-hover:border-green-400 flex justify-center p-1 transition-colors">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 rounded-full bg-green-400"
            />
          </div>
          <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform text-gray-600 group-hover:text-green-400" />
        </button>
      </div>

    </div>
  )
}
