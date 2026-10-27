import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from 'lucide-react'
import { ARCHITECTURAL_DECISIONS } from '@/data/architecturalDecisions'

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
  'experience',
  'contact',
  'hire',
  'architecture',
  'adr',
  'decisions',
  'stats',
  'metrics',
  'benchmark',
  'ai-codex',
  'codex',
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
  { label: '[ $ adr ]', cmd: 'adr' },
  { label: '[ $ ai-codex ]', cmd: 'ai-codex' },
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
  '  projects        - List featured enterprise systems, SAGAs & metrics',
  '  experience      - Output career journey summary & 8+ years leadership milestones',
  '  stats           - View production performance & impact metrics (99.99% SLA)',
  '  metrics         - Print live architecture cluster telemetry, throughput & cache stats',
  '  benchmark       - Run simulated synthetic latency benchmark across distributed services',
  '  ai-codex        - Display ByteByteGo 5-pillar AI systems architecture codex',
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
      case 'projects':
        output = [
          '1. Meena Kannan Enterprise SaaS Platform  - Spring Boot 3, React 19, Redis, Docker (99.99% SLA, <80ms)',
          '2. Distributed E-Commerce Checkout Engine - 15k+ TPS, Choreographed Saga, Debezium CDC Outbox, Kafka',
          '3. High-Throughput Real-Time Task Engine  - 50K+ Concurrent WebSockets (<20ms Sync via Redis Pub/Sub)',
          '4. FinTech Payment & Compliance Gateway   - $10M+ Daily Volume, Double-Entry Immutable Ledger, PCI-DSS'
        ]
        break
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
      case 'ai-codex':
      case 'codex':
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
          'Interactive Visualizer: Live in the #architecture section ("AI Terms You Need to Know").'
        ]
        break
      case 'experience':
        output = [
          '2022 - Present : Lead Full-Stack & Cloud Solutions Architect (Enterprise SaaS & Cloud Migration)',
          '2020 - 2022    : Senior Full-Stack Software Engineer (FinTech & High-Frequency Scale-ups)',
          '2018 - 2020    : Full-Stack Software Engineer (Enterprise SaaS & Workflow Automation)',
          '2016 - 2018    : Software Engineer & Solutions Developer (Distributed Database & Web Systems)'
        ]
        break
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
      case 'architecture':
        if (args.some(a => a.toLowerCase().includes('ai') || a.toLowerCase().includes('codex'))) {
          output = [
            'Routing to ByteByteGo AI & Distributed Systems Architecture Codex:',
            '  1. Agentic AI           : Goal-driven perception/action loop (Memory, Tools, Invariants)',
            '  2. Large Reasoning (LRM): Multi-step Chain-of-Thought (CoT) internal verification traces',
            '  3. Vector Database      : High-dimensional similarity search over dense embeddings',
            '  4. RAG Pipeline         : Hybrid BM25 keyword + semantic dense vector context augmentation',
            '  5. MCP Interface        : Model Context Protocol (Host -> Client -> MCP Server Tool bus)',
            '--------------------------------------------------------------------------------',
            'Interactive Visualizer: Live in the #architecture section ("AI Terms You Need to Know").'
          ]
          break
        }
        output = [
          'Clean Architecture & Distributed Systems Principles:',
          '  1. Independent of Frameworks: Core business domains decouple from libraries and vendor SDKs',
          '  2. Dependency Inversion: High-level business policies do not depend on low-level infrastructure',
          '  3. Choreographed Sagas: Asynchronous eventual consistency replaces blocking 2PC coordinators',
          '  4. Transactional Outbox: Guaranteed atomic dual-writes to Postgres and Kafka via Debezium CDC'
        ]
        break
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
