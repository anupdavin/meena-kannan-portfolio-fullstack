import React from 'react'

export interface BoundaryContainerProps {
  id?: string
  x: number
  y: number
  width: number
  height: number
  label: string
  sublabel?: string
  accentColor?: string
  strokeDasharray?: string
  rx?: number
}

export const BoundaryContainer: React.FC<BoundaryContainerProps> = ({
  id,
  x,
  y,
  width,
  height,
  label,
  sublabel,
  accentColor = '#38bdf8',
  strokeDasharray = '6 4',
  rx = 12
}) => {
  return (
    <g id={id} className="pointer-events-none select-none">
      {/* 1. Subtle Boundary Background Fill */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill="#080e1a"
        fillOpacity="0.45"
        stroke={accentColor}
        strokeWidth="1.2"
        strokeDasharray={strokeDasharray}
        strokeOpacity="0.4"
      />

      {/* 2. Top-Left Monospace Boundary Header Pill */}
      <g transform={`translate(${x + 12}, ${y - 10})`}>
        <rect
          x="0"
          y="0"
          width={Math.max(120, label.length * 7.2 + 24)}
          height="20"
          rx="5"
          fill="#06090e"
          stroke={accentColor}
          strokeWidth="0.9"
          strokeOpacity="0.75"
        />
        <circle cx="10" cy="10" r="3" fill={accentColor} />
        <text
          x="18"
          y="13.5"
          fill="#cbd5e1"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="0.4px"
        >
          {label}
        </text>
      </g>

      {/* Optional Sublabel at Top-Right */}
      {sublabel && (
        <text
          x={x + width - 12}
          y={y + 14}
          fill="#64748b"
          fontSize="8.5"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}

export interface DatabaseCylinderProps {
  x: number
  y: number
  width: number
  height: number
  label: string
  sublabel?: string
  accentColor?: string
  isHighlighted?: boolean
  isChaos?: boolean
  onClick?: () => void
  walStatus?: string
}

export const DatabaseCylinder: React.FC<DatabaseCylinderProps> = ({
  x,
  y,
  width,
  height,
  label,
  sublabel = 'ACID / WAL',
  accentColor = '#10b981',
  isHighlighted = false,
  isChaos = false,
  onClick,
  walStatus = 'WAL: 0 lag'
}) => {
  const color = isChaos ? '#f43f5e' : isHighlighted ? accentColor : '#64748b'
  const glow = isChaos ? 'url(#glow-rose)' : isHighlighted ? 'url(#glow-emerald)' : undefined
  const ry = Math.min(18, height * 0.14)
  const bodyHeight = height - ry * 2

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer select-none transition-all duration-300"
      filter={glow}
    >
      {/* Outer Card Contour for layout grounding */}
      <rect
        x="-4"
        y="-4"
        width={width + 8}
        height={height + 8}
        rx="10"
        fill="#0b1120"
        fillOpacity="0.8"
        stroke={isHighlighted ? color : '#1e293b'}
        strokeWidth={isHighlighted ? '1.8' : '1'}
        className="transition-colors duration-200"
      />

      {/* 3D Multi-Layer Cylinder Base */}
      <g transform="translate(10, 8)">
        {/* Platter Layer 3 (Bottom) */}
        <path
          d={`M 0 ${ry + bodyHeight} 
             A ${width * 0.38} ${ry} 0 0 0 ${width * 0.76} ${ry + bodyHeight} 
             v -${bodyHeight * 0.28} 
             A ${width * 0.38} ${ry} 0 0 1 0 ${ry + bodyHeight * 0.72} 
             Z`}
          fill="#0f172a"
          stroke={color}
          strokeWidth="1.2"
        />

        {/* Platter Layer 2 (Middle) */}
        <path
          d={`M 0 ${ry + bodyHeight * 0.62} 
             A ${width * 0.38} ${ry} 0 0 0 ${width * 0.76} ${ry + bodyHeight * 0.62} 
             v -${bodyHeight * 0.28} 
             A ${width * 0.38} ${ry} 0 0 1 0 ${ry + bodyHeight * 0.34} 
             Z`}
          fill="#111c33"
          stroke={color}
          strokeWidth="1.2"
        />

        {/* Platter Layer 1 (Top Body) */}
        <path
          d={`M 0 ${ry} 
             v ${bodyHeight * 0.34} 
             A ${width * 0.38} ${ry} 0 0 0 ${width * 0.76} ${ry + bodyHeight * 0.34} 
             v -${bodyHeight * 0.34} 
             Z`}
          fill="#1e293b"
          stroke={color}
          strokeWidth="1.2"
        />

        {/* Top Disc Cap */}
        <ellipse
          cx={width * 0.38}
          cy={ry}
          rx={width * 0.38}
          ry={ry}
          fill={isHighlighted ? '#134e4a' : '#1e293b'}
          stroke={color}
          strokeWidth="1.5"
        />

        {/* Disk Spin / Sync Indicator Rings */}
        <ellipse
          cx={width * 0.38}
          cy={ry}
          rx={width * 0.22}
          ry={ry * 0.55}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        <circle cx={width * 0.38} cy={ry} r="2.5" fill={color} />
      </g>

      {/* Semantic Text Content */}
      <g transform={`translate(${width * 0.44}, 18)`}>
        <text
          x="12"
          y="10"
          fill="#f8fafc"
          fontSize="11"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>

        <text
          x="12"
          y="25"
          fill="#94a3b8"
          fontSize="8.5"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
        >
          {sublabel}
        </text>

        {/* ACID / WAL Status Chip */}
        <g transform="translate(12, 34)">
          <rect
            x="0"
            y="0"
            width={width * 0.48}
            height="17"
            rx="3.5"
            fill={isChaos ? '#4c0519' : '#062d27'}
            stroke={isChaos ? '#f43f5e' : '#10b981'}
            strokeWidth="0.8"
          />
          <text
            x="6"
            y="11.5"
            fill={isChaos ? '#fda4af' : '#6ee7b7'}
            fontSize="8"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
            className="tabular-nums"
          >
            {isChaos ? 'IO DEGRADE: RETRY' : walStatus}
          </text>
        </g>
      </g>
    </g>
  )
}

export interface KafkaPartitionPipeProps {
  x: number
  y: number
  width: number
  height: number
  label?: string
  partitions?: string[]
  activePartition?: number
  isChaos?: boolean
  onClick?: () => void
}

export const KafkaPartitionPipe: React.FC<KafkaPartitionPipeProps> = ({
  x,
  y,
  width,
  height,
  label = 'Apache Kafka 3.6',
  partitions = ['Partition 0 [Offset: 18420]', 'Partition 1 [Offset: 18419]', 'Partition 2 [Offset: 18422]'],
  activePartition = 1,
  isChaos = false,
  onClick
}) => {
  const laneHeight = (height - 38) / Math.max(1, partitions.length)
  const baseColor = isChaos ? '#f43f5e' : '#f59e0b'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer select-none"
    >
      {/* Pipe Background Chassis */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="10"
        fill="#0b1120"
        fillOpacity="0.9"
        stroke={isChaos ? '#f43f5e' : '#1e293b'}
        strokeWidth="1.2"
      />

      {/* Header Monospace Title Bar */}
      <g transform="translate(10, 8)">
        <rect
          x="0"
          y="0"
          width="18"
          height="14"
          rx="3"
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="0.8"
        />
        <text
          x="9"
          y="10.5"
          fill="#fbbf24"
          fontSize="8.5"
          fontWeight="800"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          K
        </text>
        <text
          x="26"
          y="11"
          fill="#f8fafc"
          fontSize="10"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
        <text
          x={width - 24}
          y="11"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
          className="tabular-nums"
        >
          {isChaos ? 'DLQ ACTIVE' : '3 In-Sync Replicas'}
        </text>
      </g>

      {/* Horizontal Multi-Lane Partitioned Pipes */}
      <g transform="translate(10, 28)">
        {partitions.map((partName, idx) => {
          const isActive = idx === activePartition
          const laneY = idx * (laneHeight + 3)
          return (
            <g key={idx} transform={`translate(0, ${laneY})`}>
              {/* Lane Rail Pipe */}
              <rect
                x="0"
                y="0"
                width={width - 20}
                height={laneHeight}
                rx="5"
                fill={isActive ? (isChaos ? '#371018' : '#1d1908') : '#070c17'}
                stroke={isActive ? baseColor : '#1e293b'}
                strokeWidth={isActive ? '1.4' : '0.9'}
                strokeDasharray={isActive ? 'none' : '4 3'}
              />

              {/* Offset Segment Blocks inside the lane */}
              {[0, 1, 2, 3].map((segIdx) => (
                <rect
                  key={segIdx}
                  x={width - 90 + segIdx * 16}
                  y="4"
                  width="12"
                  height={laneHeight - 8}
                  rx="2"
                  fill={isActive && segIdx === 3 ? baseColor : '#1e293b'}
                  fillOpacity={isActive ? 0.9 : 0.4}
                />
              ))}

              {/* Partition Text & Active Offset */}
              <text
                x="8"
                y={laneHeight * 0.62}
                fill={isActive ? (isChaos ? '#fca5a5' : '#fde68a') : '#94a3b8'}
                fontSize="8.5"
                fontWeight={isActive ? '700' : '500'}
                fontFamily="JetBrains Mono, monospace"
                className="tabular-nums"
              >
                {partName}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}

export interface HexShieldGatewayProps {
  cx: number
  cy: number
  radius: number
  label: string
  sublabel?: string
  bucketFill?: number
  isHighlighted?: boolean
  isChaos?: boolean
  onClick?: () => void
  rateLimitStatus?: string
}

export const HexShieldGateway: React.FC<HexShieldGatewayProps> = ({
  cx,
  cy,
  radius,
  label,
  sublabel = 'Envoy Proxy v1.29',
  bucketFill = 80,
  isHighlighted = false,
  isChaos = false,
  onClick,
  rateLimitStatus = '10k req/s [OK]'
}) => {
  const accentColor = isChaos ? '#f43f5e' : '#38bdf8'
  const filterGlow = isChaos ? 'url(#glow-rose)' : isHighlighted ? 'url(#glow-cyan)' : undefined

  // Calculate hexagon vertices
  const points = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const angle = (i * 60 - 30) * (Math.PI / 180)
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')

  const innerPoints = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const angle = (i * 60 - 30) * (Math.PI / 180)
      const x = cx + (radius - 5) * Math.cos(angle)
      const y = cy + (radius - 5) * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <g
      onClick={onClick}
      className="cursor-pointer select-none transition-all duration-300"
      filter={filterGlow}
    >
      {/* Outer Hexagon Shield Perimeter */}
      <polygon
        points={points}
        fill="#08101e"
        stroke={accentColor}
        strokeWidth={isHighlighted ? '2' : '1.2'}
        className="transition-colors duration-200"
      />
      <polygon
        points={innerPoints}
        fill="#0b162b"
        fillOpacity="0.8"
        stroke="#1e293b"
        strokeWidth="1"
      />

      {/* Internal Token Bucket Gauge Indicator */}
      <g transform={`translate(${cx - 18}, ${cy - 24})`}>
        {/* Bucket Outline */}
        <path
          d="M 2 4 L 34 4 L 28 22 L 8 22 Z"
          fill="#061224"
          stroke={accentColor}
          strokeWidth="1"
        />
        {/* Bucket Water / Fill Level */}
        <path
          d={`M ${4 + (100 - bucketFill) * 0.04} ${22 - bucketFill * 0.16} 
             L ${32 - (100 - bucketFill) * 0.04} ${22 - bucketFill * 0.16} 
             L 28 22 L 8 22 Z`}
          fill={isChaos ? '#f43f5e' : '#38bdf8'}
          fillOpacity="0.75"
        />
      </g>

      {/* Typography */}
      <text
        x={cx}
        y={cy + 8}
        fill="#f8fafc"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
      >
        {label}
      </text>

      <text
        x={cx}
        y={cy + 20}
        fill="#94a3b8"
        fontSize="8"
        fontWeight="500"
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
      >
        {sublabel}
      </text>

      {/* Rate Limiter Status Chip Below Shield */}
      <g transform={`translate(${cx - 52}, ${cy + radius + 6})`}>
        <rect
          x="0"
          y="0"
          width="104"
          height="16"
          rx="3.5"
          fill={isChaos ? '#4c0519' : '#082f49'}
          stroke={accentColor}
          strokeWidth="0.8"
        />
        <text
          x="52"
          y="11"
          fill={isChaos ? '#fda4af' : '#7dd3fc'}
          fontSize="7.5"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          className="tabular-nums"
        >
          {isChaos ? 'HTTP 429 SHED' : rateLimitStatus}
        </text>
      </g>
    </g>
  )
}

export interface RedisMemoryGridProps {
  x: number
  y: number
  width: number
  height: number
  label?: string
  sublabel?: string
  ttlStatus?: string
  isHighlighted?: boolean
  isChaos?: boolean
  onClick?: () => void
}

export const RedisMemoryGrid: React.FC<RedisMemoryGridProps> = ({
  x,
  y,
  width,
  height,
  label = 'Redis 7.2 Shards',
  sublabel = 'In-Memory Cache & Token Store',
  ttlStatus = 'TTL: 300s [99.4% Hit]',
  isHighlighted = false,
  isChaos = false,
  onClick
}) => {
  const filterGlow = isChaos ? 'url(#glow-rose)' : isHighlighted ? 'url(#glow-rose)' : undefined

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer select-none"
      filter={filterGlow}
    >
      {/* Container Card */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="10"
        fill="#0b1120"
        fillOpacity="0.9"
        stroke={isHighlighted ? '#f43f5e' : '#1e293b'}
        strokeWidth={isHighlighted ? '1.8' : '1.2'}
      />

      {/* Monospace Header */}
      <g transform="translate(10, 10)">
        <rect
          x="0"
          y="0"
          width="18"
          height="14"
          rx="3"
          fill="#4c0519"
          stroke="#f43f5e"
          strokeWidth="0.8"
        />
        <text
          x="9"
          y="10.5"
          fill="#fda4af"
          fontSize="8.5"
          fontWeight="800"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          R
        </text>
        <text
          x="26"
          y="11"
          fill="#f8fafc"
          fontSize="10"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      </g>

      <text
        x="12"
        y="35"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="500"
        fontFamily="JetBrains Mono, monospace"
      >
        {sublabel}
      </text>

      {/* Segmented Memory Grid (3 x 4 cells representing key slots) */}
      <g transform="translate(10, 42)">
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const isHot = (row + col) % 3 === 0
            return (
              <rect
                key={`${row}-${col}`}
                x={col * ((width - 24) / 4)}
                y={row * 15}
                width={(width - 32) / 4}
                height="12"
                rx="2"
                fill={isHot ? '#881337' : '#1e293b'}
                fillOpacity={isHot ? 0.85 : 0.45}
                stroke={isHot ? '#f43f5e' : '#334155'}
                strokeWidth="0.6"
              />
            )
          })
        )}
      </g>

      {/* TTL Monospace Indicator */}
      <g transform={`translate(10, ${height - 22})`}>
        <rect
          x="0"
          y="0"
          width={width - 20}
          height="16"
          rx="3"
          fill="#270711"
          stroke="#f43f5e"
          strokeWidth="0.7"
        />
        <text
          x={(width - 20) / 2}
          y="11"
          fill="#fda4af"
          fontSize="7.5"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          className="tabular-nums"
        >
          {isChaos ? 'EVICTION PRESSURE: 94%' : ttlStatus}
        </text>
      </g>
    </g>
  )
}

export interface SequenceBadgeProps {
  step: number | string
  cx: number
  cy: number
  protocol: string
  color?: string
  isActive?: boolean
  isChaos?: boolean
}

export const SequenceBadge: React.FC<SequenceBadgeProps> = ({
  step,
  cx,
  cy,
  protocol,
  color = '#38bdf8',
  isActive = false,
  isChaos = false
}) => {
  const badgeColor = isChaos ? '#f43f5e' : color

  return (
    <g transform={`translate(${cx}, ${cy})`} className="select-none pointer-events-none">
      {/* Outer Pulse Wave if active */}
      {isActive && (
        <circle cx="0" cy="0" r="15" fill="none" stroke={badgeColor} strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Number Badge Circle */}
      <circle
        cx="0"
        cy="0"
        r="11"
        fill="#06090e"
        stroke={badgeColor}
        strokeWidth={isActive ? '2' : '1.2'}
        filter={isActive ? 'url(#glow-cyan)' : undefined}
      />
      <text
        x="0"
        y="4"
        fill="#f8fafc"
        fontSize="10"
        fontWeight="800"
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
      >
        {step}
      </text>

      {/* Protocol Monospace Pill Tag */}
      <g transform="translate(14, -8)">
        <rect
          x="0"
          y="0"
          width={Math.max(50, protocol.length * 6 + 12)}
          height="16"
          rx="3.5"
          fill="#090f1d"
          stroke={badgeColor}
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        <text
          x={Math.max(50, protocol.length * 6 + 12) / 2}
          y="11"
          fill="#e2e8f0"
          fontSize="8"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          className="tabular-nums"
        >
          {protocol}
        </text>
      </g>
    </g>
  )
}

export interface FlowingConnectionProps {
  id: string
  pathD: string
  isActive?: boolean
  isChaos?: boolean
  color?: string
  duration?: number
  label?: string
  calloutPos?: { x: number; y: number }
}

export const FlowingConnection: React.FC<FlowingConnectionProps> = ({
  id,
  pathD,
  isActive = true,
  isChaos = false,
  color = '#38bdf8',
  duration = 2.0,
  label,
  calloutPos
}) => {
  const wireColor = isChaos ? '#f43f5e' : color

  return (
    <g id={`flow-${id}`} className="transition-opacity duration-300">
      {/* 1. Base Wire: Muted structural path */}
      <path
        d={pathD}
        fill="none"
        stroke={isActive ? '#475569' : '#334155'}
        strokeWidth={isActive ? '2.2' : '1.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Flowing Stream: Overlaid dashed path with moving stroke */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={wireColor}
          strokeWidth="2.2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="system-flow-stream"
          filter={isChaos ? 'url(#glow-rose)' : 'url(#glow-cyan)'}
        />
      )}

      {/* 3. Traveling High-Intensity Packet */}
      {isActive && (
        <g>
          <circle r="4" fill={wireColor} filter={isChaos ? 'url(#glow-rose)' : 'url(#glow-cyan)'}>
            <animateMotion path={pathD} dur={`${duration}s`} repeatCount="indefinite" />
          </circle>
          <circle r="1.8" fill="#ffffff">
            <animateMotion path={pathD} dur={`${duration}s`} repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Optional In-flight Protocol Label */}
      {isActive && label && calloutPos && (
        <g transform={`translate(${calloutPos.x}, ${calloutPos.y - 12})`}>
          <rect
            x={-(label.length * 3.5 + 8)}
            y="-9"
            width={label.length * 7 + 16}
            height="18"
            rx="4"
            fill="#06090e"
            stroke={wireColor}
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="3.5"
            fill="#cbd5e1"
            fontSize="8"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
            className="tabular-nums"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

export const SvgGlowFilters: React.FC = () => {
  return (
    <defs>
      {/* Cyan Glow */}
      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.6" />
      </filter>
      {/* Emerald Glow */}
      <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.6" />
      </filter>
      {/* Amber Glow */}
      <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.6" />
      </filter>
      {/* Rose Glow */}
      <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.65" />
      </filter>
      {/* Purple Glow */}
      <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.6" />
      </filter>
      {/* Dot Blueprint Pattern */}
      <pattern id="arch-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="0.9" fill="#1e293b" fillOpacity="0.7" />
      </pattern>
    </defs>
  )
}
