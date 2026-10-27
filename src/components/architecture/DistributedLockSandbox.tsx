import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  Server,
  Activity,
  Cpu,
  FileCode,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  DISTRIBUTED_LOCK_MODELS,
  INITIAL_LOCK_NODES,
  type LockClusterNode,
  type DistributedLockModel
} from '../../data/distributedLockModels';

export const DistributedLockSandbox: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>(DISTRIBUTED_LOCK_MODELS[0].id);
  const [lockNodes, setLockNodes] = useState<LockClusterNode[]>(INITIAL_LOCK_NODES);
  const [lockHolder, setLockHolder] = useState<string | null>('client-worker-alpha');
  const [fencingToken, setFencingToken] = useState<number>(340);
  const [storageFloorToken, setStorageFloorToken] = useState<number>(340);
  const [ttlRemainingMs, setTtlRemainingMs] = useState<number>(4850);
  const [isGcStalled, setIsGcStalled] = useState<boolean>(false);
  const [zombieWriteStatus, setZombieWriteStatus] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topology' | 'fencing' | 'spec'>('topology');

  const activeModel = useMemo<DistributedLockModel>(() => {
    return DISTRIBUTED_LOCK_MODELS.find(m => m.id === selectedModelId) || DISTRIBUTED_LOCK_MODELS[0];
  }, [selectedModelId]);

  // Simulate TTL decrement countdown when lock is held and not GC stalled
  useEffect(() => {
    if (!lockHolder || isGcStalled) return;
    const interval = setInterval(() => {
      setTtlRemainingMs(prev => {
        if (prev <= 100) {
          // Lock auto-expired
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [lockHolder, isGcStalled]);

  // Handle Acquire Lock
  const handleAcquireLock = (clientId: string) => {
    const nextToken = fencingToken + 1;
    setFencingToken(nextToken);
    setStorageFloorToken(nextToken);
    setLockHolder(clientId);
    setTtlRemainingMs(5000);
    setIsGcStalled(false);
    setZombieWriteStatus(`Lock acquired by [${clientId}] with monotonic fencing token #${nextToken}.`);
  };

  // Handle Release Lock
  const handleReleaseLock = () => {
    setLockHolder(null);
    setTtlRemainingMs(0);
    setIsGcStalled(false);
    setZombieWriteStatus('Lock voluntarily released via atomic Lua CAS script.');
  };

  // Inject JVM GC Pause on Current Holder
  const handleInjectGcPause = () => {
    if (!lockHolder) return;
    setIsGcStalled(true);
    setZombieWriteStatus(`Client [${lockHolder}] entered Stop-The-World JVM GC pause. TTL will expire on servers while client is frozen.`);
  };

  // Simulate Zombie Write with Expired Token
  const handleSimulateZombieWrite = () => {
    // Attempt write with an outdated token
    const staleToken = fencingToken - 1;
    if (staleToken < storageFloorToken) {
      setZombieWriteStatus(`HTTP 409 Conflict: Zombie write with token #${staleToken} rejected at storage gate. Storage floor is #${storageFloorToken}.`);
    } else {
      setZombieWriteStatus(`Write accepted with valid token #${staleToken}.`);
    }
  };

  // Reset Cluster Nodes
  const handleResetCluster = () => {
    setLockNodes(INITIAL_LOCK_NODES);
    setLockHolder('client-worker-alpha');
    setFencingToken(340);
    setStorageFloorToken(340);
    setTtlRemainingMs(4850);
    setIsGcStalled(false);
    setZombieWriteStatus(null);
  };

  // Copy RFC Report
  const copyRfcReport = () => {
    const report = `# RFC-DLM-3000: Distributed Consensus-Backed Lock Manager Architecture
Target Paradigm: ${activeModel.name} [${activeModel.badge}]
Category: ${activeModel.category}
Acquisition Latency: ${activeModel.acquisitionLatency}
Lease TTL SLA: ${activeModel.leaseTtlSla}
Formula: ${activeModel.algorithmFormula}
Architectural Invariant: "${activeModel.architecturalInvariant}"

## 5-Node DLM Quorum Status:
${lockNodes.map(n => `* [${n.name}] ${n.endpoint} - Engine: ${n.engine} - Status: ${n.status} - Active Leases: ${n.activeLeasesCount}`).join('\n')}

## Fencing Token Invariant Verification:
* Active Lock Holder: ${lockHolder || 'NONE'}
* Current Monotonic Token: #${fencingToken}
* Storage Floor Token: #${storageFloorToken}
* TTL Remaining: ${ttlRemainingMs}ms
* GC Pause Stalled: ${isGcStalled ? 'YES (Frozen)' : 'NO (Normal)'}
`;
    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied Distributed Lock RFC Report to Clipboard!');
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
      id="architecture-distributed-lock"
      className="p-6 rounded-2xl bg-[#070b12] border border-slate-800 text-slate-200 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Neon Accent Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold tracking-wider border border-emerald-500/30 uppercase">
              Sub-Section 30
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30">
              Kleppmann Fencing Tokens
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-editorial text-white mt-1.5 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-400" />
            Distributed Consensus-Backed Lock Manager (DLM) & Mutex Leases
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1">
            Redis Redlock multi-node quorum consensus, etcd Raft monotonic revision leases, ZooKeeper ephemeral sequential queues,
            storage-level fencing token gates, and distributed reader-writer shared locks.
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Lock RFC</span>
          </button>
          <button
            onClick={handleResetCluster}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleResetCluster();
              }
            }}
            tabIndex={0}
            role="button"
            title="Reset DLM Cluster to Healthy Baseline"
            className="p-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copyFeedback && (
        <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Model Selector Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {DISTRIBUTED_LOCK_MODELS.map(m => {
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
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all border flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{m.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Paradigm Invariant Card */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Architectural Invariant Guarantee:
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Latency: <strong className="text-white">{activeModel.acquisitionLatency.split(';')[0]}</strong>
          </span>
        </div>
        <p className="text-xs md:text-sm font-mono text-slate-300 italic bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
          &ldquo;{activeModel.architecturalInvariant}&rdquo;
        </p>
        <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-400 pt-1">
          <div>Formula: <span className="text-cyan-300">{activeModel.algorithmFormula}</span></div>
          <div>Lease SLA: <span className="text-emerald-300">{activeModel.leaseTtlSla}</span></div>
          <div>Blast Containment: <span className="text-amber-300">{activeModel.blastRadiusContainment}</span></div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-fit text-xs font-mono">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'topology'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Quorum Topology HUD</span>
        </button>
        <button
          onClick={() => setActiveTab('fencing')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'fencing'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Fencing Token Gate</span>
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'spec'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Specification Manifest</span>
        </button>
      </div>

      {/* TAB 1: 5-Node DLM Quorum Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {lockNodes.map((node, idx) => {
              const isVoterOnline = node.status === 'ONLINE';
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isVoterOnline
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      Node #{idx + 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isVoterOnline
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="truncate">{node.endpoint}</div>
                    <div className="text-[10px] text-cyan-400">{node.engine}</div>
                    <div className="text-[10px] text-slate-500">Active Leases: {node.activeLeasesCount}</div>
                    <div className="text-[10px] text-emerald-400">Heartbeat: {node.lastHeartbeatMs}ms</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Lock Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Interactive Distributed Lock State Controls:
              </span>
              <div className="text-xs font-mono text-slate-400">
                Current Lock Holder:{' '}
                <strong className={lockHolder ? 'text-emerald-400' : 'text-slate-500'}>
                  {lockHolder || 'NONE (Lock Free)'}
                </strong>
              </div>
            </div>

            {/* TTL Countdown Gauge */}
            {lockHolder && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Net Lease Validity Window (TTL):</span>
                  <span className={ttlRemainingMs > 1000 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {ttlRemainingMs}ms / 5000ms
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      ttlRemainingMs > 1500 ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (ttlRemainingMs / 5000) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Control Triggers */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleAcquireLock('client-worker-alpha')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acquire Lock (Worker Alpha)</span>
              </button>
              <button
                onClick={() => handleAcquireLock('client-worker-beta')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acquire Lock (Worker Beta)</span>
              </button>
              <button
                onClick={handleInjectGcPause}
                disabled={!lockHolder || isGcStalled}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Inject JVM GC Pause (Holder Frozen)</span>
              </button>
              <button
                onClick={handleReleaseLock}
                disabled={!lockHolder}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Release Lock (Lua CAS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Monotonic Fencing Token Gate */}
      {activeTab === 'fencing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Martin Kleppmann Fencing Token Invariant Gate
            </h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              In asynchronous distributed systems, locks alone cannot guarantee safety because a client can pause
              (e.g., GC stall or network delay) while holding the lock. Monotonic fencing tokens minted on each lock grant
              are checked at the storage layer to reject stale zombie writes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-500">Current Lock Token:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">#{fencingToken}</div>
                <span className="text-[10px] text-slate-400">Minted on latest quorum lock grant</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-500">Storage Gate Floor:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">#{storageFloorToken}</div>
                <span className="text-[10px] text-slate-400">Writes below this token are rejected</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-500">Holder Status:</span>
                <div className={`text-xl font-bold font-mono ${isGcStalled ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isGcStalled ? 'GC STALLED' : lockHolder ? 'ACTIVE' : 'IDLE'}
                </div>
                <span className="text-[10px] text-slate-400">{lockHolder || 'No active client'}</span>
              </div>
            </div>

            {/* Zombie Write Simulation Trigger */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSimulateZombieWrite}
                className="px-3 py-2 rounded-lg text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Zombie Write with Stale Token (#{fencingToken - 1})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zombie Status Output Terminal */}
      {zombieWriteStatus && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">{zombieWriteStatus}</span>
        </div>
      )}

      {/* TAB 3: Specification Manifest */}
      {activeTab === 'spec' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                Production Specification Code ({activeModel.name}):
              </span>
              <button
                onClick={copySpecCode}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-[#04070d] border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-80">
              <code>{activeModel.specCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Production Outcomes Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {Object.entries(activeModel.productionOutcomes).map(([k, v]) => (
          <div key={k} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-500 truncate">{k}</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributedLockSandbox;
