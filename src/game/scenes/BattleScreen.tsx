import { useEffect, useRef, useState } from 'react'

interface BattleScreenProps {
  onBack: () => void
}

// カードの種類
type CardType = 'attack' | 'defense' | 'heal' | 'buff'

interface Card {
  id: number
  type: CardType
  label: string
  color: string
  icon: string
  star: number
}

// カード生成
function generateCards(count: number): Card[] {
  const types: { type: CardType; label: string; color: string; icon: string }[] = [
    { type: 'attack', label: '攻撃', color: '#ff4444', icon: '⚔️' },
    { type: 'defense', label: '防御', color: '#4488ff', icon: '🛡️' },
    { type: 'heal', label: '回復', color: '#44ff88', icon: '💚' },
    { type: 'buff', label: '強化', color: '#ffaa00', icon: '⬆️' },
  ]

  return Array.from({ length: count }, (_, i) => {
    const t = types[Math.floor(Math.random() * types.length)]
    return { id: i, type: t.type, label: t.label, color: t.color, icon: t.icon, star: 1 }
  })
}

export default function BattleScreen({ onBack }: BattleScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hand, setHand] = useState<Card[]>(() => generateCards(7))
  const [selected, setSelected] = useState<number[]>([])
  const [playerHP, setPlayerHP] = useState(1000)
  const [enemyHP, setEnemyHP] = useState(1000)
  const [turn, setTurn] = useState(1)
  const [phase, setPhase] = useState<'select' | 'attack' | 'result'>('select')
  const [message, setMessage] = useState('カードを3枚選んでください')
  const [playerMaxHP] = useState(1000)
  const [enemyMaxHP] = useState(1000)

  // カード選択
  const handleCardClick = (index: number) => {
    if (phase !== 'select') return

    setSelected(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      }
      if (prev.length >= 3) return prev
      return [...prev, index]
    })
  }

  // ターン実行
  const executeTurn = () => {
    if (selected.length !== 3 || phase !== 'select') return

    setPhase('attack')
    setMessage('攻撃中...')

    const selectedCards = selected.map(i => hand[i])

    // 合成チェック（隣接する同じタイプ）
    let totalDamage = 0
    let totalHeal = 0
    let totalBuff = 0
    let totalDefense = 0

    // 合成判定
    const merged: Card[] = [...selectedCards]
    for (let i = 0; i < merged.length - 1; i++) {
      if (merged[i].type === merged[i + 1].type) {
        merged[i] = { ...merged[i], star: Math.min(merged[i].star + 1, 3) }
        merged.splice(i + 1, 1)
        i--
      }
    }

    for (const card of merged) {
      const power = card.star === 3 ? 200 : card.star === 2 ? 120 : 70

      switch (card.type) {
        case 'attack':
          totalDamage += power
          break
        case 'defense':
          totalDefense += power
          break
        case 'heal':
          totalHeal += power
          break
        case 'buff':
          totalBuff += 30 * card.star
          break
      }
    }

    totalDamage += totalBuff

    // 敵の攻撃（ランダム）
    const enemyDamage = Math.max(0, Math.floor(Math.random() * 150 + 50) - totalDefense)

    setTimeout(() => {
      setEnemyHP(prev => Math.max(0, prev - totalDamage))
      setPlayerHP(prev => Math.min(playerMaxHP, Math.max(0, prev - enemyDamage + totalHeal)))

      const msgs: string[] = []
      if (totalDamage > 0) msgs.push(`${totalDamage}ダメージ！`)
      if (totalHeal > 0) msgs.push(`${totalHeal}回復！`)
      if (totalDefense > 0) msgs.push(`${totalDefense}防御！`)
      if (totalBuff > 0) msgs.push(`攻撃力+${totalBuff}！`)
      msgs.push(`敵の攻撃: ${enemyDamage}ダメージ`)

      setMessage(msgs.join(' | '))
      setPhase('result')
    }, 800)
  }

  // 次のターン
  const nextTurn = () => {
    if (enemyHP <= 0) {
      setMessage('🎉 勝利！')
      return
    }
    if (playerHP <= 0) {
      setMessage('💀 敗北...')
      return
    }

    setTurn(prev => prev + 1)
    setHand(generateCards(7))
    setSelected([])
    setPhase('select')
    setMessage('カードを3枚選んでください')
  }

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let elapsed = 0
    let animationId: number

    const draw = () => {
      elapsed += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const W = canvas.width
      const H = canvas.height

      // 背景
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
      bgGrad.addColorStop(0, '#0a0a2a')
      bgGrad.addColorStop(1, '#050510')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // ===== 上部：敵エリア =====
      // 敵名
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ff6666'
      ctx.fillText('🔴 ロスト Lv.5', 20, 35)

      // 敵HPバー
      const enemyBarX = 20
      const enemyBarY = 50
      const enemyBarW = W * 0.4
      const enemyBarH = 14

      ctx.fillStyle = '#1a1a3a'
      ctx.fillRect(enemyBarX, enemyBarY, enemyBarW, enemyBarH)

      const enemyHPRatio = enemyHP / enemyMaxHP
      const enemyHPColor = enemyHPRatio > 0.5 ? '#ff4444' : enemyHPRatio > 0.2 ? '#ffaa00' : '#ff0000'
      ctx.fillStyle = enemyHPColor
      ctx.fillRect(enemyBarX, enemyBarY, enemyBarW * enemyHPRatio, enemyBarH)

      ctx.strokeStyle = '#333366'
      ctx.lineWidth = 1
      ctx.strokeRect(enemyBarX, enemyBarY, enemyBarW, enemyBarH)

      ctx.font = '12px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.fillText(`${enemyHP} / ${enemyMaxHP}`, enemyBarX + enemyBarW - 5, enemyBarY + 11)

      // 敵シルエット
      const enemyCenterX = W / 2
      const enemyCenterY = H * 0.22

      ctx.globalAlpha = 0.4
      const enemyGrad = ctx.createRadialGradient(enemyCenterX, enemyCenterY, 0, enemyCenterX, enemyCenterY, 70)
      enemyGrad.addColorStop(0, '#ff4444')
      enemyGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = enemyGrad
      ctx.beginPath()
      ctx.arc(enemyCenterX, enemyCenterY, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.font = '40px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('👹', enemyCenterX, enemyCenterY + 15)

      ctx.font = '11px Arial'
      ctx.fillStyle = '#666666'
      ctx.fillText('[ 敵立ち絵 ]', enemyCenterX, enemyCenterY + 45)

      // ===== 中央：バトルフィールド =====
      const fieldY = H * 0.35
      ctx.strokeStyle = '#222244'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, fieldY)
      ctx.lineTo(W - 20, fieldY)
      ctx.stroke()

      // 選択したカード表示エリア
      const selectedY = fieldY + 15
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#666688'
      ctx.fillText(`選択中: ${selected.length} / 3`, W / 2, selectedY + 12)

      if (selected.length > 0) {
        const selCardW = 80
        const selCardH = 45
        const selStartX = W / 2 - (selected.length * (selCardW + 10)) / 2

        selected.forEach((cardIdx, i) => {
          const card = hand[cardIdx]
          const sx = selStartX + i * (selCardW + 10)
          const sy = selectedY + 22

          ctx.globalAlpha = 0.9
          ctx.fillStyle = '#1a1a3a'
          ctx.fillRect(sx, sy, selCardW, selCardH)
          ctx.strokeStyle = card.color
          ctx.lineWidth = 2
          ctx.strokeRect(sx, sy, selCardW, selCardH)
          ctx.globalAlpha = 1

          ctx.font = '18px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(card.icon, sx + selCardW / 2, sy + 22)

          ctx.font = '10px Arial'
          ctx.fillStyle = card.color
          ctx.fillText(card.label, sx + selCardW / 2, sy + 40)
        })
      }

      // ===== 下部：プレイヤーエリア =====
      // プレイヤーシルエット
      const playerCenterX = W * 0.15
      const playerCenterY = H * 0.55

      ctx.globalAlpha = 0.3
      const playerGrad = ctx.createRadialGradient(playerCenterX, playerCenterY, 0, playerCenterX, playerCenterY, 50)
      playerGrad.addColorStop(0, '#00ccff')
      playerGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = playerGrad
      ctx.beginPath()
      ctx.arc(playerCenterX, playerCenterY, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🧑', playerCenterX, playerCenterY + 10)

      ctx.font = '11px Arial'
      ctx.fillStyle = '#666666'
      ctx.fillText('[ 味方立ち絵 ]', playerCenterX, playerCenterY + 35)

      // プレイヤー情報
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#00ccff'
      ctx.fillText('甘利 悠真  |  D級  |  味覚', 20, H * 0.65)

      // プレイヤーHPバー
      const pBarX = 20
      const pBarY = H * 0.65 + 10
      const pBarW = W * 0.35
      const pBarH = 14

      ctx.fillStyle = '#1a1a3a'
      ctx.fillRect(pBarX, pBarY, pBarW, pBarH)

      const playerHPRatio = playerHP / playerMaxHP
      const pHPColor = playerHPRatio > 0.5 ? '#00cc66' : playerHPRatio > 0.2 ? '#ffaa00' : '#ff0000'
      ctx.fillStyle = pHPColor
      ctx.fillRect(pBarX, pBarY, pBarW * playerHPRatio, pBarH)

      ctx.strokeStyle = '#333366'
      ctx.strokeRect(pBarX, pBarY, pBarW, pBarH)

      ctx.font = '12px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.fillText(`${playerHP} / ${playerMaxHP}`, pBarX + pBarW - 5, pBarY + 11)

      // ===== 手札エリア =====
      const handY = H * 0.75
      const cardW = Math.min(90, (W - 40) / 7 - 8)
      const cardH = cardW * 1.4
      const handStartX = W / 2 - (7 * (cardW + 8)) / 2

      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#555577'
      ctx.fillText(`ターン ${turn}`, W / 2, handY - 10)

      hand.forEach((card, i) => {
        const cx = handStartX + i * (cardW + 8)
        const cy = handY
        const isSelected = selected.includes(i)
        const isHoverable = phase === 'select'

        // カード背景
        ctx.globalAlpha = isSelected ? 1 : 0.7

        const cardGrad = ctx.createLinearGradient(cx, cy, cx, cy + cardH)
        cardGrad.addColorStop(0, '#1a1a3a')
        cardGrad.addColorStop(1, '#0a0a20')
        ctx.fillStyle = cardGrad

        // 角丸カード
        const r = 8
        ctx.beginPath()
        ctx.moveTo(cx + r, cy)
        ctx.lineTo(cx + cardW - r, cy)
        ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + r)
        ctx.lineTo(cx + cardW, cy + cardH - r)
        ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - r, cy + cardH)
        ctx.lineTo(cx + r, cy + cardH)
        ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - r)
        ctx.lineTo(cx, cy + r)
        ctx.quadraticCurveTo(cx, cy, cx + r, cy)
        ctx.closePath()
        ctx.fill()

        // 選択時の枠
        ctx.strokeStyle = isSelected ? '#ffffff' : card.color
        ctx.lineWidth = isSelected ? 3 : 1
        ctx.stroke()

        ctx.globalAlpha = 1

        // 選択マーク
        if (isSelected) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('✓', cx + cardW / 2, cy + 16)
        }

        // アイコン
        ctx.font = `${cardW * 0.35}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(card.icon, cx + cardW / 2, cy + cardH * 0.45)

        // ラベル
        ctx.font = `bold ${cardW * 0.15}px Arial`
        ctx.fillStyle = card.color
        ctx.fillText(card.label, cx + cardW / 2, cy + cardH * 0.7)

        // 星
        ctx.font = `${cardW * 0.12}px Arial`
        ctx.fillStyle = '#ffcc00'
        ctx.fillText('★'.repeat(card.star), cx + cardW / 2, cy + cardH * 0.85)
      })

      // ===== メッセージ =====
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#aaaacc'
      ctx.fillText(message, W / 2, H * 0.72)

      // ===== ボタン =====
      const btnY = H - 55
      const btnH = 40

      if (phase === 'select' && selected.length === 3) {
        const btnW = 200
        const btnX = W / 2 - btnW / 2

        ctx.fillStyle = '#ff4444'
        ctx.globalAlpha = 0.9
        const br = 8
        ctx.beginPath()
        ctx.moveTo(btnX + br, btnY)
        ctx.lineTo(btnX + btnW - br, btnY)
        ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + br)
        ctx.lineTo(btnX + btnW, btnY + btnH - br)
        ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - br, btnY + btnH)
        ctx.lineTo(btnX + br, btnY + btnH)
        ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - br)
        ctx.lineTo(btnX, btnY + br)
        ctx.quadraticCurveTo(btnX, btnY, btnX + br, btnY)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1

        ctx.font = 'bold 18px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText('⚔️ 攻撃！', W / 2, btnY + 26)
      }

      if (phase === 'result') {
        const btnW = 200
        const btnX = W / 2 - btnW / 2

        const isEnd = enemyHP <= 0 || playerHP <= 0
        ctx.fillStyle = isEnd ? '#00ccff' : '#4444aa'
        ctx.globalAlpha = 0.9
        const br = 8
        ctx.beginPath()
        ctx.moveTo(btnX + br, btnY)
        ctx.lineTo(btnX + btnW - br, btnY)
        ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + br)
        ctx.lineTo(btnX + btnW, btnY + btnH - br)
        ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - br, btnY + btnH)
        ctx.lineTo(btnX + br, btnY + btnH)
        ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - br)
        ctx.lineTo(btnX, btnY + br)
        ctx.quadraticCurveTo(btnX, btnY, btnX + br, btnY)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1

        ctx.font = 'bold 18px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(isEnd ? '戻る' : '次のターン ▶', W / 2, btnY + 26)
      }

      // 戻るボタン
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#666688'
      ctx.fillText('← 戻る', 15, H - 15)

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
  }, [hand, selected, playerHP, enemyHP, turn, phase, message, playerMaxHP, enemyMaxHP])

  // クリックハンドラ
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const W = canvas.width
    const H = canvas.height

    // 戻るボタン
    if (mx < 100 && my > H - 35) {
      onBack()
      return
    }

    // カードクリック
    const cardW = Math.min(90, (W - 40) / 7 - 8)
    const cardH = cardW * 1.4
    const handY = H * 0.75
    const handStartX = W / 2 - (7 * (cardW + 8)) / 2

    for (let i = 0; i < hand.length; i++) {
      const cx = handStartX + i * (cardW + 8)
      if (mx >= cx && mx <= cx + cardW && my >= handY && my <= handY + cardH) {
        handleCardClick(i)
        return
      }
    }

    // 攻撃ボタン
    const btnY = H - 55
    const btnW = 200
    const btnX = W / 2 - btnW / 2

    if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + 40) {
      if (phase === 'select' && selected.length === 3) {
        executeTurn()
      } else if (phase === 'result') {
        if (enemyHP <= 0 || playerHP <= 0) {
          onBack()
        } else {
          nextTurn()
        }
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
    />
  )
}