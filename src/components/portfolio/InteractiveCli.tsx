import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, Sparkles, CornerDownLeft, Maximize2 } from 'lucide-react'

interface HistoryEntry {
  command: string
  output: string | string[]
  isError?: boolean
}

const COMMAND_HELP = [
  'Available Commands:',
  '  help            - Show this command reference list',
  '  whoami          - Display Meena Kannan\'s professional background',
  '  skills          - Print summary of core technology stack',
  '  projects        - List featured enterprise projects',
  '  experience      - Output career journey summary',
  '  contact         - Display direct contact channels & links',
  '  hire            - Check current availability and engagement options',
  '  architecture    - Display Clean Architecture & DDD design principles',
  '  clear           - Clear terminal history',
  '  echo [text]     - Print arbitrary text to screen',
  '  date            - Show current system timestamp',
  '  easteregg       - Run a fun surprise terminal routine'
]

export default function InteractiveCli() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: 'welcome',
      output: [
        'MeenaOS Terminal v3.2.0 [x86_64-cloud-native]',
        'Type "help" to view available commands or "hire" to discuss engineering roles.',
        '--------------------------------------------------------------------------------'
      ]
    }
  ])
  const terminalEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const rawCmd = input.trim()
    if (!rawCmd) return

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
          'Name: Meena Kannan',
          'Role: Senior Full-Stack Software Engineer & Cloud Solutions Architect',
          'Experience: 7+ Years in Enterprise Java, Spring Boot, React & Cloud Native',
          'Focus: Clean Architecture, Distributed Microservices, Multi-Tenant SaaS',
          'Status: Actively available for remote enterprise opportunities & consulting'
        ]
        break
      case 'skills':
        output = [
          '[Backend]       Java 21, Spring Boot 3, Spring Security, Spring Cloud, Hibernate, Node.js',
          '[Cloud/DevOps]  AWS, Docker, Kubernetes, CI/CD GitHub Actions, Terraform, Prometheus',
          '[Databases]     PostgreSQL, Redis, Apache Kafka, Oracle DB, Flyway migrations',
          '[Frontend]      React 19, TypeScript, Next.js, Tailwind CSS 4, Framer Motion',
          '[Architecture]  Clean Architecture, Domain-Driven Design (DDD), Microservices, CQRS'
        ]
        break
      case 'projects':
        output = [
          '1. Meena Kannan Enterprise SaaS Platform  - Spring Boot 3, React 19, Redis, Docker (99.99% SLA)',
          '2. Distributed E-Commerce Microservices   - 10K+ RPS, Apache Kafka, Redis Cluster (40% Cost Cut)',
          '3. High-Throughput Real-Time Task Engine  - 50K+ Concurrent WebSocket Stream (<20ms Sync)',
          '4. FinTech Payment & Compliance Gateway   - $10M+ Daily Volume, PCI-DSS Compliant (0% Fraud)'
        ]
        break
      case 'experience':
        output = [
          '2022 - Present : Lead Full-Stack & Cloud Solutions Architect (Enterprise Cloud & SaaS)',
          '2020 - 2022    : Senior Full-Stack Software Engineer (FinTech & High-Throughput E-Commerce)',
          '2018 - 2020    : Software Engineer (Enterprise Web Solutions & Database Systems)'
        ]
        break
      case 'contact':
        output = [
          'Email    : meenakannan.dev@gmail.com',
          'LinkedIn : https://www.linkedin.com/in/meena-kannan',
          'GitHub   : https://github.com/meenak95',
          'Timezone : Flexible GMT+8 / GMT+5:30 with extensive US & EU overlap',
          'Turnaround: Responses guaranteed within 24 hours'
        ]
        break
      case 'hire':
        output = [
          'Status: OPEN to new opportunities and strategic architecture contracts',
          'Engagement Models:',
          '  - Full-Time Senior / Lead Engineering Roles',
          '  - Enterprise System Architecture & Modernization Consulting',
          '  - Monolith-to-Microservices Migration',
          '  - Full-Stack SaaS Product MVP to Production Launch'
        ]
        break
      case 'architecture':
        output = [
          'Clean Architecture & DDD Pillars:',
          '  1. Independent of Frameworks: Core business rules do not depend on libraries',
          '  2. Testable in Isolation: Unit tests execute in milliseconds without DB or UI',
          '  3. Independent of UI: Easy migration from Web to CLI to Mobile',
          '  4. Independent of Database: Swap Postgres, Oracle, or Mongo seamlessly'
        ]
        break
      case 'date':
        output = new Date().toUTCString()
        break
      case 'echo':
        output = args.join(' ') || '(empty string)'
        break
      case 'clear':
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

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50 mb-3">
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>$ /bin/interactive_shell --interactive</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white glow-text tracking-tight font-mono">
          Interactive Terminal CLI
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mt-2 font-mono text-xs sm:text-sm">
          Type commands directly to query Meena's architecture specifications, stack, and availability.
        </p>
      </motion.div>

      {/* Terminal Shell Window */}
      <div 
        onClick={() => inputRef.current?.focus()} 
        className="rounded-2xl overflow-hidden border border-green-500/35 bg-[#030a05]/95 shadow-2xl backdrop-blur-xl cursor-text"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#06160b] border-b border-green-500/25">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-green-400" />
              meena@cloud-workstation:~ (bash)
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
            Press [Enter] to submit • Type "help"
          </span>
        </div>

        {/* Terminal History */}
        <div className="p-5 font-mono text-xs sm:text-sm min-h-[340px] max-h-[460px] overflow-y-auto space-y-3 leading-relaxed">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-green-400">
                <span className="text-cyan-400">meena@cloud:~$</span>
                <span className="text-white">{item.command}</span>
              </div>
              <div className={`${item.isError ? 'text-red-400' : 'text-gray-300'} pl-4`}>
                {Array.isArray(item.output) ? (
                  item.output.map((line, lIdx) => (
                    <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                  ))
                ) : (
                  <div className="whitespace-pre-wrap">{item.output}</div>
                )}
              </div>
            </div>
          ))}

          {/* Active Prompt Line */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1 text-green-400">
            <span className="text-cyan-400 select-none">meena@cloud:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-green-200 font-mono text-xs sm:text-sm p-0 m-0"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className="text-gray-600 hover:text-green-400 transition-colors">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          <div ref={terminalEndRef} />
        </div>

        {/* Quick Command Suggestion Buttons */}
        <div className="px-4 py-2.5 bg-[#05140b] border-t border-green-500/20 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-gray-500 text-[11px] mr-1">Quick Run:</span>
          {['help', 'whoami', 'skills', 'projects', 'hire', 'clear'].map(cmd => (
            <button
              key={cmd}
              onClick={(e) => {
                e.stopPropagation()
                setInput(cmd)
                inputRef.current?.focus()
              }}
              className="px-2 py-0.5 rounded bg-black/60 border border-green-500/20 text-gray-400 hover:text-green-300 hover:border-green-500/50 text-[11px] transition-colors cursor-pointer"
            >
              ${cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
