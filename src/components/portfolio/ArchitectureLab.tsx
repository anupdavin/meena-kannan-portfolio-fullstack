import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Network, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Download, 
  Activity, 
  GitBranch,
  Bot,
  FileText,
  GitCompare,
  Sliders,
  Search,
  Flame,
  X
} from 'lucide-react'
import ByteByteGoDiagram from '@/components/architecture/ByteByteGoDiagram'
import ByteByteGoAiCodex from '@/components/architecture/ByteByteGoAiCodex'
import AdrExplorer from '@/components/architecture/AdrExplorer'
import TradeoffMatrix from '@/components/architecture/TradeoffMatrix'
import ArchitectureEvolutionDiff from '@/components/architecture/ArchitectureEvolutionDiff'
import ChaosResilienceMatrix from '@/components/architecture/ChaosResilienceMatrix'
import { ARCHITECTURE_SYSTEMS } from '@/data/architectureSystems'
import { ARCHITECTURAL_DECISIONS } from '@/data/architecturalDecisions'
import { ARCHITECTURAL_TRADEOFFS } from '@/data/architecturalTradeoffs'
import { ARCHITECTURE_EVOLUTIONS } from '@/data/architectureEvolutions'
import { CHAOS_DRILLS } from '@/data/chaosDrills'

const AI_TERMS_SUMMARY = [
  { id: 'agentic-ai', title: 'Agentic AI', text: 'Perception-action loop, DAG memory, tool execution, LangGraph' },
  { id: 'lrm', title: 'Large Reasoning Model (LRM)', text: 'Chain-of-thought, test-time compute, self-reflection, RLVR' },
  { id: 'vectordb', title: 'Vector Database', text: 'HNSW index, pgvector, nearest neighbor, dense embeddings' },
  { id: 'rag', title: 'Retrieval Augmented Generation (RAG)', text: 'BM25 lexical ranking, dense vector rerank, context isolation' },
  { id: 'mcp', title: 'Model Context Protocol (MCP)', text: 'JSON-RPC 2.0, SSE, stdio, decoupled tool host server' }
]

export default function ArchitectureLab() {
  const [searchQuery, setSearchQuery] = useState('')

  const matchStats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      return {
        total: 0,
        workbench: 5,
        aiCodex: 5,
        adr: 6,
        tradeoffs: 4,
        evolutions: 5,
        drills: 5,
        isActive: false
      }
    }

    const workbenchCount = Object.values(ARCHITECTURE_SYSTEMS).filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.nodes.some(n => 
        n.label.toLowerCase().includes(q) ||
        n.sublabel.toLowerCase().includes(q) ||
        n.techBadge.toLowerCase().includes(q) ||
        n.specs.technology.toLowerCase().includes(q)
      )
    ).length

    const aiCount = AI_TERMS_SUMMARY.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.text.toLowerCase().includes(q)
    ).length

    const adrCount = ARCHITECTURAL_DECISIONS.filter(a => 
      a.id.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.context.toLowerCase().includes(q) ||
      a.decision.toLowerCase().includes(q) ||
      a.pattern.toLowerCase().includes(q)
    ).length

    const tradeoffCount = ARCHITECTURAL_TRADEOFFS.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.options.some(o => o.name.toLowerCase().includes(q) || o.paradigm.toLowerCase().includes(q))
    ).length

    const evolutionCount = ARCHITECTURE_EVOLUTIONS.filter(e => 
      e.systemName.toLowerCase().includes(q) ||
      e.headline.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.legacyArchitecture.title.toLowerCase().includes(q) ||
      e.modernArchitecture.title.toLowerCase().includes(q)
    ).length

    const chaosCount = CHAOS_DRILLS.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.systemName.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.failureType.toLowerCase().includes(q) ||
      d.injectedFault.toLowerCase().includes(q) ||
      d.sreHypothesis.toLowerCase().includes(q) ||
      d.governingAdr.toLowerCase().includes(q)
    ).length

    return {
      total: workbenchCount + aiCount + adrCount + tradeoffCount + evolutionCount + chaosCount,
      workbench: workbenchCount,
      aiCodex: aiCount,
      adr: adrCount,
      tradeoffs: tradeoffCount,
      evolutions: evolutionCount,
      drills: chaosCount,
      isActive: true
    }
  }, [searchQuery])

  const QUICK_KEYWORDS = ['Kafka', 'Redis', 'Postgres', 'Java 21', 'MCP', 'RAG', 'Saga', 'Virtual Threads']
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

      {/* 1.5. Architecture Topology Fast-Jump Navigator & Live Search */}
      <div className="space-y-3 p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs shadow-xl">
        {/* Search Input Row & Preset Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture by keyword (e.g. Kafka, Redis, MCP, Postgres)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              aria-label="Filter architecture components by technology or pattern"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                aria-label="Clear architecture search filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Keywords */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
            <span className="text-[10px] uppercase text-slate-500 font-semibold shrink-0">Pills:</span>
            {QUICK_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => setSearchQuery(searchQuery.toLowerCase() === kw.toLowerCase() ? '' : kw)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all whitespace-nowrap cursor-pointer border ${
                  searchQuery.toLowerCase() === kw.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Banner (if active) */}
        {matchStats.isActive && (
          <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
            <span>
              Found <strong className="text-white">{matchStats.total}</strong> architecture patterns matching "{searchQuery}"
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* 4 Fast Jump Buttons with live match counts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-slate-400 px-1 py-1 uppercase text-[10px] tracking-wider font-semibold">
            Fast Jump:
          </span>
          <a 
            href="#architecture-ai-codex"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.aiCodex > 0
                ? 'bg-teal-500/10 border-teal-500/50 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:text-teal-400 text-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Systems Codex ({matchStats.aiCodex})</span>
          </a>
          <a 
            href="#architecture-workbench"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.workbench > 0
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Distributed Workbench ({matchStats.workbench})</span>
          </a>
          <a 
            href="#architecture-adr-ledger"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.adr > 0
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>ADR Governance Ledger ({matchStats.adr})</span>
          </a>
          <a 
            href="#architecture-tradeoff-matrix"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.tradeoffs > 0
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:text-amber-400 text-slate-300'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision Trade-Offs ({matchStats.tradeoffs})</span>
          </a>
          <a 
            href="#architecture-evolution-diff"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.evolutions > 0
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>Evolution Diff ({matchStats.evolutions})</span>
          </a>
          <a 
            href="#architecture-chaos-matrix"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.drills > 0
                ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-orange-500/50 hover:text-orange-400 text-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Chaos Drills ({matchStats.drills})</span>
          </a>
        </div>
      </div>

      {/* 2. Flagship ByteByteGo AI Architecture Codex (Interactive Infographic) */}
      <motion.div
        id="architecture-ai-codex"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="scroll-mt-24"
      >
        <ByteByteGoAiCodex />
      </motion.div>

      {/* 2.5. Interactive Flagship Workbench (Saga / Outbox / Java 21) */}
      <motion.div
        id="architecture-workbench"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-slate-800 bg-[#090e18]/90 shadow-2xl overflow-hidden scroll-mt-24"
      >
        <ByteByteGoDiagram 
          systemId="saas-platform" 
          variant="workbench" 
          allowSystemSwitch={true}
        />
      </motion.div>

      {/* 2.6. Production Architectural Decision Records (ADR) Explorer */}
      <motion.div
        id="architecture-adr-ledger"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="scroll-mt-24"
      >
        <AdrExplorer />
      </motion.div>

      {/* 2.7. Architectural Trade-Off & Evaluation Matrix */}
      <motion.div
        id="architecture-tradeoff-matrix"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="scroll-mt-24"
      >
        <TradeoffMatrix />
      </motion.div>

      {/* 2.8. Architecture Evolution & Monolith-to-Mesh Comparison Diff */}
      <motion.div
        id="architecture-evolution-diff"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="scroll-mt-24"
      >
        <ArchitectureEvolutionDiff />
      </motion.div>

      {/* 2.9. Enterprise SLA & Chaos Engineering Drill Matrix */}
      <motion.div
        id="architecture-chaos-matrix"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="scroll-mt-24"
      >
        <ChaosResilienceMatrix />
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
