export interface GatewayFilter {
  name: string
  type: 'security' | 'traffic' | 'transformation' | 'observability'
  description: string
  overheadMs: number
  activeByDefault: boolean
}

export interface GatewayRoute {
  id: string
  routePath: string
  method: 'GET' | 'POST' | 'PUT' | 'WSS'
  title: string
  systemName: string
  upstreamService: string
  protocol: string
  rateLimitSla: string
  latencyTarget: string
  governingAdr: string
  summary: string
  filters: GatewayFilter[]
  sampleRequest: {
    headers: Record<string, string>
    bodySnippet?: string
  }
  sampleResponse: {
    statusCode: number
    statusText: string
    headers: Record<string, string>
    bodySnippet: string
  }
  envoyConfigSnippet: string
}

export const GATEWAY_ROUTES: GatewayRoute[] = [
  {
    id: 'saas-iam-ingress',
    routePath: '/v1/auth/tenants',
    method: 'POST',
    title: 'Multi-Tenant IAM Ingress & JWT Claims Injection',
    systemName: 'Cloud-Native Multi-Tenant SaaS Core',
    upstreamService: 'saas-iam-service.internal:8080',
    protocol: 'HTTP/2 TLSv1.3 (Envoy SPIFFE mTLS)',
    rateLimitSla: '5,000 req/sec per tenant',
    latencyTarget: 'P99 < 8.2ms',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Terminates edge TLS, extracts RS256 JWT claims, and injects X-Tenant-Id and X-User-Role downstream for PostgreSQL Row-Level Security.',
    filters: [
      {
        name: 'SPIFFE mTLS Ingress Filter',
        type: 'security',
        description: 'Validates cryptographic peer certificates and rotates SPIFFE workload IDs without edge restart.',
        overheadMs: 1.1,
        activeByDefault: true
      },
      {
        name: 'WAF OWASP Core Rule Set',
        type: 'security',
        description: 'Inspects query strings and bodies for SQL injection, path traversal, and unescaped script tags.',
        overheadMs: 1.8,
        activeByDefault: true
      },
      {
        name: 'Token-Bucket Rate Limiter',
        type: 'traffic',
        description: 'Redis cluster backed token bucket enforcing 5,000 req/sec quota per tenant with 1,000 burst credit.',
        overheadMs: 0.9,
        activeByDefault: true
      },
      {
        name: 'JWT Claims Downstream Injector',
        type: 'transformation',
        description: 'Decodes RS256 JWT payload; injects validated X-Tenant-Id, X-User-Org, and X-Roles headers to upstream.',
        overheadMs: 0.6,
        activeByDefault: true
      }
    ],
    sampleRequest: {
      headers: {
        'Host': 'api.mesh.production',
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.tenant_enterprise_01...',
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.42'
      },
      bodySnippet: '{"action":"query_catalog","scope":"read:products","pageSize":50}'
    },
    sampleResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'X-Envoy-Upstream-Service-Time': '4.2ms',
        'X-Tenant-Context': 'tenant_enterprise_01',
        'X-RateLimit-Limit': '5000',
        'X-RateLimit-Remaining': '4982',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      bodySnippet: '{"status":"authenticated","tenant":"tenant_enterprise_01","roles":["ROLE_ADMIN"]}'
    },
    envoyConfigSnippet: `route_config:
  name: saas_iam_route
  virtual_hosts:
  - name: api_mesh
    domains: ["api.mesh.production"]
    routes:
    - match: { prefix: "/v1/auth/tenants" }
      route:
        cluster: saas_iam_service
        timeout: 2.0s
        retry_policy:
          retry_on: "5xx,connect-failure,refused-stream"
          num_retries: 3`
  },
  {
    id: 'saga-checkout-ingress',
    routePath: '/v1/orders/checkout',
    method: 'POST',
    title: 'Distributed Saga Ingress & Idempotency Gate',
    systemName: 'High-Throughput E-Commerce Checkout Engine',
    upstreamService: 'order-saga-coordinator.internal:8081',
    protocol: 'HTTP/2 gRPC Bridge (Multiplexed)',
    rateLimitSla: '15,000 req/sec cluster wide',
    latencyTarget: 'P99 < 14.5ms',
    governingAdr: 'ADR-001 & ADR-002',
    summary: 'Atomic Redis Redlock lease ensures zero duplicate checkouts; transcode JSON HTTP requests into high-speed binary gRPC protobuf streams.',
    filters: [
      {
        name: 'Redis Idempotency Gate',
        type: 'traffic',
        description: 'Acquires 30s atomic lease on Idempotency-Key UUIDv7; immediately returns 409 Conflict on race.',
        overheadMs: 1.4,
        activeByDefault: true
      },
      {
        name: 'JSON to gRPC Transcoder',
        type: 'transformation',
        description: 'Compiles incoming JSON payload into proto3 binary bytes; avoids JVM serialization overhead.',
        overheadMs: 0.8,
        activeByDefault: true
      },
      {
        name: 'Consecutive 5xx Circuit Breaker',
        type: 'security',
        description: 'Ejects unhealthy upstream pods after 5 consecutive failures for 30s ejection duration.',
        overheadMs: 0.3,
        activeByDefault: true
      },
      {
        name: 'Dark Traffic Canary Mirror',
        type: 'observability',
        description: 'Shadow mirrors 5% of production order requests asynchronously to staging canary cluster.',
        overheadMs: 0.5,
        activeByDefault: false
      }
    ],
    sampleRequest: {
      headers: {
        'Host': 'api.mesh.production',
        'Idempotency-Key': '018f67e2-411a-7b33-90d2-99ca8210331f',
        'Content-Type': 'application/json',
        'X-Client-Version': 'web-v4.18.2'
      },
      bodySnippet: '{"cartId":"cart_99182","itemsCount":3,"currency":"USD","amount":189.50}'
    },
    sampleResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'X-Envoy-Upstream-Service-Time': '11.8ms',
        'X-Idempotency-Status': 'LOCKED_AND_EXECUTED',
        'X-Saga-Trace-Id': 'saga_018f67e2411a',
        'Content-Type': 'application/json'
      },
      bodySnippet: '{"orderId":"ord_9901","status":"SAGA_PENDING","sagaStep":"INVENTORY_RESERVED"}'
    },
    envoyConfigSnippet: `route_config:
  name: checkout_saga_route
  virtual_hosts:
  - name: checkout_mesh
    domains: ["api.mesh.production"]
    routes:
    - match: { prefix: "/v1/orders/checkout" }
      route:
        cluster: order_saga_service
        hash_policy:
        - header: { header_name: "Idempotency-Key" }
        timeout: 3.5s`
  },
  {
    id: 'realtime-websocket-ingress',
    routePath: '/v1/collab/ws',
    method: 'WSS',
    title: 'High-Concurrency WebSocket Ingress & Loom Bridge',
    systemName: 'Real-Time Task Collaboration Mesh',
    upstreamService: 'collab-loom-cluster.internal:8082',
    protocol: 'WebSocket RFC 6455 over WSS (TLSv1.3)',
    rateLimitSla: '50,000 concurrent sockets',
    latencyTarget: 'P99 < 4.8ms frame broadcast',
    governingAdr: 'ADR-003 & ADR-004',
    summary: 'Upgrades HTTP/1.1 to RFC 6455 duplex WebSockets; proxies 50,000 concurrent connections into Java 21 Virtual Threads with sub-5ms broadcast.',
    filters: [
      {
        name: 'WebSocket Upgrade Negotiator',
        type: 'transformation',
        description: 'Handles 101 Switching Protocols handshake with per-message deflate compression support.',
        overheadMs: 0.4,
        activeByDefault: true
      },
      {
        name: 'Jittered Heartbeat Keeper',
        type: 'observability',
        description: 'Issues randomized ping frames every 15s +/- 2s to detect silent half-open NAT timeouts.',
        overheadMs: 0.2,
        activeByDefault: true
      },
      {
        name: 'Drop-Tail Ring Buffer Filter',
        type: 'traffic',
        description: 'Caps individual socket memory to 64KB; sheds delayed cursor frames during client network lag.',
        overheadMs: 0.5,
        activeByDefault: true
      },
      {
        name: 'Consistent Hash Affinity',
        type: 'traffic',
        description: 'Hashes tenant workspace ID to ensure all collaborators land on the same Redis Pub/Sub ring node.',
        overheadMs: 0.3,
        activeByDefault: true
      }
    ],
    sampleRequest: {
      headers: {
        'Host': 'api.mesh.production',
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
        'Sec-WebSocket-Version': '13'
      },
      bodySnippet: '[BINARY PROTOCOL HANDSHAKE: client_connect -> workspace_901]'
    },
    sampleResponse: {
      statusCode: 101,
      statusText: 'Switching Protocols',
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=',
        'X-Virtual-Thread-Worker': 'loom-carrier-pool-3'
      },
      bodySnippet: '{"type":"ACK","connectedUsers":48,"p99LatencyMs":3.2}'
    },
    envoyConfigSnippet: `route_config:
  name: realtime_ws_route
  virtual_hosts:
  - name: ws_mesh
    domains: ["api.mesh.production"]
    routes:
    - match: { prefix: "/v1/collab/ws" }
      route:
        cluster: collab_loom_service
        upgrade_configs:
        - upgrade_type: "websocket"`
  },
  {
    id: 'fintech-vault-ingress',
    routePath: '/v1/payments/charge',
    method: 'POST',
    title: 'FinTech PCI-DSS Vault Ingress & Tokenizer',
    systemName: 'FinTech High-Assurance Payment Gateway',
    upstreamService: 'fintech-ledger-vault.internal:8443',
    protocol: 'Mutual TLS (HSM Keystore Termination)',
    rateLimitSla: '3,000 req/sec strict threshold',
    latencyTarget: 'P99 < 22.0ms (KMS Encrypted)',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'Hardware Security Module (HSM) mTLS termination with automated credit card PAN tokenization via AWS KMS before hitting upstream ledgers.',
    filters: [
      {
        name: 'AWS KMS In-Flight Tokenizer',
        type: 'security',
        description: 'Replaces raw 16-digit card numbers with opaque UUID surrogates before payload leaves gateway boundary.',
        overheadMs: 3.4,
        activeByDefault: true
      },
      {
        name: 'HMAC-SHA256 Signature Verify',
        type: 'security',
        description: 'Validates cryptographic payload signature using merchant rotating shared secret.',
        overheadMs: 1.2,
        activeByDefault: true
      },
      {
        name: 'PCI-DSS Data Redactor',
        type: 'security',
        description: 'Zero plaintext card or CVV logged in gateway access logs; strict masking enforced.',
        overheadMs: 0.4,
        activeByDefault: true
      },
      {
        name: 'Bulkhead Worker Isolation',
        type: 'traffic',
        description: 'Caps concurrent vault upstream connections to strictly 50 threads; prevents resource starvation.',
        overheadMs: 0.6,
        activeByDefault: true
      }
    ],
    sampleRequest: {
      headers: {
        'Host': 'api.mesh.production',
        'X-Signature-SHA256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'X-Merchant-Id': 'merch_88192a',
        'Content-Type': 'application/json'
      },
      bodySnippet: '{"amount":45000,"currency":"USD","cardPAN":"4111********1111","capture":true}'
    },
    sampleResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'X-Envoy-Upstream-Service-Time': '18.4ms',
        'X-Ledger-Entry-Id': 'ledg_tx_89104',
        'X-PCI-DSS-Tokenized': 'TRUE',
        'Content-Type': 'application/json'
      },
      bodySnippet: '{"chargeId":"ch_98412","status":"SETTLED","doubleSpendIntegrity":"VERIFIED"}'
    },
    envoyConfigSnippet: `route_config:
  name: fintech_vault_route
  virtual_hosts:
  - name: vault_mesh
    domains: ["api.mesh.production"]
    routes:
    - match: { prefix: "/v1/payments/charge" }
      route:
        cluster: fintech_vault_cluster
        timeout: 5.0s
        transport_socket:
          name: envoy.transport_sockets.tls`
  },
  {
    id: 'agentic-mcp-ingress',
    routePath: '/v1/agent/mcp-gateway',
    method: 'POST',
    title: 'Agentic AI & Model Context Protocol Ingress Gateway',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    upstreamService: 'agentic-mcp-router.internal:8085',
    protocol: 'JSON-RPC 2.0 over Server-Sent Events (SSE)',
    rateLimitSla: '10,000 token output quota / session',
    latencyTarget: 'P99 < 3.8ms routing overhead',
    governingAdr: 'ADR-006',
    summary: 'Dispatches tool calls to disposable gVisor sandbox containers, enforces token spend quotas, and manages SSE streaming connections.',
    filters: [
      {
        name: 'JSON-RPC 2.0 Schema Validator',
        type: 'transformation',
        description: 'Validates MCP protocol specs (tools/list, tools/call) and strips disallowed RPC method calls.',
        overheadMs: 0.5,
        activeByDefault: true
      },
      {
        name: 'Tool Container Sandbox Gate',
        type: 'security',
        description: 'Ensures target MCP tool worker runs inside gVisor sandbox with 512MB cgroup ceiling.',
        overheadMs: 0.9,
        activeByDefault: true
      },
      {
        name: 'Token-Spend Budget Guard',
        type: 'traffic',
        description: 'Tracks accumulated session tokens; returns HTTP 429 backpressure circuit break on budget overshoot.',
        overheadMs: 0.4,
        activeByDefault: true
      },
      {
        name: 'SSE Chunked Streaming Router',
        type: 'transformation',
        description: 'Streams incremental tool execution logs back to client with sub-1ms buffer flush.',
        overheadMs: 0.3,
        activeByDefault: true
      }
    ],
    sampleRequest: {
      headers: {
        'Host': 'api.mesh.production',
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
        'X-Agent-Session-Id': 'sess_langgraph_9981'
      },
      bodySnippet: '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"query_pgvector","arguments":{"k":5}}}'
    },
    sampleResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-MCP-Tool-Sandbox': 'CONTAINED_CGROUP_512MB',
        'X-Envoy-Upstream-Service-Time': '2.8ms'
      },
      bodySnippet: 'event: mcp_tool_result\\ndata: {"result":{"matchedDocuments":5,"searchLatencyMs":2.4}}'
    },
    envoyConfigSnippet: `route_config:
  name: agentic_mcp_route
  virtual_hosts:
  - name: mcp_mesh
    domains: ["api.mesh.production"]
    routes:
    - match: { prefix: "/v1/agent/mcp-gateway" }
      route:
        cluster: mcp_worker_pool
        timeout: 30.0s
        idle_timeout: 60.0s`
  }
]
