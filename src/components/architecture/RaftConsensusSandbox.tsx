import { useState, useId } from 'react'
import {
  ShieldAlert,
  Server,
  RotateCcw,
  Copy,
  Check,
  Split,
  Activity,
  Layers,
  FileCode,
  Radio,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { CONSENSUS_MODELS, type ConsensusModel } from '@/data/raftConsensus'

interface ClusterNode {
  id: string
  name: string
  role: 'LEADER' | 'CANDIDATE' | 'FOLLOWER' | 'ISOLATED'
  term: number
  commitIndex: number
  lastLogTerm: number
  votesReceived: number
  partitionGroup: 'MAJORITY' | 'MINORITY' | 'HEALTHY'
}

const INITIAL_NODES: ClusterNode[] = [
  { id: 'N1', name: 'Node 1 (Virginia)', role: 'LEADER', term: 4, commitIndex: 142, lastLogTerm: 4, votesReceived: 3, partitionGroup: 'HEALTHY' },
  { id: 'N2', name: 'Node 2 (Ohio)', role: 'FOLLOWER', term: 4, commitIndex: 142, lastLogTerm: 4, votesReceived: 0, partitionGroup: 'HEALTHY' },
  { id: 'N3', name: 'Node 3 (Oregon)', role: 'FOLLOWER', term: 4, commitIndex: 142, lastLogTerm: 4, votesReceived: 0, partitionGroup: 'HEALTHY' },
  { id: 'N4', name: 'Node 4 (Frankfurt)', role: 'FOLLOWER', term: 4, commitIndex: 142, lastLogTerm: 4, votesReceived: 0, partitionGroup: 'HEALTHY' },
  { id: 'N5', name: 'Node 5 (Singapore)', role: 'FOLLOWER', term: 4, commitIndex: 142, lastLogTerm: 4, votesReceived: 0, partitionGroup: 'HEALTHY' }
]

export default function RaftConsensusSandbox() {
  const [selectedModel, setSelectedModel] = useState<ConsensusModel>(CONSENSUS_MODELS[0])
  const [nodes, setNodes] = useState<ClusterNode[]>(INITIAL_NODES)
  const [isPartitioned, setIsPartitioned] = useState(false)
  const [simulationLog, setSimulationLog] = useState<string[]>([
    'Cluster initialized with 5 nodes in Term 4. Node 1 holds valid majority lease.',
    'Heartbeat RPCs streaming every 50ms across all nodes. Zero partition detected.'
  ])
  const [copied, setCopied] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const sandboxHeadingId = useId()

  const handleTriggerElection = () => {
    setIsSimulating(true)
    const newTerm = Math.max(...nodes.map(n => n.term)) + 1
    const candidateId = isPartitioned ? 'N4' : 'N2'

    setNodes(prev => prev.map(node => {
      if (node.id === candidateId) {
        return {
          ...node,
          role: 'CANDIDATE',
          term: newTerm,
          votesReceived: isPartitioned ? 2 : 4
        }
      }
      return node
    }))

    const logEntry = isPartitioned
      ? `[ELECTION] Node 4 election timer expired. Stepped up to Term ${newTerm} as CANDIDATE. In minority partition: secured 2/5 votes (insufficient for quorum).`
      : `[ELECTION] Node 2 election timer expired. Stepped up to Term ${newTerm} as CANDIDATE. Broadcasted RequestVote RPC; secured 4/5 votes. Promoted to LEADER.`

    setSimulationLog(prev => [logEntry, ...prev.slice(0, 5)])

    setTimeout(() => {
      if (!isPartitioned) {
        setNodes(prev => prev.map(node => {
          if (node.id === candidateId) {
            return { ...node, role: 'LEADER' }
          }
          if (node.id === 'N1') {
            return { ...node, role: 'FOLLOWER', term: newTerm }
          }
          return { ...node, term: newTerm }
        }))
      }
      setIsSimulating(false)
    }, 600)
  }

  const handleReplicateLog = () => {
    setIsSimulating(true)
    const leader = nodes.find(n => n.role === 'LEADER')
    if (!leader) {
      setSimulationLog(prev => ['[APPEND] Cannot replicate: no active leader elected in cluster.', ...prev.slice(0, 5)])
      setIsSimulating(false)
      return
    }

    if (isPartitioned && (leader.id === 'N4' || leader.id === 'N5')) {
      setSimulationLog(prev => [
        `[APPEND_BLOCKED] Node ${leader.id} proposed log entry but received only 2/5 ACKs. Commit frozen to prevent split-brain!`,
        ...prev.slice(0, 5)
      ])
      setIsSimulating(false)
      return
    }

    const nextCommit = leader.commitIndex + 1
    setNodes(prev => prev.map(node => {
      if (isPartitioned && (node.id === 'N4' || node.id === 'N5')) {
        return node // Minority does not receive majority log entries
      }
      return { ...node, commitIndex: nextCommit }
    }))

    setSimulationLog(prev => [
      `[APPEND_SUCCESS] Leader ${leader.id} replicated entry [Index ${nextCommit}, Term ${leader.term}]. Quorum satisfied (>=3 nodes ACK). State machine applied.`,
      ...prev.slice(0, 5)
    ])
    setIsSimulating(false)
  }

  const handleTogglePartition = () => {
    if (isPartitioned) {
      // Heal partition
      setIsPartitioned(false)
      const highestTerm = Math.max(...nodes.map(n => n.term))
      const highestCommit = Math.max(...nodes.map(n => n.commitIndex))
      setNodes(prev => prev.map(node => ({
        ...node,
        partitionGroup: 'HEALTHY',
        role: node.id === 'N1' ? 'LEADER' : 'FOLLOWER',
        term: highestTerm,
        commitIndex: highestCommit
      })))
      setSimulationLog(prev => [
        '[HEAL] Network partition healed. Minority nodes (N4, N5) observed Term ' + highestTerm + ' from N1. Uncommitted entries rolled back; logs synced to index ' + highestCommit + '.',
        ...prev.slice(0, 5)
      ])
    } else {
      // Split partition: N1, N2, N3 (Majority) vs N4, N5 (Minority)
      setIsPartitioned(true)
      setNodes(prev => prev.map(node => {
        if (node.id === 'N4' || node.id === 'N5') {
          return { ...node, partitionGroup: 'MINORITY', role: 'FOLLOWER' }
        }
        return { ...node, partitionGroup: 'MAJORITY' }
      }))
      setSimulationLog(prev => [
        '[PARTITION] Injected WAN network blackhole! Partition A: {N1, N2, N3} (Majority 3/5, Active). Partition B: {N4, N5} (Minority 2/5, Isolated).',
        ...prev.slice(0, 5)
      ])
    }
  }

  const handleResetCluster = () => {
    setIsPartitioned(false)
    setNodes(INITIAL_NODES)
    setSimulationLog([
      'Cluster reset to initial healthy baseline. Term 4, Node 1 is Leader, all 5 nodes synchronized.',
      'AppendEntries heartbeats running every 50ms with zero network packet loss.'
    ])
  }

  const copyRfcReport = () => {
    const rfc = `# RFC-7089: Distributed Consensus & Raft State Machine Architecture
Model: ${selectedModel.name} (${selectedModel.badge})
Paradigm: ${selectedModel.paradigm}
Quorum Requirement: ${selectedModel.quorumRequirement}
Election Timeout: ${selectedModel.electionTimeoutRange}
Log Invariant: ${selectedModel.logConsistencyInvariant}
Split-Brain Defense: ${selectedModel.splitBrainDefense}

## Invariant Guarantees:
- Architectural Invariant: ${selectedModel.architecturalInvariant}
- Election Safety: At most one leader can be elected in a given term.
- Leader Append-Only: A leader never overwrites or truncates its own log entries.
- Log Matching: If two logs contain an entry with the same index and term, they are identical up to that index.
- State Machine Safety: If a server has applied an entry at a given index, no other server will ever apply a different entry for that index.

## Production Metric Verification:
${Object.entries(selectedModel.productionOutcomes).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Replicated State Machine Code Specification:
\`\`\`${selectedModel.codeSnippet.language}
${selectedModel.codeSnippet.code}
\`\`\`
`
    navigator.clipboard.writeText(rfc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id="architecture-raft-consensus"
      aria-labelledby={sandboxHeadingId}
      className="rounded-2xl border border-slate-800 bg-[#050811] p-6 lg:p-8 relative overflow-hidden shadow-2xl"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Distributed Systems Engine 16
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Raft Consensus
            </span>
          </div>
          <h2 id={sandboxHeadingId} className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Distributed Consensus &amp; Raft Leader Election State Machine
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Interactive simulation of Raft randomized election timers, quorum-backed log replication, and WAN split-brain isolation.
            Evaluates strict election safety, state machine linearizability, and majority quorum consensus without central coordinators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyRfcReport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied RFC' : 'Copy Consensus RFC'}</span>
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6" role="tablist">
        {CONSENSUS_MODELS.map(model => {
          const isSelected = selectedModel.id === model.id
          return (
            <button
              key={model.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedModel(model)}
              className={`p-3 rounded-xl border text-left transition-all font-mono text-xs ${
                isSelected
                  ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold truncate">{model.badge}</div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">{model.paradigm}</div>
            </button>
          )
        })}
      </div>

      {/* Consensus Control & Visual Cluster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Visual Node Cluster */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#090e1a] p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
                5-Node Distributed Raft Cluster
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded border ${isPartitioned ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'}`}>
                {isPartitioned ? 'NETWORK PARTITION ACTIVE' : 'CLUSTER HEALTHY (5/5 ONLINE)'}
              </span>
            </div>
          </div>

          {/* Node Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {nodes.map(node => {
              const isLeader = node.role === 'LEADER'
              const isCandidate = node.role === 'CANDIDATE'
              const inMinority = node.partitionGroup === 'MINORITY'

              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    inMinority
                      ? 'bg-rose-950/10 border-rose-900/40 text-rose-200'
                      : isLeader
                      ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/40 text-emerald-300'
                      : isCandidate
                      ? 'bg-amber-950/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold">{node.name.split(' ')[0]}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                        inMinority
                          ? 'bg-rose-900/30 border-rose-700/50 text-rose-400'
                          : isLeader
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : isCandidate
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {inMinority ? 'ISOLATED' : node.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Term:</span>
                      <span className="text-slate-200 font-bold">{node.term}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commit Index:</span>
                      <span className="text-cyan-400">{node.commitIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Partition:</span>
                      <span className={inMinority ? 'text-rose-400' : 'text-slate-300'}>
                        {node.partitionGroup}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Simulation Action Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleTriggerElection}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>[ Trigger Election ]</span>
            </button>

            <button
              onClick={handleReplicateLog}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>[ Replicate Log Entry ]</span>
            </button>

            <button
              onClick={handleTogglePartition}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all focus-visible:ring-2 ${
                isPartitioned
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 focus-visible:ring-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20 focus-visible:ring-rose-500'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>{isPartitioned ? '[ Heal Partition ]' : '[ Simulate WAN Partition ]'}</span>
            </button>

            <button
              onClick={handleResetCluster}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all ml-auto focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Telemetry & Cluster State */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
                Consensus State Machine HUD
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs mb-4">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Quorum Invariant Formula</div>
                <div className="text-emerald-400 font-bold">Q = floor(N/2) + 1 = 3 / 5 nodes</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Strict majority prevents disjoint concurrent quorums</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Leader Lease</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">
                    {nodes.find(n => n.role === 'LEADER')?.name || 'No Active Leader'}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Term {Math.max(...nodes.map(n => n.term))}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">State Machine Safety</div>
                <div className="text-slate-300 font-medium">{selectedModel.logConsistencyInvariant}</div>
              </div>
            </div>
          </div>

          {/* Event Stream Log */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Live Raft RPC Trace</div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto">
              {simulationLog.map((log, idx) => (
                <div key={idx} className={idx === 0 ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Execution Steps */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider mb-3">
          Consensus Protocol Invariant Progression
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedModel.workflowPhases.map((phase, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${phase.color}`}>
                  {phase.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{phase.description}</p>
              <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                <span className="text-emerald-500 font-semibold">Invariant: </span>
                {phase.invariants}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Specification & Production Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippet */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300 font-bold">
                {selectedModel.codeSnippet.filename}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
              {selectedModel.codeSnippet.language}
            </span>
          </div>
          <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
            <code>{selectedModel.codeSnippet.code}</code>
          </pre>
          <div className="mt-3 text-[11px] font-mono text-slate-400">
            <span className="text-slate-300 font-semibold">Architectural Invariant: </span>
            {selectedModel.architecturalInvariant}
          </div>
        </div>

        {/* Quantified Production Outcomes */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Production Outcome Metrics
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {Object.entries(selectedModel.productionOutcomes).map(([metric, value]) => (
                <div key={metric} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-500 mb-1">{metric}</div>
                  <div className="text-sm font-mono font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Split-Brain Defense Specification
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              {selectedModel.splitBrainDefense}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
