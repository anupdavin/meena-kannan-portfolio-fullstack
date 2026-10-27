export interface EdgePopNode {
  id: string
  city: string
  region: string
  hitRatioPct: number
  edgeLatencyMs: number
  cachedObjects: number
  status: 'hit' | 'miss' | 'stale-revalidating' | 'purged'
}

export interface SurrogateTagRecord {
  tag: string
  resourcePath: string
  scope: string
  description: string
}

export interface EdgeCdnStrategy {
  id: string
  name: string
  strategyName: string
  subtitle: string
  cachePolicyHeader: string
  purgeLatencyTarget: string
  originOffloadPct: number
  stampedeProtection: string
  governingAdr: string
  summary: string
  pops: EdgePopNode[]
  surrogateKeys: SurrogateTagRecord[]
  tradeoffs: {
    pros: string[]
    cons: string[]
  }
  productionUseCase: {
    system: string
    entity: string
    workload: string
    justification: string
  }
  edgeCodeSnippet: string
}

export const EDGE_CDN_STRATEGIES: EdgeCdnStrategy[] = [
  {
    id: 'surrogate-key-purge',
    name: 'Surrogate-Key & Cache-Tag Invalidation',
    strategyName: 'Tag-Based Targeted Cache Eviction',
    subtitle: 'Fastly & Cloudflare Purge by Tag',
    cachePolicyHeader: 'Surrogate-Key: tenant-nike catalog-shoes sku-88120 brand-us-east',
    purgeLatencyTarget: '< 150ms global propagation to 300+ edge PoPs',
    originOffloadPct: 98.4,
    stampedeProtection: 'Atomic cache-tag soft invalidation with lock grace window',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Responses are stamped at origin with one or more Surrogate-Key tags. When database entities mutate (e.g. price change, inventory update), an API call to the CDN invalidates the exact tag, evicting thousands of dependent HTML, JSON, and image variations across all global PoPs in under 150ms without expensive URL walks.',
    pops: [
      { id: 'sin-01', city: 'Singapore (SIN)', region: 'APAC', hitRatioPct: 97.4, edgeLatencyMs: 3.2, cachedObjects: 1420000, status: 'hit' },
      { id: 'fra-01', city: 'Frankfurt (FRA)', region: 'Europe', hitRatioPct: 98.1, edgeLatencyMs: 4.1, cachedObjects: 1890000, status: 'hit' },
      { id: 'iad-01', city: 'N. Virginia (IAD)', region: 'US-East', hitRatioPct: 99.0, edgeLatencyMs: 2.8, cachedObjects: 2450000, status: 'hit' },
      { id: 'sjc-01', city: 'San Jose (SJC)', region: 'US-West', hitRatioPct: 98.5, edgeLatencyMs: 3.0, cachedObjects: 1980000, status: 'hit' },
      { id: 'syd-01', city: 'Sydney (SYD)', region: 'Oceania', hitRatioPct: 96.8, edgeLatencyMs: 4.8, cachedObjects: 1120000, status: 'hit' },
    ],
    surrogateKeys: [
      { tag: 'tenant-nike-pricing', resourcePath: '/api/v1/catalogs/nike/pricing.json', scope: 'Enterprise Tenant', description: 'Purges all localized currency variants for Nike store upon price tier update.' },
      { tag: 'sku-airmax-90-inv', resourcePath: '/api/v1/products/sku-airmax-90/stock', scope: 'Inventory SKU', description: 'Evicts product inventory cache upon real-time checkout warehouse sync.' },
      { tag: 'category-mens-footwear', resourcePath: '/api/v1/categories/mens-footwear', scope: 'Category Taxonomy', description: 'Invalidates listing page caches when new product models are published.' },
      { tag: 'auth-policy-tenant-7', resourcePath: '/api/v1/tenants/7/permissions.json', scope: 'Security Policy', description: 'Immediate edge invalidation of RBAC permissions on role changes.' },
    ],
    tradeoffs: {
      pros: [
        'Invalidates millions of cached variants with a single API call targeting one tag',
        'Eliminates brittle URL regex pattern matching and expensive path crawling',
        'Sub-150ms global convergence ensures instant consistency during breaking data changes',
        'Enables aggressive TTL caching (e.g. 7 days) because evictions are event-driven'
      ],
      cons: [
        'Requires upstream microservices to track and inject granular Surrogate-Key headers',
        'Overly broad tags (e.g. tagging all items with "all-products") trigger mass cache thundering',
        'CDN vendor API rate limits on tag purge requests during high-frequency writes'
      ]
    },
    productionUseCase: {
      system: 'High-Throughput Distributed E-Commerce Checkout Engine',
      entity: 'Product Catalog, Pricing Rules & Flash Sale Inventories',
      workload: 'Over 100,000 requests/sec during Black Friday flash sale campaigns',
      justification: 'Keeps product listings and prices cached at 300+ PoPs with 98.4% edge hit ratio, evicting stale prices within 150ms when merchant updates inventory.'
    },
    edgeCodeSnippet: `// Spring Boot 3 Header Filter Injecting Surrogate Keys (Java 21)
@Component
public class SurrogateKeyResponseFilter implements WebFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            String path = exchange.getRequest().getPath().value();
            if (path.startsWith("/api/v1/catalogs/")) {
                String tenant = exchange.getRequest().getHeaders().getFirst("X-Tenant-ID");
                exchange.getResponse().getHeaders().add(
                    "Surrogate-Key",
                    String.format("tenant-%s catalog-api global-products", tenant != null ? tenant : "public")
                );
                exchange.getResponse().getHeaders().add(
                    "Cache-Control",
                    "public, max-age=86400, stale-while-revalidate=3600"
                );
            }
        }));
    }
}`
  },
  {
    id: 'stale-while-revalidate',
    name: 'Stale-While-Revalidate Edge Shield',
    strategyName: 'Asynchronous Background Origin Refresh',
    subtitle: 'RFC 5861 Non-Blocking Edge Caching',
    cachePolicyHeader: 'Cache-Control: public, max-age=60, stale-while-revalidate=300, stale-if-error=86400',
    purgeLatencyTarget: '0ms user-perceived latency (served immediately from PoP memory)',
    originOffloadPct: 96.2,
    stampedeProtection: 'Single background fetch lock prevents origin duplicate queries',
    governingAdr: 'ADR-003 & ADR-004',
    summary: 'When an edge cache item expires (after max-age=60s), the edge PoP does not block the visiting user while fetching from origin. Instead, it serves the existing stale item instantly (2-4ms), while asynchronously triggering a background worker to fetch and cache the fresh copy for future visitors.',
    pops: [
      { id: 'sin-01', city: 'Singapore (SIN)', region: 'APAC', hitRatioPct: 96.5, edgeLatencyMs: 3.1, cachedObjects: 1280000, status: 'hit' },
      { id: 'fra-01', city: 'Frankfurt (FRA)', region: 'Europe', hitRatioPct: 97.2, edgeLatencyMs: 3.8, cachedObjects: 1650000, status: 'hit' },
      { id: 'iad-01', city: 'N. Virginia (IAD)', region: 'US-East', hitRatioPct: 98.4, edgeLatencyMs: 2.6, cachedObjects: 2100000, status: 'hit' },
      { id: 'sjc-01', city: 'San Jose (SJC)', region: 'US-West', hitRatioPct: 97.0, edgeLatencyMs: 2.9, cachedObjects: 1720000, status: 'hit' },
      { id: 'syd-01', city: 'Sydney (SYD)', region: 'Oceania', hitRatioPct: 95.4, edgeLatencyMs: 4.5, cachedObjects: 980000, status: 'hit' },
    ],
    surrogateKeys: [
      { tag: 'user-workspace-dashboard', resourcePath: '/api/v1/workspaces/dashboard', scope: 'User Session', description: 'Serves instantaneous cached workspace overview while background sync updates metrics.' },
      { tag: 'trending-market-tickers', resourcePath: '/api/v1/markets/tickers', scope: 'Financial Market', description: 'Sub-4ms market snapshot delivered while background worker polls upstream order book.' },
      { tag: 'collaborative-canvas-state', resourcePath: '/api/v1/canvas/rooms/42', scope: 'CRDT Room State', description: 'Instantly boots room canvas from edge memory while reconciling vector clocks.' },
    ],
    tradeoffs: {
      pros: [
        'Eliminates P99 origin fetch latency spikes for human visitors upon cache expiration',
        'Stale-if-error provides complete disaster recovery: serves cache if origin returns 502/504',
        'Origin servers receive smoothed, predictable query rates instead of synchronized bursts',
        'Near-zero network round-trip time: client receives response in sub-5ms from closest PoP'
      ],
      cons: [
        'Clients briefly observe data that is up to stale-while-revalidate seconds old',
        'Unsuitable for strict linearizable financial balance deductions or cryptographic nonces',
        'Requires edge proxy memory overhead to retain stale objects during background fetches'
      ]
    },
    productionUseCase: {
      system: 'Real-Time Collaboration & State Synchronization Engine',
      entity: 'Workspace Room Metadata & Active Collaborator Rosters',
      workload: '50,000 WebSocket reconnections during network fluctuation bursts',
      justification: 'Returns cached room metadata in 3.1ms from local Singapore PoP while virtual threads reconcile CRDT semi-lattices in the background.'
    },
    edgeCodeSnippet: `// Cloudflare Worker Implementing RFC 5861 SWR Handling (TypeScript)
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const cache = caches.default;
        const cacheKey = new Request(request.url, request);
        let response = await cache.match(cacheKey);

        if (!response) {
            response = await fetch(request);
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        }

        const age = parseInt(response.headers.get("Age") || "0", 10);
        if (age > 60 && age <= 360) {
            // Serve stale response immediately, revalidate asynchronously
            ctx.waitUntil((async () => {
                const fresh = await fetch(request);
                await cache.put(cacheKey, fresh);
            })());
        }

        return response;
    }
};`
  },
  {
    id: 'origin-shield-hierarchy',
    name: 'Origin Shield & Tiered Caching',
    strategyName: 'Two-Tier Centralized Cache Concentration',
    subtitle: 'AWS CloudFront Regional Edge Cache & Shield',
    cachePolicyHeader: 'X-Cache-Tier: Edge-PoP -> Origin-Shield (IAD) -> Microservice',
    purgeLatencyTarget: '92.8% reduction in origin cross-continental ingress connections',
    originOffloadPct: 99.1,
    stampedeProtection: 'Single Origin Shield node absorbs all worldwide regional cache misses',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'Instead of dozens of global edge PoPs simultaneously querying the backend database when content expires, all PoP cache misses route through a centralized intermediate Origin Shield located in the same AWS availability zone as the database, consolidating origin load.',
    pops: [
      { id: 'sin-01', city: 'Singapore (SIN)', region: 'APAC', hitRatioPct: 98.6, edgeLatencyMs: 3.3, cachedObjects: 1540000, status: 'hit' },
      { id: 'fra-01', city: 'Frankfurt (FRA)', region: 'Europe', hitRatioPct: 98.9, edgeLatencyMs: 3.9, cachedObjects: 1920000, status: 'hit' },
      { id: 'iad-01', city: 'N. Virginia (IAD - Origin Shield)', region: 'Origin Shield', hitRatioPct: 99.8, edgeLatencyMs: 1.2, cachedObjects: 4890000, status: 'hit' },
      { id: 'sjc-01', city: 'San Jose (SJC)', region: 'US-West', hitRatioPct: 99.1, edgeLatencyMs: 2.7, cachedObjects: 2050000, status: 'hit' },
      { id: 'syd-01', city: 'Sydney (SYD)', region: 'Oceania', hitRatioPct: 97.9, edgeLatencyMs: 4.4, cachedObjects: 1350000, status: 'hit' },
    ],
    surrogateKeys: [
      { tag: 'b2b-saas-tenant-assets', resourcePath: '/cdn/tenants/*/static/app.js', scope: 'Multi-Tenant Bundle', description: 'Shared JavaScript bundles and web components cached at Origin Shield.' },
      { tag: 'pdf-audit-reports', resourcePath: '/cdn/reports/compliance/*.pdf', scope: 'Generated Reports', description: 'Heavy dynamically generated PDF files buffered in Origin Shield memory.' },
      { tag: 'vector-embedding-models', resourcePath: '/cdn/models/all-minilm-l6-v2.onnx', scope: 'AI Weights', description: 'Quantized ONNX model weights (45MB) pinned at regional origin shield.' },
    ],
    tradeoffs: {
      pros: [
        'Protects backend PostgreSQL and Spring Boot instances from worldwide cache stampedes',
        'Dramatically reduces cross-continental cloud network egress costs between regions',
        'Consolidates warm cache hit ratio to 99.1% across long-tail catalog assets',
        'Provides predictable database connection pool sizing under sudden traffic surges'
      ],
      cons: [
        'Adds small latency hop (~2-4ms) for cache misses routing through intermediate shield',
        'Origin Shield instance failure requires automated failover routing directly to origin',
        'Requires dedicated cloud infrastructure allocation in primary cloud region'
      ]
    },
    productionUseCase: {
      system: 'Multi-Tenant B2B Cloud SaaS Platform',
      entity: 'Dynamic Tenant JavaScript Bundles & Static Assets',
      workload: '500 enterprise corporate domains loading applications at 9am local peaks',
      justification: 'Absorbs worldwide timezone-driven morning login surges through AWS Origin Shield in us-east-1, keeping RDS CPU below 28%.'
    },
    edgeCodeSnippet: `// AWS CloudFront Origin Shield Terraform Infrastructure Spec
resource "aws_cloudfront_distribution" "enterprise_cdn" {
  origin {
    domain_name = "api.enterprise.cloud.io"
    origin_id   = "EnterpriseOrigin"

    origin_shield {
      enabled              = true
      origin_shield_region = "us-east-1"
    }

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.3"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "EnterpriseOrigin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
  }
}`
  },
  {
    id: 'collapsed-forwarding',
    name: 'Collapsed Forwarding & Request Coalescing',
    strategyName: 'Thundering Herd Origin Mutex Consolidation',
    subtitle: 'Varnish & Fastly Request Merging',
    cachePolicyHeader: 'X-Coalesced-Requests: 42 incoming clients -> 1 origin fetch',
    purgeLatencyTarget: 'Converts N parallel cache misses into exactly 1 backend query',
    originOffloadPct: 99.7,
    stampedeProtection: 'In-flight mutex lock queues concurrent readers until first fetch resolves',
    governingAdr: 'ADR-002 & ADR-005',
    summary: 'When a popular item expires or is invalidated while 1,000 clients simultaneously request it, collapsed forwarding holds 999 client requests in a lightweight edge wait queue, dispatches exactly 1 request to the backend origin, and broadcasts the resulting response to all 1,000 waiting clients simultaneously.',
    pops: [
      { id: 'sin-01', city: 'Singapore (SIN)', region: 'APAC', hitRatioPct: 99.2, edgeLatencyMs: 3.0, cachedObjects: 1610000, status: 'hit' },
      { id: 'fra-01', city: 'Frankfurt (FRA)', region: 'Europe', hitRatioPct: 99.4, edgeLatencyMs: 3.6, cachedObjects: 2010000, status: 'hit' },
      { id: 'iad-01', city: 'N. Virginia (IAD)', region: 'US-East', hitRatioPct: 99.7, edgeLatencyMs: 2.5, cachedObjects: 2600000, status: 'hit' },
      { id: 'sjc-01', city: 'San Jose (SJC)', region: 'US-West', hitRatioPct: 99.5, edgeLatencyMs: 2.8, cachedObjects: 2150000, status: 'hit' },
      { id: 'syd-01', city: 'Sydney (SYD)', region: 'Oceania', hitRatioPct: 98.8, edgeLatencyMs: 4.2, cachedObjects: 1400000, status: 'hit' },
    ],
    surrogateKeys: [
      { tag: 'flash-sale-hero-banner', resourcePath: '/api/v1/promotions/hero-deals', scope: 'Flash Promotion', description: 'Coalesces 50,000 concurrent homepage arrivals into 1 origin render.' },
      { tag: 'breaking-market-halt', resourcePath: '/api/v1/markets/halts', scope: 'Financial Alert', description: 'Prevents database crash during sudden high-volatility financial news events.' },
      { tag: 'agentic-mcp-tool-catalog', resourcePath: '/api/v1/agent/tools.json', scope: 'Tool Schema Mesh', description: 'Merges parallel agent container cold-boot queries into 1 memory fetch.' },
    ],
    tradeoffs: {
      pros: [
        'Guaranteed mathematical defense against origin crashes from cache stampedes',
        'Maintains backend database connection pool availability during celebrity/flash traffic',
        'Waiting clients receive responses in milliseconds once the single origin fetch resolves',
        'Zero application code changes required; implemented entirely in edge proxy'
      ],
      cons: [
        'If the single coalesced origin request times out, all waiting clients suffer failure',
        'Requires carefully configured edge waiting timeouts (e.g. 5-10s) to prevent thread exhaustion',
        'Cannot coalesce POST, PUT, or authenticated session-specific user mutations'
      ]
    },
    productionUseCase: {
      system: 'FinTech Banking & Real-Time Payment Settlement',
      entity: 'Currency Exchange Rates & Central Bank Fixings',
      workload: 'Sudden spike of 25,000 queries upon publication of EUR/USD reference rate',
      justification: 'Collapses 25,000 simultaneous forex queries at the edge into exactly 1 backend database read, preventing HikariCP pool exhaustion.'
    },
    edgeCodeSnippet: `// Varnish Configuration Language (VCL) Collapsed Forwarding
sub vcl_recv {
    # Enable request coalescing on cache misses
    set req.hash_always_miss = false;
}

sub vcl_backend_fetch {
    # Collapsed forwarding automatically active in Varnish storage engine:
    # First thread creates a 'busy object'; subsequent matching requests wait
    # on the busy object instead of contacting backend.
}

sub vcl_backend_response {
    # Define grace period allowing stale delivery while coalesced fetch finishes
    set beresp.grace = 10m;
    set beresp.ttl = 5m;
    set beresp.http.X-Cache-Coalesced = "true";
}`
  },
  {
    id: 'edge-compute-workers',
    name: 'Edge Compute Workers & Micro-Routing',
    strategyName: 'Programmable Zero-Cold-Start Edge Logic',
    subtitle: 'Cloudflare Workers & Fastly Compute@Edge',
    cachePolicyHeader: 'X-Edge-Execution: Cloudflare V8 Isolate (1.8ms runtime execution)',
    purgeLatencyTarget: '< 5ms edge cold start with global instant deployment',
    originOffloadPct: 99.4,
    stampedeProtection: 'Edge KV and D1 edge replication bypasses central origin completely',
    governingAdr: 'ADR-003 & ADR-006',
    summary: 'Runs lightweight V8 isolate compute engines directly inside 300+ edge data centers. Validates JWT signatures, evaluates AB experimentation routing, inspects geographic geolocation headers, and rewrites API contracts at the edge without traversing to origin servers.',
    pops: [
      { id: 'sin-01', city: 'Singapore (SIN)', region: 'APAC', hitRatioPct: 99.5, edgeLatencyMs: 2.9, cachedObjects: 1750000, status: 'hit' },
      { id: 'fra-01', city: 'Frankfurt (FRA)', region: 'Europe', hitRatioPct: 99.6, edgeLatencyMs: 3.4, cachedObjects: 2200000, status: 'hit' },
      { id: 'iad-01', city: 'N. Virginia (IAD)', region: 'US-East', hitRatioPct: 99.8, edgeLatencyMs: 2.2, cachedObjects: 2800000, status: 'hit' },
      { id: 'sjc-01', city: 'San Jose (SJC)', region: 'US-West', hitRatioPct: 99.6, edgeLatencyMs: 2.5, cachedObjects: 2350000, status: 'hit' },
      { id: 'syd-01', city: 'Sydney (SYD)', region: 'Oceania', hitRatioPct: 99.1, edgeLatencyMs: 3.8, cachedObjects: 1550000, status: 'hit' },
    ],
    surrogateKeys: [
      { tag: 'edge-ab-test-matrix', resourcePath: '/api/v1/experiments/variant.json', scope: 'Experimentation', description: 'Assigns user bucketing directly in edge worker using MurmurHash on user cookie.' },
      { tag: 'jwt-auth-edge-keys', resourcePath: '/.well-known/jwks.json', scope: 'Edge Crypto Key', description: 'Caches public RS256 JWKS keys in edge worker memory for local token verification.' },
      { tag: 'geo-redirect-policies', resourcePath: '/api/v1/routing/locality', scope: 'Geo Regulation', description: 'Redirects traffic to regional data center based on incoming CF-IPCountry.' },
    ],
    tradeoffs: {
      pros: [
        'JWT validation and authorization executed in 1.8ms at the edge without origin traffic',
        'Zero cold-start overhead compared to container-based AWS Lambda functions',
        'Automatic global distribution across 300+ cities with sub-10ms latency worldwide',
        'Dramatically reduces origin compute requirements and server infrastructure bills'
      ],
      cons: [
        'Strict execution limits: 50ms CPU time limit on standard edge worker tiers',
        'V8 isolate environment cannot run heavy native C extensions or full JVM runtimes',
        'Stateful distributed transactions require eventual consistency or specialized edge storage'
      ]
    },
    productionUseCase: {
      system: 'Autonomous Agentic Orchestrator & Model Context Protocol Mesh',
      entity: 'Edge Tool Dispatcher & MCP Token Rate Quotas',
      workload: 'Edge validation of agent tool execution requests across global clients',
      justification: 'Validates cryptographic agent signatures and enforces per-minute token budgets in 2.2ms at edge PoPs before routing to sandboxed gVisor Docker containers.'
    },
    edgeCodeSnippet: `// Edge Compute Worker for JWT Verification & Geolocation Routing (TypeScript)
import { jwtVerify, importJWK } from 'jose';

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const country = request.headers.get("CF-IPCountry") || "US";
        const authHeader = request.headers.get("Authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "Missing Bearer Token" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            const token = authHeader.substring(7);
            const publicKey = await importJWK(JSON.parse(env.AUTH_JWK), "RS256");
            const { payload } = await jwtVerify(token, publicKey);

            // Forward verified user context directly to regional origin
            const modifiedRequest = new Request(request);
            modifiedRequest.headers.set("X-User-ID", payload.sub as string);
            modifiedRequest.headers.set("X-Client-Country", country);
            return await fetch(modifiedRequest);
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JWT Signature" }), { status: 403 });
        }
    }
};`
  }
]
