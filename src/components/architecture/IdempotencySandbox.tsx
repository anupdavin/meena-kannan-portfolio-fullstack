import { useState, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  FileCode2,
  Clock,
  AlertTriangle
} from 'lucide-react'
import {
  IDEMPOTENCY_MODELS,
  SEED_IDEMPOTENCY_RECORDS,
  type IdempotencyModel,
  type IdempotencyRecord
} from '@/data/idempotencyModels'

export default function IdempotencySandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>('redis-redlock-fencing-tokens')
  const [records, setRecords] = useState<IdempotencyRecord[]>(SEED_IDEMPOTENCY_RECORDS)
  const [selectedRecordId, setSelectedRecordId] = useState<string>(SEED_IDEMPOTENCY_RECORDS[0].id)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; msg: string }>>([])
  const [copiedRfc, setCopiedRfc] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const activeModel = IDEMPOTENCY_MODELS.find(m => m.id === selectedModelId) || IDEMPOTENCY_MODELS[0]

  const appendLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) => {
    const time = new Date().toISOString().substring(11, 23)
    setEventLogs(prev => [...prev.slice(-25), { id: Math.random().toString(), time, level, msg }])
  }, [])

  const resetSandbox = useCallback((model: IdempotencyModel = activeModel) => {
    setRecords(SEED_IDEMPOTENCY_RECORDS)
    setSelectedRecordId(SEED_IDEMPOTENCY_RECORDS[0].id)
    setIsSimulating(false)
    setEventLogs([
      {
        id: 'init-1',
        time: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        msg: `Initialized ${model.name} session. 6 active idempotency keys loaded in Redis & DB ledger.`
      }
    ])
  }, [activeModel])

  useEffect(() => {
    resetSandbox(activeModel)
  }, [selectedModelId, resetSandbox, activeModel])

  const selectedRecord = records.find(r => r.id === selectedRecordId) || records[0]

  // Action: Double-Click Duplicate Hammer (Simulates 2 concurrent requests with identical key)
  const triggerDuplicateHammer = () => {
    setIsSimulating(true)
    const hammerKey = `idem-hammer-${Math.floor(1000 + Math.random() * 9000)}`
    appendLog('INFO', `RAPID FIRE HAMMER: Client dispatched 2 concurrent POST /api/v1/checkout requests with identical Idempotency-Key: "${hammerKey}".`)

    setTimeout(() => {
      appendLog('SUCCESS', `REQUEST 1 (Thread-A): Acquired Redis lease lock. Status=RESERVED_IN_FLIGHT. Assigned Fencing Token #1048. Executing business transaction...`)
    }, 400)

    setTimeout(() => {
      appendLog('WARN', `REQUEST 2 (Thread-B): Collision detected on "${hammerKey}". Status is already IN_FLIGHT. Ingress filter returned HTTP 409 Conflict (Retry-After: 2s).`)
    }, 700)

    setTimeout(() => {
      appendLog('SUCCESS', `TRANSACTION 1 COMMITTED: Output cached in Redis with 86400s TTL. HTTP 201 Created stored with Fencing Token #1048.`)
      
      const newRec: IdempotencyRecord = {
        id: `rec-idem-hammer-${Date.now()}`,
        idempotencyKey: hammerKey,
        status: 'COMMITTED_COMPLETED',
        fencingToken: 1048,
        requestMethod: 'POST',
        endpoint: '/api/v1/orders/checkout',
        requestSha256: '9a84b0114a88ef39c9012a4f66914bca81023910ffea89104baec91823901bca',
        cachedResponseCode: 201,
        cachedResponseBody: {
          orderId: `ord-hammer-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'CONFIRMED',
          totalUsd: 199.00,
          fencingToken: 1048,
          zeroDuplicateGuarantee: true
        },
        ttlSecondsRemaining: 86400,
        createdAt: new Date().toISOString()
      }

      setRecords(prev => [newRec, ...prev])
      setSelectedRecordId(newRec.id)
      setIsSimulating(false)
    }, 1200)
  }

  // Action: Key Tampering Probe (Reuses existing key with mutated body)
  const triggerTamperProbe = () => {
    setIsSimulating(true)
    appendLog('WARN', `KEY TAMPERING PROBE: Client submitted existing key "${selectedRecord.idempotencyKey}" but altered order total from $384.50 to $999.00.`)

    setTimeout(() => {
      appendLog('ERROR', `CRYPTOGRAPHIC MISMATCH: SHA-256 payload digest differs from recorded envelope. Expected ${selectedRecord.requestSha256.substring(0, 16)}...`)
      appendLog('ERROR', `SECURITY INTERCEPTION: Gateway rejected request with HTTP 422 Unprocessable Entity. Zero state corruption or key hijacking.`)
      setIsSimulating(false)
    }, 900)
  }

  // Action: Expiry Scrubber (Forces TTL to 0 and tests database fallback)
  const triggerTtlEviction = () => {
    appendLog('WARN', `REDIS CACHE EVICTION: Simulating 24h expiration for key "${selectedRecord.idempotencyKey}". Redis cache evicted key.`)
    setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ttlSecondsRemaining: 0, status: 'EXPIRED_EVICTED' } : r))
    setTimeout(() => {
      appendLog('SUCCESS', `DATABASE CAS FALLBACK: Client replayed request. Cache missed -> queried PostgreSQL idempotency_ledger on unique constraint. Response reconstructed in 1.4ms.`)
    }, 600)
  }

  const copyRfcReport = () => {
    const text = `# Architectural RFC: ${activeModel.name}
**Paradigm:** ${activeModel.paradigm}
**Algorithm Formula:** \`${activeModel.algorithmFormula}\`
**Deduplication Latency:** ${activeModel.dedupLatency}
**Double Execution Defense:** ${activeModel.doubleExecutionDefense}
**Storage Model:** ${activeModel.storageModel}
**Architectural Invariant:** ${activeModel.architecturalInvariant}

## Workflow Phases & Invariants
${activeModel.workflowPhases.map(p => `### ${p.name}
- Description: ${p.description}
- Invariant: ${p.invariants}
`).join('\n')}

## Production Metrics & Invariants
${Object.entries(activeModel.productionOutcomes).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

---
*Generated from Meena Kannan Full-Stack Architecture Lab (Distributed Idempotency & Two-Phase Ingress Committer)*`

    navigator.clipboard.writeText(text)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const copyRecordJson = () => {
    const text = JSON.stringify(selectedRecord, null, 2)
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
            <span className="px-2 py-0.5 text-xs bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 rounded">
              Engine 23
            </span>
            <span className="px-2 py-0.5 text-xs bg-slate-900 text-slate-400 border border-slate-800 rounded">
              Domain: Ingress Idempotency &amp; CAS Locks
            </span>
            <span className="px-2 py-0.5 text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Linearizable Exactly-Once Semantics
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Distributed Idempotency Key &amp; Two-Phase Ingress Committer Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Redis Redlock monotonic fencing tokens, IETF RFC 9110 sliding-window reserve-and-commit gates, PostgreSQL atomic unique CAS locks, Stripe webhook replay ledgers, and SHA-256 payload fingerprinting.
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
            className="px-3 py-1.5 text-xs bg-[#0b121e] hover:bg-[#131d2e] text-indigo-400 border border-indigo-800/60 rounded flex items-center gap-1.5 transition-colors"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedRfc ? 'Copied RFC' : 'Copy RFC Spec'}
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
        {IDEMPOTENCY_MODELS.map(model => {
          const isSelected = model.id === selectedModelId
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f172a] border-indigo-500/70 text-indigo-300 shadow-md shadow-indigo-950/20'
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
              <div className="mt-2 text-[11px] text-indigo-400/90 font-mono">
                {model.dedupLatency.split(';')[0]}
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
          <div className="px-3 py-1 bg-[#04070c] border border-indigo-800/40 rounded text-xs text-indigo-300 font-mono">
            Formula: <code className="text-indigo-200">{activeModel.algorithmFormula}</code>
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

      {/* Visual Ingress Committer Lifecycle HUD */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Two-Phase Ingress Committer State Machine (RFC 9110 &amp; Redlock)
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 border border-emerald-800/40 bg-emerald-950/30 px-2 py-0.5 rounded">
            Zero Double-Spend Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#060a12] border border-cyan-800/50 rounded p-2.5">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">Step 1: Check Ingress</div>
            <div className="text-xs font-bold text-white mt-1">Extract Idempotency-Key</div>
            <div className="text-[10px] text-slate-400 mt-1">SHA-256 canonical hashing</div>
          </div>
          <div className="bg-[#060a12] border border-amber-800/50 rounded p-2.5">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Step 2: Reserve In-Flight</div>
            <div className="text-xs font-bold text-white mt-1">SET NX EX 120s</div>
            <div className="text-[10px] text-slate-400 mt-1">409 Conflict if locked</div>
          </div>
          <div className="bg-[#060a12] border border-indigo-800/50 rounded p-2.5">
            <div className="text-[10px] text-indigo-400 uppercase font-bold">Step 3: Fencing Execution</div>
            <div className="text-xs font-bold text-white mt-1">INCR Monotonic Token</div>
            <div className="text-[10px] text-slate-400 mt-1">CAS write &gt; db.token</div>
          </div>
          <div className="bg-[#060a12] border border-emerald-800/50 rounded p-2.5">
            <div className="text-[10px] text-emerald-400 uppercase font-bold">Step 4: Commit &amp; Cache</div>
            <div className="text-xs font-bold text-white mt-1">24h Sliding Retention</div>
            <div className="text-[10px] text-slate-400 mt-1">Cached 201 Created</div>
          </div>
        </div>
      </div>

      {/* Interactive Idempotency Record Explorer & Hammer Station */}
      <div className="bg-[#090e17] border border-[#1e293b] rounded-lg p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Idempotency Ledger ({records.length} records)
            </h4>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={triggerDuplicateHammer}
              disabled={isSimulating}
              className="px-2.5 py-1 text-xs bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Simulates rapid-fire concurrent double-clicks with identical key"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              Duplicate Hammer
            </button>
            <button
              onClick={triggerTamperProbe}
              disabled={isSimulating}
              className="px-2.5 py-1 text-xs bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Tests payload tampering detection on replayed key"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Tamper Key Probe
            </button>
            <button
              onClick={triggerTtlEviction}
              disabled={selectedRecord.ttlSecondsRemaining === 0}
              className="px-2.5 py-1 text-xs bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-700/60 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Evicts Redis cache to trigger database unique CAS fallback"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              Evict Redis TTL
            </button>
          </div>
        </div>

        {/* Record Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {records.map((rec) => {
            const isSelected = rec.id === selectedRecordId
            const statusColor = 
              rec.status === 'COMMITTED_COMPLETED' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30' :
              rec.status === 'RESERVED_IN_FLIGHT' ? 'text-amber-400 border-amber-800/40 bg-amber-950/30' :
              rec.status === 'CONFLICT_REJECTED' ? 'text-rose-400 border-rose-800/40 bg-rose-950/30' :
              'text-slate-500 border-slate-800 bg-slate-950/40'

            return (
              <button
                key={rec.id}
                onClick={() => setSelectedRecordId(rec.id)}
                className={`p-3 rounded border text-left text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-[#0c1829] shadow-sm shadow-indigo-950'
                    : 'border-[#1e293b] bg-[#070c14] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold tabular-nums">Token #{rec.fencingToken}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${statusColor}`}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 text-[11px] line-clamp-1 font-mono">
                    {rec.idempotencyKey}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="text-cyan-400">{rec.requestMethod} {rec.endpoint.split('/')[3]}</span>
                  <span className="tabular-nums font-mono text-[9px]">TTL: {rec.ttlSecondsRemaining}s</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Record Detailed Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Metadata Card */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Idempotency Envelope Coordinates
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 tabular-nums">
                HTTP {selectedRecord.cachedResponseCode}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Idempotency Key:</span>
                <span className="text-indigo-300 font-mono font-semibold">{selectedRecord.idempotencyKey}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Monotonic Fencing Token:</span>
                <span className="text-white font-mono tabular-nums font-bold">#{selectedRecord.fencingToken}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Target Endpoint:</span>
                <span className="text-cyan-300 font-mono">{selectedRecord.requestMethod} {selectedRecord.endpoint}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e293b]/50 pb-1.5">
                <span className="text-slate-400">Status State:</span>
                <span className="text-emerald-400 font-semibold">{selectedRecord.status}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block mb-1">SHA-256 Request Fingerprint:</span>
                <div className="bg-[#03060a] border border-indigo-900/40 text-indigo-300 rounded p-2 text-[10px] font-mono break-all leading-relaxed">
                  {selectedRecord.requestSha256}
                </div>
              </div>
            </div>
          </div>

          {/* Cached Response Body Inspector */}
          <div className="bg-[#060a12] border border-[#1e293b] rounded-lg p-3 sm:p-4 text-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                Cached HTTP Response Body (Zero DB Queries on Replay)
              </span>
              <button
                onClick={copyRecordJson}
                className="px-2 py-0.5 text-[10px] bg-[#0c1829] hover:bg-[#13233b] text-cyan-400 border border-cyan-800/60 rounded flex items-center gap-1 transition-colors"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied JSON' : 'Copy JSON'}
              </button>
            </div>

            <pre className="bg-[#03060a] border border-[#1e293b] rounded p-2.5 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[175px] flex-1 leading-tight">
              {JSON.stringify(selectedRecord.cachedResponseBody, null, 2)}
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
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Ingress Idempotency Filter Telemetry
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
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Architecture Implementation: <span className="text-indigo-300">{activeModel.codeSnippet.filename}</span>
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
