import { useState, useId, useEffect, useCallback } from 'react'
import {
  Sliders,
  Layers,
  Zap,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  ShieldAlert,
  Activity,
  Play,
  Pause,
  AlertTriangle,
  Flame
} from 'lucide-react'
import { TRAFFIC_PRIORITY_MODELS, type TrafficPriorityModel } from '@/data/trafficPriority'

interface PacketItem {
  id: string
  tier: 'VIP' | 'STANDARD' | 'FREE'
  sizeBytes: number
  enqueuedAt: number
}

export default function TrafficPrioritySandbox() {
  const [selectedModel, setSelectedModel] = useState<TrafficPriorityModel>(TRAFFIC_PRIORITY_MODELS[0])
  const [vipQueue, setVipQueue] = useState<PacketItem[]>([
    { id: 'PKT-VIP-1', tier: 'VIP', sizeBytes: 1024, enqueuedAt: Date.now() - 4 },
    { id: 'PKT-VIP-2', tier: 'VIP', sizeBytes: 512, enqueuedAt: Date.now() - 3 },
    { id: 'PKT-VIP-3', tier: 'VIP', sizeBytes: 1500, enqueuedAt: Date.now() - 1 }
  ])
  const [stdQueue, setStdQueue] = useState<PacketItem[]>([
    { id: 'PKT-STD-1', tier: 'STANDARD', sizeBytes: 768, enqueuedAt: Date.now() - 10 },
    { id: 'PKT-STD-2', tier: 'STANDARD', sizeBytes: 1200, enqueuedAt: Date.now() - 8 },
    { id: 'PKT-STD-3', tier: 'STANDARD', sizeBytes: 256, enqueuedAt: Date.now() - 5 },
    { id: 'PKT-STD-4', tier: 'STANDARD', sizeBytes: 1024, enqueuedAt: Date.now() - 2 }
  ])
  const [freeQueue, setFreeQueue] = useState<PacketItem[]>([
    { id: 'PKT-FREE-1', tier: 'FREE', sizeBytes: 1500, enqueuedAt: Date.now() - 25 },
    { id: 'PKT-FREE-2', tier: 'FREE', sizeBytes: 1500, enqueuedAt: Date.now() - 20 },
    { id: 'PKT-FREE-3', tier: 'FREE', sizeBytes: 1500, enqueuedAt: Date.now() - 15 }
  ])

  const [dispatchedCount, setDispatchedCount] = useState(4820)
  const [droppedCount, setDroppedCount] = useState(12)
  const [lastDispatchedTier, setLastDispatchedTier] = useState<string>('VIP')
  const [isAutoDrainActive, setIsAutoDrainActive] = useState(false)
  const [credits, setCredits] = useState({ vip: 5, std: 3, free: 1 })
  const [sojournDelayMs, setSojournDelayMs] = useState(4.2)
  const [copied, setCopied] = useState(false)

  const headingId = useId()

  const injectBurst = () => {
    const now = Date.now()
    const newVips: PacketItem[] = [
      { id: `PKT-VIP-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'VIP', sizeBytes: 800, enqueuedAt: now },
      { id: `PKT-VIP-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'VIP', sizeBytes: 1200, enqueuedAt: now }
    ]
    const newStds: PacketItem[] = [
      { id: `PKT-STD-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'STANDARD', sizeBytes: 600, enqueuedAt: now },
      { id: `PKT-STD-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'STANDARD', sizeBytes: 1400, enqueuedAt: now },
      { id: `PKT-STD-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'STANDARD', sizeBytes: 900, enqueuedAt: now }
    ]
    const newFrees: PacketItem[] = [
      { id: `PKT-FREE-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'FREE', sizeBytes: 1500, enqueuedAt: now },
      { id: `PKT-FREE-${Math.floor(Math.random() * 9000 + 1000)}`, tier: 'FREE', sizeBytes: 1500, enqueuedAt: now }
    ]

    setVipQueue(prev => [...prev, ...newVips].slice(-12))
    setStdQueue(prev => [...prev, ...newStds].slice(-12))
    setFreeQueue(prev => [...prev, ...newFrees].slice(-12))
    setSojournDelayMs(prev => Math.min(18.5, Number((prev + 1.2).toFixed(1))))
  }

  const injectSheddingOverload = () => {
    const now = Date.now()
    const floodFree: PacketItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `PKT-FLOOD-${i + 1}`,
      tier: 'FREE',
      sizeBytes: 1500,
      enqueuedAt: now - 35
    }))
    // Simulating CoDel or Load Shedding drop-tail early rejection
    setDroppedCount(prev => prev + 6)
    setFreeQueue(prev => [...prev, ...floodFree].slice(-14))
    setSojournDelayMs(16.8)
  }

  const stepDrain = useCallback(() => {
    // WFQ credit-based round-robin with anti-starvation
    if (credits.vip > 0 && vipQueue.length > 0) {
      setVipQueue(prev => prev.slice(1))
      setCredits(prev => ({ ...prev, vip: prev.vip - 1 }))
      setLastDispatchedTier('VIP (Tier-1 Enterprise)')
      setDispatchedCount(prev => prev + 1)
      setSojournDelayMs(prev => Math.max(2.1, Number((prev - 0.3).toFixed(1))))
      return
    }

    if (credits.std > 0 && stdQueue.length > 0) {
      setStdQueue(prev => prev.slice(1))
      setCredits(prev => ({ ...prev, std: prev.std - 1 }))
      setLastDispatchedTier('STANDARD (Tier-2 Pro)')
      setDispatchedCount(prev => prev + 1)
      setSojournDelayMs(prev => Math.max(2.1, Number((prev - 0.2).toFixed(1))))
      return
    }

    if (freeQueue.length > 0) {
      setFreeQueue(prev => prev.slice(1))
      setCredits({ vip: 5, std: 3, free: 1 })
      setLastDispatchedTier('FREE (Tier-3 Batch / Anti-Starvation Drain)')
      setDispatchedCount(prev => prev + 1)
      setSojournDelayMs(prev => Math.max(2.1, Number((prev - 0.4).toFixed(1))))
      return
    }

    // Reset credits if queues still have items
    setCredits({ vip: 5, std: 3, free: 1 })
    if (vipQueue.length > 0) {
      setVipQueue(prev => prev.slice(1))
      setLastDispatchedTier('VIP (Tier-1 Enterprise)')
      setDispatchedCount(prev => prev + 1)
    } else if (stdQueue.length > 0) {
      setStdQueue(prev => prev.slice(1))
      setLastDispatchedTier('STANDARD (Tier-2 Pro)')
      setDispatchedCount(prev => prev + 1)
    }
  }, [credits, vipQueue, stdQueue, freeQueue])

  const resetAllQueues = () => {
    setVipQueue([
      { id: 'PKT-VIP-1', tier: 'VIP', sizeBytes: 1024, enqueuedAt: Date.now() - 4 },
      { id: 'PKT-VIP-2', tier: 'VIP', sizeBytes: 512, enqueuedAt: Date.now() - 2 }
    ])
    setStdQueue([
      { id: 'PKT-STD-1', tier: 'STANDARD', sizeBytes: 768, enqueuedAt: Date.now() - 6 },
      { id: 'PKT-STD-2', tier: 'STANDARD', sizeBytes: 1024, enqueuedAt: Date.now() - 3 }
    ])
    setFreeQueue([
      { id: 'PKT-FREE-1', tier: 'FREE', sizeBytes: 1500, enqueuedAt: Date.now() - 10 }
    ])
    setCredits({ vip: 5, std: 3, free: 1 })
    setDispatchedCount(4820)
    setDroppedCount(12)
    setSojournDelayMs(4.2)
    setIsAutoDrainActive(false)
  }

  useEffect(() => {
    if (!isAutoDrainActive) return
    const interval = setInterval(() => {
      stepDrain()
    }, 450)
    return () => clearInterval(interval)
  }, [isAutoDrainActive, stepDrain])

  const copyRfcReport = () => {
    const rfc = `# RFC-8205: Distributed Token-Bucket API Shaper & Bounded Priority Queuing
Architecture: ${selectedModel.name} [${selectedModel.badge}]
Paradigm: ${selectedModel.paradigm}
Algorithm Complexity: ${selectedModel.algorithmComplexity}
Queue Memory Overhead: ${selectedModel.queueOverhead}
Throughput Profile: ${selectedModel.throughputProfile}
Latency Guarantee: ${selectedModel.latencyGuarantee}

## Architectural Invariant:
${selectedModel.architecturalInvariant}

## Workflow & State Progression:
${selectedModel.workflowPhases.map(phase => `- ${phase.name}: ${phase.description} (Invariant: ${phase.invariants})`).join('\n')}

## Production Metrics:
${Object.entries(selectedModel.productionOutcomes).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Implementation Blueprint:
\`\`\`${selectedModel.codeSnippet.language}
${selectedModel.codeSnippet.code}
\`\`\`
`
    navigator.clipboard.writeText(rfc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id="architecture-traffic-priority"
      aria-labelledby={headingId}
      className="rounded-2xl border border-slate-800 bg-[#06090e] p-6 lg:p-8 relative overflow-hidden shadow-2xl"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Distributed Systems Engine 18
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              QoS &amp; Traffic Shaping
            </span>
          </div>
          <h2 id={headingId} className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Distributed Token-Bucket API Shaper &amp; Priority Queuing
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Interactive multi-queue packet drain visualizer, Weighted Fair Queuing (WFQ) scheduler with virtual finish times, CoDel bufferbloat mitigation, and dual-rate token bucket surge control.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            type="button"
            onClick={copyRfcReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'RFC Copied' : 'Copy QoS RFC'}</span>
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {TRAFFIC_PRIORITY_MODELS.map(m => {
          const isSelected = m.id === selectedModel.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{m.name.split(' (')[0]}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {m.badge}
              </span>
            </button>
          )
        })}
      </div>

      {/* Interactive Priority Drain Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Multi-Tier Queue HUD */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#070b12] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Priority Buffer Status &amp; Scheduler Core
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  WFQ Quantum: 5 : 3 : 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last Dispatched: <span className="font-mono text-emerald-400">{lastDispatchedTier}</span>
              </p>
            </div>

            {/* Simulation Triggers */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={injectBurst}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+ Burst (7 Pkts)</span>
              </button>

              <button
                type="button"
                onClick={injectSheddingOverload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
                title="Inject batch crawler traffic to test CoDel AQM or Load Shedding early rejection"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Surge Flood</span>
              </button>

              <button
                type="button"
                onClick={stepDrain}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Step Drain</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAutoDrainActive(!isAutoDrainActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                  isAutoDrainActive
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isAutoDrainActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoDrainActive ? 'Pause Auto' : 'Auto Drain'}</span>
              </button>

              <button
                type="button"
                onClick={resetAllQueues}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                title="Reset Queues"
                aria-label="Reset Queues"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Queues Visual Representation */}
          <div className="space-y-4">
            {/* Tier-1: VIP Enterprise */}
            <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-300">Tier-1 VIP Enterprise Queue</span>
                  <span className="text-[10px] text-slate-400">(Weight: 5.0 | Quantum Credit: {credits.vip}/5)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Queue Depth: </span>
                  <span className="font-semibold text-emerald-400 tabular-nums">{vipQueue.length} / 12 pkts</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 min-h-[38px] p-2 rounded bg-black/40 border border-slate-800/80 overflow-x-auto">
                {vipQueue.length === 0 ? (
                  <span className="text-[11px] font-mono text-slate-500 italic">Queue idle (no pending VIP frames)</span>
                ) : (
                  vipQueue.map(pkt => (
                    <div
                      key={pkt.id}
                      className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 whitespace-nowrap flex items-center gap-1 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{pkt.id}</span>
                      <span className="text-emerald-400/70 text-[9px] tabular-nums">({pkt.sizeBytes}B)</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tier-2: Standard Pro */}
            <div className="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-cyan-300">Tier-2 Standard Pro Queue</span>
                  <span className="text-[10px] text-slate-400">(Weight: 3.0 | Quantum Credit: {credits.std}/3)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Queue Depth: </span>
                  <span className="font-semibold text-cyan-400 tabular-nums">{stdQueue.length} / 12 pkts</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 min-h-[38px] p-2 rounded bg-black/40 border border-slate-800/80 overflow-x-auto">
                {stdQueue.length === 0 ? (
                  <span className="text-[11px] font-mono text-slate-500 italic">Queue idle (no pending Standard frames)</span>
                ) : (
                  stdQueue.map(pkt => (
                    <div
                      key={pkt.id}
                      className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 whitespace-nowrap flex items-center gap-1 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{pkt.id}</span>
                      <span className="text-cyan-400/70 text-[9px] tabular-nums">({pkt.sizeBytes}B)</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tier-3: Free / Batch / Crawlers */}
            <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-semibold text-amber-300">Tier-3 Free / Batch Queue (Anti-Starvation)</span>
                  <span className="text-[10px] text-slate-400">(Weight: 1.0 | Anti-Starve Credit: {credits.free}/1)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Queue Depth: </span>
                  <span className="font-semibold text-amber-400 tabular-nums">{freeQueue.length} / 14 pkts</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 min-h-[38px] p-2 rounded bg-black/40 border border-slate-800/80 overflow-x-auto">
                {freeQueue.length === 0 ? (
                  <span className="text-[11px] font-mono text-slate-500 italic">Queue idle (no pending Free frames)</span>
                ) : (
                  freeQueue.map(pkt => (
                    <div
                      key={pkt.id}
                      className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 whitespace-nowrap flex items-center gap-1 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{pkt.id}</span>
                      <span className="text-amber-400/70 text-[9px] tabular-nums">({pkt.sizeBytes}B)</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry & CoDel AQM Monitor */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#070b12] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  QoS Telemetry Monitor
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active Link 10Gbps
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Total Dispatched:</span>
                <span className="text-emerald-400 font-semibold tabular-nums">{dispatchedCount.toLocaleString()} pkts</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Dropped / Shedded:</span>
                <span className="text-rose-400 font-semibold tabular-nums">{droppedCount} pkts (0.24%)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Sojourn Delay:</span>
                <div className="text-right">
                  <span className={`font-semibold tabular-nums ${sojournDelayMs > 5.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {sojournDelayMs} ms
                  </span>
                  <span className="text-[10px] text-slate-500 block">Target: &lt; 5.0 ms (CoDel)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Jains Fairness Index:</span>
                <span className="text-cyan-400 font-semibold tabular-nums">0.994 (Optimal)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Anti-Starvation Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When Tier-1 VIP queues experience sustained 100% saturation, the scheduler virtual clock forces credit rollover to guarantee Tier-3 Free packets drain every 250ms interval.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Model Architectural Invariants & Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Spec, Invariant & Outcomes */}
        <div className="lg:col-span-7 space-y-5">
          {/* Invariant Alert */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
                Architectural Invariant
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {selectedModel.architecturalInvariant}
            </p>
          </div>

          {/* Workflow Phases */}
          <div className="rounded-xl border border-slate-800 bg-[#070b12] p-5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block mb-4">
              3-Phase State Machine &amp; Queue Progression
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedModel.workflowPhases.map((phase, idx) => (
                <div
                  key={phase.name}
                  className="p-3 rounded-lg border border-slate-800 bg-black/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1">
                      <span className="text-emerald-400 font-semibold">{idx + 1}.</span>
                      <span className="text-white font-medium">{phase.name.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {phase.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[9px] font-mono text-emerald-400/80 block leading-tight">
                      Invariant: {phase.invariants}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantified Production Outcomes */}
          <div className="rounded-xl border border-slate-800 bg-[#070b12] p-5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block mb-4">
              Quantified Production Outcomes
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(selectedModel.productionOutcomes).map(([metric, value]) => (
                <div key={metric} className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    {metric}
                  </span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Code Blueprint */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#070b12] p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-200">
                {selectedModel.codeSnippet.filename}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              {selectedModel.codeSnippet.language}
            </span>
          </div>

          <div className="relative flex-1 bg-black/60 rounded-lg p-3.5 border border-slate-800/80 overflow-x-auto font-mono text-xs text-slate-300">
            <pre className="text-[11px] leading-relaxed whitespace-pre font-mono">
              <code>{selectedModel.codeSnippet.code}</code>
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Complexity: <strong className="text-white">{selectedModel.algorithmComplexity}</strong></span>
            <span>Overhead: <strong className="text-emerald-400">{selectedModel.queueOverhead}</strong></span>
          </div>
        </div>
      </div>
    </section>
  )
}
