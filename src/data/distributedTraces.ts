export interface SpanRecord {
  spanId: string
  parentSpanId: string | null
  serviceName: string
  operationName: string
  startTimeMs: number
  durationMs: number
  isCriticalPath: boolean
  category: 'gateway' | 'security' | 'database' | 'messaging' | 'cache' | 'compute'
  tags: Record<string, string>
}

export interface DistributedTrace {
  traceId: string
  title: string
  systemName: string
  category: string
  totalDurationMs: number
  rootEndpoint: string
  criticalBottleneck: string
  governingAdr: string
  summary: string
  spans: SpanRecord[]
}

export const DISTRIBUTED_TRACES: DistributedTrace[] = [
  {
    traceId: 'trace_saas_auth_01',
    title: 'Multi-Tenant IAM Authentication & RLS Session Initialization',
    systemName: 'Cloud-Native Multi-Tenant SaaS Core',
    category: 'Security & Database Isolation',
    totalDurationMs: 24.5,
    rootEndpoint: 'POST /v1/auth/tenants',
    criticalBottleneck: 'postgresql.query_tenant_rls (6.4ms, 26.1% of trace)',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'End-to-end W3C trace context illustrating edge mTLS verification, RS256 JWT decoding, and PostgreSQL Row-Level Security tenant filter injection.',
    spans: [
      {
        spanId: 'span_root_01',
        parentSpanId: null,
        serviceName: 'envoy-ingress-gateway',
        operationName: 'POST /v1/auth/tenants',
        startTimeMs: 0.0,
        durationMs: 24.5,
        isCriticalPath: true,
        category: 'gateway',
        tags: {
          'http.method': 'POST',
          'http.status_code': '200',
          'net.peer.ip': '198.51.100.42',
          'span.kind': 'SERVER'
        }
      },
      {
        spanId: 'span_mtls_02',
        parentSpanId: 'span_root_01',
        serviceName: 'envoy-ingress-gateway',
        operationName: 'spiffe.mtls_handshake_verify',
        startTimeMs: 0.2,
        durationMs: 1.2,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'tls.version': 'TLSv1.3',
          'spiffe.id': 'spiffe://cluster.local/ns/prod/sa/ingress'
        }
      },
      {
        spanId: 'span_waf_03',
        parentSpanId: 'span_root_01',
        serviceName: 'envoy-ingress-gateway',
        operationName: 'waf.owasp_crs_inspect',
        startTimeMs: 1.5,
        durationMs: 1.8,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'waf.action': 'ALLOW',
          'waf.rules_evaluated': '42'
        }
      },
      {
        spanId: 'span_jwt_04',
        parentSpanId: 'span_root_01',
        serviceName: 'envoy-ingress-gateway',
        operationName: 'jwt.rs256_claims_extract',
        startTimeMs: 3.4,
        durationMs: 2.1,
        isCriticalPath: true,
        category: 'security',
        tags: {
          'jwt.algorithm': 'RS256',
          'tenant.id': 'tenant_enterprise_01'
        }
      },
      {
        spanId: 'span_rate_05',
        parentSpanId: 'span_root_01',
        serviceName: 'envoy-ingress-gateway',
        operationName: 'redis.token_bucket_acquire',
        startTimeMs: 5.6,
        durationMs: 0.9,
        isCriticalPath: false,
        category: 'cache',
        tags: {
          'ratelimit.remaining': '4982',
          'ratelimit.limit': '5000'
        }
      },
      {
        spanId: 'span_iam_06',
        parentSpanId: 'span_root_01',
        serviceName: 'saas-iam-service',
        operationName: 'iam.authenticate_and_resolve_org',
        startTimeMs: 6.8,
        durationMs: 17.2,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'rpc.service': 'saas-iam-service',
          'thread.virtual': 'true'
        }
      },
      {
        spanId: 'span_pg_07',
        parentSpanId: 'span_iam_06',
        serviceName: 'postgresql-primary',
        operationName: 'postgresql.query_tenant_rls',
        startTimeMs: 8.2,
        durationMs: 6.4,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'db.system': 'postgresql',
          'db.statement': 'SELECT * FROM tenants WHERE id = current_setting("app.current_tenant_id")',
          'db.rls_enforced': 'true'
        }
      },
      {
        spanId: 'span_cache_08',
        parentSpanId: 'span_iam_06',
        serviceName: 'redis-cluster',
        operationName: 'redis.write_session_token',
        startTimeMs: 15.1,
        durationMs: 1.1,
        isCriticalPath: false,
        category: 'cache',
        tags: {
          'redis.command': 'SETEX',
          'session.ttl': '86400s'
        }
      },
      {
        spanId: 'span_audit_09',
        parentSpanId: 'span_iam_06',
        serviceName: 'saas-iam-service',
        operationName: 'audit.emit_login_metric',
        startTimeMs: 16.5,
        durationMs: 1.6,
        isCriticalPath: false,
        category: 'messaging',
        tags: {
          'audit.action': 'TENANT_AUTHENTICATED'
        }
      }
    ]
  },
  {
    traceId: 'trace_saga_checkout_02',
    title: 'Distributed Checkout Order Reservation & Choreographed Saga',
    systemName: 'High-Throughput E-Commerce Checkout Engine',
    category: 'Event-Driven Sagas & Outbox CDC',
    totalDurationMs: 48.2,
    rootEndpoint: 'POST /v1/orders/checkout',
    criticalBottleneck: 'payment-service.authorize_charge (18.5ms, 38.3% of trace)',
    governingAdr: 'ADR-001 & ADR-002',
    summary: 'Choreographed Saga distributed trace capturing atomic outbox persistence, Debezium CDC WAL capture, Kafka event propagation, and non-blocking inventory reservation.',
    spans: [
      {
        spanId: 'span_saga_root',
        parentSpanId: null,
        serviceName: 'envoy-ingress-gateway',
        operationName: 'POST /v1/orders/checkout',
        startTimeMs: 0.0,
        durationMs: 48.2,
        isCriticalPath: true,
        category: 'gateway',
        tags: {
          'http.method': 'POST',
          'idempotency.key': '018f67e2-411a-7b33',
          'span.kind': 'SERVER'
        }
      },
      {
        spanId: 'span_redlock_01',
        parentSpanId: 'span_saga_root',
        serviceName: 'redis-cluster',
        operationName: 'redis.redlock_acquire_lease',
        startTimeMs: 0.4,
        durationMs: 2.4,
        isCriticalPath: false,
        category: 'cache',
        tags: {
          'lock.key': 'lock:order:018f67e2',
          'lock.ttl': '30s'
        }
      },
      {
        spanId: 'span_order_02',
        parentSpanId: 'span_saga_root',
        serviceName: 'order-saga-service',
        operationName: 'order.create_outbox_transaction',
        startTimeMs: 3.1,
        durationMs: 8.6,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'order.id': 'ord_9901',
          'order.amount': '$189.50'
        }
      },
      {
        spanId: 'span_outbox_03',
        parentSpanId: 'span_order_02',
        serviceName: 'postgresql-order-db',
        operationName: 'db.insert_order_and_outbox_event',
        startTimeMs: 4.2,
        durationMs: 6.2,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'db.statement': 'INSERT INTO orders ...; INSERT INTO outbox_events ...',
          'tx.isolation': 'READ_COMMITTED'
        }
      },
      {
        spanId: 'span_cdc_04',
        parentSpanId: 'span_saga_root',
        serviceName: 'debezium-cdc-connector',
        operationName: 'debezium.wal_tail_and_capture',
        startTimeMs: 11.2,
        durationMs: 3.1,
        isCriticalPath: false,
        category: 'messaging',
        tags: {
          'cdc.source': 'outbox_events',
          'cdc.lsn': '0/15E8B90'
        }
      },
      {
        spanId: 'span_kafka_05',
        parentSpanId: 'span_saga_root',
        serviceName: 'kafka-cluster',
        operationName: 'kafka.publish_order_created',
        startTimeMs: 14.5,
        durationMs: 1.8,
        isCriticalPath: true,
        category: 'messaging',
        tags: {
          'kafka.topic': 'orders.v1',
          'kafka.partition': '3',
          'messaging.system': 'kafka'
        }
      },
      {
        spanId: 'span_inventory_06',
        parentSpanId: 'span_saga_root',
        serviceName: 'inventory-service',
        operationName: 'inventory.reserve_stock',
        startTimeMs: 16.8,
        durationMs: 9.4,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'inventory.sku_count': '3',
          'saga.step': 'INVENTORY_RESERVED'
        }
      },
      {
        spanId: 'span_payment_07',
        parentSpanId: 'span_saga_root',
        serviceName: 'payment-service',
        operationName: 'payment-service.authorize_charge',
        startTimeMs: 26.5,
        durationMs: 18.5,
        isCriticalPath: true,
        category: 'security',
        tags: {
          'payment.amount': '$189.50',
          'rail.protocol': 'ISO-8583',
          'status': 'AUTHORIZED'
        }
      },
      {
        spanId: 'span_complete_08',
        parentSpanId: 'span_saga_root',
        serviceName: 'order-saga-service',
        operationName: 'kafka.publish_saga_completed',
        startTimeMs: 45.8,
        durationMs: 1.4,
        isCriticalPath: true,
        category: 'messaging',
        tags: {
          'saga.status': 'COMPLETED',
          'kafka.topic': 'orders.completed.v1'
        }
      }
    ]
  },
  {
    traceId: 'trace_collab_broadcast_03',
    title: 'Real-Time WebSocket State Fanout & Loom Virtual Thread Broadcast',
    systemName: 'Real-Time Task Collaboration Mesh',
    category: 'Virtual Threads & WebSocket Fanout',
    totalDurationMs: 9.8,
    rootEndpoint: 'WSS /v1/collab/ws',
    criticalBottleneck: 'virtual_thread.parallel_push_50k (4.2ms, 42.8% of trace)',
    governingAdr: 'ADR-003 & ADR-004',
    summary: 'Sub-10ms duplex WebSocket broadcast trace profiling RFC 6455 frame decoding, Redis Pub/Sub cluster fanout, and Java 21 carrier thread scheduling across 50,000 clients.',
    spans: [
      {
        spanId: 'span_ws_root',
        parentSpanId: null,
        serviceName: 'envoy-ws-proxy',
        operationName: 'WSS /v1/collab/ws.frame_in',
        startTimeMs: 0.0,
        durationMs: 9.8,
        isCriticalPath: true,
        category: 'gateway',
        tags: {
          'ws.opcode': 'TEXT_FRAME',
          'ws.connection_count': '52100'
        }
      },
      {
        spanId: 'span_decode_01',
        parentSpanId: 'span_ws_root',
        serviceName: 'envoy-ws-proxy',
        operationName: 'ws.frame_decode_and_mask',
        startTimeMs: 0.1,
        durationMs: 0.4,
        isCriticalPath: false,
        category: 'gateway',
        tags: {
          'ws.payload_bytes': '248'
        }
      },
      {
        spanId: 'span_loom_02',
        parentSpanId: 'span_ws_root',
        serviceName: 'collab-loom-cluster',
        operationName: 'loom.carrier_thread_dispatch',
        startTimeMs: 0.6,
        durationMs: 0.2,
        isCriticalPath: false,
        category: 'compute',
        tags: {
          'jvm.thread_model': 'VIRTUAL_THREADS',
          'carrier.pool_id': 'loom-carrier-3'
        }
      },
      {
        spanId: 'span_auth_03',
        parentSpanId: 'span_ws_root',
        serviceName: 'collab-loom-cluster',
        operationName: 'auth.validate_ws_ticket',
        startTimeMs: 0.9,
        durationMs: 1.1,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'auth.ticket_status': 'VALID',
          'workspace.id': 'ws_901'
        }
      },
      {
        spanId: 'span_pubsub_04',
        parentSpanId: 'span_ws_root',
        serviceName: 'redis-pubsub-cluster',
        operationName: 'redis.pubsub_fanout',
        startTimeMs: 2.1,
        durationMs: 2.8,
        isCriticalPath: true,
        category: 'cache',
        tags: {
          'redis.channel': 'collab:workspace_901',
          'redis.subscribers': '48'
        }
      },
      {
        spanId: 'span_push_05',
        parentSpanId: 'span_ws_root',
        serviceName: 'collab-loom-cluster',
        operationName: 'virtual_thread.parallel_push_50k',
        startTimeMs: 5.1,
        durationMs: 4.2,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'loom.threads_unparked': '48',
          'ring_buffer.bytes_drained': '11904',
          'socket.write_status': 'FLUSHED'
        }
      },
      {
        spanId: 'span_metric_06',
        parentSpanId: 'span_ws_root',
        serviceName: 'collab-loom-cluster',
        operationName: 'metrics.emit_broadcast_lag',
        startTimeMs: 9.4,
        durationMs: 0.3,
        isCriticalPath: false,
        category: 'messaging',
        tags: {
          'p99.latency_ms': '3.2'
        }
      }
    ]
  },
  {
    traceId: 'trace_fintech_settlement_04',
    title: 'FinTech PCI-DSS PAN Tokenization & Double-Entry Ledger Transfer',
    systemName: 'FinTech High-Assurance Payment Gateway',
    category: 'Financial Ledger & HSM Tokenization',
    totalDurationMs: 32.4,
    rootEndpoint: 'POST /v1/payments/charge',
    criticalBottleneck: 'vault.execute_double_entry_transfer (21.4ms, 66.0% of trace)',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'Hardware Security Module (HSM) mTLS trace demonstrating AWS KMS tokenization in 3.8ms followed by ACID serializable double-entry ledger credit and debit insertion.',
    spans: [
      {
        spanId: 'span_fintech_root',
        parentSpanId: null,
        serviceName: 'fintech-edge-gateway',
        operationName: 'POST /v1/payments/charge',
        startTimeMs: 0.0,
        durationMs: 32.4,
        isCriticalPath: true,
        category: 'gateway',
        tags: {
          'http.method': 'POST',
          'merchant.id': 'merch_88192a'
        }
      },
      {
        spanId: 'span_hsm_01',
        parentSpanId: 'span_fintech_root',
        serviceName: 'fintech-edge-gateway',
        operationName: 'hsm.mtls_handshake_crypto',
        startTimeMs: 0.2,
        durationMs: 2.1,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'crypto.keystore': 'HSM_FIPS_140_2_LEVEL_3'
        }
      },
      {
        spanId: 'span_kms_02',
        parentSpanId: 'span_fintech_root',
        serviceName: 'aws-kms-token-service',
        operationName: 'aws_kms.tokenize_pan_card',
        startTimeMs: 2.5,
        durationMs: 3.8,
        isCriticalPath: true,
        category: 'security',
        tags: {
          'kms.key_id': 'arn:aws:kms:us-east-1:123456789012:key/card-vault',
          'pci.status': 'TOKENIZED'
        }
      },
      {
        spanId: 'span_lock_03',
        parentSpanId: 'span_fintech_root',
        serviceName: 'redis-cluster',
        operationName: 'redis.redlock_acquire_lease',
        startTimeMs: 6.5,
        durationMs: 1.2,
        isCriticalPath: false,
        category: 'cache',
        tags: {
          'lock.key': 'lock:ledger:tx_89104',
          'lock.ttl': '30s'
        }
      },
      {
        spanId: 'span_ledger_04',
        parentSpanId: 'span_fintech_root',
        serviceName: 'fintech-ledger-vault',
        operationName: 'vault.execute_double_entry_transfer',
        startTimeMs: 8.0,
        durationMs: 21.4,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'tx.isolation': 'SERIALIZABLE',
          'ledger.amount': '$450.00'
        }
      },
      {
        spanId: 'span_debit_05',
        parentSpanId: 'span_ledger_04',
        serviceName: 'postgresql-vault-db',
        operationName: 'db.insert_debit_ledger_entry',
        startTimeMs: 9.2,
        durationMs: 4.6,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'account.type': 'SOURCE_DEBIT',
          'account.id': 'acc_user_441'
        }
      },
      {
        spanId: 'span_credit_06',
        parentSpanId: 'span_ledger_04',
        serviceName: 'postgresql-vault-db',
        operationName: 'db.insert_credit_ledger_entry',
        startTimeMs: 14.1,
        durationMs: 4.4,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'account.type': 'DESTINATION_CREDIT',
          'account.id': 'acc_merch_881'
        }
      },
      {
        spanId: 'span_hash_07',
        parentSpanId: 'span_ledger_04',
        serviceName: 'fintech-ledger-vault',
        operationName: 'crypto.generate_sha256_audit_hash',
        startTimeMs: 18.8,
        durationMs: 2.2,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'audit.hash_algo': 'SHA-256',
          'audit.hash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4'
        }
      },
      {
        spanId: 'span_commit_08',
        parentSpanId: 'span_ledger_04',
        serviceName: 'postgresql-vault-db',
        operationName: 'db.commit_tx',
        startTimeMs: 21.2,
        durationMs: 6.8,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'db.wal_flush': 'SYNC'
        }
      },
      {
        spanId: 'span_release_09',
        parentSpanId: 'span_fintech_root',
        serviceName: 'redis-cluster',
        operationName: 'redis.release_lease',
        startTimeMs: 29.8,
        durationMs: 0.8,
        isCriticalPath: false,
        category: 'cache',
        tags: {
          'lock.status': 'RELEASED'
        }
      }
    ]
  },
  {
    traceId: 'trace_agentic_mcp_05',
    title: 'Autonomous Agentic ReAct Reasoning DAG & Sandboxed MCP Tool Dispatch',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    category: 'AI Tool Sandboxing & Vector Retrieval',
    totalDurationMs: 64.2,
    rootEndpoint: 'POST /v1/agent/mcp-gateway',
    criticalBottleneck: 'pgvector.hnsw_similarity_search (31.2ms, 48.6% of trace)',
    governingAdr: 'ADR-006',
    summary: 'Distributed trace through LangGraph ReAct state machine, disposable gVisor Docker tool container dispatch, pgvector 1536d cosine similarity search, and Redis episodic memory update.',
    spans: [
      {
        spanId: 'span_mcp_root',
        parentSpanId: null,
        serviceName: 'agentic-mcp-gateway',
        operationName: 'POST /v1/agent/mcp-gateway',
        startTimeMs: 0.0,
        durationMs: 64.2,
        isCriticalPath: true,
        category: 'gateway',
        tags: {
          'rpc.system': 'jsonrpc_2.0',
          'mcp.method': 'tools/call'
        }
      },
      {
        spanId: 'span_validate_01',
        parentSpanId: 'span_mcp_root',
        serviceName: 'agentic-mcp-gateway',
        operationName: 'mcp_gateway.jsonrpc_validate',
        startTimeMs: 0.2,
        durationMs: 0.6,
        isCriticalPath: false,
        category: 'gateway',
        tags: {
          'mcp.tool_name': 'query_pgvector'
        }
      },
      {
        spanId: 'span_react_02',
        parentSpanId: 'span_mcp_root',
        serviceName: 'langgraph-orchestrator',
        operationName: 'langgraph.react_dag_step',
        startTimeMs: 1.0,
        durationMs: 8.2,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'dag.node': 'decide_tool_action',
          'model.name': 'DeepSeek-R1-Distill-Qwen-32B'
        }
      },
      {
        spanId: 'span_dispatch_03',
        parentSpanId: 'span_mcp_root',
        serviceName: 'mcp-tool-worker-pool',
        operationName: 'mcp_client.dispatch_tool_call',
        startTimeMs: 9.5,
        durationMs: 48.5,
        isCriticalPath: true,
        category: 'compute',
        tags: {
          'mcp.transport': 'stdio'
        }
      },
      {
        spanId: 'span_sandbox_04',
        parentSpanId: 'span_dispatch_03',
        serviceName: 'docker-daemon',
        operationName: 'gvisor.sandbox_spawn',
        startTimeMs: 9.8,
        durationMs: 12.4,
        isCriticalPath: true,
        category: 'security',
        tags: {
          'sandbox.runtime': 'runsc',
          'cgroup.memory_max': '512MB'
        }
      },
      {
        spanId: 'span_vector_05',
        parentSpanId: 'span_dispatch_03',
        serviceName: 'pgvector-cluster',
        operationName: 'pgvector.hnsw_similarity_search',
        startTimeMs: 22.8,
        durationMs: 31.2,
        isCriticalPath: true,
        category: 'database',
        tags: {
          'vector.dimension': '1536',
          'vector.metric': 'cosine',
          'vector.k': '5',
          'hnsw.ef_search': '64'
        }
      },
      {
        spanId: 'span_prune_06',
        parentSpanId: 'span_dispatch_03',
        serviceName: 'docker-daemon',
        operationName: 'gvisor.sandbox_prune',
        startTimeMs: 54.4,
        durationMs: 2.1,
        isCriticalPath: false,
        category: 'security',
        tags: {
          'sandbox.disposition': 'PRUNED'
        }
      },
      {
        spanId: 'span_memory_07',
        parentSpanId: 'span_mcp_root',
        serviceName: 'langgraph-orchestrator',
        operationName: 'langgraph.update_episodic_memory',
        startTimeMs: 58.4,
        durationMs: 4.4,
        isCriticalPath: true,
        category: 'cache',
        tags: {
          'memory.checkpoint_type': 'REDIS_RAFT'
        }
      }
    ]
  }
]
