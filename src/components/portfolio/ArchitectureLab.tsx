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
  Globe,
  Globe2,
  GitCommit,
  Radio,
  ShieldAlert,
  Database,
  CloudLightning,
  GitFork,
  GitMerge,
  History,
  AlertOctagon,
  Lock,
  Scale,
  X
} from 'lucide-react'
import ByteByteGoDiagram from '@/components/architecture/ByteByteGoDiagram'
import ByteByteGoAiCodex from '@/components/architecture/ByteByteGoAiCodex'
import AdrExplorer from '@/components/architecture/AdrExplorer'
import TradeoffMatrix from '@/components/architecture/TradeoffMatrix'
import ArchitectureEvolutionDiff from '@/components/architecture/ArchitectureEvolutionDiff'
import ChaosResilienceMatrix from '@/components/architecture/ChaosResilienceMatrix'
import ApiGatewayPlayground from '@/components/architecture/ApiGatewayPlayground'
import DistributedTraceInspector from '@/components/architecture/DistributedTraceInspector'
import KafkaStreamMonitor from '@/components/architecture/KafkaStreamMonitor'
import RateLimiterSandbox from '@/components/architecture/RateLimiterSandbox'
import MultiRegionReplicationSandbox from '@/components/architecture/MultiRegionReplicationSandbox'
import DatabaseShardingSandbox from '@/components/architecture/DatabaseShardingSandbox'
import EdgeCdnSandbox from '@/components/architecture/EdgeCdnSandbox'
import CircuitBreakerSandbox from '@/components/architecture/CircuitBreakerSandbox'
import DistributedConcurrencySandbox from '@/components/architecture/DistributedConcurrencySandbox'
import RaftConsensusSandbox from '@/components/architecture/RaftConsensusSandbox'
import VectorSearchSandbox from '@/components/architecture/VectorSearchSandbox'
import TrafficPrioritySandbox from '@/components/architecture/TrafficPrioritySandbox'
import DistributedSagasSandbox from '@/components/architecture/DistributedSagasSandbox'
import DistributedCacheSandbox from '@/components/architecture/DistributedCacheSandbox'
import EventSourcingSandbox from '@/components/architecture/EventSourcingSandbox'
import DlqRetrySandbox from '@/components/architecture/DlqRetrySandbox'
import IdempotencySandbox from '@/components/architecture/IdempotencySandbox'
import { AtomicCommitSandbox } from '@/components/architecture/AtomicCommitSandbox'
import { ARCHITECTURE_SYSTEMS } from '@/data/architectureSystems'
import { ARCHITECTURAL_DECISIONS } from '@/data/architecturalDecisions'
import { ARCHITECTURAL_TRADEOFFS } from '@/data/architecturalTradeoffs'
import { ARCHITECTURE_EVOLUTIONS } from '@/data/architectureEvolutions'
import { CHAOS_DRILLS } from '@/data/chaosDrills'
import { GATEWAY_ROUTES } from '@/data/gatewayRoutes'
import { DISTRIBUTED_TRACES } from '@/data/distributedTraces'
import { KAFKA_TOPIC_STREAMS } from '@/data/kafkaStreams'
import { RATE_LIMITING_ALGORITHMS } from '@/data/rateLimitingAlgorithms'
import { MULTI_REGION_STRATEGIES } from '@/data/multiRegionReplication'
import { DATABASE_SHARDING_STRATEGIES } from '@/data/databaseSharding'
import { EDGE_CDN_STRATEGIES } from '@/data/edgeCdnCaching'
import { CIRCUIT_BREAKER_PATTERNS } from '@/data/circuitBreakers'
import { CONCURRENCY_MODELS } from '@/data/distributedConcurrency'
import { CONSENSUS_MODELS } from '@/data/raftConsensus'
import { VECTOR_SEARCH_MODELS } from '@/data/vectorSearch'
import { TRAFFIC_PRIORITY_MODELS } from '@/data/trafficPriority'
import { DISTRIBUTED_SAGA_MODELS } from '@/data/distributedSagas'
import { DISTRIBUTED_CACHE_MODELS } from '@/data/distributedCache'
import { EVENT_SOURCING_MODELS } from '@/data/eventSourcing'
import { DLQ_RETRY_MODELS } from '@/data/dlqRetryModels'
import { IDEMPOTENCY_MODELS } from '@/data/idempotencyModels'
import { ATOMIC_COMMIT_PARADIGMS } from '@/data/atomicCommitModels'

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
        gateway: 5,
        traces: 5,
        kafka: 5,
        ratelimit: 5,
        multiregion: 5,
        sharding: 5,
        cdn: 5,
        circuitbreaker: 5,
        concurrency: 5,
        raft: 5,
        vector: 5,
        priority: 5,
        sagas: 5,
        cache: 5,
        eventsourcing: 5,
        dlq: 5,
        idempotency: 5,
        atomiccommit: 5,
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

    const gatewayCount = GATEWAY_ROUTES.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.routePath.toLowerCase().includes(q) ||
      r.systemName.toLowerCase().includes(q) ||
      r.upstreamService.toLowerCase().includes(q) ||
      r.protocol.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.governingAdr.toLowerCase().includes(q)
    ).length

    const traceCount = DISTRIBUTED_TRACES.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.rootEndpoint.toLowerCase().includes(q) ||
      t.systemName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.criticalBottleneck.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.governingAdr.toLowerCase().includes(q)
    ).length

    const kafkaCount = KAFKA_TOPIC_STREAMS.filter(k => 
      k.title.toLowerCase().includes(q) ||
      k.topicId.toLowerCase().includes(q) ||
      k.systemName.toLowerCase().includes(q) ||
      k.category.toLowerCase().includes(q) ||
      k.summary.toLowerCase().includes(q) ||
      k.governingAdr.toLowerCase().includes(q)
    ).length

    const ratelimitCount = RATE_LIMITING_ALGORITHMS.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.paradigm.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.governingAdr.toLowerCase().includes(q) ||
      r.productionUseCase.system.toLowerCase().includes(q)
    ).length

    const multiregionCount = MULTI_REGION_STRATEGIES.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.strategyName.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.topology.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.governingAdr.toLowerCase().includes(q) ||
      m.productionUseCase.system.toLowerCase().includes(q)
    ).length

    const shardingCount = DATABASE_SHARDING_STRATEGIES.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.strategyName.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.partitionAlgorithm.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.governingAdr.toLowerCase().includes(q) ||
      s.productionUseCase.system.toLowerCase().includes(q)
    ).length

    const cdnCount = EDGE_CDN_STRATEGIES.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.strategyName.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.cachePolicyHeader.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.governingAdr.toLowerCase().includes(q) ||
      c.productionUseCase.system.toLowerCase().includes(q)
    ).length

    const circuitBreakerCount = CIRCUIT_BREAKER_PATTERNS.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.paradigm.toLowerCase().includes(q) ||
      b.badge.toLowerCase().includes(q) ||
      b.failureThreshold.toLowerCase().includes(q) ||
      b.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const concurrencyCount = CONCURRENCY_MODELS.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.paradigm.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q) ||
      c.deadlockStrategy.toLowerCase().includes(q) ||
      c.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const raftCount = CONSENSUS_MODELS.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.paradigm.toLowerCase().includes(q) ||
      r.badge.toLowerCase().includes(q) ||
      r.quorumRequirement.toLowerCase().includes(q) ||
      r.logConsistencyInvariant.toLowerCase().includes(q) ||
      r.splitBrainDefense.toLowerCase().includes(q) ||
      r.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const vectorCount = VECTOR_SEARCH_MODELS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.paradigm.toLowerCase().includes(q) ||
      v.badge.toLowerCase().includes(q) ||
      v.searchComplexity.toLowerCase().includes(q) ||
      v.memoryProfile.toLowerCase().includes(q) ||
      v.recallAccuracy.toLowerCase().includes(q) ||
      v.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const priorityCount = TRAFFIC_PRIORITY_MODELS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.paradigm.toLowerCase().includes(q) ||
      p.badge.toLowerCase().includes(q) ||
      p.algorithmComplexity.toLowerCase().includes(q) ||
      p.queueOverhead.toLowerCase().includes(q) ||
      p.throughputProfile.toLowerCase().includes(q) ||
      p.latencyGuarantee.toLowerCase().includes(q) ||
      p.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const sagasCount = DISTRIBUTED_SAGA_MODELS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.paradigm.toLowerCase().includes(q) ||
      s.badge.toLowerCase().includes(q) ||
      s.coordinationModel.toLowerCase().includes(q) ||
      s.couplingType.toLowerCase().includes(q) ||
      s.faultRecoveryStyle.toLowerCase().includes(q) ||
      s.isolationGuarantee.toLowerCase().includes(q) ||
      s.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const cacheCount = DISTRIBUTED_CACHE_MODELS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.paradigm.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q) ||
      c.algorithmFormula.toLowerCase().includes(q) ||
      c.p99Latency.toLowerCase().includes(q) ||
      c.originLoadReduction.toLowerCase().includes(q) ||
      c.memoryFootprint.toLowerCase().includes(q) ||
      c.concurrencyProtection.toLowerCase().includes(q) ||
      c.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const eventSourcingCount = EVENT_SOURCING_MODELS.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.paradigm.toLowerCase().includes(q) ||
      e.badge.toLowerCase().includes(q) ||
      e.algorithmFormula.toLowerCase().includes(q) ||
      e.replayEfficiency.toLowerCase().includes(q) ||
      e.storageEfficiency.toLowerCase().includes(q) ||
      e.concurrencyProtection.toLowerCase().includes(q) ||
      e.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const dlqCount = DLQ_RETRY_MODELS.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.paradigm.toLowerCase().includes(q) ||
      d.badge.toLowerCase().includes(q) ||
      d.algorithmFormula.toLowerCase().includes(q) ||
      d.recoveryLatency.toLowerCase().includes(q) ||
      d.poisonPillIsolation.toLowerCase().includes(q) ||
      d.headOfLineBlockingDefense.toLowerCase().includes(q) ||
      d.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const idempotencyCount = IDEMPOTENCY_MODELS.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q) ||
      i.paradigm.toLowerCase().includes(q) ||
      i.badge.toLowerCase().includes(q) ||
      i.algorithmFormula.toLowerCase().includes(q) ||
      i.dedupLatency.toLowerCase().includes(q) ||
      i.doubleExecutionDefense.toLowerCase().includes(q) ||
      i.storageModel.toLowerCase().includes(q) ||
      i.architecturalInvariant.toLowerCase().includes(q)
    ).length

    const atomicCommitCount = ATOMIC_COMMIT_PARADIGMS.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.blockingNature.toLowerCase().includes(q) ||
      a.recoveryGuarantee.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tradeOffSummary.toLowerCase().includes(q)
    ).length

    return {
      total: workbenchCount + aiCount + adrCount + tradeoffCount + evolutionCount + chaosCount + gatewayCount + traceCount + kafkaCount + ratelimitCount + multiregionCount + shardingCount + cdnCount + circuitBreakerCount + concurrencyCount + raftCount + vectorCount + priorityCount + sagasCount + cacheCount + eventSourcingCount + dlqCount + idempotencyCount + atomicCommitCount,
      workbench: workbenchCount,
      aiCodex: aiCount,
      adr: adrCount,
      tradeoffs: tradeoffCount,
      evolutions: evolutionCount,
      drills: chaosCount,
      gateway: gatewayCount,
      traces: traceCount,
      kafka: kafkaCount,
      ratelimit: ratelimitCount,
      multiregion: multiregionCount,
      sharding: shardingCount,
      cdn: cdnCount,
      circuitbreaker: circuitBreakerCount,
      concurrency: concurrencyCount,
      raft: raftCount,
      vector: vectorCount,
      priority: priorityCount,
      sagas: sagasCount,
      cache: cacheCount,
      eventsourcing: eventSourcingCount,
      dlq: dlqCount,
      idempotency: idempotencyCount,
      atomiccommit: atomicCommitCount,
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
          <a 
            href="#architecture-api-gateway"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.gateway > 0
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:text-blue-400 text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>API Gateway ({matchStats.gateway})</span>
          </a>
          <a 
            href="#architecture-distributed-tracing"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.traces > 0
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 text-slate-300'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Distributed Traces ({matchStats.traces})</span>
          </a>
          <a 
            href="#architecture-event-streams"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.kafka > 0
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Event Streams ({matchStats.kafka})</span>
          </a>
          <a 
            href="#architecture-rate-limiter"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.ratelimit > 0
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rate Limiter ({matchStats.ratelimit})</span>
          </a>
          <a 
            href="#architecture-multi-region"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.multiregion > 0
                ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-sky-500/50 hover:text-sky-400 text-slate-300'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Region ({matchStats.multiregion})</span>
          </a>
          <a 
            href="#architecture-database-sharding"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.sharding > 0
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Sharding ({matchStats.sharding})</span>
          </a>
          <a 
            href="#architecture-edge-cdn"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.cdn > 0
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
            <span>Edge CDN ({matchStats.cdn})</span>
          </a>
          <a 
            href="#architecture-circuit-breaker"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.circuitbreaker > 0
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Circuit Breakers ({matchStats.circuitbreaker})</span>
          </a>
          <a 
            href="#architecture-distributed-concurrency"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.concurrency > 0
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 text-slate-300'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            <span>Concurrency &amp; Deadlocks ({matchStats.concurrency})</span>
          </a>
          <a 
            href="#architecture-raft-consensus"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.raft > 0
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Raft Consensus ({matchStats.raft})</span>
          </a>
          <a 
            href="#architecture-vector-search"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.vector > 0
                ? 'bg-teal-500/10 border-teal-500/50 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:text-teal-400 text-slate-300'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-teal-400" />
            <span>Vector Search ({matchStats.vector})</span>
          </a>
          <a 
            href="#architecture-traffic-priority"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.priority > 0
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traffic Priority ({matchStats.priority})</span>
          </a>
          <a 
            href="#architecture-distributed-sagas"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.sagas > 0
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sagas &amp; Compensation ({matchStats.sagas})</span>
          </a>
          <a 
            href="#architecture-distributed-cache"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.cache > 0
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cache Stampede ({matchStats.cache})</span>
          </a>
          <a 
            href="#architecture-event-sourcing"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.eventsourcing > 0
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:text-amber-400 text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Event Sourcing &amp; CQRS ({matchStats.eventsourcing})</span>
          </a>
          <a 
            href="#architecture-dlq-retry"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.dlq > 0
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-300'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>DLQ &amp; Retries ({matchStats.dlq})</span>
          </a>
          <a 
            href="#architecture-idempotency"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.idempotency > 0
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Idempotency Keys ({matchStats.idempotency})</span>
          </a>
          <a 
            href="#architecture-atomic-commit"
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              matchStats.isActive && matchStats.atomiccommit > 0
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>2PC vs Saga ({matchStats.atomiccommit})</span>
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

      {/* 2.10. Enterprise API Gateway & Ingress Routing Playground */}
      <motion.div
        id="architecture-api-gateway"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="scroll-mt-24"
      >
        <ApiGatewayPlayground />
      </motion.div>

      {/* 2.11. Distributed Tracing & OpenTelemetry Span Flamegraph */}
      <motion.div
        id="architecture-distributed-tracing"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="scroll-mt-24"
      >
        <DistributedTraceInspector />
      </motion.div>

      {/* 2.12. Kafka Event Stream & Partition Lag Monitor */}
      <motion.div
        id="architecture-event-streams"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="scroll-mt-24"
      >
        <KafkaStreamMonitor />
      </motion.div>

      {/* 2.13. Distributed Rate Limiting & Traffic Shaping Sandbox */}
      <motion.div
        id="architecture-rate-limiter"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="scroll-mt-24"
      >
        <RateLimiterSandbox />
      </motion.div>

      {/* 2.14. Multi-Region Database Replication & Conflict Resolution Simulator */}
      <motion.div
        id="architecture-multi-region"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="scroll-mt-24"
      >
        <MultiRegionReplicationSandbox />
      </motion.div>

      {/* 2.15. Database Sharding & Consistent Hashing Topology Playground */}
      <motion.div
        id="architecture-database-sharding"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="scroll-mt-24"
      >
        <DatabaseShardingSandbox />
      </motion.div>

      {/* 2.16. Edge CDN Caching & Stale-While-Revalidate Invalidation Sandbox */}
      <motion.div
        id="architecture-edge-cdn"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="scroll-mt-24"
      >
        <EdgeCdnSandbox />
      </motion.div>

      {/* 2.17. Distributed Circuit Breaker & Cascading Fault Mesh Sandbox */}
      <motion.div
        id="architecture-circuit-breaker"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="scroll-mt-24"
      >
        <CircuitBreakerSandbox />
      </motion.div>

      {/* 2.18. Distributed Deadlock Detection & 2PL vs OCC Concurrency Control Simulator */}
      <motion.div
        id="architecture-distributed-concurrency"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="scroll-mt-24"
      >
        <DistributedConcurrencySandbox />
      </motion.div>

      {/* 2.19. Distributed Consensus & Raft Leader Election State Machine */}
      <motion.div
        id="architecture-raft-consensus"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="scroll-mt-24"
      >
        <RaftConsensusSandbox />
      </motion.div>

      {/* 2.20. Distributed Sharded Vector Search & HNSW Indexing Sandbox */}
      <motion.div
        id="architecture-vector-search"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="scroll-mt-24"
      >
        <VectorSearchSandbox />
      </motion.div>

      {/* 2.21. Distributed Token-Bucket API Shaper & Bounded Priority Queuing */}
      <motion.div
        id="architecture-traffic-priority"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="scroll-mt-24"
      >
        <TrafficPrioritySandbox />
      </motion.div>

      {/* 2.22. Distributed Saga Orchestration vs Choreography & Compensation State Engine */}
      <motion.div
        id="architecture-distributed-sagas"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.95 }}
        className="scroll-mt-24"
      >
        <DistributedSagasSandbox />
      </motion.div>

      {/* 2.23. Distributed Cache Stampede & Multi-Tier Mutex Leasing Sandbox */}
      <motion.div
        id="architecture-distributed-cache"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="scroll-mt-24"
      >
        <DistributedCacheSandbox />
      </motion.div>

      {/* 2.24. Distributed Event Sourcing & CQRS Snapshotting Sandbox */}
      <motion.div
        id="architecture-event-sourcing"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.05 }}
        className="scroll-mt-24"
      >
        <EventSourcingSandbox />
      </motion.div>

      {/* 2.25. Distributed Dead-Letter Queue (DLQ) & Non-Blocking Retry Matrix Sandbox */}
      <motion.div
        id="architecture-dlq-retry"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.10 }}
        className="scroll-mt-24"
      >
        <DlqRetrySandbox />
      </motion.div>

      {/* 2.26. Distributed Idempotency Key & Two-Phase Ingress Committer Sandbox */}
      <motion.div
        id="architecture-idempotency"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.15 }}
        className="scroll-mt-24"
      >
        <IdempotencySandbox />
      </motion.div>

      {/* 2.27. Distributed Two-Phase Commit (2PC) vs Saga & Dual-Write Invariant Matrix Sandbox */}
      <motion.div
        id="architecture-atomic-commit"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.20 }}
        className="scroll-mt-24"
      >
        <AtomicCommitSandbox />
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
