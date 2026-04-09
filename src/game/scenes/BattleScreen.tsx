import { useState } from 'react'

interface BattleScreenProps {
  onBack: () => void
}

type CardType = 'attack' | 'defense' | 'heal' | 'buff'

interface Card {
  type: CardType
  label: string
  color: string
  icon: string
  star: number
  owner: number
}

interface Character {
  name: string
  sense: string
  icon: string
  maxHP: number
  hp: number
  gauge: number
  color: string
}

interface Enemy {
  name: string
  icon: string
  maxHP: number
  hp: number
  attack: number
  color: string
}

function generateCardsForParty(party: Character[]): Card[] {
  const types: { type: CardType; label: string; color: string; icon: string }[] = [
    { type: 'attack', label: '攻撃', color: '#ff4444', icon: '⚔️' },
    { type: 'defense', label: '防御', color: '#4488ff', icon: '🛡️' },
    { type: 'heal', label: '回復', color: '#44ff88', icon: '💚' },
    { type: 'buff', label: '強化', color: '#ffaa00', icon: '⬆️' },
  ]

  const cards: Card[] = []
  for (let i = 0; i < 7; i++) {
    const t = types[Math.floor(Math.random() * types.length)]
    const owner = Math.floor(Math.random() * party.length)
    cards.push({ ...t, star: 1, owner })
  }
  return cards
}

const initialParty: Character[] = [
  { name: '甘利 悠真', sense: '味覚', icon: '🧑', maxHP: 800, hp: 800, gauge: 0, color: '#00ccff' },
  { name: '鶴見 杏', sense: '温度', icon: '👩', maxHP: 700, hp: 700, gauge: 0, color: '#ff88cc' },
  { name: '藤原 颯太', sense: '視覚', icon: '🧑‍🦱', maxHP: 750, hp: 750, gauge: 0, color: '#88ff44' },
]

const initialEnemies: Enemy[] = [
  { name: 'ロスト Lv.3', icon: '👻', maxHP: 600, hp: 600, attack: 60, color: '#aa44ff' },
  { name: 'ロスト Lv.5', icon: '👹', maxHP: 900, hp: 900, attack: 80, color: '#ff4444' },
  { name: 'ロスト Lv.2', icon: '💀', maxHP: 400, hp: 400, attack: 45, color: '#888888' },
]

export default function BattleScreen({ onBack }: BattleScreenProps) {
  const [party, setParty] = useState<Character[]>(initialParty.map(c => ({ ...c })))
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies.map(e => ({ ...e })))
  const [hand, setHand] = useState<Card[]>(() => generateCardsForParty(initialParty))
  const [selected, setSelected] = useState<number[]>([])
  const [turn, setTurn] = useState(1)
  const [phase, setPhase] = useState<'select' | 'player_attack' | 'enemy_attack' | 'result'>('select')
  const [message, setMessage] = useState('カードを3枚選んでください')
  const [attackLog, setAttackLog] = useState<string[]>([])

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
    setPhase('player_attack')
    setMessage('')
    setAttackLog([])

    const selectedCards = selected.map(i => hand[i])

    // 合成チェック
    const merged: Card[] = [...selectedCards]
    for (let i = 0; i < merged.length - 1; i++) {
      if (merged[i].type === merged[i + 1].type && merged[i].owner === merged[i + 1].owner) {
        merged[i] = { ...merged[i], star: Math.min(merged[i].star + 1, 3) }
        merged.splice(i + 1, 1)
        i--
      }
    }

    const newEnemies = enemies.map(e => ({ ...e }))
    const newParty = party.map(c => ({ ...c }))
    const logs: string[] = []

    // 味方の攻撃を順番に実行
    let delay = 0
    merged.forEach((card, idx) => {
      delay += 600
      setTimeout(() => {
        const charName = newParty[card.owner]?.name || '味方'
        const power = card.star === 3 ? 200 : card.star === 2 ? 120 : 70

        // 生きてる敵をランダムに選択
        const aliveEnemies = newEnemies.filter(e => e.hp > 0)
        if (aliveEnemies.length === 0) return

        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]

        switch (card.type) {
          case 'attack':
            target.hp = Math.max(0, target.hp - power)
            logs.push(`${charName}の攻撃！ → ${target.name}に${power}ダメージ`)
            break
          case 'defense':
            logs.push(`${charName}が防御！ 被ダメージ軽減`)
            break
          case 'heal': {
            const healTarget = newParty.reduce((a, b) => (a.hp / a.maxHP < b.hp / b.maxHP ? a : b))
            healTarget.hp = Math.min(healTarget.maxHP, healTarget.hp + power)
            logs.push(`${charName}が回復！ → ${healTarget.name}のHP+${power}`)
            break
          }
          case 'buff':
            logs.push(`${charName}が強化！ 次の攻撃力UP`)
            break
        }

        // ゲージ増加
        if (newParty[card.owner]) {
          newParty[card.owner].gauge = Math.min(100, newParty[card.owner].gauge + 15 * card.star)
        }

        setEnemies(newEnemies.map(e => ({ ...e })))
        setParty(newParty.map(c => ({ ...c })))
        setAttackLog([...logs])
        setMessage(logs[logs.length - 1] || '')
      }, delay)
    })

    // 敵の攻撃フェーズ
    setTimeout(() => {
      setPhase('enemy_attack')
      setMessage('敵のターン...')

      let enemyDelay = 0
      const aliveEnemies = newEnemies.filter(e => e.hp > 0)

      aliveEnemies.forEach((enemy) => {
        enemyDelay += 600
        setTimeout(() => {
          const aliveParty = newParty.filter(c => c.hp > 0)
          if (aliveParty.length === 0) return

          const target = aliveParty[Math.floor(Math.random() * aliveParty.length)]
          // 防御カードが選ばれていたらダメージ軽減
          const hasDefense = merged.some(c => c.type === 'defense')
          const dmg = hasDefense ? Math.floor(enemy.attack * 0.5) : enemy.attack

          target.hp = Math.max(0, target.hp - dmg)
          logs.push(`${enemy.name}の攻撃！ → ${target.name}に${dmg}ダメージ`)

          setParty(newParty.map(c => ({ ...c })))
          setAttackLog([...logs])
          setMessage(logs[logs.length - 1] || '')
        }, enemyDelay)
      })

      // 結果表示
      setTimeout(() => {
        setPhase('result')
        const allEnemiesDead = newEnemies.every(e => e.hp <= 0)
        const allPartyDead = newParty.every(c => c.hp <= 0)

        if (allEnemiesDead) {
          setMessage('🎉 勝利！')
        } else if (allPartyDead) {
          setMessage('💀 敗北...')
        } else {
          setMessage('ターン終了')
        }
      }, enemyDelay + 400)
    }, delay + 400)
  }

  const nextTurn = () => {
    const allEnemiesDead = enemies.every(e => e.hp <= 0)
    const allPartyDead = party.every(c => c.hp <= 0)
    if (allEnemiesDead || allPartyDead) { onBack(); return }

    setTurn(prev => prev + 1)
    setHand(generateCardsForParty(party))
    setSelected([])
    setPhase('select')
    setMessage('カードを3枚選んでください')
    setAttackLog([])
  }

  const isGameOver = enemies.every(e => e.hp <= 0) || party.every(c => c.hp <= 0)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* 敵エリア */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 20,
        padding: '12px 10px 8px',
      }}>
        {enemies.map((enemy, i) => (
          <div key={i} style={{ textAlign: 'center', opacity: enemy.hp <= 0 ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            <span style={{ fontSize: 36 }}>{enemy.icon}</span>
            <div style={{ color: enemy.color, fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{enemy.name}</div>
            <div style={{
              background: '#1a1a3a', borderRadius: 3, height: 10, width: 100,
              border: '1px solid #333', margin: '3px auto 0',
            }}>
              <div style={{
                width: `${(enemy.hp / enemy.maxHP) * 100}%`, height: '100%',
                background: enemy.color, borderRadius: 3, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ color: '#999', fontSize: 10 }}>{enemy.hp}/{enemy.maxHP}</div>
          </div>
        ))}
      </div>

      {/* バトルログ */}
      <div style={{
        flex: '1 1 auto', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', minHeight: 0, padding: '0 15px',
      }}>
        <div style={{
          background: '#0a0a1aCC', borderRadius: 8, padding: '10px 20px',
          minHeight: 60, width: '90%', maxWidth: 500,
          border: '1px solid #222244',
        }}>
          <div style={{ color: '#555577', fontSize: 11, marginBottom: 4 }}>ターン {turn}</div>
          {attackLog.length > 0 ? (
            attackLog.slice(-3).map((log, i) => (
              <div key={i} style={{ color: '#ccccee', fontSize: 13, marginBottom: 2 }}>{log}</div>
            ))
          ) : (
            <div style={{ color: '#aaaacc', fontSize: 14 }}>{message}</div>
          )}
        </div>

        {/* 選択カード表示 */}
        {selected.length > 0 && phase === 'select' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {selected.map((idx) => {
              const card = hand[idx]
              const ownerChar = party[card.owner]
              return (
                <div key={idx} style={{
                  background: '#1a1a3a', border: `2px solid ${card.color}`, borderRadius: 6,
                  padding: '4px 10px', textAlign: 'center',
                }}>
                  <span style={{ fontSize: 16 }}>{card.icon}</span>
                  <div style={{ color: card.color, fontSize: 9 }}>{card.label}</div>
                  <div style={{ color: ownerChar?.color || '#888', fontSize: 8 }}>{ownerChar?.name.split(' ')[1]}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 味方パーティ */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 15,
        padding: '5px 10px',
      }}>
        {party.map((char, i) => (
          <div key={i} style={{
            textAlign: 'center', opacity: char.hp <= 0 ? 0.3 : 1,
            transition: 'opacity 0.3s',
          }}>
            <span style={{ fontSize: 28 }}>{char.icon}</span>
            <div style={{ color: char.color, fontSize: 11, fontWeight: 'bold' }}>{char.name.split(' ')[1]}</div>
            <div style={{
              background: '#1a1a3a', borderRadius: 3, height: 8, width: 80,
              border: '1px solid #333', margin: '2px auto',
            }}>
              <div style={{
                width: `${(char.hp / char.maxHP) * 100}%`, height: '100%',
                background: char.hp / char.maxHP > 0.5 ? '#00cc66' : '#ffaa00',
                borderRadius: 3, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ color: '#999', fontSize: 9 }}>{char.hp}/{char.maxHP}</div>
            {/* 必殺ゲージ */}
            <div style={{
              background: '#1a1a3a', borderRadius: 2, height: 4, width: 80,
              border: '1px solid #222', margin: '2px auto',
            }}>
              <div style={{
                width: `${char.gauge}%`, height: '100%',
                background: char.gauge >= 100 ? '#ffcc00' : '#ff8800',
                borderRadius: 2, transition: 'width 0.3s',
              }} />
            </div>
            {char.gauge >= 100 && (
              <div style={{ color: '#ffcc00', fontSize: 9, fontWeight: 'bold' }}>必殺OK!</div>
            )}
          </div>
        ))}
      </div>

      {/* 手札 */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 4, padding: '5px 5px',
      }}>
        {hand.map((card, i) => {
          const isSelected = selected.includes(i)
          const ownerChar = party[card.owner]
          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              style={{
                width: 62, height: 95, borderRadius: 8,
                cursor: phase === 'select' ? 'pointer' : 'default',
                background: isSelected
                  ? 'linear-gradient(180deg, #2a2a5a 0%, #1a1a40 100%)'
                  : 'linear-gradient(180deg, #1a1a3a 0%, #0a0a20 100%)',
                border: isSelected ? '2px solid #ffffff' : `1px solid ${card.color}44`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 1,
                transition: 'all 0.15s ease',
                transform: isSelected ? 'translateY(-6px)' : 'none',
                boxShadow: isSelected ? `0 4px 12px ${card.color}44` : 'none',
              }}
            >
              {isSelected && <span style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>✓</span>}
              <span style={{ fontSize: 20 }}>{card.icon}</span>
              <span style={{ color: card.color, fontSize: 9, fontWeight: 'bold' }}>{card.label}</span>
              <span style={{ color: '#ffcc00', fontSize: 8 }}>{'★'.repeat(card.star)}</span>
              {/* カード所有者の色帯 */}
              <div style={{
                width: '80%', height: 3, borderRadius: 2,
                background: ownerChar?.color || '#555',
                marginTop: 2,
              }} />
              <span style={{ fontSize: 7, color: ownerChar?.color || '#888' }}>
                {ownerChar?.name.split(' ')[1]}
              </span>
            </div>
          )
        })}
      </div>

      {/* ボタンエリア */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', padding: '5px 0 12px' }}>
        {phase === 'select' && selected.length === 3 && (
          <button onClick={executeTurn} style={{
            background: 'linear-gradient(90deg, #ff4444, #ff6622)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 50px', fontSize: 16,
            fontWeight: 'bold', cursor: 'pointer',
          }}>
            ⚔️ 攻撃開始！
          </button>
        )}

        {phase === 'result' && (
          <button onClick={isGameOver ? onBack : nextTurn} style={{
            background: isGameOver ? 'linear-gradient(90deg, #00ccff, #0088ff)' : 'linear-gradient(90deg, #4444aa, #6644cc)',
            color: '#fff', border: 'none', borderRadius: 8, padding: '10px 50px',
            fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>
            {isGameOver ? (enemies.every(e => e.hp <= 0) ? '🎉 勝利！' : '💀 敗北...') : '次のターン ▶'}
          </button>
        )}

        <div onClick={onBack} style={{
          color: '#666688', fontSize: 12, cursor: 'pointer', marginTop: 6,
        }}>
          ← 撤退
        </div>
      </div>
    </div>
  )
}