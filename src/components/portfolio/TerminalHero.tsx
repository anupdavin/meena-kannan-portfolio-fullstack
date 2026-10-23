import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  Code2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const codeLines = [
  '/**',
  ' * @author Meena Kannan',
  ' * @title Senior Full-Stack Cloud & Software Architect',
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

const VALUE_PROPS = [
  { icon: ShieldCheck, text: '99.99% SLA Uptime', desc: 'Resilient fault-tolerant systems', color: 'text-green-400', border: 'border-green-500/30' },
  { icon: TrendingUp, text: '40% Cost Reduction', desc: 'Optimized cloud & microservices', color: 'text-cyan-400', border: 'border-cyan-500/30' },
  { icon: Zap, text: '10K+ Requests/Sec', desc: 'Sub-150ms distributed latency', color: 'text-purple-400', border: 'border-purple-500/30' },
]

export default function TerminalHero() {
  const [displayedCode, setDisplayedCode] = useState<string[]>([''])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)

  useEffect(() => {
    if (currentLine >= codeLines.length) return

    const line = codeLines[currentLine]
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
    }, Math.random() * 25 + 15)

    return () => clearTimeout(timer)
  }, [currentChar, currentLine])

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 py-12 md:py-20 z-10">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Left Column: Bio & Value Pitch */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }} 
          className="lg:col-span-6 space-y-6"
        >
          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs md:text-sm font-mono shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span>Available for Enterprise Opportunities & Consulting</span>
          </div>

          {/* Terminal Command Line Title */}
          <div className="space-y-2">
            <div className="text-cyan-400 font-mono text-sm md:text-base flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <span>./initialize --architect --lead-engineer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-mono">
              Hi, I'm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 glow-text">
                Meena Kannan
              </span>
            </h1>

            <div className="text-lg md:text-xl text-gray-300 font-mono flex flex-wrap items-center gap-2 pt-1">
              <span className="text-green-400">&gt;</span>
              <span className="text-white font-semibold">Senior Full-Stack & Cloud Solutions Architect</span>
            </div>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl font-mono">
              Engineering high-concurrency microservices, robust full-stack SaaS architectures, and cloud-native systems with <span className="text-green-300 font-semibold">Java 21</span>, <span className="text-cyan-300 font-semibold">Spring Boot 3</span>, <span className="text-purple-300 font-semibold">React 19</span>, and <span className="text-emerald-300 font-semibold">AWS</span>.
            </p>
          </div>

          {/* Value Propositions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {VALUE_PROPS.map((prop, idx) => (
              <motion.div
                key={prop.text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`p-3 rounded-lg bg-black/60 border ${prop.border} backdrop-blur-sm hover:bg-green-500/5 transition-all`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <prop.icon className={`w-4 h-4 ${prop.color}`} />
                  <span className={`text-xs font-bold font-mono ${prop.color}`}>{prop.text}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono leading-tight">{prop.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#projects">
              <Button size="lg" className="group">
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>

            <a href="#contact">
              <Button variant="outline" size="lg">
                <span>Get In Touch</span>
              </Button>
            </a>

            <a href="#terminal">
              <Button variant="ghost" size="md" className="border border-gray-700 hover:border-green-400">
                <Terminal className="w-4 h-4 mr-2 text-cyan-400" />
                <span>Open CLI</span>
              </Button>
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-4 border-t border-gray-800/80 flex flex-wrap gap-6 text-xs text-gray-400 font-mono">
            <div>
              <span className="text-green-400 font-bold text-base block">7+ Years</span>
              <span>Enterprise Dev</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold text-base block">40+ Projects</span>
              <span>Delivered</span>
            </div>
            <div>
              <span className="text-purple-400 font-bold text-base block">10K+ RPS</span>
              <span>Throughput</span>
            </div>
            <div>
              <span className="text-yellow-400 font-bold text-base block">100%</span>
              <span>Delivery SLA</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Code Typewriter Terminal */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }} 
          className="lg:col-span-6"
        >
          <div className="rounded-xl overflow-hidden border border-green-500/30 bg-[#040e07]/90 shadow-2xl glow-card backdrop-blur-xl">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#07190e] border-b border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition-opacity"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:opacity-100 transition-opacity"></div>
                <span className="ml-2 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-green-400" />
                  MeenaKannanArchitect.java
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px]">
                  Java 21 LTS
                </span>
                <span className="hidden sm:inline text-gray-500">UTF-8</span>
              </div>
            </div>

            {/* Code Output Body */}
            <div className="p-4 md:p-6 font-mono text-xs sm:text-sm overflow-x-auto min-h-[380px] max-h-[460px] leading-relaxed selection:bg-green-700 selection:text-white">
              {displayedCode.map((line, idx) => {
                let colorClass = 'text-green-300'
                if (line.startsWith('/**') || line.startsWith(' *')) colorClass = 'text-gray-500 italic'
                else if (line.startsWith('//')) colorClass = 'text-emerald-600 italic'
                else if (line.startsWith('@')) colorClass = 'text-yellow-300 font-semibold'
                else if (line.includes('public class') || line.includes('public ArchitectureMetrics') || line.includes('implements')) colorClass = 'text-purple-300 font-semibold'
                else if (line.includes('private final')) colorClass = 'text-cyan-300'
                else if (line.includes('return') || line.includes('new')) colorClass = 'text-pink-400'
                else if (line.includes('"')) colorClass = 'text-emerald-200'

                return (
                  <div key={idx} className="flex gap-3 hover:bg-green-500/5 px-1 rounded transition-colors">
                    <span className="w-6 text-right text-gray-600 select-none text-[11px] pt-[2px]">
                      {idx + 1}
                    </span>
                    <span className={colorClass}>
                      {line}
                      {idx === currentLine && currentLine < codeLines.length && (
                        <span className="inline-block w-2 h-4 bg-green-400 ml-1 cursor-blink align-middle" />
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Terminal Window Footer */}
            <div className="px-4 py-2 bg-[#05140b] border-t border-green-500/20 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Compiled cleanly: 0 warnings
                </span>
              </div>
              <span className="text-gray-500">Lines: {codeLines.length} | JVM 21</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
