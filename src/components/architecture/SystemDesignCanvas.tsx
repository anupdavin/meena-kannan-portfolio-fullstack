import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  AlertTriangle, 
  X, 
  Maximize2,
  CheckCircle2,
  Download,
  Copy
} from 'lucide-react'
import ArchNode from './ArchNode'
import type { ArchNodeData } from './ArchNode'
import AnimatedConnection from './AnimatedConnection'
import type { PacketType } from './AnimatedConnection'

export interface SubsystemBox {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  accentColor?: string
}

export interface ConnectionDef {
  id: string
  fromNodeId: string
  toNodeId: string
  pathD: string
  packetType: PacketType
  activeInSteps: number[]
  calloutBadge?: string
  calloutPos?: { x: number; y: number }
  label?: string
}

export interface StepDefinition {
  stepNumber: number
  title: string
  activeNodeIds: string[]
  activeConnectionIds: string[]
  packetType: PacketType
  calloutBadge: string
  payloadTag: string
  latencyEst: string
  detailedExplanation: string
  impactMetric: string
}

export interface ChaosScenarioDef {
  id: string
  name: string
  affectedNodeId: string
  triggerStep: number
  scenarioDescription: string
  resilientOutcome: string
  recoveryBadge: string
}

export interface SystemDesignCanvasProps {
  systemId?: string
  title?: string
  tagline?: string
  subsystems?: SubsystemBox[]
  nodes?: ArchNodeData[]
  connections?: ConnectionDef[]
  steps?: StepDefinition[]
  chaosScenarios?: ChaosScenarioDef[]
  variant?: 'preview' | 'workbench'
  onOpenWorkbench?: () => void
  onSelectSystem?: (id: string) => void
  currentSystemId?: string
}

// Default standard ByteByteGo enterprise architecture topology if not overridden
const DEFAULT_SUBSYSTEMS: SubsystemBox[] = [
  {
    id: 'subsystem-edge',
    label: 'EDGE & INGRESS ZONE',
    x: 25,
    y: 110,
    width: 230,
    height: 490,
    accentColor: '#38BDF8'
  },
  {
    id: 'subsystem-vpc',
    label: 'VPC / PRIVATE SUBNET (DMZ)',
    x: 285,
    y: 110,
    width: 230,
    height: 490,
    accentColor: '#10B981'
  },
  {
    id: 'subsystem-compute',
    label: 'MICROSERVICE & WORKER CLUSTER',
    x: 545,
    y: 50,
    width: 260,
    height: 550,
    accentColor: '#F59E0B'
  },
  {
    id: 'subsystem-persistence',
    label: 'DATA PERSISTENCE LAYER',
    x: 835,
    y: 50,
    width: 335,
    height: 550,
    accentColor: '#A855F7'
  }
]

const DEFAULT_NODES: ArchNodeData[] = [
  {
    id: 'client',
    label: 'Client / Mobile',
    sublabel: 'Enterprise SPA / iOS App',
    role: 'Client & Presentation Layer',
    category: 'client',
    x: 50,
    y: 170,
    width: 180,
    height: 95,
    color: 'cyan',
    iconType: 'client',
    protocol: 'HTTPS / TLS 1.3',
    latencyBadge: '< 15ms',
    techBadge: 'React 19 + iOS',
    metricValue: 'P99 < 65ms',
    specs: {
      technology: 'React 19 SPA, TypeScript, Vite, Swift Native Client',
      concurrencyModel: 'Concurrent Mode, Optimistic Mutations, Virtualized Render Lists',
      resiliencePattern: 'Token refresh retry loop with jittered exponential backoff',
      targetSla: '99.99% Availability',
      deepDive: 'Sends signed JWT bearer requests with distributed tenant context headers.'
    }
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare CDN',
    sublabel: 'Edge Cache & Anycast',
    role: 'Global Edge Ingress & DDoS Defense',
    category: 'edge',
    x: 50,
    y: 390,
    width: 180,
    height: 95,
    color: 'cyan',
    iconType: 'cloudflare',
    protocol: 'HTTP/3 / Anycast',
    latencyBadge: '~12ms',
    techBadge: 'Cloudflare Enterprise',
    metricValue: '300+ PoPs Globally',
    specs: {
      technology: 'Anycast DNS, Edge Workers, Cloudflare Argo Smart Routing',
      concurrencyModel: 'Event-driven distributed edge compute engine',
      resiliencePattern: 'Automatic BGP rerouting around transit provider outages',
      targetSla: '100% Edge Uptime',
      deepDive: 'Shields backend origin from volumetric layer 3/4/7 DDoS attacks and serves cached assets.'
    }
  },
  {
    id: 'gateway',
    label: 'API Gateway',
    sublabel: 'Spring Cloud Gateway / Envoy',
    role: 'Unified Ingress, Auth & Rate Limiting',
    category: 'gateway',
    x: 310,
    y: 170,
    width: 180,
    height: 95,
    color: 'emerald',
    iconType: 'gateway',
    protocol: 'HTTP/2 / OAuth2',
    latencyBadge: '~2ms',
    techBadge: 'Envoy / Spring Cloud',
    metricValue: '100K Req/sec',
    specs: {
      technology: 'Spring Cloud Gateway, Netty Non-Blocking IO, Envoy Proxy',
      concurrencyModel: 'Reactor Pattern, Epoll Event Loop, zero-copy packet proxying',
      resiliencePattern: 'Redis-backed distributed token bucket rate limiter (429 Too Many Requests)',
      targetSla: '99.999% Availability',
      deepDive: 'Validates cryptographic RS256 JWT claims, strips untrusted headers, and injects tenant ID.'
    }
  },
  {
    id: 'nginx',
    label: 'Load Balancer (Nginx)',
    sublabel: 'L7 Reverse Proxy & SSL Term',
    role: 'Traffic Distribution & Health Checks',
    category: 'lb',
    x: 310,
    y: 390,
    width: 180,
    height: 95,
    color: 'emerald',
    iconType: 'nginx',
    protocol: 'gRPC / TCP',
    latencyBadge: '< 1ms',
    techBadge: 'Nginx Enterprise / HAProxy',
    metricValue: 'Sub-millisecond LB',
    specs: {
      technology: 'Nginx L7 Reverse Proxy, Consistent Hash Ring',
      concurrencyModel: 'Asynchronous event-driven master-worker architecture',
      resiliencePattern: 'Active keepalive HTTP health checks with automated circuit tripping',
      targetSla: '99.999% SLA',
      deepDive: 'Distributes traffic across downstream Spring Boot microservice instances with zero drop.'
    }
  },
  {
    id: 'services',
    label: 'Microservices (Java 21)',
    sublabel: 'Spring Boot 3 Core Services',
    role: 'Domain Business Logic & Clean Architecture',
    category: 'compute',
    x: 575,
    y: 90,
    width: 200,
    height: 105,
    color: 'emerald',
    iconType: 'microservices',
    protocol: 'gRPC / Virtual Threads',
    latencyBadge: '~4ms',
    techBadge: 'Java 21 + Spring Boot 3',
    metricValue: 'Virtual Thread Pool',
    specs: {
      technology: 'Java 21 LTS, Spring Boot 3.3, Project Loom Virtual Threads',
      concurrencyModel: 'Lightweight Virtual Threads (Millions of concurrent tasks without memory overhead)',
      resiliencePattern: 'Resilience4j CircuitBreaker, RateLimiter, Bulkhead, and Retry',
      targetSla: '99.99% Availability',
      deepDive: 'Executes pure domain entities isolated from persistence via dependency inversion ports.'
    }
  },
  {
    id: 'kafka',
    label: 'Message Broker (Kafka)',
    sublabel: 'Distributed Log & Event Stream',
    role: 'Asynchronous Pub/Sub & Event-Driven Backbone',
    category: 'event',
    x: 575,
    y: 270,
    width: 200,
    height: 105,
    color: 'amber',
    iconType: 'kafka',
    protocol: 'Kafka Binary / TCP',
    latencyBadge: '~3ms',
    techBadge: 'Apache Kafka 3.7 + KRaft',
    metricValue: '1M+ Msgs/sec',
    specs: {
      technology: 'Apache Kafka with KRaft consensus, partitioned replicated commit log',
      concurrencyModel: 'Zero-copy sendfile kernel disk-to-network transfer',
      resiliencePattern: 'At-least-once delivery, min.insync.replicas=2, transactional producer idempotence',
      targetSla: '99.999% Event Durability',
      deepDive: 'Decouples core transactional workflows from downstream consumers with outbox pattern.'
    }
  },
  {
    id: 'worker',
    label: 'Async Worker / Consumer',
    sublabel: 'Event Processing & Search Sync',
    role: 'Background Task Execution & CQRS Projection',
    category: 'compute',
    x: 575,
    y: 450,
    width: 200,
    height: 105,
    color: 'amber',
    iconType: 'cpu',
    protocol: 'Async / Batch Poll',
    latencyBadge: '~5ms',
    techBadge: 'Spring Cloud Stream Workers',
    metricValue: 'Dead-Letter-Queue Protected',
    specs: {
      technology: 'Spring Cloud Stream, Kafka Consumer Groups, Elasticsearch Indexer',
      concurrencyModel: 'Multi-threaded partitioned consumer groups with backpressure throttling',
      resiliencePattern: 'Exponential backoff retry with automatic Dead Letter Queue (DLQ) routing',
      targetSla: 'Near real-time sync',
      deepDive: 'Consumes committed Kafka events and updates read projections and search indexes.'
    }
  },
  {
    id: 'cache',
    label: 'Cache (Redis Cluster)',
    sublabel: 'In-Memory Key-Value & Sessions',
    role: 'Sub-Millisecond Read Accelerator & Locks',
    category: 'cache',
    x: 870,
    y: 90,
    width: 265,
    height: 105,
    color: 'emerald',
    iconType: 'redis',
    protocol: 'RESP / TCP',
    latencyBadge: '< 1ms',
    techBadge: 'Redis 7.2 Cluster (6 Nodes)',
    metricValue: 'P99.9 < 1.2ms',
    specs: {
      technology: 'Redis 7.2 Cluster with 16,384 hash slots across primary/replica shards',
      concurrencyModel: 'Single-threaded event loop per shard with multiplexed non-blocking IO',
      resiliencePattern: 'Cache-aside pattern with probabilistic early expiration to avoid thundering herds',
      targetSla: '99.999% Low Latency',
      deepDive: 'Provides ultra-fast session validation, query memoization, and Redlock distributed locks.'
    }
  },
  {
    id: 'db-primary',
    label: 'PostgreSQL Primary (Write Master)',
    sublabel: 'ACID Transactions & Master Ledger',
    role: 'Authoritative Relational Master Store',
    category: 'database',
    x: 870,
    y: 270,
    width: 265,
    height: 105,
    color: 'purple',
    iconType: 'postgres',
    protocol: 'JDBC / TLS',
    latencyBadge: '~8ms',
    techBadge: 'PostgreSQL 16 + Flyway',
    metricValue: 'ACID Master / HikariCP',
    specs: {
      technology: 'PostgreSQL 16, Multi-AZ High Availability RDS / Patroni Cluster',
      concurrencyModel: 'Multiversion Concurrency Control (MVCC) with Read Committed isolation',
      resiliencePattern: 'Automated 30-second failover with synchronous WAL standby promotion',
      targetSla: '99.999% Durability',
      deepDive: 'Guarantees strict ACID consistency for user orders, payments, and multi-tenant billing.'
    }
  },
  {
    id: 'db-replicas',
    label: 'PostgreSQL Read Replicas',
    sublabel: 'Horizontal Read Scale & Analytics',
    role: 'Read Traffic Offloading & Streaming WAL',
    category: 'database',
    x: 870,
    y: 450,
    width: 265,
    height: 105,
    color: 'purple',
    iconType: 'database',
    protocol: 'Streaming WAL / Async',
    latencyBadge: '< 3ms Lag',
    techBadge: '3x Read Replicas (HA)',
    metricValue: 'Auto-Scaling Read Pool',
    specs: {
      technology: 'PostgreSQL Streaming Replication, PgBouncer Connection Pooling',
      concurrencyModel: 'Read-only concurrent query scaling with replica load balancing',
      resiliencePattern: 'Lag-aware routing: routes to primary if replica lag exceeds 100ms threshold',
      targetSla: 'Horizontal Read Scale',
      deepDive: 'Offloads complex analytical queries, reporting, and customer catalog lookups.'
    }
  }
]

// Orthogonal connections with right-angle routing and rounded 8px corners
const DEFAULT_CONNECTIONS: ConnectionDef[] = [
  {
    id: 'conn-client-cdn',
    fromNodeId: 'client',
    toNodeId: 'cloudflare',
    pathD: 'M 140 265 L 140 390',
    packetType: 'cyan',
    activeInSteps: [1],
    calloutBadge: '①',
    calloutPos: { x: 140, y: 327 },
    label: 'HTTPS'
  },
  {
    id: 'conn-cdn-gateway',
    fromNodeId: 'cloudflare',
    toNodeId: 'gateway',
    pathD: 'M 230 437 L 262 437 Q 270 437 270 429 L 270 225 Q 270 217 278 217 L 310 217',
    packetType: 'cyan',
    activeInSteps: [1],
    calloutBadge: '①',
    calloutPos: { x: 270, y: 327 },
    label: 'Origin Ingress'
  },
  {
    id: 'conn-client-gateway',
    fromNodeId: 'client',
    toNodeId: 'gateway',
    pathD: 'M 230 217 L 310 217',
    packetType: 'cyan',
    activeInSteps: [1, 6],
    calloutBadge: '①',
    calloutPos: { x: 270, y: 217 },
    label: 'API Direct'
  },
  {
    id: 'conn-gateway-cache',
    fromNodeId: 'gateway',
    toNodeId: 'cache',
    pathD: 'M 400 170 L 400 73 Q 400 65 408 65 L 994 65 Q 1002 65 1002 73 L 1002 90',
    packetType: 'emerald',
    activeInSteps: [2],
    calloutBadge: '②',
    calloutPos: { x: 700, y: 65 },
    label: 'Cache Check'
  },
  {
    id: 'conn-gateway-lb',
    fromNodeId: 'gateway',
    toNodeId: 'nginx',
    pathD: 'M 400 265 L 400 390',
    packetType: 'cyan',
    activeInSteps: [2],
    calloutBadge: '②',
    calloutPos: { x: 400, y: 327 },
    label: 'Forward'
  },
  {
    id: 'conn-lb-services',
    fromNodeId: 'nginx',
    toNodeId: 'services',
    pathD: 'M 490 437 L 527 437 Q 535 437 535 429 L 535 150 Q 535 142 543 142 L 575 142',
    packetType: 'cyan',
    activeInSteps: [3],
    calloutBadge: '③',
    calloutPos: { x: 535, y: 290 },
    label: 'gRPC Dispatch'
  },
  {
    id: 'conn-services-cache',
    fromNodeId: 'services',
    toNodeId: 'cache',
    pathD: 'M 775 142 L 870 142',
    packetType: 'emerald',
    activeInSteps: [2, 5],
    calloutBadge: '②',
    calloutPos: { x: 822, y: 142 },
    label: 'Cache Aside'
  },
  {
    id: 'conn-services-db',
    fromNodeId: 'services',
    toNodeId: 'db-primary',
    pathD: 'M 775 165 L 817 165 Q 825 165 825 173 L 825 314 Q 825 322 833 322 L 870 322',
    packetType: 'purple',
    activeInSteps: [3],
    calloutBadge: '③',
    calloutPos: { x: 825, y: 243 },
    label: 'ACID Write'
  },
  {
    id: 'conn-services-kafka',
    fromNodeId: 'services',
    toNodeId: 'kafka',
    pathD: 'M 675 195 L 675 270',
    packetType: 'amber',
    activeInSteps: [4],
    calloutBadge: '④',
    calloutPos: { x: 675, y: 232 },
    label: 'Pub Event'
  },
  {
    id: 'conn-kafka-worker',
    fromNodeId: 'kafka',
    toNodeId: 'worker',
    pathD: 'M 675 375 L 675 450',
    packetType: 'amber',
    activeInSteps: [5],
    calloutBadge: '⑤',
    calloutPos: { x: 675, y: 412 },
    label: 'Consume'
  },
  {
    id: 'conn-db-replicas',
    fromNodeId: 'db-primary',
    toNodeId: 'db-replicas',
    pathD: 'M 1002 375 L 1002 450',
    packetType: 'purple',
    activeInSteps: [5],
    calloutBadge: '⑤',
    calloutPos: { x: 1002, y: 412 },
    label: 'WAL Sync'
  },
  {
    id: 'conn-worker-replicas',
    fromNodeId: 'worker',
    toNodeId: 'db-replicas',
    pathD: 'M 775 502 L 870 502',
    packetType: 'purple',
    activeInSteps: [5],
    calloutBadge: '⑤',
    calloutPos: { x: 822, y: 502 },
    label: 'Index Update'
  },
  {
    id: 'conn-response-flow',
    fromNodeId: 'services',
    toNodeId: 'client',
    pathD: 'M 575 120 L 498 120 Q 490 120 490 128 L 490 209 Q 490 217 482 217 L 310 217',
    packetType: 'emerald',
    activeInSteps: [6],
    calloutBadge: '⑥',
    calloutPos: { x: 490, y: 168 },
    label: '200 OK Fast'
  }
]

const DEFAULT_STEPS: StepDefinition[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Client Request & Edge Ingress',
    activeNodeIds: ['client', 'cloudflare', 'gateway'],
    activeConnectionIds: ['conn-client-cdn', 'conn-cdn-gateway', 'conn-client-gateway'],
    packetType: 'cyan',
    calloutBadge: '①',
    payloadTag: 'GET /api/v1/workspaces [Bearer JWT + TenantId]',
    latencyEst: '~12ms TTFB',
    detailedExplanation: 'Client sends an authenticated request over TLS 1.3. Cloudflare verifies edge DDoS signatures, mitigates bot attacks, and forwards dynamic traffic directly to API Gateway.',
    impactMetric: 'Zero Cold-Start / Edge TLS Termination'
  },
  {
    stepNumber: 2,
    title: 'Step 2: Gateway Auth & Redis Cache Evaluation',
    activeNodeIds: ['gateway', 'cache', 'nginx'],
    activeConnectionIds: ['conn-gateway-cache', 'conn-gateway-lb'],
    packetType: 'emerald',
    calloutBadge: '②',
    payloadTag: 'CACHE_LOOKUP: key=tenant:482:ws_list [TTL=300s]',
    latencyEst: '~1ms Sub-ms',
    detailedExplanation: 'API Gateway authenticates the JWT cryptographic signature, evaluates token-bucket rate limits, and queries Redis Cluster. On cache miss, traffic is routed to Nginx load balancer.',
    impactMetric: 'P99.9 < 1.2ms Session Check'
  },
  {
    stepNumber: 3,
    title: 'Step 3: Core Service Execution & Master DB Write',
    activeNodeIds: ['nginx', 'services', 'db-primary'],
    activeConnectionIds: ['conn-lb-services', 'conn-services-db'],
    packetType: 'purple',
    calloutBadge: '③',
    payloadTag: 'TX_BEGIN: INSERT INTO workspace_events (...) COMMIT;',
    latencyEst: '~8ms ACID Commit',
    detailedExplanation: 'Nginx round-robins traffic to Spring Boot 3 microservices running on Java 21 Virtual Threads. The service commits an ACID transaction to PostgreSQL Primary and registers an Outbox record.',
    impactMetric: 'Strict ACID Multi-Tenant Isolation'
  },
  {
    stepNumber: 4,
    title: 'Step 4: Asynchronous Kafka Event Publishing',
    activeNodeIds: ['services', 'kafka'],
    activeConnectionIds: ['conn-services-kafka'],
    packetType: 'amber',
    calloutBadge: '④',
    payloadTag: 'TOPIC: tenant.events.v1 [Partition=3, acks=all]',
    latencyEst: '~3ms Async Log',
    detailedExplanation: 'The microservice dispatches an immutable domain event to the Apache Kafka cluster using transactional idempotent producer guarantees (acks=all, min.insync.replicas=2).',
    impactMetric: 'Zero Synchronous Downstream Block'
  },
  {
    stepNumber: 5,
    title: 'Step 5: Worker Consumption & Replica WAL Sync',
    activeNodeIds: ['kafka', 'worker', 'db-replicas', 'db-primary'],
    activeConnectionIds: ['conn-kafka-worker', 'conn-worker-replicas', 'conn-db-replicas'],
    packetType: 'purple',
    calloutBadge: '⑤',
    payloadTag: 'STREAM_CONSUME: offset=948291 -> Update Read View',
    latencyEst: '~4ms Replica Sync',
    detailedExplanation: 'Async worker groups consume partition messages from Kafka, update CQRS read projections in Read Replicas, and synchronize search indexes while PostgreSQL streams write-ahead logs (WAL).',
    impactMetric: 'Eventual Consistency in < 50ms'
  },
  {
    stepNumber: 6,
    title: 'Step 6: Replica Sync & 200 OK Fast Response',
    activeNodeIds: ['services', 'gateway', 'client'],
    activeConnectionIds: ['conn-response-flow', 'conn-client-gateway'],
    packetType: 'emerald',
    calloutBadge: '⑥',
    payloadTag: 'HTTP/2 200 OK [Content-Type: application/json, 1.4KB]',
    latencyEst: 'Total P99 < 65ms',
    detailedExplanation: 'With the transaction committed and event published, the microservice streams the response back through API Gateway to the Client, concluding the low-latency roundtrip.',
    impactMetric: 'Roundtrip Complete in 62ms'
  }
]

const DEFAULT_CHAOS: ChaosScenarioDef[] = [
  {
    id: 'chaos-cache-drop',
    name: 'Redis Shard Outage',
    affectedNodeId: 'cache',
    triggerStep: 2,
    scenarioDescription: 'Simulates primary Redis cache partition drop during peak 15,000 req/s load.',
    resilientOutcome: 'Probabilistic cache fallback routes safely to DB replicas without thundering herd crash.',
    recoveryBadge: 'Circuit Breaker Open -> Graceful Fallback'
  },
  {
    id: 'chaos-db-failover',
    name: 'Postgres Primary Failover',
    affectedNodeId: 'db-primary',
    triggerStep: 3,
    scenarioDescription: 'Simulates hardware crash on PostgreSQL Primary write master node.',
    resilientOutcome: 'Patroni initiates 30-sec promotion of synchronous standby replica with zero data loss.',
    recoveryBadge: 'Zero Data Loss WAL Promotion'
  },
  {
    id: 'chaos-kafka-backpressure',
    name: 'Kafka Consumer Lag Spike',
    affectedNodeId: 'kafka',
    triggerStep: 4,
    scenarioDescription: 'Simulates worker pool pause causing consumer offset lag to surge past 50,000 messages.',
    resilientOutcome: 'Kafka partitioned buffer absorbs traffic; workers spin up reactive threads with backpressure.',
    recoveryBadge: 'Backpressure Absorbed by Partition Buffer'
  }
]

export const SystemDesignCanvas: React.FC<SystemDesignCanvasProps> = ({
  systemId = 'saas-platform',
  title = 'Enterprise Multi-Tenant SaaS Architecture',
  tagline = 'ByteByteGo Interactive Coordinate Architecture with Live Packet Routing',
  subsystems = DEFAULT_SUBSYSTEMS,
  nodes = DEFAULT_NODES,
  connections = DEFAULT_CONNECTIONS,
  steps = DEFAULT_STEPS,
  chaosScenarios = DEFAULT_CHAOS,
  variant = 'workbench',
  onOpenWorkbench,
  onSelectSystem,
  currentSystemId
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(variant === 'preview')
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [inspectedNode, setInspectedNode] = useState<ArchNodeData | null>(null)
  const [activeChaos, setActiveChaos] = useState<ChaosScenarioDef | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Reset steps and chaos when system changes
  useEffect(() => {
    setActiveStepIndex(0)
    setActiveChaos(null)
  }, [systemId])

  const handleExportSvg = () => {
    if (!svgRef.current) return
    try {
      const serializer = new XMLSerializer()
      let source = serializer.serializeToString(svgRef.current)
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
      }
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${systemId}-bytebytego-blueprint.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setToastMessage('Exported SVG Blueprint!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e) {
      console.error('Failed to export SVG', e)
    }
  }

  const handleCopySpec = () => {
    try {
      const specData = {
        systemId,
        title,
        tagline,
        subsystems: subsystems.map(s => ({ id: s.id, label: s.label })),
        nodes: nodes.map(n => ({
          id: n.id,
          label: n.label,
          role: n.role,
          category: n.category,
          protocol: n.protocol,
          metricValue: n.metricValue,
          specs: n.specs
        })),
        steps: steps.map(s => ({
          step: s.stepNumber,
          title: s.title,
          latencyEst: s.latencyEst,
          impactMetric: s.impactMetric,
          explanation: s.detailedExplanation
        })),
        chaosScenarios: chaosScenarios.map(c => ({
          id: c.id,
          name: c.name,
          outcome: c.resilientOutcome
        }))
      }
      navigator.clipboard.writeText(JSON.stringify(specData, null, 2))
      setToastMessage('Copied Architecture Spec (JSON)!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e) {
      console.error('Failed to copy spec', e)
    }
  }

  const activeStep = steps[activeStepIndex] || steps[0]

  // Timer loop for interactive playback
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = Math.max(1200, 3200 / playbackSpeed)
      timerRef.current = setInterval(() => {
        setActiveStepIndex(prev => (prev + 1) % steps.length)
      }, stepDuration)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playbackSpeed, steps.length])

  // Ambient step advancement for preview variant
  useEffect(() => {
    if (variant === 'preview') {
      const previewTimer = setInterval(() => {
        setActiveStepIndex(prev => (prev + 1) % steps.length)
      }, 2800)
      return () => clearInterval(previewTimer)
    }
  }, [variant, steps.length])

  const handleStepSelect = (idx: number) => {
    setActiveStepIndex(idx)
    setIsPlaying(false)
  }

  const toggleChaos = (scenario: ChaosScenarioDef) => {
    if (activeChaos?.id === scenario.id) {
      setActiveChaos(null)
    } else {
      setActiveChaos(scenario)
      setActiveStepIndex(scenario.triggerStep - 1)
      setIsPlaying(false)
    }
  }

  // PREVIEW VARIANT: Compact, scaled responsive banner
  if (variant === 'preview') {
    return (
      <div
        onClick={onOpenWorkbench}
        className="relative w-full h-full min-h-[220px] sm:min-h-[250px] bg-[#0B0F19] overflow-hidden group cursor-pointer border-b border-slate-800 select-none"
      >
        {/* Dark slate blueprint background with SVG grid pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`preview-grid-${systemId}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="#1E293B" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#0B0F19" />
          <rect width="100%" height="100%" fill={`url(#preview-grid-${systemId})`} />
        </svg>

        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* True Coordinate SVG Canvas viewBox 1200 650 */}
        <svg
          viewBox="0 0 1200 650"
          className="w-full h-full relative z-10 p-2 sm:p-4"
        >
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subsystem Grouping Boxes */}
          {subsystems.map(sub => (
            <g key={sub.id}>
              <rect
                x={sub.x}
                y={sub.y}
                width={sub.width}
                height={sub.height}
                rx="12"
                fill="#0F172A"
                fillOpacity="0.3"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={sub.x + 12}
                y={sub.y + 20}
                fill="#64748B"
                fontSize="10"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {sub.label}
              </text>
            </g>
          ))}

          {/* Orthogonal Animated Connections */}
          {connections.map(conn => {
            const isActive = activeStep.activeConnectionIds.includes(conn.id)
            return (
              <AnimatedConnection
                key={conn.id}
                id={conn.id}
                pathD={conn.pathD}
                packetType={conn.packetType}
                isActive={isActive}
                isDimmed={true}
                calloutBadge={conn.calloutBadge}
                calloutPos={conn.calloutPos}
                duration={1.8}
                label={conn.label}
              />
            )
          })}

          {/* Architectural Nodes */}
          {nodes.map(node => {
            const isActive = activeStep.activeNodeIds.includes(node.id)
            return (
              <ArchNode
                key={node.id}
                node={node}
                isActive={isActive}
                isDimmed={true}
              />
            )
          })}
        </svg>

        {/* Top Floating Badge */}
        <div className="absolute top-2.5 left-3 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono text-slate-300 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">BYTEBYTEGO ARCHITECTURE</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Step {activeStep.stepNumber}/{steps.length}</span>
          </div>
        </div>

        {/* Bottom Current Packet Payload Banner */}
        <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between text-[10px] font-mono bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1 backdrop-blur-md">
          <div className="flex items-center gap-1.5 truncate text-slate-300">
            <span className="text-cyan-400 font-bold">FLOW:</span>
            <span className="truncate text-slate-400">{activeStep.payloadTag}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 shrink-0 font-bold ml-2">
            <span>{activeStep.impactMetric}</span>
          </div>
        </div>

        {/* Interactive Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex items-center justify-center">
          <button 
            type="button"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/30 transform group-hover:scale-105 transition-transform"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Launch ByteByteGo Interactive Workbench</span>
          </button>
        </div>
      </div>
    )
  }

  // WORKBENCH VARIANT: Full Interactive Architecture System
  return (
    <div className="relative w-full rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* Toast Notification for Export & Copy */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-50 px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional System Switcher Tabs */}
      {onSelectSystem && (
        <div className="px-4 sm:px-6 py-2.5 bg-[#050811] border-b border-slate-800/90 flex items-center gap-2 overflow-x-auto scrollbar-none touch-scroll">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 font-bold tracking-wider">
            Architecture System:
          </span>
          {[
            { id: 'saas-platform', label: 'Multi-Tenant SaaS', icon: '🏢' },
            { id: 'ecommerce-engine', label: 'E-Commerce Engine', icon: '🛒' },
            { id: 'realtime-platform', label: 'Realtime WebSocket', icon: '⚡' },
            { id: 'fintech-gateway', label: 'FinTech Ledger', icon: '💳' }
          ].map(sys => {
            const isCurrent = (currentSystemId || systemId) === sys.id
            return (
              <button
                key={sys.id}
                onClick={() => {
                  onSelectSystem(sys.id)
                  setActiveStepIndex(0)
                  setActiveChaos(null)
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{sys.icon}</span>
                <span>{sys.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 1. Header Control Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#090E1A] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Interactive System Topology
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              ByteByteGo Spec v3.8
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold font-editorial text-white mt-0.5">
            {title}
          </h4>
        </div>

        {/* Interactive Controls Strip */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Speed Toggle: 1x / 2x */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            {[1, 2].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  playbackSpeed === spd 
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Previous Step */}
          <button
            onClick={() => {
              setActiveStepIndex(prev => (prev === 0 ? steps.length - 1 : prev - 1))
              setIsPlaying(false)
            }}
            title="Previous Step"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Flow</span>
              </>
            )}
          </button>

          {/* Next Step */}
          <button
            onClick={() => {
              setActiveStepIndex(prev => (prev + 1) % steps.length)
              setIsPlaying(false)
            }}
            title="Next Step"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Export SVG Button */}
          <button
            onClick={handleExportSvg}
            title="Export High-Res SVG Blueprint"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          {/* Copy Spec JSON Button */}
          <button
            onClick={handleCopySpec}
            title="Copy Architecture Spec (JSON)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Copy JSON</span>
          </button>
        </div>
      </div>

      {/* 2. Numbered Stepper Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#070C16] border-b border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-scroll">
        <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0 mr-1 hidden sm:inline">
          Steps:
        </span>
        {steps.map((step, idx) => {
          const isSelected = activeStepIndex === idx
          return (
            <button
              key={step.stepNumber}
              onClick={() => handleStepSelect(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/80 font-bold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                isSelected ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
              }`}>
                {step.stepNumber}
              </span>
              <span className="truncate max-w-[130px] sm:max-w-none">
                {step.title.split(':')[1]?.trim() || step.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* 2.1 Visual Timeline Track (0s to 8s sequence) */}
      <div className="w-full bg-[#050912] px-4 sm:px-6 py-1.5 border-b border-slate-800/60 flex items-center gap-3 text-[10px] font-mono">
        <span className="text-slate-500 shrink-0 font-bold uppercase tracking-wider">TIMELINE:</span>
        <div className="relative flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            style={{ width: `${((activeStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-emerald-400 font-bold shrink-0 font-mono">
          {((activeStepIndex + 1) * 1.5).toFixed(1)}s / {(steps.length * 1.5).toFixed(1)}s
        </span>
      </div>

      {/* 3. Live Synchronized Narrative HUD / Explanation Card */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#091122] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                {activeStep.title}
              </span>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-[10px] font-bold">
                {activeStep.latencyEst}
              </span>
              <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 text-[10px] font-bold">
                {activeStep.impactMetric}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed font-sans max-w-3xl">
              {activeStep.detailedExplanation}
            </p>
          </div>
        </div>

        {/* Live Payload Badge */}
        <div className="shrink-0 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 self-start md:self-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">In-Flight Packet Payload:</div>
          <div className="text-cyan-300 font-bold text-xs truncate max-w-xs mt-0.5">
            {activeStep.payloadTag}
          </div>
        </div>
      </div>

      {/* 4. Coordinate SVG Canvas (viewBox="0 0 1200 650") */}
      <div className="relative w-full aspect-[1200/650] min-h-[360px] max-h-[640px] bg-[#0B0F19] overflow-hidden p-2 sm:p-4">
        {/* Dark slate blueprint background with 24px dot/grid pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`workbench-grid-${systemId}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.2" fill="#1E293B" opacity="0.65" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#0B0F19" />
          <rect width="100%" height="100%" fill={`url(#workbench-grid-${systemId})`} />
        </svg>

        <svg
          ref={svgRef}
          viewBox="0 0 1200 650"
          className="w-full h-full relative z-10 select-none"
        >
          {/* SVG Glow Filter Definitions */}
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-chaos" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subsystem Grouping Boxes with Corner Labels */}
          {subsystems.map(sub => (
            <g key={sub.id}>
              <rect
                x={sub.x}
                y={sub.y}
                width={sub.width}
                height={sub.height}
                rx="12"
                fill="#0F172A"
                fillOpacity="0.32"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <g transform={`translate(${sub.x + 12}, ${sub.y + 18})`}>
                <rect
                  x="-4"
                  y="-11"
                  width={sub.label.length * 7 + 16}
                  height="16"
                  rx="3"
                  fill="#0B1324"
                  stroke="#1E293B"
                  strokeWidth="0.8"
                />
                <text
                  x="4"
                  y="1"
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.4px"
                >
                  {sub.label}
                </text>
              </g>
            </g>
          ))}

          {/* Orthogonal Animated Connections - Inactive dimmed to opacity: 0.25 */}
          {connections.map(conn => {
            const isActive = activeStep.activeConnectionIds.includes(conn.id)
            return (
              <AnimatedConnection
                key={conn.id}
                id={conn.id}
                pathD={conn.pathD}
                packetType={conn.packetType}
                isActive={isActive}
                isDimmed={true} // Dims inactive paths to opacity: 0.25
                calloutBadge={conn.calloutBadge}
                calloutPos={conn.calloutPos}
                duration={Math.max(1.0, 2.0 / playbackSpeed)}
                label={conn.label}
              />
            )
          })}

          {/* Architectural Nodes - Inactive dimmed to opacity: 0.25 */}
          {nodes.map(node => {
            const isActive = activeStep.activeNodeIds.includes(node.id)
            const isChaosAffected = activeChaos?.affectedNodeId === node.id

            return (
              <ArchNode
                key={node.id}
                node={node}
                isActive={isActive}
                isDimmed={true} // Dims inactive nodes to opacity: 0.25
                isChaosAffected={isChaosAffected}
                onClick={() => setInspectedNode(node)}
              />
            )
          })}
        </svg>

        {/* Chaos Engineering Simulator Strip */}
        {chaosScenarios.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300 font-bold">Chaos Resilience Mode:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {chaosScenarios.map(chaos => {
                const isActive = activeChaos?.id === chaos.id
                return (
                  <button
                    key={chaos.id}
                    onClick={() => toggleChaos(chaos)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-red-500 text-white font-bold shadow-lg shadow-red-500/25'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-red-500/50 hover:text-red-400'
                    }`}
                  >
                    <span>{chaos.name}</span>
                    {isActive ? <X className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Chaos Outcome Alert */}
      {activeChaos && (
        <div className="px-4 sm:px-6 py-3 bg-red-950/40 border-t border-red-500/30 flex items-start gap-3 text-xs font-mono">
          <div className="p-1 rounded bg-red-500/20 text-red-400 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400">{activeChaos.name}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                {activeChaos.recoveryBadge}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed font-sans">
              {activeChaos.resilientOutcome}
            </p>
          </div>
        </div>
      )}

      {/* Node Technical Inspector Modal */}
      <AnimatePresence>
        {inspectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-2xl bg-[#0b1220] border border-slate-700 shadow-2xl p-5 sm:p-6 text-xs font-mono"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      {inspectedNode.protocol}
                    </span>
                    <span className="text-slate-500">{inspectedNode.category.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-editorial text-white">
                    {inspectedNode.label}
                  </h3>
                  <p className="text-slate-400 text-xs">{inspectedNode.role}</p>
                </div>

                <button
                  onClick={() => setInspectedNode(null)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {inspectedNode.specs && (
                <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mb-1 uppercase">
                      Technology & Architecture:
                    </div>
                    {inspectedNode.specs.technology}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 uppercase">
                      Concurrency & Threading Model:
                    </div>
                    {inspectedNode.specs.concurrencyModel}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] font-mono text-purple-400 font-bold mb-1 uppercase">
                        Resilience Pattern:
                      </div>
                      {inspectedNode.specs.resiliencePattern}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] font-mono text-amber-400 font-bold mb-1 uppercase">
                        Target SLA & Metric:
                      </div>
                      <div className="font-mono font-bold text-white text-base">
                        {inspectedNode.metricValue}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {inspectedNode.specs.targetSla}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs font-mono leading-relaxed pt-2 border-t border-slate-800">
                    {inspectedNode.specs.deepDive}
                  </p>
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setInspectedNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SystemDesignCanvas