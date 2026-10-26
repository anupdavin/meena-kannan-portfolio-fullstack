import { useEffect, useRef } from 'react'

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
    
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
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
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      columns = Math.floor(window.innerWidth / currentFontSize)
      drops = []
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50)
      }
    }

    window.addEventListener('resize', handleResize)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      // Paint single subtle static backdrop frame and bypass continuous animation loop
      ctx.fillStyle = 'rgba(6, 9, 14, 0.95)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    let lastDraw = Date.now()
    const frameSpeed = isMobile ? Math.max(speed, 45) : speed

    const draw = () => {
      const now = Date.now()
      if (now - lastDraw >= frameSpeed) {
        lastDraw = now

        // Translucent background fade trails
        ctx.fillStyle = 'rgba(6, 9, 14, 0.1)'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

        for (let i = 0; i < drops.length; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length))
          const y = drops[i] * fontSize
          
          if (Math.random() > 0.92) {
            ctx.fillStyle = '#34d399' // Bright teal/emerald head
            if (!isMobile) {
              ctx.shadowBlur = 4
              ctx.shadowColor = '#10b981'
            }
          } else {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)' // Subtle dim stream
            if (!isMobile) {
              ctx.shadowBlur = 0
            }
          }

          ctx.fillText(char, i * fontSize, y)

          if (y > window.innerHeight && Math.random() > 0.985) {
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#06090e]">
      <canvas 
        ref={canvasRef} 
        style={{ width: '100vw', height: '100vh' }}
        className="opacity-15 transition-opacity duration-1000"
      />
      {/* Subtle modern engineering dot grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* Ambient Radial Mesh Diffusions */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none" />
    </div>
  )
}
