import { useEffect, useRef } from 'react'

interface TitleScreenProps {
  onStart: () => void
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // パーティクル生成
    const particles: { x: number; y: number; speed: number; size: number; color: string; alpha: number }[] = []
    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff4444']

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 0.5 + 0.2,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    let elapsed = 0
    let animationId: number

    const draw = () => {
      elapsed += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 背景
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // パーティクル描画
      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }

        const alpha = p.alpha + Math.sin(elapsed + p.x * 0.01) * 0.2
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // タイトル
      const titleY = centerY - 80 + Math.sin(elapsed) * 5
      ctx.font = 'bold 72px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // グラデーション
      const gradient = ctx.createLinearGradient(centerX - 150, titleY, centerX + 150, titleY)
      gradient.addColorStop(0, '#00ffff')
      gradient.addColorStop(1, '#ff00ff')

      // 影
      ctx.fillStyle = '#000000'
      ctx.fillText('S E N S', centerX + 3, titleY + 3)

      // 本体
      ctx.fillStyle = gradient
      ctx.fillText('S E N S', centerX, titleY)

      // サブタイトル
      ctx.font = '18px Arial'
      ctx.fillStyle = '#888888'
      ctx.fillText('Scientific Enforcement for Neurological Security', centerX, centerY - 10)

      // TAP TO START（点滅）
      const startAlpha = Math.sin(elapsed * 3) * 0.3 + 0.7
      ctx.globalAlpha = startAlpha
      ctx.font = '24px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.letterSpacing = '6px'
      ctx.fillText('TAP TO START', centerX, centerY + 100)
      ctx.globalAlpha = 1

      animationId = requestAnimationFrame(draw)
    }

    draw()

    // リサイズ対応
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onClick={onStart}
      style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
    />
  )
}