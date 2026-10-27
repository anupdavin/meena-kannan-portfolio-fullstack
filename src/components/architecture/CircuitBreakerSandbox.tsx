import { useState, useMemo } from 'react'
import { 
  ShieldAlert, 
  RotateCcw, 
  Copy, 
  Check, 
  Activity, 
  Zap, 
  Sliders, 
  ShieldCheck,
  FileText
} from 'lucide-react'
import { CIRCUIT_BREAKER_PATTERNS, type CircuitBreakerPattern } from '@/data/circuitBreakers'

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export default function CircuitBreakerSandbox() {
  const [selectedPatternId, setSelectedPatternId] = useState<string>('resilience4j-sliding-window')
  const [circuitState, setCircuitState] = useState<CircuitState>('CLOSED')
  const [failureRateInjection, setFailureRateInjection] = useState<number>(65)
  const [ringBuffer, setRingBuffer] = useState<Array<'success' | 'failure' | 'slow'>>([
    'success', 'success', 'success', 'success', 'slow', 
    'success', 'success', 'failure', 'success', 'success'
  ])
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [simulatedCallsCount, setSimulatedCallsCount] = useState(120)

  const activePattern = useMemo<CircuitBreakerPattern>(() => {
    return CIRCUIT_BREAKER_PATTERNS.find(p => p.id === selectedPatternId) || CIRCUIT_BREAKER_PATTERNS[0]
  }, [selectedPatternId])

  // Calculated metrics from current ringBuffer
  const metrics = useMemo(() => {
    const total = ringBuffer.length || 1
    const failures = ringBuffer.filter(c => c === 'failure').length
    const slows = ringBuffer.filter(c => c === 'slow').length
    const failurePct = Math.round((failures / total) * 100)
    const slowPct = Math.round((slows / total) * 100)
    return { total, failures, slows, failurePct, slowPct }
  }, [ringBuffer])

  // Inject synthetic burst traffic
  const injectSyntheticBurst = () => {
    const newCalls: Array<'success' | 'failure' | 'slow'> = []
    const burstSize = 10

    for (let i = 0; i < burstSize; i++) {
      const rand = Math.random() * 100
      if (rand < failureRateInjection) {
        newCalls.push('failure')
      } else if (rand < failureRateInjection + 15) {
        newCalls.push('slow')
      } else {
        newCalls.push('success')
      }
    }

    const updatedBuffer = [...ringBuffer.slice(burstSize), ...newCalls]
    setRingBuffer(updatedBuffer)
    setSimulatedCallsCount(c => c + burstSize)

    const failures = updatedBuffer.filter(c => c === 'failure').length
    const failPct = (failures / updatedBuffer.length) * 100

    if (circuitState === 'CLOSED' && failPct >= 50) {
      setCircuitState('OPEN')
    } else if (circuitState === 'HALF_OPEN') {
      if (failPct < 50) {
        setCircuitState('CLOSED')
      } else {
        setCircuitState('OPEN')
      }
    }
  }

  // Force transition to Half-Open canary state
  const transitionToHalfOpen = () => {
    setCircuitState('HALF_OPEN')
    setRingBuffer(['success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'success'])
  }

  // Reset to Closed state
  const resetCircuitBreaker = () => {
    setCircuitState('CLOSED')
    setRingBuffer(['success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'success'])
  }

  const copyConfigSnippet = () => {
    navigator.clipboard.writeText(activePattern.configurationSnippet.code)
    setCopiedConfig(true)
    setTimeout(() => setCopiedConfig(false), 2000)
  }

  const copyRfcReport = () => {
    const rfcMarkdown = [
      `# Architectural RFC: ${activePattern.name}`,
      `**Paradigm:** ${activePattern.paradigm}`,
      `**Failure Threshold:** ${activePattern.failureThreshold}`,
      `**Target Latency:** ${activePattern.targetLatency}`,
      `**Blast Radius Containment:** ${activePattern.blastRadiusContainment}`,
      '',
      '## Architectural Invariant',
      activePattern.architecturalInvariant,
      '',
      '## Production Telemetry Outcomes',
      ...Object.entries(activePattern.productionOutcomes).map(([k, v]) => `* **${k}:** ${v}`),
      '',
      '## Verified Configuration Blueprint',
      '```' + activePattern.configurationSnippet.language,
      activePattern.configurationSnippet.code,
      '```'
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  return (
    <div className="w-full rounded-2xl bg-[#070b14] border border-slate-800 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header & Pattern Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              Sub-Section 14 • Fault Tolerance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-editorial">
            Distributed Circuit Breaker & Cascading Fault Mesh
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            State-machine fault isolation, sliding window evaluation, and self-healing canary probe recovery across distributed microservices.
          </p>
        </div>

        {/* 1-Click RFC & Config Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyConfigSnippet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy Resilience Configuration"
          >
            {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedConfig ? 'Copied Config' : 'Copy Config'}</span>
          </button>

          <button
            onClick={copyRfcReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-xs font-mono text-rose-300 transition-colors cursor-pointer"
            aria-label="Copy Resilience RFC Report"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedRfc ? 'Copied RFC' : 'Copy Resilience RFC'}</span>
          </button>
        </div>
      </div>

      {/* Pattern Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none touch-scroll">
        {CIRCUIT_BREAKER_PATTERNS.map((p) => {
          const isActive = selectedPatternId === p.id
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPatternId(p.id)}
              className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{p.name.split(' ')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">{p.badge}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Interactive Circuit Breaker State Machine HUD */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#050811] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
              Live State Machine Monitor:
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-extrabold border ${
              circuitState === 'CLOSED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : circuitState === 'OPEN'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            }`}>
              STATE: {circuitState}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Total Probed Calls:</span>
            <span className="text-white font-bold tabular-nums">{simulatedCallsCount}</span>
          </div>
        </div>

        {/* 3 Finite States Visualization Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePattern.stateMachine.states.map((st) => {
            const isCurrent = circuitState === st.name
            return (
              <div
                key={st.name}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? `${st.color} shadow-lg ring-1 ring-rose-500/30`
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold">{st.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-sans leading-snug mb-1">{st.description}</p>
                <p className="text-[10px] font-mono text-slate-400">{st.behavior}</p>
              </div>
            )
          })}
        </div>

        {/* Ring Buffer Live Snapshot Visualizer */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Circular Ring Buffer (Last 10 Executions):</span>
              <span className="text-slate-500">FIFO Evaluation Window</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Success (200 OK)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Slow (&gt;100ms)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Error (5xx)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 py-1 px-2 rounded bg-[#03060c] overflow-x-auto">
            {ringBuffer.map((call, idx) => (
              <div 
                key={idx}
                className={`flex-1 min-w-[20px] h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold border ${
                  call === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : call === 'slow'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
                title={`Call ${idx + 1}: ${call}`}
              >
                {call === 'success' ? '200' : call === 'slow' ? '408' : '500'}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
            <div>
              <span>Failure Rate: </span>
              <span className={`font-bold tabular-nums ${metrics.failurePct >= 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {metrics.failurePct}% (Threshold: 50%)
              </span>
            </div>
            <div>
              <span>Slow Call Rate: </span>
              <span className="font-bold tabular-nums text-amber-400">
                {metrics.slowPct}% (Threshold: 70%)
              </span>
            </div>
            <div>
              <span>Tripped Invariant: </span>
              <span className="text-white font-semibold">
                {circuitState === 'OPEN' ? 'Dispatched to Fallback' : 'Pass-Through'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation Controls Bar */}
        <div className="p-3 sm:p-4 rounded-lg bg-[#080d19] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          {/* Failure Injection Slider */}
          <div className="w-full md:w-1/2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Synthetic Failure Injection:
              </span>
              <span className="text-rose-400 font-bold tabular-nums">{failureRateInjection}% Error Rate</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={failureRateInjection}
              onChange={(e) => setFailureRateInjection(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
              aria-label="Synthetic Failure Injection Slider"
            />
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={injectSyntheticBurst}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              aria-label="Inject 10 Requests"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject 10 Calls</span>
            </button>

            <button
              onClick={transitionToHalfOpen}
              disabled={circuitState === 'HALF_OPEN'}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              aria-label="Transition to Half-Open Canary"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Canary Half-Open</span>
            </button>

            <button
              onClick={resetCircuitBreaker}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-slate-400"
              aria-label="Reset Circuit Breaker"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
        {Object.entries(activePattern.productionOutcomes).map(([metric, value]) => (
          <div key={metric} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{metric}</span>
            <span className="text-white font-bold text-xs sm:text-sm mt-0.5 block tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* Architectural Invariant & Configuration Code Snippet */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Architectural Invariant Description */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#080d1a] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold">Architectural Invariant Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {activePattern.architecturalInvariant}
          </p>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Failure Threshold:</span>
              <span className="text-rose-300 font-semibold">{activePattern.failureThreshold}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Latency:</span>
              <span className="text-cyan-300 font-semibold">{activePattern.targetLatency}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Blast Radius:</span>
              <span className="text-emerald-300 font-semibold">{activePattern.blastRadiusContainment}</span>
            </div>
          </div>
        </div>

        {/* Configuration Code Box */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden border border-slate-800 bg-[#050811] flex flex-col">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#090f1d] border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-white">{activePattern.configurationSnippet.filename}</span>
            </div>
            <span className="text-slate-500 uppercase">{activePattern.configurationSnippet.language}</span>
          </div>

          <div className="p-3 sm:p-4 font-mono text-xs text-slate-300 overflow-x-auto selection:bg-rose-900 selection:text-white leading-relaxed touch-scroll">
            <pre><code>{activePattern.configurationSnippet.code}</code></pre>
          </div>
        </div>
      </div>
    </div>
  )
}
