import { useEffect, useRef, useState } from 'react'

interface StoryScreenProps {
  onBack: () => void
}

// ストーリーデータ
const storyData = [
  {
    speaker: '',
    text: '——あの日、すべてが変わった。',
    bg: '#0a0a1a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: '人間の脳には「第六感覚野」と呼ばれる未知の領域が存在する。',
    bg: '#0a0a1a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: 'その領域が活性化した者は、五感を超常のレベルで操ることができる。',
    bg: '#0a0a1a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: '彼らは「覚醒者」と呼ばれた。',
    bg: '#0a0a1a',
    speakerColor: '#00ffff',
  },
  {
    speaker: '',
    text: 'そして、覚醒に失敗した者は——「ロスト」と化す。',
    bg: '#0f0008',
    speakerColor: '#ff4444',
  },
  {
    speaker: '',
    text: '人間の感覚を喰らう、異形の怪物に。',
    bg: '#0f0008',
    speakerColor: '#ff4444',
  },
  {
    speaker: '',
    text: '———— 現代・東京 ————',
    bg: '#0a0a1a',
    speakerColor: '#888888',
  },
  {
    speaker: '桐生 翔',
    text: 'おい、甘利。お前まだ覚醒もまともにできねぇのかよ。',
    bg: '#0a0a2a',
    speakerColor: '#ff6644',
  },
  {
    speaker: '甘利 悠真',
    text: '……。',
    bg: '#0a0a2a',
    speakerColor: '#00ccff',
  },
  {
    speaker: '桐生 翔',
    text: '味覚だっけ？ハハ、一番使えねぇ感覚じゃん。',
    bg: '#0a0a2a',
    speakerColor: '#ff6644',
  },
  {
    speaker: '',
    text: '（翔の手から嗅覚の力が発動し、周囲に刺激臭が広がる）',
    bg: '#0f0a1a',
    speakerColor: '#aa88ff',
  },
  {
    speaker: '甘利 悠真',
    text: 'っ……！',
    bg: '#0a0a2a',
    speakerColor: '#00ccff',
  },
  {
    speaker: '桐生 翔',
    text: 'これが能力の差だよ。お前に覚醒者は無理だ。諦めな。',
    bg: '#0a0a2a',
    speakerColor: '#ff6644',
  },
  {
    speaker: '',
    text: '悠真は拳を握りしめた。悔しさで視界が歪む。',
    bg: '#0a0a2a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: '身体能力は翔と変わらない。だが、能力の差が圧倒的だった。',
    bg: '#0a0a2a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: 'この時、悠真はまだ知らなかった。',
    bg: '#0a0a1a',
    speakerColor: '#ffffff',
  },
  {
    speaker: '',
    text: '自分の中に眠る、誰も予想しなかった力の存在を——。',
    bg: '#0a0a1a',
    speakerColor: '#00ffff',
  },
  {
    speaker: '',
    text: '第1章「覚醒」——  つづく',
    bg: '#000000',
    speakerColor: '#ffffff',
  },
]

export default function StoryScreen({ onBack }: StoryScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentLine, setCurrentLine] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // テキスト送り
  const handleAdvance = () => {
    if (isTyping) {
      // タイピング中ならテキストを全部表示
      setDisplayedText(storyData[currentLine].text)
      setIsTyping(false)
    } else if (currentLine < storyData.length - 1) {
      setCurrentLine(prev => prev + 1)
      setIsTyping(true)
      setDisplayedText('')
    } else {
      onBack()
    }
  }

  // タイピングエフェクト
  useEffect(() => {
    if (!isTyping) return

    const fullText = storyData[currentLine].text
    let charIndex = 0

    const timer = setInterval(() => {
      charIndex++
      setDisplayedText(fullText.slice(0, charIndex))
      if (charIndex >= fullText.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 40)

    return () => clearInterval(timer)
  }, [currentLine, isTyping])

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const line = storyData[currentLine]

    let elapsed = 0
    let animationId: number

    const draw = () => {
      elapsed += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 背景
      ctx.fillStyle = line.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 背景パーティクル（ナレーション時のみ）
      if (!line.speaker) {
        for (let i = 0; i < 20; i++) {
          const px = (Math.sin(elapsed * 0.5 + i * 1.5) * 0.5 + 0.5) * canvas.width
          const py = (Math.cos(elapsed * 0.3 + i * 2.1) * 0.5 + 0.5) * canvas.height
          ctx.globalAlpha = 0.15 + Math.sin(elapsed + i) * 0.1
          ctx.fillStyle = line.speakerColor
          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // キャラ立ち絵エリア（仮：シルエット）
      if (line.speaker) {
        const silX = line.speaker === '甘利 悠真' ? canvas.width * 0.3 : canvas.width * 0.7
        const silY = canvas.height * 0.25

        // シルエット円
        ctx.globalAlpha = 0.3
        const silGrad = ctx.createRadialGradient(silX, silY + 60, 0, silX, silY + 60, 80)
        silGrad.addColorStop(0, line.speakerColor)
        silGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = silGrad
        ctx.beginPath()
        ctx.arc(silX, silY + 60, 80, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        // キャラ名（シルエット上）
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = line.speakerColor
        ctx.fillText(line.speaker, silX, silY - 30)

        // 仮テキスト
        ctx.font = '12px Arial'
        ctx.fillStyle = '#666666'
        ctx.fillText('[ 立ち絵 ]', silX, silY + 65)
      }

      // テキストウィンドウ
      const windowY = canvas.height - 220
      const windowH = 200
      const windowPadding = 30

      // ウィンドウ背景
      ctx.globalAlpha = 0.85
      const winGrad = ctx.createLinearGradient(0, windowY, 0, windowY + windowH)
      winGrad.addColorStop(0, '#0a0a2a')
      winGrad.addColorStop(1, '#050515')
      ctx.fillStyle = winGrad
      ctx.fillRect(0, windowY, canvas.width, windowH)
      ctx.globalAlpha = 1

      // ウィンドウ上線
      ctx.strokeStyle = '#333366'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, windowY)
      ctx.lineTo(canvas.width, windowY)
      ctx.stroke()

      // 話者名
      if (line.speaker) {
        // 名前背景
        ctx.fillStyle = '#111133'
        const nameWidth = ctx.measureText(line.speaker).width + 40

        const radius = 6
        const nx = windowPadding
        const ny = windowY - 35
        const nw = nameWidth
        const nh = 30

        ctx.beginPath()
        ctx.moveTo(nx + radius, ny)
        ctx.lineTo(nx + nw - radius, ny)
        ctx.quadraticCurveTo(nx + nw, ny, nx + nw, ny + radius)
        ctx.lineTo(nx + nw, ny + nh)
        ctx.lineTo(nx, ny + nh)
        ctx.lineTo(nx, ny + radius)
        ctx.quadraticCurveTo(nx, ny, nx + radius, ny)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = line.speakerColor
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'left'
        ctx.fillStyle = line.speakerColor
        ctx.fillText(line.speaker, windowPadding + 15, windowY - 15)
      }

      // テキスト本文
      ctx.font = '20px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'

      // テキスト折り返し
      const maxWidth = canvas.width - windowPadding * 2 - 20
      const lineHeight = 32
      const words = displayedText
      let textLine = ''
      let ty = windowY + 45

      for (let i = 0; i < words.length; i++) {
        const testLine = textLine + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(textLine, windowPadding + 10, ty)
          textLine = words[i]
          ty += lineHeight
        } else {
          textLine = testLine
        }
      }
      ctx.fillText(textLine, windowPadding + 10, ty)

      // 次へ▼アイコン（点滅）
      if (!isTyping) {
        ctx.globalAlpha = Math.sin(elapsed * 4) * 0.3 + 0.7
        ctx.font = '16px Arial'
        ctx.textAlign = 'right'
        ctx.fillStyle = '#00ffff'
        ctx.fillText('▼', canvas.width - 30, windowY + windowH - 20)
        ctx.globalAlpha = 1
      }

      // 進捗バー
      const progress = (currentLine + 1) / storyData.length
      ctx.fillStyle = '#111133'
      ctx.fillRect(0, canvas.height - 4, canvas.width, 4)
      ctx.fillStyle = '#00ffff'
      ctx.fillRect(0, canvas.height - 4, canvas.width * progress, 4)

      animationId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentLine, displayedText, isTyping])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleAdvance}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
    />
  )
}