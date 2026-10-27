import { motion } from 'framer-motion'
import { 
  Network, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Download, 
  Activity, 
  GitBranch
} from 'lucide-react'
import ByteByteGoDiagram from '@/components/architecture/ByteByteGoDiagram'
import ByteByteGoAiCodex from '@/components/architecture/ByteByteGoAiCodex'
import AdrExplorer from '@/components/architecture/AdrExplorer'
import TradeoffMatrix from '@/components/architecture/TradeoffMatrix'

export default function ArchitectureLab() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* 1. Terminal Section Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 font-mono text-xs shadow-inner">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>DISTRIBUTED TOPOLOGY LAB | INTERACTIVE EXECUTION</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                SYSTEM DESIGN & DISTRIBUTED TOPOLOGY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-editorial text-white tracking-tight">
              ByteByteGo Interactive Architecture Lab
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 font-sans mt-2 max-w-3xl leading-relaxed">
              Explore 4 production-grade distributed architectures with live orthogonal packet routing, 
              6-step sequential transaction flows, chaos fault injection, and instant SVG/JSON blueprint exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Live SVG Packets</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chaos Resilience</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>1-Click SVG Export</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Flagship Workbench */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-slate-800 bg-[#090e18]/90 shadow-2xl overflow-hidden"
      >
        <ByteByteGoDiagram 
          systemId="saas-platform" 
          variant="workbench" 
          allowSystemSwitch={true}
        />
      </motion.div>

      {/* 2.5. ByteByteGo AI Architecture Codex (Interactive Infographic) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <ByteByteGoAiCodex />
      </motion.div>

      {/* 2.6. Production Architectural Decision Records (ADR) Explorer */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <AdrExplorer />
      </motion.div>

      {/* 2.7. Architectural Trade-Off & Evaluation Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TradeoffMatrix />
      </motion.div>

      {/* 3. Architectural Design Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Network className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold font-editorial text-white mb-1">
            Zero-Trust Ingress & mTLS
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Edge termination via Envoy & Kong with cryptographically signed tokens and mutual TLS workload verification.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold font-editorial text-white mb-1">
            Distributed Idempotency
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Atomic Redis leases and UUIDv7 idempotency keys guarantee zero double-spends and reliable retry safety under network partitions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <GitBranch className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold font-editorial text-white mb-1">
            Event-Driven CQRS & CDC
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Transactional outbox pattern tailed by Debezium into Kafka partitions to maintain sub-50ms read projection freshness.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold font-editorial text-white mb-1">
            Chaos Fault Tolerance
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Circuit breakers, bulkheads, and automated read replica promotions keep p99 latency capped during cascading node outages.
          </p>
        </div>
      </div>
    </div>
  )
}
