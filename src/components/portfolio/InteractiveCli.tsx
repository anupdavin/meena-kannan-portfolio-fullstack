import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, Sparkles, CornerDownLeft, Maximize2, Trash2 } from 'lucide-react'

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
  'stats',
  'resume',
  'clear',
  'echo',
  'date',
  'sudo',
  'easteregg'
]

const COMMAND_HELP = [
  'Available Commands:',
  '  help            - Show this command reference list',
  '  whoami          - Display Meena Kannan\'s professional background',
  '  skills          - Print summary of core technology stack & competencies',
  '  projects        - List featured enterprise projects & metrics',
  '  experience      - Output career journey summary & achievements',
  '  stats           - View production performance & impact metrics',
  '  architecture    - Display Clean Architecture & DDD design principles',
  '  hire            - Check current availability & consulting engagement models',
  '  contact         - Display direct contact channels & quick links',
  '  resume          - Quick link to view / download technical CV',
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
        'Type "help" to view available commands, or click any quick-run pill below.',
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

  const handleCommand = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun !== undefined ? cmdToRun : input).trim()
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
          'Experience : 7+ Years building enterprise Java, Spring Boot, React & AWS systems',
          'Focus Area : Clean Architecture, Distributed Microservices, High Concurrency',
          'Status     : OPEN to Senior / Staff / Architect roles & Consulting contracts',
          'Location   : Remote / Global (Singapore / India with US/EU overlap)'
        ]
        break
      case 'skills':
        output = [
          '[Backend]       Java 21 LTS, Spring Boot 3, Spring Security, Spring Cloud, Hibernate, Node.js',
          '[Cloud/DevOps]  AWS (EC2, S3, RDS, ECS, Lambda), Docker, Kubernetes, GitHub Actions CI/CD',
          '[Databases]     PostgreSQL, Redis multi-tier caching, Apache Kafka, Flyway migrations',
          '[Frontend]      React 19, TypeScript, Next.js, Tailwind CSS 4, Framer Motion, WebSockets',
          '[Architecture]  Clean Architecture, Domain-Driven Design (DDD), CQRS, Resilience4j'
        ]
        break
      case 'projects':
        output = [
          '1. Meena Kannan Enterprise SaaS Platform  - Spring Boot 3, React 19, Redis, Docker (99.99% SLA)',
          '2. Distributed E-Commerce Microservices   - 10K+ RPS, Apache Kafka, Redis Cluster (-40% Cloud Spend)',
          '3. High-Throughput Real-Time Task Engine  - 50K+ Concurrent WebSockets (<20ms Broadcast Sync)',
          '4. FinTech Payment & Compliance Gateway   - $10M+ Daily Volume, PCI-DSS Compliant (0% Fraud)'
        ]
        break
      case 'stats':
        output = [
          'Production Impact Metrics:',
          '  * System SLA Uptime     : 99.99%',
          '  * Peak Throughput       : 10,000+ Requests/Second',
          '  * Database Query Speed  : -65% Latency Reduction via Redis & Indexing',
          '  * Cloud Infrastructure  : 40% Monthly Cost Reduction',
          '  * CI/CD Deployment Time : 2 Days -> Under 15 Minutes'
        ]
        break
      case 'experience':
        output = [
          '2022 - Present : Lead Full-Stack & Cloud Solutions Architect (Enterprise SaaS & Cloud)',
          '2020 - 2022    : Senior Full-Stack Software Engineer (FinTech & Scale-up Technologies)',
          '2018 - 2020    : Software Engineer (Enterprise Web Platforms & Database Optimization)'
        ]
        break
      case 'contact':
        output = [
          'Direct Contact Channels:',
          '  Email    : meenakannan.dev@gmail.com',
          '  LinkedIn : https://www.linkedin.com/in/meena-kannan',
          '  GitHub   : https://github.com/meenak95',
          '  SLA      : All professional inquiries answered within 24 hours'
        ]
        break
      case 'hire':
        output = [
          'Availability: OPEN to new opportunities and strategic architecture contracts',
          'Primary Engagement Models:',
          '  1. Full-Time Senior / Lead / Staff Software Engineer or Architect',
          '  2. Enterprise Microservices Architecture & Modernization Consulting',
          '  3. Monolith to Distributed Microservices Decomposition',
          '  4. Full-Stack SaaS MVP to Resilient Production Architecture'
        ]
        break
      case 'architecture':
        output = [
          'Clean Architecture & DDD Pillars:',
          '  1. Independent of Frameworks: Core business rules do not depend on libraries',
          '  2. Testable in Isolation: Use-case unit tests execute in milliseconds without DB or UI',
          '  3. Independent of UI: Decoupled controllers enable web, CLI, or mobile interfaces',
          '  4. Independent of Database: Swap Postgres, MongoDB, or Oracle with zero domain impact'
        ]
        break
      case 'resume':
        window.open('/Meena_Kannan_Senior_Architect_Resume.pdf', '_blank')
        output = [
          'Resume Document: Meena_Kannan_Senior_Architect_Resume.pdf',
          'Status: Initiated PDF download / opened in new tab.',
          'Direct Link: /Meena_Kannan_Senior_Architect_Resume.pdf',
          'Summary: 7+ Years Enterprise Dev, Java 21, Spring Boot 3, React 19, AWS Cloud Native'
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
          '"Clean code always looks like it was written by someone who cares." — Robert C. Martin'
        ]
        break
      default:
        output = `command not found: "${rawCmd}". Type "help" to see available commands.`
        isError = true
    }

    setHistory(prev => [...prev, { command: rawCmd, output, isError }])
    setInput('')
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
      const match = AVAILABLE_COMMANDS.find(c => c.startsWith(query))
      if (match) {
        setInput(match)
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
          Type commands directly or tap quick pills below to query specifications, stack, and availability.
        </p>
      </motion.div>

      {/* Terminal Shell Window */}
      <div 
        onClick={focusInputSafely} 
        className="rounded-2xl overflow-hidden border border-green-500/35 bg-[#030a05]/95 shadow-2xl backdrop-blur-xl cursor-text"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#06160b] border-b border-green-500/25">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/70" />
            <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-mono text-gray-400 flex items-center gap-1 sm:gap-1.5">
              <TerminalIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-400" />
              <span>meena@cloud:~</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 hidden sm:inline">
              Press [Enter] to submit • Type "help"
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setHistory([])
              }}
              title="Clear terminal"
              aria-label="Clear terminal history"
              className="text-gray-500 hover:text-red-400 transition-colors p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal History - Scrollable container */}
        <div 
          ref={terminalBodyRef}
          className="p-3 sm:p-5 font-mono text-[11px] sm:text-xs md:text-sm min-h-[260px] sm:min-h-[340px] max-h-[360px] sm:max-h-[460px] overflow-y-auto space-y-2.5 sm:space-y-3 leading-relaxed touch-scroll overscroll-contain"
        >
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm">
                <span className="text-cyan-400">
                  <span className="hidden sm:inline">meena@cloud:~$</span>
                  <span className="sm:hidden">~$</span>
                </span>
                <span className="text-white">{item.command}</span>
              </div>
              <div className={`${item.isError ? 'text-red-400' : 'text-gray-300'} pl-2 sm:pl-4 text-[11px] sm:text-xs md:text-sm overflow-x-auto touch-scroll`}>
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

          {/* Active Prompt Line */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleCommand()
            }} 
            className="flex items-center gap-1.5 sm:gap-2 pt-1 text-green-400"
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
              placeholder="type command..."
              className="flex-1 bg-transparent border-none outline-none text-green-200 font-mono text-base md:text-sm p-0 m-0 placeholder:text-gray-600 focus:ring-0"
              spellCheck={false}
              autoComplete="off"
            />
            <button 
              type="submit" 
              aria-label="Execute Command"
              className="text-gray-500 hover:text-green-400 transition-colors p-1.5 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400 rounded"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Command Suggestion Buttons (Swipeable on Mobile) */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#05140b] border-t border-green-500/20 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none text-xs font-mono touch-scroll">
          <span className="text-gray-500 text-[10px] sm:text-[11px] mr-1 shrink-0">Quick Run:</span>
          {['help', 'whoami', 'skills', 'projects', 'stats', 'hire', 'clear'].map(cmd => (
            <button
              key={cmd}
              onClick={(e) => {
                e.stopPropagation()
                handleCommand(cmd)
              }}
              className="px-2.5 py-1.5 rounded bg-black/60 border border-green-500/20 text-gray-300 hover:text-green-300 hover:border-green-500/50 text-[11px] transition-colors cursor-pointer shrink-0 min-h-[34px] active:scale-95 flex items-center"
            >
              ${cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
