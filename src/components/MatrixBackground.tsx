import { useEffect, useRef, useState } from 'react'

interface MatrixBackgroundProps {
  speed?: number
  density?: number
}

export default function MatrixBackground({ speed = 33 }: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const characters = '0123456789ABCDEFJAVA<>{}/*$=+-_[]!@#%^&;MEENAKANNAN'
    const fontSize = 14
    let columns = Math.floor(width / fontSize)
    let drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50)
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      columns = Math.floor(width / fontSize)
      drops = []
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50)
      }
    }

    window.addEventListener('resize', handleResize)

    let lastDraw = Date.now()

    const draw = () => {
      const now = Date.now()
      if (now - lastDraw >= speed && !isPaused) {
        lastDraw = now

        // Translucent background to show fade trails
        ctx.fillStyle = 'rgba(3, 7, 4, 0.08)'
        ctx.fillRect(0, 0, width, height)

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

        for (let i = 0; i < drops.length; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length))
          
          // Head of the drop is bright white/emerald, tail is darker green
          const y = drops[i] * fontSize
          
          if (Math.random() > 0.85) {
            ctx.fillStyle = '#bbf7d0' // Bright head
            ctx.shadowBlur = 8
            ctx.shadowColor = '#4ade80'
          } else {
            ctx.fillStyle = '#22c55e'
            ctx.shadowBlur = 0
          }

          ctx.fillText(char, i * fontSize, y)

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0
          }
          drops[i]++
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    animationFrameId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [speed, isPaused])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-25 transition-opacity duration-1000"
      />
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #22c55e 1px, transparent 1px), linear-gradient(to bottom, #22c55e 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />
    </div>
  )
}
