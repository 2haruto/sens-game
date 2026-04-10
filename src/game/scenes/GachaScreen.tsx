import { useState, useEffect } from 'react'

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
  { name: '鷹宮 零', sense: '五感A', rarity: 'SSR', icon: '👑', color: '#ffcc00' },
  { name: '明石 瞬', sense: '視覚', rarity: 'SSR', icon: '👁️', color: '#ff4444' },
  { name: '響 彩音', sense: '聴覚', rarity: 'SSR', icon: '🎵', color: '#ff44ff' },
  { name: '手塚 凜花', sense: '触覚', rarity: 'SR', icon: '✋', color: '#4488ff' },
  { name: '香坂 蓮司', sense: '嗅覚', rarity: 'SR', icon: '🌸', color: '#44ff88' },
  { name: '辛崎 奏斗', sense: '味覚', rarity: 'SR', icon: '🔥', color: '#ff8844' },
  { name: '千里 航', sense: '固有', rarity: 'SR', icon: '🧭', color: '#8844ff' },
  { name: '重森 大地', sense: '平衡', rarity: 'SR', icon: '⚖️', color: '#886644' },
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
    if (rand < 5) pool = gachaPool.filter(c => c.rarity === 'SSR')
    else if (rand < 30) pool = gachaPool.filter(c => c.rarity === 'SR')
    else pool = gachaPool.filter(c => c.rarity === 'R')
    results.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return results
}

const rarityConfig = {
  R: { color: '#4466aa', bg: '#0a0a2a', label: 'R', glowColor: '68,102,170' },
  SR: { color: '#aa44ff', bg: '#1a0a2a', label: 'SR', glowColor: '170,68,255' },
  SSR: { color: '#ffcc00', bg: '#2a1a00', label: 'SSR', glowColor: '255,204,0' },
}

type Phase = 'menu' | 'scan_start' | 'scan_wave' | 'scan_gauge' | 'scan_burst' | 'reveal' | 'results'

export default function GachaScreen({ onBack }: GachaScreenProps) {
  const [gems, setGems] = useState(1000)
  const [results, setResults] = useState<GachaCharacter[]>([])
  const [phase, setPhase] = useState<Phase>('menu')
  const [currentReveal, setCurrentReveal] = useState(0)
  const [gaugeLevel, setGaugeLevel] = useState(0)
  const [scanColor, setScanColor] = useState('#4466aa')
  const [pullCount, setPullCount] = useState(0)

  const doGacha = (count: number) => {
    const cost = count === 1 ? 50 : 450
    if (gems < cost) { alert('石が足りません！'); return }
    setGems(prev => prev - cost)
    const pulled = pullGacha(count)
    setResults(pulled)
    setPullCount(count)
    setCurrentReveal(0)
    setPhase('scan_start')
  }

  const skipAnimation = () => {
    setPhase('results')
  }

  // 演出制御
  useEffect(() => {
    if (phase === 'scan_start') {
      const timer = setTimeout(() => setPhase('scan_wave'), 800)
      return () => clearTimeout(timer)
    }
    if (phase === 'scan_wave') {
      const timer = setTimeout(() => setPhase('scan_gauge'), 1200)
      return () => clearTimeout(timer)
    }
    if (phase === 'scan_gauge') {
      // 最高レアリティを判定
      const best = results.reduce((a, b) => {
        const order = { R: 0, SR: 1, SSR: 2 }
        return order[b.rarity] > order[a.rarity] ? b : a
      })

      const targetGauge = best.rarity === 'SSR' ? 100 : best.rarity === 'SR' ? 65 : 35
      const targetColor = rarityConfig[best.rarity].color

      let current = 0
      const interval = setInterval(() => {
        current += 2
        setGaugeLevel(Math.min(current, targetGauge))

        if (current >= 35 && current < 36) setScanColor('#4466aa')
        if (current >= 65 && current < 66) setScanColor('#aa44ff')
        if (current >= 95 && current < 96) setScanColor('#ffcc00')

        if (current >= targetGauge) {
          clearInterval(interval)
          setScanColor(targetColor)
          setTimeout(() => setPhase('scan_burst'), 500)
        }
      }, 30)

      return () => clearInterval(interval)
    }
    if (phase === 'scan_burst') {
      const timer = setTimeout(() => {
        if (pullCount === 1) {
          setCurrentReveal(0)
          setPhase('reveal')
        } else {
          setPhase('results')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [phase, results, pullCount])

  // 単発リビール
  const nextReveal = () => {
    if (currentReveal < results.length - 1) {
      setCurrentReveal(prev => prev + 1)
    } else {
      setPhase('results')
    }
  }

  const resetGacha = () => {
    setPhase('menu')
    setResults([])
    setGaugeLevel(0)
    setScanColor('#4466aa')
    setCurrentReveal(0)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#050510',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #222244',
        zIndex: 10,
      }}>
        <div onClick={phase === 'menu' ? onBack : resetGacha}
          style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>
          ← {phase === 'menu' ? '戻る' : 'ガチャトップ'}
        </div>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>🎲 ガチャ</div>
        <div style={{ color: '#00ccff', fontSize: 14 }}>💎 {gems}</div>
      </div>

      {/* === メニュー === */}
      {phase === 'menu' && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a0a2a, #2a1a3a, #0a0a2a)',
            border: '1px solid #aa44ff', borderRadius: 12, padding: '25px 40px',
            textAlign: 'center', maxWidth: 400,
          }}>
            <div style={{ color: '#aa44ff', fontSize: 13 }}>PICK UP</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5 }}>覚醒者ガチャ</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 5 }}>SSR: 5% | SR: 25% | R: 70%</div>
            <div style={{ marginTop: 15, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 30 }}>👑</span>
              <span style={{ fontSize: 30 }}>👁️</span>
              <span style={{ fontSize: 30 }}>🎵</span>
            </div>
            <div style={{ color: '#ffcc00', fontSize: 11, marginTop: 5 }}>
              ピックアップ: 鷹宮 零 / 明石 瞬 / 響 彩音
            </div>
          </div>

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
        </div>
      )}

      {/* === 覚醒スキャン演出 === */}
      {(phase === 'scan_start' || phase === 'scan_wave' || phase === 'scan_gauge' || phase === 'scan_burst') && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>

          {/* 背景パルス */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            background: phase === 'scan_burst'
              ? `radial-gradient(circle, ${scanColor}33 0%, transparent 60%)`
              : 'transparent',
            transition: 'background 0.5s',
          }} />

          {/* スキャン開始テキスト */}
          {phase === 'scan_start' && (
            <div style={{
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{ color: '#00ccff', fontSize: 14, letterSpacing: 8 }}>SCANNING</div>
              <div style={{ color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginTop: 10 }}>
                第六感覚野を解析中...
              </div>
            </div>
          )}

          {/* 脳波ウェーブ */}
          {phase === 'scan_wave' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: scanColor, fontSize: 14, letterSpacing: 4, marginBottom: 20 }}>
                NEURAL WAVE DETECTED
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 60,
              }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{
                    width: 4, borderRadius: 2,
                    background: scanColor,
                    height: `${20 + Math.sin(Date.now() * 0.01 + i * 0.5) * 20}px`,
                    opacity: 0.5 + Math.sin(Date.now() * 0.005 + i) * 0.3,
                    animation: `wave 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
                  }} />
                ))}
              </div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 15 }}>覚醒パターンを検出しています...</div>
            </div>
          )}

          {/* 覚醒ゲージ */}
          {phase === 'scan_gauge' && (
            <div style={{ textAlign: 'center', width: '80%', maxWidth: 400 }}>
              <div style={{ color: scanColor, fontSize: 14, letterSpacing: 4, marginBottom: 15 }}>
                AWAKENING LEVEL
              </div>

              {/* ゲージ本体 */}
              <div style={{
                background: '#0a0a1a', borderRadius: 10, height: 30,
                border: `2px solid ${scanColor}44`, overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  width: `${gaugeLevel}%`, height: '100%', borderRadius: 8,
                  background: `linear-gradient(90deg, #4466aa, ${scanColor})`,
                  transition: 'width 0.1s, background 0.3s',
                  boxShadow: `0 0 20px ${scanColor}66`,
                }} />
                {/* ゲージ区切り線 */}
                <div style={{
                  position: 'absolute', left: '35%', top: 0, bottom: 0,
                  borderLeft: '2px dashed #ffffff33',
                }} />
                <div style={{
                  position: 'absolute', left: '65%', top: 0, bottom: 0,
                  borderLeft: '2px dashed #ffffff33',
                }} />
              </div>

              {/* ゲージラベル */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 5px',
              }}>
                <span style={{ color: '#4466aa', fontSize: 11, fontWeight: 'bold' }}>R</span>
                <span style={{ color: '#aa44ff', fontSize: 11, fontWeight: 'bold' }}>SR</span>
                <span style={{ color: '#ffcc00', fontSize: 11, fontWeight: 'bold' }}>SSR</span>
              </div>

              <div style={{ color: scanColor, fontSize: 40, fontWeight: 'bold', marginTop: 20 }}>
                {gaugeLevel}%
              </div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 5 }}>覚醒度測定中...</div>
            </div>
          )}

          {/* バースト演出 */}
          {phase === 'scan_burst' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 60, fontWeight: 'bold', color: scanColor,
                textShadow: `0 0 30px ${scanColor}, 0 0 60px ${scanColor}`,
                animation: 'pulse 0.5s ease infinite',
              }}>
                {gaugeLevel >= 95 ? 'SSR' : gaugeLevel >= 60 ? 'SR' : 'R'}
              </div>
              <div style={{
                color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginTop: 15,
              }}>
                覚醒完了！
              </div>
            </div>
          )}

          {/* スキップボタン */}
          <div onClick={skipAnimation} style={{
            position: 'absolute', bottom: 30, right: 20,
            color: '#666688', fontSize: 13, cursor: 'pointer',
            background: '#111133', borderRadius: 6, padding: '8px 16px',
            border: '1px solid #333355',
          }}>
            スキップ ▶▶
          </div>
        </div>
      )}

      {/* === 単発リビール === */}
      {phase === 'reveal' && results.length > 0 && (
        <div onClick={nextReveal} style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          {(() => {
            const char = results[currentReveal]
            const config = rarityConfig[char.rarity]
            return (
              <div style={{
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{
                  width: 180, height: 230, borderRadius: 15,
                  background: `linear-gradient(135deg, ${config.bg}, #0a0a15)`,
                  border: `3px solid ${config.color}`,
                  boxShadow: `0 0 30px rgba(${config.glowColor}, 0.3)`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <span style={{ fontSize: 60 }}>{char.icon}</span>
                  <div style={{
                    color: config.color, fontSize: 20, fontWeight: 'bold', marginTop: 10,
                  }}>{config.label}</div>
                  <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 }}>{char.name}</div>
                  <div style={{ color: char.color, fontSize: 12, marginTop: 3 }}>{char.sense}</div>
                </div>

                <div style={{ color: '#555', fontSize: 13, marginTop: 20 }}>タップして次へ</div>
              </div>
            )
          })()}
        </div>
      )}

      {/* === 結果一覧 === */}
      {phase === 'results' && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '10px',
        }}>
          <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            ガチャ結果
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 10, maxWidth: 500,
          }}>
            {results.map((char, i) => {
              const config = rarityConfig[char.rarity]
              return (
                <div key={i} style={{
                  width: results.length === 1 ? 150 : 85,
                  height: results.length === 1 ? 190 : 115,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${config.bg}, #0a0a15)`,
                  border: `2px solid ${config.color}`,
                  boxShadow: `0 0 15px rgba(${config.glowColor}, 0.2)`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: results.length === 1 ? 40 : 24 }}>{char.icon}</span>
                  <div style={{
                    color: config.color, fontSize: results.length === 1 ? 14 : 9,
                    fontWeight: 'bold', marginTop: 4,
                  }}>{config.label}</div>
                  <div style={{
                    color: '#fff', fontSize: results.length === 1 ? 14 : 10,
                    fontWeight: 'bold', marginTop: 2, textAlign: 'center',
                  }}>{results.length === 1 ? char.name : char.name.split(' ')[1]}</div>
                  <div style={{ color: '#888', fontSize: results.length === 1 ? 11 : 8 }}>{char.sense}</div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 15 }}>
            <button onClick={resetGacha} style={{
              background: 'linear-gradient(90deg, #4444aa, #6644cc)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px 30px',
              fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
            }}>もう一度引く</button>
            <button onClick={onBack} style={{
              background: '#333344', color: '#aaa', border: '1px solid #444466',
              borderRadius: 8, padding: '10px 30px', fontSize: 14, cursor: 'pointer',
            }}>戻る</button>
          </div>
        </div>
      )}

      {/* CSSアニメーション */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes wave {
          0% { height: 10px; }
          100% { height: 40px; }
        }
      `}</style>
    </div>
  )
}