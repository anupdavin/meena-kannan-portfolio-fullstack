import { useState, useMemo } from 'react'
import {
  Globe,
  Copy,
  Check,
  Server,
  Zap,
  Activity,
  Layers,
  Flame
} from 'lucide-react'
import { EDGE_CDN_STRATEGIES, type EdgeCdnStrategy, type EdgePopNode } from '@/data/edgeCdnCaching'

export default function EdgeCdnSandbox() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(EDGE_CDN_STRATEGIES[0].id)
  const [selectedTag, setSelectedTag] = useState<string>(EDGE_CDN_STRATEGIES[0].surrogateKeys[0]?.tag || 'tenant-nike-pricing')
  const [customTagInput, setCustomTagInput] = useState<string>('tenant-nike-pricing')
  const [popStatusList, setPopStatusList] = useState<EdgePopNode[]>(EDGE_CDN_STRATEGIES[0].pops)
  const [isPurging, setIsPurging] = useState<boolean>(false)
  const [purgeEventLog, setPurgeEventLog] = useState<string | null>(null)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  const currentStrategy: EdgeCdnStrategy = useMemo(() => {
    return EDGE_CDN_STRATEGIES.find(s => s.id === selectedStrategyId) || EDGE_CDN_STRATEGIES[0]
  }, [selectedStrategyId])

  const handleSelectStrategy = (id: string) => {
    setSelectedStrategyId(id)
    const strat = EDGE_CDN_STRATEGIES.find(s => s.id === id) || EDGE_CDN_STRATEGIES[0]
    setPopStatusList(strat.pops)
    const initialTag = strat.surrogateKeys[0]?.tag || 'cache-tag-01'
    setSelectedTag(initialTag)
    setCustomTagInput(initialTag)
    setPurgeEventLog(null)
  }

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag)
    setCustomTagInput(tag)
  }

  // Simulate Instant Global Cache Invalidation
  const handleExecutePurge = () => {
    const targetTag = customTagInput.trim() || selectedTag
    setIsPurging(true)
    setPurgeEventLog(`Dispatching API purge for surrogate key "${targetTag}" across 300+ global edge PoPs...`)

    // Step 1: Set all PoPs to purged
    setPopStatusList(prev => prev.map(p => ({ ...p, status: 'purged' })))

    // Step 2: Revalidating after 400ms
    setTimeout(() => {
      setPopStatusList(prev => prev.map(p => ({ ...p, status: 'stale-revalidating' })))
      setPurgeEventLog(`Global PoPs invalidated in 94ms. Background revalidation active for "${targetTag}".`)
    }, 400)

    // Step 3: Fresh cache restored after 1100ms
    setTimeout(() => {
      setPopStatusList(prev => prev.map(p => ({ ...p, status: 'hit' })))
      setIsPurging(false)
      setPurgeEventLog(`Cache convergence complete in 128ms. All 5 global regions serving fresh objects (98.4% offload).`)
    }, 1100)
  }

  const handleCopyRfc = () => {
    const rfcMarkdown = [
      `# Edge CDN Caching & Invalidation RFC: ${currentStrategy.name}`,
      '',
      `**Strategy:** ${currentStrategy.name} (${currentStrategy.subtitle})`,
      `**Core Paradigm:** ${currentStrategy.strategyName}`,
      `**Cache Policy Header:** \`${currentStrategy.cachePolicyHeader}\``,
      `**Purge Latency Target:** ${currentStrategy.purgeLatencyTarget}`,
      `**Origin Offload Ratio:** ${currentStrategy.originOffloadPct}%`,
      `**Thundering Herd Defense:** ${currentStrategy.stampedeProtection}`,
      `**Governing Architecture Decision:** ${currentStrategy.governingAdr}`,
      '',
      '## Global Edge PoP Nodes',
      '| PoP ID | Location | Region | Hit Ratio % | Edge Latency | Cached Objects | Status |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
      ...popStatusList.map(p =>
        `| \`${p.id}\` | ${p.city} | ${p.region} | ${p.hitRatioPct}% | ${p.edgeLatencyMs}ms | ${p.cachedObjects.toLocaleString()} | **${p.status.toUpperCase()}** |`
      ),
      '',
      '## Surrogate Key Tags & Invalidation Scopes',
      ...currentStrategy.surrogateKeys.map(k =>
        `- \`${k.tag}\` (${k.scope}): ${k.description} [Path: \`${k.resourcePath}\`]`
      ),
      '',
      '## Production Use Case & Workload Profile',
      `- System: ${currentStrategy.productionUseCase.system}`,
      `- Entity: ${currentStrategy.productionUseCase.entity}`,
      `- Workload: ${currentStrategy.productionUseCase.workload}`,
      `- Justification: ${currentStrategy.productionUseCase.justification}`,
      '',
      '## Architectural Trade-Offs',
      '### Advantages',
      ...currentStrategy.tradeoffs.pros.map(p => `- ${p}`),
      '### Inherent Trade-Offs & Mitigations',
      ...currentStrategy.tradeoffs.cons.map(c => `- ${c}`),
      '',
      '## Reference Edge Proxy Implementation',
      '```typescript',
      currentStrategy.edgeCodeSnippet,
      '```',
      '',
      '---',
      '*Authored by Meena Kannan, Principal Solutions Architect*'
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown).then(() => {
      setCopiedRfc(true)
      setTimeout(() => setCopiedRfc(false), 2000)
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentStrategy.edgeCodeSnippet).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  return (
    <div className="specular-card p-6 md:p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 font-sans shadow-2xl relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-800/80 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>cdn@meena-edge:~/caching#</span>
            <span className="text-neutral-500 font-mono text-[11px]">[Edge CDN PoP Mesh]</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Edge CDN Caching & Stale-While-Revalidate Sandbox</span>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              ADR-004 & ADR-005
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
            Simulate surrogate-key cache invalidations, RFC 5861 stale-while-revalidate background fetches, collapsed forwarding mutexes, and Origin Shield offload efficiency across 300+ global edge PoPs.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleCopyRfc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-700/80 text-neutral-200 hover:text-white hover:border-cyan-500 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Export full architecture RFC markdown"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copiedRfc ? 'RFC Copied!' : 'Copy CDN RFC'}</span>
          </button>
        </div>
      </div>

      {/* Strategy Selector Tabs */}
      <div className="pt-6 relative z-10">
        <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
          <span>Select Edge Caching Architecture Tier:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {EDGE_CDN_STRATEGIES.map(strat => {
            const isSelected = strat.id === selectedStrategyId
            return (
              <button
                key={strat.id}
                onClick={() => handleSelectStrategy(strat.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all text-xs font-mono ${
                  isSelected
                    ? 'bg-neutral-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                } focus-visible:ring-2 focus-visible:ring-cyan-400`}
              >
                <span className="font-semibold text-neutral-200">{strat.name}</span>
                <span className="text-[10px] text-neutral-400 truncate mt-0.5">{strat.subtitle}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Purge Event Notification Banner */}
      {purgeEventLog && (
        <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono text-cyan-300 flex items-center justify-between gap-3 relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{purgeEventLog}</span>
          </div>
          <button
            onClick={() => setPurgeEventLog(null)}
            className="text-[11px] text-cyan-400/80 hover:text-cyan-200 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
        {/* Left Column: Global Edge PoP Status & Invalidation Trigger (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Global PoP Nodes Topology */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  Global Edge PoPs (300+ Edge Locations)
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                Avg Latency: &lt; 3.2ms
              </span>
            </div>

            {/* PoP Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popStatusList.map((pop) => {
                let statusBadge = (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    CACHE HIT
                  </span>
                )
                if (pop.status === 'purged') {
                  statusBadge = (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
                      PURGED
                    </span>
                  )
                } else if (pop.status === 'stale-revalidating') {
                  statusBadge = (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      REVALIDATING
                    </span>
                  )
                }

                return (
                  <div
                    key={pop.id}
                    className={`p-3 rounded-lg border transition-all text-xs font-mono ${
                      pop.status === 'purged'
                        ? 'bg-rose-950/20 border-rose-600/60'
                        : pop.status === 'stale-revalidating'
                        ? 'bg-amber-950/20 border-amber-600/60'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${pop.status === 'hit' ? 'bg-emerald-400' : pop.status === 'purged' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                        <span className="font-semibold text-neutral-100">{pop.city}</span>
                      </div>
                      {statusBadge}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-850 text-[10px] text-neutral-400">
                      <div>
                        <span className="block text-neutral-500">Hit Ratio:</span>
                        <span className="text-cyan-300 font-semibold tabular-nums">{pop.hitRatioPct}%</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Latency:</span>
                        <span className="text-neutral-200 font-semibold tabular-nums">{pop.edgeLatencyMs}ms</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Cached:</span>
                        <span className="text-neutral-200 font-semibold tabular-nums">{Math.round(pop.cachedObjects / 1000)}k</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Performance Summary Strip */}
            <div className="mt-4 pt-3 border-t border-neutral-850 grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Origin Offload</span>
                <span className="text-cyan-400 font-bold text-sm tabular-nums">{currentStrategy.originOffloadPct}%</span>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Purge Propagation</span>
                <span className="text-emerald-400 font-bold text-sm tabular-nums">&lt; 150ms</span>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">P99 Latency Delta</span>
                <span className="text-purple-400 font-bold text-sm tabular-nums">3.2ms vs 180ms</span>
              </div>
            </div>
          </div>

          {/* Interactive Cache-Tag Invalidation Dispatcher */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-neutral-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Instant Surrogate-Key Cache Invalidation:</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">API Purge Simulation</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Enter surrogate key tag (e.g. tenant-nike-pricing, sku-8812)"
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700/80 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
              <button
                onClick={handleExecutePurge}
                disabled={isPurging}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isPurging ? 'Purging PoPs...' : 'Purge Global Tag'}</span>
              </button>
            </div>

            {/* Quick Preset Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] font-mono text-neutral-500">Preset Tags:</span>
              {currentStrategy.surrogateKeys.map((record) => (
                <button
                  key={record.tag}
                  onClick={() => handleSelectTag(record.tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedTag === record.tag
                      ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
                      : 'bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  {record.tag}
                </button>
              ))}
            </div>

            {/* Invalidation Header Specs */}
            <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
              <div className="text-[10px] text-neutral-500 uppercase mb-1">Response Header Injected at Origin:</div>
              <div className="text-cyan-300 bg-neutral-900 px-2 py-1 rounded text-[11px] overflow-x-auto">
                {currentStrategy.cachePolicyHeader}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SWR Flow Timeline & Edge Worker Code (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Stale-While-Revalidate Flow Timeline */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  RFC 5861 Non-Blocking Flow (SWR)
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Zero-Wait</span>
            </div>

            {/* 3 Step Flow Diagram */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-1">
                  <span className="font-semibold text-cyan-400">Step 1: Visitor A Arrives</span>
                  <span className="text-emerald-400 font-bold">2.8ms Delivery</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Object expired (Age: 75s &gt; max-age: 60s). PoP delivers stale cached copy instantly without blocking user.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-1">
                  <span className="font-semibold text-amber-400">Step 2: Background Revalidation</span>
                  <span className="text-neutral-500 font-mono">140ms Origin Fetch</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  PoP dispatches async worker thread to origin microservice. Mutex lock collapses parallel misses into 1 request.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-1">
                  <span className="font-semibold text-emerald-400">Step 3: Visitor B Arrives</span>
                  <span className="text-emerald-400 font-bold">Fresh Cache (Age: 0s)</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Subsequent requests receive fresh cached copy. 100% of human visitors experience sub-4ms response latencies.
                </p>
              </div>
            </div>
          </div>

          {/* Reference Edge Code Inspector */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-neutral-200">
                Edge Code Specification (V8 / VCL)
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-cyan-400 transition-colors"
                title="Copy reference edge worker code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-[11px] font-mono text-cyan-300/90 overflow-x-auto leading-relaxed flex-1 max-h-[220px]">
              <code>{currentStrategy.edgeCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Production System Context & Architectural Invariants */}
      <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 text-xs">
          <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold mb-1">
            Production Workload Profile
          </div>
          <div className="text-neutral-200 font-medium mb-1">{currentStrategy.productionUseCase.system}</div>
          <div className="text-neutral-400 text-[11px] leading-relaxed mb-2">
            <strong>Target Entity:</strong> {currentStrategy.productionUseCase.entity} | <strong>Workload:</strong> {currentStrategy.productionUseCase.workload}
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            "{currentStrategy.productionUseCase.justification}"
          </p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 text-xs">
          <div className="text-[11px] font-mono text-neutral-400 uppercase font-semibold mb-1">
            Edge Invariants & Resilience Guardrails
          </div>
          <div className="text-[11px] text-neutral-300 mb-1">
            <strong>Purge Target:</strong> {currentStrategy.purgeLatencyTarget}
          </div>
          <div className="text-[11px] text-neutral-300 mb-1">
            <strong>Thundering Herd Guard:</strong> {currentStrategy.stampedeProtection}
          </div>
          <div className="text-[11px] text-neutral-400">
            <strong>Governing ADR:</strong> {currentStrategy.governingAdr}
          </div>
        </div>
      </div>
    </div>
  )
}
