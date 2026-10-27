export interface TrafficPriorityModel {
  id: string
  name: string
  paradigm: string
  badge: string
  algorithmComplexity: string
  queueOverhead: string
  throughputProfile: string
  latencyGuarantee: string
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

export const TRAFFIC_PRIORITY_MODELS: TrafficPriorityModel[] = [
  {
    id: 'multi-tier-tenant-priority-queue',
    name: 'Multi-Tier Tenant Priority Queuing (VIP vs Free with WFQ Anti-Starvation)',
    paradigm: 'Multi-Level Bounded FIFO with Dynamic Starvation Prevention',
    badge: 'Tenant Priority',
    algorithmComplexity: 'O(1) enqueue / dequeue per tenant class',
    queueOverhead: 'Bounded (Max 10,000 packets per tenant tier buffer)',
    throughputProfile: '65,000 req/sec sustained per ingress edge node',
    latencyGuarantee: 'Tier-1 VIP: P99 < 8.2ms; Tier-3 Free: P99 < 145ms',
    workflowPhases: [
      {
        name: 'INGRESS_CLASSIFICATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Edge gateway inspects JWT tenant claims or API keys and routes incoming packet to Tier-1 VIP, Tier-2 Pro, or Tier-3 Free buffer.',
        invariants: 'Each tier maintains hard memory boundaries to prevent noisy neighbor buffer exhaust.'
      },
      {
        name: 'WEIGHTED_CREDIT_ACCOUNTING',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Scheduler assigns service credits based on subscription weighting (e.g., VIP: 60%, Pro: 30%, Free: 10%).',
        invariants: 'Higher priority queues are serviced first until their quantum is exhausted or buffer is empty.'
      },
      {
        name: 'ANTI_STARVATION_DRAIN',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Virtual deficit counter increments for unserved tiers during sustained VIP bursts, forcing periodic free tier packet drains.',
        invariants: 'Zero starvation guarantee: lowest tier packets never wait longer than maxAgingInterval (250ms).'
      }
    ],
    codeSnippet: {
      language: 'java',
      filename: 'TenantPriorityScheduler.java',
      code: `public class TenantPriorityScheduler {
    private final BoundedQueue<Packet> vipQueue = new BoundedQueue<>(10_000);
    private final BoundedQueue<Packet> proQueue = new BoundedQueue<>(10_000);
    private final BoundedQueue<Packet> freeQueue = new BoundedQueue<>(10_000);

    private int vipCredits = 6;
    private int proCredits = 3;
    private int freeCredits = 1;

    public Packet dequeue() {
        if (vipCredits > 0 && !vipQueue.isEmpty()) {
            vipCredits--;
            return vipQueue.poll();
        }
        if (proCredits > 0 && !proQueue.isEmpty()) {
            proCredits--;
            return proQueue.poll();
        }
        if (!freeQueue.isEmpty()) {
            freeCredits--;
            if (freeCredits <= 0) resetCredits();
            return freeQueue.poll();
        }
        resetCredits();
        return vipQueue.poll();
    }

    private void resetCredits() {
        this.vipCredits = 6;
        this.proCredits = 3;
        this.freeCredits = 1;
    }
}`
    },
    architecturalInvariant: 'Free tier requests can never starve completely; credit accumulators guarantee minimum 10% slice to lowest tier regardless of VIP volume.',
    productionOutcomes: {
      'VIP P99 Latency': '7.4ms (down from 185ms unprioritized)',
      'Starvation Incidents': '0 events across 500M transactions',
      'Noisy Neighbor Isolation': '100% memory bounded buffers',
      'Throughput Efficiency': '99.4% link capacity utilization'
    }
  },
  {
    id: 'weighted-fair-queuing-wfq',
    name: 'Weighted Fair Queuing (WFQ Scheduler with Virtual Finish Times)',
    paradigm: 'Generalized Processor Sharing (GPS) Emulation via Virtual Clock',
    badge: 'WFQ GPS',
    algorithmComplexity: 'O(log K) where K is active flow count',
    queueOverhead: 'Min-heap sorted by virtual finish time F_i',
    throughputProfile: '120,000 packets/sec wire speed per worker core',
    latencyGuarantee: 'Strict bandwidth proportional delay bounds',
    workflowPhases: [
      {
        name: 'VIRTUAL_CLOCK_TICK',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Tracks virtual time V(t) as the monotonic progress of ideal Generalized Processor Sharing (GPS) bit-by-bit round-robin.',
        invariants: 'dV/dt = 1 / sum(weights of all currently active non-empty queues).'
      },
      {
        name: 'FINISH_TIME_TAGGING',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Incoming packet of length L is tagged with virtual finish time F = max(V(arrival), prevF) + (L / weight).',
        invariants: 'Short packets from high-weight flows finish earliest; large bulk packets are appropriately deferred.'
      },
      {
        name: 'MIN_HEAP_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Scheduler pulls packet with minimum virtual finish time from min-heap and transmits across physical interface.',
        invariants: 'Departure order guarantees max delay difference between packet pairs is bounded by maximum packet transmission time.'
      }
    ],
    codeSnippet: {
      language: 'rust',
      filename: 'wfq_scheduler.rs',
      code: `pub struct WfqScheduler {
    virtual_time: f64,
    queues: Vec<FlowQueue>,
    min_heap: BinaryHeap<PacketTag>,
}

impl WfqScheduler {
    pub fn enqueue(&mut self, flow_id: usize, packet: Packet) {
        let weight = self.queues[flow_id].weight;
        let prev_finish = self.queues[flow_id].last_finish_time;
        let start_time = self.virtual_time.max(prev_finish);
        let finish_time = start_time + (packet.len as f64 / weight);

        self.queues[flow_id].last_finish_time = finish_time;
        self.min_heap.push(PacketTag {
            finish_time,
            flow_id,
            packet,
        });
    }

    pub fn dequeue(&mut self) -> Option<Packet> {
        self.min_heap.pop().map(|tag| {
            self.virtual_time = self.virtual_time.max(tag.finish_time);
            tag.packet
        })
    }
}`
    },
    architecturalInvariant: 'Flow bandwidth allocation is strictly proportional to assigned weight wi / sum(wj); packet length normalized to prevent head-of-line blocking.',
    productionOutcomes: {
      'Bandwidth Fairness Index': '0.998 (Jains Fairness Metric)',
      'Head-of-Line Blocking': 'Eliminated across mixed payload sizes',
      'Virtual Time Drift': '< 0.05% relative to real elapsed clock',
      'P99 Scheduling Overhead': '1.2 microseconds per dispatch'
    }
  },
  {
    id: 'controlled-delay-codel-aqm',
    name: 'Controlled Delay (CoDel Active Queue Management)',
    paradigm: 'Bufferbloat Mitigation via Sojourn Time Gradient Evaluation',
    badge: 'CoDel AQM',
    algorithmComplexity: 'O(1) sojourn time timestamp comparison on dequeue',
    queueOverhead: 'Zero per-packet heap overhead; 8-byte dequeue timestamp',
    throughputProfile: '250,000 packets/sec zero-copy ring buffer drain',
    latencyGuarantee: 'Sojourn buffer delay kept under 5ms target threshold',
    workflowPhases: [
      {
        name: 'PACKET_SOJOURN_TRACKING',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Each incoming packet is stamped with arrival time; on dequeue, sojourn time = dequeueTime minus enqueueTime is measured.',
        invariants: 'Measures standing queue delay rather than buffer occupancy in bytes, avoiding false drops during brief microbursts.'
      },
      {
        name: 'INTERVAL_SOAKING_AUDIT',
        color: 'text-blue-400 border-blue-500/40 bg-blue-950/20',
        description: 'Scheduler tracks if minimum sojourn time stays above 5ms target for the entire duration of interval (default 100ms).',
        invariants: 'Entering drop state requires persistent delay over 100ms; single transient spikes reset the timer.'
      },
      {
        name: 'EARLY_DROP_SIGNAL',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'If queue is persistently bloated, CoDel drops packets according to inverse square root schedule: nextDrop = now + interval / sqrt(count).',
        invariants: 'Calculates increasing drop frequency to signal upstream TCP endpoints to back off transmission rates.'
      }
    ],
    codeSnippet: {
      language: 'go',
      filename: 'codel_queue.go',
      code: `type CoDelQueue struct {
    packets       []Packet
    targetDelay   time.Duration // 5ms
    interval      time.Duration // 100ms
    firstAboveTime time.Time
    dropNext      time.Time
    dropCount     int
    dropping      bool
}

func (q *CoDelQueue) Dequeue() (*Packet, bool) {
    if len(q.packets) == 0 {
        q.firstAboveTime = time.Time{}
        return nil, false
    }
    p := q.packets[0]
    q.packets = q.packets[1:]
    sojourn := time.Since(p.EnqueuedAt)

    if sojourn < q.targetDelay {
        q.firstAboveTime = time.Time{}
    } else {
        if q.firstAboveTime.IsZero() {
            q.firstAboveTime = time.Now().Add(q.interval)
        } else if time.Now().After(q.firstAboveTime) {
            // Drop packet to signal TCP sender backoff
            q.dropCount++
            q.dropNext = time.Now().Add(time.Duration(float64(q.interval) / math.Sqrt(float64(q.dropCount))))
            return nil, true // dropped
        }
    }
    return &p, false
}`
    },
    architecturalInvariant: 'Only drops packets when minimum sojourn time stays above 5ms for an entire 100ms interval, differentiating between healthy transient bursts and persistent bufferbloat.',
    productionOutcomes: {
      'Bufferbloat Delay': '4.8ms average sojourn (down from 840ms)',
      'TCP Retransmission Recovery': '4.2x faster window adaptation',
      'Transient Burst Preservation': '100% absorption for bursts < 80ms',
      'Throughput Retention': '98.7% wire capacity sustained'
    }
  },
  {
    id: 'dynamic-surge-token-bucket',
    name: 'Dual-Rate Three-Color Token Bucket (CIR vs PIR with Dynamic Surge)',
    paradigm: 'RFC 2698 Traffic Metering with Committed & Peak Burst Size',
    badge: 'Dual Token Bucket',
    algorithmComplexity: 'O(1) lock-free atomic CAS token delta math',
    queueOverhead: 'Microscopic (2 x 64-bit atomic integers per client key)',
    throughputProfile: '450,000 rate checks/sec per Redis Cluster node',
    latencyGuarantee: 'Sub-0.4ms evaluation via atomic Lua script execution',
    workflowPhases: [
      {
        name: 'REPLENISHMENT_DELTA',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Replenishes tokens dynamically based on elapsed time: Committed Token Bucket (CBS at CIR rate) and Peak Token Bucket (PBS at PIR rate).',
        invariants: 'Tokens are capped at max CBS and max PBS; no background thread or active clock timer required.'
      },
      {
        name: 'BURST_CONFORMANCE_CHECK',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Packet of size B arrives: if B exceeds PBS, packet is marked RED (exceeds peak); if B exceeds CBS, marked YELLOW (conforming peak, non-conforming committed).',
        invariants: 'If B does not exceed CBS, packet is marked GREEN and both buckets are decremented by B.'
      },
      {
        name: 'COLOR_TAGGING_DISPATCH',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Green packets pass unimpeded; Yellow packets pass marked with lower drop precedence; Red packets are dropped immediately or shed to DLQ.',
        invariants: 'Guarantees contract SLA for baseline traffic while tolerating short-lived flash sales within PIR peak limits.'
      }
    ],
    codeSnippet: {
      language: 'lua',
      filename: 'rfc2698_meter.lua',
      code: `local key = KEYS[1]
local now = tonumber(ARGV[1])
local bytes = tonumber(ARGV[2])
local cir = tonumber(ARGV[3]) -- committed info rate (bytes/sec)
local cbs = tonumber(ARGV[4]) -- committed burst size
local pir = tonumber(ARGV[5]) -- peak info rate (bytes/sec)
local pbs = tonumber(ARGV[6]) -- peak burst size

local state = redis.call('HMGET', key, 'tc', 'tp', 'last')
local tc = tonumber(state[1]) or cbs
local tp = tonumber(state[2]) or pbs
local last = tonumber(state[3]) or now

local delta = math.max(0, now - last)
tc = math.min(cbs, tc + delta * cir)
tp = math.min(pbs, tp + delta * pir)

local result = "RED"
if tp >= bytes then
    if tc >= bytes then
        result = "GREEN"
        tc = tc - bytes
        tp = tp - bytes
    else
        result = "YELLOW"
        tp = tp - bytes
    end
end

redis.call('HMSET', key, 'tc', tc, 'tp', tp, 'last', now)
return result`
    },
    architecturalInvariant: 'Allows short-lived bursts up to Peak Information Rate (PIR) without breaching long-term Committed Information Rate (CIR).',
    productionOutcomes: {
      'Traffic Conformance': '99.98% green/yellow pass rate',
      'Flash Sale Surge Resilience': '300% peak burst absorbed safely',
      'Evaluation Latency': '0.32ms P99 across Redis cluster',
      'Drop Precedence Accuracy': '100% deterministic color marking'
    }
  },
  {
    id: 'graceful-load-shedding-backpressure',
    name: 'Graceful Load Shedding with Downstream Backpressure',
    paradigm: 'Adaptive Concurrency Slicing & CPU-Triggered Drop-Tail',
    badge: 'Load Shedding',
    algorithmComplexity: 'O(1) moving average window comparison',
    queueOverhead: 'No queuing; fast fail-open/fail-closed at edge ingress',
    throughputProfile: '500,000 req/sec drop-tail reject throughput',
    latencyGuarantee: 'Instant HTTP 429 in < 1.2ms; shields core workers',
    workflowPhases: [
      {
        name: 'SATURATION_SIGNAL_SAMPLING',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        description: 'Node samples CPU utilization (target 75%), in-flight concurrency count, and downstream database connection pool exhaustion.',
        invariants: 'Shedding triggers proactively before thread pools queue requests, avoiding latency degradation for existing requests.'
      },
      {
        name: 'TENANT_TIER_FILTERING',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Under 80% saturation, shedding drops batch analytics and free tier scrapers; at 90%, drops standard users; VIP transactions are never shed.',
        invariants: 'Priority tiers ensure critical enterprise revenue transactions succeed at full speed during disaster events.'
      },
      {
        name: 'EARLY_REJECTION_EXPIRY',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Rejected requests return HTTP 429 Too Many Requests with standard Retry-After headers computed dynamically from drain velocity.',
        invariants: 'Zero work wasted on doomed requests; shields internal microservices from cascading thread starvation.'
      }
    ],
    codeSnippet: {
      language: 'go',
      filename: 'load_shedder.go',
      code: `type LoadShedder struct {
    cpuThreshold float64 // 0.80
    concurrency  int64
    maxInFlight  int64
}

func (s *LoadShedder) Handle(w http.ResponseWriter, r *http.Request) {
    priority := r.Header.Get("X-Priority-Tier")
    currentCpu := readNodeCpuUsage()

    if currentCpu > s.cpuThreshold {
        if priority != "VIP" {
            w.Header().Set("Retry-After", "5")
            http.Error(w, "Load Shedding: Server Saturated", http.StatusTooManyRequests)
            return
        }
    }

    atomic.AddInt64(&s.concurrency, 1)
    defer atomic.AddInt64(&s.concurrency, -1)
    serveRequest(w, r)
}`
    },
    architecturalInvariant: 'Ingress drops lowest-priority traffic early before internal service thread pools and database connection pools become saturated.',
    productionOutcomes: {
      'Core Service Availability': '100% uptime during 10x traffic spikes',
      'Thread Pool Saturation': 'Maintained < 70% under peak load',
      'Fast-Fail Response Time': '1.1ms rejection latency for dropped traffic',
      'Cascading Outage Risk': 'Zero downstream connection pool exhaustion'
    }
  }
]
