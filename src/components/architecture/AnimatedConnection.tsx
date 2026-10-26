import React from 'react'

export type PacketType = 'cyan' | 'emerald' | 'amber' | 'purple'

export interface AnimatedConnectionProps {
  id: string
  pathD: string
  packetType?: PacketType
  isActive: boolean
  isDimmed: boolean
  calloutBadge?: string
  calloutPos?: { x: number; y: number }
  duration?: number
  label?: string
}

const PACKET_COLORS: Record<PacketType, { hex: string; glowId: string }> = {
  cyan: { hex: '#38BDF8', glowId: 'glow-cyan' },
  emerald: { hex: '#10B981', glowId: 'glow-emerald' },
  amber: { hex: '#F59E0B', glowId: 'glow-amber' },
  purple: { hex: '#A855F7', glowId: 'glow-purple' }
}

export const AnimatedConnection: React.FC<AnimatedConnectionProps> = ({
  id,
  pathD,
  packetType = 'cyan',
  isActive,
  isDimmed,
  calloutBadge,
  calloutPos,
  duration = 2.0,
  label
}) => {
  const packetColor = PACKET_COLORS[packetType] || PACKET_COLORS.cyan
  const opacity = isDimmed && !isActive ? 0.25 : 1

  return (
    <g id={`connection-${id}`} opacity={opacity} className="transition-opacity duration-300">
      {/* 1. Base Wire: Muted structural path */}
      <path
        d={pathD}
        fill="none"
        stroke={isActive ? '#475569' : '#334155'}
        strokeWidth={isActive ? '2.5' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Flowing Dashed Stream: Overlaid SVG path with animated dashoffset */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={packetColor.hex}
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="system-flow-stream"
          filter={`url(#${packetColor.glowId})`}
        />
      )}

      {/* 3. Animated Data Packet: Traveling circle with glowing drop-shadow */}
      {isActive && (
        <g>
          <circle
            r="4.5"
            fill={packetColor.hex}
            filter={`url(#${packetColor.glowId})`}
          >
            <animateMotion
              path={pathD}
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </circle>

          {/* Core high-intensity particle center */}
          <circle r="2" fill="#FFFFFF">
            <animateMotion
              path={pathD}
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Wire Label (if present and active) */}
      {isActive && label && calloutPos && (
        <g transform={`translate(${calloutPos.x}, ${calloutPos.y - 14})`}>
          <rect
            x="-30"
            y="-10"
            width="60"
            height="15"
            rx="3"
            fill="#090f1d"
            stroke="#1e293b"
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="1"
            fill="#94a3b8"
            fontSize="8"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      )}

      {/* Numbered Callout Badge (e.g. ①, ②, ③) */}
      {isActive && calloutBadge && calloutPos && (
        <g transform={`translate(${calloutPos.x}, ${calloutPos.y})`} className="select-none">
          {/* Badge Background Circle */}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="#060e1a"
            stroke={packetColor.hex}
            strokeWidth="2"
            filter={`url(#${packetColor.glowId})`}
          />
          {/* Pulse Ripple */}
          <circle
            cx="0"
            cy="0"
            r="16"
            fill="none"
            stroke={packetColor.hex}
            strokeWidth="1"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="12;20;12"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Badge Number / Glyph */}
          <text
            x="0"
            y="4"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="800"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
          >
            {calloutBadge}
          </text>
        </g>
      )}
    </g>
  )
}

export default AnimatedConnection