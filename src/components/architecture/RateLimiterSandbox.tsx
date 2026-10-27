import { useState, useMemo, useEffect } from 'react'
import {
  Sliders,
  Copy,
  Check,
  Code,
  RotateCcw,
  Zap,
  Server
} from 'lucide-react'
import { RATE_LIMITING_ALGORITHMS, type RateLimitingAlgorithm } from '@/data/rateLimitingAlgorithms'

interface RequestLogEntry {
  id: string
  timestamp: string
  status: 200 | 429
  tokensRemaining: number
  latencyMs: number
  clientIp: string
}

export default function RateLimiterSandbox() {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(RATE_LIMITING_ALGORITHMS[0].id)
  const [copiedLua, setCopiedLua] = useState<boolean>(false)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)

  // Simulation state
  const [currentTokens, setCurrentTokens] = useState<number>(RATE_LIMITING_ALGORITHMS[0].defaultConfig.capacity)
  const [acceptedCount, setAcceptedCount] = useState<number>(0)
  const [throttledCount, setThrottledCount] = useState<number>(0)
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([])

  const currentAlgo: RateLimitingAlgorithm = useMemo(() => {
    return RATE_LIMITING_ALGORITHMS.find(a => a.id === selectedAlgoId) || RATE_LIMITING_ALGORITHMS[0]
  }, [selectedAlgoId])

  // Reset simulation state when algorithm changes
  useEffect(() => {
    setCurrentTokens(currentAlgo.defaultConfig.capacity)
    setAcceptedCount(0)
    setThrottledCount(0)
    setRequestLogs([])
  }, [currentAlgo])

  // Automatic token refill / leak tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTokens(prev => {
        const cap = currentAlgo.defaultConfig.capacity
        if (prev < cap) {
          const refillStep = Math.max(1, Math.floor(currentAlgo.defaultConfig.refillRate / 2))
          return Math.min(cap, prev + refillStep)
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentAlgo])

  const dispatchRequests = (count: number) => {
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
    const newLogs: RequestLogEntry[] = []

    let available = currentTokens
    let accepted = 0
    let throttled = 0

    for (let i = 0; i < count; i++) {
      const isAllowed = available > 0
      if (isAllowed) {
        available -= 1
        accepted += 1
        newLogs.unshift({
          id: `req_${Date.now()}_${i}`,
          timestamp: timeStr,
          status: 200,
          tokensRemaining: available,
          latencyMs: +(0.4 + Math.random() * 0.5).toFixed(2),
          clientIp: `198.51.100.${(10 + i) % 255}`
        })
      } else {
        throttled += 1
        newLogs.unshift({
          id: `req_${Date.now()}_${i}`,
          timestamp: timeStr,
          status: 429,
          tokensRemaining: 0,
          latencyMs: +(0.2 + Math.random() * 0.2).toFixed(2),
          clientIp: `198.51.100.${(10 + i) % 255}`
        })
      }
    }

    setCurrentTokens(available)
    setAcceptedCount(prev => prev + accepted)
    setThrottledCount(prev => prev + throttled)
    setRequestLogs(prev => [...newLogs, ...prev].slice(0, 8))
  }

  const handleReset = () => {
    setCurrentTokens(currentAlgo.defaultConfig.capacity)
    setAcceptedCount(0)
    setThrottledCount(0)
    setRequestLogs([])
  }

  const handleCopyLua = () => {
    navigator.clipboard.writeText(currentAlgo.redisLuaScript)
    setCopiedLua(true)
    setTimeout(() => setCopiedLua(false), 2000)
  }

  const handleCopyRfc = () => {
    const rfcMarkdown = [
      `# Rate Limiting Architecture RFC: ${currentAlgo.name}`,
      '',
      `**Algorithm:** ${currentAlgo.name} (${currentAlgo.subtitle})`,
      `**Paradigm:** ${currentAlgo.paradigm}`,
      `**Distributed Storage:** ${currentAlgo.distributedStorage}`,
      `**Governing ADR:** ${currentAlgo.governingAdr}`,
      '',
      '## Complexity & Performance Invariants',
      `- Time Complexity: ${currentAlgo.timeComplexity}`,
      `- Space Complexity: ${currentAlgo.spaceComplexity}`,
      `- Burst Handling: ${currentAlgo.burstHandling}`,
      `- Precision Accuracy: ${currentAlgo.accuracy}`,
      '',
      '## Production System Configuration',
      `- System: ${currentAlgo.productionUseCase.system}`,
      `- Target Endpoint: \`${currentAlgo.productionUseCase.endpoint}\``,
      `- Configured Threshold: ${currentAlgo.productionUseCase.threshold}`,
      `- Architectural Outcome: ${currentAlgo.productionUseCase.outcome}`,
      '',
      '## Core Strengths',
      ...currentAlgo.pros.map(p => `- ${p}`),
      '',
      '## Tradeoffs & Constraints',
      ...currentAlgo.cons.map(c => `- ${c}`),
      '',
      '## Atomic Redis Lua Script',
      '```lua',
      currentAlgo.redisLuaScript,
      '```'
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const capacityPercent = Math.round((currentTokens / currentAlgo.defaultConfig.capacity) * 100)

  return (
    <div className="space-y-6 sm:space-y-8 rounded-2xl border border-slate-800 bg-[#070b12] p-4 sm:p-8 shadow-2xl">
      {/* 1. Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Sliders className="w-3.5 h-3.5" />
          <span>TRAFFIC SHAPING ENGINE | DISTRIBUTED RATE LIMITING</span>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
          Distributed Rate Limiting &amp; Traffic Shaping Sandbox
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed max-w-3xl">
          Evaluate 5 production rate limiting algorithms with atomic Redis Lua scripts, synthetic burst dispatchers,
          drop-tail HTTP 429 rejection meters, and RFC specification exports.
        </p>
      </div>

      {/* 2. Algorithm Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {RATE_LIMITING_ALGORITHMS.map(algo => {
          const isSelected = selectedAlgoId === algo.id
          return (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgoId(algo.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/10'
              }`}
              aria-label={`Select algorithm: ${algo.name}`}
            >
              <div className={`text-xs font-mono font-bold mb-1 truncate ${
                isSelected ? 'text-cyan-400' : 'text-slate-300'
              }`}>
                {algo.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {algo.subtitle}
              </div>
            </button>
          )
        })}
      </div>

      {/* 3. Algorithm Overview & Performance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Invariants */}
        <div className="lg:col-span-2 space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-editorial text-white">
                {currentAlgo.name} ({currentAlgo.subtitle})
              </h4>
              <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                Paradigm: <span className="text-slate-200">{currentAlgo.paradigm}</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              {currentAlgo.distributedStorage}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {currentAlgo.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Time Complexity</span>
              <span className="text-white font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentAlgo.timeComplexity}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Space Memory</span>
              <span className="text-emerald-400 font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentAlgo.spaceComplexity}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Burst Tolerance</span>
              <span className="text-amber-400 font-bold text-sm">
                {currentAlgo.burstHandling.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Accuracy</span>
              <span className="text-cyan-400 font-bold text-sm">
                {currentAlgo.accuracy.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Production Case */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Production Enforcement
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Target System:</span>
              <span className="text-white font-bold">{currentAlgo.productionUseCase.system}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Endpoint:</span>
              <span className="text-cyan-300 font-bold">{currentAlgo.productionUseCase.endpoint}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Threshold Limit:</span>
              <span className="text-amber-300 font-bold">{currentAlgo.productionUseCase.threshold}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Outcome:</span>
              <span className="text-slate-400 text-[10px] font-sans leading-tight block mt-0.5">
                {currentAlgo.productionUseCase.outcome}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between text-[10px]">
              <span className="text-slate-500">Governing ADR:</span>
              <span className="text-cyan-400 font-bold">{currentAlgo.governingAdr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Interactive Traffic Simulator & Capacity Gauge */}
      <div className="rounded-xl border border-slate-800 bg-[#040810] p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-sm font-mono">
                Synthetic Request Dispatcher &amp; Bucket Gauge
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Simulate burst traffic spikes to observe token depletion and drop-tail HTTP 429 backpressure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => dispatchRequests(1)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer font-bold active:scale-[0.98]"
              aria-label="Send 1 request"
            >
              +1 Req
            </button>
            <button
              onClick={() => dispatchRequests(5)}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-300 hover:bg-teal-500/20 transition-all cursor-pointer font-bold active:scale-[0.98]"
              aria-label="Send 5 requests burst"
            >
              +5 Burst
            </button>
            <button
              onClick={() => dispatchRequests(15)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer font-bold active:scale-[0.98]"
              aria-label="Send 15 requests herd"
            >
              +15 Herd
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Capacity Bar & Counter Telemetry */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Available Token Budget:</span>
              <span className={`font-bold text-sm ${currentTokens === 0 ? 'text-rose-400' : 'text-emerald-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTokens} / {currentAlgo.defaultConfig.capacity} tokens
              </span>
            </div>
            <span className="text-slate-500 text-[11px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              Refill: +{currentAlgo.defaultConfig.refillRate}/sec
            </span>
          </div>

          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                capacityPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : capacityPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Accepted Requests</span>
            <span className="text-emerald-400 font-bold text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {acceptedCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Throttled (429)</span>
            <span className={`font-bold text-base ${throttledCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {throttledCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Drop-Tail Ratio</span>
            <span className="text-cyan-400 font-bold text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {acceptedCount + throttledCount === 0 ? '0%' : `${Math.round((throttledCount / (acceptedCount + throttledCount)) * 100)}%`}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Eval Latency</span>
            <span className="text-purple-400 font-bold text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>
              &lt;0.5ms (Redis)
            </span>
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Recent Ingress Traffic Trace (Last 8 Dispatched)
          </span>
          {requestLogs.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs font-mono text-slate-500">
              Click "+1 Req", "+5 Burst", or "+15 Herd" above to dispatch synthetic traffic.
            </div>
          ) : (
            <div className="space-y-1">
              {requestLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.status === 200
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.status === 200 ? 'HTTP 200 OK' : 'HTTP 429 REJECTED'}
                    </span>
                    <span className="text-slate-400">{log.clientIp}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>Rem: {log.tokensRemaining}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{log.latencyMs}ms</span>
                    <span className="text-slate-600">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Atomic Redis Lua Script Inspector */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white">Atomic Redis Lua Script ({currentAlgo.name})</h4>
          </div>
          <button
            onClick={handleCopyLua}
            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            aria-label="Copy Redis Lua Script"
          >
            {copiedLua ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLua ? 'Copied' : 'Copy Lua'}</span>
          </button>
        </div>

        <div className="p-3 rounded-lg bg-[#040810] border border-slate-800 overflow-x-auto max-h-56 scrollbar-thin">
          <pre className="text-emerald-400/90 whitespace-pre font-mono text-[10px] leading-relaxed">
            {currentAlgo.redisLuaScript}
          </pre>
        </div>
      </div>

      {/* 6. Export RFC Action */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopyRfc}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-xs font-mono font-bold cursor-pointer"
          aria-label="Copy rate limiting RFC architecture specification"
        >
          {copiedRfc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedRfc ? 'Copied' : '[ Copy Rate Limiting RFC ]'}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          Evaluated atomically in Redis single-threaded event loop to prevent race conditions.
        </span>
      </div>
    </div>
  )
}
