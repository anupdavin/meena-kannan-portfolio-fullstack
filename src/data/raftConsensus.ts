export interface ConsensusModel {
  id: string
  name: string
  paradigm: string
  badge: string
  quorumRequirement: string
  electionTimeoutRange: string
  logConsistencyInvariant: string
  splitBrainDefense: string
  workflowPhases: Array<{
    name: string
    color: string
    description: string
    invariants: string
  }>
  codeSnippet: {
    language: string
    filename: string
    code: string
  }
  architecturalInvariant: string
  productionOutcomes: Record<string, string>
}

export const CONSENSUS_MODELS: ConsensusModel[] = [
  {
    id: 'raft-leader-election',
    name: 'Raft Randomized Timer Leader Election',
    paradigm: 'Decomposable Strong Leader Consensus',
    badge: 'Raft Election',
    quorumRequirement: 'Strict Majority: floor(N/2) + 1 (e.g. 3 of 5 nodes)',
    electionTimeoutRange: '150ms to 300ms randomized timer',
    logConsistencyInvariant: 'At most one leader per term (Election Safety)',
    splitBrainDefense: 'Candidate must secure strict majority votes before assuming leader role',
    workflowPhases: [
      {
        name: 'FOLLOWER_HEARTBEAT_WAIT',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Node remains in Follower state while receiving periodic AppendEntries heartbeats from Leader.',
        invariants: 'Heartbeat interval is typically 50ms; election timer resets on each valid AppendEntries RPC.'
      },
      {
        name: 'CANDIDATE_TERM_STEP_UP',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'On election timeout, node increments currentTerm, transitions to Candidate, votes for self, and broadcasts RequestVote.',
        invariants: 'Peers only vote YES if candidate log is at least as up-to-date as their own and peer has not voted in this term.'
      },
      {
        name: 'MAJORITY_LEADER_PROMOTION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Securing votes from >= 3 of 5 nodes triggers instant Leader transition and immediate empty AppendEntries broadcast.',
        invariants: 'Leader never commits log entries from previous terms by counting replicas; must commit entry from current term.'
      }
    ],
    codeSnippet: {
      language: 'go',
      filename: 'raft_election.go',
      code: `func (rf *Raft) startElection() {
    rf.mu.Lock()
    rf.currentTerm++
    rf.state = Candidate
    rf.votedFor = rf.me
    rf.resetElectionTimer()
    term := rf.currentTerm
    lastLogIndex := rf.getLastLogIndex()
    lastLogTerm := rf.getLastLogTerm()
    rf.mu.Unlock()

    votes := 1
    for peer := range rf.peers {
        if peer == rf.me { continue }
        go func(p int) {
            args := &RequestVoteArgs{
                Term: term, CandidateId: rf.me,
                LastLogIndex: lastLogIndex, LastLogTerm: lastLogTerm,
            }
            reply := &RequestVoteReply{}
            if rf.sendRequestVote(p, args, reply) && reply.VoteGranted {
                rf.mu.Lock()
                votes++
                if votes > len(rf.peers)/2 && rf.state == Candidate && rf.currentTerm == term {
                    rf.state = Leader
                    rf.broadcastHeartbeats()
                }
                rf.mu.Unlock()
            }
        }(peer)
    }
}`
    },
    architecturalInvariant: 'Randomized election timeouts (150ms to 300ms) guarantee split-vote conflicts resolve within 1 to 2 election rounds, achieving sub-250ms leader failover without central coordinators.',
    productionOutcomes: {
      'Failover RTO': '<220ms automatic leader re-election',
      'Split-Vote Resolution': '<1.2% candidate collision rate',
      'Network Overhead': '50ms lightweight heartbeat RPCs',
      'Election Safety': 'Zero split-brain dual leaders observed'
    }
  },
  {
    id: 'raft-log-replication',
    name: 'Raft Replicated State Machine (RSM) Log Replication',
    paradigm: 'Strong Leader Append-Only State Machine',
    badge: 'Log Replication',
    quorumRequirement: 'Majority ACK: Leader awaits majority replication before committing',
    electionTimeoutRange: 'Continuous streaming (50ms heartbeat cadence)',
    logConsistencyInvariant: 'Log Matching: Identical index & term implies identical prefix',
    splitBrainDefense: 'Uncommitted entries overwritten if conflicting with newly elected leader',
    workflowPhases: [
      {
        name: 'CLIENT_PROPOSAL_INGEST',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Client sends command to Leader; Leader appends entry to local log in uncommitted state.',
        invariants: 'Leader assigns monotonically increasing logIndex and attaches currentTerm.'
      },
      {
        name: 'PARALLEL_APPEND_ENTRIES',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Leader broadcasts AppendEntries RPC containing entry, prevLogIndex, and prevLogTerm to all followers.',
        invariants: 'Follower verifies its log matches prevLogIndex and prevLogTerm before accepting new entry.'
      },
      {
        name: 'COMMIT_AND_STATE_APPLY',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Once majority of followers replicate entry, Leader updates commitIndex and applies command to local state machine.',
        invariants: 'Subsequent AppendEntries informs followers of new commitIndex; followers apply entries up to commitIndex.'
      }
    ],
    codeSnippet: {
      language: 'go',
      filename: 'raft_replication.go',
      code: `func (rf *Raft) replicateEntry(command interface{}) (int, int, bool) {
    rf.mu.Lock()
    defer rf.mu.Unlock()
    if rf.state != Leader { return -1, -1, false }

    index := len(rf.log)
    entry := LogEntry{Term: rf.currentTerm, Index: index, Command: command}
    rf.log = append(rf.log, entry)
    rf.matchIndex[rf.me] = index

    // Broadcast AppendEntries to peers asynchronously
    for peer := range rf.peers {
        if peer != rf.me {
            go rf.sendAppendEntriesToPeer(peer)
        }
    }
    return index, rf.currentTerm, true
}`
    },
    architecturalInvariant: 'State Machine Safety: If a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for the same index.',
    productionOutcomes: {
      'Commit Latency': 'Sub-12ms majority write persistence',
      'Throughput Profile': '14,500 state machine commits/sec',
      'Log Divergence': '0 divergent applied entries across cluster',
      'Follower Sync': 'Automatic log repair via nextIndex backtracking'
    }
  },
  {
    id: 'multi-raft-split-brain',
    name: 'Multi-Raft Network Partition & Quorum Isolation',
    paradigm: 'Partition-Tolerant Consensus Sub-Clusters',
    badge: 'Quorum Defense',
    quorumRequirement: 'Majority partition (>=3 nodes) operates; minority partition (<=2 nodes) freezes',
    electionTimeoutRange: 'Independent partition timeout evaluation',
    logConsistencyInvariant: 'Minority cannot achieve commit quorum; zero dirty split-brain commits',
    splitBrainDefense: 'Minority leader rejects client writes or buffers without committing; healed on re-merge',
    workflowPhases: [
      {
        name: 'WAN_PARTITION_ISOLATION',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'Network split separates cluster: Majority Group (Nodes 1, 2, 3) vs Minority Group (Nodes 4, 5).',
        invariants: 'Nodes 4 and 5 cannot communicate with Nodes 1, 2, or 3 across WAN failure boundary.'
      },
      {
        name: 'ASYMMETRIC_PROGRESSION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Majority partition elects Leader and continues committing writes (3/5 quorum). Minority leader times out.',
        invariants: 'Minority leader receives only 2 of 5 ACKs (less than 3 required majority), freezing commitIndex.'
      },
      {
        name: 'PARTITION_HEAL_AND_OVERWRITE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'On WAN restoration, minority nodes detect higher term from majority Leader, revert to Followers, and overwrite uncommitted logs.',
        invariants: 'Strict linearizability preserved: zero split-brain ledger corruptions or dual-committed states.'
      }
    ],
    codeSnippet: {
      language: 'typescript',
      filename: 'partitionQuorumCheck.ts',
      code: `export function evaluateQuorumCommit(
  clusterSize: number,
  ackedReplicas: number
): { canCommit: boolean; reason: string } {
  const quorum = Math.floor(clusterSize / 2) + 1; // Strict majority formula
  if (ackedReplicas >= quorum) {
    return {
      canCommit: true,
      reason: \`Quorum satisfied: \${ackedReplicas}/\${clusterSize} replicas acknowledged (>= \${quorum})\`
    };
  }
  return {
    canCommit: false,
    reason: \`Quorum failed: only \${ackedReplicas}/\${clusterSize} ACKs (need \${quorum}); freezing commits to prevent split-brain\`
  };
}`
    },
    architecturalInvariant: 'The strict majority quorum requirement ensures that any two quorums must intersect in at least one node, making simultaneous independent commits mathematically impossible.',
    productionOutcomes: {
      'Split-Brain Commits': '0 Split-Brain Transactions Committed',
      'Partition Detection': 'Sub-180ms minority freeze detection',
      'Heal Convergence': 'Sub-600ms automatic log overwrite and sync',
      'Availability Invariant': 'Continuous 99.999% uptime in majority partition'
    }
  },
  {
    id: 'joint-consensus-reconfiguration',
    name: 'Raft Joint Consensus Dynamic Cluster Membership',
    paradigm: 'Two-Phase Cluster Membership Migration',
    badge: 'Joint Consensus',
    quorumRequirement: 'Joint Quorum: Majorities required from BOTH Cold and Cnew simultaneously',
    electionTimeoutRange: 'Zero cluster downtime during expansion or migration',
    logConsistencyInvariant: 'Zero point where independent majorities can elect separate leaders',
    splitBrainDefense: 'Joint configuration C_old,new requires independent majority approval from both old and new sets',
    workflowPhases: [
      {
        name: 'JOINT_CONFIG_PROPOSAL',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Leader proposes joint configuration C_old,new combining current cluster and target replacement nodes.',
        invariants: 'Any decision (election or commit) during this phase requires independent majority from Cold AND Cnew.'
      },
      {
        name: 'JOINT_CONFIG_COMMIT',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Once C_old,new entry is committed under joint rules, Leader proposes and replicates final configuration C_new.',
        invariants: 'Neither Cold alone nor Cnew alone can make independent decisions until C_new is committed.'
      },
      {
        name: 'OLD_NODES_DECOMMISSION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'When C_new commits, decommissioned nodes not present in C_new shut down gracefully without impacting availability.',
        invariants: 'Zero downtime rolling migration across heterogeneous AWS availability zones.'
      }
    ],
    codeSnippet: {
      language: 'typescript',
      filename: 'jointConsensusValidator.ts',
      code: `export function checkJointQuorum(
  oldNodes: string[],
  newNodes: string[],
  acks: Set<string>
): boolean {
  const oldQuorum = Math.floor(oldNodes.length / 2) + 1;
  const newQuorum = Math.floor(newNodes.length / 2) + 1;

  const oldAcks = oldNodes.filter(n => acks.has(n)).length;
  const newAcks = newNodes.filter(n => acks.has(n)).length;

  // Joint Consensus invariant: BOTH groups must satisfy majority
  return oldAcks >= oldQuorum && newAcks >= newQuorum;
}`
    },
    architecturalInvariant: 'Joint consensus eliminates the single-server membership change bottleneck by safely allowing simultaneous multi-node additions and removals without risk of disjoint split elections.',
    productionOutcomes: {
      'Membership Migration': 'Zero downtime live cluster migration',
      'Split Election Risk': '0% disjoint configuration windows',
      'Validation Latency': '<1.5ms joint quorum calculation',
      'Decommission Safety': 'Clean node drain with zero in-flight data loss'
    }
  },
  {
    id: 'paxos-synod-comparison',
    name: 'Multi-Paxos vs Raft Comparative Evaluation',
    paradigm: 'Leaderless Synod vs Strong Leader Consensus',
    badge: 'Multi-Paxos vs Raft',
    quorumRequirement: 'Any majority quorum (N/2 + 1) across Synod ballot rounds',
    electionTimeoutRange: 'On-demand proposer contention or persistent master lease',
    logConsistencyInvariant: 'Value chosen once majority accepts; later proposals must adopt chosen value',
    splitBrainDefense: 'Higher ballot number overrides lower; acceptor rejects proposals with ballot < highest promised',
    workflowPhases: [
      {
        name: 'PHASE_1_PREPARE_PROMISE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Proposer sends Prepare(b) with ballot number b. Acceptors promise not to accept proposals < b.',
        invariants: 'Acceptor returns highest ballot and value accepted so far if any.'
      },
      {
        name: 'PHASE_2_ACCEPT_ACCEPTED',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Proposer sends Accept(b, v) where v is value with highest ballot from promises, or proposer own value.',
        invariants: 'Acceptors accept proposal unless they have promised a higher ballot since Phase 1.'
      },
      {
        name: 'STABLE_LEADER_LEASE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Multi-Paxos amortizes Phase 1 across all log slots by retaining a stable distinguished leader lease.',
        invariants: 'Eliminates dueling proposers livelock and achieves 1-RTT commit latency matching Raft.'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'PaxosAcceptor.java',
      code: `public class PaxosAcceptor {
    private long promisedBallot = -1;
    private long acceptedBallot = -1;
    private Object acceptedValue = null;

    // Phase 1b: Promise
    public synchronized PromiseReply onPrepare(long ballot) {
        if (ballot > promisedBallot) {
            promisedBallot = ballot;
            return new PromiseReply(true, acceptedBallot, acceptedValue);
        }
        return new PromiseReply(false, promisedBallot, null); // Reject lower ballot
    }

    // Phase 2b: Accepted
    public synchronized boolean onAccept(long ballot, Object value) {
        if (ballot >= promisedBallot) {
            promisedBallot = ballot;
            acceptedBallot = ballot;
            acceptedValue = value;
            return true; // Proposal accepted
        }
        return false;
    }
}`
    },
    architecturalInvariant: 'While Classic Paxos allows dueling proposers to livelock in Phase 1, Multi-Paxos with stable leader leases converges with Raft performance, trading conceptual simplicity for implementation complexity.',
    productionOutcomes: {
      'Commit RTT': '1 RTT in steady-state (matching Raft)',
      'Livelock Defense': 'Randomized backoff on Phase 1 rejection',
      'Protocol Complexity': 'High (Log holes & complex view changes)',
      'Production Provenance': 'Google Spanner & Chubby Lock Service'
    }
  }
]
