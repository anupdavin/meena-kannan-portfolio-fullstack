export interface ChaosTraceStep {
  timestamp: string
  phase: string
  actor: string
  action: string
  status: 'nominal' | 'warning' | 'critical' | 'mitigated' | 'resolved'
  detail: string
}

export interface ChaosDrill {
  id: string
  systemId: string
  title: string
  systemName: string
  category: string
  failureType: string
  injectedFault: string
  steadyStateInvariants: string[]
  sreHypothesis: string
  governingAdr: string
  rpoMetric: string
  rtoMetric: string
  impactMetrics: {
    rpo: string
    rto: string
    availabilitySla: string
    divergenceRate: string
    maxLatencySpike: string
  }
  executionTrace: ChaosTraceStep[]
  runbookSnippet: {
    command: string
    language: string
    description: string
  }
}

export const CHAOS_DRILLS: ChaosDrill[] = [
  {
    id: 'az-partition-failover',
    systemId: 'saas-platform',
    title: 'Multi-Region AWS AZ Failure & Primary Partition',
    systemName: 'Cloud-Native Multi-Tenant SaaS Core',
    category: 'High Availability & Database Failover',
    failureType: 'Catastrophic AWS Availability Zone Network Blackhole',
    injectedFault: 'Simulated AWS Network ACL dropping 100% ingress/egress packets in us-east-1a; Aurora primary partitioned.',
    steadyStateInvariants: [
      'Zero uncommitted data loss (RPO = 0.0s)',
      'Cluster write availability restored in <15s (RTO < 15.0s)',
      'Client connection pool holds leases without cascading HTTP 500s',
      'PostgreSQL Row-Level Security (RLS) tenant isolation invariants preserved'
    ],
    sreHypothesis: 'PgBouncer health probe detects TCP keepalive drops in <800ms; Aurora multi-AZ quorum promotes standby replica in us-east-1b to cluster writer in <12s; client queries buffer in connection pool.',
    governingAdr: 'ADR-004 & ADR-005',
    rpoMetric: '0.0s (Zero Loss)',
    rtoMetric: '13.1s (Under 15s Target)',
    impactMetrics: {
      rpo: '0.0s (Raft Consensus Confirmed)',
      rto: '13.1s (Replica Promoted)',
      availabilitySla: '99.995%',
      divergenceRate: '0.00% (Zero Inconsistencies)',
      maxLatencySpike: '340ms (Held in Pool Queue)'
    },
    executionTrace: [
      {
        timestamp: '00:00.000',
        phase: 'INJECT',
        actor: 'AWS Chaos Agent',
        action: 'Ingress Blackhole',
        status: 'critical',
        detail: 'Simulated network partition: dropped all packets to primary AZ us-east-1a.'
      },
      {
        timestamp: '00:00.412',
        phase: 'DETECT',
        actor: 'PgBouncer Health Probe',
        action: 'TCP Probe Timeout',
        status: 'warning',
        detail: '3 consecutive TCP keepalive timeouts recorded on primary socket 5432.'
      },
      {
        timestamp: '00:00.820',
        phase: 'CIRCUIT_BREAK',
        actor: 'PgBouncer Pool Manager',
        action: 'Suspend Connection Leases',
        status: 'warning',
        detail: 'Marked writer pool suspended; buffering 140 active client transactions without throwing 500s.'
      },
      {
        timestamp: '00:04.110',
        phase: 'RAFT_QUORUM',
        actor: 'Aurora Storage Layer',
        action: 'Consensus Quorum Lost',
        status: 'critical',
        detail: '4 of 6 storage segments in surviving AZs confirm primary silence; trigger election.'
      },
      {
        timestamp: '00:11.850',
        phase: 'PROMOTION',
        actor: 'RDS Control Plane',
        action: 'Promote Read Replica',
        status: 'mitigated',
        detail: 'Standby replica in us-east-1b elected new cluster primary; WAL replay verified.'
      },
      {
        timestamp: '00:12.320',
        phase: 'FAILOVER',
        actor: 'Amazon Route 53',
        action: 'Cluster CNAME Update',
        status: 'mitigated',
        detail: 'Internal cluster DNS swapped to us-east-1b instance endpoint (TTL 1s).'
      },
      {
        timestamp: '00:13.100',
        phase: 'DRAIN',
        actor: 'PgBouncer Pool Manager',
        action: 'Drain Buffered Queue',
        status: 'resolved',
        detail: 'Unfrozen connection pool; 140 held queries successfully committed to new writer.'
      },
      {
        timestamp: '00:14.200',
        phase: 'RECOVERED',
        actor: 'SRE Synthetic Monitor',
        action: 'End-to-End Verification',
        status: 'nominal',
        detail: '14,200 synthetic operations verified: 0 lost writes, 0 HTTP 5xx errors returned.'
      }
    ],
    runbookSnippet: {
      language: 'bash',
      command: `aws rds failover-db-cluster \\
  --db-cluster-identifier saas-core-production-cluster \\
  --target-db-instance-identifier saas-core-replica-useast1b

# Verify cluster endpoint health and buffer drain
pg_isready -h saas-core-production.cluster-ro.internal -p 5432 -t 3`,
      description: 'Trigger controlled AWS Aurora RDS Multi-AZ failover and verify PgBouncer connection buffer draining.'
    }
  },
  {
    id: 'kafka-poison-pill-isolation',
    systemId: 'ecommerce-saga',
    title: 'Kafka Poison Pill & Non-Blocking Retry Topic Isolation',
    systemName: 'High-Throughput E-Commerce Checkout Engine',
    category: 'Event Streams & Head-of-Line Blocking',
    failureType: 'Malformed Schema Payload on High-Throughput Event Partition',
    injectedFault: 'Corrupted Protobuf byte sequence injected into orders.v1 partition 3 with unregistered schema ID 0xDEAD.',
    steadyStateInvariants: [
      'Zero consumer group rebalance storms',
      'Consumer lag on partition 3 remains strictly <50ms',
      'Remaining 31 partitions continue continuous 15k+ TPS throughput',
      'Poison pill routed to DLQ with full diagnostic stack trace'
    ],
    sreHypothesis: 'Spring Kafka DefaultErrorHandler catches RecordDeserializationException in <10ms; DeadLetterPublishingRecoverer intercepts poison pill and routes to orders.v1.DLQ without stopping partition consumption.',
    governingAdr: 'ADR-001 & ADR-002',
    rpoMetric: '0.0s (DLQ Preserved)',
    rtoMetric: '12ms (Non-Blocking)',
    impactMetrics: {
      rpo: '0.0s (Preserved in DLQ)',
      rto: '12ms (Immediate Offset Advance)',
      availabilitySla: '99.999%',
      divergenceRate: '0.00% (No Partition Halt)',
      maxLatencySpike: '0.0ms (Bypassed Main Flow)'
    },
    executionTrace: [
      {
        timestamp: '00:00.000',
        phase: 'INJECT',
        actor: 'Kafka Chaos Injector',
        action: 'Inject Malformed Payload',
        status: 'critical',
        detail: 'Injected corrupt byte array into orders.v1 partition 3 (Schema ID 0xDEAD).'
      },
      {
        timestamp: '00:00.008',
        phase: 'DETECT',
        actor: 'OrderConsumerWorker-3',
        action: 'Deserialization Panic',
        status: 'warning',
        detail: 'Protobuf parser raised RecordDeserializationException: Invalid wire format tag.'
      },
      {
        timestamp: '00:00.012',
        phase: 'ISOLATE',
        actor: 'DeadLetterPublishingRecoverer',
        action: 'Intercept & Enrich',
        status: 'mitigated',
        detail: 'Captured failed record; appended X-Exception-Stacktrace and X-Original-Topic headers.'
      },
      {
        timestamp: '00:00.016',
        phase: 'FAILOVER',
        actor: 'Kafka Producer ProducerPool',
        action: 'Publish to DLQ Topic',
        status: 'mitigated',
        detail: 'Successfully routed malformed payload to orders.v1.DLQ with ack=all.'
      },
      {
        timestamp: '00:00.019',
        phase: 'DRAIN',
        actor: 'Kafka ConsumerCoordinator',
        action: 'Commit Offset Advance',
        status: 'resolved',
        detail: 'Committed offset 849,204; partition 3 consumption resumes without rebalance.'
      },
      {
        timestamp: '00:00.024',
        phase: 'DETECT',
        actor: 'PagerDuty Webhook',
        action: 'Emit SRE Diagnostic Alert',
        status: 'warning',
        detail: 'DLQ metric threshold alerted: 1 invalid schema caught; triage runbook linked.'
      },
      {
        timestamp: '00:00.035',
        phase: 'RECOVERED',
        actor: 'Synthetic Load Generator',
        action: 'Throughput Verification',
        status: 'nominal',
        detail: 'All 32 partitions processed 15,200 orders continuously; consumer lag = 0.'
      }
    ],
    runbookSnippet: {
      language: 'bash',
      command: `# Inspect DLQ record with exception headers
kafka-console-consumer --bootstrap-server kafka.production:9092 \\
  --topic orders.v1.DLQ \\
  --from-beginning --max-messages 1 \\
  --property print.headers=true`,
      description: 'Inspect captured poison pill payload and verify DLQ routing headers without disrupting consumer partitions.'
    }
  },
  {
    id: 'websocket-thundering-herd',
    systemId: 'realtime-collab',
    title: 'WebSocket Thundering Herd & Redis Sentinel Primary Election',
    systemName: 'Real-Time Task Collaboration Mesh',
    category: 'Concurrency Runtimes & Connection Floods',
    failureType: 'Hard SIGKILL on Primary Redis Sentinel with 50,000 Connected Clients',
    injectedFault: 'kill -9 sent to Redis Primary PID 4108 under active 52,000 WebSocket client load.',
    steadyStateInvariants: [
      'JVM OS thread count strictly under 2,500 via Java 21 Virtual Threads',
      'Zero Out-Of-Memory (OOM) heap exhaustion (<450MB footprint)',
      'Client broadcast messages buffered during 1.2s election window',
      'Zero dropped WebSocket connections; clients experience 0 socket resets'
    ],
    sreHypothesis: 'Sentinel quorum detects master loss in <800ms; promotes replica in <1.2s; Caffeine L1 ring buffer bridges ephemeral message gap; Virtual Threads park cooperatively with 2KB heap overhead.',
    governingAdr: 'ADR-003 & ADR-004',
    rpoMetric: '0.0s (Ring Buffer Bridged)',
    rtoMetric: '1.35s (Sentinel Election)',
    impactMetrics: {
      rpo: '0.0s (Ephemeral Diff Replayed)',
      rto: '1.35s (Redis Replica Promoted)',
      availabilitySla: '99.99%',
      divergenceRate: '0.00% (No Lost Frames)',
      maxLatencySpike: '1,280ms (During Quorum Vote)'
    },
    executionTrace: [
      {
        timestamp: '00:00.000',
        phase: 'INJECT',
        actor: 'Chaos Monkey Daemon',
        action: 'kill -9 Primary Redis',
        status: 'critical',
        detail: 'Abruptly terminated Redis Master PID 4108 under 52,000 active WebSocket broadcast load.'
      },
      {
        timestamp: '00:00.320',
        phase: 'DETECT',
        actor: 'Redis Sentinel Quorum',
        action: 'Subjective Down (sdown)',
        status: 'warning',
        detail: 'Sentinel node-1 marks master sdown after 300ms ping timeout.'
      },
      {
        timestamp: '00:00.750',
        phase: 'RAFT_QUORUM',
        actor: 'Redis Sentinel Quorum',
        action: 'Objective Down (odown)',
        status: 'critical',
        detail: '2 of 3 Sentinels agree master is unreachable; epoch incremented, election starts.'
      },
      {
        timestamp: '00:01.120',
        phase: 'PROMOTION',
        actor: 'Redis Sentinel-2',
        action: 'Promote Standby Node',
        status: 'mitigated',
        detail: 'Sent SLAVEOF NO ONE to replica-1; replica promoted to master with 0 offset delta.'
      },
      {
        timestamp: '00:01.350',
        phase: 'FAILOVER',
        actor: 'Spring Boot Lettuce Client',
        action: 'Sentinel Switch-Master Event',
        status: 'mitigated',
        detail: 'Lettuce connection pool received +switch-master event; reconnected in 82ms.'
      },
      {
        timestamp: '00:01.480',
        phase: 'DRAIN',
        actor: 'Caffeine L1 Ring Buffer',
        action: 'Flush Ephemeral Frames',
        status: 'resolved',
        detail: 'Broadcasted 280 buffered delta frames across Redis Pub/Sub channels.'
      },
      {
        timestamp: '00:01.850',
        phase: 'RECOVERED',
        actor: 'Mesh Health Monitor',
        action: 'Steady State Confirmed',
        status: 'nominal',
        detail: '52,000 Virtual Threads pumping frames normally; JVM heap stable at 380MB.'
      }
    ],
    runbookSnippet: {
      language: 'bash',
      command: `# Check sentinel master failover status
redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster

# Monitor active WebSocket virtual threads and heap usage
jcmd $(pgrep java) Thread.dump_to_file -format=json /tmp/threads.json`,
      description: 'Query Redis Sentinel cluster state and verify Virtual Thread carrier thread pinning status.'
    }
  },
  {
    id: 'banking-rail-timeout-idempotency',
    systemId: 'payment-gateway',
    title: 'Banking Rail 504 Gateway Timeout & Double-Swipe Race',
    systemName: 'FinTech High-Assurance Payment Gateway',
    category: 'Financial Correctness & Idempotency',
    failureType: 'Upstream Core Banking 15s Hang Followed by HTTP 504 with Client Double-Click',
    injectedFault: 'Proxy delays bank payment ACK for 15,000ms then returns HTTP 504 while client submits rapid duplicate payment.',
    steadyStateInvariants: [
      'Zero duplicate charges ($0.00 overdraft / double-spend)',
      'Exactly one immutable double-entry ledger record booked',
      'Redis Redlock lease blocks secondary concurrent execution with 409 Conflict',
      'Automated reconciliation query verifies upstream rail status before charge voiding'
    ],
    sreHypothesis: 'Redis Redlock acquires 30s atomic lease on idempotency key; secondary duplicate request rejected in <4ms; outbox reconciler polls banking rail status to verify non-execution before releasing customer hold.',
    governingAdr: 'ADR-001 & ADR-005',
    rpoMetric: '0.0s (Audit Trail Complete)',
    rtoMetric: '4ms (Instant Race Rejection)',
    impactMetrics: {
      rpo: '0.0s (Cryptographic Ledger Intact)',
      rto: '4.2ms (Concurrent Lock Reject)',
      availabilitySla: '99.999%',
      divergenceRate: '0.00% ($0.00 Double Spend)',
      maxLatencySpike: '4.2ms (Secondary Request Rejected)'
    },
    executionTrace: [
      {
        timestamp: '00:00.000',
        phase: 'INJECT',
        actor: 'Client Payment Request',
        action: 'Submit $250.00 Authorization',
        status: 'nominal',
        detail: 'Client initiates payment with Idempotency-Key: idemp_99bf21a7c4.'
      },
      {
        timestamp: '00:00.004',
        phase: 'DETECT',
        actor: 'Redis Redlock Lease',
        action: 'Acquire Distributed Lock',
        status: 'nominal',
        detail: 'SET idemp_99bf21a7c4 NX EX 30 succeeded; lock acquired for primary thread.'
      },
      {
        timestamp: '00:00.120',
        phase: 'INJECT',
        actor: 'Impatient User Double-Click',
        action: 'Submit Duplicate Payment',
        status: 'warning',
        detail: 'Browser submits identical payment payload with matching idempotency key.'
      },
      {
        timestamp: '00:00.124',
        phase: 'CIRCUIT_BREAK',
        actor: 'Idempotency Enforcement Filter',
        action: 'Reject Duplicate Request',
        status: 'mitigated',
        detail: 'Returned HTTP 409 Conflict (TRANSACTION_IN_FLIGHT); second charge stopped.'
      },
      {
        timestamp: '00:15.000',
        phase: 'DETECT',
        actor: 'Chaos Proxy Egress',
        action: 'HTTP 504 Gateway Timeout',
        status: 'critical',
        detail: 'Upstream banking rail hung for 15s then terminated with HTTP 504 Gateway Timeout.'
      },
      {
        timestamp: '00:15.045',
        phase: 'ISOLATE',
        actor: 'Outbox Status Reconciler',
        action: 'Inquire Rail Transaction Status',
        status: 'warning',
        detail: 'Queried bank status API using external reference ref_b88a91.'
      },
      {
        timestamp: '00:15.180',
        phase: 'DRAIN',
        actor: 'Upstream Bank Status API',
        action: 'Confirm Transaction NOT_POSTED',
        status: 'mitigated',
        detail: 'Bank confirmed zero ledger entry posted on their core ledger.'
      },
      {
        timestamp: '00:15.220',
        phase: 'RECOVERED',
        actor: 'Double-Entry Vault',
        action: 'Safe Void & Release Hold',
        status: 'nominal',
        detail: 'Customer hold released cleanly; zero double-debit verified in cryptographic audit trail.'
      }
    ],
    runbookSnippet: {
      language: 'bash',
      command: `# Verify idempotency key lease state in Redis
redis-cli GET idemp_99bf21a7c4

# Query double-entry ledger balance integrity
psql -h ledger-db.internal -U vault_readonly -c \\
  "SELECT account_id, SUM(credit) - SUM(debit) as balance FROM ledger_entries WHERE reference_id = 'ref_b88a91' GROUP BY account_id;"`,
      description: 'Audit Redis idempotency lease state and verify cryptographic balance invariants on double-entry ledger.'
    }
  },
  {
    id: 'mcp-sandbox-oom-sigkill',
    systemId: 'agentic-mcp-mesh',
    title: 'Downstream MCP Tool Server OOM & Sandboxed SIGKILL',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    category: 'AI Tool Sandboxing & Process Isolation',
    failureType: 'Rogue MCP Tool Unbounded Memory Leak & Host Resource Starvation',
    injectedFault: 'MCP tool heap_bomb triggers infinite recursion attempting to buffer 100M tokens into RAM.',
    steadyStateInvariants: [
      'Disposable container strictly terminated at 512MB via Linux cgroups v2',
      'Host agent orchestrator process memory stays under 180MB (Zero container breakout)',
      'LangGraph ReAct DAG state machine catches exit code 137 in <2ms and self-heals',
      'Agent autonomously switches to alternative reasoning tool without user prompt crash'
    ],
    sreHypothesis: 'Linux cgroups v2 memory controller sends SIGKILL (exit code 137) in <2ms; Java 21 MCP Gateway catches broken stdio pipe; returns structured ToolExecutionError to LangGraph ReAct DAG for fallback reasoning.',
    governingAdr: 'ADR-006',
    rpoMetric: '0.0s (DAG State Intact)',
    rtoMetric: '<2ms (Kernel SIGKILL)',
    impactMetrics: {
      rpo: '0.0s (Redis Raft Checkpointed)',
      rto: '1.8ms (Kernel cgroups SIGKILL)',
      availabilitySla: '99.99%',
      divergenceRate: '0.00% (Zero Breakout)',
      maxLatencySpike: '18.4ms (Sandbox Container Respawn)'
    },
    executionTrace: [
      {
        timestamp: '00:00.000',
        phase: 'INJECT',
        actor: 'ReAct Agent Tool Call',
        action: 'Execute heap_bomb Tool',
        status: 'critical',
        detail: 'Rogue MCP tool code begins unbounded byte array allocation in infinite loop.'
      },
      {
        timestamp: '00:00.001',
        phase: 'DETECT',
        actor: 'Linux cgroups v2 Controller',
        action: 'Hit memory.max Ceiling',
        status: 'critical',
        detail: 'Container memory exceeded strict 512MB limit: 512.4 MB / 512.0 MB.'
      },
      {
        timestamp: '00:00.002',
        phase: 'ISOLATE',
        actor: 'Linux Kernel OOM Killer',
        action: 'Send SIGKILL (Exit 137)',
        status: 'mitigated',
        detail: 'Immediate SIGKILL dispatched to child PID 7201; container sandboxed by gVisor.'
      },
      {
        timestamp: '00:00.004',
        phase: 'CATCH',
        actor: 'Java 21 MCP Gateway Client',
        action: 'Catch Broken stdio Pipe',
        status: 'mitigated',
        detail: 'Caught EOF on process stdout; parsed exit code 137 (OOM_KILLED).'
      },
      {
        timestamp: '00:00.007',
        phase: 'FALLBACK',
        actor: 'LangGraph ReAct State Machine',
        action: 'Inject Tool Failure Observation',
        status: 'mitigated',
        detail: 'Appended ToolExecutionError (exit 137: 512MB ceiling) into conversation memory.'
      },
      {
        timestamp: '00:00.012',
        phase: 'RECOVERED',
        actor: 'Agent Reasoning Engine',
        action: 'Autonomous Reasoning Pivot',
        status: 'nominal',
        detail: 'Agent evaluated error, selected fallback streaming summarizer tool, and completed task.'
      },
      {
        timestamp: '00:00.018',
        phase: 'DRAIN',
        actor: 'Docker Container Daemon',
        action: 'Prune & Warm Standby Spawn',
        status: 'nominal',
        detail: 'Destroyed tainted container in 4ms; spawned fresh warm sandbox replica in 14ms.'
      }
    ],
    runbookSnippet: {
      language: 'bash',
      command: `# Inspect cgroups v2 memory limits on MCP tool container
docker inspect mcp-worker-sandbox-01 \\
  --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}'

# Verify host isolation and zero memory bleed
cat /sys/fs/cgroup/docker/$(docker ps -q --filter name=mcp-worker)/memory.events`,
      description: 'Verify strict 512MB cgroups v2 memory limits and inspect kernel OOM event counters on MCP tool workers.'
    }
  }
]
