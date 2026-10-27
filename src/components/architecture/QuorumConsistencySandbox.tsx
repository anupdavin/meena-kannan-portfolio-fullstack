import React, { useState } from 'react';
import {
  Database,
  Share2,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Layers,
  Search,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  QUORUM_CONSISTENCY_MODELS,
  INITIAL_REPLICAS,
  type QuorumConsistencyModel,
  type ReplicaNode
} from '../../data/quorumConsistencyModels';

export const QuorumConsistencySandbox: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<QuorumConsistencyModel>(QUORUM_CONSISTENCY_MODELS[0]);
  const [activeTab, setActiveTab] = useState<'ring' | 'sloppy' | 'merkle' | 'tunable'>('ring');
  const [replicas, setReplicas] = useState<ReplicaNode[]>(INITIAL_REPLICAS);
  const [rQuorum, setRQuorum] = useState<number>(3);
  const [wQuorum, setWQuorum] = useState<number>(3);
  const [isNode3Partitioned, setIsNode3Partitioned] = useState<boolean>(false);
  const [hintsBuffered, setHintsBuffered] = useState<number>(0);
  const [readRepairActive, setReadRepairActive] = useState<boolean>(false);
  const [merkleSyncDone, setMerkleSyncDone] = useState<boolean>(false);
  const [selectedConsistencyLevel, setSelectedConsistencyLevel] = useState<'ONE' | 'LOCAL_QUORUM' | 'QUORUM' | 'ALL'>('QUORUM');
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalReplicas = 5;
  const quorumOverlap = rQuorum + wQuorum - totalReplicas;
  const isStrictQuorum = quorumOverlap > 0;

  // Simulate partition on Node-3
  const handleTogglePartition = () => {
    setIsNode3Partitioned((prev) => {
      const next = !prev;
      setReplicas((nodes) =>
        nodes.map((n) => {
          if (n.id === 'node-03') {
            return {
              ...n,
              status: next ? ('PARTITIONED' as const) : ('ONLINE' as const)
            };
          }
          return n;
        })
      );
      return next;
    });
  };

  // Execute write under sloppy quorum
  const handleExecuteWrite = () => {
    const nextVersion = Math.max(...replicas.map((r) => r.version)) + 1;
    const newValue = `$${(2.65 + nextVersion * 0.2).toFixed(2)}M`;

    setReplicas((nodes) =>
      nodes.map((n) => {
        if (n.id === 'node-03' && isNode3Partitioned) {
          // Node 3 is down, so it does not receive write
          return n;
        }
        if (n.id === 'node-04' && isNode3Partitioned) {
          // Node 4 acts as surrogate hint holder for Node 3
          return {
            ...n,
            version: nextVersion,
            hintCount: n.hintCount + 1,
            data: {
              ...n.data,
              value: newValue,
              timestamp: Date.now()
            }
          };
        }
        return {
          ...n,
          version: nextVersion,
          data: {
            ...n.data,
            value: newValue,
            timestamp: Date.now()
          }
        };
      })
    );

    if (isNode3Partitioned) {
      setHintsBuffered((h) => h + 1);
    }
  };

  // Restore Node-3 heartbeat and flush hints
  const handleRestoreAndFlushHints = () => {
    setIsNode3Partitioned(false);
    setReplicas((nodes) => {
      const highestVersion = Math.max(...nodes.map((r) => r.version));
      const freshData = nodes.find((r) => r.version === highestVersion)?.data || nodes[0].data;

      return nodes.map((n) => {
        if (n.id === 'node-03') {
          return {
            ...n,
            status: 'ONLINE' as const,
            version: highestVersion,
            data: freshData
          };
        }
        if (n.id === 'node-04') {
          return {
            ...n,
            hintCount: 0
          };
        }
        return n;
      });
    });
    setHintsBuffered(0);
  };

  // Run read repair on stale replicas
  const handleRunReadRepair = () => {
    setReadRepairActive(true);
    setTimeout(() => {
      setReplicas((nodes) => {
        const highestVersion = Math.max(...nodes.map((r) => r.version));
        const freshData = nodes.find((r) => r.version === highestVersion)?.data || nodes[0].data;

        return nodes.map((n) => ({
          ...n,
          version: highestVersion,
          data: freshData
        }));
      });
      setReadRepairActive(false);
    }, 700);
  };

  // Run Anti-Entropy Merkle tree sync
  const handleRunMerkleSync = () => {
    setMerkleSyncDone(false);
    setTimeout(() => {
      setMerkleSyncDone(true);
      setReplicas((nodes) => {
        const highestVersion = Math.max(...nodes.map((r) => r.version));
        const freshData = nodes.find((r) => r.version === highestVersion)?.data || nodes[0].data;
        return nodes.map((n) => ({
          ...n,
          version: highestVersion,
          data: freshData
        }));
      });
    }, 800);
  };

  // Reset sandbox
  const handleReset = () => {
    setReplicas(INITIAL_REPLICAS);
    setRQuorum(3);
    setWQuorum(3);
    setIsNode3Partitioned(false);
    setHintsBuffered(0);
    setReadRepairActive(false);
    setMerkleSyncDone(false);
    setSelectedConsistencyLevel('QUORUM');
  };

  // Copy RFC specification
  const copyRfcReport = () => {
    const rfcMarkdown = `# Architectural Decision Record: Distributed Read-Write Quorum Consensus & Tunable Consistency
## Specification: ${selectedModel.name} (${selectedModel.badge})
- **Category:** ${selectedModel.category}
- **Read Latency SLA:** ${selectedModel.readLatencySla}
- **Write Throughput SLA:** ${selectedModel.writeThroughputSla}
- **Consistency Guarantee:** ${selectedModel.consistencyGuarantee}
- **Mathematical Formula:** \`${selectedModel.algorithmFormula}\`
- **Blast Radius Containment:** ${selectedModel.blastRadiusContainment}
- **Architectural Invariant:** ${selectedModel.architecturalInvariant}

### System Overview
${selectedModel.description}

### Production Outcomes
${Object.entries(selectedModel.productionOutcomes)
  .map(([k, v]) => `- **${k}:** ${v}`)
  .join('\n')}

### Specification Code
\`\`\`java
${selectedModel.specCode}
\`\`\`
`;
    navigator.clipboard.writeText(rfcMarkdown);
    setCopiedRfc(true);
    setTimeout(() => setCopiedRfc(false), 2000);
  };

  const filteredModels = QUORUM_CONSISTENCY_MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#06090e] border border-slate-800 rounded-2xl p-6 lg:p-8 text-slate-200 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
              Engine 34: Distributed Storage Consensus
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded">
              Dynamo Quorum &amp; Tunable Consistency
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
              R + W &gt; N / Cassandra / ScyllaDB
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-400" />
            Distributed Read-Write Quorum &amp; Tunable Consistency Sandbox
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Simulate Dynamo-style strict quorum intersection (R + W &gt; N), asynchronous read repair,
            sloppy quorums with hinted handoff during network partitions, and anti-entropy Merkle tree range synchronization.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-all"
            title="Reset sandbox state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={copyRfcReport}
            className="px-3 py-1.5 text-xs font-mono bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            {copiedRfc ? 'RFC Copied!' : 'Copy Quorum RFC'}
          </button>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Select Quorum &amp; Consistency Architecture
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quorum models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-900/90 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {filteredModels.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {model.badge}
                  </span>
                  {isSelected && <Sparkles className="w-3 h-3 text-emerald-400" />}
                </div>
                <h4 className={`text-xs font-semibold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {model.name}
                </h4>
                <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                  <span>{model.readLatencySla}</span>
                  <span className="text-cyan-400/90">{model.writeThroughputSla}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Model Deep Dive Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3 border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-xs font-mono text-emerald-400 tracking-wide uppercase">{selectedModel.category}</span>
            <h3 className="text-base font-bold text-white">{selectedModel.name}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded">
              Read SLA: <strong className="text-cyan-300">{selectedModel.readLatencySla}</strong>
            </span>
            <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded">
              Throughput: <strong className="text-emerald-300">{selectedModel.writeThroughputSla}</strong>
            </span>
            <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded">
              Guarantee: <strong className="text-amber-300">{selectedModel.consistencyGuarantee}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">{selectedModel.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Quorum Invariant Formula</span>
            <span className="text-emerald-300 font-bold break-all">{selectedModel.algorithmFormula}</span>
          </div>
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Blast Radius Containment</span>
            <span className="text-cyan-300">{selectedModel.blastRadiusContainment}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('ring')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'ring'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          5-Node Replica Ring &amp; Quorum Math
        </button>
        <button
          onClick={() => setActiveTab('sloppy')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'sloppy'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Sloppy Quorum &amp; Hinted Handoff
        </button>
        <button
          onClick={() => setActiveTab('merkle')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'merkle'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Anti-Entropy Merkle Tree Sync
        </button>
        <button
          onClick={() => setActiveTab('tunable')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'tunable'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Tunable Consistency SLA Matrix
        </button>
      </div>

      {/* TAB 1: 5-Node Replica Ring & Quorum Math */}
      {activeTab === 'ring' && (
        <div className="space-y-6">
          {/* Quorum Math Tuning Sliders Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase">Dynamo Quorum Invariant</span>
                <h4 className="text-sm font-bold text-white">Tunable Read (R) &amp; Write (W) Quorum Configuration</h4>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
                  isStrictQuorum
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700'
                }`}
              >
                {isStrictQuorum ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                {isStrictQuorum
                  ? `Strict Quorum Guaranteed (|R ∩ W| = ${quorumOverlap} Node Overlap)`
                  : 'Eventual Consistency Window (R + W ≤ N)'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* R Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Read Quorum (R):</span>
                  <span className="text-cyan-400 font-bold">{rQuorum} of 5 replicas</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={rQuorum}
                  onChange={(e) => setRQuorum(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-850 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* W Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Write Quorum (W):</span>
                  <span className="text-emerald-400 font-bold">{wQuorum} of 5 replicas</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={wQuorum}
                  onChange={(e) => setWQuorum(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-850 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-500">Quorum Intersection:</span>{' '}
                <strong className={isStrictQuorum ? 'text-emerald-400' : 'text-amber-400'}>
                  {rQuorum} + {wQuorum} = {rQuorum + wQuorum} (N = 5)
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Fault Tolerance:</span>{' '}
                <strong className="text-white">Can survive {5 - Math.max(rQuorum, wQuorum)} offline node(s)</strong>
              </div>
              <button
                onClick={handleRunReadRepair}
                disabled={readRepairActive}
                className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded-md transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${readRepairActive ? 'animate-spin' : ''}`} />
                {readRepairActive ? 'Repairing Replicas...' : 'Trigger Read Repair'}
              </button>
            </div>
          </div>

          {/* 5 Replicas Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {replicas.map((node) => {
              const isStale = node.version < Math.max(...replicas.map((r) => r.version));
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    node.status === 'PARTITIONED'
                      ? 'bg-rose-950/30 border-rose-800/80 opacity-70'
                      : isStale
                      ? 'bg-amber-950/30 border-amber-800/80 shadow-md shadow-amber-950/20'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{node.datacenter}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        node.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold font-mono text-white mb-2">{node.name}</h5>

                  <div className="p-2 bg-slate-950/80 rounded-lg text-xs font-mono space-y-1 mb-2 border border-slate-850">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version:</span>
                      <strong className={isStale ? 'text-amber-400' : 'text-emerald-400'}>
                        v{node.version} {isStale && '(Stale)'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Value:</span>
                      <strong className="text-white">{node.data.value}</strong>
                    </div>
                    {node.hintCount > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>Hints:</span>
                        <strong>{node.hintCount} buffered</strong>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Role: {node.role}</span>
                    <span className="text-slate-400">{node.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Sloppy Quorum & Hinted Handoff */}
      {activeTab === 'sloppy' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase">High Availability Partition Resilience</span>
                <h4 className="text-sm font-bold text-white">Sloppy Quorum &amp; Hinted Handoff Buffer Controller</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePartition}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    isNode3Partitioned
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {isNode3Partitioned ? 'Node 3 is Partitioned (Offline)' : 'Partition Node 3'}
                </button>
                <button
                  onClick={handleExecuteWrite}
                  className="px-3 py-1.5 text-xs font-mono bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Write with Sloppy Quorum
                </button>
                {isNode3Partitioned && (
                  <button
                    onClick={handleRestoreAndFlushHints}
                    className="px-3 py-1.5 text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restore Node 3 &amp; Flush Hints
                  </button>
                )}
              </div>
            </div>

            {/* Hinted Handoff Queue HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                <span className="text-slate-500 block text-[10px]">Surrogate Proxy Node:</span>
                <strong className="text-cyan-400 text-sm">replica-us-west-2a (Node 4)</strong>
                <span className="text-slate-400 block text-[10px] mt-0.5">Walks clockwise on hash ring</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                <span className="text-slate-500 block text-[10px]">Buffered Hints for Node 3:</span>
                <strong className="text-amber-400 text-sm">{hintsBuffered} Pending Hints</strong>
                <span className="text-slate-400 block text-[10px] mt-0.5">Persisted to disk with 3h TTL</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                <span className="text-slate-500 block text-[10px]">Write Availability SLA:</span>
                <strong className="text-emerald-400 text-sm">99.999% (Zero Rejected Writes)</strong>
                <span className="text-slate-400 block text-[10px] mt-0.5">Survives full datacenter outages</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Anti-Entropy Merkle Tree Sync */}
      {activeTab === 'merkle' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Cryptographic Token Synchronization</span>
                <h4 className="text-sm font-bold text-white">Hierarchical Merkle Tree Range Repair</h4>
              </div>
              <button
                onClick={handleRunMerkleSync}
                className="px-3.5 py-1.5 text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Run Anti-Entropy Merkle Sync
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Node 1 (Authoritative Root):</span>
                  <span className="text-emerald-400 font-bold">sha256: 7f8a91b...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Node 3 (Replica Root):</span>
                  <span className={merkleSyncDone ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {merkleSyncDone ? 'sha256: 7f8a91b... (Matched)' : 'sha256: 3c9b14f... (Divergent)'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Search Complexity:</span>
                  <span className="text-cyan-400 font-bold">O(log N) branch hops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network Bandwidth Reduction:</span>
                  <span className="text-emerald-400 font-bold">99.8% saved vs full table scan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tunable Consistency SLA Matrix */}
      {activeTab === 'tunable' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Per-Query Consistency Level Selector
              </h4>
              <span className="text-xs font-mono text-slate-400">Cassandra / ScyllaDB Driver Standard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['ONE', 'LOCAL_QUORUM', 'QUORUM', 'ALL'] as const).map((level) => {
                const isSelected = selectedConsistencyLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedConsistencyLevel(level)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <strong className={`text-xs font-mono ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {level}
                      </strong>
                      {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {level === 'ONE' && '0.38 ms P99 (Fastest)'}
                      {level === 'LOCAL_QUORUM' && '1.45 ms P99 (Local DC)'}
                      {level === 'QUORUM' && '2.20 ms P99 (Linearizable)'}
                      {level === 'ALL' && '8.50 ms P99 (Synchronous)'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {level === 'ONE' && 'Tolerates 4 node failures'}
                      {level === 'LOCAL_QUORUM' && 'Tolerates 1 DC node failure'}
                      {level === 'QUORUM' && 'Tolerates 2 node failures'}
                      {level === 'ALL' && 'Tolerates 0 node failures'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Production Engineering Lifecycle Phases */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Production Engineering Lifecycle Phases: {selectedModel.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {selectedModel.workflowPhases.map((phase, idx) => (
            <div key={phase.name} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-mono text-[10px]">
                  {idx + 1}
                </span>
                <h5 className="font-bold text-white line-clamp-1">{phase.name}</h5>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-2">{phase.description}</p>
              <div className="p-2 bg-slate-950 border border-slate-850 rounded text-[10px] font-mono text-emerald-300">
                <span className="text-slate-500 block uppercase text-[9px]">Invariant:</span>
                {phase.invariants}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
