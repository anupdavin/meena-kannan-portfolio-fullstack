import React, { useState, useMemo } from 'react';
import {
  Clock,
  Database,
  Layers,
  History,
  Trash2,
  RotateCcw,
  Copy,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  MVCC_SNAPSHOT_MODELS,
  INITIAL_TUPLE_VERSIONS,
  type MvccSnapshotModel,
  type TupleVersion
} from '../../data/mvccSnapshotModels';

export const MvccSnapshotSandbox: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>(MVCC_SNAPSHOT_MODELS[0].id);
  const [tuples, setTuples] = useState<TupleVersion[]>(INITIAL_TUPLE_VERSIONS);
  const [snapshotXid, setSnapshotXid] = useState<number>(104);
  const [activeTab, setActiveTab] = useState<'timeline' | 'workflow' | 'spec'>('timeline');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [eventStatusMessage, setEventStatusMessage] = useState<string>(
    'Snapshot isolated: Queries at TxID 104 evaluate heap visibility without row locks.'
  );

  const activeModel = useMemo<MvccSnapshotModel>(() => {
    return MVCC_SNAPSHOT_MODELS.find(m => m.id === selectedModelId) || MVCC_SNAPSHOT_MODELS[0];
  }, [selectedModelId]);

  // Evaluate tuple visibility dynamically based on current snapshotXid
  const evaluatedTuples = useMemo(() => {
    return tuples.map(t => {
      const isVisible = t.xmin <= snapshotXid && (t.xmax === null || t.xmax > snapshotXid);
      const isDead = t.xmax !== null && t.xmax < snapshotXid;
      return {
        ...t,
        computedVisible: isVisible,
        computedDead: isDead
      };
    });
  }, [tuples, snapshotXid]);

  const visibleCount = evaluatedTuples.filter(t => t.computedVisible).length;
  const deadCount = evaluatedTuples.filter(t => t.computedDead).length;

  const handleExecuteConcurrentUpdate = () => {
    const nextXid = Math.max(...tuples.map(t => Math.max(t.xmin, t.xmax || 0))) + 1;
    const targetKey = 'acc-1042';
    
    setTuples(prev => {
      const updated = prev.map(t => {
        if (t.rowKey === targetKey && t.xmax === null) {
          return { ...t, xmax: nextXid, status: 'DEAD_RECLAIMABLE' as const };
        }
        return t;
      });
      const newVersionNum = prev.length + 1;
      const priorBalance = prev.find(p => p.rowKey === targetKey && p.xmax === null)?.data.balance || 2100000;
      const newTuple: TupleVersion = {
        versionId: `v${newVersionNum}`,
        rowKey: targetKey,
        xmin: nextXid,
        xmax: null,
        cid: 0,
        ctid: `(0,${newVersionNum})`,
        status: 'ACTIVE',
        data: {
          accountId: targetKey,
          holder: 'Apex Global Logistics',
          balance: priorBalance + 125000,
          currency: 'USD',
          tier: 'ENTERPRISE',
          timestamp: '2026-10-27 16:00:00 UTC'
        },
        hlc: {
          physicalMs: 1730054700000 + (newVersionNum * 60000),
          logicalCounter: newVersionNum
        }
      };
      return [...updated, newTuple];
    });
    setEventStatusMessage(
      `Concurrent Update executed at TxID ${nextXid}: Old tuple expired, new tuple inserted without in-place overwrite.`
    );
  };

  const handleSimulateClockSkew = () => {
    setEventStatusMessage(
      'HLC clock skew detected (offset epsilon = 18ms): Range leaseholder triggered Read Restart at TxID 108 to preserve causality.'
    );
    setSnapshotXid(108);
  };

  const handleVacuumReclaim = () => {
    const safeHorizon = snapshotXid;
    const beforeCount = tuples.length;
    setTuples(prev => prev.filter(t => t.xmax === null || t.xmax >= safeHorizon));
    const reclaimed = beforeCount - tuples.filter(t => t.xmax === null || t.xmax >= safeHorizon).length;
    setEventStatusMessage(
      `Lock-free VACUUM completed: Reclaimed ${reclaimed} dead tuple versions older than safe horizon TxID ${safeHorizon}.`
    );
  };

  const handleResetTuples = () => {
    setTuples(INITIAL_TUPLE_VERSIONS);
    setSnapshotXid(104);
    setEventStatusMessage('Tuple heap reset to baseline state.');
  };

  const copyRfcReport = () => {
    const rfcText = [
      '================================================================================',
      `RFC-033: DISTRIBUTED SNAPSHOT ISOLATION & MVCC SPECIFICATION`,
      `Architecture Model: ${activeModel.name}`,
      `Category          : ${activeModel.category}`,
      `Badge / Invariant : ${activeModel.badge}`,
      `Isolation Level   : ${activeModel.isolationGuarantee}`,
      `Read Latency SLA  : ${activeModel.readLatencySla}`,
      `Write Throughput  : ${activeModel.writeThroughputSla}`,
      `Mathematical Rule : ${activeModel.algorithmFormula}`,
      `Blast Containment : ${activeModel.blastRadiusContainment}`,
      '================================================================================',
      'ARCHITECTURAL INVARIANT:',
      activeModel.architecturalInvariant,
      '',
      'CORE WORKFLOW PHASES:',
      ...activeModel.workflowPhases.map((p, i) =>
        `[Phase ${i + 1}] ${p.name}: ${p.description} (Invariant: ${p.invariants})`
      ),
      '',
      'PRODUCTION VERIFIED OUTCOMES:',
      ...Object.entries(activeModel.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`),
      '================================================================================'
    ].join('\n');

    navigator.clipboard.writeText(rfcText).then(() => {
      setCopyFeedback('Copied RFC Spec to Clipboard!');
      setTimeout(() => setCopyFeedback(null), 2400);
    }).catch(() => {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return (
    <div className="specular-card relative rounded-2xl bg-[#06090e] border border-slate-800 p-6 font-sans text-slate-100 shadow-2xl overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-violet-400 font-semibold">
                Engine 33 : Distributed Storage &amp; Isolation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 font-mono text-[11px] text-violet-300">
                MVCC Time-Travel
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Distributed Snapshot Isolation &amp; MVCC Sandbox
            </h2>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visible:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{visibleCount}</span>
            <span className="text-slate-600">|</span>
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Dead:</span>
            <span className="text-amber-400 font-bold tabular-nums">{deadCount}</span>
          </div>

          <button
            onClick={copyRfcReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-violet-500/50 hover:bg-slate-800 text-xs font-mono text-slate-200 transition-all focus:outline-none focus:ring-1 focus:ring-violet-500"
            aria-label="Copy RFC Specification"
          >
            {copyFeedback ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{copyFeedback}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy RFC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Model Selector Carousel */}
      <div className="relative mt-6">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          Select MVCC Concurrency &amp; Snapshot Architecture:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {MVCC_SNAPSHOT_MODELS.map((model) => {
            const isSelected = model.id === selectedModelId;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-violet-950/20 border-violet-500/60 text-white shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-violet-400 font-semibold uppercase">
                    {model.badge}
                  </span>
                  {isSelected && <Zap className="w-3 h-3 text-violet-400" />}
                </div>
                <div className="text-xs font-bold truncate text-slate-200">
                  {model.name.split(' ')[0]} {model.name.split(' ')[1]}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {model.category.split(' ')[0]} {model.category.split(' ')[1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono border-b-2 transition-all ${
            activeTab === 'timeline'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Tuple Timeline &amp; Scrubber</span>
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono border-b-2 transition-all ${
            activeTab === 'workflow'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Workflow Phases &amp; Invariants</span>
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono border-b-2 transition-all ${
            activeTab === 'spec'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Production Spec &amp; Verification</span>
        </button>
      </div>

      {/* Tab 1: Tuple Timeline & Scrubber */}
      {activeTab === 'timeline' && (
        <div className="mt-6 space-y-6">
          {/* Active Model Snapshot Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400">Architecture Specification</div>
              <div className="text-sm font-bold text-white mt-0.5">{activeModel.name}</div>
              <div className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {activeModel.description}
              </div>
            </div>
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500">Latency: </span>
                <span className="text-emerald-400 font-semibold">{activeModel.readLatencySla}</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500">Isolation: </span>
                <span className="text-violet-300 font-semibold">{activeModel.isolationGuarantee.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Time-Travel Snapshot Scrubber Control */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="snapshot-slider" className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>Snapshot Horizon AS OF SYSTEM TIME:</span>
                <span className="px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold tabular-nums">
                  TxID {snapshotXid}
                </span>
              </label>
              <div className="font-mono text-xs text-slate-400">
                Range: TxID 100 to TxID 112
              </div>
            </div>
            <input
              id="snapshot-slider"
              type="range"
              min={100}
              max={112}
              value={snapshotXid}
              onChange={(e) => setSnapshotXid(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              aria-label="Snapshot Horizon Slider"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>TxID 100 (Genesis)</span>
              <span>TxID 104 (Quarterly Snapshot)</span>
              <span>TxID 112 (Head Version)</span>
            </div>
          </div>

          {/* Heap Tuple Page Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-violet-400" />
                <span>Physical Heap Tuples &amp; Visibility Evaluation</span>
              </h3>
              <span className="font-mono text-[11px] text-slate-500">
                Rule: Visible if xmin &lt;= TxID {snapshotXid} and (xmax is null or xmax &gt; TxID {snapshotXid})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {evaluatedTuples.map((tuple) => {
                const isVis = tuple.computedVisible;
                return (
                  <div
                    key={tuple.versionId}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isVis
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                        : tuple.computedDead
                        ? 'bg-slate-950/80 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {tuple.versionId} [{tuple.ctid}]
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isVis
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tuple.computedDead
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVis ? 'VISIBLE' : tuple.computedDead ? 'DEAD GARBAGE' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-300 truncate mb-1">
                      {tuple.rowKey} ({tuple.data.holder})
                    </div>

                    <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-emerald-400 font-semibold mb-2">
                      Balance: ${tuple.data.balance.toLocaleString('en-US')}.00 {tuple.data.currency}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                      <div>
                        <span className="text-slate-500">t_xmin: </span>
                        <span className="text-violet-400 font-bold tabular-nums">{tuple.xmin}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">t_xmax: </span>
                        <span className="text-amber-400 font-bold tabular-nums">{tuple.xmax ?? 'null'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">HLC Logic: </span>
                        <span className="text-slate-300 tabular-nums">L{tuple.hlc.logicalCounter}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status: </span>
                        <span className="text-slate-300">{tuple.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Simulation HUD */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExecuteConcurrentUpdate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 text-xs font-mono text-violet-300 font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span>Execute Concurrent Update (T2)</span>
              </button>

              <button
                onClick={handleSimulateClockSkew}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/20 border border-amber-500/40 hover:bg-amber-600/30 text-xs font-mono text-amber-300 font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate HLC Clock Skew &amp; Read Restart</span>
              </button>

              <button
                onClick={handleVacuumReclaim}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-mono text-emerald-300 font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trigger VACUUM Horizon Cleanup</span>
              </button>

              <button
                onClick={handleResetTuples}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-all focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Heap</span>
              </button>
            </div>

            {/* Live Event Feed */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
              <span className="text-violet-400 font-bold shrink-0">[MVCC EVENT]:</span>
              <span className="truncate">{eventStatusMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workflow Phases & Invariants */}
      {activeTab === 'workflow' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Mathematical Concurrency Invariant:
            </h3>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-violet-300">
              {activeModel.algorithmFormula}
            </div>
            <div className="mt-3 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{activeModel.architecturalInvariant}</span>
            </div>
          </div>

          <div className="space-y-3">
            {activeModel.workflowPhases.map((phase, idx) => (
              <div
                key={phase.name}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col md:flex-row md:items-start gap-4"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1">{phase.name}</div>
                  <div className="text-xs text-slate-400 leading-relaxed mb-2">
                    {phase.description}
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Invariant: {phase.invariants}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Production Verified Outcomes */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Production Verified Benchmarks &amp; SLAs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(activeModel.productionOutcomes).map(([metric, value]) => (
                <div
                  key={metric}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs"
                >
                  <div className="text-slate-500">{metric}</div>
                  <div className="text-slate-200 font-bold mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Production Spec & Verification */}
      {activeTab === 'spec' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Production Java Architecture Spec</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Reference implementation conforming to {activeModel.name}
              </div>
            </div>
            <button
              onClick={copyRfcReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:bg-slate-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Full Spec</span>
            </button>
          </div>

          <div className="relative rounded-xl bg-[#03060a] border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
              <span>{activeModel.id.replace(/-/g, '_')}.java</span>
              <span className="text-[11px] text-slate-600">Java 21 LTS / Virtual Threads</span>
            </div>
            <pre className="p-4 font-mono text-xs text-violet-300 overflow-x-auto leading-relaxed">
              <code>{activeModel.specCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
export default MvccSnapshotSandbox;
