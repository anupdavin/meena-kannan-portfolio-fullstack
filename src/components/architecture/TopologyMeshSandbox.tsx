import React, { useState, useMemo } from 'react';
import {
  Network,
  Share2,
  Server,
  Activity,
  RotateCcw,
  Copy,
  CheckCircle2,
  Lock,
  FileCode,
  RefreshCw
} from 'lucide-react';
import {
  TOPOLOGY_MESH_MODELS,
  INITIAL_MESH_NODES,
  type TopologyMeshModel,
  type MeshNode
} from '../../data/topologyMeshModels';

export const TopologyMeshSandbox: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>(TOPOLOGY_MESH_MODELS[0].id);
  const [nodes, setNodes] = useState<MeshNode[]>(INITIAL_MESH_NODES);
  const [selfPreservationActive, setSelfPreservationActive] = useState<boolean>(false);
  const [gossipRound, setGossipRound] = useState<number>(42);
  const [activeTab, setActiveTab] = useState<'mesh' | 'discovery' | 'spec'>('mesh');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [eventStatusMessage, setEventStatusMessage] = useState<string>(
    'SWIM failure detector healthy: Direct & indirect peer probes responding within 180ms.'
  );

  const activeModel = useMemo<TopologyMeshModel>(() => {
    return TOPOLOGY_MESH_MODELS.find(m => m.id === selectedModelId) || TOPOLOGY_MESH_MODELS[0];
  }, [selectedModelId]);

  // Inject Node Failure / Crash
  const handleInjectCrash = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          const nextStatus = n.status === 'DEAD' ? 'ALIVE' : 'DEAD';
          return { ...n, status: nextStatus };
        }
        return n;
      })
    );
    const target = nodes.find(n => n.id === nodeId);
    if (target?.status !== 'DEAD') {
      setEventStatusMessage(
        `Node [${target?.name}] severed. Direct ping timed out; indirect ping-req dispatched to k=3 peers.`
      );
    } else {
      setEventStatusMessage(`Node [${target?.name}] recovered and rejoined gossip mesh.`);
    }
  };

  // Mark Node as Suspect
  const handleMarkSuspect = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, status: 'SUSPECT' } : n))
    );
    const target = nodes.find(n => n.id === nodeId);
    setEventStatusMessage(
      `Node [${target?.name}] marked SUSPECT. Grace period timer running; waiting for incarnation refutation.`
    );
  };

  // Refute Suspect State with Monotonic Incarnation
  const handleRefuteSuspect = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            status: 'ALIVE',
            incarnation: n.incarnation + 1
          };
        }
        return n;
      })
    );
    const target = nodes.find(n => n.id === nodeId);
    const newIncarnation = (target?.incarnation || 1) + 1;
    setEventStatusMessage(
      `Node [${target?.name}] issued alive refutation rumor with monotonic incarnation #${newIncarnation}. State restored to ALIVE.`
    );
  };

  // Toggle Eureka Self-Preservation Mode
  const handleToggleSelfPreservation = () => {
    setSelfPreservationActive(prev => !prev);
    if (!selfPreservationActive) {
      setEventStatusMessage(
        'EMERGENCY: Eureka renewal threshold dropped to 62% (<85%). Self-Preservation Mode ACTIVATED: Lease evictions frozen.'
      );
    } else {
      setEventStatusMessage(
        'Eureka renewal threshold restored to 94% (>=85%). Self-Preservation Mode DEACTIVATED: Normal lease cleanup enabled.'
      );
    }
  };

  // Trigger Gossip Probe Round
  const handleStepGossip = () => {
    setGossipRound(prev => prev + 1);
    setEventStatusMessage(
      `Gossip round #${gossipRound + 1} completed: 3 peer state digests exchanged via UDP; membership tables converged.`
    );
  };

  // Reset to Baseline
  const handleResetSandbox = () => {
    setNodes(INITIAL_MESH_NODES);
    setSelfPreservationActive(false);
    setGossipRound(42);
    setEventStatusMessage(
      'SWIM failure detector healthy: Direct & indirect peer probes responding within 180ms.'
    );
  };

  // Copy RFC Report
  const copyRfcReport = () => {
    const report = `# RFC-TOPOLOGY-3200: Distributed Dynamic Topology Mesh & Service Discovery
Target Paradigm: ${activeModel.name} [${activeModel.badge}]
Category: ${activeModel.category}
Convergence Latency: ${activeModel.convergenceLatency}
Health Check SLA: ${activeModel.healthCheckSla}
Partition Resilience SLA: ${activeModel.partitionResilienceSla}
Formula: ${activeModel.algorithmFormula}
Architectural Invariant: "${activeModel.architecturalInvariant}"

## Active Cluster Topology (6 Nodes):
${nodes
  .map(
    n =>
      `* [${n.name}] ${n.ip}:${n.port} - Service: ${n.service} - Status: ${n.status} - Incarnation: ${n.incarnation} - RTT: ${n.rttMs}ms`
  )
  .join('\n')}

## Gossip Convergence Telemetry:
* Completed Gossip Rounds: ${gossipRound}
* Eureka Self-Preservation Mode: ${selfPreservationActive ? 'ACTIVE (Evictions Frozen)' : 'NORMAL'}
* Healthy Nodes Count: ${nodes.filter(n => n.status === 'ALIVE').length} / ${nodes.length}

## Verified Outcomes:
${Object.entries(activeModel.productionOutcomes)
  .map(([k, v]) => `* ${k}: ${v}`)
  .join('\n')}
`;
    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied Topology Mesh RFC Report to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyRfc = copyRfcReport;

  // Copy Spec Code
  const copySpecCode = () => {
    navigator.clipboard.writeText(activeModel.specCode);
    setCopyFeedback('Copied Specification Code to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div
      id="architecture-topology-mesh"
      className="p-6 rounded-2xl bg-[#070b12] border border-slate-800 text-slate-200 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Neon Accent Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold tracking-wider border border-teal-500/30 uppercase">
              Sub-Section 32
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30">
              SWIM Gossip & xDS EDS
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-editorial text-white mt-1.5 flex items-center gap-2">
            <Network className="w-6 h-6 text-teal-400" />
            Distributed Dynamic Topology Mesh & Service Discovery Consensus
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1">
            HashiCorp Serf SWIM gossip membership, Envoy Dynamic Endpoint Discovery (EDS) gRPC xDS streaming,
            CoreDNS dynamic SRV records, Eureka heartbeat self-preservation, and decentralized Kademlia DHT routing.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRfc}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopyRfc();
              }
            }}
            tabIndex={0}
            role="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Topology RFC</span>
          </button>
          <button
            onClick={handleResetSandbox}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleResetSandbox();
              }
            }}
            tabIndex={0}
            role="button"
            title="Reset Topology Mesh to Baseline"
            className="p-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copyFeedback && (
        <div className="p-2.5 rounded-lg bg-teal-500/20 border border-teal-500/50 text-teal-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Model Selector Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {TOPOLOGY_MESH_MODELS.map(m => {
          const isSelected = m.id === selectedModelId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedModelId(m.id);
                }
              }}
              tabIndex={0}
              role="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <span>{m.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Invariant & Convergence Banner */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <Lock className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL INVARIANT</span>
          </div>
          <p className="text-sm font-editorial text-slate-200">
            "{activeModel.architecturalInvariant}"
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">CONVERGENCE SLA</div>
            <div className="text-xs font-bold text-teal-300">{activeModel.convergenceLatency.split('(')[0]}</div>
          </div>
          <div className="text-right font-mono border-l border-slate-800 pl-3">
            <div className="text-[10px] text-slate-400">HEALTH CHECK SLA</div>
            <div className="text-xs font-bold text-cyan-300">{activeModel.healthCheckSla.split(';')[0]}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('mesh')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'mesh'
              ? 'text-teal-400 border-b-2 border-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Active Topology Mesh HUD</span>
        </button>
        <button
          onClick={() => setActiveTab('discovery')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'discovery'
              ? 'text-teal-400 border-b-2 border-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Membership Protocol State</span>
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'spec'
              ? 'text-teal-400 border-b-2 border-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Specification & Code</span>
        </button>
      </div>

      {/* Tab 1: Active Topology Mesh HUD */}
      {activeTab === 'mesh' && (
        <div className="space-y-6">
          {/* Live Protocol Status Alert Bar */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-slate-300">{eventStatusMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleStepGossip}
                className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Gossip Round (#{gossipRound})</span>
              </button>
              <button
                onClick={handleToggleSelfPreservation}
                className={`px-2.5 py-1 rounded text-[11px] border cursor-pointer ${
                  selfPreservationActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {selfPreservationActive ? 'Self-Preservation [ACTIVE]' : 'Simulate Network Split'}
              </button>
            </div>
          </div>

          {/* 6-Node Visual Mesh Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {nodes.map(node => {
              const isAlive = node.status === 'ALIVE';
              const isSuspect = node.status === 'SUSPECT';
              const isDead = node.status === 'DEAD';

              return (
                <div
                  key={node.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isAlive
                      ? 'bg-slate-900/40 border-slate-800 hover:border-teal-500/40'
                      : isSuspect
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-rose-500/10 border-rose-500/40 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Server className={`w-3.5 h-3.5 ${isAlive ? 'text-teal-400' : isSuspect ? 'text-amber-400' : 'text-rose-400'}`} />
                        <span className="font-bold text-slate-200">{node.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{node.service}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isAlive
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : isSuspect
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2 rounded border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[10px] block">ENDPOINT:</span>
                      <span className="text-slate-300">{node.ip}:{node.port}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">INCARNATION:</span>
                      <span className="text-teal-400 font-bold">#{node.incarnation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">WEIGHT:</span>
                      <span className="text-cyan-300">{node.weight}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">PEER RTT:</span>
                      <span className="text-slate-300">{node.rttMs}ms</span>
                    </div>
                  </div>

                  {/* Node Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleInjectCrash(node.id)}
                      className={`flex-1 py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                        isDead
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isDead ? 'Rejoin Node' : 'Crash Node'}
                    </button>
                    {isAlive && (
                      <button
                        onClick={() => handleMarkSuspect(node.id)}
                        className="px-2 py-1 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        Suspect
                      </button>
                    )}
                    {isSuspect && (
                      <button
                        onClick={() => handleRefuteSuspect(node.id)}
                        className="px-2 py-1 rounded text-[10px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer font-bold"
                      >
                        Refute Incarnation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Membership Protocol State */}
      {activeTab === 'discovery' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">
                SWIM Protocol State Machine & Failure Detector
              </span>
              <span className="text-teal-400">RFC 2782 & SWIM Compliant</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every 200ms, each node probes a randomly chosen peer via UDP. If no acknowledgment is received,
              it requests k=3 intermediate peers to perform an indirect ping. If all indirect pings fail,
              the node enters the SUSPECT state. The suspect node has a configurable grace period to refute
              the claim by incrementing its monotonic incarnation sequence number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Total Mesh Nodes</div>
              <div className="text-lg font-bold text-slate-200">{nodes.length} Instances</div>
              <div className="text-[10px] text-teal-400">100% Peer Connectivity</div>
            </div>
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Healthy Nodes</div>
              <div className="text-lg font-bold text-emerald-300">
                {nodes.filter(n => n.status === 'ALIVE').length} ALIVE
              </div>
              <div className="text-[10px] text-slate-400">
                {nodes.filter(n => n.status === 'DEAD').length} Severed / Dead
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Self-Preservation Mode</div>
              <div className={`text-lg font-bold ${selfPreservationActive ? 'text-amber-400' : 'text-slate-300'}`}>
                {selfPreservationActive ? 'ACTIVE (Frozen)' : 'INACTIVE'}
              </div>
              <div className="text-[10px] text-slate-400">Eviction Guard Threshold: 85%</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Specification & Code */}
      {activeTab === 'spec' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {activeModel.name} - Implementation Specification
            </span>
            <button
              onClick={copySpecCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-slate-800 overflow-x-auto">
            <pre className="text-xs font-mono text-teal-300 leading-relaxed">
              <code>{activeModel.specCode}</code>
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {Object.entries(activeModel.productionOutcomes).map(([metric, value]) => (
              <div key={metric} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 font-mono">
                <div className="text-[10px] text-slate-400 uppercase">{metric}</div>
                <div className="text-xs text-slate-200 mt-0.5 font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopologyMeshSandbox;
