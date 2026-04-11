import { useState } from 'react'

interface QuestRewards {
  gold: number
  diamond: number
  exp: number
}

interface BattleScreenProps {
  onBack: () => void
  questName?: string
  enemyLevel?: number
  rewards?: QuestRewards
  onClear?: (rewards: QuestRewards) => void
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

export default function BattleScreen({ onBack, questName, enemyLevel = 5, rewards, onClear }: BattleScreenProps) {
  const lvl = enemyLevel

  const initialParty: Character[] = [
    { name: '甘利 悠真', sense: '味覚', icon: '🧑', maxHP: 800, hp: 800, gauge: 0, color: '#00ccff' },
    { name: '鶴見 杏', sense: '温度', icon: '👩', maxHP: 700, hp: 700, gauge: 0, color: '#ff88cc' },
    { name: '藤原 颯太', sense: '視覚', icon: '🧑‍🦱', maxHP: 750, hp: 750, gauge: 0, color: '#88ff44' },
  ]

  const initialEnemies: Enemy[] = [
    { name: `ロスト Lv.${lvl}`, icon: '👹', maxHP: 400 + lvl * 100, hp: 400 + lvl * 100, attack: 30 + lvl * 10, color: '#ff4444' },
  ]

  const [party, setParty] = useState<Character[]>(initialParty)
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies)
  const [hand, setHand] = useState<Card[]>(() => generateCardsForParty(initialParty))
  const [selected, setSelected] = useState<number[]>([])
  const [turn, setTurn] = useState(1)
  const [phase, setPhase] = useState<'select' | 'attack' | 'enemy_attack' | 'result' | 'clear'>('select')
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
    setPhase('attack')
    setMessage('')
    setAttackLog([])

    const selectedCards = selected.map(i => hand[i])
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
    let delay = 0

    merged.forEach(() => {
      delay += 500
    })

    // 簡易計算
    let totalDmg = 0
    let totalHeal = 0
    let totalDef = 0

    for (const card of merged) {
      const power = card.star === 3 ? 200 : card.star === 2 ? 120 : 70
      const charName = newParty[card.owner]?.name.split(' ')[1] || '味方'
      switch (card.type) {
        case 'attack': {
          const alive = newEnemies.filter(e => e.hp > 0)
          if (alive.length > 0) {
            const t = alive[0]
            t.hp = Math.max(0, t.hp - power)
            totalDmg += power
            logs.push(`${charName}の攻撃！ → ${power}ダメージ`)
          }
          break
        }
        case 'defense':
          totalDef += power
          logs.push(`${charName}が防御！`)
          break
        case 'heal': {
          const weakest = newParty.reduce((a, b) => a.hp / a.maxHP < b.hp / b.maxHP ? a : b)
          weakest.hp = Math.min(weakest.maxHP, weakest.hp + power)
          totalHeal += power
          logs.push(`${charName}が回復！ → ${weakest.name.split(' ')[1]}のHP+${power}`)
          break
        }
        case 'buff':
          logs.push(`${charName}が強化！`)
          break
      }
      if (newParty[card.owner]) {
        newParty[card.owner].gauge = Math.min(100, newParty[card.owner].gauge + 15 * card.star)
      }
    }

    setTimeout(() => {
      setEnemies(newEnemies.map(e => ({ ...e })))
      setParty(newParty.map(c => ({ ...c })))
      setAttackLog(logs)
      setMessage(logs[logs.length - 1] || '')

      // 敵の攻撃
      setTimeout(() => {
        setPhase('enemy_attack')
        const aliveEnemies = newEnemies.filter(e => e.hp > 0)
        aliveEnemies.forEach(enemy => {
          const aliveParty = newParty.filter(c => c.hp > 0)
          if (aliveParty.length > 0) {
            const target = aliveParty[Math.floor(Math.random() * aliveParty.length)]
            const dmg = Math.max(0, enemy.attack - Math.floor(totalDef * 0.3))
            target.hp = Math.max(0, target.hp - dmg)
            logs.push(`${enemy.name}の攻撃！ → ${target.name.split(' ')[1]}に${dmg}ダメージ`)
          }
        })

        setParty(newParty.map(c => ({ ...c })))
        setAttackLog([...logs])

        setTimeout(() => {
          const allEnemiesDead = newEnemies.every(e => e.hp <= 0)
          const allPartyDead = newParty.every(c => c.hp <= 0)

          if (allEnemiesDead) {
            setPhase('clear')
            setMessage('🎉 クエストクリア！')
            if (rewards && onClear) onClear(rewards)
          } else if (allPartyDead) {
            setPhase('result')
            setMessage('💀 敗北...')
          } else {
            setPhase('result')
            setMessage('ターン終了')
          }
        }, 500)
      }, 600)
    }, 500)
  }

  const nextTurn = () => {
    setTurn(prev => prev + 1)
    setHand(generateCardsForParty(party))
    setSelected([])
    setPhase('select')
    setMessage('カードを3枚選んでください')
    setAttackLog([])
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', padding: '8px 15px', borderBottom: '1px solid #222244',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div onClick={onBack} style={{ color: '#666688', fontSize: 13, cursor: 'pointer' }}>← 撤退</div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{questName || 'バトル'}</div>
        <div style={{ color: '#555', fontSize: 12 }}>ターン {turn}</div>
      </div>

      {/* 敵エリア */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 20, padding: '10px' }}>
        {enemies.map((enemy, i) => (
          <div key={i} style={{ textAlign: 'center', opacity: enemy.hp <= 0 ? 0.3 : 1 }}>
            <span style={{ fontSize: 40 }}>{enemy.icon}</span>
            <div style={{ color: enemy.color, fontSize: 12, fontWeight: 'bold' }}>{enemy.name}</div>
            <div style={{ background: '#1a1a3a', borderRadius: 3, height: 10, width: 120, border: '1px solid #333', margin: '3px auto' }}>
              <div style={{ width: `${(enemy.hp / enemy.maxHP) * 100}%`, height: '100%', background: enemy.color, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: '#999', fontSize: 10 }}>{enemy.hp}/{enemy.maxHP}</div>
          </div>
        ))}
      </div>

      {/* ログ */}
      <div style={{
        flex: '1 1 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 15px',
      }}>
        <div style={{
          background: '#0a0a1aCC', borderRadius: 8, padding: '10px 20px',
          width: '90%', maxWidth: 500, border: '1px solid #222244', minHeight: 60,
        }}>
          {attackLog.length > 0 ? (
            attackLog.slice(-3).map((log, i) => (
              <div key={i} style={{ color: '#ccccee', fontSize: 13, marginBottom: 2 }}>{log}</div>
            ))
          ) : (
            <div style={{ color: '#aaaacc', fontSize: 14 }}>{message}</div>
          )}
        </div>

        {/* クリア報酬表示 */}
        {phase === 'clear' && rewards && (
          <div style={{
            marginTop: 15, background: '#111133', borderRadius: 10,
            padding: '15px 25px', border: '1px solid #ffcc0044', textAlign: 'center',
          }}>
            <div style={{ color: '#ffcc00', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>🎉 クリア報酬</div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              {rewards.gold > 0 && (
                <div>
                  <span style={{ fontSize: 24 }}>🪙</span>
                  <div style={{ color: '#ffcc00', fontSize: 16, fontWeight: 'bold' }}>+{rewards.gold.toLocaleString()}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>ゴールド</div>
                </div>
              )}
              {rewards.diamond > 0 && (
                <div>
                  <span style={{ fontSize: 24 }}>💎</span>
                  <div style={{ color: '#00ccff', fontSize: 16, fontWeight: 'bold' }}>+{rewards.diamond}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>ダイヤ</div>
                </div>
              )}
              <div>
                <span style={{ fontSize: 24 }}>⭐</span>
                <div style={{ color: '#44ff88', fontSize: 16, fontWeight: 'bold' }}>+{rewards.exp}</div>
                <div style={{ color: '#888', fontSize: 10 }}>EXP</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 味方パーティ */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 15, padding: '5px 10px' }}>
        {party.map((char, i) => (
          <div key={i} style={{ textAlign: 'center', opacity: char.hp <= 0 ? 0.3 : 1 }}>
            <span style={{ fontSize: 28 }}>{char.icon}</span>
            <div style={{ color: char.color, fontSize: 10, fontWeight: 'bold' }}>{char.name.split(' ')[1]}</div>
            <div style={{ background: '#1a1a3a', borderRadius: 3, height: 8, width: 80, border: '1px solid #333', margin: '2px auto' }}>
              <div style={{ width: `${(char.hp / char.maxHP) * 100}%`, height: '100%', background: char.hp / char.maxHP > 0.5 ? '#00cc66' : '#ffaa00', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: '#999', fontSize: 8 }}>{char.hp}/{char.maxHP}</div>
            <div style={{ background: '#1a1a3a', borderRadius: 2, height: 4, width: 80, margin: '2px auto' }}>
              <div style={{ width: `${char.gauge}%`, height: '100%', background: char.gauge >= 100 ? '#ffcc00' : '#ff8800', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 手札 */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', gap: 4, padding: '5px 5px' }}>
        {hand.map((card, i) => {
          const isSelected = selected.includes(i)
          const ownerChar = party[card.owner]
          return (
            <div key={i} onClick={() => handleCardClick(i)} style={{
              width: 62, height: 90, borderRadius: 8,
              cursor: phase === 'select' ? 'pointer' : 'default',
              background: isSelected ? 'linear-gradient(180deg, #2a2a5a, #1a1a40)' : 'linear-gradient(180deg, #1a1a3a, #0a0a20)',
              border: isSelected ? '2px solid #ffffff' : `1px solid ${card.color}44`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, transition: 'all 0.15s',
              transform: isSelected ? 'translateY(-6px)' : 'none',
            }}>
              {isSelected && <span style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>✓</span>}
              <span style={{ fontSize: 20 }}>{card.icon}</span>
              <span style={{ color: card.color, fontSize: 9, fontWeight: 'bold' }}>{card.label}</span>
              <span style={{ color: '#ffcc00', fontSize: 8 }}>{'★'.repeat(card.star)}</span>
              <div style={{ width: '80%', height: 3, borderRadius: 2, background: ownerChar?.color || '#555', marginTop: 2 }} />
            </div>
          )
        })}
      </div>

      {/* ボタン */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', padding: '5px 0 12px' }}>
        {phase === 'select' && selected.length === 3 && (
          <button onClick={executeTurn} style={{
            background: 'linear-gradient(90deg, #ff4444, #ff6622)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 50px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>⚔️ 攻撃！</button>
        )}
        {phase === 'result' && (
          <button onClick={nextTurn} style={{
            background: 'linear-gradient(90deg, #4444aa, #6644cc)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 50px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>次のターン ▶</button>
        )}
        {(phase === 'clear' || (phase === 'result' && party.every(c => c.hp <= 0))) && (
          <button onClick={onBack} style={{
            background: 'linear-gradient(90deg, #00ccff, #0088ff)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 50px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          }}>結果を確認 →</button>
        )}
      </div>
    </div>
  )
}