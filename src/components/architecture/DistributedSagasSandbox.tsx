import { useState, useId, useEffect, useCallback } from 'react'
import {
  Play,
  RotateCcw,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  Terminal,
  Activity,
  Database,
  Layers,
  Undo2
} from 'lucide-react'
import { DISTRIBUTED_SAGA_MODELS, type DistributedSagaModel, type SagaStep } from '@/data/distributedSagas'

export default function DistributedSagasSandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('orchestrated-saga-temporal')
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const [simulationState, setSimulationState] = useState<'IDLE' | 'FORWARD' | 'FAILED' | 'COMPENSATING' | 'COMPLETED' | 'ROLLED_BACK'>('IDLE')
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false)
  const [steps, setSteps] = useState<SagaStep[]>([])
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; msg: string }>>([])
  const [viewMode, setViewMode] = useState<'orchestrated' | 'choreographed'>('orchestrated')
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const activeModel = DISTRIBUTED_SAGA_MODELS.find(m => m.id === selectedModelId) || DISTRIBUTED_SAGA_MODELS[0]

  const appendLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) => {
    const time = new Date().toISOString().substring(11, 23)
    setEventLogs(prev => [...prev.slice(-25), { id: Math.random().toString(), time, level, msg }])
  }, [])

  const resetSimulation = useCallback((model: DistributedSagaModel = activeModel) => {
    setActiveStepIndex(0)
    setSimulationState('IDLE')
    setIsAutoPlaying(false)
    const freshSteps: SagaStep[] = model.steps.map(s => ({
      ...s,
      status: 'PENDING'
    }))
    setSteps(freshSteps)
    setEventLogs([
      {
        id: 'init-1',
        time: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        msg: `Initialized ${model.name} session with SagaId #SAGA-${Math.floor(1000 + Math.random() * 9000)}.`
      }
    ])
  }, [activeModel])

  // Initialize steps whenever model changes
  useEffect(() => {
    resetSimulation(activeModel)
  }, [selectedModelId, resetSimulation, activeModel])

  // Advance forward 1 step
  const advanceForwardStep = useCallback(() => {
    setSimulationState(prevState => {
      if (prevState === 'COMPLETED' || prevState === 'ROLLED_BACK' || prevState === 'COMPENSATING') return prevState

      setSteps(current => {
        const nextSteps = [...current]
        const stepIdx = activeStepIndex

        if (stepIdx < nextSteps.length) {
          nextSteps[stepIdx] = { ...nextSteps[stepIdx], status: 'SUCCESS' }
          appendLog('SUCCESS', `Completed forward step ${stepIdx + 1}: [${nextSteps[stepIdx].service}] -> ${nextSteps[stepIdx].name} (${nextSteps[stepIdx].durationMs}ms).`)
          
          const nextIdx = stepIdx + 1
          setActiveStepIndex(nextIdx)

          if (nextIdx >= nextSteps.length) {
            setIsAutoPlaying(false)
            appendLog('SUCCESS', `Saga successfully finalized. All ${nextSteps.length} distributed activities committed with zero 2PC locks.`)
            return nextSteps
          }
        }
        return nextSteps
      })

      if (activeStepIndex + 1 >= activeModel.steps.length) {
        return 'COMPLETED'
      }
      return 'FORWARD'
    })
  }, [activeStepIndex, activeModel.steps.length, appendLog])

  // Inject failure at current or step 3
  const injectFailure = () => {
    setIsAutoPlaying(false)
    const targetIdx = Math.min(activeStepIndex, steps.length - 1)

    setSteps(current => {
      const nextSteps = [...current]
      nextSteps[targetIdx] = { ...nextSteps[targetIdx], status: 'FAILED' }
      return nextSteps
    })

    setSimulationState('FAILED')
    appendLog('ERROR', `FAULT INJECTED at step ${targetIdx + 1} [${steps[targetIdx]?.service}]: Insufficient funds / network timeout. Forward progress halted.`)

    if (activeModel.id === 'forward-recovery-retry') {
      appendLog('WARN', 'Forward Recovery mode active: initiating exponential backoff retry loop with full jitter (attempt 1/5).')
      setTimeout(() => {
        appendLog('INFO', 'Retry attempt 2: transient socket error cleared. Recovering forward execution.')
        setSteps(current => {
          const next = [...current]
          next[targetIdx] = { ...next[targetIdx], status: 'SUCCESS' }
          return next
        })
        setActiveStepIndex(targetIdx + 1)
        setSimulationState('FORWARD')
      }, 1200)
    } else {
      appendLog('WARN', 'Backward compensation cascade initiated: executing compensating transactions in reverse LIFO order.')
      setTimeout(() => {
        executeCompensationSequence(targetIdx)
      }, 700)
    }
  }

  // Backward compensation cascade
  const executeCompensationSequence = (failedIndex: number) => {
    setSimulationState('COMPENSATING')
    let currentUndo = failedIndex - 1

    const stepInterval = setInterval(() => {
      if (currentUndo >= 0) {
        const undoIdx = currentUndo
        setSteps(current => {
          const next = [...current]
          next[undoIdx] = { ...next[undoIdx], status: 'COMPENSATED' }
          return next
        })
        appendLog('WARN', `COMPENSATED step ${undoIdx + 1} [${steps[undoIdx]?.service}]: ${steps[undoIdx]?.compensatingAction}. Reversal confirmed.`)
        currentUndo--
      } else {
        clearInterval(stepInterval)
        setSimulationState('ROLLED_BACK')
        appendLog('SUCCESS', 'All prior completed steps successfully reversed. System restored to baseline consistent state.')
      }
    }, 650)
  }

  // Autoplay ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (isAutoPlaying && (simulationState === 'IDLE' || simulationState === 'FORWARD')) {
      timer = setTimeout(() => {
        advanceForwardStep()
      }, 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isAutoPlaying, simulationState, advanceForwardStep])

  const copyRfcReport = () => {
    const text = `# Architectural RFC: ${activeModel.name}
**Paradigm:** ${activeModel.paradigm}
**Coordination Model:** ${activeModel.coordinationModel}
**Fault Recovery Style:** ${activeModel.faultRecoveryStyle}
**Coupling:** ${activeModel.couplingType}
**Isolation Guarantee:** ${activeModel.isolationGuarantee}
**Architectural Invariant:** ${activeModel.architecturalInvariant}

## Workflow Activities & Compensating Transactions
${activeModel.steps.map((s, idx) => `### Step ${idx + 1}: ${s.name} (${s.service})
- Forward Action: \`${s.action}\`
- Compensating Action: \`${s.compensatingAction}\`
- Latency Budget: ${s.durationMs}ms
- Payload: ${s.payloadSummary}
- Undo Summary: ${s.undoSummary}
`).join('\n')}

## Production Metrics & Invariants
${Object.entries(activeModel.productionOutcomes).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

---
*Generated from Meena Kannan Full-Stack Architecture Lab (Saga Orchestration vs Choreography)*`

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

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#080d1a] p-4 sm:p-6 lg:p-8 space-y-6 shadow-2xl">
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
              DISTRIBUTED SYSTEMS ENGINE 19 | SAGA COMPENSATION
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Distributed Saga Orchestration vs Choreography & Compensation State Engine
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl font-sans mt-1">
            Evaluate 5 distributed transaction and compensation architectures across microservices. Inspect forward activity progression, backward semantic compensation stacks, Kafka CDC outbox log-tailing, and exponential backoff retry recovery.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyRfcReport}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            title="Copy Production RFC Spec in Markdown"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedRfc ? 'RFC Copied!' : 'Copy Saga RFC'}</span>
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
          Select Saga & Compensation Architecture Model:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2" id={modelSelectId}>
          {DISTRIBUTED_SAGA_MODELS.map((model) => {
            const isSelected = model.id === selectedModelId
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {model.badge}
                  </span>
                  {isSelected && <Activity className="w-3.5 h-3.5 text-cyan-400" />}
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
          <span className="text-slate-500 block text-[10px] uppercase">Coordination Model:</span>
          <span className="text-cyan-300 font-bold">{activeModel.coordinationModel.split(';')[0]}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Coupling Style:</span>
          <span className="text-slate-200">{activeModel.couplingType.split(';')[0]}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Fault Recovery:</span>
          <span className="text-rose-400 font-semibold">{activeModel.faultRecoveryStyle}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Isolation Model:</span>
          <span className="text-amber-300">{activeModel.isolationGuarantee.split(';')[0]}</span>
        </div>
      </div>

      {/* 4. Interactive Simulation Control Deck */}
      <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">Simulation Controls:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
              simulationState === 'COMPLETED'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                : simulationState === 'ROLLED_BACK'
                ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                : simulationState === 'FAILED' || simulationState === 'COMPENSATING'
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                : simulationState === 'FORWARD'
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              STATE: {simulationState}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono mr-1">
              <button
                onClick={() => setViewMode('orchestrated')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'orchestrated'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Orchestrator
              </button>
              <button
                onClick={() => setViewMode('choreographed')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'choreographed'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Choreography
              </button>
            </div>

            <button
              onClick={advanceForwardStep}
              disabled={simulationState === 'COMPLETED' || simulationState === 'ROLLED_BACK' || simulationState === 'COMPENSATING'}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Step Forward ({activeStepIndex + 1}/{steps.length})</span>
            </button>

            <button
              onClick={() => setIsAutoPlaying(p => !p)}
              disabled={simulationState === 'COMPLETED' || simulationState === 'ROLLED_BACK'}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAutoPlaying ? 'Pause Auto' : 'Auto Play'}</span>
            </button>

            <button
              onClick={injectFailure}
              disabled={simulationState === 'COMPLETED' || simulationState === 'ROLLED_BACK' || simulationState === 'COMPENSATING'}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Inject Step Failure</span>
            </button>

            <button
              onClick={() => resetSimulation()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 5. Visual Stepper Graph */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {steps.map((step, idx) => {
            const isCurrent = idx === activeStepIndex && (simulationState === 'FORWARD' || simulationState === 'IDLE')
            const isSuccess = step.status === 'SUCCESS'
            const isFailed = step.status === 'FAILED'
            const isCompensated = step.status === 'COMPENSATED'

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                  isFailed
                    ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : isCompensated
                    ? 'bg-purple-950/30 border-purple-500/80'
                    : isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/60'
                    : isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Step {idx + 1}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                    isFailed
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : isCompensated
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : isSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {step.status}
                  </span>
                </div>

                {/* Service Name & Title */}
                <div className="font-mono text-xs font-bold text-white mb-0.5 truncate">
                  {step.name}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mb-2">
                  @{step.service}
                </div>

                {/* Forward Action Code */}
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800/80 mb-2 truncate" title={step.action}>
                  <span className="text-emerald-400 font-bold">&gt;&nbsp;</span>
                  {step.action}
                </div>

                {/* Compensating Action Code */}
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800/80 mb-2 truncate" title={step.compensatingAction}>
                  <span className="text-rose-400 font-bold">&#8630;&nbsp;</span>
                  {step.compensatingAction}
                </div>

                {/* Execution Detail */}
                <div className="text-[10px] text-slate-400 leading-tight">
                  {isCompensated ? (
                    <span className="text-purple-300 flex items-center gap-1">
                      <Undo2 className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{step.undoSummary}</span>
                    </span>
                  ) : isFailed ? (
                    <span className="text-rose-300">
                      Execution failed. Forward pipeline blocked.
                    </span>
                  ) : isSuccess ? (
                    <span className="text-emerald-300">
                      {step.payloadSummary}
                    </span>
                  ) : (
                    <span>Awaiting scheduler trigger...</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. Deep Technical Specifications Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Workflow Phases & Invariants */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-mono text-white">Workflow Phases & Invariants</h4>
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
                  <span className="text-cyan-400 font-bold shrink-0">Invariant:</span>
                  <span>{phase.invariants}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold uppercase block mb-1">Architectural Invariant Guarantee:</span>
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
                <h4 className="text-sm font-bold font-mono text-white">Live Event Log & Compensation Trace</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-tailing LIFO Stack</span>
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
                <span className="text-cyan-300 font-bold text-[11px] block">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Syntax-Highlighted Code Blueprint */}
      <div className="rounded-xl border border-slate-800 bg-[#060a12] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b1220] border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-white font-bold">{activeModel.codeSnippet.filename}</span>
            <span className="text-slate-500">({activeModel.codeSnippet.language})</span>
          </div>
          <span className="text-slate-500 text-[10px]">Production Spring Boot & Temporal / Kafka Implementation</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
          <code>{activeModel.codeSnippet.code}</code>
        </pre>
      </div>
    </div>
  )
}
