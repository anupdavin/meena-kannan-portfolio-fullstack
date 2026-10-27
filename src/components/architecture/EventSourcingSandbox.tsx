import { useState, useId, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Activity,
  Database,
  Layers,
  History,
  Play,
  FastForward,
  AlertTriangle,
  FileCode2,
  BookmarkCheck
} from 'lucide-react'
import {
  EVENT_SOURCING_MODELS,
  SEED_EVENT_STREAM,
  type EventSourcingModel,
  type EventStreamRecord
} from '@/data/eventSourcing'

export default function EventSourcingSandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('append-only-event-store')
  const [eventStream, setEventStream] = useState<EventStreamRecord[]>(SEED_EVENT_STREAM)
  const [scrubPosition, setScrubPosition] = useState<number>(SEED_EVENT_STREAM.length)
  const [snapshotSequence, setSnapshotSequence] = useState<number | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(SEED_EVENT_STREAM[0].id)
  const [isSimulatingConflict, setIsSimulatingConflict] = useState<boolean>(false)
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; msg: string }>>([])
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [copiedSchema, setCopiedSchema] = useState(false)

  const activeModel = EVENT_SOURCING_MODELS.find(m => m.id === selectedModelId) || EVENT_SOURCING_MODELS[0]

  const appendLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) => {
    const time = new Date().toISOString().substring(11, 23)
    setEventLogs(prev => [...prev.slice(-25), { id: Math.random().toString(), time, level, msg }])
  }, [])

  const resetSandbox = useCallback((model: EventSourcingModel = activeModel) => {
    setEventStream(SEED_EVENT_STREAM)
    setScrubPosition(SEED_EVENT_STREAM.length)
    setSnapshotSequence(null)
    setSelectedEventId(SEED_EVENT_STREAM[0].id)
    setIsSimulatingConflict(false)
    setEventLogs([
      {
        id: 'init-1',
        time: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        msg: `Initialized ${model.name} session. Loaded stream "ord-8849-ae12" with 6 immutable events.`
      }
    ])
  }, [activeModel])

  useEffect(() => {
    resetSandbox(activeModel)
  }, [selectedModelId, resetSandbox, activeModel])

  // Derive aggregate state at scrubPosition
  const visibleEvents = eventStream.slice(0, scrubPosition)
  
  const reconstructedState = visibleEvents.reduce(
    (acc, evt) => {
      acc.sequence = evt.sequence
      acc.lastEventType = evt.eventType
      if (evt.eventType === 'OrderPlacedEvent') {
        acc.status = 'PLACED'
        acc.total = Number(evt.payload.totalAmount) || 0
      } else if (evt.eventType === 'ItemAddedEvent') {
        acc.itemCount += Number(evt.payload.quantity) || 1
        acc.total += (Number(evt.payload.unitPrice) || 0) * (Number(evt.payload.quantity) || 1)
      } else if (evt.eventType === 'DiscountCodeAppliedEvent') {
        acc.total -= Number(evt.payload.discountAmount) || 0
      } else if (evt.eventType === 'PaymentAuthorizedEvent') {
        acc.status = 'PAID'
      } else if (evt.eventType === 'OrderShippedEvent') {
        acc.status = 'SHIPPED'
      } else if (evt.eventType === 'CustomerFeedbackAddedEvent') {
        acc.feedbackCount += 1
      }
      return acc
    },
    { status: 'INITIAL', total: 0, itemCount: 0, feedbackCount: 0, sequence: 0, lastEventType: 'None' }
  )

  const selectedEvent = eventStream.find(e => e.id === selectedEventId) || eventStream[0]

  // Action: Append event
  const appendNewEvent = (type: 'ItemAddedEvent' | 'CustomerFeedbackAddedEvent') => {
    const nextSeq = eventStream.length + 1
    const newEvt: EventStreamRecord = {
      id: `evt-01934a10-700${nextSeq}-7000-8000-00000000000${nextSeq}`,
      streamId: 'ord-8849-ae12',
      sequence: nextSeq,
      eventType: type,
      timestamp: new Date().toISOString(),
      payload: type === 'ItemAddedEvent' 
        ? { sku: 'SKU-SYSTEM-DESIGN-GUIDE', quantity: 1, unitPrice: 32.00, category: 'architecture-guides' }
        : { rating: 5, comment: 'High-craft distributed architecture demonstration', verifiedCustomer: true },
      metadata: {
        correlationId: `req-corr-00${nextSeq}`,
        causationId: type === 'ItemAddedEvent' ? 'cmd-add-item' : 'cmd-post-feedback',
        actor: 'user-browser',
        schemaVersion: 2
      }
    }

    setEventStream(prev => [...prev, newEvt])
    setScrubPosition(nextSeq)
    setSelectedEventId(newEvt.id)
    appendLog('SUCCESS', `APPEND SUCCESS: Committed ${type} at version ${nextSeq}. OCC version verification passed (expected ${nextSeq - 1}, actual ${nextSeq - 1}).`)
  }

  // Action: Trigger snapshot
  const createSnapshotCheckpoint = () => {
    setSnapshotSequence(scrubPosition)
    appendLog('SUCCESS', `SNAPSHOT MATERIALIZED: Checkpoint saved at version ${scrubPosition}. State: Status=${reconstructedState.status}, Total=$${reconstructedState.total.toFixed(2)}, Items=${reconstructedState.itemCount}.`)
    appendLog('INFO', `Snapshot Optimization: Cold replay from stream was ~${(scrubPosition * 28).toFixed(0)}ms. Future hydrations from this checkpoint take sub-1.8ms.`)
  }

  // Action: OCC conflict simulation
  const simulateOccConflict = () => {
    setIsSimulatingConflict(true)
    appendLog('WARN', 'SIMULATING OCC CONFLICT: Client worker worker-02 dispatched command with stale expected version 3, while active stream is at version ' + eventStream.length + '.')

    setTimeout(() => {
      appendLog('ERROR', `OPTIMISTIC LOCK REJECTED: OptimisticConcurrencyException thrown. Database rejected INSERT into event_store: version condition failed. Zero data corruption.`)
      appendLog('INFO', 'RECOVERY ACTION: Aggregate automatically reloads latest events, rebases command payload against state at version ' + eventStream.length + ', and retries.')
      setIsSimulatingConflict(false)
    }, 1100)
  }

  const copyRfcReport = () => {
    const text = `# Architectural RFC: ${activeModel.name}
**Paradigm:** ${activeModel.paradigm}
**Algorithm Formula:** \`${activeModel.algorithmFormula}\`
**Replay Efficiency:** ${activeModel.replayEfficiency}
**Storage Efficiency:** ${activeModel.storageEfficiency}
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
*Generated from Meena Kannan Full-Stack Architecture Lab (Distributed Event Sourcing & CQRS)*`

    navigator.clipboard.writeText(text)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const copyEventSchema = () => {
    const text = JSON.stringify(selectedEvent, null, 2)
    navigator.clipboard.writeText(text)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  const scrubSliderId = useId()

  return (
    <div className="w-full bg-[#06090e] border border-[#1e293b] rounded-lg p-4 sm:p-6 text-slate-200 font-mono shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1e293b] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 rounded">
              Engine 21
            </span>
            <span className="px-2 py-0.5 text-xs bg-slate-900 text-slate-400 border border-slate-800 rounded">
              Domain: Event Sourcing & CQRS
            </span>
            <span className="px-2 py-0.5 text-xs bg-amber-950/40 text-amber-300 border border-amber-800/50 rounded flex items-center gap-1">
              <History className="w-3 h-3 text-amber-400" />
              Temporal State Replay
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Distributed Event Sourcing & CQRS Snapshotting Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Append-only event stores, deterministic point-in-time state reconstruction, periodic checkpoint snapshotting (cutting replay latency from 180ms to 1.8ms), and Debezium CDC CQRS read model projections.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => resetSandbox(activeModel)}
            className="px-3 py-1.5 text-xs bg-[#0b121e] hover:bg-[#131d2e] text-slate-300 border border-[#1e293b] rounded flex items-center gap-1.5 transition-colors"
            title="Reset simulation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>
          <button
            onClick={copyRfcReport}
            className="px-3 py-1.5 text-xs bg-[#0b121e] hover:bg-[#131d2e] text-cyan-400 border border-cyan-800/60 rounded flex items-center gap-1.5 transition-colors"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedRfc ? 'Copied RFC' : 'Copy RFC Spec'}
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
        {EVENT_SOURCING_MODELS.map(model => {
          const isSelected = model.id === selectedModelId
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f172a] border-cyan-500/70 text-cyan-300 shadow-md shadow-cyan-950/20'
                  : 'bg-[#080d17] border-[#1e293b] text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                  {model.badge}
                </span>
                <span className="font-semibold text-slate-200 line-clamp-1">
                  {model.name.split('(')[0].trim()}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-cyan-400/90 font-mono">
                {model.replayEfficiency.split(';')[0]}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Model Specification Summary Banner */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1e293b]/70 pb-3 mb-3">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>{activeModel.name}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Paradigm: <span className="text-slate-300">{activeModel.paradigm}</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-[#04070c] border border-cyan-800/40 rounded text-xs text-cyan-300 font-mono">
            Formula: <code className="text-cyan-200">{activeModel.algorithmFormula}</code>
          </div>
        </div>

        {/* Workflow Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeModel.workflowPhases.map((phase, idx) => (
            <div key={idx} className="bg-[#060a12] border border-[#1e293b] rounded p-3 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${phase.color}`}>
                  {phase.name}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                {phase.description}
              </p>
              <div className="text-[10px] text-slate-400 border-t border-[#1e293b]/60 pt-1.5">
                <strong className="text-slate-300">Invariant:</strong> {phase.invariants}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Event Stream Visualizer & Time-Travel Controls */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Immutable Event Stream: <span className="text-cyan-300">ord-8849-ae12</span>
            </h4>
            <span className="text-[11px] text-slate-400 tabular-nums">
              ({eventStream.length} total events in log)
            </span>
          </div>

          {/* Stream actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => appendNewEvent('ItemAddedEvent')}
              className="px-2.5 py-1 text-xs bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-700/60 rounded flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              Append ItemAdded
            </button>
            <button
              onClick={() => appendNewEvent('CustomerFeedbackAddedEvent')}
              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 text-slate-400" />
              Append Feedback
            </button>
            <button
              onClick={createSnapshotCheckpoint}
              className="px-2.5 py-1 text-xs bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-700/60 rounded flex items-center gap-1 transition-colors"
              title="Materialize checkpoint at current scrubber position"
            >
              <BookmarkCheck className="w-3 h-3 text-amber-400" />
              Checkpoint Snapshot
            </button>
            <button
              onClick={simulateOccConflict}
              disabled={isSimulatingConflict}
              className="px-2.5 py-1 text-xs bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {isSimulatingConflict ? 'Injecting Conflict...' : 'Simulate OCC 409'}
            </button>
          </div>
        </div>

        {/* Time-Travel Scrubbing Slider */}
        <div className="bg-[#060a12] border border-[#1e293b] rounded p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <label htmlFor={scrubSliderId} className="font-semibold text-slate-200">
                Time-Travel Point-in-Time Replay Scrubber:
              </label>
              <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 font-bold tabular-nums">
                Version {scrubPosition} of {eventStream.length}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Reconstructed in <span className="text-emerald-400 font-bold tabular-nums">{snapshotSequence && scrubPosition >= snapshotSequence ? '1.8ms (Snapshot + Delta)' : '18ms (Stream Fold)'}</span>
            </div>
          </div>
          <input
            id={scrubSliderId}
            type="range"
            min={1}
            max={eventStream.length}
            value={scrubPosition}
            onChange={(e) => setScrubPosition(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 tabular-nums">
            <span>Seq 1: OrderPlaced</span>
            {snapshotSequence && (
              <span className="text-amber-400 font-semibold">
                [Checkpoint @ Seq {snapshotSequence}]
              </span>
            )}
            <span>Seq {eventStream.length}: Current Head</span>
          </div>
        </div>

        {/* Visual Event Stream Sequence */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Sequential Event Log (Click to Inspect Envelope):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {eventStream.map((evt) => {
              const isIncludedInScrub = evt.sequence <= scrubPosition
              const isSelected = evt.id === selectedEventId
              const isSnapshot = evt.sequence === snapshotSequence

              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-2.5 rounded border text-left text-xs transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'border-cyan-400 bg-[#0c1829] shadow-sm shadow-cyan-950'
                      : isIncludedInScrub
                      ? 'border-slate-700/80 bg-[#070c14] text-slate-200 hover:border-slate-500'
                      : 'border-slate-800 bg-[#04070c] opacity-40 text-slate-500'
                  }`}
                >
                  {isSnapshot && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-bl">
                      SNAP
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold tabular-nums">#{evt.sequence}</span>
                      <span className="text-[9px] text-slate-500">{evt.timestamp.substring(14, 19)}</span>
                    </div>
                    <div className="font-semibold text-slate-200 text-[11px] line-clamp-1">
                      {evt.eventType.replace('Event', '')}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-cyan-400/80 font-mono">
                    {evt.eventType === 'OrderPlacedEvent' && `$${Number(evt.payload.totalAmount).toFixed(2)}`}
                    {evt.eventType === 'ItemAddedEvent' && `+${evt.payload.quantity} item`}
                    {evt.eventType === 'DiscountCodeAppliedEvent' && `-$${evt.payload.discountAmount}`}
                    {evt.eventType === 'PaymentAuthorizedEvent' && `Auth OK`}
                    {evt.eventType === 'OrderShippedEvent' && `Shipped`}
                    {evt.eventType === 'CustomerFeedbackAddedEvent' && `5-Star`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Live Reconstructed Aggregate State vs Selected Event Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Reconstructed State Panel */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Materialized Aggregate State (Folded to Seq {scrubPosition})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 tabular-nums">
                Applied: {visibleEvents.length} Events
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              <div className="bg-[#03060a] border border-[#1e293b] rounded p-2 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Order Status</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {reconstructedState.status}
                </div>
              </div>
              <div className="bg-[#03060a] border border-[#1e293b] rounded p-2 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Total Amount</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5 tabular-nums">
                  ${reconstructedState.total.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#03060a] border border-[#1e293b] rounded p-2 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Items In Cart</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5 tabular-nums">
                  {reconstructedState.itemCount} items
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 bg-[#03060a] border border-[#1e293b]/60 rounded p-2.5">
              <div className="flex justify-between">
                <span>Aggregate ID:</span>
                <span className="text-slate-200 font-mono">ord-8849-ae12</span>
              </div>
              <div className="flex justify-between">
                <span>Monotonic Version:</span>
                <span className="text-cyan-400 font-bold tabular-nums">{reconstructedState.sequence}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Applied Event:</span>
                <span className="text-slate-200">{reconstructedState.lastEventType}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Snapshot Checkpoint:</span>
                <span className={snapshotSequence ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {snapshotSequence ? `Version ${snapshotSequence}` : 'None (Full Stream Replay)'}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Event JSON Envelope Inspector */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                Event Envelope: #{selectedEvent.sequence} ({selectedEvent.eventType})
              </span>
              <button
                onClick={copyEventSchema}
                className="px-2 py-0.5 text-[10px] bg-[#0c1829] hover:bg-[#13233b] text-cyan-400 border border-cyan-800/60 rounded flex items-center gap-1 transition-colors"
              >
                {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedSchema ? 'Copied JSON' : 'Copy JSON'}
              </button>
            </div>

            <pre className="bg-[#03060a] border border-[#1e293b] rounded p-2.5 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[160px] leading-tight">
              {JSON.stringify(selectedEvent, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Production Telemetry Gauges & Invariant Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Production Metrics Grid */}
        <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 border-b border-[#1e293b] pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Verified Metrics & SRE SLAs
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(activeModel.productionOutcomes).map(([metric, value], idx) => (
              <div key={idx} className="bg-[#060a12] border border-[#1e293b] rounded p-2.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  {metric}
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal Activity Log */}
        <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-[#1e293b] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Event Store SRE Telemetry
              </h4>
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums">
              {eventLogs.length} events logged
            </span>
          </div>

          <div className="bg-[#03060a] border border-[#1e293b] rounded p-2.5 font-mono text-[10px] overflow-y-auto max-h-[165px] flex-1 space-y-1">
            {eventLogs.map(log => {
              const levelColor =
                log.level === 'SUCCESS' ? 'text-emerald-400' :
                log.level === 'WARN' ? 'text-amber-400' :
                log.level === 'ERROR' ? 'text-rose-400 font-bold' : 'text-cyan-400'
              return (
                <div key={log.id} className="leading-snug flex items-start gap-1.5">
                  <span className="text-slate-600 tabular-nums shrink-0">{log.time}</span>
                  <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${levelColor}`}>
                    [{log.level}]
                  </span>
                  <span className="text-slate-300 break-words">{log.msg}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Production Code Specification */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Architecture Implementation: <span className="text-cyan-300">{activeModel.codeSnippet.filename}</span>
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 uppercase">
            Language: {activeModel.codeSnippet.language} (Java 21 LTS)
          </span>
        </div>

        <pre className="bg-[#03060a] border border-[#1e293b] rounded p-3 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[220px] leading-relaxed">
          {activeModel.codeSnippet.code}
        </pre>
        <div className="mt-3 text-[11px] text-slate-400 border-t border-[#1e293b]/60 pt-2 flex items-center gap-2">
          <strong className="text-slate-300 shrink-0">Architectural Invariant:</strong>
          <span>{activeModel.architecturalInvariant}</span>
        </div>
      </div>
    </div>
  )
}
