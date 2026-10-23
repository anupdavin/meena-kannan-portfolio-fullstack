import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  GitBranch, 
  Server, 
  Database, 
  Check, 
  Copy,
  ExternalLink,
  Code
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ARCHITECTURE_LAYERS = [
  {
    layer: 'Presentation Layer',
    icon: Layers,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    desc: 'React 19 SPA, TypeScript, Tailwind CSS 4, WebSocket realtime streaming, responsive dashboards, interactive UI widgets.'
  },
  {
    layer: 'Application Layer',
    icon: Cpu,
    color: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    desc: 'Use-case services, CQRS command handlers, DTO mappings, input validation, transaction boundaries & Resilience4j fault tolerance.'
  },
  {
    layer: 'Domain Layer (Core)',
    icon: GitBranch,
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    desc: 'Pure business logic, Domain Entities, Value Objects, Domain Events, Aggregate Roots, invariant validation & DDD specifications.'
  },
  {
    layer: 'Infrastructure Layer',
    icon: Database,
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    desc: 'Spring Boot 3, Spring Data JPA, PostgreSQL, Redis caching, Apache Kafka event streams, Flyway migrations & AWS cloud hosting.'
  }
]

const CORE_PILLARS = [
  {
    title: 'Clean Architecture & DDD',
    desc: 'Decoupled domain logic from infrastructure, ensuring maintainability, high testability, and zero framework lock-in.',
    icon: Layers
  },
  {
    title: 'Distributed Resilience',
    desc: 'Zero single point of failure with circuit breakers, graceful degradation, retry queues, and rate-limiting policies.',
    icon: ShieldCheck
  },
  {
    title: 'Sub-Second High Throughput',
    desc: 'Optimized database indexing, Redis multi-tier caching, parallel streams, and non-blocking asynchronous event processing.',
    icon: Zap
  },
  {
    title: 'Security & Compliance First',
    desc: 'Hardened with JWT, OAuth2 (Google/GitHub), RBAC, strict CORS, encrypted payload tokens, and automated audit logging.',
    icon: Server
  }
]

export default function AboutTerminal() {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    const codeSnippet = `/**
 * Senior Full-Stack Cloud & Software Architect
 * Specialized in Enterprise Clean Architecture & Cloud Solutions
 */
public class MeenaKannanArchitect {
    private final String name = "Meena Kannan";
    private final String location = "Remote / Singapore / India";
    private final List<String> specialties = List.of(
        "Domain-Driven Design (DDD)", "Clean Architecture",
        "Spring Boot 3 & Java 21", "React 19 & TypeScript",
        "Microservices & Kafka", "Kubernetes & AWS"
    );
}`
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ cat /system/specifications/about_me.txt</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white glow-text tracking-tight font-mono">
          System Specifications & Architecture
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mt-3 font-mono text-sm md:text-base">
          Engineering clean, maintainable, and highly resilient cloud-native software built for enterprise scale.
        </p>
      </motion.div>

      {/* Code Card & Overview */}
      <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left: Interactive Class Specification */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 code-block rounded-xl border border-green-500/30 overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#06140b] border-b border-green-500/20">
            <span className="text-xs font-mono text-green-400 flex items-center gap-2">
              <Code className="w-4 h-4" />
              DeveloperProfile.java
            </span>
            <button 
              onClick={copyCode}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-green-500/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-5 text-xs sm:text-sm font-mono text-green-300 leading-relaxed overflow-x-auto">
{`/**
 * Senior Full-Stack Cloud & Software Architect
 * Specialized in Enterprise Clean Architecture & Cloud Solutions
 */
@Component
public class MeenaKannanArchitect {
    private final String name = "Meena Kannan";
    private final String status = "Available for Enterprise Roles & Consulting";
    private final String location = "Remote / Global";
    
    private final List<String> coreCompetencies = List.of(
        "Clean Architecture & Domain-Driven Design (DDD)",
        "Enterprise Java 21 & Spring Boot 3 Ecosystem",
        "React 19, TypeScript & Modern Frontend Architecture",
        "Event-Driven Microservices & Apache Kafka",
        "PostgreSQL, Redis & Distributed Caching",
        "Cloud Native (AWS, Docker, Kubernetes, CI/CD)"
    );

    public boolean isReadyToDeliver() {
        return true; // 7+ years of proven production results
    }
}`}
          </pre>
        </motion.div>

        {/* Right: Engineering Philosophy Bio */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 space-y-4"
        >
          <Card className="bg-[#040e07]/90 border border-green-500/30 p-6">
            <div className="flex items-center gap-2 text-green-400 text-sm font-mono font-semibold mb-2">
              <span className="text-cyan-400">&gt;&gt;</span> Executive Engineering Profile
            </div>
            <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
              I am a <strong className="text-white">Senior Full-Stack Software Engineer & Solutions Architect</strong> with extensive experience designing and deploying scalable, high-availability web applications, enterprise microservices, and multi-tenant SaaS products.
            </p>
            <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6">
              Throughout my 7+ years in enterprise software engineering, I have focused on closing the gap between complex business requirements and elegant, battle-tested software architectures. Whether decomposing monolithic systems into distributed microservices or crafting responsive React frontends, my focus is always on <span className="text-green-300">reliability</span>, <span className="text-cyan-300">performance</span>, and <span className="text-purple-300">maintainability</span>.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
              <div className="p-3 rounded bg-black/40 border border-green-500/20">
                <span className="text-xs text-gray-400 font-mono block">Primary Methodology</span>
                <span className="text-sm font-mono font-bold text-green-400">Clean Architecture / DDD</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-cyan-500/20">
                <span className="text-xs text-gray-400 font-mono block">Delivery Cycle</span>
                <span className="text-sm font-mono font-bold text-cyan-400">CI/CD Continuous Delivery</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Clean Architecture Blueprint Stack */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="space-y-6 mb-16"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-xl md:text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-400" />
            <span>Clean Architecture Blueprint</span>
          </h3>
          <span className="text-xs font-mono text-gray-500 hidden sm:inline">
            // Domain-Driven & Dependency Inversion
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARCHITECTURE_LAYERS.map((layer, idx) => (
            <motion.div
              key={layer.layer}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-xl border ${layer.border} bg-[#040e07] hover:${layer.bg} transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <layer.icon className={`w-5 h-5 ${layer.color}`} />
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Layer {idx + 1}</span>
                </div>
                <h4 className={`text-base font-bold font-mono ${layer.color} mb-2`}>{layer.layer}</h4>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">{layer.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Contract Compliant</span>
                <Check className={`w-3.5 h-3.5 ${layer.color}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Core Engineering Pillars */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CORE_PILLARS.map((pillar, idx) => (
          <div key={pillar.title} className="p-5 rounded-xl bg-black/50 border border-gray-800 hover:border-green-500/40 transition-all">
            <pillar.icon className="w-5 h-5 text-green-400 mb-3" />
            <h4 className="text-sm font-bold font-mono text-white mb-2">{pillar.title}</h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
