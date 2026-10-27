import { useState, useMemo } from 'react'
import {
  GitCommit,
  Copy,
  Check,
  Flame,
  Filter,
  Layers,
  FileCode,
  Tag
} from 'lucide-react'
import { DISTRIBUTED_TRACES, type DistributedTrace, type SpanRecord } from '@/data/distributedTraces'

export default function DistributedTraceInspector() {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(DISTRIBUTED_TRACES[0].traceId)
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null)
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false)
  const [copiedJson, setCopiedJson] = useState<boolean>(false)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)

  const currentTrace: DistributedTrace = DISTRIBUTED_TRACES.find(t => t.traceId === selectedTraceId) || DISTRIBUTED_TRACES[0]

  const activeSpans = useMemo(() => {
    if (showCriticalOnly) {
      return currentTrace.spans.filter(s => s.isCriticalPath)
    }
    return currentTrace.spans
  }, [currentTrace, showCriticalOnly])

  const selectedSpan: SpanRecord = currentTrace.spans.find(s => s.spanId === selectedSpanId) || currentTrace.spans[0]

  const handleSelectTrace = (traceId: string) => {
    setSelectedTraceId(traceId)
    setSelectedSpanId(null)
  }

  const handleCopyJson = () => {
    const otelPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: currentTrace.systemName } },
              { key: 'telemetry.sdk.name', value: { stringValue: 'opentelemetry-java' } },
              { key: 'telemetry.sdk.version', value: { stringValue: '1.35.0' } }
            ]
          },
          scopeSpans: [
            {
              scope: { name: 'io.opentelemetry.spring-boot-starter' },
              spans: currentTrace.spans.map(s => ({
                traceId: currentTrace.traceId,
                spanId: s.spanId,
                parentSpanId: s.parentSpanId || undefined,
                name: s.operationName,
                kind: s.parentSpanId ? 'SPAN_KIND_INTERNAL' : 'SPAN_KIND_SERVER',
                startTimeUnixNano: `${Math.round(s.startTimeMs * 1000000)}`,
                endTimeUnixNano: `${Math.round((s.startTimeMs + s.durationMs) * 1000000)}`,
                attributes: Object.entries(s.tags).map(([k, v]) => ({
                  key: k,
                  value: { stringValue: v }
                })),
                status: { code: 'STATUS_CODE_OK' }
              }))
            }
          ]
        }
      ]
    }
    navigator.clipboard.writeText(JSON.stringify(otelPayload, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleCopyRfc = () => {
    const markdown = `# OPENTELEMETRY DISTRIBUTED TRACE SPECIFICATION
**Trace ID:** ${currentTrace.traceId}
**Endpoint:** ${currentTrace.rootEndpoint}
**System:** ${currentTrace.systemName}
**Category:** ${currentTrace.category}
**Total Duration:** ${currentTrace.totalDurationMs.toFixed(1)}ms
**Critical Bottleneck:** ${currentTrace.criticalBottleneck}
**Governing ADR:** ${currentTrace.governingAdr}

## 1. ARCHITECTURAL SUMMARY
${currentTrace.summary}

## 2. SPAN HIERARCHY & TIMELINE
| Span ID | Service | Operation | Start | Duration | % of Trace | Critical Path |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${currentTrace.spans.map(s => {
  const percent = ((s.durationMs / currentTrace.totalDurationMs) * 100).toFixed(1)
  return `| ${s.spanId} | ${s.serviceName} | ${s.operationName} | +${s.startTimeMs.toFixed(1)}ms | ${s.durationMs.toFixed(1)}ms | ${percent}% | ${s.isCriticalPath ? 'YES' : 'NO'} |`
}).join('\n')}

## 3. CRITICAL BOTTLENECK ANALYSIS
- **Primary Bottleneck:** ${currentTrace.criticalBottleneck}
- **Mitigation Invariant:** Documented in ${currentTrace.governingAdr}.
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs">
            <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
            <span>OPENTELEMETRY &amp; DISTRIBUTED TRACING FLAMEGRAPH</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
            Distributed Tracing &amp; OpenTelemetry Span Flamegraph
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Inspect end-to-end W3C distributed trace contexts, parent-child span hierarchies, and critical path 
            latency bottlenecks across all 5 distributed cloud architectures.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              showCriticalOnly
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 font-bold'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            aria-label="Toggle critical path spans only"
          >
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>{showCriticalOnly ? 'Showing Critical Path' : 'Filter Critical Path'}</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 hover:text-indigo-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            aria-label="Copy OpenTelemetry JSON trace"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-400 font-bold">OTel JSON Copied</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy OTel JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyRfc}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            aria-label="Copy trace bottleneck RFC in Markdown"
          >
            {copiedRfc ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Report Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Trace RFC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Trace Selector Tabs */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Select Distributed Transaction Trace (5 Architectures):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {DISTRIBUTED_TRACES.map((trace, idx) => {
            const isSelected = trace.traceId === selectedTraceId
            return (
              <button
                key={trace.traceId}
                onClick={() => handleSelectTrace(trace.traceId)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-950/20 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.12)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-400'
                  }`}>
                    TRACE 0{idx + 1}
                  </span>
                  <span className="text-slate-500">{trace.spans.length} spans</span>
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold truncate ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {trace.rootEndpoint}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                    {trace.systemName.split(' ')[0]} {trace.systemName.split(' ')[1]}
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-indigo-400 font-bold tabular-nums">{trace.totalDurationMs.toFixed(1)}ms</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Active Trace Summary & Critical Bottleneck Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 sm:p-6 rounded-xl bg-slate-950/90 border border-slate-800/90">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
              {currentTrace.rootEndpoint}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Trace ID: <strong className="text-slate-200">{currentTrace.traceId}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Governance: <strong className="text-slate-200">{currentTrace.governingAdr}</strong>
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold font-editorial text-white">
              {currentTrace.title}
            </h4>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Target System: <span className="text-cyan-400">{currentTrace.systemName}</span>
            </div>
          </div>

          <p className="text-xs font-sans text-slate-300 leading-relaxed">
            {currentTrace.summary}
          </p>

          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-mono font-bold text-rose-300 uppercase tracking-wide text-[10px] block">
                Critical Path Latency Bottleneck:
              </span>
              <span className="font-sans text-slate-200">{currentTrace.criticalBottleneck}</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Badges */}
        <div className="space-y-3 lg:border-l lg:border-slate-800/80 lg:pl-4 font-mono text-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Trace Telemetry Metrics:
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Latency:</span>
              <span className="text-indigo-400 font-bold tabular-nums">{currentTrace.totalDurationMs.toFixed(1)}ms</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Spans:</span>
              <span className="text-cyan-400 font-bold tabular-nums">{currentTrace.spans.length} spans</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Critical Path Spans:</span>
              <span className="text-rose-400 font-bold tabular-nums">
                {currentTrace.spans.filter(s => s.isCriticalPath).length} spans
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">W3C Context State:</span>
              <span className="text-emerald-400 font-bold">PROPAGATED</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center pt-2">
            Click any span bar below to inspect structured OpenTelemetry attributes
          </div>
        </div>
      </div>

      {/* 4. OpenTelemetry Flamegraph Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>OPENTELEMETRY SPAN FLAMEGRAPH &amp; CRITICAL PATH TIMELINE</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Gateway
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Security
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Database
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Messaging
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Cache
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> Compute
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#040810] p-4 font-mono text-xs shadow-inner space-y-4">
          {/* Time Ruler Axis */}
          <div className="relative h-6 border-b border-slate-800 text-[10px] text-slate-500 select-none">
            <span className="absolute left-0 top-0">0.0ms</span>
            <span className="absolute left-1/4 -translate-x-1/2 top-0">{(currentTrace.totalDurationMs * 0.25).toFixed(1)}ms</span>
            <span className="absolute left-2/4 -translate-x-1/2 top-0">{(currentTrace.totalDurationMs * 0.50).toFixed(1)}ms</span>
            <span className="absolute left-3/4 -translate-x-1/2 top-0">{(currentTrace.totalDurationMs * 0.75).toFixed(1)}ms</span>
            <span className="absolute right-0 top-0">{currentTrace.totalDurationMs.toFixed(1)}ms</span>
          </div>

          {/* Span Bars List */}
          <div className="space-y-2">
            {activeSpans.map(span => {
              const isSelected = span.spanId === selectedSpan.spanId
              const leftPercent = (span.startTimeMs / currentTrace.totalDurationMs) * 100
              const widthPercent = Math.max((span.durationMs / currentTrace.totalDurationMs) * 100, 2.0)

              let categoryColor = 'bg-slate-700 border-slate-600 text-slate-200'
              if (span.category === 'gateway') categoryColor = 'bg-cyan-500/80 border-cyan-400 text-white'
              else if (span.category === 'security') categoryColor = 'bg-rose-500/80 border-rose-400 text-white'
              else if (span.category === 'database') categoryColor = 'bg-emerald-500/80 border-emerald-400 text-white'
              else if (span.category === 'messaging') categoryColor = 'bg-amber-500/80 border-amber-400 text-black font-bold'
              else if (span.category === 'cache') categoryColor = 'bg-purple-500/80 border-purple-400 text-white'
              else if (span.category === 'compute') categoryColor = 'bg-indigo-500/80 border-indigo-400 text-white'

              return (
                <div
                  key={span.spanId}
                  onClick={() => setSelectedSpanId(span.spanId)}
                  className={`group p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1 text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      {span.isCriticalPath && (
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                      )}
                      <span className="text-slate-400 font-bold">{span.serviceName}</span>
                      <span className="text-slate-600">::</span>
                      <span className="text-slate-200 font-mono truncate">{span.operationName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] shrink-0 tabular-nums">
                      <span className="text-slate-500">+{span.startTimeMs.toFixed(1)}ms</span>
                      <span className="text-indigo-300 font-bold">{span.durationMs.toFixed(1)}ms</span>
                      <span className="text-slate-500">({((span.durationMs / currentTrace.totalDurationMs) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Visual Bar Track */}
                  <div className="relative h-4 bg-slate-900/80 rounded border border-slate-800/80 overflow-hidden">
                    <div
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                      className={`absolute top-0 bottom-0 rounded border transition-all ${categoryColor} ${
                        span.isCriticalPath ? 'ring-1 ring-rose-400' : ''
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5. Selected Span Detail Drawer & OpenTelemetry Tags */}
      <div className="rounded-xl border border-slate-800 bg-[#040810] p-4 font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">SELECTED SPAN ATTRIBUTES &amp; METADATA:</span>
            <span className="text-cyan-400 font-bold">{selectedSpan.operationName}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Span ID: <strong className="text-slate-200">{selectedSpan.spanId}</strong></span>
            {selectedSpan.parentSpanId && (
              <span>| Parent: <strong className="text-slate-200">{selectedSpan.parentSpanId}</strong></span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Executing Service</span>
            <span className="text-slate-200 font-bold">{selectedSpan.serviceName}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Start Offset &amp; Duration</span>
            <span className="text-indigo-400 font-bold tabular-nums">
              +{selectedSpan.startTimeMs.toFixed(1)}ms | {selectedSpan.durationMs.toFixed(1)}ms
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Critical Path Status</span>
            <span className={selectedSpan.isCriticalPath ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              {selectedSpan.isCriticalPath ? 'CRITICAL BOTTLENECK' : 'OFF CRITICAL PATH'}
            </span>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <div className="text-slate-500 text-[10px] uppercase font-bold">OpenTelemetry Span Attributes (Key-Value):</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {Object.entries(selectedSpan.tags).map(([key, val]) => (
              <div key={key} className="p-1.5 rounded bg-black/60 border border-slate-800/80 text-[11px] truncate">
                <span className="text-indigo-300 font-bold">{key}</span>
                <span className="text-slate-500 mx-1">:</span>
                <span className="text-emerald-400">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
