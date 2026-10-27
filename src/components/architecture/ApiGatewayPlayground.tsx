import { useState, useMemo } from 'react'
import {
  Globe,
  Send,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  FileCode,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { GATEWAY_ROUTES, type GatewayRoute } from '@/data/gatewayRoutes'

export default function ApiGatewayPlayground() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(GATEWAY_ROUTES[0].id)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    GATEWAY_ROUTES.forEach(r => {
      r.filters.forEach(f => {
        initial[`${r.id}:${f.name}`] = f.activeByDefault
      })
    })
    return initial
  })
  const [isSending, setIsSending] = useState<boolean>(false)
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null)
  const [copiedEnvoy, setCopiedEnvoy] = useState<boolean>(false)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)

  const currentRoute: GatewayRoute = GATEWAY_ROUTES.find(r => r.id === selectedRouteId) || GATEWAY_ROUTES[0]

  const totalGatewayOverhead = useMemo(() => {
    return currentRoute.filters.reduce((acc, f) => {
      const isEnabled = activeFilters[`${currentRoute.id}:${f.name}`] ?? f.activeByDefault
      return acc + (isEnabled ? f.overheadMs : 0)
    }, 0)
  }, [currentRoute, activeFilters])

  const toggleFilter = (filterName: string) => {
    const key = `${currentRoute.id}:${filterName}`
    setActiveFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSendRequest = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const now = new Date()
      setLastExecutedAt(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
      )
    }, 450)
  }

  const handleResetFilters = () => {
    const reset: Record<string, boolean> = { ...activeFilters }
    currentRoute.filters.forEach(f => {
      reset[`${currentRoute.id}:${f.name}`] = f.activeByDefault
    })
    setActiveFilters(reset)
    setLastExecutedAt(null)
  }

  const handleCopyEnvoy = () => {
    navigator.clipboard.writeText(currentRoute.envoyConfigSnippet)
    setCopiedEnvoy(true)
    setTimeout(() => setCopiedEnvoy(false), 2000)
  }

  const handleCopyRfc = () => {
    const markdown = `# API GATEWAY INGRESS ROUTE SPECIFICATION
**Route ID:** ${currentRoute.id}
**Path:** ${currentRoute.method} ${currentRoute.routePath}
**Target System:** ${currentRoute.systemName}
**Upstream Service:** ${currentRoute.upstreamService}
**Protocol:** ${currentRoute.protocol}
**Rate Limit SLA:** ${currentRoute.rateLimitSla}
**Latency Target:** ${currentRoute.latencyTarget}
**Governing ADR:** ${currentRoute.governingAdr}

## 1. ARCHITECTURAL SUMMARY
${currentRoute.summary}

## 2. INGRESS FILTER PIPELINE
| Filter Name | Type | Overhead | Active | Description |
| :--- | :--- | :--- | :--- | :--- |
${currentRoute.filters.map(f => {
  const isEnabled = activeFilters[`${currentRoute.id}:${f.name}`] ?? f.activeByDefault
  return `| ${f.name} | ${f.type.toUpperCase()} | ${f.overheadMs.toFixed(1)}ms | ${isEnabled ? 'ENABLED' : 'DISABLED'} | ${f.description} |`
}).join('\n')}

**Total Filter Overhead:** ${totalGatewayOverhead.toFixed(1)}ms

## 3. SAMPLE INGRESS REQUEST
\`\`\`http
${currentRoute.method} ${currentRoute.routePath} HTTP/2
${Object.entries(currentRoute.sampleRequest.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}

${currentRoute.sampleRequest.bodySnippet || ''}
\`\`\`

## 4. UPSTREAM DISPATCH RESPONSE
\`\`\`http
HTTP/2 ${currentRoute.sampleResponse.statusCode} ${currentRoute.sampleResponse.statusText}
${Object.entries(currentRoute.sampleResponse.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}

${currentRoute.sampleResponse.bodySnippet}
\`\`\`

## 5. ENVOY CONFIGURATION
\`\`\`yaml
${currentRoute.envoyConfigSnippet}
\`\`\`
`
    navigator.clipboard.writeText(markdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  return (
    <div className="space-y-6 sm:space-y-8 rounded-2xl border border-slate-800 bg-[#070b12] p-4 sm:p-8 shadow-2xl">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>ZERO-TRUST INGRESS &amp; ENVOY API GATEWAY SANDBOX</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
            Enterprise API Gateway &amp; Ingress Routing Playground
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Simulate live ingress traffic through Envoy filter chains, SPIFFE peer certificate verification, 
            token bucket rate limiters, and JSON-RPC Model Context Protocol tool routing across all 5 architectures.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={handleCopyRfc}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            aria-label="Copy full Gateway RFC specification in Markdown"
          >
            {copiedRfc ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 font-bold">RFC Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Gateway RFC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Route Selector Tabs */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Select Ingress API Route &amp; Upstream Target (5 Architectures):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {GATEWAY_ROUTES.map((route, idx) => {
            const isSelected = route.id === selectedRouteId
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400'
                  }`}>
                    ROUTE 0{idx + 1}
                  </span>
                  <span className="px-1 py-0.5 rounded bg-black/60 border border-slate-800 text-amber-400 font-bold">
                    {route.method}
                  </span>
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold truncate ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {route.routePath}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                    {route.systemName.split(' ')[0]} {route.systemName.split(' ')[1]}
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">Target:</span>
                  <span className="text-cyan-400 font-bold tabular-nums">{route.latencyTarget.split(' ')[1]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Ingress Route Specification & Filter Pipeline Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 sm:p-6 rounded-xl bg-slate-950/90 border border-slate-800/90">
        {/* Left Column: Route Details & Filter Toggles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
              {currentRoute.method} {currentRoute.routePath}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Protocol: <strong className="text-slate-200">{currentRoute.protocol}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Governance: <strong className="text-slate-200">{currentRoute.governingAdr}</strong>
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold font-editorial text-white">
              {currentRoute.title}
            </h4>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Upstream Destination: <span className="text-emerald-400">{currentRoute.upstreamService}</span>
            </div>
          </div>

          <p className="text-xs font-sans text-slate-300 leading-relaxed">
            {currentRoute.summary}
          </p>

          {/* Filter Pipeline Toggles */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Envoy Filter Chain (Click to Toggle Policies):</span>
              </span>
              <span className="text-[11px] text-cyan-400">
                Gateway Filter Overhead: <strong className="tabular-nums">+{totalGatewayOverhead.toFixed(1)}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentRoute.filters.map(filter => {
                const isEnabled = activeFilters[`${currentRoute.id}:${filter.name}`] ?? filter.activeByDefault
                return (
                  <button
                    key={filter.name}
                    onClick={() => toggleFilter(filter.name)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isEnabled
                        ? 'bg-slate-900/90 border-cyan-500/40 text-slate-200 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                        {isEnabled ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 inline-block" />
                        )}
                        <span className={isEnabled ? 'text-white' : 'text-slate-400 line-through'}>
                          {filter.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-sans text-slate-400 leading-tight">
                        {filter.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pt-0.5">
                      {isEnabled ? (
                        <ToggleRight className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-600" />
                      )}
                      <span className="text-[9px] font-mono text-slate-500 mt-1 tabular-nums">
                        +{filter.overheadMs.toFixed(1)}ms
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Ingress Dispatch Controls */}
        <div className="space-y-4 lg:border-l lg:border-slate-800/80 lg:pl-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Verified Production Ingress SLA:
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Rate Limit Quota:</span>
                <span className="text-amber-400 font-bold tabular-nums">{currentRoute.rateLimitSla}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">P99 Latency Target:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{currentRoute.latencyTarget}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Edge Filter Overhead:</span>
                <span className="text-cyan-400 font-bold tabular-nums">+{totalGatewayOverhead.toFixed(1)}ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Estimated Upstream P99:</span>
                <span className="text-purple-400 font-bold tabular-nums">
                  {(parseFloat(currentRoute.latencyTarget.replace(/[^0.9.]/g, '')) + totalGatewayOverhead).toFixed(1)}ms
                </span>
              </div>
            </div>
          </div>

          {/* Request Dispatch Trigger Controls */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendRequest}
                disabled={isSending}
                className={`flex-1 py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSending
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 animate-pulse'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isSending ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Transcoding Ingress Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-white" />
                    <span>Send Synthetic Ingress Request</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetFilters}
                className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Reset filter pipeline to defaults"
                title="Reset filter pipeline to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] font-mono text-center text-slate-500">
              {lastExecutedAt ? `Dispatched at [${lastExecutedAt}] | Status 200 OK` : 'Click to execute live synthetic HTTP/2 request through filter pipeline'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Request & Response Terminal Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
        {/* Left: Request Wire Payload */}
        <div className="rounded-xl border border-slate-800 bg-[#040810] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80" />
              <span className="text-slate-300 font-bold">CLIENT INGRESS PAYLOAD</span>
            </div>
            <span className="text-amber-400 font-bold">{currentRoute.method} {currentRoute.routePath}</span>
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Ingress Headers:</div>
              {Object.entries(currentRoute.sampleRequest.headers).map(([k, v]) => (
                <div key={k} className="truncate">
                  <span className="text-cyan-400">{k}:</span> <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>

            {currentRoute.sampleRequest.bodySnippet && (
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Request Body:</div>
                <pre className="p-2 rounded bg-black/80 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto scrollbar-thin">
                  <code>{currentRoute.sampleRequest.bodySnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upstream Response & Filter Chain Telemetry */}
        <div className="rounded-xl border border-slate-800 bg-[#040810] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-slate-300 font-bold">UPSTREAM RESPONSE &amp; TELEMETRY</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
              {currentRoute.sampleResponse.statusCode} {currentRoute.sampleResponse.statusText}
            </span>
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Response Headers:</div>
              {Object.entries(currentRoute.sampleResponse.headers).map(([k, v]) => (
                <div key={k} className="truncate">
                  <span className="text-purple-400">{k}:</span> <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800/60">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Response Payload:</div>
              <pre className="p-2 rounded bg-black/80 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto scrollbar-thin">
                <code>{currentRoute.sampleResponse.bodySnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Production Envoy YAML Configuration Snippet */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>ENVOY INGRESS ROUTE DEFINITION (YAML)</span>
          </div>
          <button
            onClick={handleCopyEnvoy}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
            aria-label="Copy Envoy YAML configuration"
          >
            {copiedEnvoy ? (
              <>
                <Check className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400 font-bold">YAML Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Envoy YAML</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <pre className="p-3 rounded-lg bg-black/90 border border-slate-800/80 text-cyan-400 font-mono text-xs overflow-x-auto scrollbar-thin">
            <code>{currentRoute.envoyConfigSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
