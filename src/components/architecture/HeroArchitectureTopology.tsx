import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  ShieldCheck, 
  Radio, 
  Database, 
  Server, 
  Cpu, 
  Activity, 
  RotateCcw,
  AlertCircle
} from 'lucide-react'

type TopologyNodeId = 'edge' | 'gateway' | 'compute' | 'kafka' | 'storage'

interface TopologyNode {
  id: TopologyNodeId
  title: string
  subtitle: string
  tech: string
  x: number
  y: number
  icon: any
  color: string
  badge: string
  details: {
    protocol: string
    latency: string
    throughput: string
    resilience: string
    spec: string
  }
}

const NODES: Record<TopologyNodeId, TopologyNode> = {
  edge: {
    id: 'edge',
    title: 'Cloudflare / Edge CDN',
    subtitle: 'Global Ingress & WAF',
    tech: 'Anycast DNS + SWR Cache',
    x: 65,
    y: 155,
    icon: ShieldCheck,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
    badge: '320+ PoPs',
    details: {
      protocol: 'HTTP/3 over QUIC + TLS 1.3',
      latency: '<12ms Global Edge P95',
      throughput: '100,000+ RPS Burst Shield',
      resilience: 'DDoS L7 Scrubbing + Auto-Failover',
      spec: 'RFC 5861 Stale-While-Revalidate with Surrogate-Key invalidation in sub-150ms'
    }
  },
  gateway: {
    id: 'gateway',
    title: 'Envoy API Gateway',
    subtitle: 'Zero-Trust Ingress Mesh',
    tech: 'mTLS SPIFFE + Token Bucket',
    x: 185,
    y: 155,
    icon: Server,
    color: 'text-blue-400 border-blue-500/40 bg-blue-950/30',
    badge: 'mTLS Mesh',
    details: {
      protocol: 'gRPC-Web / HTTP/2 Ingress',
      latency: '1.2ms Proxy Filter Overhead',
      throughput: '25,000 req/s per Envoy Node',
      resilience: 'Circuit Breaker + Rate Limiter Lua',
      spec: 'JWT RS256 tenant claims injection into downstream headers with zero DB roundtrips'
    }
  },
  compute: {
    id: 'compute',
    title: 'Spring Boot 3 Core',
    subtitle: 'Virtual Threads (Project Loom)',
    tech: 'Java 21 LTS + Clean Architecture',
    x: 325,
    y: 85,
    icon: Cpu,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    badge: 'Virtual Threads',
    details: {
      protocol: 'Domain-Driven Hexagonal Ports',
      latency: '18ms P99 Service Execution',
      throughput: '10,000+ Concurrent Virtual Threads',
      resilience: 'Resilience4j Bulkhead + Outbox CDC',
      spec: 'Non-blocking carrier threads processing 10k requests concurrently with 1GB RAM ceiling'
    }
  },
  kafka: {
    id: 'kafka',
    title: 'Apache Kafka Event Mesh',
    subtitle: 'Distributed Event Streaming',
    tech: 'Partition ISR Quorum (ISR=3)',
    x: 325,
    y: 225,
    icon: Radio,
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
    badge: 'ISR=3 Zero Lag',
    details: {
      protocol: 'Kafka Binary Protocol v3 (KRaft)',
      latency: '<3ms Produce-to-Consume Lag',
      throughput: '15,000 TPS Transactional Outbox',
      resilience: 'acks=all + Idempotent Producer',
      spec: 'Saga compensation events and append-only audit trail with zero message loss guarantee'
    }
  },
  storage: {
    id: 'storage',
    title: 'Aurora Global & Redis',
    subtitle: 'Multi-Region Sharded DB',
    tech: 'PostgreSQL RLS + Redis Ring',
    x: 475,
    y: 155,
    icon: Database,
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
    badge: 'Active-Active',
    details: {
      protocol: 'PgBouncer + Redis Consistent Ring',
      latency: '<2ms Redis L2 / 8ms Aurora Read',
      throughput: '50,000 Read IOPS / 12,000 Write IOPS',
      resilience: 'Active-Active Multi-AZ Storage',
      spec: 'Row-Level Security multi-tenancy with consistent hashing ring across 150 virtual nodes'
    }
  }
}

export default function HeroArchitectureTopology() {
  const [activeNodeId, setActiveNodeId] = useState<TopologyNodeId>('compute')
  const [trafficBurst, setTrafficBurst] = useState(false)
  const [failoverActive, setFailoverActive] = useState(false)

  const activeNode = NODES[activeNodeId]

  const triggerTrafficBurst = () => {
    setTrafficBurst(prev => !prev)
  }

  const triggerFailoverSimulation = () => {
    setFailoverActive(true)
    setTimeout(() => {
      setFailoverActive(false)
    }, 4500)
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#070b14] select-none">
      {/* Top Controls Bar: Simulation Triggers & Status */}
      <div className="px-3 sm:px-4 py-2 bg-[#090f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold tracking-tight">Active Topology:</span>
          <span className="text-emerald-300 font-mono text-[11px]">AWS Multi-AZ Mesh</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTrafficBurst}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              trafficBurst
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
            aria-label="Toggle 10K RPS Traffic Burst"
          >
            <Zap className={`w-3 h-3 ${trafficBurst ? 'text-purple-400 animate-bounce' : 'text-slate-400'}`} />
            <span>{trafficBurst ? '10K RPS Burst: ACTIVE' : 'Inject 10K RPS'}</span>
          </button>

          <button
            onClick={triggerFailoverSimulation}
            disabled={failoverActive}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              failoverActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
            aria-label="Simulate Multi-AZ Failover"
          >
            <RotateCcw className={`w-3 h-3 ${failoverActive ? 'animate-spin text-rose-400' : 'text-slate-400'}`} />
            <span>{failoverActive ? 'Failover: RTO < 11.8s' : 'Test Failover'}</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Diagram Canvas */}
      <div className="relative w-full overflow-hidden bg-[#050811] p-2 sm:p-3 flex items-center justify-center">
        {/* Failover Simulation Alert Banner */}
        {failoverActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 left-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>[SIMULATING AZ BLACKHOLE] US-East-1a down. Rerouting traffic to US-East-1b...</span>
            </div>
            <span className="text-emerald-400 font-bold tabular-nums">0 DROPPED REQUESTS</span>
          </motion.div>
        )}

        <svg 
          viewBox="0 0 540 280" 
          className="w-full h-auto max-h-[260px] sm:max-h-[300px]"
          aria-label="Interactive Distributed System Architecture Topology"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="edgeToGw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gwToApp" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gwToKafka" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="appToDb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="kafkaToDb" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Connection Lines (Wires) */}
          <g strokeWidth={trafficBurst ? "2.5" : "1.8"} strokeDasharray={trafficBurst ? "4,4" : "none"} className={trafficBurst ? "animate-pulse" : ""}>
            {/* Edge -> Gateway */}
            <line x1={NODES.edge.x + 40} y1={NODES.edge.y} x2={NODES.gateway.x - 40} y2={NODES.gateway.y} stroke="url(#edgeToGw)" />
            
            {/* Gateway -> Compute (App) */}
            <path d={`M ${NODES.gateway.x + 40} ${NODES.gateway.y} Q 250 85 ${NODES.compute.x - 45} ${NODES.compute.y}`} fill="none" stroke="url(#gwToApp)" />
            
            {/* Gateway -> Kafka */}
            <path d={`M ${NODES.gateway.x + 40} ${NODES.gateway.y} Q 250 225 ${NODES.kafka.x - 45} ${NODES.kafka.y}`} fill="none" stroke="url(#gwToKafka)" />
            
            {/* Compute -> DB Storage */}
            <path d={`M ${NODES.compute.x + 45} ${NODES.compute.y} Q 405 85 ${NODES.storage.x - 45} ${NODES.storage.y}`} fill="none" stroke="url(#appToDb)" />
            
            {/* Kafka -> DB Storage */}
            <path d={`M ${NODES.kafka.x + 45} ${NODES.kafka.y} Q 405 225 ${NODES.storage.x - 45} ${NODES.storage.y}`} fill="none" stroke="url(#kafkaToDb)" />

            {/* Bidirectional sync between Compute and Kafka */}
            <line x1={NODES.compute.x} y1={NODES.compute.y + 35} x2={NODES.kafka.x} y2={NODES.kafka.y - 35} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3,3" />
          </g>

          {/* Animated Traffic Particles */}
          <circle r={trafficBurst ? "4.5" : "3.5"} fill="#22d3ee">
            <animateMotion 
              path={`M ${NODES.edge.x + 40} ${NODES.edge.y} L ${NODES.gateway.x - 40} ${NODES.gateway.y}`} 
              dur={trafficBurst ? "0.6s" : "1.8s"} 
              repeatCount="indefinite" 
            />
          </circle>

          <circle r={trafficBurst ? "4.5" : "3.5"} fill="#34d399">
            <animateMotion 
              path={`M ${NODES.gateway.x + 40} ${NODES.gateway.y} Q 250 85 ${NODES.compute.x - 45} ${NODES.compute.y}`} 
              dur={trafficBurst ? "0.7s" : "2.0s"} 
              repeatCount="indefinite" 
            />
          </circle>

          <circle r={trafficBurst ? "4.5" : "3.5"} fill="#c084fc">
            <animateMotion 
              path={`M ${NODES.gateway.x + 40} ${NODES.gateway.y} Q 250 225 ${NODES.kafka.x - 45} ${NODES.kafka.y}`} 
              dur={trafficBurst ? "0.8s" : "2.2s"} 
              repeatCount="indefinite" 
            />
          </circle>

          <circle r={trafficBurst ? "4.5" : "3.5"} fill="#fbbf24">
            <animateMotion 
              path={`M ${NODES.compute.x + 45} ${NODES.compute.y} Q 405 85 ${NODES.storage.x - 45} ${NODES.storage.y}`} 
              dur={trafficBurst ? "0.7s" : "2.1s"} 
              repeatCount="indefinite" 
            />
          </circle>

          {/* Interactive Topology Nodes (SVG Rects & HTML Overlays) */}
          {(Object.keys(NODES) as TopologyNodeId[]).map((nodeId) => {
            const node = NODES[nodeId]
            const isSelected = activeNodeId === nodeId

            return (
              <g 
                key={node.id} 
                className="cursor-pointer group"
                onClick={() => setActiveNodeId(node.id)}
              >
                {/* Node Glow on Selection */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="46"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    className="animate-spin-slow opacity-80"
                  />
                )}

                {/* Base Card Rect */}
                <rect
                  x={node.x - 42}
                  y={node.y - 32}
                  width="84"
                  height="64"
                  rx="10"
                  fill="#0b1324"
                  stroke={isSelected ? '#34d399' : '#1e293b'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  className="transition-colors group-hover:stroke-slate-500"
                />

                {/* Status Dot */}
                <circle
                  cx={node.x + 32}
                  cy={node.y - 22}
                  r="3.5"
                  fill={failoverActive && nodeId === 'compute' ? '#f43f5e' : '#10b981'}
                />

                {/* Text Labels inside Node */}
                <text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.title.split('/')[0].trim().slice(0, 11)}
                </text>

                <text
                  x={node.x}
                  y={node.y + 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {node.badge}
                </text>

                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {nodeId === 'compute' && trafficBurst ? '10K RPS' : node.details.latency.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Node Telemetry & Specification Card */}
      <div className="p-3 sm:p-4 bg-[#080d19] border-t border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <activeNode.icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-white font-bold text-xs sm:text-sm">{activeNode.title}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-emerald-300 text-[11px] font-sans">{activeNode.subtitle}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Architecture:</span>
            <span className="text-cyan-300 font-semibold">{activeNode.tech}</span>
          </div>
        </div>

        {/* 4 Invariant Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5 text-[10px] sm:text-[11px]">
          <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Protocol</span>
            <span className="text-slate-200 font-semibold truncate block">{activeNode.details.protocol}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Target Latency</span>
            <span className="text-cyan-300 font-bold tabular-nums block">{activeNode.details.latency}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Peak Throughput</span>
            <span className="text-purple-300 font-bold tabular-nums block">
              {trafficBurst && activeNodeId === 'compute' ? '10,480 RPS (Burst)' : activeNode.details.throughput}
            </span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">High Availability</span>
            <span className="text-emerald-300 font-bold block">{activeNode.details.resilience}</span>
          </div>
        </div>

        {/* Deep Architecture Invariant Spec */}
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-snug font-sans">
            <strong className="text-white font-mono font-semibold">Architectural Invariant: </strong>
            {activeNode.details.spec}
          </p>
        </div>
      </div>
    </div>
  )
}
