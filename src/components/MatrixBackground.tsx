import { useEffect, useRef, useState } from 'react'

interface MatrixBackgroundProps {
  speed?: number
}

export default function MatrixBackground({ speed = 35 }: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    
    let width = (canvas.width = window.innerWidth * dpr)
    let height = (canvas.height = window.innerHeight * dpr)
    ctx.scale(dpr, dpr)

    const isMobile = window.innerWidth < 768
    const characters = '0123456789ABCDEFJAVA<>{}/*$=+-_[]!@#%^&;MEENAKANNAN'
    const fontSize = isMobile ? 18 : 14
    let columns = Math.floor(window.innerWidth / fontSize)
    let drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50)
    }

    const handleResize = () => {
      if (!canvas) return
      const mobileCheck = window.innerWidth < 768
      const currentFontSize = mobileCheck ? 18 : 14
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      columns = Math.floor(window.innerWidth / currentFontSize)
      drops = []
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50)
      }
    }

    window.addEventListener('resize', handleResize)

    let lastDraw = Date.now()
    const frameSpeed = isMobile ? Math.max(speed, 45) : speed

    const draw = () => {
      const now = Date.now()
      if (now - lastDraw >= frameSpeed) {
        lastDraw = now

        // Translucent background fade trails
        ctx.fillStyle = 'rgba(3, 7, 4, 0.08)'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

        for (let i = 0; i < drops.length; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length))
          const y = drops[i] * fontSize
          
          if (Math.random() > 0.88) {
            ctx.fillStyle = '#86efac' // Bright head
            if (!isMobile) {
              ctx.shadowBlur = 6
              ctx.shadowColor = '#4ade80'
            }
          } else {
            ctx.fillStyle = '#16a34a' // Tail stream
            if (!isMobile) {
              ctx.shadowBlur = 0
            }
          }

          ctx.fillText(char, i * fontSize, y)

          if (y > window.innerHeight && Math.random() > 0.975) {
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
  }, [speed])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        style={{ width: '100vw', height: '100vh' }}
        className="opacity-25 transition-opacity duration-1000"
      />
      {/* Subtle futuristic tech grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `linear-gradient(to right, #22c55e 1px, transparent 1px), linear-gradient(to bottom, #22c55e 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
      {/* Ambient Vignette Gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />
    </div>
  )
}
