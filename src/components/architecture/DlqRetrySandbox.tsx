import { useState, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Activity,
  AlertOctagon,
  Flame,
  RefreshCw,
  Archive,
  Trash2,
  FileCode2,
  Layers
} from 'lucide-react'
import {
  DLQ_RETRY_MODELS,
  SEED_DLQ_ITEMS,
  type DlqRetryModel,
  type DlqQueueItem
} from '@/data/dlqRetryModels'

export default function DlqRetrySandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('exponential-decorrelated-jitter')
  const [dlqItems, setDlqItems] = useState<DlqQueueItem[]>(SEED_DLQ_ITEMS)
  const [selectedItemId, setSelectedItemId] = useState<string>(SEED_DLQ_ITEMS[0].id)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; msg: string }>>([])
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const activeModel = DLQ_RETRY_MODELS.find(m => m.id === selectedModelId) || DLQ_RETRY_MODELS[0]

  const appendLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) => {
    const time = new Date().toISOString().substring(11, 23)
    setEventLogs(prev => [...prev.slice(-25), { id: Math.random().toString(), time, level, msg }])
  }, [])

  const resetSandbox = useCallback((model: DlqRetryModel = activeModel) => {
    setDlqItems(SEED_DLQ_ITEMS)
    setSelectedItemId(SEED_DLQ_ITEMS[0].id)
    setIsSimulating(false)
    setEventLogs([
      {
        id: 'init-1',
        time: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        msg: `Initialized ${model.name} session. 4 messages loaded in DLQ parking lot & retry channels.`
      }
    ])
  }, [activeModel])

  useEffect(() => {
    resetSandbox(activeModel)
  }, [selectedModelId, resetSandbox, activeModel])

  const selectedItem = dlqItems.find(i => i.id === selectedItemId) || dlqItems[0]

  // Action: Inject fatal poison pill
  const injectPoisonPill = () => {
    setIsSimulating(true)
    const nextNum = dlqItems.length + 1
    const newMsg: DlqQueueItem = {
      id: `dlq-item-00${nextNum}`,
      messageId: `msg-poison-${Math.floor(10000 + Math.random() * 90000)}`,
      topic: 'orders.v1.events',
      partition: 5,
      offset: 304190 + nextNum,
      retryCount: 4,
      maxRetries: 4,
      errorType: 'SERIALIZATION_POISON_PILL',
      errorMessage: 'JsonParseException: Unexpected character (\'{\') expected valid quote for field name',
      payloadSummary: '{{bad_json:true,orderId:null}}',
      timestamp: new Date().toISOString(),
      status: 'QUARANTINED_DLQ'
    }

    appendLog('WARN', `INJECTED POISON PILL: Malformed unparseable payload received on partition 5 offset ${newMsg.offset}.`)
    
    setTimeout(() => {
      appendLog('ERROR', `CLASSIFIER: Fatal non-retryable error detected. Futile retries bypassed. Dispatched to dlq_quarantine table in 1.4ms.`)
      appendLog('SUCCESS', `Primary topic consumer offset advanced unblocked. Zero head-of-line stalls. SRE webhook triggered.`)
      setDlqItems(prev => [newMsg, ...prev])
      setSelectedItemId(newMsg.id)
      setIsSimulating(false)
    }, 900)
  }

  // Action: Inject transient error with retry
  const injectTransientFailure = () => {
    setIsSimulating(true)
    const nextNum = dlqItems.length + 1
    const newMsg: DlqQueueItem = {
      id: `dlq-item-00${nextNum}`,
      messageId: `msg-transient-${Math.floor(10000 + Math.random() * 90000)}`,
      topic: 'payments.v1.settlement',
      partition: 2,
      offset: 149200 + nextNum,
      retryCount: 1,
      maxRetries: 4,
      errorType: 'DOWNSTREAM_HTTP_503',
      errorMessage: 'HttpServerErrorException: 503 Service Unavailable from settlement-gateway-pod-12',
      payloadSummary: '{"settlementId":"stl-9901","batchTotal":4500.00}',
      timestamp: new Date().toISOString(),
      status: 'PENDING_RETRY'
    }

    appendLog('WARN', `TRANSIENT OUTAGE DETECTED: Downstream gateway returned HTTP 503 on partition 2.`)

    setTimeout(() => {
      appendLog('INFO', `STAGGERED ESCALATION: Published to orders.retry.10s with x-retry-attempt=1. Partition commit advanced.`)
      appendLog('SUCCESS', `Decorrelated jitter timer calculated delay: 1,420ms. Dedicated retry worker scheduled execution.`)
      setDlqItems(prev => [newMsg, ...prev])
      setSelectedItemId(newMsg.id)
      setIsSimulating(false)
    }, 1000)
  }

  // Action: Replay selected message
  const replaySelectedMessage = () => {
    if (!selectedItem || selectedItem.status === 'REPLAYED_SUCCESS') return

    setIsSimulating(true)
    appendLog('INFO', `INITIATING REPLAY: Acquiring Redis idempotency lease for message ${selectedItem.messageId}...`)

    setTimeout(() => {
      appendLog('SUCCESS', `Idempotency Lease Granted: 10,000ms TTL. Rate limiter: 250 msg/s ceiling confirmed. Circuit breaker: CLOSED.`)
      appendLog('SUCCESS', `REPLAY SUCCEEDED: Message re-injected into topic "${selectedItem.topic}". Offset acknowledged.`)
      
      setDlqItems(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...item, status: 'REPLAYED_SUCCESS' } : item
      ))
      setIsSimulating(false)
    }, 1100)
  }

  // Action: Discard/Tombstone selected message
  const discardSelectedMessage = () => {
    if (!selectedItem) return
    appendLog('WARN', `TOMBSTONE APPLIED: Message ${selectedItem.messageId} marked as DISCARDED_TOMBSTONE. Audit record preserved.`)
    setDlqItems(prev => prev.map(item => 
      item.id === selectedItem.id ? { ...item, status: 'DISCARDED_TOMBSTONE' } : item
    ))
  }

  const copyRfcReport = () => {
    const text = `# Architectural RFC: ${activeModel.name}
**Paradigm:** ${activeModel.paradigm}
**Algorithm Formula:** \`${activeModel.algorithmFormula}\`
**Recovery Latency SLA:** ${activeModel.recoveryLatency}
**Poison Pill Isolation:** ${activeModel.poisonPillIsolation}
**Head-of-Line Blocking Defense:** ${activeModel.headOfLineBlockingDefense}
**Architectural Invariant:** ${activeModel.architecturalInvariant}

## Workflow Phases & Invariants
${activeModel.workflowPhases.map(p => `### ${p.name}
- Description: ${p.description}
- Invariant: ${p.invariants}
`).join('\n')}

## Production Metrics & Invariants
${Object.entries(activeModel.productionOutcomes).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

---
*Generated from Meena Kannan Full-Stack Architecture Lab (Distributed DLQ & Non-Blocking Retry Matrix)*`

    navigator.clipboard.writeText(text)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const copyItemJson = () => {
    const text = JSON.stringify(selectedItem, null, 2)
    navigator.clipboard.writeText(text)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  return (
    <div className="w-full bg-[#06090e] border border-[#1e293b] rounded-lg p-4 sm:p-6 text-slate-200 font-mono shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1e293b] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs bg-rose-950/50 text-rose-400 border border-rose-800/60 rounded">
              Engine 22
            </span>
            <span className="px-2 py-0.5 text-xs bg-slate-900 text-slate-400 border border-slate-800 rounded">
              Domain: Resilience &amp; Fault Isolation
            </span>
            <span className="px-2 py-0.5 text-xs bg-purple-950/40 text-purple-300 border border-purple-800/50 rounded flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-purple-400" />
              DLQ &amp; Non-Blocking Retries
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Distributed Dead-Letter Queue (DLQ) &amp; Non-Blocking Retry Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Exponential decorrelated jitter backoff, staggered non-blocking Kafka delay topics, instant poison-pill quarantine, rate-limited idempotent batch replays, and causal watermarking reconciliation.
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
            className="px-3 py-1.5 text-xs bg-[#0b121e] hover:bg-[#131d2e] text-rose-400 border border-rose-800/60 rounded flex items-center gap-1.5 transition-colors"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedRfc ? 'Copied RFC' : 'Copy RFC Spec'}
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
        {DLQ_RETRY_MODELS.map(model => {
          const isSelected = model.id === selectedModelId
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f172a] border-rose-500/70 text-rose-300 shadow-md shadow-rose-950/20'
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
              <div className="mt-2 text-[11px] text-rose-400/90 font-mono">
                {model.recoveryLatency.split(';')[0]}
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
          <div className="px-3 py-1 bg-[#04070c] border border-rose-800/40 rounded text-xs text-rose-300 font-mono">
            Formula: <code className="text-rose-200">{activeModel.algorithmFormula}</code>
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

      {/* Visual Staggered Delay Pipeline Topology Banner */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Asynchronous Multi-Tier Staggered Retry &amp; Quarantine Topology
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 border border-emerald-800/40 bg-emerald-950/30 px-2 py-0.5 rounded">
            Zero Head-of-Line Blocking Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-[#060a12] border border-cyan-800/50 rounded p-2.5">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">Tier 0: Primary</div>
            <div className="text-xs font-bold text-white mt-1">orders.v1.events</div>
            <div className="text-[10px] text-slate-400 mt-1">Full line-rate (15k TPS)</div>
          </div>
          <div className="bg-[#060a12] border border-amber-800/50 rounded p-2.5">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Tier 1: 10s Delay</div>
            <div className="text-xs font-bold text-white mt-1">orders.retry.10s</div>
            <div className="text-[10px] text-slate-400 mt-1">Transient glitch buffer</div>
          </div>
          <div className="bg-[#060a12] border border-orange-800/50 rounded p-2.5">
            <div className="text-[10px] text-orange-400 uppercase font-bold">Tier 2: 1m Delay</div>
            <div className="text-xs font-bold text-white mt-1">orders.retry.1m</div>
            <div className="text-[10px] text-slate-400 mt-1">Pod restart absorption</div>
          </div>
          <div className="bg-[#060a12] border border-rose-800/50 rounded p-2.5">
            <div className="text-[10px] text-rose-400 uppercase font-bold">Tier 3: 5m Delay</div>
            <div className="text-xs font-bold text-white mt-1">orders.retry.5m</div>
            <div className="text-[10px] text-slate-400 mt-1">Third-party outage buffer</div>
          </div>
          <div className="bg-[#060a12] border border-purple-800/50 rounded p-2.5">
            <div className="text-[10px] text-purple-400 uppercase font-bold">Terminal: DLQ</div>
            <div className="text-xs font-bold text-white mt-1">dlq_quarantine</div>
            <div className="text-[10px] text-slate-400 mt-1">SRE triage &amp; replay</div>
          </div>
        </div>
      </div>

      {/* Interactive DLQ Message Grid & Control Station */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Dead-Letter Queue Parking Lot ({dlqItems.length} messages)
            </h4>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={injectPoisonPill}
              disabled={isSimulating}
              className="px-2.5 py-1 text-xs bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              Inject Poison Pill
            </button>
            <button
              onClick={injectTransientFailure}
              disabled={isSimulating}
              className="px-2.5 py-1 text-xs bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <AlertOctagon className="w-3 h-3 text-amber-400" />
              Inject Transient 503
            </button>
            <button
              onClick={replaySelectedMessage}
              disabled={isSimulating || !selectedItem || selectedItem.status === 'REPLAYED_SUCCESS'}
              className="px-2.5 py-1 text-xs bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              Replay Message
            </button>
            <button
              onClick={discardSelectedMessage}
              disabled={!selectedItem || selectedItem.status === 'DISCARDED_TOMBSTONE'}
              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3 text-slate-400" />
              Discard Tombstone
            </button>
          </div>
        </div>

        {/* Message Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {dlqItems.map((item) => {
            const isSelected = item.id === selectedItemId
            const statusColor = 
              item.status === 'QUARANTINED_DLQ' ? 'text-rose-400 border-rose-800/40 bg-rose-950/30' :
              item.status === 'PENDING_RETRY' ? 'text-amber-400 border-amber-800/40 bg-amber-950/30' :
              item.status === 'REPLAYED_SUCCESS' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30' :
              'text-slate-500 border-slate-800 bg-slate-950/40'

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-3 rounded border text-left text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-500 bg-[#0c1829] shadow-sm shadow-rose-950'
                    : 'border-[#1e293b] bg-[#070c14] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold tabular-nums">{item.messageId}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${statusColor}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 text-[11px] line-clamp-1">
                    {item.topic} (p{item.partition}:off{item.offset})
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 line-clamp-2">
                  {item.errorMessage.split(':')[0]}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Message Detailed Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Metadata Card */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-purple-400" />
                Quarantine Metadata &amp; Coordinates
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 tabular-nums">
                Retry Attempts: {selectedItem.retryCount}/{selectedItem.maxRetries}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Message ID:</span>
                <span className="text-white font-mono">{selectedItem.messageId}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Origin Topic:</span>
                <span className="text-cyan-300 font-mono">{selectedItem.topic}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Partition &amp; Offset:</span>
                <span className="text-slate-200 font-mono tabular-nums">Partition {selectedItem.partition} | Offset {selectedItem.offset}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Error Classification:</span>
                <span className="text-rose-400 font-semibold">{selectedItem.errorType}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block mb-1">Exception Message:</span>
                <div className="bg-[#03060a] border border-rose-900/40 text-rose-300 rounded p-2 text-[10px] font-mono break-words leading-relaxed">
                  {selectedItem.errorMessage}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Payload Inspector */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                Quarantined Payload Envelope
              </span>
              <button
                onClick={copyItemJson}
                className="px-2 py-0.5 text-[10px] bg-[#0c1829] hover:bg-[#13233b] text-cyan-400 border border-cyan-800/60 rounded flex items-center gap-1 transition-colors"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied JSON' : 'Copy JSON'}
              </button>
            </div>

            <pre className="bg-[#03060a] border border-[#1e293b] rounded p-2.5 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[175px] flex-1 leading-tight">
              {JSON.stringify(selectedItem, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Production Telemetry Gauges & Live Terminal Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Production Metrics Grid */}
        <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 border-b border-[#1e293b] pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Verified Metrics &amp; SRE SLAs
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
              <Terminal className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Live SRE DLQ Triage Telemetry
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
            <FileCode2 className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Architecture Implementation: <span className="text-rose-300">{activeModel.codeSnippet.filename}</span>
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
