import React, { useState, useMemo } from 'react';
import {
  SPLIT_BRAIN_MODELS,
  INITIAL_CLUSTER_NODES,
  type ClusterNode,
  type PartitionDrillResult
} from '../../data/splitBrainResolverModels';

export const SplitBrainResolverSandbox: React.FC = () => {
  const [selectedParadigmId, setSelectedParadigmId] = useState<string>('quorum-fencing-generation-tokens');
  const [partitionState, setPartitionState] = useState<'NORMAL' | 'PARTITIONED' | 'HEALED'>('NORMAL');
  const [zombieAttemptCount, setZombieAttemptCount] = useState<number>(0);
  const [lastDrillResult, setLastDrillResult] = useState<PartitionDrillResult | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const activeParadigm = useMemo(() => {
    return SPLIT_BRAIN_MODELS.find((m) => m.id === selectedParadigmId) || SPLIT_BRAIN_MODELS[0];
  }, [selectedParadigmId]);

  // Compute live cluster node states depending on partition simulation
  const clusterNodes: ClusterNode[] = useMemo(() => {
    if (partitionState === 'NORMAL') {
      return INITIAL_CLUSTER_NODES;
    }
    if (partitionState === 'PARTITIONED') {
      return INITIAL_CLUSTER_NODES.map((n) => {
        if (n.datacenter.includes('DC1')) {
          return {
            ...n,
            epoch: 15, // Advanced by majority quorum
            role: n.id === 'node-dc1-a' ? 'Leader' : 'Follower',
            isIsolated: false,
            status: 'ONLINE',
            activeWritesAccepted: n.activeWritesAccepted + 840
          };
        } else {
          return {
            ...n,
            role: 'Frozen',
            isIsolated: true,
            status: 'QUORUM_FROZEN',
            activeWritesAccepted: n.activeWritesAccepted // Zero writes accepted
          };
        }
      });
    }
    // HEALED state
    return INITIAL_CLUSTER_NODES.map((n) => ({
      ...n,
      epoch: 15,
      role: n.id === 'node-dc1-a' ? 'Leader' : 'Follower',
      isIsolated: false,
      status: 'HEALED',
      activeWritesAccepted: n.activeWritesAccepted + 1250
    }));
  }, [partitionState]);

  // Trigger network partition injection
  const triggerPartition = () => {
    setPartitionState('PARTITIONED');
    const result: PartitionDrillResult = {
      drillId: `drill_${Date.now().toString(36)}`,
      partitionScenario: 'Transatlantic WAN Fiber Cut (DC1 us-east-1 vs DC2 eu-central-1)',
      isolatedDc: 'DC2 (eu-central-1, 2 nodes)',
      majorityDc: 'DC1 (us-east-1, 3 nodes)',
      majorityVotes: '3 of 5 (Strict Quorum Majority Achieved)',
      minorityAction: 'QUORUM_FROZEN (HTTP 503 / LeaderNotAvailable returned)',
      zombieWritesRejectedCount: zombieAttemptCount + 14,
      convergenceTimeMs: 182,
      reconciliationStatus: 'CONSISTENCY_PRESERVED',
      auditLog: 'CRITICAL WAN_SPLIT: DC1 nodes 1,2,3 formed Quorum Majority. Epoch bumped to 15. DC2 minority nodes 4,5 entered QUORUM_FROZEN. 14 stale-epoch zombie writes rejected at storage tier.'
    };
    setLastDrillResult(result);
  };

  // Trigger partition healing
  const triggerHealing = () => {
    setPartitionState('HEALED');
    const result: PartitionDrillResult = {
      drillId: `heal_${Date.now().toString(36)}`,
      partitionScenario: 'WAN Interconnect Restored (Anti-Entropy State Merged)',
      isolatedDc: 'NONE (Cluster Unified)',
      majorityDc: 'Global Mesh (5 of 5 nodes)',
      majorityVotes: '5 of 5 Quorum Re-established',
      minorityAction: 'Resumed as active followers; caught up via Raft AppendEntries',
      zombieWritesRejectedCount: zombieAttemptCount,
      convergenceTimeMs: 46,
      reconciliationStatus: 'AUTO_HEALED',
      auditLog: 'WAN_RESTORED: Inter-datacenter peering re-established. Join-semilattice vector clock merge converged across 10,000 records in 1.14ms. Zero data divergence verified.'
    };
    setLastDrillResult(result);
  };

  // Simulate zombie master write from isolated DC2
  const injectZombieWrite = () => {
    setZombieAttemptCount((prev) => prev + 1);
    const result: PartitionDrillResult = {
      drillId: `zombie_${Date.now().toString(36)}`,
      partitionScenario: 'Zombie Master Write Attempt (Isolated Node 4 sending Epoch 14 write)',
      isolatedDc: 'DC2 (eu-central-1)',
      majorityDc: 'DC1 (us-east-1)',
      majorityVotes: 'Rejected by Storage Tier Fencing Gate',
      minorityAction: 'FencingTokenViolation: Request Epoch 14 < Storage Highest Epoch 15',
      zombieWritesRejectedCount: zombieAttemptCount + 1,
      convergenceTimeMs: 0.38,
      reconciliationStatus: 'CONSISTENCY_PRESERVED',
      auditLog: 'SECURITY_GATE: Stale Epoch 14 write from partitioned Node 4 rejected in 0.38ms. Invariant preserved: Zero dirty writes committed to storage.'
    };
    setLastDrillResult(result);
  };

  const copyRfcReport = () => {
    const report = `# RFC: Distributed Network Partition & Split-Brain Quorum Resolution
Status: Production Enforced (ADR-028)
Cluster Topology: 5 Nodes (DC1 us-east-1: 3 nodes | DC2 eu-central-1: 2 nodes)
Active Partition State: ${partitionState}

Paradigm: ${activeParadigm.name} [${activeParadigm.badge}]
Category: ${activeParadigm.category}
Reconciliation Latency: ${activeParadigm.reconciliationLatency}
Split-Brain Defense SLA: ${activeParadigm.splitBrainDefenseSla}
Blast Radius Boundary: ${activeParadigm.blastRadiusContainment}

Mathematical Algorithm & Invariant:
  Formula: ${activeParadigm.algorithmFormula}
  Invariant: "${activeParadigm.architecturalInvariant}"

Workflow Phases & Security Invariants:
${activeParadigm.workflowPhases.map((p, idx) => `  ${idx + 1}. [${p.name}] ${p.description}\n     Invariant: ${p.invariants}`).join('\n')}

Production Outcomes:
${Object.entries(activeParadigm.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`).join('\n')}

Implementation Blueprint:
\`\`\`typescript
${activeParadigm.specCode}
\`\`\`
Generated via Meena Kannan Architecture Portfolio Suite.`;

    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied RFC Report to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyRfc = copyRfcReport;

  const copySpecCode = () => {
    navigator.clipboard.writeText(activeParadigm.specCode);
    setCopyFeedback('Copied Specification Code to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div className="w-full bg-[#06090e] border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 text-slate-200 font-sans shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge & Meta Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
              ADR-028: Network Partition &amp; Split-Brain Resolution
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Engine 28 of 28
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              CAP Theorem Linearizability Guard
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Distributed Chaos Engineering &amp; Split-Brain Resolver Sandbox
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Simulate datacenter WAN network blackholes, strict quorum majority election ($Q = \lfloor N/2 \rfloor + 1$), generation epoch token fencing, semi-lattice vector clock merging, and automated blast radius containment.
          </p>
        </div>

        {/* 1-Click RFC Copy Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyRfc}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopyRfc();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Copy Split-Brain Resolution RFC Report"
          >
            <span>[ Copy Split-Brain RFC ]</span>
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="mt-3 p-2 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono rounded text-center animate-fade-in relative z-20">
          {copyFeedback}
        </div>
      )}

      {/* Interactive Cluster Topology HUD & Partition Trigger */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Multi-Region Cluster State:
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                partitionState === 'NORMAL'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : partitionState === 'PARTITIONED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {partitionState === 'NORMAL' && 'ONLINE (WAN Synced, Epoch 14)'}
              {partitionState === 'PARTITIONED' && 'WAN BLACKHOLE INJECTED (DC1 Majority vs DC2 Frozen)'}
              {partitionState === 'HEALED' && 'HEALED & MERGED (CRDT Join-Semilattice, Epoch 15)'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={triggerPartition}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerPartition();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs font-mono font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              [ Inject WAN Blackhole ]
            </button>
            <button
              onClick={injectZombieWrite}
              disabled={partitionState !== 'PARTITIONED'}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (partitionState === 'PARTITIONED') injectZombieWrite();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                partitionState === 'PARTITIONED'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-pointer'
                  : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              [ Simulate Zombie Write (DC2) ]
            </button>
            <button
              onClick={triggerHealing}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerHealing();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              [ Heal &amp; Merge Cluster ]
            </button>
          </div>
        </div>

        {/* 5-Node Topology Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {clusterNodes.map((node) => {
            const isLeader = node.role === 'Leader';
            const isFrozen = node.status === 'QUORUM_FROZEN';
            return (
              <div
                key={node.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                  isLeader
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : isFrozen
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300 opacity-80'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white">{node.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isLeader
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isFrozen
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {node.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Region: <span className="text-slate-200">{node.region}</span></div>
                  <div>Epoch: <span className="text-cyan-400 font-bold tabular-nums">v{node.epoch}</span></div>
                  <div>Writes: <span className="text-slate-200 tabular-nums">{node.activeWritesAccepted.toLocaleString()}</span></div>
                  <div className="pt-1">
                    Status: <span className={isFrozen ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{node.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill Execution Result Alert Card */}
      {lastDrillResult && (
        <div className="mt-4 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Scenario: {lastDrillResult.partitionScenario}
            </span>
            <span className="text-slate-400 tabular-nums">
              Resolved in {lastDrillResult.convergenceTimeMs}ms | Zombie Rejections: {lastDrillResult.zombieWritesRejectedCount}
            </span>
          </div>
          <div className="text-slate-300 text-[11px] leading-relaxed">
            {lastDrillResult.auditLog}
          </div>
        </div>
      )}

      {/* Paradigm Architecture Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 relative z-10">
        {SPLIT_BRAIN_MODELS.map((m) => {
          const isSelected = m.id === selectedParadigmId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedParadigmId(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedParadigmId(m.id);
                }
              }}
              className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                isSelected
                  ? 'bg-rose-500/15 border-rose-500/70 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              aria-label={`Select paradigm ${m.name}`}
            >
              <span>{m.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Simulation Display */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Interactive Topology & Mathematical Fencing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Mathematical Invariant Formula &amp; Quorum Rules
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Q = &lfloor;5 / 2&rfloor; + 1 = <span className="text-emerald-400 font-bold">3 Votes</span>
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-bold">Mathematical Invariant Expression:</div>
              <div className="text-rose-300 font-bold break-all">
                {activeParadigm.algorithmFormula}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Linearizable Guarantee: {activeParadigm.splitBrainDefenseSla}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DC1 (VIRGINIA) QUORUM</span>
                <span className="text-emerald-400 font-bold text-sm">3 Nodes (60% Cluster)</span>
                <div className="text-[10px] text-slate-400 mt-1">Majority partition: Can advance epoch &amp; write</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DC2 (FRANKFURT) MINORITY</span>
                <span className="text-rose-400 font-bold text-sm">2 Nodes (40% Cluster)</span>
                <div className="text-[10px] text-slate-400 mt-1">Minority partition: Frozen, mutations rejected</div>
              </div>
            </div>
          </div>

          {/* Workflow Phases & Security Invariants */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Execution Lifecycle &amp; Quorum Invariants:
            </h4>
            <div className="space-y-2">
              {activeParadigm.workflowPhases.map((phase, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{phase.name}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed ml-7">
                    {phase.description}
                  </p>
                  <div className="mt-1.5 ml-7 text-[10px] text-rose-400/90 font-mono">
                    Quorum Invariant: {phase.invariants}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invariant Metrics & Code Specification */}
        <div className="lg:col-span-5 space-y-6">
          {/* Production Outcomes Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Architectural Invariants &amp; Verified SLAs:
            </h4>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs font-mono text-rose-300 leading-relaxed">
              <span className="font-bold text-rose-400">Core Invariant:</span> {activeParadigm.architecturalInvariant}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">RECONCILIATION LATENCY</span>
                <span className="text-emerald-400 font-bold tabular-nums">{activeParadigm.reconciliationLatency}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SPLIT-BRAIN DEFENSE</span>
                <span className="text-cyan-400 font-bold tabular-nums">{activeParadigm.splitBrainDefenseSla}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {Object.entries(activeParadigm.productionOutcomes).map(([label, val]) => (
                <div key={label} className="text-xs font-mono flex items-start justify-between gap-2">
                  <span className="text-slate-400 shrink-0">{label}:</span>
                  <span className="text-white text-right font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Specification Inspector */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Production Implementation Spec:
              </h4>
              <button
                onClick={copySpecCode}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copySpecCode();
                  }
                }}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-400 px-2 py-0.5 rounded bg-rose-500/10"
              >
                [ Copy Code ]
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
              <code>{activeParadigm.specCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBrainResolverSandbox;
