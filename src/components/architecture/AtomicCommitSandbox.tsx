import React, { useState } from 'react';
import {
  ATOMIC_COMMIT_PARADIGMS,
  INITIAL_PARTICIPANTS,
  INITIAL_DRIFT_ITEMS,
  type CommitParticipant,
  type InvariantDriftItem
} from '../../data/atomicCommitModels';

export const AtomicCommitSandbox: React.FC = () => {
  const [selectedParadigmId, setSelectedParadigmId] = useState<string>('two-phase-commit');
  const [participants, setParticipants] = useState<CommitParticipant[]>(INITIAL_PARTICIPANTS);
  const [coordinatorState, setCoordinatorState] = useState<'IDLE' | 'PHASE_1_PREPARING' | 'COORDINATOR_CRASHED' | 'GLOBAL_COMMITTED' | 'GLOBAL_ABORTED'>('IDLE');
  const [activeTxId, setActiveTxId] = useState<string>('TX-8921-XA');
  const [coordinatorWalOffset, setCoordinatorWalOffset] = useState<string>('0x70E410');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Dual-write drift engine state
  const [driftItems, setDriftItems] = useState<InvariantDriftItem[]>(INITIAL_DRIFT_ITEMS);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  const activeParadigm = ATOMIC_COMMIT_PARADIGMS.find(p => p.id === selectedParadigmId) || ATOMIC_COMMIT_PARADIGMS[0];

  // Action: Step 1 - Broadcast Prepare
  const handlePreparePhase = () => {
    setCoordinatorState('PHASE_1_PREPARING');
    setCoordinatorWalOffset('0x70E480');
    setParticipants(prev =>
      prev.map(p => ({
        ...p,
        state: 'PREPARED',
        locksHeld: 3,
        walLogOffset: '0x' + (parseInt(p.walLogOffset, 16) + 32).toString(16).toUpperCase()
      }))
    );
  };

  // Action: Step 2 - Commit
  const handleCommitPhase = () => {
    setCoordinatorState('GLOBAL_COMMITTED');
    setCoordinatorWalOffset('0x70E510');
    setParticipants(prev =>
      prev.map(p => ({
        ...p,
        state: 'COMMITTED',
        locksHeld: 0,
        walLogOffset: '0x' + (parseInt(p.walLogOffset, 16) + 48).toString(16).toUpperCase()
      }))
    );
  };

  // Action: Coordinator Crash in Phase 1 (The classic 2PC in-doubt vulnerability)
  const handleCoordinatorCrash = () => {
    setCoordinatorState('COORDINATOR_CRASHED');
    setParticipants(prev =>
      prev.map(p => ({
        ...p,
        state: 'IN_DOUBT',
        locksHeld: 3
      }))
    );
  };

  // Action: Coordinator Recovery / Journal Replay
  const handleCoordinatorRecovery = () => {
    setCoordinatorState('GLOBAL_COMMITTED');
    setCoordinatorWalOffset('0x70E580');
    setParticipants(prev =>
      prev.map(p => ({
        ...p,
        state: 'COMMITTED',
        locksHeld: 0,
        walLogOffset: '0x' + (parseInt(p.walLogOffset, 16) + 64).toString(16).toUpperCase()
      }))
    );
  };

  // Action: Abort Transaction
  const handleAbortPhase = () => {
    setCoordinatorState('GLOBAL_ABORTED');
    setCoordinatorWalOffset('0x70E4F0');
    setParticipants(prev =>
      prev.map(p => ({
        ...p,
        state: 'ABORTED',
        locksHeld: 0
      }))
    );
  };

  // Action: Reset
  const handleReset = () => {
    setCoordinatorState('IDLE');
    setActiveTxId('TX-' + Math.floor(1000 + Math.random() * 9000) + '-XA');
    setCoordinatorWalOffset('0x70E410');
    setParticipants(INITIAL_PARTICIPANTS);
  };

  // Action: Inject Drift into Secondary store
  const handleInjectDrift = () => {
    const randomHex = () => '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    setDriftItems(prev => [
      {
        entityId: 'ORD-' + Math.floor(9025 + Math.random() * 100) + '-TX',
        primaryStore: 'PostgreSQL Orders (Status: DELIVERED, Tier: VIP)',
        secondaryStore: 'Elasticsearch Index (Status: PROCESSING, Tier: STANDARD)',
        primaryCrc: randomHex(),
        secondaryCrc: randomHex(),
        driftStatus: 'DRIFT_DETECTED',
        deltaFields: ['delivery_status', 'vip_loyalty_tier'],
        lastReconciledMsAgo: 1
      },
      ...prev.slice(0, 4)
    ]);
  };

  // Action: Run CRC-32 Reconciler
  const handleReconcileDrift = () => {
    setIsReconciling(true);
    setDriftItems(prev =>
      prev.map(item => ({
        ...item,
        driftStatus: 'RECONCILING'
      }))
    );

    setTimeout(() => {
      setDriftItems(prev =>
        prev.map(item => ({
          ...item,
          secondaryCrc: item.primaryCrc,
          driftStatus: 'HEALED',
          deltaFields: [],
          lastReconciledMsAgo: 0
        }))
      );
      setIsReconciling(false);
    }, 750);
  };

  // Clipboard Helpers
  const showCopiedToast = (label: string) => {
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCopyRfc = () => {
    const rfcMarkdown = `# Architectural RFC: Distributed Two-Phase Commit (2PC) vs Saga Execution Matrix
## Architecture Paradigm: ${activeParadigm.title}
- Category: ${activeParadigm.category}
- Blocking Invariant: ${activeParadigm.blockingNature}
- Peak Throughput: ${activeParadigm.throughputTps}
- Latency P99: ${activeParadigm.latencyP99}
- Recovery Guarantee: ${activeParadigm.recoveryGuarantee}

### Core Architectural Description
${activeParadigm.description}

### Trade-Off Invariant Analysis
${activeParadigm.tradeOffSummary}

### Step-by-Step State Invariants
${activeParadigm.steps.map(s => `* [${s.phase}] ${s.action} (${s.actor}) -> Invariant: ${s.invariant}`).join('\n')}

### Production Reference Implementation
\`\`\`
${activeParadigm.specCode}
\`\`\`
`;
    navigator.clipboard.writeText(rfcMarkdown);
    showCopiedToast('RFC Spec Copied to Clipboard!');
  };

  const handleCopyTopologyJson = () => {
    const topology = {
      transactionId: activeTxId,
      paradigm: activeParadigm.id,
      coordinator: {
        state: coordinatorState,
        walOffset: coordinatorWalOffset
      },
      participants,
      driftItems
    };
    navigator.clipboard.writeText(JSON.stringify(topology, null, 2));
    showCopiedToast('Topology JSON Copied to Clipboard!');
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Engine 24 - Atomic Coordination
              </span>
              <span className="text-xs text-slate-500 font-mono">RFC-XA-3PC-SAGA</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Distributed 2PC vs Saga & Dual-Write Invariant Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive simulation contrasting synchronous blocking Two-Phase Commit, non-blocking 3PC, asynchronous Transactional Outbox Sagas, and CRC-32 drift reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyRfc}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Copy Architectural RFC to clipboard"
            >
              <span>Copy RFC Spec</span>
            </button>
            <button
              onClick={handleCopyTopologyJson}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1.5"
              title="Export state topology JSON"
            >
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {copyFeedback && (
          <div className="mt-3 py-1 px-3 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block animate-fade-in">
            {copyFeedback}
          </div>
        )}

        {/* Paradigm Switcher Tabs */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-thin">
          {ATOMIC_COMMIT_PARADIGMS.map(paradigm => {
            const isSelected = paradigm.id === selectedParadigmId;
            return (
              <button
                key={paradigm.id}
                onClick={() => setSelectedParadigmId(paradigm.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {paradigm.title.split(' ')[0]} {paradigm.title.split(' ')[1]}
              </button>
            );
          })}
        </div>

        {/* Active Paradigm Overview Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Blocking Nature</span>
            <span className={`font-semibold ${
              activeParadigm.blockingNature.includes('Strictly')
                ? 'text-rose-400'
                : activeParadigm.blockingNature.includes('Non-Blocking')
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}>
              {activeParadigm.blockingNature}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Line Rate Throughput</span>
            <span className="text-white font-semibold">{activeParadigm.throughputTps}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">P99 Latency</span>
            <span className="text-cyan-400 font-semibold">{activeParadigm.latencyP99}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Recovery Guarantee</span>
            <span className="text-indigo-300 font-semibold truncate block" title={activeParadigm.recoveryGuarantee}>
              {activeParadigm.recoveryGuarantee}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Topology Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 2PC Topology HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Multi-Resource Commit Topology
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  TxID: {activeTxId}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                WAL Offset: <span className="text-emerald-400 font-semibold">{coordinatorWalOffset}</span>
              </div>
            </div>

            {/* Coordinator Node Visualizer */}
            <div className={`p-4 rounded-xl border transition-all mb-5 ${
              coordinatorState === 'COORDINATOR_CRASHED'
                ? 'bg-rose-950/30 border-rose-600/50 shadow-rose-900/20 shadow-lg'
                : coordinatorState === 'PHASE_1_PREPARING'
                ? 'bg-amber-950/30 border-amber-500/50 shadow-amber-900/20 shadow-lg'
                : coordinatorState === 'GLOBAL_COMMITTED'
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-900/20 shadow-lg'
                : coordinatorState === 'GLOBAL_ABORTED'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    coordinatorState === 'COORDINATOR_CRASHED'
                      ? 'bg-rose-500'
                      : coordinatorState === 'PHASE_1_PREPARING'
                      ? 'bg-amber-400'
                      : coordinatorState === 'GLOBAL_COMMITTED'
                      ? 'bg-emerald-400'
                      : 'bg-slate-600'
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      Transaction Coordinator (XA TM)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Java 21 LTS Atomikos / Narayana Engine
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border ${
                    coordinatorState === 'COORDINATOR_CRASHED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : coordinatorState === 'PHASE_1_PREPARING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : coordinatorState === 'GLOBAL_COMMITTED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : coordinatorState === 'GLOBAL_ABORTED'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {coordinatorState}
                  </span>
                </div>
              </div>

              {coordinatorState === 'COORDINATOR_CRASHED' && (
                <div className="mt-3 p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono leading-relaxed">
                  CRITICAL: Coordinator died while participants were in PREPARED state. Downstream databases cannot unilaterally decide commit or abort without violating ACID consistency; all row locks remain indefinitely frozen in-doubt.
                </div>
              )}
            </div>

            {/* Connecting Pipes / Wire Visualizer */}
            <div className="flex items-center justify-around py-1 text-xs font-mono text-slate-600 mb-2">
              <span>| RPC Pipe |</span>
              <span>| RPC Pipe |</span>
              <span>| RPC Pipe |</span>
            </div>

            {/* Participant Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {participants.map(p => {
                const isInDoubt = p.state === 'IN_DOUBT';
                const isPrepared = p.state === 'PREPARED';
                const isCommitted = p.state === 'COMMITTED';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                      isInDoubt
                        ? 'bg-rose-950/20 border-rose-500/60 shadow-md shadow-rose-950/40'
                        : isPrepared
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : isCommitted
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-[11px] truncate block" title={p.name}>
                        {p.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isInDoubt
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : isPrepared
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isCommitted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.state}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-3 truncate">
                      {p.engine}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Locks Held:</span>
                        <span className={`font-semibold ${p.locksHeld > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {p.locksHeld} exclusive
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">WAL Offset:</span>
                        <span className="text-slate-300">{p.walLogOffset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">RTT Latency:</span>
                        <span className="text-cyan-400">{p.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Control Trigger Strip */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap gap-2 items-center">
              <button
                onClick={handlePreparePhase}
                disabled={coordinatorState !== 'IDLE'}
                className="px-3.5 py-2 rounded-lg text-xs font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                1. Phase 1: Prepare Vote
              </button>

              <button
                onClick={handleCommitPhase}
                disabled={coordinatorState !== 'PHASE_1_PREPARING'}
                className="px-3.5 py-2 rounded-lg text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                2. Phase 2: Global Commit
              </button>

              <button
                onClick={handleCoordinatorCrash}
                disabled={coordinatorState !== 'PHASE_1_PREPARING'}
                className="px-3.5 py-2 rounded-lg text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                title="Simulate coordinator crash during prepared phase (triggers in-doubt lock freeze)"
              >
                Inject Coordinator Crash
              </button>

              {coordinatorState === 'COORDINATOR_CRASHED' && (
                <button
                  onClick={handleCoordinatorRecovery}
                  className="px-3.5 py-2 rounded-lg text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 transition-all font-semibold animate-pulse"
                >
                  Replay WAL & Recover
                </button>
              )}

              <button
                onClick={handleAbortPhase}
                disabled={coordinatorState !== 'PHASE_1_PREPARING'}
                className="px-3 py-2 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Abort
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all ml-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Step-by-Step State Invariant Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl text-xs font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              State Invariant Progression - {activeParadigm.title.split(' ')[0]}
            </h4>
            <div className="space-y-2">
              {activeParadigm.steps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                    <span>{step.phase}</span>
                    <span className="text-[10px] text-slate-500">{step.actor}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mb-1.5 leading-relaxed">
                    {step.action}
                  </p>
                  <div className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-1 rounded">
                    Invariant: {step.invariant}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dual-Write Drift Reconciler & Code Spec (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual-Write Invariant Drift & Self-Healing Reconciler */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Dual-Write Invariant Drift Engine
                </h4>
                <p className="text-[11px] text-slate-400">
                  CRC-32 sliding window detecting silent replication drop
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleInjectDrift}
                  className="px-2.5 py-1 rounded text-[11px] font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                >
                  Inject Drift
                </button>
                <button
                  onClick={handleReconcileDrift}
                  disabled={isReconciling}
                  className="px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  {isReconciling ? 'Reconciling...' : 'Auto-Heal'}
                </button>
              </div>
            </div>

            {/* Drift Items List */}
            <div className="space-y-2.5 text-xs font-mono max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {driftItems.map(item => {
                const isDrifting = item.driftStatus === 'DRIFT_DETECTED';
                const isHealed = item.driftStatus === 'HEALED';

                return (
                  <div
                    key={item.entityId}
                    className={`p-3 rounded-lg border transition-all ${
                      isDrifting
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : isHealed
                        ? 'bg-cyan-950/20 border-cyan-500/40'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-[11px]">
                        {item.entityId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isDrifting
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.driftStatus === 'RECONCILING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : isHealed
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.driftStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="truncate text-slate-400">
                        Primary: <span className="text-slate-200">{item.primaryStore}</span>
                      </div>
                      <div className="truncate text-slate-400">
                        Secondary: <span className="text-slate-200">{item.secondaryStore}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div>
                        CRC: <span className="text-indigo-300">{item.primaryCrc}</span> vs <span className={item.primaryCrc === item.secondaryCrc ? 'text-indigo-300' : 'text-rose-400 font-bold'}>{item.secondaryCrc}</span>
                      </div>
                      {item.deltaFields.length > 0 && (
                        <div className="text-rose-300">
                          Delta: [{item.deltaFields.join(', ')}]
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Implementation Code Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Implementation Spec - {activeParadigm.title.split(' ')[0]}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeParadigm.specCode);
                  showCopiedToast('Spec Code Copied!');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Copy Code
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-80 scrollbar-thin">
              <code>{activeParadigm.specCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
