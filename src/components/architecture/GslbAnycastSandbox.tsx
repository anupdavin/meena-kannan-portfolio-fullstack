import { useState, useMemo } from 'react';
import {
  Globe,
  Radio,
  Activity,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Sliders,
  Send
} from 'lucide-react';
import {
  GSLB_ANYCAST_MODELS,
  INITIAL_EDGE_POPS,
  SYNTHETIC_PROBES,
  type EdgePoP,
  type GslbAnycastModel,
  type SyntheticProbeResult
} from '@/data/gslbAnycastModels';

export default function GslbAnycastSandbox() {
  const [selectedModelId, setSelectedModelId] = useState<string>(GSLB_ANYCAST_MODELS[0].id);
  const [edgePops, setEdgePops] = useState<EdgePoP[]>(INITIAL_EDGE_POPS);
  const [probes, setProbes] = useState<SyntheticProbeResult[]>(SYNTHETIC_PROBES);
  const [isDdosActive, setIsDdosActive] = useState<boolean>(false);
  const [mitigationProgress, setMitigationProgress] = useState<number>(0);
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'probes' | 'spec'>('topology');

  const activeModel = useMemo<GslbAnycastModel>(() => {
    return GSLB_ANYCAST_MODELS.find(m => m.id === selectedModelId) || GSLB_ANYCAST_MODELS[0];
  }, [selectedModelId]);

  // Toggle BGP Route Withdrawal for a PoP
  const handleTogglePoP = (popId: string) => {
    setEdgePops(prev => prev.map(p => {
      if (p.id === popId) {
        const nextStatus = p.status === 'ACTIVE' ? 'WITHDRAWN' : 'ACTIVE';
        return {
          ...p,
          status: nextStatus,
          healthScore: nextStatus === 'ACTIVE' ? 99.95 : 0.0
        };
      }
      return p;
    }));

    // Update probes routing if target PoP was withdrawn
    setProbes(prev => prev.map(pr => {
      if (pr.routedPoPId === popId) {
        const fallback = edgePops.find(p => p.id !== popId && p.status === 'ACTIVE');
        if (fallback) {
          return {
            ...pr,
            routedPoPId: fallback.id,
            routedPoPCity: fallback.city,
            measuredRttMs: +(pr.measuredRttMs * 1.85).toFixed(1),
            bgpHops: pr.bgpHops + 2,
            status: 'FAILOVER_REROUTED'
          };
        }
      }
      return pr;
    }));
  };

  // Simulate Volumetric DDoS Attack & BGP Flowspec Mitigation
  const handleTriggerDdos = () => {
    setIsDdosActive(true);
    setMitigationProgress(15);

    // Target Ashburn PoP
    setEdgePops(prev => prev.map(p => {
      if (p.id === 'pop-iad') {
        return {
          ...p,
          status: 'SCRUBBING',
          egressBps: '1.24 Tbps (Scrubbing)',
          healthScore: 94.2
        };
      }
      return p;
    }));

    setTimeout(() => {
      setMitigationProgress(65);
    }, 450);

    setTimeout(() => {
      setMitigationProgress(100);
      setIsDdosActive(false);
      setEdgePops(prev => prev.map(p => {
        if (p.id === 'pop-iad') {
          return {
            ...p,
            status: 'ACTIVE',
            egressBps: '52.1 Gbps',
            healthScore: 99.98
          };
        }
        return p;
      }));
    }, 1200);
  };

  // Reset all PoPs and probes to healthy baseline
  const handleResetCluster = () => {
    setEdgePops(INITIAL_EDGE_POPS);
    setProbes(SYNTHETIC_PROBES);
    setIsDdosActive(false);
    setMitigationProgress(0);
  };

  const copyRfcReport = () => {
    const report = `# RFC-GSLB-2900: Global Anycast & Traffic Steering Architecture
Target Architecture: ${activeModel.name} [${activeModel.badge}]
Category: ${activeModel.category}
Convergence Latency: ${activeModel.routingConvergenceLatency}
Failover SLA: ${activeModel.failoverConvergenceSla}
Algorithm: ${activeModel.algorithmFormula}
Architectural Invariant: ${activeModel.architecturalInvariant}

## Active Edge PoPs Status:
${edgePops.map(p => `* [${p.id.toUpperCase()}] ${p.name} (${p.city}) - Status: ${p.status} - Ingress: ${p.egressBps} - Latency: ${p.latencyToOriginMs}ms`).join('\n')}

## Synthetic Client Probes:
${probes.map(pr => `* Client: ${pr.clientLocation} -> Routed: ${pr.routedPoPCity} (${pr.measuredRttMs}ms, ${pr.bgpHops} BGP Hops, ${pr.protocol}, Status: ${pr.status})`).join('\n')}

## Production Invariants & Verification:
${activeModel.workflowPhases.map(w => `### ${w.name}\n${w.description}\nInvariant: ${w.invariants}`).join('\n\n')}

Architectural Sign-off: Meena Kannan, Lead Distributed Systems Architect`;

    navigator.clipboard.writeText(report);
    setCopiedRfc(true);
    setTimeout(() => setCopiedRfc(false), 2000);
  };

  const handleCopyRfc = copyRfcReport;

  const copySpecManifest = () => {
    navigator.clipboard.writeText(activeModel.specCode);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <div
      id="architecture-gslb-anycast"
      className="p-6 rounded-2xl bg-[#070b12] border border-slate-800 text-slate-200 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded">
              Engine 29
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 rounded">
              BGP Anycast AS 13335
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Mesh Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-400" />
            Global Server Load Balancing & BGP Anycast Routing
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1">
            Border Gateway Protocol Anycast (AS 13335), ECMP hardware flow hashing, GeoDNS EDNS0 subnet proximity,
            Maglev consistent hashing, and RFC 5575 BGP Flowspec automated DDoS mitigation.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRfc}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopyRfc(); } }}
            tabIndex={0}
            role="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRfc ? 'Copied RFC' : 'Copy Anycast RFC'}</span>
          </button>
          <button
            onClick={handleResetCluster}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleResetCluster(); } }}
            tabIndex={0}
            role="button"
            title="Reset Edge PoPs to Healthy Baseline"
            className="p-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {GSLB_ANYCAST_MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => setSelectedModelId(model.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedModelId(model.id); } }}
            tabIndex={0}
            role="button"
            className={`px-3 py-2 text-xs font-mono whitespace-nowrap rounded-lg border transition-all text-left flex flex-col gap-0.5 focus:outline-none ${
              selectedModelId === model.id
                ? 'bg-sky-500/15 border-sky-500/50 text-sky-200 ring-1 ring-sky-500/30'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <span className="font-semibold text-white">{model.name.split(' with ')[0]}</span>
            <span className="text-[10px] text-sky-400 font-mono">{model.badge}</span>
          </button>
        ))}
      </div>

      {/* Primary HUD View & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Global PoP Map & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Global Anycast PoP Network Topology (AS 13335)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerDdos}
                  disabled={isDdosActive}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTriggerDdos(); } }}
                  tabIndex={0}
                  role="button"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                    isDdosActive
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 cursor-not-allowed'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <Zap className="w-3 h-3 text-rose-400" />
                  <span>{isDdosActive ? `Scrubbing... ${mitigationProgress}%` : 'Simulate 1.2 Tbps DDoS'}</span>
                </button>
              </div>
            </div>

            {/* SVG Global PoP Topology */}
            <div className="relative w-full h-64 bg-[#05080e] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
              {/* World Map Wireframe Grid */}
              <svg className="w-full h-full opacity-60" viewBox="0 0 700 320">
                <defs>
                  <linearGradient id="popGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                  </linearGradient>
                  <radialGradient id="meshCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </radialGradient>
                </defs>

                {/* Continental Graticule Lines */}
                <circle cx="350" cy="160" r="140" fill="url(#meshCenter)" />
                <line x1="20" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="20" y1="160" x2="680" y2="160" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="20" y1="240" x2="680" y2="240" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="175" y1="20" x2="175" y2="300" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="350" y1="20" x2="350" y2="300" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="525" y1="20" x2="525" y2="300" stroke="#1e293b" strokeDasharray="4 4" />

                {/* Cross-PoP Anycast Backbone Trunks */}
                <path
                  d="M 195 135 Q 285 100 375 110 T 535 220 T 595 138"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 535 220 L 615 275"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 195 135 Q 400 300 615 275"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />

                {/* Interactive PoP Nodes */}
                {edgePops.map(p => {
                  const isActive = p.status === 'ACTIVE';
                  const isScrubbing = p.status === 'SCRUBBING';
                  const isWithdrawn = p.status === 'WITHDRAWN';

                  return (
                    <g
                      key={p.id}
                      onClick={() => handleTogglePoP(p.id)}
                      className="cursor-pointer group"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTogglePoP(p.id); } }}
                    >
                      {/* Pulse Ring */}
                      {isActive && (
                        <circle
                          cx={p.coordinates.x}
                          cy={p.coordinates.y}
                          r="14"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          className="animate-ping origin-center opacity-40"
                        />
                      )}
                      {isScrubbing && (
                        <circle
                          cx={p.coordinates.x}
                          cy={p.coordinates.y}
                          r="16"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          className="animate-ping origin-center opacity-70"
                        />
                      )}

                      {/* Base Node */}
                      <circle
                        cx={p.coordinates.x}
                        cy={p.coordinates.y}
                        r="8"
                        fill={isWithdrawn ? '#334155' : isScrubbing ? '#e11d48' : '#0284c7'}
                        stroke={isWithdrawn ? '#64748b' : isScrubbing ? '#fda4af' : '#7dd3fc'}
                        strokeWidth="2"
                        className="transition-all group-hover:scale-125"
                      />

                      {/* PoP Label */}
                      <text
                        x={p.coordinates.x}
                        y={p.coordinates.y - 12}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {p.name.split(' ')[0]}
                      </text>

                      {/* Status Tag */}
                      <text
                        x={p.coordinates.x}
                        y={p.coordinates.y + 18}
                        textAnchor="middle"
                        fill={isWithdrawn ? '#94a3b8' : isScrubbing ? '#f43f5e' : '#38bdf8'}
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {p.status}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Watermark Details */}
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                Click any PoP to simulate BGP route withdrawal / reconvergence
              </div>
            </div>

            {/* Edge PoP Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {edgePops.map(pop => (
                <div
                  key={pop.id}
                  onClick={() => handleTogglePoP(pop.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTogglePoP(pop.id); } }}
                  tabIndex={0}
                  role="button"
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all focus:outline-none ${
                    pop.status === 'ACTIVE'
                      ? 'bg-slate-950/80 border-slate-800 hover:border-sky-500/40'
                      : pop.status === 'SCRUBBING'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-slate-900/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-semibold text-white">
                    <span>{pop.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      pop.status === 'ACTIVE'
                        ? 'bg-sky-500/20 text-sky-300'
                        : pop.status === 'SCRUBBING'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {pop.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">{pop.city}</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
                    <div>Egress: <span className="text-slate-200 tabular-nums">{pop.egressBps}</span></div>
                    <div>RTT: <span className="text-slate-200 tabular-nums">{pop.latencyToOriginMs}ms</span></div>
                    <div>Health: <span className="text-emerald-400 tabular-nums">{pop.healthScore}%</span></div>
                    <div>Routes: <span className="text-slate-200 tabular-nums">{pop.activeRoutesCount}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synthetic Global Client Probes */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Real-Time Synthetic Client Proximity Probes
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                EDNS0 / BGP Ingress Resolution
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="pb-1.5 font-normal">Client Origin</th>
                    <th className="pb-1.5 font-normal">Routed Edge PoP</th>
                    <th className="pb-1.5 font-normal">Protocol</th>
                    <th className="pb-1.5 font-normal text-right">RTT</th>
                    <th className="pb-1.5 font-normal text-right">BGP Hops</th>
                    <th className="pb-1.5 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {probes.map((pr, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 text-white font-semibold flex items-center gap-1.5">
                        <Send className="w-2.5 h-2.5 text-sky-400" />
                        {pr.clientLocation}
                      </td>
                      <td className="py-2 text-slate-300">
                        {pr.routedPoPCity}
                      </td>
                      <td className="py-2 text-slate-400 text-[11px]">
                        {pr.protocol}
                      </td>
                      <td className="py-2 text-right text-emerald-400 font-bold tabular-nums">
                        {pr.measuredRttMs}ms
                      </td>
                      <td className="py-2 text-right text-slate-300 tabular-nums">
                        {pr.bgpHops}
                      </td>
                      <td className="py-2 text-right">
                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                          pr.status === 'OPTIMAL'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Paradigm Specs, Invariants & Manifest */}
        <div className="space-y-4">
          {/* Sub-Tab Navigation */}
          <div className="flex border-b border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('topology')}
              className={`pb-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'topology'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Invariants
            </button>
            <button
              onClick={() => setActiveTab('probes')}
              className={`pb-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'probes'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Outcomes
            </button>
            <button
              onClick={() => setActiveTab('spec')}
              className={`pb-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'spec'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              BGP Config
            </button>
          </div>

          {/* Model Card Header */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
                {activeModel.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {activeModel.badge}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {activeModel.name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeModel.description}
            </p>

            <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Convergence:</span>
                <span className="text-emerald-400 font-semibold tabular-nums">{activeModel.routingConvergenceLatency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Failover SLA:</span>
                <span className="text-slate-200 tabular-nums">{activeModel.failoverConvergenceSla}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Algorithm:</span>
                <span className="text-sky-300 text-[11px] font-mono truncate max-w-[200px]" title={activeModel.algorithmFormula}>
                  {activeModel.algorithmFormula}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Content: Invariants */}
          {activeTab === 'topology' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Workflow Phases & Edge Invariants
              </div>
              <div className="space-y-2.5">
                {activeModel.workflowPhases.map((phase, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">
                        {i + 1}
                      </span>
                      {phase.name}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed pl-5">
                      {phase.description}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded mt-1 ml-5">
                      Invariant: {phase.invariants}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Outcomes */}
          {activeTab === 'probes' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Production SLA Outcomes
              </div>
              <div className="space-y-2">
                {Object.entries(activeModel.productionOutcomes).map(([metric, value], i) => (
                  <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex flex-col gap-0.5">
                    <span className="text-[11px] text-slate-400 font-mono">{metric}</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Spec */}
          {activeTab === 'spec' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  Router Config Spec
                </span>
                <button
                  onClick={copySpecManifest}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copySpecManifest(); } }}
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                >
                  {copiedSpec ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSpec ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-950 text-[10px] font-mono text-sky-300 overflow-x-auto max-h-72 border border-slate-800/80 leading-relaxed">
                {activeModel.specCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
