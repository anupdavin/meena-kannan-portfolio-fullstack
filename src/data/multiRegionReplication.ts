export interface RegionNode {
  id: string
  name: string
  location: string
  role: 'primary' | 'replica' | 'peer' | 'coordinator'
  pingMs: number
  replicationLagMs: number
  activeConnections: number
}

export interface MultiRegionReplicationStrategy {
  id: string
  name: string
  strategyName: string
  subtitle: string
  topology: string
  consensusModel: string
  rpoTarget: string
  rtoTarget: string
  conflictResolution: string
  consistencyLevel: string
  governingAdr: string
  summary: string
  regions: RegionNode[]
  conflictScenario: {
    title: string
    writeA: { region: string, client: string, payload: string, timestampMs: number }
    writeB: { region: string, client: string, payload: string, timestampMs: number }
    resolutionRule: string
    resolvedOutcome: string
    convergenceProof: string
  }
  pros: string[]
  cons: string[]
  productionUseCase: {
    system: string
    entity: string
    workload: string
    justification: string
  }
}

export const MULTI_REGION_STRATEGIES: MultiRegionReplicationStrategy[] = [
  {
    id: 'aurora-global',
    name: 'Active-Passive Global Database',
    strategyName: 'Physical Storage Layer Replication',
    subtitle: 'Amazon Aurora Global Database',
    topology: 'Single Primary Region with Cross-Region Storage Replicas',
    consensusModel: 'Physical Storage Quorum (4/6 Storage Nodes per Region)',
    rpoTarget: '< 1 second (typical < 100ms lag)',
    rtoTarget: '< 1 minute managed failover',
    conflictResolution: 'Zero-Conflict Invariant (all writes route strictly to primary writer)',
    consistencyLevel: 'Read-After-Write in Primary, Eventual in Secondary (<100ms)',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Dedicated AWS physical storage replication bypasses PostgreSQL compute engine, streaming redo log records directly across WAN links to up to 5 secondary regions with negligible performance impact on primary write transaction throughput.',
    regions: [
      { id: 'us-east-1', name: 'N. Virginia (us-east-1)', location: 'North America', role: 'primary', pingMs: 1, replicationLagMs: 0, activeConnections: 450 },
      { id: 'eu-west-1', name: 'Ireland (eu-west-1)', location: 'Europe', role: 'replica', pingMs: 72, replicationLagMs: 84, activeConnections: 280 },
      { id: 'ap-southeast-1', name: 'Singapore (ap-southeast-1)', location: 'Asia Pacific', role: 'replica', pingMs: 185, replicationLagMs: 142, activeConnections: 190 }
    ],
    conflictScenario: {
      title: 'Cross-Region Write Forwarding vs Replica Lag',
      writeA: {
        region: 'us-east-1',
        client: 'tenant_admin_usr_01',
        payload: 'UPDATE tenants SET tier = "ENTERPRISE", max_seats = 500',
        timestampMs: 1729000000100
      },
      writeB: {
        region: 'eu-west-1',
        client: 'tenant_admin_usr_02',
        payload: 'UPDATE tenants SET tier = "PRO", max_seats = 100',
        timestampMs: 1729000000180
      },
      resolutionRule: 'Strict Serialization at Single Primary Writer (us-east-1)',
      resolvedOutcome: 'Write B forwarded via Envoy mTLS tunnel to us-east-1; serialized second, overwriting Write A deterministically with ACID guarantee.',
      convergenceProof: 'Global storage redo stream forces identical byte-for-byte physical block sequence on all secondary storage nodes.'
    },
    pros: [
      'Zero application-level conflict resolution code required',
      'Storage-level replication has near-zero overhead on writer CPU',
      'Fast managed failover promotes replica to primary in under 60 seconds'
    ],
    cons: [
      'Write latency from distant regions bound by cross-ocean speed of light',
      'Secondary regions can only serve read queries'
    ],
    productionUseCase: {
      system: 'Cloud-Native Multi-Tenant SaaS Core',
      entity: 'PostgreSQL Multi-Tenant RLS Database',
      workload: '500,000 tenants, 90% read / 10% write query profile',
      justification: 'Guarantees strict tenant financial isolation without multi-master write divergence risks.'
    }
  },
  {
    id: 'dynamodb-global',
    name: 'Active-Active Multi-Master',
    strategyName: 'Last-Write-Wins (LWW) Timestamp Reconciliation',
    subtitle: 'Amazon DynamoDB Global Tables',
    topology: 'Fully Multi-Master Active-Active Mesh',
    consensusModel: 'Paxos within Region + Async Cross-Region Replication',
    rpoTarget: '< 1.5 seconds typical propagation',
    rtoTarget: '0 seconds (instant local region write availability)',
    conflictResolution: 'Last-Write-Wins (LWW) reconciled via microsecond epoch timestamps',
    consistencyLevel: 'Local Region Strong Consistency, Cross-Region Eventual',
    governingAdr: 'ADR-001 & ADR-003',
    summary: 'Enables concurrent local write operations in every participating AWS region with automated bidirectional change propagation via DynamoDB Streams. Eliminates cross-region write network latency at the expense of eventual reconciliation semantics.',
    regions: [
      { id: 'us-east-1', name: 'N. Virginia (us-east-1)', location: 'North America', role: 'peer', pingMs: 1, replicationLagMs: 220, activeConnections: 1200 },
      { id: 'eu-central-1', name: 'Frankfurt (eu-central-1)', location: 'Europe', role: 'peer', pingMs: 85, replicationLagMs: 310, activeConnections: 950 },
      { id: 'ap-northeast-1', name: 'Tokyo (ap-northeast-1)', location: 'Asia Pacific', role: 'peer', pingMs: 160, replicationLagMs: 420, activeConnections: 820 }
    ],
    conflictScenario: {
      title: 'Concurrent Regional Price Updates on Same SKU',
      writeA: {
        region: 'us-east-1',
        client: 'catalog_sync_us',
        payload: 'SET price = 89.99, updated_by = "us_cron"',
        timestampMs: 1729000000450
      },
      writeB: {
        region: 'eu-central-1',
        client: 'catalog_sync_eu',
        payload: 'SET price = 94.50, updated_by = "eu_manual"',
        timestampMs: 1729000000465
      },
      resolutionRule: 'Last-Write-Wins (LWW) Epoch Timestamp Arbitrator',
      resolvedOutcome: 'Write B timestamp (1729000000465) > Write A (1729000000450); Write B wins globally across all regions within 350ms.',
      convergenceProof: 'DynamoDB replication engine compares metadata timestamp attributes; all regions converge on Write B payload.'
    },
    pros: [
      'Sub-10ms local write latency worldwide',
      'Zero downtime if an entire cloud region experiences an outage',
      'No complex master election protocols needed'
    ],
    cons: [
      'Last-Write-Wins can silently discard earlier concurrent field updates',
      'Requires idempotent payload design or CRDT structures for numeric fields'
    ],
    productionUseCase: {
      system: 'High-Throughput E-Commerce Checkout Engine',
      entity: 'Global User Shopping Cart & Session Store',
      workload: '50,000 checkout handshakes/sec across US, EU, and APAC',
      justification: 'Zero-latency cart modifications when shoppers travel between international locations.'
    }
  },
  {
    id: 'crdt-mesh',
    name: 'Conflict-Free Replicated Data Types',
    strategyName: 'State-Based CRDT (PN-Counters & LWW-Element-Set)',
    subtitle: 'Decentralized Peer-to-Peer Convergence',
    topology: 'Decoupled Asynchronous State-Replicating Mesh',
    consensusModel: 'Mathematical Lattice Join (Semi-Lattice Monotonicity)',
    rpoTarget: '0 data loss (all operations commutatively preserved)',
    rtoTarget: '0 seconds (continuous offline write capability)',
    conflictResolution: 'Associative, Commutative, and Idempotent (ACI) Merge Function',
    consistencyLevel: 'Strong Eventual Consistency (SEC)',
    governingAdr: 'ADR-003 & ADR-006',
    summary: 'Eliminates conflict arbitration algorithms entirely by structuring data state into mathematically proven semi-lattices where concurrent updates commute. Replicas merge state payloads in any arrival order and always produce mathematically identical results.',
    regions: [
      { id: 'node-us-west', name: 'US West Cluster', location: 'Oregon', role: 'peer', pingMs: 12, replicationLagMs: 45, activeConnections: 600 },
      { id: 'node-eu-north', name: 'EU North Cluster', location: 'Stockholm', role: 'peer', pingMs: 95, replicationLagMs: 80, activeConnections: 540 },
      { id: 'node-ap-south', name: 'AP South Cluster', location: 'Mumbai', role: 'peer', pingMs: 140, replicationLagMs: 110, activeConnections: 480 }
    ],
    conflictScenario: {
      title: 'Concurrent Document Cursor & Character Insertions',
      writeA: {
        region: 'node-us-west',
        client: 'collab_user_alice',
        payload: 'PN_COUNTER_INC(+5), LWW_SET_ADD("tag:architect", t=102)',
        timestampMs: 1729000000200
      },
      writeB: {
        region: 'node-eu-north',
        client: 'collab_user_bob',
        payload: 'PN_COUNTER_INC(+3), LWW_SET_ADD("tag:cloud", t=104)',
        timestampMs: 1729000000210
      },
      resolutionRule: 'Commutative Lattice Join Function: merge(A, B) = A join B',
      resolvedOutcome: 'Counters sum to +8; Set contains both "tag:architect" and "tag:cloud" without any coordination or locking.',
      convergenceProof: 'Monotonic join operator guarantees A join B == B join A regardless of packet arrival order or WAN retries.'
    },
    pros: [
      'Mathematically impossible for replica states to permanently diverge',
      'Full offline capability: nodes can disconnect, write, and re-merge later',
      'No central master coordinator or Raft leader bottleneck'
    ],
    cons: [
      'Increased wire payload overhead due to tombstones and vector clocks',
      'Data model must be constrained to CRDT primitives (counters, sets, maps)'
    ],
    productionUseCase: {
      system: 'Real-Time Task Collaboration Mesh',
      entity: 'Shared Workspace Canvas & Document Vector Clocks',
      workload: '50,000 concurrent Java 21 Virtual Threads pushing cursor deltas',
      justification: 'Guarantees zero lost edits during transient transatlantic fiber cuts.'
    }
  },
  {
    id: 'raft-consensus',
    name: 'Distributed Raft Consensus',
    strategyName: 'Synchronous Multi-Region Quorum (Spanner / CockroachDB)',
    subtitle: 'Strict Serializability & TrueTime / HLC',
    topology: 'Synchronous Consensus Quorum across 3 or 5 Regions',
    consensusModel: 'Raft Multi-Paxos with Range Leases & Hybrid Logical Clocks',
    rpoTarget: '0 seconds (RPO = 0, zero committed data loss)',
    rtoTarget: '< 3 seconds (automated Raft leader re-election)',
    conflictResolution: 'Pessimistic Quorum Locking & Serialized Raft Log Sequence',
    consistencyLevel: 'Strict Serializability (External Consistency)',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'Distributes transactional ranges across geographic regions. Writes require synchronous acknowledgment from a majority quorum of Raft replicas before returning success to the client, guaranteeing zero stale reads and zero multi-master split-brain divergence.',
    regions: [
      { id: 'us-east-1', name: 'N. Virginia (us-east-1)', location: 'North America', role: 'coordinator', pingMs: 1, replicationLagMs: 0, activeConnections: 800 },
      { id: 'us-west-2', name: 'Oregon (us-west-2)', location: 'North America', role: 'peer', pingMs: 58, replicationLagMs: 62, activeConnections: 650 },
      { id: 'eu-west-1', name: 'Ireland (eu-west-1)', location: 'Europe', role: 'peer', pingMs: 74, replicationLagMs: 78, activeConnections: 620 }
    ],
    conflictScenario: {
      title: 'Double-Spend Account Transfer Race across Atlantic',
      writeA: {
        region: 'us-east-1',
        client: 'pos_terminal_nyc',
        payload: 'TX_DEBIT(acc_441, $1,000) WHERE balance >= $1,000',
        timestampMs: 1729000000100
      },
      writeB: {
        region: 'eu-west-1',
        client: 'pos_terminal_london',
        payload: 'TX_DEBIT(acc_441, $1,000) WHERE balance >= $1,000',
        timestampMs: 1729000000102
      },
      resolutionRule: 'Raft Range Lease Serialization with Hybrid Logical Clock (HLC)',
      resolvedOutcome: 'Write A acquires Raft range lease in us-east-1; Write B receives TransactionRetryWithWaitException and aborts safely.',
      convergenceProof: 'Raft quorum requires 2 of 3 replicas to replicate log entry before commit, preventing dual-commit double spends.'
    },
    pros: [
      'Gold standard ACID compliance with strict serializability',
      'Zero data loss (RPO = 0) even under sudden regional data center loss',
      'Eliminates read-your-own-writes inconsistencies'
    ],
    cons: [
      'Write latency bounded by cross-region round-trip time (50-80ms p99)',
      'Requires minimum 3 regions to sustain 1 region outage'
    ],
    productionUseCase: {
      system: 'FinTech High-Assurance Payment Gateway',
      entity: 'Cryptographic Double-Entry Ledger & Balance Table',
      workload: '3,000 ledger debit/credit postings per second',
      justification: 'Strict regulatory mandate prohibiting duplicate currency generation or stale balances.'
    }
  },
  {
    id: 'kafka-mirrormaker',
    name: 'Asynchronous Eventual CDC Fabric',
    strategyName: 'Debezium CDC + Kafka MirrorMaker 2 Active-Active',
    subtitle: 'Event-Driven Cross-Datacenter Replication',
    topology: 'Bidirectional Cluster-to-Cluster Topic Mirroring',
    consensusModel: 'Partition Offset Tracking & Idempotency Key Dedup',
    rpoTarget: '< 2 seconds WAN transit time',
    rtoTarget: 'Independent Regional Cluster Survivability',
    conflictResolution: 'UUIDv7 Deduplication & Outbox Event Sourcing Log',
    consistencyLevel: 'Eventual Consistency (sub-second event stream)',
    governingAdr: 'ADR-002 & ADR-006',
    summary: 'Transactional Outbox pattern captured by Debezium CDC and streamed via Kafka MirrorMaker 2 across regional Kafka clusters with header-based loop detection, consumer offset translation, and exactly-once transactional sinks.',
    regions: [
      { id: 'dc-us-east', name: 'US East Kafka Cluster', location: 'N. Virginia', role: 'peer', pingMs: 1, replicationLagMs: 180, activeConnections: 1500 },
      { id: 'dc-eu-west', name: 'EU West Kafka Cluster', location: 'Frankfurt', role: 'peer', pingMs: 82, replicationLagMs: 240, activeConnections: 1100 },
      { id: 'dc-ap-east', name: 'APAC Kafka Cluster', location: 'Singapore', role: 'peer', pingMs: 190, replicationLagMs: 380, activeConnections: 900 }
    ],
    conflictScenario: {
      title: 'Bidirectional Event Re-Mirroring Loop Prevention',
      writeA: {
        region: 'dc-us-east',
        client: 'agent_mcp_orchestrator',
        payload: 'EMIT AgentStateTransition(task="rag_ingest", state="COMPLETED")',
        timestampMs: 1729000000300
      },
      writeB: {
        region: 'dc-eu-west',
        client: 'mirrormaker_worker',
        payload: 'RE-MIRROR Event into dc-eu-west.agent.events',
        timestampMs: 1729000000490
      },
      resolutionRule: 'Kafka Record Header Origin Tagger & MirrorMaker 2 Loop Filter',
      resolvedOutcome: 'Record tagged with header origin-cluster=dc-us-east; MM2 in dc-eu-west skips re-exporting back to US, preventing cycles.',
      convergenceProof: 'Topological partition hashes and UUIDv7 idempotency keys guarantee exactly-once consumption downstream.'
    },
    pros: [
      'Total decoupling of regional service runtimes: zero synchronous dependencies',
      'High throughput: handles 100,000+ messages/sec per broker cluster',
      'Immune to WAN partition outages: events buffer safely on local disks'
    ],
    cons: [
      'Eventual consistency requires downstream consumers to be idempotent',
      'Offset translation between clusters requires active consumer checkpointing'
    ],
    productionUseCase: {
      system: 'Autonomous Agentic Orchestrator & MCP Mesh',
      entity: 'Agentic DAG Execution Bus & Disposable Tool Telemetry',
      workload: '10,000 tool execution events/sec across US and Europe',
      justification: 'Decoupled agent container workers emit telemetry locally without blocking on overseas networks.'
    }
  }
]
