import { useState } from 'react'

interface BattleScreenProps {
  onBack: () => void
}

type CardType = 'attack' | 'defense' | 'heal' | 'buff'

interface Card {
  id: number
  type: CardType
  label: string
  color: string
  icon: string
  star: number
}

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
  const [hand, setHand] = useState<Card[]>(() => generateCards(7))
  const [selected, setSelected] = useState<number[]>([])
  const [playerHP, setPlayerHP] = useState(1000)
  const [enemyHP, setEnemyHP] = useState(1000)
  const [turn, setTurn] = useState(1)
  const [phase, setPhase] = useState<'select' | 'attack' | 'result'>('select')
  const [message, setMessage] = useState('カードを3枚選んでください')
  const playerMaxHP = 1000
  const enemyMaxHP = 1000

  const handleCardClick = (index: number) => {
    if (phase !== 'select') return
    setSelected(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index)
      if (prev.length >= 3) return prev
      return [...prev, index]
    })
  }

  const executeTurn = () => {
    if (selected.length !== 3 || phase !== 'select') return
    setPhase('attack')
    setMessage('攻撃中...')

    const selectedCards = selected.map(i => hand[i])
    const merged: Card[] = [...selectedCards]
    for (let i = 0; i < merged.length - 1; i++) {
      if (merged[i].type === merged[i + 1].type) {
        merged[i] = { ...merged[i], star: Math.min(merged[i].star + 1, 3) }
        merged.splice(i + 1, 1)
        i--
      }
    }

    let totalDamage = 0, totalHeal = 0, totalBuff = 0, totalDefense = 0
    for (const card of merged) {
      const power = card.star === 3 ? 200 : card.star === 2 ? 120 : 70
      switch (card.type) {
        case 'attack': totalDamage += power; break
        case 'defense': totalDefense += power; break
        case 'heal': totalHeal += power; break
        case 'buff': totalBuff += 30 * card.star; break
      }
    }
    totalDamage += totalBuff
    const enemyDamage = Math.max(0, Math.floor(Math.random() * 150 + 50) - totalDefense)

    setTimeout(() => {
      setEnemyHP(prev => Math.max(0, prev - totalDamage))
      setPlayerHP(prev => Math.min(playerMaxHP, Math.max(0, prev - enemyDamage + totalHeal)))
      const msgs: string[] = []
      if (totalDamage > 0) msgs.push(`${totalDamage}ダメージ！`)
      if (totalHeal > 0) msgs.push(`${totalHeal}回復！`)
      if (totalDefense > 0) msgs.push(`${totalDefense}防御！`)
      if (totalBuff > 0) msgs.push(`攻撃+${totalBuff}！`)
      msgs.push(`敵攻撃: ${enemyDamage}`)
      setMessage(msgs.join(' | '))
      setPhase('result')
    }, 500)
  }

  const nextTurn = () => {
    if (enemyHP <= 0 || playerHP <= 0) { onBack(); return }
    setTurn(prev => prev + 1)
    setHand(generateCards(7))
    setSelected([])
    setPhase('select')
    setMessage('カードを3枚選んでください')
  }

  const isGameOver = enemyHP <= 0 || playerHP <= 0

  return (
    <div style={{
      width: '100vw', height: '100vh', background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* 上部：敵情報 + 敵シルエット */}
      <div style={{ flex: '0 0 auto', padding: '10px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,68,68,0.3) 0%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 35,
          }}>👹</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#ff6666', fontWeight: 'bold', fontSize: 15 }}>🔴 ロスト Lv.5</div>
            <div style={{ background: '#1a1a3a', borderRadius: 4, height: 14, border: '1px solid #333366', marginTop: 4 }}>
              <div style={{ width: `${(enemyHP / enemyMaxHP) * 100}%`, height: '100%', background: enemyHP / enemyMaxHP > 0.5 ? '#ff4444' : '#ff8800', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: '#999', fontSize: 11, marginTop: 2 }}>{enemyHP} / {enemyMaxHP}</div>
          </div>
        </div>
      </div>

      {/* 中央：選択カード表示 */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ color: '#666688', fontSize: 13, marginBottom: 6 }}>選択中: {selected.length} / 3</div>
        <div style={{ display: 'flex', gap: 8, minHeight: 50 }}>
          {selected.map((idx) => {
            const card = hand[idx]
            return (
              <div key={idx} style={{
                background: '#1a1a3a', border: `2px solid ${card.color}`, borderRadius: 6,
                padding: '4px 14px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
                <div style={{ color: card.color, fontSize: 10 }}>{card.label}</div>
              </div>
            )
          })}
        </div>
        {/* メッセージ */}
        <div style={{ color: '#aaaacc', fontSize: 14, marginTop: 8 }}>{message}</div>
      </div>

      {/* プレイヤー情報 */}
      <div style={{ flex: '0 0 auto', padding: '0 20px 5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,204,255,0.3) 0%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🧑</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#00ccff', fontWeight: 'bold', fontSize: 13 }}>甘利 悠真 | D級 | 味覚</div>
            <div style={{ background: '#1a1a3a', borderRadius: 4, height: 12, border: '1px solid #333366', marginTop: 3 }}>
              <div style={{ width: `${(playerHP / playerMaxHP) * 100}%`, height: '100%', background: playerHP / playerMaxHP > 0.5 ? '#00cc66' : '#ffaa00', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: '#999', fontSize: 10 }}>{playerHP} / {playerMaxHP}</div>
          </div>
        </div>
      </div>

      {/* 手札 */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 5, padding: '5px 8px',
      }}>
        {hand.map((card, i) => {
          const isSelected = selected.includes(i)
          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              style={{
                width: 65, height: 90, borderRadius: 8, cursor: phase === 'select' ? 'pointer' : 'default',
                background: isSelected ? 'linear-gradient(180deg, #2a2a5a 0%, #1a1a40 100%)' : 'linear-gradient(180deg, #1a1a3a 0%, #0a0a20 100%)',
                border: isSelected ? '2px solid #ffffff' : `1px solid ${card.color}44`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, transition: 'all 0.15s ease',
                transform: isSelected ? 'translateY(-6px)' : 'none',
                boxShadow: isSelected ? `0 4px 12px ${card.color}44` : 'none',
              }}
            >
              {isSelected && <span style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>✓</span>}
              <span style={{ fontSize: 22 }}>{card.icon}</span>
              <span style={{ color: card.color, fontSize: 10, fontWeight: 'bold' }}>{card.label}</span>
              <span style={{ color: '#ffcc00', fontSize: 9 }}>{'★'.repeat(card.star)}</span>
            </div>
          )
        })}
      </div>

      {/* ボタンエリア */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', padding: '8px 0 15px' }}>
        <div style={{ color: '#555577', fontSize: 12, marginBottom: 6 }}>ターン {turn}</div>

        {phase === 'select' && selected.length === 3 && (
          <button onClick={executeTurn} style={{
            background: '#ff4444', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 45px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>
            ⚔️ 攻撃！
          </button>
        )}

        {phase === 'result' && (
          <button onClick={isGameOver ? onBack : nextTurn} style={{
            background: isGameOver ? '#00ccff' : '#4444aa', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 45px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>
            {isGameOver ? (enemyHP <= 0 ? '🎉 勝利！' : '💀 敗北...') : '次のターン ▶'}
          </button>
        )}

        <div onClick={onBack} style={{ color: '#666688', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
          ← 戻る
        </div>
      </div>
    </div>
  )
}