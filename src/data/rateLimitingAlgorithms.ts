export interface RateLimitingAlgorithm {
  id: string
  name: string
  algorithmName: string
  subtitle: string
  paradigm: string
  systemId: string
  systemName: string
  category: string
  capacityLimit: string
  refillRate: string
  burstTolerance: string
  burstHandling: string
  timeComplexity: string
  spaceComplexity: string
  memoryComplexity: string
  distributedStorage: string
  accuracy: string
  governingAdr: string
  summary: string
  description: string
  pros: string[]
  cons: string[]
  redisScriptSnippet: string
  redisLuaScript: string
  defaultConfig: {
    capacity: number
    refillRate: number
    windowSec: number
  }
  productionUseCase: {
    system: string
    endpoint: string
    threshold: string
    outcome: string
  }
}

export const RATE_LIMITING_ALGORITHMS: RateLimitingAlgorithm[] = [
  {
    id: 'token-bucket',
    name: 'Token Bucket',
    algorithmName: 'Token Bucket Rate Limiter',
    subtitle: 'Envoy & AWS API Gateway Default',
    paradigm: 'Burst-Permissive Accumulator',
    systemId: 'saas-platform',
    systemName: 'Cloud-Native Multi-Tenant SaaS Core',
    category: 'Edge Ingress & Tenant Quota Enforcement',
    capacityLimit: '20 tokens max capacity',
    refillRate: '5 tokens/sec continuous refill',
    burstTolerance: 'Permits short traffic spikes up to max bucket capacity',
    burstHandling: 'Permits short traffic spikes up to max bucket capacity',
    timeComplexity: 'O(1) amortized',
    spaceComplexity: 'O(1) per client key',
    memoryComplexity: 'O(1) - 2 Redis hash fields',
    distributedStorage: 'Redis Hash (tokens, last_refill_timestamp)',
    accuracy: 'High (continuous float-token replenishment)',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Tokens replenish into a bucket at a fixed refill rate up to maximum capacity. Each inbound request consumes 1 token. Requests arriving when the bucket is empty are immediately rejected with HTTP 429 and Retry-After headers.',
    description: 'Tokens replenish into a bucket at a fixed refill rate up to maximum capacity. Each inbound request consumes 1 token. Requests arriving when the bucket is empty are immediately rejected with HTTP 429 and Retry-After headers.',
    pros: [
      'Allows controlled bursts without dropping traffic',
      'Extremely memory efficient (stores only 2 fields per key)',
      'Sub-millisecond atomic evaluation via single Redis Lua script'
    ],
    cons: [
      'Burst traffic may saturate downstream services momentarily',
      'Requires synchronized clocks for accurate time calculations'
    ],
    redisScriptSnippet: `-- Atomic Token Bucket in Redis Lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_updated = now
else
  local delta = math.max(0, now - last_updated)
  tokens = math.min(capacity, tokens + delta * refill_rate)
  last_updated = now
end

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
  redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2)
  return { 1, math.floor(tokens) }
else
  return { 0, math.floor(tokens) }
end`,
    redisLuaScript: `-- Atomic Token Bucket in Redis Lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_updated = now
else
  local delta = math.max(0, now - last_updated)
  tokens = math.min(capacity, tokens + delta * refill_rate)
  last_updated = now
end

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
  redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2)
  return { 1, math.floor(tokens) }
else
  return { 0, math.floor(tokens) }
end`,
    defaultConfig: {
      capacity: 20,
      refillRate: 5,
      windowSec: 1
    },
    productionUseCase: {
      system: 'High-Throughput E-Commerce Checkout Engine',
      endpoint: 'POST /v1/checkout/orders',
      threshold: '20 burst capacity, 5 tokens/sec refill',
      outcome: 'Prevents checkout thundering herd during flash sales while allowing burst checkout transitions.'
    }
  },
  {
    id: 'leaky-bucket',
    name: 'Leaky Bucket',
    algorithmName: 'Leaky Bucket Traffic Smoother',
    subtitle: 'NGINX & Traffic Shaping Buffer',
    paradigm: 'Constant-Rate FIFO Queue',
    systemId: 'payment-gateway',
    systemName: 'FinTech High-Assurance Payment Gateway',
    category: 'PCI-DSS Gateway Egress Smoothing',
    capacityLimit: '15 queue capacity depth',
    refillRate: '3 requests/sec constant leak rate',
    burstTolerance: 'Smooths bursts into continuous constant-rate outflow',
    burstHandling: 'Smooths bursts into continuous constant-rate outflow',
    timeComplexity: 'O(1) atomic check',
    spaceComplexity: 'O(N) queue depth or O(1) water-level counter',
    memoryComplexity: 'O(1) - 2 Redis hash fields',
    distributedStorage: 'Redis Hash (water_level, last_leak_time)',
    accuracy: 'Very High (eliminates downstream traffic spikes)',
    governingAdr: 'ADR-003 & ADR-005',
    summary: 'Requests enter a buffer queue of fixed depth. Requests leak out of the queue to downstream workers at a strictly constant rate. If the queue overflows, incoming requests are dropped or returned as HTTP 429.',
    description: 'Requests enter a buffer queue of fixed depth. Requests leak out of the queue to downstream workers at a strictly constant rate. If the queue overflows, incoming requests are dropped or returned as HTTP 429.',
    pros: [
      'Completely isolates downstream services from burst shock',
      'Guarantees predictable, flat downstream throughput',
      'Ideal for third-party billing and webhook dispatches'
    ],
    cons: [
      'Increases request latency for requests queued in the buffer',
      'Bursty requests take longer to complete even if downstream is idle'
    ],
    redisScriptSnippet: `-- Atomic Leaky Bucket in Redis Lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local leak_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'water', 'last_leak')
local water = tonumber(data[1]) or 0
local last_leak = tonumber(data[2]) or now

local elapsed = math.max(0, now - last_leak)
water = math.max(0, water - elapsed * leak_rate)

if water + requested <= capacity then
  water = water + requested
  redis.call('HMSET', key, 'water', water, 'last_leak', now)
  redis.call('EXPIRE', key, math.ceil(capacity / leak_rate) * 2)
  return { 1, math.floor(capacity - water) }
else
  return { 0, math.floor(capacity - water) }
end`,
    redisLuaScript: `-- Atomic Leaky Bucket in Redis Lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local leak_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'water', 'last_leak')
local water = tonumber(data[1]) or 0
local last_leak = tonumber(data[2]) or now

local elapsed = math.max(0, now - last_leak)
water = math.max(0, water - elapsed * leak_rate)

if water + requested <= capacity then
  water = water + requested
  redis.call('HMSET', key, 'water', water, 'last_leak', now)
  redis.call('EXPIRE', key, math.ceil(capacity / leak_rate) * 2)
  return { 1, math.floor(capacity - water) }
else
  return { 0, math.floor(capacity - water) }
end`,
    defaultConfig: {
      capacity: 15,
      refillRate: 3,
      windowSec: 1
    },
    productionUseCase: {
      system: 'FinTech High-Assurance Payment Gateway',
      endpoint: 'POST /v1/payments/charges',
      threshold: '15 queue capacity, 3 leak/sec',
      outcome: 'Prevents card network timeouts and eliminates duplicate transaction retries under burst carding traffic.'
    }
  },
  {
    id: 'fixed-window',
    name: 'Fixed Window Counter',
    algorithmName: 'Fixed Window Periodic Counter',
    subtitle: 'Low-Overhead Periodic Counter',
    paradigm: 'Discrete Time-Bucket Counter',
    systemId: 'realtime-collab',
    systemName: 'Real-Time Task Collaboration Mesh',
    category: 'Low-Overhead Coarse Rate Limiting',
    capacityLimit: '25 requests per window',
    refillRate: 'Resets every 60 seconds',
    burstTolerance: 'Vulnerable to 2x boundary burst attacks',
    burstHandling: 'Vulnerable to 2x boundary burst attacks',
    timeComplexity: 'O(1) direct INCR',
    spaceComplexity: 'O(1) single Redis integer key',
    memoryComplexity: 'O(1) - single integer key',
    distributedStorage: 'Redis String (INCR + EXPIRE)',
    accuracy: 'Moderate (traffic clustering at window edges)',
    governingAdr: 'ADR-004',
    summary: 'Divides the timeline into fixed discrete intervals (e.g. 1 minute). Each request increments the counter for the current window. If counter exceeds threshold, requests are rejected until the next window boundary.',
    description: 'Divides the timeline into fixed discrete intervals (e.g. 1 minute). Each request increments the counter for the current window. If counter exceeds threshold, requests are rejected until the next window boundary.',
    pros: [
      'Simplest implementation with atomic Redis INCR',
      'Minimal memory footprint (single integer counter)',
      'Sub-0.5ms evaluation latency'
    ],
    cons: [
      'Traffic surge right before and after window boundary allows 2x limit',
      'Strictest resets cause thundering herd at top of minute'
    ],
    redisScriptSnippet: `-- Atomic Fixed Window in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, window_sec)
end

if current <= limit then
  return { 1, limit - current }
else
  return { 0, 0 }
end`,
    redisLuaScript: `-- Atomic Fixed Window in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, window_sec)
end

if current <= limit then
  return { 1, limit - current }
else
  return { 0, 0 }
end`,
    defaultConfig: {
      capacity: 25,
      refillRate: 25,
      windowSec: 60
    },
    productionUseCase: {
      system: 'Cloud-Native Multi-Tenant SaaS Core',
      endpoint: 'GET /v1/reports/export',
      threshold: '25 requests per minute',
      outcome: 'Protects expensive PostgreSQL analytical export queries from excessive tenant polling.'
    }
  },
  {
    id: 'sliding-window-log',
    name: 'Sliding Window Log',
    algorithmName: 'Sliding Window Log Validator (sliding-log)',
    subtitle: 'Exact Sliding Microsecond Accuracy',
    paradigm: 'Sorted Set Event Journal',
    systemId: 'ecommerce-saga',
    systemName: 'High-Throughput E-Commerce Checkout Engine',
    category: 'Zero-Boundary Fraud Prevention',
    capacityLimit: '30 requests per minute',
    refillRate: 'Sliding continuous millisecond eviction',
    burstTolerance: 'Zero boundary vulnerability, mathematically strict',
    burstHandling: 'Zero boundary vulnerability, mathematically strict',
    timeComplexity: 'O(log M + M) set prune & card',
    spaceComplexity: 'O(N) per request timestamp',
    memoryComplexity: 'O(N) - stores timestamp per request',
    distributedStorage: 'Redis Sorted Set (ZSET with score = epoch_ms)',
    accuracy: '100% Exact',
    governingAdr: 'ADR-005',
    summary: 'Maintains a timestamp sorted set for every client request. Evaluates rate by removing entries older than (now - window) with ZREMRANGEBYSCORE and checking ZCARD against limit before adding current timestamp.',
    description: 'Maintains a timestamp sorted set for every client request. Evaluates rate by removing entries older than (now - window) with ZREMRANGEBYSCORE and checking ZCARD against limit before adding current timestamp.',
    pros: [
      '100% mathematically exact rate enforcement',
      'Zero window boundary edge vulnerabilities',
      'Works with irregular request intervals'
    ],
    cons: [
      'High memory consumption (stores every request timestamp)',
      'Higher CPU cost for Redis during frequent ZREMRANGEBYSCORE operations'
    ],
    redisScriptSnippet: `-- Atomic Sliding Window Log in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local now_ms = tonumber(ARGV[2])
local window_ms = tonumber(ARGV[3])

local clear_before = now_ms - window_ms
redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)

local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now_ms, now_ms .. '-' .. math.random(1000, 9999))
  redis.call('PEXPIRE', key, window_ms)
  return { 1, limit - count - 1 }
else
  return { 0, 0 }
end`,
    redisLuaScript: `-- Atomic Sliding Window Log in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local now_ms = tonumber(ARGV[2])
local window_ms = tonumber(ARGV[3])

local clear_before = now_ms - window_ms
redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)

local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now_ms, now_ms .. '-' .. math.random(1000, 9999))
  redis.call('PEXPIRE', key, window_ms)
  return { 1, limit - count - 1 }
else
  return { 0, 0 }
end`,
    defaultConfig: {
      capacity: 30,
      refillRate: 30,
      windowSec: 60
    },
    productionUseCase: {
      system: 'Autonomous Agentic Orchestrator & MCP Mesh',
      endpoint: 'POST /v1/mcp/tools/execute',
      threshold: '30 tool invocations per minute',
      outcome: 'Strict containment preventing rogue agent ReAct loops from triggering high-cost LLM API billing.'
    }
  },
  {
    id: 'sliding-window-counter',
    name: 'Sliding Window Counter',
    algorithmName: 'Sliding Window Counter Approximator (sliding-counter)',
    subtitle: 'Cloudflare & Cloud Armor Hybrid',
    paradigm: 'Weighted Window Approximator',
    systemId: 'agentic-mcp-mesh',
    systemName: 'Autonomous Agentic Orchestrator & MCP Mesh',
    category: 'High-Concurrency Approximated Sliding Window',
    capacityLimit: '50 handshakes per minute',
    refillRate: 'Weighted sub-window interpolation',
    burstTolerance: 'Smooths boundary transitions without timestamp memory overhead',
    burstHandling: 'Smooths boundary transitions without timestamp memory overhead',
    timeComplexity: 'O(1) two hash lookups',
    spaceComplexity: 'O(1) two integers per key',
    memoryComplexity: 'O(1) - 2 integer keys per client',
    distributedStorage: 'Redis Hash (prev_window_count, curr_window_count)',
    accuracy: '99.9% Approximate (Cloudflare standard)',
    governingAdr: 'ADR-004 & ADR-005',
    summary: 'Combines the counter from the previous window and current window with a time-weighted interpolation factor: count = prev * (1 - elapsed/window) + curr. Provides sliding window smoothness with fixed window O(1) memory efficiency.',
    description: 'Combines the counter from the previous window and current window with a time-weighted interpolation factor: count = prev * (1 - elapsed/window) + curr. Provides sliding window smoothness with fixed window O(1) memory efficiency.',
    pros: [
      'Zero memory bloat: stores only 2 integer counters',
      'Smooths boundary spikes without tracking individual timestamps',
      'Standard algorithm used in Cloudflare and Google Cloud Armor'
    ],
    cons: [
      'Slightly approximate (assumes uniform distribution in previous window)',
      'Requires floor calculations for bucket identifiers'
    ],
    redisScriptSnippet: `-- Atomic Sliding Window Counter in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current_window = math.floor(now / window_sec)
local prev_window = current_window - 1
local time_into_window = now % window_sec
local weight = (window_sec - time_into_window) / window_sec

local prev_key = key .. ':' .. prev_window
local curr_key = key .. ':' .. current_window

local prev_count = tonumber(redis.call('GET', prev_key)) or 0
local curr_count = tonumber(redis.call('GET', curr_key)) or 0

local estimated = math.floor(prev_count * weight + curr_count)

if estimated < limit then
  redis.call('INCR', curr_key)
  redis.call('EXPIRE', curr_key, window_sec * 2)
  return { 1, limit - estimated - 1 }
else
  return { 0, 0 }
end`,
    redisLuaScript: `-- Atomic Sliding Window Counter in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current_window = math.floor(now / window_sec)
local prev_window = current_window - 1
local time_into_window = now % window_sec
local weight = (window_sec - time_into_window) / window_sec

local prev_key = key .. ':' .. prev_window
local curr_key = key .. ':' .. current_window

local prev_count = tonumber(redis.call('GET', prev_key)) or 0
local curr_count = tonumber(redis.call('GET', curr_key)) or 0

local estimated = math.floor(prev_count * weight + curr_count)

if estimated < limit then
  redis.call('INCR', curr_key)
  redis.call('EXPIRE', curr_key, window_sec * 2)
  return { 1, limit - estimated - 1 }
else
  return { 0, 0 }
end`,
    defaultConfig: {
      capacity: 50,
      refillRate: 50,
      windowSec: 60
    },
    productionUseCase: {
      system: 'Real-Time Task Collaboration Mesh',
      endpoint: 'WS /v1/collab/connect',
      threshold: '50 connection handshakes per minute',
      outcome: 'Protects Java 21 Virtual Threads pool from WebSocket reconnection storms during cluster rollouts.'
    }
  }
]
