import { useState, useMemo } from 'react'
import { 
  GitFork, 
  RotateCcw, 
  Copy, 
  Check, 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  FileText
} from 'lucide-react'
import { CONCURRENCY_MODELS, type ConcurrencyModel } from '@/data/distributedConcurrency'

type DeadlockStage = 'IDLE' | 'STEP_1_T1_LOCKS_A' | 'STEP_2_T2_LOCKS_B' | 'STEP_3_T1_WAITS_B' | 'DEADLOCK_CYCLE' | 'RESOLVED'

export default function DistributedConcurrencySandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('wait-for-graph-tarjan')
  const [deadlockStage, setDeadlockStage] = useState<DeadlockStage>('IDLE')
  const [abortedTx, setAbortedTx] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [detectionLatencyMs, setDetectionLatencyMs] = useState(1.4)

  const activeModel = useMemo<ConcurrencyModel>(() => {
    return CONCURRENCY_MODELS.find(m => m.id === selectedModelId) || CONCURRENCY_MODELS[0]
  }, [selectedModelId])

  // Step-by-step trigger for conflicting race condition
  const triggerDeadlockRace = () => {
    setAbortedTx(null)
    setDeadlockStage('STEP_1_T1_LOCKS_A')
    
    setTimeout(() => {
      setDeadlockStage('STEP_2_T2_LOCKS_B')
    }, 700)

    setTimeout(() => {
      setDeadlockStage('STEP_3_T1_WAITS_B')
    }, 1400)

    setTimeout(() => {
      setDeadlockStage('DEADLOCK_CYCLE')
      setDetectionLatencyMs(1.2 + Math.random() * 0.6)
    }, 2100)
  }

  // Execute Tarjan cycle detection and abort victim
  const breakDeadlockCycle = () => {
    setAbortedTx('T2 (Timestamp: 10:45:02.120, Cost: 12ms)')
    setDeadlockStage('RESOLVED')
  }

  const resetSimulation = () => {
    setDeadlockStage('IDLE')
    setAbortedTx(null)
  }

  const copyCodeSnippet = () => {
    navigator.clipboard.writeText(activeModel.codeSnippet.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyRfcReport = () => {
    const rfcMarkdown = [
      `# Architectural RFC: ${activeModel.name}`,
      `**Paradigm:** ${activeModel.paradigm}`,
      `**Lock Overhead:** ${activeModel.lockOverhead}`,
      `**Deadlock Strategy:** ${activeModel.deadlockStrategy}`,
      `**Isolation Level:** ${activeModel.isolationLevel}`,
      `**Target Profile:** ${activeModel.scaleProfile}`,
      '',
      '## Architectural Invariant',
      activeModel.architecturalInvariant,
      '',
      '## Production Telemetry Outcomes',
      ...Object.entries(activeModel.productionOutcomes).map(([k, v]) => `* **${k}:** ${v}`),
      '',
      '## Core Workflow Phases',
      ...activeModel.workflowPhases.map(p => `### ${p.name}\n${p.description}\n*Invariant:* ${p.invariants}\n`),
      '',
      '## Verified Implementation Blueprint',
      '```' + activeModel.codeSnippet.language,
      activeModel.codeSnippet.code,
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
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Sub-Section 15 • Concurrency Control & Deadlocks
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-editorial">
            Distributed Deadlock Detection & 2PL vs OCC Concurrency Control
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Wait-For Graph (WFG) cycle detection, Tarjan strongly connected components, timestamp-based Wait-Die prevention, and OCC validation.
          </p>
        </div>

        {/* 1-Click RFC & Code Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyCodeSnippet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy Concurrency Blueprint Code"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied Code' : 'Copy Blueprint'}</span>
          </button>

          <button
            onClick={copyRfcReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/40 hover:bg-indigo-500/25 text-xs font-mono text-indigo-300 transition-colors cursor-pointer"
            aria-label="Copy Concurrency RFC Report"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedRfc ? 'Copied RFC' : 'Copy Concurrency RFC'}</span>
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none touch-scroll">
        {CONCURRENCY_MODELS.map((m) => {
          const isActive = selectedModelId === m.id
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{m.name.split(' ')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">{m.badge}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Interactive Wait-For Graph (WFG) & Cycle Detection Simulator */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#050811] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
              Wait-For Graph (WFG) Live State:
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-extrabold border ${
              deadlockStage === 'DEADLOCK_CYCLE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : deadlockStage === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : deadlockStage === 'IDLE'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {deadlockStage === 'DEADLOCK_CYCLE' ? 'CYCLE DETECTED: T1 <-> T2' : `STAGE: ${deadlockStage}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Tarjan Detection Latency:</span>
            <span className="text-cyan-300 font-bold tabular-nums">{detectionLatencyMs.toFixed(2)}ms</span>
          </div>
        </div>

        {/* Directed Graph Canvas (SVG Visualizer) */}
        <div className="relative w-full rounded-xl bg-[#04060d] border border-slate-800/90 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
          {/* Active Deadlock Banner */}
          {deadlockStage === 'DEADLOCK_CYCLE' && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>DEADLOCK CYCLE: T1 holds Resource A and waits for B. T2 holds Resource B and waits for A.</span>
            </div>
          )}

          {deadlockStage === 'RESOLVED' && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>DEADLOCK RESOLVED: Aborted {abortedTx}. Released Lock B. Transaction T1 acquired Lock B and committed!</span>
            </div>
          )}

          <svg 
            viewBox="0 0 520 180" 
            className="w-full h-auto max-h-[170px]"
            aria-label="Wait-For Graph Transaction Cycle Topology"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Edge 1: T1 -> Resource A (Holds Lock A) */}
            <line 
              x1="120" y1="90" x2="200" y2="50" 
              stroke={deadlockStage !== 'IDLE' ? '#10b981' : '#334155'} 
              strokeWidth="2" 
              strokeDasharray={deadlockStage !== 'IDLE' ? 'none' : '4,4'}
            />
            {/* Edge 2: T2 -> Resource B (Holds Lock B) */}
            <line 
              x1="400" y1="90" x2="320" y2="130" 
              stroke={deadlockStage !== 'IDLE' && deadlockStage !== 'STEP_1_T1_LOCKS_A' && deadlockStage !== 'RESOLVED' ? '#10b981' : '#334155'} 
              strokeWidth="2" 
              strokeDasharray={deadlockStage !== 'IDLE' && deadlockStage !== 'STEP_1_T1_LOCKS_A' ? 'none' : '4,4'}
            />

            {/* Conflicting Dependency 1: T1 -> Resource B (T1 waits for Lock B held by T2) */}
            {(deadlockStage === 'STEP_3_T1_WAITS_B' || deadlockStage === 'DEADLOCK_CYCLE') && (
              <path 
                d="M 120 90 Q 260 160 320 130" 
                fill="none" 
                stroke="#fbbf24" 
                strokeWidth="2.5" 
                strokeDasharray="4,4" 
                className="animate-pulse"
              />
            )}

            {/* Conflicting Dependency 2: T2 -> Resource A (T2 waits for Lock A held by T1 - CREATES CYCLE) */}
            {deadlockStage === 'DEADLOCK_CYCLE' && (
              <path 
                d="M 400 90 Q 260 20 200 50" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeDasharray="4,4" 
                className="animate-pulse"
              />
            )}

            {/* Direct Wait-For Graph Cycle Wire (T1 <-> T2) */}
            {deadlockStage === 'DEADLOCK_CYCLE' && (
              <line 
                x1="120" y1="90" x2="400" y2="90" 
                stroke="#f43f5e" 
                strokeWidth="2" 
                strokeDasharray="6,4" 
                markerEnd="url(#arrowRed)"
                markerStart="url(#arrowRed)"
                className="animate-pulse"
              />
            )}

            {/* Node 1: Transaction T1 */}
            <g transform="translate(120, 90)">
              <circle r="32" fill="#0b1324" stroke="#38bdf8" strokeWidth="2" />
              <text textAnchor="middle" y="-4" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">T1</text>
              <text textAnchor="middle" y="10" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Age: Older</text>
            </g>

            {/* Node 2: Resource A */}
            <g transform="translate(200, 50)">
              <rect x="-32" y="-18" width="64" height="36" rx="6" fill="#0f172a" stroke={deadlockStage !== 'IDLE' ? '#10b981' : '#334155'} strokeWidth="1.5" />
              <text textAnchor="middle" y="4" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">Lock A</text>
            </g>

            {/* Node 3: Resource B */}
            <g transform="translate(320, 130)">
              <rect x="-32" y="-18" width="64" height="36" rx="6" fill="#0f172a" stroke={deadlockStage === 'RESOLVED' ? '#334155' : (deadlockStage !== 'IDLE' && deadlockStage !== 'STEP_1_T1_LOCKS_A') ? '#10b981' : '#334155'} strokeWidth="1.5" />
              <text textAnchor="middle" y="4" fill={deadlockStage === 'RESOLVED' ? '#94a3b8' : '#10b981'} fontSize="10" fontWeight="bold" fontFamily="monospace">Lock B</text>
            </g>

            {/* Node 4: Transaction T2 */}
            <g transform="translate(400, 90)">
              <circle r="32" fill="#0b1324" stroke={deadlockStage === 'DEADLOCK_CYCLE' ? '#f43f5e' : deadlockStage === 'RESOLVED' ? '#64748b' : '#38bdf8'} strokeWidth="2" />
              <text textAnchor="middle" y="-4" fill={deadlockStage === 'RESOLVED' ? '#64748b' : '#ffffff'} fontSize="12" fontWeight="bold" fontFamily="monospace">T2</text>
              <text textAnchor="middle" y="10" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                {deadlockStage === 'RESOLVED' ? 'Aborted' : 'Age: Younger'}
              </text>
            </g>
          </svg>
        </div>

        {/* Live Simulation Controls Bar */}
        <div className="p-3 sm:p-4 rounded-lg bg-[#080d19] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={triggerDeadlockRace}
              disabled={deadlockStage === 'DEADLOCK_CYCLE'}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40"
              aria-label="Inject Conflicting Transaction Deadlock"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Conflicting Race</span>
            </button>

            <button
              onClick={breakDeadlockCycle}
              disabled={deadlockStage !== 'DEADLOCK_CYCLE'}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              aria-label="Execute Tarjan SCC Cycle Break"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Execute Tarjan SCC Abort</span>
            </button>
          </div>

          <button
            onClick={resetSimulation}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-slate-400"
            aria-label="Reset Concurrency Graph"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset WFG</span>
          </button>
        </div>
      </div>

      {/* Production Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
        {Object.entries(activeModel.productionOutcomes).map(([metric, value]) => (
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
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <Activity className="w-4 h-4" />
            <span className="font-bold">Concurrency & Invariant Spec</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {activeModel.architecturalInvariant}
          </p>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Lock Overhead:</span>
              <span className="text-cyan-300 font-semibold">{activeModel.lockOverhead}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Deadlock Defense:</span>
              <span className="text-rose-300 font-semibold">{activeModel.deadlockStrategy}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Isolation Level:</span>
              <span className="text-emerald-300 font-semibold">{activeModel.isolationLevel}</span>
            </div>
          </div>
        </div>

        {/* Configuration Code Box */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden border border-slate-800 bg-[#050811] flex flex-col">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#090f1d] border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-white">{activeModel.codeSnippet.filename}</span>
            </div>
            <span className="text-slate-500 uppercase">{activeModel.codeSnippet.language}</span>
          </div>

          <div className="p-3 sm:p-4 font-mono text-xs text-slate-300 overflow-x-auto selection:bg-indigo-900 selection:text-white leading-relaxed touch-scroll">
            <pre><code>{activeModel.codeSnippet.code}</code></pre>
          </div>
        </div>
      </div>
    </div>
  )
}
