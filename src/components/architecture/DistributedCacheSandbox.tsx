import { useState, useId, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Activity,
  Database,
  Layers,
  Flame
} from 'lucide-react'
import { DISTRIBUTED_CACHE_MODELS, type CacheCoherenceModel } from '@/data/distributedCache'

export default function DistributedCacheSandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('probabilistic-early-expiration-xfetch')
  const [simulatedRps, setSimulatedRps] = useState<number>(25000)
  const [isStampedeActive, setIsStampedeActive] = useState<boolean>(false)
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; msg: string }>>([])
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const activeModel = DISTRIBUTED_CACHE_MODELS.find(m => m.id === selectedModelId) || DISTRIBUTED_CACHE_MODELS[0]

  const appendLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) => {
    const time = new Date().toISOString().substring(11, 23)
    setEventLogs(prev => [...prev.slice(-25), { id: Math.random().toString(), time, level, msg }])
  }, [])

  const resetSandbox = useCallback((model: CacheCoherenceModel = activeModel) => {
    setIsStampedeActive(false)
    setEventLogs([
      {
        id: 'init-1',
        time: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        msg: `Initialized ${model.name} session. Cache hot-key "product:catalog:deals" armed with 60s TTL.`
      }
    ])
  }, [activeModel])

  useEffect(() => {
    resetSandbox(activeModel)
  }, [selectedModelId, resetSandbox, activeModel])

  // Trigger simulated cache stampede
  const triggerStampede = () => {
    setIsStampedeActive(true)
    appendLog('WARN', `STAMPEDE SURGE INJECTED: Hot key "product:catalog:deals" expired! ${simulatedRps.toLocaleString()} concurrent requests hitting edge simultaneously.`)

    setTimeout(() => {
      if (activeModel.id === 'probabilistic-early-expiration-xfetch') {
        appendLog('SUCCESS', 'XFetch Evaluation: Delta=42ms, Beta=1.0, Probability=94.2% -> Stochastic condition satisfied before hard TTL.')
        appendLog('INFO', 'Single background worker lease acquired. Asynchronous DB fetch dispatched in 1.4ms. All 25,000 readers served stale cache without blocking.')
        appendLog('SUCCESS', 'Atomic cache refresh complete. New expiry set +60s. Zero DB connection pool spikes registered.')
      } else if (activeModel.id === 'singleflight-request-coalescing') {
        appendLog('INFO', 'Singleflight Registry: Registered active flight for key "product:catalog:deals". Exactly 1 worker dispatched to PostgreSQL.')
        appendLog('SUCCESS', `${(simulatedRps - 1).toLocaleString()} parallel callers attached to in-flight CompletableFuture. Origin queries: 1. Coalesce ratio: 99.99%.`)
        appendLog('SUCCESS', 'Result returned in 3.6ms and multicasted to all waiting callers. Flight registry deregistered.')
      } else if (activeModel.id === 'redis-mutex-leasing-redlock') {
        appendLog('INFO', 'Redlock Contest: Node pod-42 acquired SETNX mutex lease with 5000ms TTL. Remaining pods enter exponential jitter spin-wait.')
        appendLog('INFO', 'Node pod-42 warms cache from DB in 11ms. Monotonic fencing token verified.')
        appendLog('SUCCESS', 'Distributed mutex safely released via atomic Lua script. Waiting pods poll warmed Redis cache in 1.8ms.')
      } else if (activeModel.id === 'multi-tier-l1-l2-caching') {
        appendLog('SUCCESS', `L1 Caffeine Near-Cache Hit: ${(simulatedRps * 0.95).toLocaleString()} requests served in-memory at sub-8 microseconds.`)
        appendLog('INFO', `L2 Redis Fallback: ${(simulatedRps * 0.05).toLocaleString()} requests served over TCP in 1.8ms. Zero DB origin queries.`)
        appendLog('SUCCESS', 'Multi-tier cache hierarchy absorbed 100% of the stampede without degrading database connection pools.')
      } else if (activeModel.id === 'cdc-wal-cache-invalidation') {
        appendLog('INFO', 'PostgreSQL COMMIT confirmed at WAL LSN 0/1A49B2. Zero network dual-write initiated by application.')
        appendLog('SUCCESS', 'Debezium CDC connector streamed table mutation event to Kafka topic with 4.2ms replication lag.')
        appendLog('SUCCESS', 'Cache invalidator consumer executed Redis DEL key in 1.2ms. Fresh cache-aside population guaranteed.')
      }
      setIsStampedeActive(false)
    }, 1200)
  }

  const copyRfcReport = () => {
    const text = `# Architectural RFC: ${activeModel.name}
**Paradigm:** ${activeModel.paradigm}
**Algorithm Formula:** \`${activeModel.algorithmFormula}\`
**Origin Load Reduction:** ${activeModel.originLoadReduction}
**P99 Latency SLA:** ${activeModel.p99Latency}
**Memory Footprint:** ${activeModel.memoryFootprint}
**Concurrency Protection:** ${activeModel.concurrencyProtection}
**Architectural Invariant:** ${activeModel.architecturalInvariant}

## Workflow Phases & Invariants
${activeModel.workflowPhases.map(p => `### ${p.name}
- Description: ${p.description}
- Invariant: ${p.invariants}
`).join('\n')}

## Production Metrics & Invariants
${Object.entries(activeModel.productionOutcomes).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

---
*Generated from Meena Kannan Full-Stack Architecture Lab (Distributed Cache Stampede & Coherence)*`

    navigator.clipboard.writeText(text)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const copyArchitectureJson = () => {
    const jsonStr = JSON.stringify(activeModel, null, 2)
    navigator.clipboard.writeText(jsonStr)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const modelSelectId = useId()
  const rpsSliderId = useId()

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#080d1a] p-4 sm:p-6 lg:p-8 space-y-6 shadow-2xl">
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
              DISTRIBUTED SYSTEMS ENGINE 20 | CACHE STAMPEDE & MUTEX
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Distributed Cache Stampede, Multi-Tier Coherence & Mutex Leasing Sandbox
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl font-sans mt-1">
            Evaluate 5 high-scale cache coherence architectures designed to protect mission-critical databases from thundering herds. Inspect probabilistic early expiration (XFetch), singleflight request coalescing, Redlock mutex leases, and PostgreSQL CDC invalidation.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyRfcReport}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            title="Copy Production RFC Spec in Markdown"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{copiedRfc ? 'RFC Copied!' : 'Copy Caching RFC'}</span>
          </button>

          <button
            onClick={copyArchitectureJson}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            title="Copy Architecture Data JSON"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Database className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedJson ? 'JSON Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      {/* 2. Model Selector Pills */}
      <div className="space-y-2">
        <label htmlFor={modelSelectId} className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Select Cache Stampede & Coherence Architecture:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2" id={modelSelectId}>
          {DISTRIBUTED_CACHE_MODELS.map((model) => {
            const isSelected = model.id === selectedModelId
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {model.badge}
                  </span>
                  {isSelected && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-2">
                  {model.name.split('(')[0]}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Primary Architecture Spec Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Mathematical Formula:</span>
          <span className="text-emerald-300 font-bold truncate block" title={activeModel.algorithmFormula}>
            {activeModel.algorithmFormula}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Origin Protection:</span>
          <span className="text-slate-200">{activeModel.originLoadReduction.split('(')[0]}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">P99 Latency SLA:</span>
          <span className="text-cyan-300 font-semibold">{activeModel.p99Latency.split('(')[0]}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Concurrency Guard:</span>
          <span className="text-amber-300 truncate block" title={activeModel.concurrencyProtection}>
            {activeModel.concurrencyProtection.split('guarantees')[0]}
          </span>
        </div>
      </div>

      {/* 4. Interactive Simulation Control Deck */}
      <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Surge Load Generator:</span>
              <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                {simulatedRps.toLocaleString()} Concurrent RPS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id={rpsSliderId}
                type="range"
                min="5000"
                max="50000"
                step="5000"
                value={simulatedRps}
                onChange={(e) => setSimulatedRps(Number(e.target.value))}
                className="w-48 sm:w-64 accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500">Flash-sale peak</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerStampede}
              disabled={isStampedeActive}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-md active:scale-[0.98]"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{isStampedeActive ? 'Simulating Surge...' : 'Trigger Stampede Surge'}</span>
            </button>

            <button
              onClick={() => resetSandbox()}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 5. Hierarchical Tier Comparison Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* L1 In-Memory Tier */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Tier 1: Process Memory</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                L1 Caffeine Near-Cache
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white tabular-nums">&lt; 8 μs</span>
              <span className="text-[10px] text-slate-400">In-Process Heap</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Zero network serialization or socket overhead. Bounded W-TinyLFU eviction strictly caps heap memory usage.
            </p>
          </div>

          {/* L2 Cluster Tier */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Tier 2: Distributed Memory</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                L2 Redis Cluster
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">1.8 ms</span>
              <span className="text-[10px] text-slate-400">Sub-2ms TCP Cluster</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Shared authoritative distributed state. High availability across multi-AZ shards with Redis Pub/Sub invalidations.
            </p>
          </div>

          {/* Origin Database Tier */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Tier 3: Origin Database</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PostgreSQL ACID
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">45 ms</span>
              <span className="text-[10px] text-slate-400">Disk IO &amp; Locks</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Protected by {activeModel.badge}. Receives strictly 1 coalesced query during stampede surges, preserving connection pools.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Technical Invariants & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Workflow Phases & Invariants */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold font-mono text-white">Coherence Phases & Invariants</h4>
          </div>

          <div className="space-y-2.5">
            {activeModel.workflowPhases.map((phase) => (
              <div key={phase.name} className={`p-3 rounded-lg border ${phase.color}`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>{phase.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                  {phase.description}
                </p>
                <div className="text-[11px] font-mono text-slate-400 flex items-start gap-1">
                  <span className="text-emerald-400 font-bold shrink-0">Invariant:</span>
                  <span>{phase.invariants}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold uppercase block mb-1">Architectural Invariant Guarantee:</span>
              <p className="text-slate-300 italic text-[11px] leading-relaxed">
                "{activeModel.architecturalInvariant}"
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Event Telemetry Stream */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold font-mono text-white">Live Cache Stampede Telemetry</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-tailing Coherence Event Stream</span>
            </div>

            <div className="p-3 rounded-lg bg-black/80 border border-slate-800 font-mono text-[11px] space-y-1.5 h-64 overflow-y-auto">
              {eventLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 select-none pt-[1px]">{log.time}</span>
                  <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold shrink-0 ${
                    log.level === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : log.level === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className={log.level === 'ERROR' ? 'text-rose-300' : log.level === 'WARN' ? 'text-amber-300' : 'text-slate-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Production Quantified Outcomes */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(activeModel.productionOutcomes).map(([k, v]) => (
              <div key={k} className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block truncate">{k}</span>
                <span className="text-emerald-300 font-bold text-[11px] block">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Syntax-Highlighted Code Blueprint */}
      <div className="rounded-xl border border-slate-800 bg-[#060a12] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b1220] border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-white font-bold">{activeModel.codeSnippet.filename}</span>
            <span className="text-slate-500">({activeModel.codeSnippet.language})</span>
          </div>
          <span className="text-slate-500 text-[10px]">Production Java 21 / Lua Stampede Protection Implementation</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
          <code>{activeModel.codeSnippet.code}</code>
        </pre>
      </div>
    </div>
  )
}
