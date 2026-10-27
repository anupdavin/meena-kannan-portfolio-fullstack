import { useState, useMemo } from 'react'
import {
  Globe2,
  Copy,
  Check,
  Server,
  Zap,
  Activity,
  GitBranch,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { MULTI_REGION_STRATEGIES, type MultiRegionReplicationStrategy } from '@/data/multiRegionReplication'

export default function MultiRegionReplicationSandbox() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(MULTI_REGION_STRATEGIES[0].id)
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false)
  const [isFailoverTriggered, setIsFailoverTriggered] = useState<boolean>(false)
  const [simulatedConflictStep, setSimulatedConflictStep] = useState<number>(0)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)

  const currentStrategy: MultiRegionReplicationStrategy = useMemo(() => {
    return MULTI_REGION_STRATEGIES.find(s => s.id === selectedStrategyId) || MULTI_REGION_STRATEGIES[0]
  }, [selectedStrategyId])

  const handleSelectStrategy = (id: string) => {
    setSelectedStrategyId(id)
    setIsPartitioned(false)
    setIsFailoverTriggered(false)
    setSimulatedConflictStep(0)
  }

  const handleTriggerConflict = () => {
    setSimulatedConflictStep(1)
    setTimeout(() => setSimulatedConflictStep(2), 800)
    setTimeout(() => setSimulatedConflictStep(3), 1600)
  }

  const handleTogglePartition = () => {
    setIsPartitioned(prev => !prev)
    setSimulatedConflictStep(0)
  }

  const handleTriggerFailover = () => {
    setIsFailoverTriggered(true)
    setTimeout(() => {
      // Auto-clear or keep failover indication
    }, 1500)
  }

  const handleHeal = () => {
    setIsPartitioned(false)
    setIsFailoverTriggered(false)
    setSimulatedConflictStep(0)
  }

  const handleCopyRfc = () => {
    const rfcMarkdown = [
      `# Multi-Region Database Replication RFC: ${currentStrategy.name}`,
      '',
      `**Strategy:** ${currentStrategy.name} (${currentStrategy.subtitle})`,
      `**Core Paradigm:** ${currentStrategy.strategyName}`,
      `**Consensus Model:** ${currentStrategy.consensusModel}`,
      `**Target RPO:** ${currentStrategy.rpoTarget}`,
      `**Target RTO:** ${currentStrategy.rtoTarget}`,
      `**Consistency Level:** ${currentStrategy.consistencyLevel}`,
      `**Governing ADR:** ${currentStrategy.governingAdr}`,
      '',
      '## Global Region Topology',
      '| Region ID | Location | Topology Role | RTT Ping | Replication Lag | Connections |',
      '| :--- | :--- | :--- | :--- | :--- | :--- |',
      ...currentStrategy.regions.map(r =>
        `| \`${r.id}\` | ${r.location} | **${r.role.toUpperCase()}** | ${r.pingMs}ms | ${r.replicationLagMs}ms | ${r.activeConnections} conns |`
      ),
      '',
      '## Production System Workload',
      `- System: ${currentStrategy.productionUseCase.system}`,
      `- Replicated Entity: ${currentStrategy.productionUseCase.entity}`,
      `- Workload Profile: ${currentStrategy.productionUseCase.workload}`,
      `- Architectural Justification: ${currentStrategy.productionUseCase.justification}`,
      '',
      '## Conflict Resolution Scenario',
      `### ${currentStrategy.conflictScenario.title}`,
      `- Write A (${currentStrategy.conflictScenario.writeA.region}): \`${currentStrategy.conflictScenario.writeA.payload}\``,
      `- Write B (${currentStrategy.conflictScenario.writeB.region}): \`${currentStrategy.conflictScenario.writeB.payload}\``,
      `- Arbitration Rule: ${currentStrategy.conflictScenario.resolutionRule}`,
      `- Converged Outcome: ${currentStrategy.conflictScenario.resolvedOutcome}`,
      `- Mathematical Proof: ${currentStrategy.conflictScenario.convergenceProof}`,
      '',
      '## Core Strengths',
      ...currentStrategy.pros.map(p => `- ${p}`),
      '',
      '## Tradeoffs & Constraints',
      ...currentStrategy.cons.map(c => `- ${c}`)
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  return (
    <div className="space-y-6 sm:space-y-8 rounded-2xl border border-slate-800 bg-[#070b12] p-4 sm:p-8 shadow-2xl">
      {/* 1. Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Globe2 className="w-3.5 h-3.5" />
          <span>MULTI-REGION DATABASE REPLICATION | CONFLICT RESOLUTION SIMULATOR</span>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
          Multi-Region Database Replication &amp; Conflict Resolution
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed max-w-3xl">
          Evaluate 5 multi-region replication architectures across global data centers: Aurora Global Storage,
          Active-Active DynamoDB, CRDT state semi-lattices, Raft consensus ranges, and Kafka MirrorMaker 2.
        </p>
      </div>

      {/* 2. Strategy Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {MULTI_REGION_STRATEGIES.map(strategy => {
          const isSelected = selectedStrategyId === strategy.id
          return (
            <button
              key={strategy.id}
              onClick={() => handleSelectStrategy(strategy.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/10'
              }`}
              aria-label={`Select replication strategy: ${strategy.name}`}
            >
              <div className={`text-xs font-mono font-bold mb-1 truncate ${
                isSelected ? 'text-cyan-400' : 'text-slate-300'
              }`}>
                {strategy.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {strategy.subtitle}
              </div>
            </button>
          )
        })}
      </div>

      {/* 3. Invariants & Production Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Invariants */}
        <div className="lg:col-span-2 space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-editorial text-white">
                {currentStrategy.name}
              </h4>
              <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                Model: <span className="text-slate-200">{currentStrategy.strategyName}</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              {currentStrategy.consistencyLevel}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {currentStrategy.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RPO Target</span>
              <span className="text-emerald-400 font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentStrategy.rpoTarget.split(' ')[0]} {currentStrategy.rpoTarget.split(' ')[1] || ''}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RTO Target</span>
              <span className="text-cyan-400 font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentStrategy.rtoTarget.split(' ')[0]} {currentStrategy.rtoTarget.split(' ')[1] || ''}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Conflict Strategy</span>
              <span className="text-amber-400 font-bold text-sm truncate block" title={currentStrategy.conflictResolution}>
                {currentStrategy.conflictResolution.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Consensus Quorum</span>
              <span className="text-purple-400 font-bold text-sm truncate block" title={currentStrategy.consensusModel}>
                {currentStrategy.consensusModel.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Production Case */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Production Workload
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Target Architecture:</span>
              <span className="text-white font-bold">{currentStrategy.productionUseCase.system}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Replicated Entity:</span>
              <span className="text-cyan-300 font-bold">{currentStrategy.productionUseCase.entity}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Profile:</span>
              <span className="text-amber-300 font-bold">{currentStrategy.productionUseCase.workload}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Architectural Rationale:</span>
              <span className="text-slate-400 text-[10px] font-sans leading-tight block mt-0.5">
                {currentStrategy.productionUseCase.justification}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between text-[10px]">
              <span className="text-slate-500">Governing ADR:</span>
              <span className="text-cyan-400 font-bold">{currentStrategy.governingAdr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Global Region Topology & Network Latency Matrix */}
      <div className="rounded-xl border border-slate-800 bg-[#040810] p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-white text-sm font-mono">
                Geographic Topology &amp; Cross-Region Lag Matrix
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Live simulated inter-datacenter latency round trips and replication log apply delays.
            </p>
          </div>

          {/* Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={handleTriggerConflict}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer font-bold active:scale-[0.98] flex items-center gap-1.5"
              aria-label="Simulate concurrent cross-region writes"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Conflicting Writes</span>
            </button>

            <button
              onClick={handleTogglePartition}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                isPartitioned
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              }`}
              aria-label="Toggle network partition split-brain simulation"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isPartitioned ? 'WAN PARTITION ACTIVE' : 'Simulate WAN Cut'}</span>
            </button>

            <button
              onClick={handleTriggerFailover}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer font-bold active:scale-[0.98]"
              aria-label="Trigger regional failover"
            >
              Failover
            </button>

            <button
              onClick={handleHeal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label="Heal network and reset state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Region Node Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentStrategy.regions.map((region, idx) => {
            const isWriter = region.role === 'primary' || region.role === 'coordinator' || region.role === 'peer'
            const effectiveRole = isFailoverTriggered && idx === 1 ? 'PROMOTED PRIMARY' : region.role.toUpperCase()
            const effectivePing = isPartitioned && idx > 0 ? 999 : region.pingMs
            const effectiveLag = isPartitioned && idx > 0 ? region.replicationLagMs + 1850 : region.replicationLagMs

            return (
              <div
                key={region.id}
                className={`p-4 rounded-xl border transition-all text-xs font-mono space-y-2 ${
                  isPartitioned && idx > 0
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                    : isFailoverTriggered && idx === 1
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isPartitioned && idx > 0
                        ? 'bg-rose-500 animate-ping'
                        : isWriter
                        ? 'bg-emerald-400'
                        : 'bg-cyan-400'
                    }`} />
                    <span className="font-bold text-white truncate max-w-[150px]">{region.name}</span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isWriter
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {effectiveRole}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">WAN RTT:</span>
                    <span className={`font-bold ${effectivePing > 500 ? 'text-rose-400' : 'text-slate-200'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {effectivePing > 500 ? 'TIMEOUT (DROP)' : `${effectivePing}ms`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replication Lag:</span>
                    <span className={`font-bold ${effectiveLag > 1000 ? 'text-rose-400' : 'text-cyan-300'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {effectiveLag}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Conns:</span>
                    <span className="text-slate-300" style={{ fontVariantNumeric: 'tabular-nums' }}>{region.activeConnections}</span>
                  </div>
                </div>

                {isPartitioned && idx > 0 && (
                  <div className="pt-2 border-t border-rose-500/30 text-[10px] text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>WAN Partition: Local queue buffering</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Conflict Scenario & Convergence Proof Engine */}
      <div className="p-4 sm:p-6 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">
              Live Conflict Resolution Scenario: {currentStrategy.conflictScenario.title}
            </h4>
          </div>
          <span className="text-[10px] text-slate-500">Deterministic Convergence Engine</span>
        </div>

        {/* Dual Conflicting Ingress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          {/* Write A */}
          <div className={`p-3 rounded-lg border transition-all ${
            simulatedConflictStep >= 1 ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-[#040810] border-slate-800'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-cyan-400">Write Transaction A</span>
              <span className="text-slate-500 text-[10px]">{currentStrategy.conflictScenario.writeA.region}</span>
            </div>
            <div className="text-[10px] text-slate-400 mb-1">
              Client: <span className="text-slate-200">{currentStrategy.conflictScenario.writeA.client}</span>
            </div>
            <div className="p-2 rounded bg-black/40 border border-slate-800 text-emerald-400/90 text-[10px] truncate">
              {currentStrategy.conflictScenario.writeA.payload}
            </div>
            <div className="text-[9px] text-slate-500 mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              Epoch: {currentStrategy.conflictScenario.writeA.timestampMs}
            </div>
          </div>

          {/* Write B */}
          <div className={`p-3 rounded-lg border transition-all ${
            simulatedConflictStep >= 1 ? 'bg-amber-950/30 border-amber-500/50' : 'bg-[#040810] border-slate-800'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-400">Write Transaction B</span>
              <span className="text-slate-500 text-[10px]">{currentStrategy.conflictScenario.writeB.region}</span>
            </div>
            <div className="text-[10px] text-slate-400 mb-1">
              Client: <span className="text-slate-200">{currentStrategy.conflictScenario.writeB.client}</span>
            </div>
            <div className="p-2 rounded bg-black/40 border border-slate-800 text-amber-400/90 text-[10px] truncate">
              {currentStrategy.conflictScenario.writeB.payload}
            </div>
            <div className="text-[9px] text-slate-500 mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              Epoch: {currentStrategy.conflictScenario.writeB.timestampMs}
            </div>
          </div>
        </div>

        {/* Resolution Verdict */}
        <div className="p-3.5 rounded-lg bg-[#040810] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[11px]">Arbitration Rule:</span>
            <span className="text-cyan-300 font-bold">{currentStrategy.conflictScenario.resolutionRule}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-bold block mb-1">Resolved Converged Outcome:</span>
            <p className="text-slate-300 font-sans leading-relaxed">
              {currentStrategy.conflictScenario.resolvedOutcome}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-bold block mb-1">Mathematical Convergence Proof:</span>
            <p className="text-emerald-400/90 text-[10px] font-mono leading-relaxed">
              {currentStrategy.conflictScenario.convergenceProof}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Export RFC Action */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopyRfc}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-xs font-mono font-bold cursor-pointer"
          aria-label="Copy multi-region replication RFC architecture specification"
        >
          {copiedRfc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedRfc ? 'Copied' : '[ Copy Multi-Region RFC ]'}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          Guarantees zero split-brain divergence under cross-ocean transatlantic WAN partitions.
        </span>
      </div>
    </div>
  )
}
