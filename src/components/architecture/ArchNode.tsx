import React from 'react'

export interface ArchNodeData {
  id: string
  label: string
  sublabel: string
  role: string
  category: 'client' | 'edge' | 'gateway' | 'lb' | 'compute' | 'event' | 'cache' | 'database' | 'agent' | 'orchestrator' | 'worker' | 'memory' | 'tools'
  x: number
  y: number
  width: number
  height: number
  color: 'cyan' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose'
  iconType: string
  protocol: string
  latencyBadge: string
  techBadge: string
  metricValue: string
  specs?: {
    technology: string
    concurrencyModel: string
    resiliencePattern: string
    disasterRecovery?: string
    targetSla: string
    deepDive: string
  }
}

interface ArchNodeProps {
  node: ArchNodeData
  isActive: boolean
  isDimmed: boolean
  isChaosAffected?: boolean
  onClick?: () => void
}

const COLOR_MAP = {
  cyan: {
    border: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.45)',
    badgeBg: '#082f49',
    badgeText: '#38bdf8',
    led: '#38bdf8'
  },
  emerald: {
    border: '#10B981',
    glow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: '#064e3b',
    badgeText: '#34d399',
    led: '#10b981'
  },
  amber: {
    border: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.45)',
    badgeBg: '#451a03',
    badgeText: '#fbbf24',
    led: '#f59e0b'
  },
  purple: {
    border: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.45)',
    badgeBg: '#3b0764',
    badgeText: '#c084fc',
    led: '#a855f7'
  },
  blue: {
    border: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.45)',
    badgeBg: '#172554',
    badgeText: '#60a5fa',
    led: '#3b82f6'
  },
  rose: {
    border: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.45)',
    badgeBg: '#4c0519',
    badgeText: '#fb7185',
    led: '#f43f5e'
  }
}

function renderTechIcon(iconType: string, color: string) {
  switch (iconType) {
    case 'client':
    case 'mobile':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <line x1="2" y1="19" x2="22" y2="19" />
          <line x1="9" y1="16" x2="9" y2="19" />
          <line x1="15" y1="16" x2="15" y2="19" />
        </g>
      )
    case 'cloudflare':
    case 'cdn':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a5 5 0 0 1-.3-9.98 7 7 0 0 1 13.56-1.57A4.5 4.5 0 0 1 17.5 19z" />
          <path d="M12 12l2 2 4-4" />
        </g>
      )
    case 'gateway':
    case 'shield':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2.5" />
        </g>
      )
    case 'nginx':
    case 'lb':
    case 'server':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <circle cx="7" cy="7" r="1" fill={color} />
          <circle cx="7" cy="17" r="1" fill={color} />
          <line x1="14" y1="7" x2="18" y2="7" />
          <line x1="14" y1="17" x2="18" y2="17" />
        </g>
      )
    case 'microservices':
    case 'java':
    case 'springboot':
    case 'cpu':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="5" />
          <line x1="15" y1="1" x2="15" y2="5" />
          <line x1="9" y1="19" x2="9" y2="23" />
          <line x1="15" y1="19" x2="15" y2="23" />
          <line x1="1" y1="9" x2="5" y2="9" />
          <line x1="1" y1="15" x2="5" y2="15" />
          <line x1="19" y1="9" x2="23" y2="9" />
          <line x1="19" y1="15" x2="23" y2="15" />
        </g>
      )
    case 'kafka':
    case 'event':
    case 'queue':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </g>
      )
    case 'redis':
    case 'cache':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.2" />
        </g>
      )
    case 'brain':
    case 'orchestrator':
    case 'ai':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
        </g>
      )
    case 'terminal':
    case 'code':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </g>
      )
    case 'search':
    case 'rag':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </g>
      )
    case 'tools':
    case 'wrench':
    case 'mcp':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </g>
      )
    case 'critic':
    case 'eval':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </g>
      )
    case 'hitl':
    case 'user-check':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </g>
      )
    case 'state':
    case 'scratchpad':
    case 'memory':
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </g>
      )
    case 'postgres':
    case 'database':
    case 'db':
    default:
      return (
        <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </g>
      )
  }
}

export const ArchNode: React.FC<ArchNodeProps> = ({
  node,
  isActive,
  isDimmed,
  isChaosAffected = false,
  onClick
}) => {
  const colorCfg = COLOR_MAP[node.color] || COLOR_MAP.cyan
  const borderColor = isChaosAffected
    ? '#EF4444'
    : isActive
    ? colorCfg.border
    : '#1E293B'
  const borderWidth = isActive || isChaosAffected ? '2.5' : '1.5'
  const filterGlow = isChaosAffected
    ? 'url(#glow-chaos)'
    : isActive
    ? `url(#glow-${node.color})`
    : undefined

  const opacity = isDimmed && !isActive && !isChaosAffected ? 0.25 : 1

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      opacity={opacity}
      tabIndex={0}
      role="button"
      aria-label={`Inspect ${node.label} (${node.sublabel})`}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      className="cursor-pointer select-none transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
      style={{ transition: 'opacity 0.3s ease, filter 0.3s ease' }}
    >
      {/* Node Background Rectangle */}
      <rect
        x="0"
        y="0"
        width={node.width}
        height={node.height}
        rx="10"
        fill="#0D1527"
        fillOpacity="0.96"
        stroke={borderColor}
        strokeWidth={borderWidth}
        filter={filterGlow}
      />

      {/* Top Header Strip Container */}
      <g transform="translate(12, 10)">
        {/* Authentic SVG Tech Icon */}
        <g transform="translate(0, 0)">
          {renderTechIcon(node.iconType, isChaosAffected ? '#EF4444' : colorCfg.border)}
        </g>

        {/* Status LED Beacon */}
        <circle
          cx="32"
          cy="12"
          r="3"
          fill={isChaosAffected ? '#EF4444' : isActive ? colorCfg.led : '#475569'}
        />

        {/* Component Title in Bold Monospace (JetBrains Mono style) */}
        <text
          x="42"
          y="15"
          fill="#F8FAFC"
          fontSize="11.5"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="-0.2px"
        >
          {node.label}
        </text>
      </g>

      {/* Sublabel / Technical Role */}
      <text
        x="14"
        y="46"
        fill="#94A3B8"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
      >
        {node.sublabel}
      </text>

      {/* Micro-Badges Row */}
      <g transform="translate(12, 56)">
        {/* Protocol / Latency Badge */}
        <rect
          x="0"
          y="0"
          width={Math.min(node.width - 24, 115)}
          height="18"
          rx="4"
          fill={isChaosAffected ? '#450a0a' : colorCfg.badgeBg}
          stroke={isChaosAffected ? '#dc2626' : colorCfg.border}
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />
        <text
          x="6"
          y="12.5"
          fill={isChaosAffected ? '#fca5a5' : colorCfg.badgeText}
          fontSize="8.5"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
        >
          {isChaosAffected ? 'FAIL: FAULT INJECT' : `${node.protocol} • ${node.latencyBadge}`}
        </text>

        {/* Additional Metric Chip (if node is wide enough) */}
        {node.width >= 240 && (
          <g transform={`translate(${node.width - 128}, 0)`}>
            <rect
              x="0"
              y="0"
              width="104"
              height="18"
              rx="4"
              fill="#09101f"
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            <text
              x="6"
              y="12.5"
              fill="#cbd5e1"
              fontSize="8"
              fontFamily="JetBrains Mono, monospace"
            >
              {node.metricValue}
            </text>
          </g>
        )}
      </g>

      {/* Active Pulse Ring around the Node if active */}
      {isActive && (
        <rect
          x="-3"
          y="-3"
          width={node.width + 6}
          height={node.height + 6}
          rx="13"
          fill="none"
          stroke={colorCfg.border}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.6"
        />
      )}
    </g>
  )
}
export default ArchNode