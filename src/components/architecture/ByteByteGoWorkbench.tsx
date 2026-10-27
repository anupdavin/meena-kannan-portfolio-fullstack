import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Maximize2,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react'
import {
  BoundaryContainer,
  DatabaseCylinder,
  KafkaPartitionPipe,
  HexShieldGateway,
  RedisMemoryGrid,
  SequenceBadge,
  FlowingConnection,
  SvgGlowFilters
} from './SvgPrimitives'
import { WORKBENCH_SYSTEMS } from './workbenchConfigs'
import type { NodeRuntimeSpec } from './workbenchConfigs'

export interface ByteByteGoWorkbenchProps {
  systemId?: string
  variant?: 'preview' | 'workbench'
  onOpenWorkbench?: () => void
  allowSystemSwitch?: boolean
  onSelectSystem?: (id: string) => void
}

export const ByteByteGoWorkbench: React.FC<ByteByteGoWorkbenchProps> = ({
  systemId = 'saas-platform',
  variant = 'workbench',
  onOpenWorkbench,
  allowSystemSwitch = true,
  onSelectSystem
}) => {
  const [currentSystemId, setCurrentSystemId] = useState<string>(systemId)
  const [isFailureMode, setIsFailureMode] = useState<boolean>(false)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false)

  const svgRef = useRef<SVGSVGElement>(null)

  // Sync internal systemId if prop updates
  useEffect(() => {
    setCurrentSystemId(systemId)
    setActiveStepIndex(0)
  }, [systemId])

  const config = WORKBENCH_SYSTEMS[currentSystemId] || WORKBENCH_SYSTEMS['saas-platform']
  const activeSteps = isFailureMode ? config.failureSteps : config.normalSteps
  const currentStep = activeSteps[activeStepIndex] || activeSteps[0]

  // Auto-play interval for sequential flow steps
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % activeSteps.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [isPlaying, activeSteps.length])

  // Select first node as default inspector selection if none selected
  useEffect(() => {
    const nodeKeys = Object.keys(config.nodeSpecs)
    if (!selectedNodeId || !config.nodeSpecs[selectedNodeId]) {
      setSelectedNodeId(nodeKeys[0] || null)
    }
  }, [currentSystemId, config, selectedNodeId])

  const handleSystemChange = (id: string) => {
    setCurrentSystemId(id)
    setActiveStepIndex(0)
    if (onSelectSystem) {
      onSelectSystem(id)
    }
  }

  const handleToggleFailureMode = () => {
    setIsFailureMode((prev) => !prev)
    setActiveStepIndex(0)
  }

  const handlePrevStep = () => {
    setIsPlaying(false)
    setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : activeSteps.length - 1))
  }

  const handleNextStep = () => {
    setIsPlaying(false)
    setActiveStepIndex((prev) => (prev + 1) % activeSteps.length)
  }

  const handleCopySpec = () => {
    const exportData = {
      systemId: config.id,
      title: config.title,
      mode: isFailureMode ? 'Failure Backpressure Simulation' : 'Normal High-Throughput Flow',
      currentStep: currentStep,
      activeSpecs: config.nodeSpecs
    }
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    setCopiedSpec(true)
    setTimeout(() => setCopiedSpec(false), 2200)
  }

  const handleExportSvg = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.id}-${isFailureMode ? 'backpressure' : 'normal'}-blueprint.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedNodeSpec: NodeRuntimeSpec | undefined = selectedNodeId
    ? config.nodeSpecs[selectedNodeId]
    : undefined

  // Compute node card renderer for general compute and ingress nodes
  const renderComputeCard = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    sublabel: string,
    protocolBadge: string,
    color: string = '#38bdf8'
  ) => {
    const isStepActive = currentStep.activeNodeIds.includes(id)
    const isSelected = selectedNodeId === id
    const isChaos = isFailureMode && isStepActive

    return (
      <g
        key={id}
        transform={`translate(${x}, ${y})`}
        tabIndex={0}
        role="button"
        aria-label={`Inspect ${label}`}
        onClick={() => setSelectedNodeId(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setSelectedNodeId(id)
          }
        }}
        className="cursor-pointer select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
      >
        {/* Chassis */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="10"
          fill="#0b1120"
          fillOpacity="0.92"
          stroke={isSelected ? '#38bdf8' : isStepActive ? (isChaos ? '#f43f5e' : color) : '#1e293b'}
          strokeWidth={isSelected ? '2' : isStepActive ? '1.8' : '1'}
          filter={isStepActive ? (isChaos ? 'url(#glow-rose)' : 'url(#glow-cyan)') : undefined}
        />

        {/* Header strip */}
        <g transform="translate(10, 10)">
          <circle
            cx="4"
            cy="4"
            r="3"
            fill={isChaos ? '#f43f5e' : isStepActive ? color : '#475569'}
          />
          <text
            x="14"
            y="7.5"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            {label}
          </text>
        </g>

        {/* Sublabel */}
        <text
          x="12"
          y="34"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
        >
          {sublabel}
        </text>

        {/* Bottom Protocol / Metric Pill */}
        <g transform={`translate(10, ${height - 24})`}>
          <rect
            x="0"
            y="0"
            width={width - 20}
            height="16"
            rx="3.5"
            fill={isChaos ? '#4c0519' : '#081c33'}
            stroke={isChaos ? '#f43f5e' : '#1e3a5f'}
            strokeWidth="0.8"
          />
          <text
            x={(width - 20) / 2}
            y="11"
            fill={isChaos ? '#fda4af' : '#7dd3fc'}
            fontSize="7.5"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
            className="tabular-nums"
          >
            {isChaos ? 'BACKPRESSURE ACTIVATED' : protocolBadge}
          </text>
        </g>
      </g>
    )
  }

  // RingBuffer Circular SVG Graphic for System 3
  const renderLmaxRingBuffer = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const isStepActive = currentStep.activeNodeIds.includes(id)
    const isSelected = selectedNodeId === id
    const isChaos = isFailureMode && isStepActive
    const cx = width / 2
    const cy = height / 2 + 6
    const radius = Math.min(width, height) * 0.32

    return (
      <g
        key={id}
        transform={`translate(${x}, ${y})`}
        tabIndex={0}
        role="button"
        aria-label="Inspect LMAX Disruptor RingBuffer"
        onClick={() => setSelectedNodeId(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setSelectedNodeId(id)
          }
        }}
        className="cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="10"
          fill="#0b1120"
          fillOpacity="0.92"
          stroke={isSelected ? '#38bdf8' : isStepActive ? '#10b981' : '#1e293b'}
          strokeWidth={isSelected ? '2' : '1.2'}
        />

        {/* Header */}
        <g transform="translate(10, 10)">
          <rect x="0" y="0" width="18" height="14" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
          <text x="9" y="10.5" fill="#34d399" fontSize="8.5" fontWeight="800" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            L
          </text>
          <text x="26" y="11" fill="#f8fafc" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            LMAX RingBuffer
          </text>
        </g>

        {/* Circular Ring Buffer Graphic */}
        <g transform={`translate(${cx}, ${cy})`}>
          <circle cx="0" cy="0" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle
            cx="0"
            cy="0"
            r={radius}
            fill="none"
            stroke={isChaos ? '#f43f5e' : '#10b981'}
            strokeWidth="12"
            strokeDasharray="14 6"
            className="transition-colors duration-300"
          />
          <circle cx="0" cy="0" r={radius - 12} fill="#060e1a" stroke="#10b981" strokeWidth="0.8" />
          <text x="0" y="2" fill="#6ee7b7" fontSize="8" fontWeight="700" fontFamily="JetBrains Mono, monospace" textAnchor="middle" className="tabular-nums">
            1,048,576
          </text>
          <text x="0" y="12" fill="#64748b" fontSize="7" fontWeight="500" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            SLOTS
          </text>
        </g>

        {/* Footer Monospace Pill */}
        <g transform={`translate(10, ${height - 22})`}>
          <rect x="0" y="0" width={width - 20} height="15" rx="3" fill="#062d27" stroke="#10b981" strokeWidth="0.7" />
          <text x={(width - 20) / 2} y="10.5" fill="#a7f3d0" fontSize="7.5" fontWeight="600" fontFamily="JetBrains Mono, monospace" textAnchor="middle" className="tabular-nums">
            Zero-GC Barrier (P99 0.1ms)
          </text>
        </g>
      </g>
    )
  }

  // System 1 SVG Diagram
  const renderSystem1 = () => {
    return (
      <>
        {/* Functional Boundaries */}
        {config.subsystems.map((sub) => (
          <BoundaryContainer
            key={sub.id}
            x={sub.x}
            y={sub.y}
            width={sub.width}
            height={sub.height}
            label={sub.label}
            sublabel={sub.sublabel}
            accentColor={sub.accentColor}
          />
        ))}

        {/* Base Connections & Paths */}
        {!isFailureMode ? (
          <>
            {/* 1. Client to Envoy */}
            <FlowingConnection
              id="client-envoy"
              pathD="M 205 245 L 297 180"
              isActive={currentStep.activeConnectionIds.includes('flow-client-envoy')}
              color="#38bdf8"
              duration={1.8}
            />
            {/* 2. Envoy to Redis */}
            <FlowingConnection
              id="envoy-redis"
              pathD="M 355 238 L 355 325"
              isActive={currentStep.activeConnectionIds.includes('flow-envoy-redis')}
              color="#38bdf8"
              duration={1.4}
            />
            {/* 3. Envoy to Spring Boot */}
            <FlowingConnection
              id="envoy-spring"
              pathD="M 413 180 L 525 245"
              isActive={currentStep.activeConnectionIds.includes('flow-envoy-spring')}
              color="#38bdf8"
              duration={1.8}
            />
            {/* 4. Spring Boot to Postgres */}
            <FlowingConnection
              id="spring-postgres"
              pathD="M 695 245 L 750 245"
              isActive={currentStep.activeConnectionIds.includes('flow-spring-postgres')}
              color="#10b981"
              duration={1.6}
            />

            {/* Sequence Badges */}
            <SequenceBadge step="1" cx={250} cy={206} protocol="mTLS 1.3" color="#38bdf8" isActive={currentStep.step === 1} />
            <SequenceBadge step="2" cx={355} cy={280} protocol="RESP3 (1.2ms)" color="#38bdf8" isActive={currentStep.step === 2} />
            <SequenceBadge step="3" cx={470} cy={206} protocol="gRPC Virtual" color="#38bdf8" isActive={currentStep.step === 3} />
            <SequenceBadge step="4" cx={722} cy={245} protocol="RLS Tenant" color="#10b981" isActive={currentStep.step === 4} />
          </>
        ) : (
          <>
            {/* Failure Backpressure Connections */}
            <FlowingConnection
              id="client-envoy-surge"
              pathD="M 205 245 L 297 180"
              isActive={currentStep.activeConnectionIds.includes('flow-client-envoy')}
              isChaos={true}
              color="#f43f5e"
              duration={1.2}
            />
            <FlowingConnection
              id="envoy-shed"
              pathD="M 297 205 L 205 265"
              isActive={currentStep.activeConnectionIds.includes('flow-envoy-shed')}
              isChaos={true}
              color="#f43f5e"
              duration={1.2}
            />
            <FlowingConnection
              id="envoy-audit"
              pathD="M 413 160 Q 580 90 750 190"
              isActive={currentStep.activeConnectionIds.includes('flow-envoy-audit')}
              isChaos={true}
              color="#f59e0b"
              duration={2.2}
            />

            <SequenceBadge step="!" cx={250} cy={206} protocol="Burst Surge" color="#f43f5e" isActive={currentStep.step === 1} isChaos={true} />
            <SequenceBadge step="2" cx={250} cy={245} protocol="HTTP 429 Shed" color="#f43f5e" isActive={currentStep.step === 3} isChaos={true} />
            <SequenceBadge step="3" cx={580} cy={115} protocol="Async WAL Audit" color="#f59e0b" isActive={currentStep.step === 4} isChaos={true} />
          </>
        )}

        {/* Semantic Nodes */}
        {renderComputeCard(
          'client-ingress',
          45,
          200,
          160,
          95,
          'Client Ingress',
          'B2B React / iOS Client',
          'HTTPS / TLS 1.3',
          '#38bdf8'
        )}

        <HexShieldGateway
          cx={355}
          cy={180}
          radius={58}
          label="Envoy Proxy"
          sublabel="Token Bucket Limiter"
          bucketFill={isFailureMode ? 0 : 85}
          isHighlighted={selectedNodeId === 'envoy-gateway' || currentStep.activeNodeIds.includes('envoy-gateway')}
          isChaos={isFailureMode}
          rateLimitStatus={isFailureMode ? 'BURST EXHAUSTED' : '10k req/s [OK]'}
          onClick={() => setSelectedNodeId('envoy-gateway')}
        />

        <RedisMemoryGrid
          x={275}
          y={325}
          width={160}
          height={130}
          label="Redis Token Cache"
          sublabel="Public Keys & Token Quotas"
          ttlStatus="TTL: 300s [99.4% Hit]"
          isHighlighted={selectedNodeId === 'redis-cache' || currentStep.activeNodeIds.includes('redis-cache')}
          isChaos={isFailureMode && currentStep.activeNodeIds.includes('redis-cache')}
          onClick={() => setSelectedNodeId('redis-cache')}
        />

        {renderComputeCard(
          'spring-core',
          525,
          195,
          170,
          105,
          'Spring Boot 3 Core',
          'Java 21 Virtual Threads',
          'JWT Claims Verified',
          '#38bdf8'
        )}

        <DatabaseCylinder
          x={750}
          y={175}
          width={160}
          height={145}
          label="PostgreSQL 16"
          sublabel="Row-Level Security (RLS)"
          accentColor="#10b981"
          walStatus="RLS Tenant Isolation"
          isHighlighted={selectedNodeId === 'postgres-rls' || currentStep.activeNodeIds.includes('postgres-rls')}
          isChaos={false}
          onClick={() => setSelectedNodeId('postgres-rls')}
        />
      </>
    )
  }

  // System 2 SVG Diagram
  const renderSystem2 = () => {
    return (
      <>
        {config.subsystems.map((sub) => (
          <BoundaryContainer
            key={sub.id}
            x={sub.x}
            y={sub.y}
            width={sub.width}
            height={sub.height}
            label={sub.label}
            sublabel={sub.sublabel}
            accentColor={sub.accentColor}
          />
        ))}

        {!isFailureMode ? (
          <>
            <FlowingConnection
              id="checkout-db"
              pathD="M 210 162 L 245 162"
              isActive={currentStep.activeConnectionIds.includes('flow-checkout-db')}
              color="#38bdf8"
              duration={1.5}
            />
            <FlowingConnection
              id="db-debezium"
              pathD="M 332 235 L 332 320"
              isActive={currentStep.activeConnectionIds.includes('flow-db-debezium')}
              color="#10b981"
              duration={1.5}
            />
            <FlowingConnection
              id="debezium-kafka"
              pathD="M 420 367 L 480 290"
              isActive={currentStep.activeConnectionIds.includes('flow-debezium-kafka')}
              color="#f59e0b"
              duration={1.6}
            />
            <FlowingConnection
              id="kafka-payment"
              pathD="M 660 200 L 730 162"
              isActive={currentStep.activeConnectionIds.includes('flow-kafka-payment')}
              color="#10b981"
              duration={1.8}
            />
            <FlowingConnection
              id="kafka-inventory"
              pathD="M 660 330 L 730 367"
              isActive={currentStep.activeConnectionIds.includes('flow-kafka-inventory')}
              color="#10b981"
              duration={1.8}
            />

            <SequenceBadge step="1" cx={227} cy={140} protocol="ACID Commit" color="#38bdf8" isActive={currentStep.step === 1} />
            <SequenceBadge step="2" cx={355} cy={275} protocol="WAL CDC" color="#10b981" isActive={currentStep.step === 2} />
            <SequenceBadge step="3" cx={445} cy={345} protocol="Kafka Mesh" color="#f59e0b" isActive={currentStep.step === 3} />
            <SequenceBadge step="4" cx={695} cy={180} protocol="OrderCreated" color="#10b981" isActive={currentStep.step === 4} />
            <SequenceBadge step="5" cx={695} cy={345} protocol="StockReserve" color="#10b981" isActive={currentStep.step === 4} />
          </>
        ) : (
          <>
            <FlowingConnection
              id="payment-dlq"
              pathD="M 730 185 L 660 240"
              isActive={currentStep.activeConnectionIds.includes('flow-payment-dlq')}
              isChaos={true}
              color="#f43f5e"
              duration={1.4}
            />
            <FlowingConnection
              id="kafka-rollback"
              pathD="M 660 270 Q 700 270 730 340"
              isActive={currentStep.activeConnectionIds.includes('flow-kafka-rollback')}
              isChaos={true}
              color="#f59e0b"
              duration={1.8}
            />

            <SequenceBadge step="!" cx={745} cy={95} protocol="504 Timeout" color="#f43f5e" isActive={currentStep.step === 2} isChaos={true} />
            <SequenceBadge step="3" cx={695} cy={215} protocol="DLQ Route" color="#f43f5e" isActive={currentStep.step === 3} isChaos={true} />
            <SequenceBadge step="4" cx={695} cy={295} protocol="Rollback Inventory" color="#f59e0b" isActive={currentStep.step === 4} isChaos={true} />
          </>
        )}

        {renderComputeCard(
          'checkout-service',
          45,
          115,
          165,
          95,
          'Checkout Service',
          'Spring Boot 3 / Kotlin',
          'Idempotency Key Valid',
          '#38bdf8'
        )}

        <DatabaseCylinder
          x={245}
          y={95}
          width={175}
          height={140}
          label="Orders + Outbox DB"
          sublabel="Atomic Local ACID Tx"
          accentColor="#38bdf8"
          walStatus="WAL Mining Active"
          isHighlighted={selectedNodeId === 'postgres-outbox' || currentStep.activeNodeIds.includes('postgres-outbox')}
          onClick={() => setSelectedNodeId('postgres-outbox')}
        />

        {renderComputeCard(
          'debezium-cdc',
          245,
          320,
          175,
          95,
          'Debezium CDC',
          'Kafka Connect WAL Engine',
          'WAL Lag: 0ms',
          '#10b981'
        )}

        <KafkaPartitionPipe
          x={480}
          y={130}
          width={180}
          height={270}
          label="Kafka 3.6 Cluster"
          partitions={['P0 [Offset: 18420]', 'P1 [Offset: 18419]', 'P2 [Offset: 18422]']}
          activePartition={1}
          isChaos={isFailureMode}
          onClick={() => setSelectedNodeId('kafka-pipe')}
        />

        {renderComputeCard(
          'payment-service',
          730,
          115,
          175,
          95,
          'Payment Service',
          'Saga: Payment Acquirer',
          isFailureMode ? 'GATEWAY TIMEOUT' : 'Capture Authorized',
          isFailureMode ? '#f43f5e' : '#10b981'
        )}

        {renderComputeCard(
          'inventory-service',
          730,
          320,
          175,
          95,
          'Inventory Service',
          'Saga: Stock Allocator',
          isFailureMode ? 'ROLLBACK APPLIED' : 'Stock Reserved',
          isFailureMode ? '#f59e0b' : '#10b981'
        )}
      </>
    )
  }

  // System 3 SVG Diagram
  const renderSystem3 = () => {
    return (
      <>
        {config.subsystems.map((sub) => (
          <BoundaryContainer
            key={sub.id}
            x={sub.x}
            y={sub.y}
            width={sub.width}
            height={sub.height}
            label={sub.label}
            sublabel={sub.sublabel}
            accentColor={sub.accentColor}
          />
        ))}

        {!isFailureMode ? (
          <>
            <FlowingConnection
              id="feed-lmax"
              pathD="M 205 260 L 265 260"
              isActive={currentStep.activeConnectionIds.includes('flow-feed-lmax')}
              color="#38bdf8"
              duration={1.2}
            />
            <FlowingConnection
              id="lmax-redis"
              pathD="M 450 260 L 510 260"
              isActive={currentStep.activeConnectionIds.includes('flow-lmax-redis')}
              color="#10b981"
              duration={1.4}
            />
            <FlowingConnection
              id="redis-ws"
              pathD="M 675 235 L 735 175"
              isActive={currentStep.activeConnectionIds.includes('flow-redis-ws')}
              color="#f43f5e"
              duration={1.4}
            />
            <FlowingConnection
              id="ws-client"
              pathD="M 825 215 L 825 315"
              isActive={currentStep.activeConnectionIds.includes('flow-ws-client')}
              color="#a855f7"
              duration={1.5}
            />

            <SequenceBadge step="1" cx={235} cy={235} protocol="UDP 150k/s" color="#38bdf8" isActive={currentStep.step === 1} />
            <SequenceBadge step="2" cx={480} cy={235} protocol="RingBuffer (0.1ms)" color="#10b981" isActive={currentStep.step === 2} />
            <SequenceBadge step="3" cx={705} cy={205} protocol="Pub/Sub Fanout" color="#f43f5e" isActive={currentStep.step === 3} />
            <SequenceBadge step="4" cx={840} cy={265} protocol="Binary WS (P99 1.4ms)" color="#a855f7" isActive={currentStep.step === 4} />
          </>
        ) : (
          <>
            <FlowingConnection
              id="feed-lmax-surge"
              pathD="M 205 260 L 265 260"
              isActive={currentStep.activeConnectionIds.includes('flow-feed-lmax')}
              color="#38bdf8"
              duration={1.0}
            />
            <FlowingConnection
              id="ws-drop"
              pathD="M 735 150 Q 600 120 450 200"
              isActive={currentStep.activeConnectionIds.includes('flow-ws-drop')}
              isChaos={true}
              color="#f43f5e"
              duration={1.6}
            />

            <SequenceBadge step="!" cx={840} cy={265} protocol="TCP Window 0" color="#f43f5e" isActive={currentStep.step === 2} isChaos={true} />
            <SequenceBadge step="3" cx={600} cy={140} protocol="Drop Oldest Frame" color="#f43f5e" isActive={currentStep.step === 3} isChaos={true} />
            <SequenceBadge step="4" cx={480} cy={235} protocol="Healthy SLA Preserved" color="#10b981" isActive={currentStep.step === 4} />
          </>
        )}

        {renderComputeCard(
          'feed-ingest',
          45,
          210,
          160,
          100,
          'Market Ingest',
          'UDP Multicast / FIX ITCH',
          'Kernel Bypass EF_VI',
          '#38bdf8'
        )}

        {renderLmaxRingBuffer('lmax-disruptor', 265, 175, 185, 170)}

        <RedisMemoryGrid
          x={510}
          y={190}
          width={165}
          height={140}
          label="Redis Shards"
          sublabel="Pub/Sub Realtime Fanout"
          ttlStatus="Hot Ticks [150k/s]"
          isHighlighted={selectedNodeId === 'redis-cluster' || currentStep.activeNodeIds.includes('redis-cluster')}
          onClick={() => setSelectedNodeId('redis-cluster')}
        />

        {renderComputeCard(
          'ws-gateways',
          735,
          115,
          180,
          100,
          'WebSocket Gateways',
          'Netty 4.1 Epoll Cluster',
          isFailureMode ? 'DROP-OLDEST ACTIVE' : '50k Active Sockets',
          isFailureMode ? '#f43f5e' : '#38bdf8'
        )}

        {renderComputeCard(
          'client-terminals',
          735,
          315,
          180,
          100,
          'Trading Terminals',
          'Institutional Desks',
          isFailureMode ? 'STALLED BUFFER' : 'P99 Latency 1.4ms',
          isFailureMode ? '#f43f5e' : '#10b981'
        )}
      </>
    )
  }

  // System 4 SVG Diagram
  const renderSystem4 = () => {
    return (
      <>
        {config.subsystems.map((sub) => (
          <BoundaryContainer
            key={sub.id}
            x={sub.x}
            y={sub.y}
            width={sub.width}
            height={sub.height}
            label={sub.label}
            sublabel={sub.sublabel}
            accentColor={sub.accentColor}
          />
        ))}

        {!isFailureMode ? (
          <>
            <FlowingConnection
              id="ingress-kms"
              pathD="M 185 260 L 265 170"
              isActive={currentStep.activeConnectionIds.includes('flow-ingress-kms')}
              color="#38bdf8"
              duration={1.6}
            />
            <FlowingConnection
              id="kms-redlock"
              pathD="M 357 225 L 357 315"
              isActive={currentStep.activeConnectionIds.includes('flow-kms-redlock')}
              color="#10b981"
              duration={1.5}
            />
            <FlowingConnection
              id="redlock-ledger"
              pathD="M 450 375 L 510 280"
              isActive={currentStep.activeConnectionIds.includes('flow-redlock-ledger')}
              color="#f59e0b"
              duration={1.6}
            />
            <FlowingConnection
              id="ledger-postgres"
              pathD="M 675 260 L 735 260"
              isActive={currentStep.activeConnectionIds.includes('flow-ledger-postgres')}
              color="#a855f7"
              duration={1.8}
            />

            <SequenceBadge step="1" cx={225} cy={215} protocol="mTLS Verify" color="#38bdf8" isActive={currentStep.step === 1} />
            <SequenceBadge step="2" cx={375} cy={270} protocol="KMS DEK Token" color="#10b981" isActive={currentStep.step === 2} />
            <SequenceBadge step="3" cx={480} cy={330} protocol="Redlock Lease" color="#f59e0b" isActive={currentStep.step === 3} />
            <SequenceBadge step="4" cx={705} cy={235} protocol="SERIALIZABLE" color="#a855f7" isActive={currentStep.step === 4} />
          </>
        ) : (
          <>
            <FlowingConnection
              id="ledger-retry"
              pathD="M 510 300 Q 380 470 265 375"
              isActive={currentStep.activeConnectionIds.includes('flow-ledger-retry')}
              isChaos={true}
              color="#f59e0b"
              duration={1.8}
            />
            <FlowingConnection
              id="ledger-postgres-retry"
              pathD="M 675 260 L 735 260"
              isActive={currentStep.activeConnectionIds.includes('flow-ledger-postgres')}
              color="#10b981"
              duration={1.8}
            />

            <SequenceBadge step="!" cx={357} cy={285} protocol="Lock Contention" color="#f43f5e" isActive={currentStep.step === 2} isChaos={true} />
            <SequenceBadge step="3" cx={380} cy={440} protocol="UUIDv7 Jitter Retry" color="#f59e0b" isActive={currentStep.step === 3} isChaos={true} />
            <SequenceBadge step="4" cx={705} cy={235} protocol="Zero Duplicates" color="#10b981" isActive={currentStep.step === 4} />
          </>
        )}

        <HexShieldGateway
          cx={125}
          cy={260}
          radius={58}
          label="Banking Ingress"
          sublabel="mTLS Hardware Verification"
          bucketFill={90}
          isHighlighted={selectedNodeId === 'banking-ingress' || currentStep.activeNodeIds.includes('banking-ingress')}
          rateLimitStatus="mTLS 1.3 [CERT OK]"
          onClick={() => setSelectedNodeId('banking-ingress')}
        />

        {renderComputeCard(
          'kms-vault',
          265,
          115,
          185,
          110,
          'AWS KMS Vault',
          'FIPS 140-3 HSM Module',
          'AES-256 Envelope DEK',
          '#10b981'
        )}

        <RedisMemoryGrid
          x={265}
          y={315}
          width={185}
          height={120}
          label="Redis Redlock"
          sublabel="Distributed Mutex Quorum"
          ttlStatus={isFailureMode ? 'LOCK CONFLICT DETECTED' : 'Lease: 50ms [HELD]'}
          isHighlighted={selectedNodeId === 'redis-redlock' || currentStep.activeNodeIds.includes('redis-redlock')}
          isChaos={isFailureMode && currentStep.activeNodeIds.includes('redis-redlock')}
          onClick={() => setSelectedNodeId('redis-redlock')}
        />

        {renderComputeCard(
          'ledger-core',
          510,
          200,
          165,
          120,
          'Ledger Core Engine',
          'Rust Tokio Runtime',
          isFailureMode ? 'JITTER RETRY ACTIVE' : 'Debits == Credits OK',
          isFailureMode ? '#f59e0b' : '#38bdf8'
        )}

        <DatabaseCylinder
          x={735}
          y={180}
          width={180}
          height={160}
          label="PostgreSQL Ledger"
          sublabel="SERIALIZABLE Isolation"
          accentColor="#a855f7"
          walStatus="Append-Only Hash Chain"
          isHighlighted={selectedNodeId === 'postgres-ledger' || currentStep.activeNodeIds.includes('postgres-ledger')}
          onClick={() => setSelectedNodeId('postgres-ledger')}
        />
      </>
    )
  }

  // Choose which diagram to render based on currentSystemId
  const renderDiagram = () => {
    switch (currentSystemId) {
      case 'ecommerce-engine':
        return renderSystem2()
      case 'realtime-platform':
        return renderSystem3()
      case 'fintech-gateway':
        return renderSystem4()
      case 'saas-platform':
      default:
        return renderSystem1()
    }
  }

  // Variant A: Compact Preview Card Mode
  if (variant === 'preview') {
    return (
      <div
        onClick={onOpenWorkbench}
        className="group relative rounded-xl bg-[#090f1d] border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-xl"
      >
        {/* Top Status Bar in Preview */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/60 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold truncate">{config.title}</span>
          </div>
          <span className="text-cyan-400 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Inspect Blueprint</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* 960x540 Responsive Vector Diagram */}
        <div className="relative w-full aspect-[16/9] bg-[#06090e]">
          <svg
            ref={svgRef}
            viewBox="0 0 960 540"
            className="w-full h-full object-contain pointer-events-none"
          >
            <SvgGlowFilters />
            <rect width="960" height="540" fill="#06090e" />
            <rect width="960" height="540" fill="url(#arch-grid-pattern)" />
            {renderDiagram()}
          </svg>

          {/* Hover overlay indicator */}
          <div className="absolute inset-0 bg-cyan-950/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-lg flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Launch Interactive Workbench</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Variant B: Full Interactive Workbench Mode
  return (
    <div className="flex flex-col rounded-2xl bg-[#070b14] border border-slate-800 shadow-2xl overflow-hidden">
      {/* 1. Workbench Top Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800/90 font-mono text-xs">
        {/* System Switcher Tabs */}
        {allowSystemSwitch && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'saas-platform', label: 'B2B IAM / RLS' },
              { id: 'ecommerce-engine', label: 'Distributed Saga' },
              { id: 'realtime-platform', label: 'Tick Stream Mesh' },
              { id: 'fintech-gateway', label: 'Ledger Vault' }
            ].map((tab) => {
              const isActive = currentSystemId === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSystemChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-mono ${
                    isActive
                      ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Action Buttons: Export SVG & Copy Spec */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySpec}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono transition-colors"
          >
            {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedSpec ? 'Copied' : 'JSON Spec'}</span>
          </button>

          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* 2. Simulation State & Stepper Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#0a101d] border-b border-slate-800/80">
        {/* Dual-State Simulation Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
            Simulation Mode:
          </span>
          <button
            onClick={handleToggleFailureMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
              isFailureMode
                ? 'bg-rose-500/20 border border-rose-500/60 text-rose-300'
                : 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
            }`}
          >
            {isFailureMode ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>[Failure / Backpressure Mode]</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>[Normal High-Throughput Flow]</span>
              </>
            )}
          </button>
        </div>

        {/* Step Stepper & Play/Pause */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1 mr-2">
            {activeSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  setIsPlaying(false)
                  setActiveStepIndex(idx)
                }}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                  idx === activeStepIndex
                    ? isFailureMode
                      ? 'bg-rose-500 text-white'
                      : 'bg-cyan-500 text-slate-950 font-extrabold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrevStep}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleNextStep}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Primary SVG Vector Blueprint (viewBox="0 0 960 540") */}
      <div className="relative w-full aspect-[16/9] bg-[#06090e] overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 960 540"
          className="w-full h-full object-contain select-none"
        >
          <SvgGlowFilters />
          {/* Obsidian dark blueprint base */}
          <rect width="960" height="540" fill="#06090e" />
          <rect width="960" height="540" fill="url(#arch-grid-pattern)" />
          {renderDiagram()}
        </svg>

        {/* Live Step Overlay Pill (Top-Left overlay) */}
        <div className="absolute top-3 left-3 pointer-events-none max-w-[calc(100%-1.5rem)] sm:max-w-sm">
          <div className="px-3 py-2 rounded-lg bg-slate-950/90 border border-slate-800 text-slate-300 font-mono text-[11px] backdrop-blur-md shadow-xl space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`font-bold ${isFailureMode ? 'text-rose-400' : 'text-cyan-400'}`}>
                Step {currentStep.step}: {currentStep.title}
              </span>
              <span className="text-[10px] text-slate-500 tabular-nums">
                {currentStep.latencyEst}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-sans leading-snug">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Metric Pill (Bottom-Left overlay) */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-emerald-400 font-mono text-[10px] tabular-nums font-semibold shadow-md">
            {currentStep.impactMetric}
          </span>
        </div>
      </div>

      {/* 4. Concrete Runtime Specifications & Technical Inspector */}
      {selectedNodeSpec && (
        <div className="p-4 sm:p-6 bg-[#0a101d] border-t border-slate-800/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                SPEC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold font-mono text-white">
                    {selectedNodeSpec.label}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 border border-slate-700 text-cyan-300">
                    {selectedNodeSpec.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {selectedNodeSpec.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Target SLA:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {selectedNodeSpec.targetSla}
              </span>
            </div>
          </div>

          {/* Grid of Concrete Metrics with Tabular Nums */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Technology
              </div>
              <div className="text-xs font-mono text-slate-200 font-semibold mt-1 truncate">
                {selectedNodeSpec.technology}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Concurrency Model
              </div>
              <div className="text-xs font-mono text-cyan-300 font-semibold mt-1 truncate">
                {selectedNodeSpec.concurrencyModel}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  P99 Latency
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SLO Nominal
                </span>
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold mt-1 tabular-nums">
                {selectedNodeSpec.p99Latency}
              </div>
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[45%]" title="p50 percentile" />
                  <div className="bg-teal-400 h-full w-[35%]" title="p95 percentile" />
                  <div className="bg-cyan-400 h-full w-[20%]" title="p99 percentile" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>p50</span>
                  <span>p95</span>
                  <span>p99</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Throughput
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="text-xs font-mono text-amber-400 font-bold mt-1 tabular-nums">
                {selectedNodeSpec.throughput}
              </div>
              <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                <span>Availability SLA</span>
                <span className="text-slate-300 font-semibold">99.99%</span>
              </div>
            </div>
          </div>

          {/* Resilience Pattern & Deep Dive */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Resilience Pattern</span>
              </div>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {selectedNodeSpec.resiliencePattern}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Architecture Deep Dive</span>
              </div>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {selectedNodeSpec.deepDive}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ByteByteGoWorkbench
