export interface CircuitBreakerPattern {
  id: string
  name: string
  paradigm: string
  badge: string
  targetLatency: string
  blastRadiusContainment: string
  failureThreshold: string
  recoveryMechanism: string
  stateMachine: {
    states: Array<{
      name: string
      color: string
      description: string
      behavior: string
    }>
    transitions: Array<{
      from: string
      to: string
      trigger: string
    }>
  }
  configurationSnippet: {
    language: string
    filename: string
    code: string
  }
  architecturalInvariant: string
  productionOutcomes: Record<string, string>
}

export const CIRCUIT_BREAKER_PATTERNS: CircuitBreakerPattern[] = [
  {
    id: 'resilience4j-sliding-window',
    name: 'Resilience4j Sliding Window Circuit Breaker',
    paradigm: 'Count & Time-Based Ring Buffer State Machine',
    badge: 'Resilience4j / Spring Cloud',
    targetLatency: '<15ms Local Trip / 0ms Open Fallback',
    blastRadiusContainment: '100% Upstream Thread Exhaustion Shield',
    failureThreshold: '50% Error Rate or 70% Slow Calls (>100ms)',
    recoveryMechanism: 'Half-Open 10-Probe Trial with Automatic Reset',
    stateMachine: {
      states: [
        {
          name: 'CLOSED',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
          description: 'Normal operations. Requests flow unimpeded to target downstream microservice.',
          behavior: 'Evaluates last 100 calls in a circular ring buffer against error & slow call thresholds.'
        },
        {
          name: 'OPEN',
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
          description: 'Tripped state. Immediately rejects calls or dispatches fallback without network I/O.',
          behavior: 'Blocks all outbound requests for 10,000ms wait duration to permit downstream recovery.'
        },
        {
          name: 'HALF_OPEN',
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
          description: 'Trial probe state. Permits configurable subset of canary calls to verify service health.',
          behavior: 'Sends 10 canary calls. If error rate < 50%, transitions to CLOSED; otherwise re-opens.'
        }
      ],
      transitions: [
        { from: 'CLOSED', to: 'OPEN', trigger: 'Failure rate >= 50% across 100 ring buffer calls' },
        { from: 'OPEN', to: 'HALF_OPEN', trigger: 'Wait duration of 10,000ms elapses in OPEN state' },
        { from: 'HALF_OPEN', to: 'CLOSED', trigger: 'Canary probe error rate < 50% across 10 trial requests' },
        { from: 'HALF_OPEN', to: 'OPEN', trigger: 'Any canary call fails or slow call threshold exceeded' }
      ]
    },
    configurationSnippet: {
      language: 'yaml',
      filename: 'resilience4j-circuit-breaker.yaml',
      code: `resilience4j.circuitbreaker:
  instances:
    paymentGatewayService:
      slidingWindowType: COUNT_BASED
      slidingWindowSize: 100
      minimumNumberOfCalls: 20
      failureRateThreshold: 50.0
      slowCallRateThreshold: 70.0
      slowCallDurationThreshold: 100ms
      waitDurationInOpenState: 10000ms
      permittedNumberOfCallsInHalfOpenState: 10
      automaticTransitionFromOpenToHalfOpenEnabled: true
      recordExceptions:
        - java.net.ConnectException
        - java.util.concurrent.TimeoutException
        - org.springframework.web.client.HttpServerErrorException`
    },
    architecturalInvariant: 'Fails fast in 0.2ms during outages by serving cached catalog snapshots, completely shielding JVM carrier thread pools from blocking on unresponsive 3rd-party APIs.',
    productionOutcomes: {
      'Outage Blast Radius': '0 Thread Starvation Cascades',
      'Fallback Fast-Fail': '0.2ms response time',
      'Ring Buffer Size': '100 calls analyzed',
      'Downstream Protection': '10s recovery window'
    }
  },
  {
    id: 'semaphore-thread-bulkhead',
    name: 'Semaphore & Thread-Pool Bulkhead Isolation',
    paradigm: 'Resource Partitioning & Concurrency Caps',
    badge: 'Bulkhead Isolation',
    targetLatency: '<1ms Queue Enforcement Overhead',
    blastRadiusContainment: 'Isolates Non-Critical Failures from Core Flows',
    failureThreshold: 'Max 25 Concurrent Calls / 15ms Queue Limit',
    recoveryMechanism: 'Immediate BulkheadFullException with Local Fallback',
    stateMachine: {
      states: [
        {
          name: 'AVAILABLE',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
          description: 'Semaphore slots free. Requests acquire lock and execute in isolated pool.',
          behavior: 'Active permits <= 25 concurrent executions.'
        },
        {
          name: 'SATURATED',
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
          description: 'Permits exhausted. Incoming calls queue up to max wait duration (15ms).',
          behavior: 'Queued requests execute as permits are released within timeout.'
        },
        {
          name: 'REJECTING',
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
          description: 'Queue full or wait timeout expired. Rejects calls without cascading.',
          behavior: 'Throws BulkheadFullException and triggers local degraded response.'
        }
      ],
      transitions: [
        { from: 'AVAILABLE', to: 'SATURATED', trigger: 'In-flight executions reach 25 concurrent permits' },
        { from: 'SATURATED', to: 'REJECTING', trigger: 'Wait queue exceeds 15ms or 50 queued tasks' },
        { from: 'REJECTING', to: 'AVAILABLE', trigger: 'Active executions complete and release permits' }
      ]
    },
    configurationSnippet: {
      language: 'java',
      filename: 'BulkheadConfig.java',
      code: `@Bean
public Bulkhead paymentBulkhead() {
    BulkheadConfig config = BulkheadConfig.custom()
        .maxConcurrentCalls(25)
        .maxWaitDuration(Duration.ofMillis(15))
        .writableStackTraceEnabled(false)
        .build();
    return BulkheadRegistry.of(config).bulkhead("addressValidation");
}`
    },
    architecturalInvariant: 'Compartmentalizes 3rd-party integrations into strictly capped concurrency envelopes, preventing slow peripheral services from depleting core transaction connection pools.',
    productionOutcomes: {
      'Core Flow Isolation': '100% Core Pool Protected',
      'Max Semaphore Cap': '25 Concurrent Requests',
      'Queue Timeout': '15ms drop-tail guarantee',
      'Cascading Factor': '0 Cascading Failures'
    }
  },
  {
    id: 'exponential-backoff-full-jitter',
    name: 'Exponential Backoff with Full Jitter',
    paradigm: 'Decorrelated Retry Randomization Algorithm',
    badge: 'Full Jitter Retry',
    targetLatency: 'Smooth distributed recovery ramp',
    blastRadiusContainment: 'Eliminates Thundering Herd Resonance Pulses',
    failureThreshold: 'Max 3 Retry Attempts per Idempotent Request',
    recoveryMechanism: 'Uniform Random Delay Between 0 and Exponential Cap',
    stateMachine: {
      states: [
        {
          name: 'INITIAL_CALL',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
          description: 'Standard request attempt with unique idempotency key.',
          behavior: 'Direct network dispatch. On 5xx/429/timeout, initiates retry sequence.'
        },
        {
          name: 'JITTER_BACKOFF',
          color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
          description: 'Calculates delay: t = Uniform(0, min(maxBackoff, base * 2^attempt)).',
          behavior: 'Sleeps thread asynchronously, spreading 50k client retries across temporal spectrum.'
        },
        {
          name: 'EXHAUSTED',
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
          description: 'Max 3 retry attempts reached without successful 200 OK.',
          behavior: 'Sends message to Dead-Letter Queue (DLQ) and returns client fallback.'
        }
      ],
      transitions: [
        { from: 'INITIAL_CALL', to: 'JITTER_BACKOFF', trigger: 'Downstream returns HTTP 503, 429, or SocketTimeout' },
        { from: 'JITTER_BACKOFF', to: 'INITIAL_CALL', trigger: 'Randomized sleep duration elapses for attempt <= 3' },
        { from: 'JITTER_BACKOFF', to: 'EXHAUSTED', trigger: 'Attempt counter reaches 3 failed tries' }
      ]
    },
    configurationSnippet: {
      language: 'typescript',
      filename: 'exponentialBackoffWithJitter.ts',
      code: `export function calculateFullJitterDelay(
  attempt: number,
  baseMs = 100,
  maxBackoffMs = 5000
): number {
  const exponentialCap = Math.min(maxBackoffMs, baseMs * Math.pow(2, attempt));
  // Full Jitter: Uniform random between 0 and exponential ceiling
  return Math.floor(Math.random() * exponentialCap);
}`
    },
    architecturalInvariant: 'Breaks lockstep client retry harmonics through decorrelated random intervals, reducing peak recovery traffic by 74% compared to rigid exponential backoff.',
    productionOutcomes: {
      'Thundering Herd Reduction': '-74% Peak Spike on Recovery',
      'Max Retry Bound': '3 Attempts Enforced',
      'Base Backoff': '100ms with 5,000ms ceiling',
      'Idempotency Safety': '100% Idempotency-Key Enforced'
    }
  },
  {
    id: 'adaptive-concurrency-vegas',
    name: 'Adaptive Concurrency Limits (TCP Vegas / BBR)',
    paradigm: 'Gradient Feedback Latency Auto-Throttling',
    badge: 'Adaptive TCP Vegas',
    targetLatency: 'Self-tuning around minimum RTT',
    blastRadiusContainment: 'Prevents In-Flight Congestion Under GC & Lock Stalls',
    failureThreshold: 'Gradient = minRTT / sampleRTT < 0.90',
    recoveryMechanism: 'Additive Increase / Multiplicative Decrease (AIMD)',
    stateMachine: {
      states: [
        {
          name: 'OPTIMAL_FLOW',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
          description: 'Queue delay near zero. System operating at baseline hardware minRTT.',
          behavior: 'Gradually expands concurrency limit: limit = limit + log10(limit).'
        },
        {
          name: 'CONGESTION_WARN',
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
          description: 'RTT queue expansion detected. Gradient drops below 0.95 threshold.',
          behavior: 'Freezes limit growth and rejects low-priority batch requests.'
        },
        {
          name: 'BACKPRESSURE_DROP',
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
          description: 'Server saturation or GC pause. Sample RTT diverges from minRTT.',
          behavior: 'Multiplicatively throttles in-flight concurrency limit by 20% to drain queues.'
        }
      ],
      transitions: [
        { from: 'OPTIMAL_FLOW', to: 'CONGESTION_WARN', trigger: 'Measured latency exceeds 1.1x baseline minRTT' },
        { from: 'CONGESTION_WARN', to: 'BACKPRESSURE_DROP', trigger: 'Gradient drops below 0.85 (severe queuing delay)' },
        { from: 'BACKPRESSURE_DROP', to: 'OPTIMAL_FLOW', trigger: 'Latency settles back to baseline minRTT window' }
      ]
    },
    configurationSnippet: {
      language: 'java',
      filename: 'VegasLimitConfig.java',
      code: `VegasLimit limit = VegasLimit.newBuilder()
    .initialLimit(20)
    .maxConcurrency(500)
    .alpha(3) // Queue tolerance lower bound
    .beta(6)  // Queue tolerance upper bound
    .smoothing(0.2)
    .build();

SimpleLimiter<RequestContext> limiter = SimpleLimiter.newBuilder()
    .limit(limit)
    .build();`
    },
    architecturalInvariant: 'Automatically detects internal service queueing delays before CPU saturation occurs, eliminating the need for fragile manual thread pool sizing.',
    productionOutcomes: {
      'Auto-Sizing Range': '10 to 500 Dynamic In-Flight',
      'Queue Delay Dampening': 'Sub-8ms buffer depth',
      'GC Stall Resilience': 'Zero 504 Gateway Timeouts',
      'Throughput Efficiency': '98.4% max saturation'
    }
  },
  {
    id: 'envoy-outlier-ejection',
    name: 'Envoy Passive Health Checking & Outlier Ejection',
    paradigm: 'Autonomous Upstream Host Eviction Mesh',
    badge: 'Envoy Mesh Outlier',
    targetLatency: '<1ms Local Host Route Ejection',
    blastRadiusContainment: 'Evicts Degraded Pods Before K8s Readiness Probes',
    failureThreshold: '5 Consecutive 5xx Errors in 10s Window',
    recoveryMechanism: 'Progressive Base Ejection Time (30s x Ejection Count)',
    stateMachine: {
      states: [
        {
          name: 'HEALTHY_POOL',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
          description: 'Host serving traffic within standard SLA error budget.',
          behavior: 'Included in active round-robin or least-request load balancing cluster.'
        },
        {
          name: 'EJECTED_ISOLATED',
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
          description: 'Host accumulated 5 consecutive 5xx server errors.',
          behavior: 'Removed from load balancer cluster for base 30s period without dropping connections.'
        },
        {
          name: 'EVALUATING_REENTRY',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
          description: 'Ejection timer elapsed. Host re-enters pool at low load weight.',
          behavior: 'Monitors next 10 requests. If clean, fully restores; if error, doubles ejection duration.'
        }
      ],
      transitions: [
        { from: 'HEALTHY_POOL', to: 'EJECTED_ISOLATED', trigger: '5 consecutive 5xx errors recorded within 10s interval' },
        { from: 'EJECTED_ISOLATED', to: 'EVALUATING_REENTRY', trigger: 'Base ejection sleep of 30,000ms elapses' },
        { from: 'EVALUATING_REENTRY', to: 'HEALTHY_POOL', trigger: 'Host serves consecutive 200 OK responses' },
        { from: 'EVALUATING_REENTRY', to: 'EJECTED_ISOLATED', trigger: 'Single 5xx error observed during reentry trial' }
      ]
    },
    configurationSnippet: {
      language: 'yaml',
      filename: 'envoy-outlier-detection.yaml',
      code: `outlier_detection:
  consecutive_5xx: 5
  interval: 10s
  base_ejection_time: 30s
  max_ejection_percent: 50
  enforcing_consecutive_5xx: 100
  split_external_local_origin_errors: true`
    },
    architecturalInvariant: 'Evicts degraded or memory-leaking container instances in sub-100ms based on live wire HTTP status codes, preventing bad pods from serving traffic before Kubernetes readiness probes notice.',
    productionOutcomes: {
      'Detection Latency': '<100ms from 5th 5xx error',
      'Max Cluster Protection': 'Capped at 50% cluster max',
      'Ejection Base Time': '30s escalating backoff',
      'Client Traffic Shield': '99.99% successful failover'
    }
  }
]
