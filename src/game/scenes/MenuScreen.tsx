import { useEffect, useRef } from 'react'

interface MenuScreenProps {
  onNavigate: (screen: string) => void
}

export default function MenuScreen({ onNavigate }: MenuScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // メニューボタンの定義
    const buttons = [
      { label: 'ストーリー', sublabel: 'STORY', screen: 'story', color: '#00ffff', icon: '📖' },
      { label: 'バトル', sublabel: 'BATTLE', screen: 'battle', color: '#ff4444', icon: '⚔️' },
      { label: 'ガチャ', sublabel: 'GACHA', screen: 'gacha', color: '#ffaa00', icon: '🎲' },
      { label: '編成', sublabel: 'TEAM', screen: 'team', color: '#00ff88', icon: '👥' },
    ]

    const buttonWidth = 280
    const buttonHeight = 70
    const gap = 20
    const startY = canvas.height / 2 - ((buttonHeight + gap) * buttons.length) / 2 + 40

    // ボタンの座標を保存
    const buttonRects = buttons.map((_, i) => ({
      x: canvas.width / 2 - buttonWidth / 2,
      y: startY + i * (buttonHeight + gap),
      w: buttonWidth,
      h: buttonHeight,
    }))

    // パーティクル
    const particles: { x: number; y: number; speed: number; size: number; color: string; alpha: number }[] = []
    const particleColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88']

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 0.3 + 0.1,
        size: Math.random() * 2 + 0.5,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    let elapsed = 0
    let hoveredIndex = -1
    let animationId: number

    const draw = () => {
      elapsed += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 背景
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      )
      bgGrad.addColorStop(0, '#0f0f2a')
      bgGrad.addColorStop(1, '#050510')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // パーティクル
      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        ctx.globalAlpha = p.alpha + Math.sin(elapsed + p.x * 0.01) * 0.1
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // タイトルロゴ（小さめ）
      const logoY = startY - 80
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const logoGrad = ctx.createLinearGradient(
        canvas.width / 2 - 80, logoY,
        canvas.width / 2 + 80, logoY
      )
      logoGrad.addColorStop(0, '#00ffff')
      logoGrad.addColorStop(1, '#ff00ff')
      ctx.fillStyle = logoGrad
      ctx.fillText('S E N S', canvas.width / 2, logoY)

      // 区切り線
      ctx.strokeStyle = '#333355'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 140, logoY + 30)
      ctx.lineTo(canvas.width / 2 + 140, logoY + 30)
      ctx.stroke()

      // ボタン描画
      buttons.forEach((btn, i) => {
        const rect = buttonRects[i]
        const isHovered = hoveredIndex === i
        const bounce = isHovered ? Math.sin(elapsed * 5) * 2 : 0
        const scale = isHovered ? 1.03 : 1
        const drawX = rect.x - (rect.w * (scale - 1)) / 2
        const drawY = rect.y - (rect.h * (scale - 1)) / 2 + bounce
        const drawW = rect.w * scale
        const drawH = rect.h * scale

        // ボタン背景
        ctx.globalAlpha = isHovered ? 0.95 : 0.8
        const btnGrad = ctx.createLinearGradient(drawX, drawY, drawX + drawW, drawY)
        btnGrad.addColorStop(0, '#1a1a3a')
        btnGrad.addColorStop(1, '#12122a')
        ctx.fillStyle = btnGrad

        // 角丸
        const radius = 12
        ctx.beginPath()
        ctx.moveTo(drawX + radius, drawY)
        ctx.lineTo(drawX + drawW - radius, drawY)
        ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + radius)
        ctx.lineTo(drawX + drawW, drawY + drawH - radius)
        ctx.quadraticCurveTo(drawX + drawW, drawY + drawH, drawX + drawW - radius, drawY + drawH)
        ctx.lineTo(drawX + radius, drawY + drawH)
        ctx.quadraticCurveTo(drawX, drawY + drawH, drawX, drawY + drawH - radius)
        ctx.lineTo(drawX, drawY + radius)
        ctx.quadraticCurveTo(drawX, drawY, drawX + radius, drawY)
        ctx.closePath()
        ctx.fill()

        // ボタン枠線
        ctx.globalAlpha = isHovered ? 0.9 : 0.4
        ctx.strokeStyle = btn.color
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.stroke()

        ctx.globalAlpha = 1

        // アイコン
        ctx.font = '28px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(btn.icon, drawX + 20, drawY + drawH / 2)

        // ラベル
        ctx.font = 'bold 22px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.fillText(btn.label, drawX + 60, drawY + drawH / 2 - 8)

        // サブラベル
        ctx.font = '12px Arial'
        ctx.fillStyle = '#666688'
        ctx.fillText(btn.sublabel, drawX + 62, drawY + drawH / 2 + 14)

        // 右矢印
        ctx.font = '18px Arial'
        ctx.fillStyle = isHovered ? btn.color : '#444466'
        ctx.textAlign = 'right'
        ctx.fillText('▶', drawX + drawW - 20, drawY + drawH / 2)
      })

      // プレイヤー情報バー
      ctx.globalAlpha = 0.7
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)
      ctx.globalAlpha = 1

      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#888888'
      ctx.fillText('甘利 悠真  |  Lv.1  |  D級  |  味覚', 20, canvas.height - 22)

      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffaa00'
      ctx.fillText('💎 1000', canvas.width - 20, canvas.height - 22)

      animationId = requestAnimationFrame(draw)
    }

    draw()

    // マウスホバー検出
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      hoveredIndex = -1
      buttonRects.forEach((r, i) => {
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          hoveredIndex = i
          canvas.style.cursor = 'pointer'
        }
      })
      if (hoveredIndex === -1) canvas.style.cursor = 'default'
    }

    // クリック検出
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      buttonRects.forEach((r, i) => {
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          onNavigate(buttons[i].screen)
        }
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
    }
  }, [onNavigate])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}