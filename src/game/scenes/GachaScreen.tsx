import { useState } from 'react'

interface GachaScreenProps {
  onBack: () => void
}

interface GachaCharacter {
  name: string
  sense: string
  rarity: 'R' | 'SR' | 'SSR'
  icon: string
  color: string
}

const gachaPool: GachaCharacter[] = [
  // SSR (5%)
  { name: '鷹宮 零', sense: '五感A', rarity: 'SSR', icon: '👑', color: '#ffcc00' },
  { name: '明石 瞬', sense: '視覚', rarity: 'SSR', icon: '👁️', color: '#ff4444' },
  { name: '響 彩音', sense: '聴覚', rarity: 'SSR', icon: '🎵', color: '#ff44ff' },
  // SR (25%)
  { name: '手塚 凜花', sense: '触覚', rarity: 'SR', icon: '✋', color: '#4488ff' },
  { name: '香坂 蓮司', sense: '嗅覚', rarity: 'SR', icon: '🌸', color: '#44ff88' },
  { name: '辛崎 奏斗', sense: '味覚', rarity: 'SR', icon: '🔥', color: '#ff8844' },
  { name: '千里 航', sense: '固有', rarity: 'SR', icon: '🧭', color: '#8844ff' },
  { name: '重森 大地', sense: '平衡', rarity: 'SR', icon: '⚖️', color: '#886644' },
  // R (70%)
  { name: '藤原 颯太', sense: '視覚', rarity: 'R', icon: '🧑‍🦱', color: '#88aacc' },
  { name: '高橋 蓮', sense: '視覚', rarity: 'R', icon: '🧑', color: '#88aacc' },
  { name: '西園寺 陸', sense: '聴覚', rarity: 'R', icon: '🧑‍🦰', color: '#88aacc' },
  { name: '黒田 大和', sense: '触覚', rarity: 'R', icon: '💪', color: '#88aacc' },
  { name: '朝倉 瑛太', sense: '嗅覚', rarity: 'R', icon: '🌿', color: '#88aacc' },
  { name: '柏木 湊', sense: '味覚', rarity: 'R', icon: '🍴', color: '#88aacc' },
  { name: '白石 凛', sense: '視覚', rarity: 'R', icon: '👩', color: '#88aacc' },
  { name: '佐々木 楓', sense: '聴覚', rarity: 'R', icon: '🍁', color: '#88aacc' },
  { name: '天野 結月', sense: '触覚', rarity: 'R', icon: '🌙', color: '#88aacc' },
  { name: '七瀬 花音', sense: '味覚', rarity: 'R', icon: '🌺', color: '#88aacc' },
]

function pullGacha(count: number): GachaCharacter[] {
  const results: GachaCharacter[] = []
  for (let i = 0; i < count; i++) {
    const rand = Math.random() * 100
    let pool: GachaCharacter[]

    if (rand < 5) {
      pool = gachaPool.filter(c => c.rarity === 'SSR')
    } else if (rand < 30) {
      pool = gachaPool.filter(c => c.rarity === 'SR')
    } else {
      pool = gachaPool.filter(c => c.rarity === 'R')
    }

    results.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return results
}

const rarityStyles: Record<string, { bg: string; border: string; glow: string }> = {
  SSR: { bg: 'linear-gradient(135deg, #2a1a00 0%, #1a0a00 100%)', border: '#ffcc00', glow: '0 0 20px #ffcc0066' },
  SR: { bg: 'linear-gradient(135deg, #1a0a2a 0%, #0a0020 100%)', border: '#aa44ff', glow: '0 0 15px #aa44ff44' },
  R: { bg: 'linear-gradient(135deg, #1a1a2a 0%, #0a0a15 100%)', border: '#4466aa', glow: 'none' },
}

export default function GachaScreen({ onBack }: GachaScreenProps) {
  const [gems, setGems] = useState(1000)
  const [results, setResults] = useState<GachaCharacter[] | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [revealIndex, setRevealIndex] = useState(0)
  const [phase, setPhase] = useState<'menu' | 'animation' | 'results'>('menu')

  const doGacha = (count: number) => {
    const cost = count === 1 ? 50 : 450
    if (gems < cost) {
      alert('石が足りません！')
      return
    }

    setGems(prev => prev - cost)
    const pulled = pullGacha(count)
    setResults(pulled)
    setPhase('animation')
    setRevealIndex(0)
    setRevealing(true)

    // 1枚ずつ表示
    let i = 0
    const timer = setInterval(() => {
      i++
      setRevealIndex(i)
      if (i >= pulled.length) {
        clearInterval(timer)
        setRevealing(false)
        setPhase('results')
      }
    }, count === 1 ? 800 : 300)
  }

  const resetGacha = () => {
    setResults(null)
    setPhase('menu')
    setRevealIndex(0)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 20px',
        borderBottom: '1px solid #222244',
      }}>
        <div onClick={onBack} style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>← 戻る</div>
        <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>🎲 ガチャ</div>
        <div style={{ color: '#ffaa00', fontSize: 14 }}>💎 {gems}</div>
      </div>

      {/* メニュー */}
      {phase === 'menu' && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          {/* バナー */}
          <div style={{
            background: 'linear-gradient(135deg, #1a0a2a 0%, #2a1a3a 50%, #0a0a2a 100%)',
            border: '1px solid #aa44ff', borderRadius: 12, padding: '25px 40px',
            textAlign: 'center', maxWidth: 400,
          }}>
            <div style={{ color: '#aa44ff', fontSize: 13, marginBottom: 5 }}>PICK UP</div>
            <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 }}>
              覚醒者ガチャ
            </div>
            <div style={{ color: '#888', fontSize: 12 }}>SSR確率: 5% | SR確率: 25% | R確率: 70%</div>
            <div style={{ marginTop: 15, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 30 }}>👑</span>
              <span style={{ fontSize: 30 }}>👁️</span>
              <span style={{ fontSize: 30 }}>🎵</span>
            </div>
            <div style={{ color: '#ffcc00', fontSize: 11, marginTop: 5 }}>
              ピックアップ: 鷹宮 零 / 明石 瞬 / 響 彩音
            </div>
          </div>

          {/* ガチャボタン */}
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => doGacha(1)} style={{
              background: 'linear-gradient(135deg, #4444aa, #6644cc)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '15px 30px', cursor: 'pointer',
              fontSize: 16, fontWeight: 'bold',
            }}>
              単発ガチャ
              <div style={{ fontSize: 11, color: '#ccccff', marginTop: 3 }}>💎 50</div>
            </button>

            <button onClick={() => doGacha(10)} style={{
              background: 'linear-gradient(135deg, #cc4400, #ff6622)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '15px 30px', cursor: 'pointer',
              fontSize: 16, fontWeight: 'bold',
            }}>
              10連ガチャ
              <div style={{ fontSize: 11, color: '#ffccaa', marginTop: 3 }}>💎 450（お得！）</div>
            </button>
          </div>

          {/* 所持キャラ数 */}
          <div style={{ color: '#555577', fontSize: 12 }}>
            所持ガチャ石: 💎 {gems}
          </div>
        </div>
      )}

      {/* アニメーション・結果 */}
      {(phase === 'animation' || phase === 'results') && results && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '10px',
        }}>
          {/* 結果表示 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 10, maxWidth: 500,
          }}>
            {results.map((char, i) => {
              const revealed = i < revealIndex
              const style = rarityStyles[char.rarity]
              return (
                <div key={i} style={{
                  width: results.length === 1 ? 150 : 85,
                  height: results.length === 1 ? 190 : 115,
                  borderRadius: 10,
                  background: revealed ? style.bg : '#111122',
                  border: `2px solid ${revealed ? style.border : '#222233'}`,
                  boxShadow: revealed ? style.glow : 'none',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: revealed ? 'scale(1)' : 'scale(0.8)',
                  opacity: revealed ? 1 : 0.3,
                }}>
                  {revealed ? (
                    <>
                      <span style={{ fontSize: results.length === 1 ? 40 : 24 }}>{char.icon}</span>
                      <div style={{
                        color: style.border, fontSize: results.length === 1 ? 14 : 9,
                        fontWeight: 'bold', marginTop: 4,
                      }}>
                        {char.rarity}
                      </div>
                      <div style={{
                        color: '#fff', fontSize: results.length === 1 ? 14 : 10,
                        fontWeight: 'bold', marginTop: 2, textAlign: 'center',
                      }}>
                        {results.length === 1 ? char.name : char.name.split(' ')[1]}
                      </div>
                      <div style={{
                        color: '#888', fontSize: results.length === 1 ? 11 : 8,
                      }}>
                        {char.sense}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 20, color: '#333' }}>？</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* もう一度 / 戻る */}
          {phase === 'results' && (
            <div style={{ marginTop: 20, display: 'flex', gap: 15 }}>
              <button onClick={resetGacha} style={{
                background: '#4444aa', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 30px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
              }}>
                もう一度引く
              </button>
              <button onClick={onBack} style={{
                background: '#333344', color: '#aaa', border: '1px solid #444466', borderRadius: 8,
                padding: '10px 30px', fontSize: 14, cursor: 'pointer',
              }}>
                戻る
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}