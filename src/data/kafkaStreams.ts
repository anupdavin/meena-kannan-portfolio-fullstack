export interface KafkaPartition {
  partitionId: number
  leaderBroker: string
  replicas: string[]
  isr: string[]
  highWatermark: number
  logEndOffset: number
  consumerOffset: number
  lag: number
  inSync: boolean
}

export interface KafkaConsumerGroup {
  groupId: string
  protocol: 'range' | 'roundrobin' | 'sticky' | 'cooperative-sticky'
  state: 'Stable' | 'Rebalancing' | 'CompletingRebalance' | 'Dead'
  membersCount: number
  totalLag: number
  assignedPartitions: number[]
}

export interface KafkaTopicStream {
  topicId: string
  systemId: string
  systemName: string
  title: string
  category: string
  partitionsCount: number
  replicationFactor: number
  cleanupPolicy: 'delete' | 'compact' | 'compact,delete'
  retentionHours: number
  compressionType: 'lz4' | 'zstd' | 'snappy' | 'gzip'
  targetThroughputTps: string
  p99PublishLatency: string
  governingAdr: string
  summary: string
  consumerGroups: KafkaConsumerGroup[]
  partitions: KafkaPartition[]
  sampleEventPayload: {
    key: string
    headers: Record<string, string>
    valueJson: string
  }
}

export const KAFKA_TOPIC_STREAMS: KafkaTopicStream[] = [
  {
    topicId: 'orders.v1.events',
    systemId: 'ecommerce-saga',
    systemName: 'High-Throughput E-Commerce Checkout Engine',
    title: 'Distributed Saga Order Lifecycle Event Stream',
    category: 'Choreographed Sagas & Transaction Outbox',
    partitionsCount: 8,
    replicationFactor: 3,
    cleanupPolicy: 'delete',
    retentionHours: 168,
    compressionType: 'zstd',
    targetThroughputTps: '15,000 TPS',
    p99PublishLatency: '1.8ms (acks=all)',
    governingAdr: 'ADR-001 & ADR-002',
    summary: 'High-volume order transition events produced via Debezium CDC from transactional PostgreSQL outbox tables, powering non-blocking inventory reservation and payment settlement.',
    consumerGroups: [
      {
        groupId: 'order-saga-payment-worker',
        protocol: 'cooperative-sticky',
        state: 'Stable',
        membersCount: 4,
        totalLag: 14,
        assignedPartitions: [0, 1, 2, 3, 4, 5, 6, 7]
      },
      {
        groupId: 'order-inventory-reserver',
        protocol: 'cooperative-sticky',
        state: 'Stable',
        membersCount: 4,
        totalLag: 2,
        assignedPartitions: [0, 1, 2, 3, 4, 5, 6, 7]
      }
    ],
    partitions: [
      { partitionId: 0, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 849204, logEndOffset: 849204, consumerOffset: 849202, lag: 2, inSync: true },
      { partitionId: 1, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 841109, logEndOffset: 841109, consumerOffset: 841108, lag: 1, inSync: true },
      { partitionId: 2, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 852991, logEndOffset: 852991, consumerOffset: 852988, lag: 3, inSync: true },
      { partitionId: 3, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 839442, logEndOffset: 839442, consumerOffset: 839440, lag: 2, inSync: true },
      { partitionId: 4, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 847120, logEndOffset: 847120, consumerOffset: 847118, lag: 2, inSync: true },
      { partitionId: 5, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 850311, logEndOffset: 850311, consumerOffset: 850309, lag: 2, inSync: true },
      { partitionId: 6, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 844882, logEndOffset: 844882, consumerOffset: 844881, lag: 1, inSync: true },
      { partitionId: 7, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 846755, logEndOffset: 846755, consumerOffset: 846754, lag: 1, inSync: true }
    ],
    sampleEventPayload: {
      key: 'ord_9901_usr_4412',
      headers: {
        'idempotency-key': '018f67e2-411a-7b33-90d2-99ca8210331f',
        'traceparent': '00-8a3c60f7d8b94e3fbbc21e37a1443b92-b7ad6b7169203331-01',
        'event-type': 'OrderCreatedEvent'
      },
      valueJson: '{"orderId":"ord_9901","tenantId":"tenant_01","amount":189.50,"currency":"USD","status":"PENDING_INVENTORY","itemsCount":3,"createdAt":"2026-10-27T13:40:00Z"}'
    }
  },
  {
    topicId: 'tenants.v1.audit',
    systemId: 'saas-platform',
    systemName: 'Cloud-Native Multi-Tenant SaaS Core',
    title: 'Tenant Security & Row-Level Authorization Audit Log',
    category: 'Multi-Tenant Security & Compliance',
    partitionsCount: 6,
    replicationFactor: 3,
    cleanupPolicy: 'compact,delete',
    retentionHours: 2160,
    compressionType: 'lz4',
    targetThroughputTps: '5,000 TPS',
    p99PublishLatency: '1.2ms (acks=all)',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Immutable audit trail capturing all tenant context switches, PostgreSQL RLS session parameter injections, and cross-organization access attempts for SOC2 compliance.',
    consumerGroups: [
      {
        groupId: 'saas-soc2-audit-indexer',
        protocol: 'cooperative-sticky',
        state: 'Stable',
        membersCount: 3,
        totalLag: 0,
        assignedPartitions: [0, 1, 2, 3, 4, 5]
      }
    ],
    partitions: [
      { partitionId: 0, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 412091, logEndOffset: 412091, consumerOffset: 412091, lag: 0, inSync: true },
      { partitionId: 1, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 408994, logEndOffset: 408994, consumerOffset: 408994, lag: 0, inSync: true },
      { partitionId: 2, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 415302, logEndOffset: 415302, consumerOffset: 415302, lag: 0, inSync: true },
      { partitionId: 3, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 411082, logEndOffset: 411082, consumerOffset: 411082, lag: 0, inSync: true },
      { partitionId: 4, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 409761, logEndOffset: 409761, consumerOffset: 409761, lag: 0, inSync: true },
      { partitionId: 5, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 413449, logEndOffset: 413449, consumerOffset: 413449, lag: 0, inSync: true }
    ],
    sampleEventPayload: {
      key: 'tenant_enterprise_01',
      headers: {
        'x-tenant-id': 'tenant_enterprise_01',
        'x-user-role': 'ROLE_ADMIN',
        'spiffe-id': 'spiffe://cluster.local/ns/prod/sa/saas-iam'
      },
      valueJson: '{"auditId":"aud_88912","tenantId":"tenant_enterprise_01","actor":"usr_102","action":"SET_RLS_CONTEXT","targetTable":"customers","result":"AUTHORIZED","ip":"198.51.100.42"}'
    }
  },
  {
    topicId: 'collab.v1.workspace-deltas',
    systemId: 'realtime-collab',
    systemName: 'Real-Time Task Collaboration Mesh',
    title: 'Real-Time Canvas & Document State Replication Log',
    category: 'High-Concurrency WebSocket Ingestion',
    partitionsCount: 12,
    replicationFactor: 3,
    cleanupPolicy: 'delete',
    retentionHours: 24,
    compressionType: 'lz4',
    targetThroughputTps: '50,000 frames/sec',
    p99PublishLatency: '0.8ms (in-memory buffer)',
    governingAdr: 'ADR-003 & ADR-004',
    summary: 'High-frequency operational transformation and cursor vectors partitioned by workspace UUID to guarantee sequential delivery across 50,000 concurrent Java 21 Virtual Threads.',
    consumerGroups: [
      {
        groupId: 'loom-redis-fanout-worker',
        protocol: 'cooperative-sticky',
        state: 'Stable',
        membersCount: 6,
        totalLag: 18,
        assignedPartitions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      }
    ],
    partitions: [
      { partitionId: 0, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 1249011, logEndOffset: 1249011, consumerOffset: 1249009, lag: 2, inSync: true },
      { partitionId: 1, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 1244892, logEndOffset: 1244892, consumerOffset: 1244891, lag: 1, inSync: true },
      { partitionId: 2, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 1251004, logEndOffset: 1251004, consumerOffset: 1251002, lag: 2, inSync: true },
      { partitionId: 3, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 1246771, logEndOffset: 1246771, consumerOffset: 1246770, lag: 1, inSync: true },
      { partitionId: 4, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 1248903, logEndOffset: 1248903, consumerOffset: 1248901, lag: 2, inSync: true },
      { partitionId: 5, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 1253440, logEndOffset: 1253440, consumerOffset: 1253438, lag: 2, inSync: true },
      { partitionId: 6, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 1247812, logEndOffset: 1247812, consumerOffset: 1247811, lag: 1, inSync: true },
      { partitionId: 7, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 1250109, logEndOffset: 1250109, consumerOffset: 1250107, lag: 2, inSync: true },
      { partitionId: 8, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 1249980, logEndOffset: 1249980, consumerOffset: 1249979, lag: 1, inSync: true },
      { partitionId: 9, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 1245620, logEndOffset: 1245620, consumerOffset: 1245619, lag: 1, inSync: true },
      { partitionId: 10, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 1252110, logEndOffset: 1252110, consumerOffset: 1252108, lag: 2, inSync: true },
      { partitionId: 11, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 1248002, logEndOffset: 1248002, consumerOffset: 1248001, lag: 1, inSync: true }
    ],
    sampleEventPayload: {
      key: 'workspace_901',
      headers: {
        'x-client-session': 'sess_ws_88019',
        'x-protocol': 'rfc6455-messagepack'
      },
      valueJson: '{"workspaceId":"workspace_901","cursor":{"userId":"usr_44","x":482.5,"y":190.2},"vectorClock":{"usr_44":142,"usr_12":88},"delta":"ins_char(\'A\', 14)"}'
    }
  },
  {
    topicId: 'payments.v1.settlement',
    systemId: 'payment-gateway',
    systemName: 'FinTech High-Assurance Payment Gateway',
    title: 'Cryptographic Double-Entry Ledger Event Stream',
    category: 'PCI-DSS Compliance & Financial Correctness',
    partitionsCount: 6,
    replicationFactor: 3,
    cleanupPolicy: 'compact',
    retentionHours: 87600,
    compressionType: 'zstd',
    targetThroughputTps: '3,000 TPS',
    p99PublishLatency: '2.4ms (synchronous fsync)',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'Append-only ledger journal stream recording all dual-entry debit and credit pairs with SHA-256 integrity hash verification and zero duplicate transaction idempotency.',
    consumerGroups: [
      {
        groupId: 'fintech-audit-reconciler',
        protocol: 'sticky',
        state: 'Stable',
        membersCount: 3,
        totalLag: 0,
        assignedPartitions: [0, 1, 2, 3, 4, 5]
      }
    ],
    partitions: [
      { partitionId: 0, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 91024, logEndOffset: 91024, consumerOffset: 91024, lag: 0, inSync: true },
      { partitionId: 1, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 89912, logEndOffset: 89912, consumerOffset: 89912, lag: 0, inSync: true },
      { partitionId: 2, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 92440, logEndOffset: 92440, consumerOffset: 92440, lag: 0, inSync: true },
      { partitionId: 3, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 90812, logEndOffset: 90812, consumerOffset: 90812, lag: 0, inSync: true },
      { partitionId: 4, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 88764, logEndOffset: 88764, consumerOffset: 88764, lag: 0, inSync: true },
      { partitionId: 5, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 91650, logEndOffset: 91650, consumerOffset: 91650, lag: 0, inSync: true }
    ],
    sampleEventPayload: {
      key: 'tx_ledger_98412',
      headers: {
        'idempotency-key': 'idemp_99bf21a7c4',
        'pci-kms-token': 'token_pan_4111_01a',
        'sha256-hash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      valueJson: '{"entryId":"ledg_tx_89104","chargeId":"ch_98412","debitAccount":"act_cust_99","creditAccount":"act_merch_01","amount":45000,"currency":"USD","balanceDelta":0}'
    }
  },
  {
    topicId: 'agent.v1.mcp-telemetry',
    systemId: 'agentic-mcp-mesh',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    title: 'Model Context Protocol (MCP) Tool Execution Bus',
    category: 'Agentic AI & Disposable Container Orchestration',
    partitionsCount: 8,
    replicationFactor: 3,
    cleanupPolicy: 'delete',
    retentionHours: 48,
    compressionType: 'lz4',
    targetThroughputTps: '10,000 tool calls/sec',
    p99PublishLatency: '0.9ms (async stream)',
    governingAdr: 'ADR-006',
    summary: 'Streaming JSON-RPC 2.0 tool execution logs and telemetry emitted by gVisor container workers into Kafka to record token expenditures and ReAct DAG state transitions.',
    consumerGroups: [
      {
        groupId: 'mcp-token-spend-circuit-breaker',
        protocol: 'cooperative-sticky',
        state: 'Stable',
        membersCount: 4,
        totalLag: 4,
        assignedPartitions: [0, 1, 2, 3, 4, 5, 6, 7]
      }
    ],
    partitions: [
      { partitionId: 0, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 614002, logEndOffset: 614002, consumerOffset: 614001, lag: 1, inSync: true },
      { partitionId: 1, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 609812, logEndOffset: 609812, consumerOffset: 609811, lag: 1, inSync: true },
      { partitionId: 2, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 618991, logEndOffset: 618991, consumerOffset: 618990, lag: 1, inSync: true },
      { partitionId: 3, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 612440, logEndOffset: 612440, consumerOffset: 612440, lag: 0, inSync: true },
      { partitionId: 4, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 611200, logEndOffset: 611200, consumerOffset: 611199, lag: 1, inSync: true },
      { partitionId: 5, leaderBroker: 'broker-103.us-east-1c', replicas: ['broker-103', 'broker-101', 'broker-102'], isr: ['broker-103', 'broker-101', 'broker-102'], highWatermark: 616781, logEndOffset: 616781, consumerOffset: 616781, lag: 0, inSync: true },
      { partitionId: 6, leaderBroker: 'broker-101.us-east-1a', replicas: ['broker-101', 'broker-102', 'broker-103'], isr: ['broker-101', 'broker-102', 'broker-103'], highWatermark: 613304, logEndOffset: 613304, consumerOffset: 613304, lag: 0, inSync: true },
      { partitionId: 7, leaderBroker: 'broker-102.us-east-1b', replicas: ['broker-102', 'broker-103', 'broker-101'], isr: ['broker-102', 'broker-103', 'broker-101'], highWatermark: 615012, logEndOffset: 615012, consumerOffset: 615012, lag: 0, inSync: true }
    ],
    sampleEventPayload: {
      key: 'sess_langgraph_9981',
      headers: {
        'jsonrpc-version': '2.0',
        'tool-sandbox': 'gvisor-cgroups-512mb',
        'mcp-action': 'tools/call'
      },
      valueJson: '{"tool":"query_pgvector","sessionId":"sess_langgraph_9981","tokenSpend":240,"sandboxDurationMs":4.6,"exitCode":0,"matchedDocuments":5}'
    }
  }
]
