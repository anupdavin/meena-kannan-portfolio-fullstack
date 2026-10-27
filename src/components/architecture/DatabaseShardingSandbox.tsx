import { useState, useMemo } from 'react'
import {
  Database,
  Copy,
  Check,
  Server,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Search,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react'
import { DATABASE_SHARDING_STRATEGIES, type DatabaseShardingStrategy, type ShardNode } from '@/data/databaseSharding'

// Simple deterministic hash simulation for custom key input
function simpleHash32(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0 // Unsigned 32-bit int
}

export default function DatabaseShardingSandbox() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(DATABASE_SHARDING_STRATEGIES[0].id)
  const [activeShardList, setActiveShardList] = useState<ShardNode[]>(DATABASE_SHARDING_STRATEGIES[0].shards)
  const [customKeyInput, setCustomKeyInput] = useState<string>('tenant_enterprise_nike')
  const [clusterEventMessage, setClusterEventMessage] = useState<string | null>(null)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  const currentStrategy: DatabaseShardingStrategy = useMemo(() => {
    return DATABASE_SHARDING_STRATEGIES.find(s => s.id === selectedStrategyId) || DATABASE_SHARDING_STRATEGIES[0]
  }, [selectedStrategyId])

  const handleSelectStrategy = (id: string) => {
    setSelectedStrategyId(id)
    const strategy = DATABASE_SHARDING_STRATEGIES.find(s => s.id === id) || DATABASE_SHARDING_STRATEGIES[0]
    setActiveShardList(strategy.shards)
    setCustomKeyInput(strategy.routingProbes[0]?.key || 'partition_key_01')
    setClusterEventMessage(null)
  }

  // Calculate dynamic key probe routing
  const activeRoutingProbe = useMemo(() => {
    const rawKey = customKeyInput.trim() || 'default_key'
    const hashVal = simpleHash32(rawKey)
    const ringAngle = Math.round((hashVal / 4294967295) * 360) % 360
    const hexHash = '0x' + hashVal.toString(16).toUpperCase().padStart(8, '0')

    const nodeCount = activeShardList.length
    if (nodeCount === 0) {
      return {
        key: rawKey,
        hashHex: hexHash,
        ringAngleDeg: ringAngle,
        shardId: 'none',
        shardName: 'Unassigned',
        rationale: 'No active storage shards registered in cluster.'
      }
    }

    if (currentStrategy.id === 'consistent-hashing') {
      const sliceSize = 360 / nodeCount
      const shardIndex = Math.floor(ringAngle / sliceSize) % nodeCount
      const matchedShard = activeShardList[shardIndex] || activeShardList[0]
      return {
        key: rawKey,
        hashHex: hexHash,
        ringAngleDeg: ringAngle,
        shardId: matchedShard.id,
        shardName: matchedShard.name,
        rationale: `Hash maps to ${ringAngle} deg on ring; clockwise traversal lands on virtual node belonging to ${matchedShard.name}.`
      }
    } else if (currentStrategy.id === 'hash-modulo') {
      const shardIndex = (hashVal & 0x7FFFFFFF) % nodeCount
      const matchedShard = activeShardList[shardIndex] || activeShardList[0]
      return {
        key: rawKey,
        hashHex: hexHash,
        ringAngleDeg: Math.round((shardIndex / nodeCount) * 360),
        shardId: matchedShard.id,
        shardName: matchedShard.name,
        rationale: `MurmurHash3 integer ${hashVal.toLocaleString()} % ${nodeCount} = ${shardIndex}; direct client routing to ${matchedShard.name}.`
      }
    } else {
      // Find matching predefined probe or fallback
      const foundPredefined = currentStrategy.routingProbes.find(p => p.key === rawKey)
      if (foundPredefined) {
        return {
          key: foundPredefined.key,
          hashHex: foundPredefined.hashHex,
          ringAngleDeg: foundPredefined.ringAngleDeg,
          shardId: foundPredefined.targetShardId,
          shardName: foundPredefined.targetShardName,
          rationale: foundPredefined.rationale
        }
      }
      const defaultShard = activeShardList[hashVal % nodeCount]
      return {
        key: rawKey,
        hashHex: hexHash,
        ringAngleDeg: ringAngle,
        shardId: defaultShard.id,
        shardName: defaultShard.name,
        rationale: `Routed via partition boundary heuristics to ${defaultShard.name}.`
      }
    }
  }, [customKeyInput, activeShardList, currentStrategy])

  // Cluster topology mutation handlers
  const handleAddShard = () => {
    if (activeShardList.length >= 8) {
      setClusterEventMessage('Cluster limit reached (8 active shards in cluster).')
      return
    }
    const newIndex = activeShardList.length + 1
    const newShardId = `shard-0${newIndex}`
    const newShard: ShardNode = {
      id: newShardId,
      name: `Shard 0${newIndex} (Dynamic Scale Node)`,
      virtualNodeCount: currentStrategy.id === 'consistent-hashing' ? 150 : 1,
      assignedRange: `0x${((newIndex - 1) * 32).toString(16).padStart(2, '0')}000000 - 0x${(newIndex * 32 - 1).toString(16).padStart(2, '0')}FFFFFF`,
      keyCount: Math.round(245000 / newIndex),
      storageUsageGb: Math.round((140 / newIndex) * 10) / 10,
      cpuUtilizationPct: 42.0,
      status: 'rebalancing'
    }

    const updated = [...activeShardList, newShard]
    setActiveShardList(updated)

    const migrationPercent = Math.round((1 / newIndex) * 100 * 10) / 10
    const retainedPercent = Math.round((100 - migrationPercent) * 10) / 10
    setClusterEventMessage(
      `Scale-out: Added ${newShard.name}. Only ${migrationPercent}% of keys migrated; ${retainedPercent}% remained on existing nodes without interruption.`
    )
  }

  const handleDrainShard = () => {
    if (activeShardList.length <= 2) {
      setClusterEventMessage('Minimum 2 shards required to maintain partition redundancy.')
      return
    }
    const victim = activeShardList[activeShardList.length - 1]
    const remaining = activeShardList.slice(0, activeShardList.length - 1)
    setActiveShardList(remaining)
    setClusterEventMessage(
      `Scale-in: Decommissioned ${victim.name}. Keys gracefully handed off clockwise to neighboring successor shard.`
    )
  }

  const handleResetCluster = () => {
    setActiveShardList(currentStrategy.shards)
    setClusterEventMessage(null)
  }

  const handleCopyRfc = () => {
    const rfcMarkdown = [
      `# Database Sharding & Partitioning RFC: ${currentStrategy.name}`,
      '',
      `**Strategy:** ${currentStrategy.name} (${currentStrategy.subtitle})`,
      `**Partition Algorithm:** ${currentStrategy.partitionAlgorithm}`,
      `**Rebalancing Overhead:** ${currentStrategy.rebalancingOverhead}`,
      `**Hotspot Resilience:** ${currentStrategy.hotspotResilience}`,
      `**Cross-Shard Join Complexity:** ${currentStrategy.crossShardJoinComplexity}`,
      `**Governing Architecture Decision:** ${currentStrategy.governingAdr}`,
      '',
      '## Shard Node Topologies',
      '| Shard ID | Node Name | VNodes | Partition Range | Key Count | Storage (GB) | CPU % | Status |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
      ...activeShardList.map(s =>
        `| \`${s.id}\` | ${s.name} | ${s.virtualNodeCount} | \`${s.assignedRange}\` | ${s.keyCount.toLocaleString()} | ${s.storageUsageGb} GB | ${s.cpuUtilizationPct}% | **${s.status.toUpperCase()}** |`
      ),
      '',
      '## Production Use Case & Workload Profile',
      `- System: ${currentStrategy.productionUseCase.system}`,
      `- Entity: ${currentStrategy.productionUseCase.entity}`,
      `- Workload: ${currentStrategy.productionUseCase.workload}`,
      `- Justification: ${currentStrategy.productionUseCase.justification}`,
      '',
      '## Architectural Trade-Offs',
      '### Advantages',
      ...currentStrategy.tradeoffs.pros.map(p => `- ${p}`),
      '### Inherent Trade-Offs & Mitigations',
      ...currentStrategy.tradeoffs.cons.map(c => `- ${c}`),
      '',
      '## Reference Shard Router Code',
      '```java',
      currentStrategy.routingCodeSnippet,
      '```',
      '',
      '---',
      '*Authored by Meena Kannan, Principal Solutions Architect*'
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown).then(() => {
      setCopiedRfc(true)
      setTimeout(() => setCopiedRfc(false), 2000)
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentStrategy.routingCodeSnippet).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  // SVG Ring Geometry Calculations
  const ringRadius = 120
  const centerCoord = 150

  return (
    <div className="specular-card p-6 md:p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 font-sans shadow-2xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-800/80 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>sharding@meena-cluster:~/topology#</span>
            <span className="text-neutral-500 font-mono text-[11px]">[Active Cluster Topology]</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Database Sharding & Consistent Hashing Playground</span>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              ADR-004
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
            Simulate dynamic shard scaling, virtual node distributions over 360-degree integer rings, client-side MurmurHash3 key routing, and zero-hotspot rebalancing topologies.
          </p>
        </div>

        {/* Global 1-Click Export Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleCopyRfc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-700/80 text-neutral-200 hover:text-white hover:border-emerald-500 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            title="Export full architecture RFC markdown"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copiedRfc ? 'RFC Copied!' : 'Copy Sharding RFC'}</span>
          </button>
        </div>
      </div>

      {/* Strategy Selector Tabs */}
      <div className="pt-6 relative z-10">
        <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
          <span>Select Sharding Architecture & Consensus Model:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DATABASE_SHARDING_STRATEGIES.map(strat => {
            const isSelected = strat.id === selectedStrategyId
            return (
              <button
                key={strat.id}
                onClick={() => handleSelectStrategy(strat.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all text-xs font-mono ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                } focus-visible:ring-2 focus-visible:ring-emerald-400`}
              >
                <span className="font-semibold text-neutral-200">{strat.name}</span>
                <span className="text-[10px] text-neutral-400 truncate mt-0.5">{strat.subtitle}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cluster Event Banner */}
      {clusterEventMessage && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs font-mono text-emerald-300 flex items-center justify-between gap-3 relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{clusterEventMessage}</span>
          </div>
          <button
            onClick={() => setClusterEventMessage(null)}
            className="text-[11px] text-emerald-400/80 hover:text-emerald-200 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive Topology Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
        {/* Left Column: Consistent Hashing Ring & Key Probe (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Circular Hash Ring & Topology Map */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  {currentStrategy.id === 'consistent-hashing' ? '360° Consistent Hashing Ring (Virtual Nodes)' : 'Cluster Partition Layout'}
                </span>
              </div>
              {/* Dynamic Scaling Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAddShard}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[11px] font-mono text-neutral-200 transition-colors"
                  title="Dynamically scale out cluster by adding 1 physical shard"
                >
                  <PlusCircle className="w-3 h-3 text-emerald-400" />
                  <span>Add Node</span>
                </button>
                <button
                  onClick={handleDrainShard}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[11px] font-mono text-neutral-200 transition-colors"
                  title="Gracefully drain and decommission 1 shard"
                >
                  <MinusCircle className="w-3 h-3 text-rose-400" />
                  <span>Drain Node</span>
                </button>
                <button
                  onClick={handleResetCluster}
                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Reset cluster topology to default"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* SVG Ring Visualizer */}
            <div className="flex flex-col items-center justify-center py-4 bg-neutral-950/80 rounded-lg border border-neutral-800/80 relative">
              <svg viewBox="0 0 300 300" className="w-64 h-64 md:w-72 md:h-72">
                {/* Background Ring Track */}
                <circle
                  cx={centerCoord}
                  cy={centerCoord}
                  r={ringRadius}
                  fill="none"
                  stroke="#262626"
                  strokeWidth="6"
                  strokeDasharray="4 4"
                />

                {/* Shard Nodes on the Ring */}
                {activeShardList.map((shard, idx) => {
                  const nodeCount = activeShardList.length
                  const angleDeg = (idx / nodeCount) * 360 - 90
                  const angleRad = (angleDeg * Math.PI) / 180
                  const nx = centerCoord + ringRadius * Math.cos(angleRad)
                  const ny = centerCoord + ringRadius * Math.sin(angleRad)
                  const isTarget = shard.id === activeRoutingProbe.shardId

                  return (
                    <g key={shard.id} className="transition-all duration-300">
                      {/* Node Pulse Effect if Selected */}
                      {isTarget && (
                        <circle
                          cx={nx}
                          cy={ny}
                          r="16"
                          fill="rgba(16, 185, 129, 0.15)"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          className="animate-ping"
                        />
                      )}
                      {/* Physical Node Dot */}
                      <circle
                        cx={nx}
                        cy={ny}
                        r={isTarget ? 10 : 7}
                        fill={isTarget ? '#10b981' : '#3b82f6'}
                        stroke="#0a0a0a"
                        strokeWidth="2"
                        className="cursor-pointer hover:scale-125 transition-transform"
                      />
                      {/* Node Label Text */}
                      <text
                        x={nx}
                        y={ny + (ny > centerCoord ? 18 : -14)}
                        fill={isTarget ? '#10b981' : '#a3a3a3'}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight={isTarget ? 'bold' : 'normal'}
                      >
                        {shard.id.toUpperCase()}
                      </text>
                    </g>
                  )
                })}

                {/* Key Routing Pointer & Sweep Hand */}
                {(() => {
                  const probeDeg = activeRoutingProbe.ringAngleDeg - 90
                  const probeRad = (probeDeg * Math.PI) / 180
                  const kx = centerCoord + (ringRadius - 15) * Math.cos(probeRad)
                  const ky = centerCoord + (ringRadius - 15) * Math.sin(probeRad)

                  return (
                    <g>
                      {/* Radial Line from center to Key Location */}
                      <line
                        x1={centerCoord}
                        y1={centerCoord}
                        x2={kx}
                        y2={ky}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      {/* Key Location Dot */}
                      <circle cx={kx} cy={ky} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    </g>
                  )
                })()}

                {/* Center Cluster Hub Details */}
                <circle cx={centerCoord} cy={centerCoord} r="36" fill="#141414" stroke="#262626" strokeWidth="1.5" />
                <text x={centerCoord} y={centerCoord - 8} fill="#737373" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  SHARDS
                </text>
                <text x={centerCoord} y={centerCoord + 10} fill="#ffffff" fontSize="16" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {activeShardList.length}
                </text>
                <text x={centerCoord} y={centerCoord + 22} fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle">
                  ACTIVE
                </text>
              </svg>

              {/* Topology Summary Pill Below Ring */}
              <div className="text-[11px] font-mono text-neutral-400 mt-2 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Target Shard: <strong className="text-emerald-300">{activeRoutingProbe.shardName}</strong></span>
                </span>
                <span className="text-neutral-600">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Key Hash: <strong className="text-neutral-200">{activeRoutingProbe.hashHex}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Key Probe Input */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sharding-key-input" className="text-xs font-mono font-medium text-neutral-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span>Simulate Key Partition Routing Probe:</span>
              </label>
              <span className="text-[10px] font-mono text-neutral-500">Live Client Hash Evaluation</span>
            </div>

            <div className="flex gap-2">
              <input
                id="sharding-key-input"
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Type partition key (e.g. tenant_nike_orders, user_881)"
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700/80 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Sample Keys Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] font-mono text-neutral-500">Preset Probes:</span>
              {currentStrategy.routingProbes.map((probe) => (
                <button
                  key={probe.key}
                  onClick={() => setCustomKeyInput(probe.key)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    customKeyInput === probe.key
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  {probe.key}
                </button>
              ))}
            </div>

            {/* Live Routing Analysis Output */}
            <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Route:</span>
                  <span className="text-amber-400 font-semibold">{activeRoutingProbe.key}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-600" />
                  <span className="text-emerald-400 font-bold">{activeRoutingProbe.shardName}</span>
                </div>
                <span className="text-[10px] text-neutral-500">
                  Ring Angle: <span className="text-neutral-300">{activeRoutingProbe.ringAngleDeg}°</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {activeRoutingProbe.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Shard Node Metrics Ledger & Code Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Shards Status Ledger */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2.5">
              <span className="text-xs font-mono font-semibold text-neutral-200">
                Active Storage Nodes ({activeShardList.length})
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Load Skew: &lt; 2.1% σ
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {activeShardList.map((shard) => {
                const isTarget = shard.id === activeRoutingProbe.shardId
                return (
                  <div
                    key={shard.id}
                    className={`p-2.5 rounded-lg border transition-all text-xs font-mono ${
                      isTarget
                        ? 'bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-white'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-100 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isTarget ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                        {shard.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {shard.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-850 text-[10px] text-neutral-400">
                      <div>
                        <span className="block text-neutral-500">Keys:</span>
                        <span className="text-neutral-200 font-semibold tabular-nums">{shard.keyCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Storage:</span>
                        <span className="text-neutral-200 font-semibold tabular-nums">{shard.storageUsageGb} GB</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">CPU Load:</span>
                        <span className="text-neutral-200 font-semibold tabular-nums">{shard.cpuUtilizationPct}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reference Router Code Inspector */}
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-neutral-200">
                Production Routing Implementation
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-emerald-400 transition-colors"
                title="Copy reference Java / SQL router code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed flex-1 max-h-[220px]">
              <code>{currentStrategy.routingCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Production System Context & Architectural Invariants */}
      <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 text-xs">
          <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold mb-1">
            Production System Workload
          </div>
          <div className="text-neutral-200 font-medium mb-1">{currentStrategy.productionUseCase.system}</div>
          <div className="text-neutral-400 text-[11px] leading-relaxed mb-2">
            <strong>Target Entity:</strong> {currentStrategy.productionUseCase.entity} | <strong>Workload:</strong> {currentStrategy.productionUseCase.workload}
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            "{currentStrategy.productionUseCase.justification}"
          </p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 text-xs">
          <div className="text-[11px] font-mono text-neutral-400 uppercase font-semibold mb-1">
            Rebalancing Invariants & Trade-Offs
          </div>
          <div className="text-[11px] text-neutral-300 mb-1">
            <strong>Overhead:</strong> {currentStrategy.rebalancingOverhead}
          </div>
          <div className="text-[11px] text-neutral-300 mb-1">
            <strong>Hotspot Resilience:</strong> {currentStrategy.hotspotResilience}
          </div>
          <div className="text-[11px] text-neutral-400 text-[11px]">
            <strong>Scatter-Gather Joins:</strong> {currentStrategy.crossShardJoinComplexity}
          </div>
        </div>
      </div>
    </div>
  )
}
