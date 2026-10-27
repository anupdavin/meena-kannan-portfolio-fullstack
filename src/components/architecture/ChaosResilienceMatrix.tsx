import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Play,
  RotateCcw,
  Copy,
  Check,
  ShieldAlert,
  Activity,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileCode
} from 'lucide-react'
import { CHAOS_DRILLS, type ChaosDrill } from '@/data/chaosDrills'

export default function ChaosResilienceMatrix() {
  const [selectedDrillId, setSelectedDrillId] = useState<string>(CHAOS_DRILLS[0].id)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [copiedRunbook, setCopiedRunbook] = useState<boolean>(false)
  const [copiedReport, setCopiedReport] = useState<boolean>(false)

  const currentDrill: ChaosDrill = CHAOS_DRILLS.find(d => d.id === selectedDrillId) || CHAOS_DRILLS[0]

  // Reset execution state when switching drills
  const handleSelectDrill = (id: string) => {
    setSelectedDrillId(id)
    setIsRunning(false)
    setActiveStepIndex(-1)
  }

  // Live simulation execution sequence
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning) {
      if (activeStepIndex < currentDrill.executionTrace.length - 1) {
        timer = setTimeout(() => {
          setActiveStepIndex(prev => prev + 1)
        }, 650)
      } else {
        setIsRunning(false)
      }
    }
    return () => clearTimeout(timer)
  }, [isRunning, activeStepIndex, currentDrill.executionTrace.length])

  const handleStartSimulation = () => {
    setActiveStepIndex(0)
    setIsRunning(true)
  }

  const handleResetSimulation = () => {
    setIsRunning(false)
    setActiveStepIndex(-1)
  }

  const handleCopyRunbook = () => {
    navigator.clipboard.writeText(currentDrill.runbookSnippet.command)
    setCopiedRunbook(true)
    setTimeout(() => setCopiedRunbook(false), 2000)
  }

  const handleCopyReport = () => {
    const markdown = `# CHAOS RESILIENCE VERIFICATION REPORT
**Drill ID:** ${currentDrill.id}
**System:** ${currentDrill.systemName}
**Category:** ${currentDrill.category}
**Failure Type:** ${currentDrill.failureType}
**Governing ADR:** ${currentDrill.governingAdr}

## 1. INJECTED FAULT
${currentDrill.injectedFault}

## 2. SRE HYPOTHESIS & INVARIANTS
${currentDrill.sreHypothesis}

### Invariants Enforced:
${currentDrill.steadyStateInvariants.map(inv => `- [x] ${inv}`).join('\n')}

## 3. SLA & RESILIENCE TELEMETRY
- **Recovery Point Objective (RPO):** ${currentDrill.impactMetrics.rpo}
- **Recovery Time Objective (RTO):** ${currentDrill.impactMetrics.rto}
- **Availability SLA:** ${currentDrill.impactMetrics.availabilitySla}
- **Data Divergence Rate:** ${currentDrill.impactMetrics.divergenceRate}
- **Max Latency Spike:** ${currentDrill.impactMetrics.maxLatencySpike}

## 4. EXECUTION TRACE
| Timestamp | Phase | Actor | Action | Status | Detail |
| :--- | :--- | :--- | :--- | :--- | :--- |
${currentDrill.executionTrace.map(s => `| ${s.timestamp} | ${s.phase} | ${s.actor} | ${s.action} | ${s.status.toUpperCase()} | ${s.detail} |`).join('\n')}

## 5. SRE RUNBOOK COMMAND
\`\`\`${currentDrill.runbookSnippet.language}
${currentDrill.runbookSnippet.command}
\`\`\`
`
    navigator.clipboard.writeText(markdown)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2000)
  }

  const visibleSteps = activeStepIndex === -1 
    ? currentDrill.executionTrace 
    : currentDrill.executionTrace.slice(0, activeStepIndex + 1)

  return (
    <div className="space-y-6 sm:space-y-8 rounded-2xl border border-slate-800 bg-[#070b12] p-4 sm:p-8 shadow-2xl">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>CHAOS ENGINEERING & DISASTER RECOVERY DRILLS</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
            Enterprise SLA & Chaos Engineering Drill Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Execute simulated production disaster recovery scenarios across all 5 distributed architectures. 
            Inspect sub-second failover mechanics, RPO zero invariants, and automated circuit breaker containment.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={handleCopyReport}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            aria-label="Copy full chaos verification report in Markdown"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Report Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Chaos RFC Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Drill Selector Tabs */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Select Disaster Recovery Drill Scenario (5 Systems):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {CHAOS_DRILLS.map((drill, idx) => {
            const isSelected = drill.id === selectedDrillId
            return (
              <button
                key={drill.id}
                onClick={() => handleSelectDrill(drill.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.12)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-900 text-slate-400'
                  }`}>
                    DRILL 0{idx + 1}
                  </span>
                  <span className="text-slate-500 truncate max-w-[90px]">{drill.category.split(' ')[0]}</span>
                </div>
                <div>
                  <div className={`text-xs font-bold font-editorial line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {drill.title.split('&')[0].trim()}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                    {drill.systemName.split(' ')[0]} {drill.systemName.split(' ')[1]}
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">RTO:</span>
                  <span className="text-rose-400 font-bold tabular-nums">{drill.rtoMetric.split(' ')[0]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Active Drill Specification & Invariants Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 sm:p-6 rounded-xl bg-slate-950/90 border border-slate-800/90">
        {/* Left Column: SRE Context & Injected Fault */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
              {currentDrill.failureType}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Governance: <strong className="text-slate-200">{currentDrill.governingAdr}</strong>
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold font-editorial text-white">
              {currentDrill.title}
            </h4>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Target Architecture: <span className="text-cyan-400">{currentDrill.systemName}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 space-y-1">
            <div className="font-mono font-bold text-[11px] uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Injected Production Fault:</span>
            </div>
            <p className="font-sans leading-relaxed text-slate-300">
              {currentDrill.injectedFault}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Steady-State Invariants Enforced:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentDrill.steadyStateInvariants.map((inv, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-sans leading-tight">{inv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Badges & Run Controls */}
        <div className="space-y-4 lg:border-l lg:border-slate-800/80 lg:pl-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Verified Production SLA Metrics:
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Recovery Point (RPO):</span>
                <span className="text-emerald-400 font-bold tabular-nums">{currentDrill.impactMetrics.rpo}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Recovery Time (RTO):</span>
                <span className="text-rose-400 font-bold tabular-nums">{currentDrill.impactMetrics.rto}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Availability SLA:</span>
                <span className="text-cyan-400 font-bold tabular-nums">{currentDrill.impactMetrics.availabilitySla}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Divergence Rate:</span>
                <span className="text-purple-400 font-bold tabular-nums">{currentDrill.impactMetrics.divergenceRate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Max Latency Spike:</span>
                <span className="text-amber-400 font-bold tabular-nums">{currentDrill.impactMetrics.maxLatencySpike}</span>
              </div>
            </div>
          </div>

          {/* Simulation Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartSimulation}
                disabled={isRunning}
                className={`flex-1 py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Executing Chaos Drill...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Live Chaos Drill</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetSimulation}
                className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Reset drill execution trace"
                title="Reset drill execution trace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] font-mono text-center text-slate-500">
              {activeStepIndex === -1 ? 'Click to trigger step-by-step failover execution log' : `Phase ${activeStepIndex + 1} of ${currentDrill.executionTrace.length} completed`}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Execution Terminal Trace */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>DISASTER RECOVERY EXECUTION TRACE LOG</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Injected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Detected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Mitigated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Recovered
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#040810] overflow-hidden font-mono text-xs shadow-inner">
          {/* Terminal Window Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-slate-400 ml-2">chaos-daemon@sre-cluster:~/{currentDrill.id}</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">
              {visibleSteps.length} of {currentDrill.executionTrace.length} steps visible
            </span>
          </div>

          {/* Trace Steps Container */}
          <div className="p-3 sm:p-4 space-y-2 max-h-[360px] overflow-y-auto scrollbar-thin">
            <AnimatePresence>
              {visibleSteps.map((step, idx) => {
                const isLatest = activeStepIndex !== -1 && idx === activeStepIndex
                
                let phaseBg = 'bg-slate-900 border-slate-700 text-slate-300'
                if (step.phase === 'INJECT') phaseBg = 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                else if (step.phase === 'DETECT') phaseBg = 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                else if (step.phase === 'CIRCUIT_BREAK' || step.phase === 'ISOLATE') phaseBg = 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                else if (step.phase === 'RAFT_QUORUM' || step.phase === 'PROMOTION' || step.phase === 'FAILOVER') phaseBg = 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                else if (step.phase === 'DRAIN') phaseBg = 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                else if (step.phase === 'RECOVERED') phaseBg = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'

                return (
                  <motion.div
                    key={`${step.timestamp}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isLatest 
                        ? 'bg-slate-900/90 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.15)]' 
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="tabular-nums">[{step.timestamp}]</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${phaseBg}`}>
                          {step.phase}
                        </span>
                        <span className="text-cyan-400 font-semibold">{step.actor}</span>
                        <span className="text-slate-500">{'->'}</span>
                        <span className="text-slate-200 font-bold">{step.action}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        {step.status === 'critical' && (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-rose-500" />
                            <span>CRITICAL</span>
                          </span>
                        )}
                        {step.status === 'warning' && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>PROBING</span>
                          </span>
                        )}
                        {step.status === 'mitigated' && (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span>FAILOVER</span>
                          </span>
                        )}
                        {step.status === 'resolved' && (
                          <span className="text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-400" />
                            <span>DRAINING</span>
                          </span>
                        )}
                        {step.status === 'nominal' && (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>RECOVERED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-400 font-sans text-xs pl-0 sm:pl-7 leading-relaxed">
                      {step.detail}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5. Production SRE Runbook Snippet */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>SRE PRODUCTION DISASTER RUNBOOK</span>
          </div>
          <button
            onClick={handleCopyRunbook}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
            aria-label="Copy SRE runbook bash command"
          >
            {copiedRunbook ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Command Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Runbook Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <p className="text-xs text-slate-400 font-sans">
            {currentDrill.runbookSnippet.description}
          </p>
          <pre className="p-3 rounded-lg bg-black/90 border border-slate-800/80 text-emerald-400 font-mono text-xs overflow-x-auto scrollbar-thin">
            <code>{currentDrill.runbookSnippet.command}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
