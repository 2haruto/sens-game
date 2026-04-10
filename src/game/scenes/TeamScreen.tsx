import { useState } from 'react'

interface TeamScreenProps {
  onBack: () => void
}

interface Character {
  name: string
  sense: string
  rarity: 'R' | 'SR' | 'SSR'
  icon: string
  color: string
  level: number
  maxLevel: number
  hp: number
  attack: number
  evolved: boolean
}

const initialCharacters: Character[] = [
  { name: '甘利 悠真', sense: '味覚', rarity: 'SR', icon: '🧑', color: '#00ccff', level: 1, maxLevel: 50, hp: 800, attack: 65, evolved: false },
  { name: '鶴見 杏', sense: '温度', rarity: 'SR', icon: '👩', color: '#ff88cc', level: 1, maxLevel: 50, hp: 700, attack: 55, evolved: false },
  { name: '藤原 颯太', sense: '視覚', rarity: 'R', icon: '🧑‍🦱', color: '#88ff44', level: 1, maxLevel: 40, hp: 750, attack: 60, evolved: false },
  { name: '高橋 蓮', sense: '視覚', rarity: 'R', icon: '🧑', color: '#88aacc', level: 1, maxLevel: 40, hp: 720, attack: 58, evolved: false },
  { name: '西園寺 陸', sense: '聴覚', rarity: 'R', icon: '🧑‍🦰', color: '#cc88ff', level: 1, maxLevel: 40, hp: 680, attack: 52, evolved: false },
  { name: '黒田 大和', sense: '触覚', rarity: 'R', icon: '💪', color: '#ffaa44', level: 1, maxLevel: 40, hp: 800, attack: 70, evolved: false },
  { name: '朝倉 瑛太', sense: '嗅覚', rarity: 'R', icon: '🌿', color: '#44cc88', level: 1, maxLevel: 40, hp: 690, attack: 54, evolved: false },
  { name: '柏木 湊', sense: '味覚', rarity: 'R', icon: '🍴', color: '#88ccff', level: 1, maxLevel: 40, hp: 710, attack: 56, evolved: false },
]

const rarityColors: Record<string, string> = { SSR: '#ffcc00', SR: '#aa44ff', R: '#4466aa' }

type SubScreen = 'menu' | 'party' | 'enhance' | 'evolve' | 'list' | 'limit_break' | 'sell'

export default function TeamScreen({ onBack }: TeamScreenProps) {
  const [subScreen, setSubScreen] = useState<SubScreen>('menu')
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [party, setParty] = useState<number[]>([0, 1, 2])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [selectedChar, setSelectedChar] = useState<number | null>(null)
  const [gold, setGold] = useState(125000)
  const [message, setMessage] = useState('')

  const handleCharSelect = (charIndex: number) => {
    if (selectedSlot === null) return
    if (party.includes(charIndex) && party[selectedSlot] !== charIndex) {
      const otherSlot = party.indexOf(charIndex)
      const newParty = [...party]
      newParty[otherSlot] = party[selectedSlot]
      newParty[selectedSlot] = charIndex
      setParty(newParty)
    } else if (!party.includes(charIndex)) {
      const newParty = [...party]
      newParty[selectedSlot] = charIndex
      setParty(newParty)
    }
    setSelectedSlot(null)
  }

  const enhanceChar = (index: number) => {
    const cost = characters[index].level * 500
    if (gold < cost) { setMessage('お金が足りません！'); return }
    if (characters[index].level >= characters[index].maxLevel) { setMessage('最大レベルです！'); return }

    setGold(prev => prev - cost)
    setCharacters(prev => prev.map((c, i) =>
      i === index ? { ...c, level: c.level + 1, hp: c.hp + 15, attack: c.attack + 3 } : c
    ))
    setMessage(`${characters[index].name.split(' ')[1]}がLv.${characters[index].level + 1}に強化されました！`)
  }

  const evolveChar = (index: number) => {
    const cost = 10000
    if (gold < cost) { setMessage('お金が足りません！（10,000必要）'); return }
    if (characters[index].evolved) { setMessage('既に進化済みです！'); return }
    if (characters[index].level < 20) { setMessage('Lv.20以上で進化可能です！'); return }

    setGold(prev => prev - cost)
    setCharacters(prev => prev.map((c, i) =>
      i === index ? {
        ...c, evolved: true, maxLevel: c.maxLevel + 20,
        hp: c.hp + 200, attack: c.attack + 30,
        rarity: c.rarity === 'R' ? 'SR' as const : 'SSR' as const,
      } : c
    ))
    setMessage(`${characters[index].name.split(' ')[1]}が進化しました！`)
  }

  const sellChar = (index: number) => {
    if (party.includes(index)) { setMessage('編成中のキャラは売却できません！'); return }
    const sellPrice = characters[index].rarity === 'SSR' ? 5000 : characters[index].rarity === 'SR' ? 2000 : 500
    setGold(prev => prev + sellPrice)
    setMessage(`${characters[index].name.split(' ')[1]}を売却しました！（+${sellPrice.toLocaleString()}G）`)
    setCharacters(prev => prev.filter((_, i) => i !== index))
    setSelectedChar(null)
  }

  // メニューボタンの定義
  const menuButtons: { label: string; sub: string; screen: SubScreen; color: string; icon: string }[] = [
    { label: 'パーティ編成', sub: 'チームを組む', screen: 'party', color: '#00ccff', icon: '👥' },
    { label: 'キャラ強化', sub: 'レベルアップ', screen: 'enhance', color: '#44ff88', icon: '⬆️' },
    { label: 'キャラ進化', sub: 'レアリティUP', screen: 'evolve', color: '#ffaa00', icon: '⭐' },
    { label: 'キャラ一覧', sub: '所持キャラ確認', screen: 'list', color: '#aa88ff', icon: '📋' },
    { label: '限界突破', sub: 'さらに強く', screen: 'limit_break', color: '#ff4444', icon: '🔥' },
    { label: 'キャラ売却', sub: 'お金に変換', screen: 'sell', color: '#888888', icon: '🪙' },
  ]

  // キャラカード共通
  const CharCard = ({ char, index, onClick, showExtra }: {
    char: Character; index: number; onClick?: () => void; showExtra?: string
  }) => (
    <div onClick={onClick} style={{
      padding: '10px 6px', borderRadius: 8, cursor: onClick ? 'pointer' : 'default',
      background: 'linear-gradient(135deg, #1a1a3a, #0a0a20)',
      border: `1px solid ${rarityColors[char.rarity]}44`,
      textAlign: 'center', transition: 'all 0.2s', width: 85,
    }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.border = `1px solid ${rarityColors[char.rarity]}` }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.border = `1px solid ${rarityColors[char.rarity]}44` }}
    >
      <span style={{ fontSize: 28 }}>{char.icon}</span>
      <div style={{ color: rarityColors[char.rarity], fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>
        {char.rarity} {char.evolved && '✦'}
      </div>
      <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{char.name.split(' ')[1]}</div>
      <div style={{ color: char.color, fontSize: 9 }}>{char.sense}</div>
      <div style={{ color: '#666', fontSize: 8 }}>Lv.{char.level}/{char.maxLevel}</div>
      {showExtra && <div style={{ color: '#44ff88', fontSize: 8, fontWeight: 'bold', marginTop: 2 }}>{showExtra}</div>}
    </div>
  )

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #222244',
      }}>
        <div onClick={subScreen === 'menu' ? onBack : () => { setSubScreen('menu'); setMessage(''); setSelectedChar(null); setSelectedSlot(null) }}
          style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>
          ← {subScreen === 'menu' ? '戻る' : 'メニューへ'}
        </div>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
          {subScreen === 'menu' ? '👥 キャラ管理' :
            subScreen === 'party' ? '👥 パーティ編成' :
              subScreen === 'enhance' ? '⬆️ キャラ強化' :
                subScreen === 'evolve' ? '⭐ キャラ進化' :
                  subScreen === 'list' ? '📋 キャラ一覧' :
                    subScreen === 'limit_break' ? '🔥 限界突破' :
                      '🪙 キャラ売却'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ color: '#ffcc00', fontSize: 13, fontWeight: 'bold' }}>{gold.toLocaleString()}</span>
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div style={{
          background: '#111133', margin: '5px 10px', padding: '8px 15px',
          borderRadius: 6, border: '1px solid #333366', textAlign: 'center',
        }}>
          <span style={{ color: '#ccccee', fontSize: 13 }}>{message}</span>
        </div>
      )}

      {/* === メインメニュー === */}
      {subScreen === 'menu' && (
        <div style={{
          flex: '1 1 auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            maxWidth: 350, width: '100%',
          }}>
            {menuButtons.map((btn, i) => (
              <div
                key={i}
                onClick={() => setSubScreen(btn.screen)}
                style={{
                  background: 'linear-gradient(135deg, #1a1a3a, #0f0f25)',
                  border: `1px solid ${btn.color}44`, borderRadius: 10,
                  padding: '18px 12px', cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${btn.color}`
                  e.currentTarget.style.boxShadow = `0 2px 15px ${btn.color}33`
                  e.currentTarget.style.transform = 'scale(1.03)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = `1px solid ${btn.color}44`
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <span style={{ fontSize: 30 }}>{btn.icon}</span>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 6 }}>{btn.label}</div>
                <div style={{ color: '#888', fontSize: 10, marginTop: 2 }}>{btn.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === パーティ編成 === */}
      {subScreen === 'party' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>現在のパーティ</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 15 }}>
            {party.map((charIdx, slot) => {
              const char = characters[charIdx]
              const isSelected = selectedSlot === slot
              return (
                <div key={slot} onClick={() => setSelectedSlot(isSelected ? null : slot)}
                  style={{
                    width: 100, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? 'linear-gradient(135deg, #2a2a5a, #1a1a40)' : 'linear-gradient(135deg, #1a1a3a, #0a0a20)',
                    border: isSelected ? '2px solid #00ccff' : `1px solid ${rarityColors[char.rarity]}44`,
                    textAlign: 'center', transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{slot === 0 ? 'リーダー' : `メンバー${slot}`}</div>
                  <span style={{ fontSize: 30 }}>{char.icon}</span>
                  <div style={{ color: rarityColors[char.rarity], fontSize: 9, fontWeight: 'bold', marginTop: 3 }}>{char.rarity}</div>
                  <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{char.name.split(' ')[1]}</div>
                  <div style={{ color: char.color, fontSize: 9 }}>{char.sense}</div>
                </div>
              )
            })}
          </div>
          {selectedSlot !== null && <div style={{ textAlign: 'center', color: '#00ccff', fontSize: 12, marginBottom: 8 }}>▼ キャラを選んで入れ替え ▼</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => (
              <CharCard key={i} char={char} index={i} onClick={selectedSlot !== null ? () => handleCharSelect(i) : undefined}
                showExtra={party.includes(i) ? '編成中' : undefined} />
            ))}
          </div>
        </div>
      )}

      {/* === キャラ強化 === */}
      {subScreen === 'enhance' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>強化するキャラを選択</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => (
              <div key={i} onClick={() => setSelectedChar(i)} style={{ cursor: 'pointer' }}>
                <CharCard char={char} index={i} onClick={() => setSelectedChar(i)} />
              </div>
            ))}
          </div>
          {selectedChar !== null && (
            <div style={{
              marginTop: 15, background: '#111133', borderRadius: 10,
              padding: '15px', border: '1px solid #333366', textAlign: 'center',
            }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ color: rarityColors[characters[selectedChar].rarity], fontSize: 12 }}>{characters[selectedChar].rarity} | {characters[selectedChar].sense}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 5 }}>
                Lv.{characters[selectedChar].level} / {characters[selectedChar].maxLevel} | HP {characters[selectedChar].hp} | ATK {characters[selectedChar].attack}
              </div>
              <div style={{ color: '#ffcc00', fontSize: 12, marginTop: 8 }}>
                強化コスト: 🪙 {(characters[selectedChar].level * 500).toLocaleString()}
              </div>
              <button onClick={() => enhanceChar(selectedChar)} style={{
                background: 'linear-gradient(90deg, #44ff88, #00cc66)', color: '#000',
                border: 'none', borderRadius: 8, padding: '10px 40px', fontSize: 14,
                fontWeight: 'bold', cursor: 'pointer', marginTop: 10,
              }}>
                ⬆️ 強化する
              </button>
            </div>
          )}
        </div>
      )}

      {/* === キャラ進化 === */}
      {subScreen === 'evolve' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>進化するキャラを選択（Lv.20以上）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => (
              <div key={i} style={{ opacity: char.level >= 20 && !char.evolved ? 1 : 0.4 }}>
                <CharCard char={char} index={i} onClick={char.level >= 20 && !char.evolved ? () => setSelectedChar(i) : undefined}
                  showExtra={char.evolved ? '進化済' : char.level < 20 ? `Lv.20必要` : undefined} />
              </div>
            ))}
          </div>
          {selectedChar !== null && !characters[selectedChar].evolved && (
            <div style={{
              marginTop: 15, background: '#111133', borderRadius: 10,
              padding: '15px', border: '1px solid #ffaa0044', textAlign: 'center',
            }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: rarityColors[characters[selectedChar].rarity], fontSize: 18, fontWeight: 'bold' }}>{characters[selectedChar].rarity}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>現在</div>
                </div>
                <span style={{ color: '#ffaa00', fontSize: 24 }}>→</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ffcc00', fontSize: 18, fontWeight: 'bold' }}>
                    {characters[selectedChar].rarity === 'R' ? 'SR' : 'SSR'}
                  </div>
                  <div style={{ color: '#888', fontSize: 10 }}>進化後</div>
                </div>
              </div>
              <div style={{ color: '#ffcc00', fontSize: 12, marginTop: 10 }}>進化コスト: 🪙 10,000</div>
              <button onClick={() => evolveChar(selectedChar)} style={{
                background: 'linear-gradient(90deg, #ffaa00, #ff6600)', color: '#000',
                border: 'none', borderRadius: 8, padding: '10px 40px', fontSize: 14,
                fontWeight: 'bold', cursor: 'pointer', marginTop: 10,
              }}>
                ⭐ 進化させる
              </button>
            </div>
          )}
        </div>
      )}

      {/* === キャラ一覧 === */}
      {subScreen === 'list' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>所持キャラ ({characters.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {characters.map((char, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#111133', borderRadius: 8, padding: '10px 15px',
                border: `1px solid ${rarityColors[char.rarity]}33`,
              }}>
                <span style={{ fontSize: 30 }}>{char.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: rarityColors[char.rarity], fontSize: 11, fontWeight: 'bold' }}>{char.rarity}</span>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{char.name}</span>
                    {char.evolved && <span style={{ color: '#ffcc00', fontSize: 10 }}>✦進化</span>}
                  </div>
                  <div style={{ color: char.color, fontSize: 11, marginTop: 2 }}>{char.sense}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: 12 }}>Lv.{char.level}/{char.maxLevel}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>HP {char.hp} | ATK {char.attack}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === 限界突破 === */}
      {subScreen === 'limit_break' && (
        <div style={{
          flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 50 }}>🔥</span>
            <div style={{ color: '#ff4444', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>限界突破</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 5 }}>Coming Soon...</div>
            <div style={{ color: '#666', fontSize: 11, marginTop: 10 }}>進化済みキャラをさらに強化できるようになります</div>
          </div>
        </div>
      )}

      {/* === キャラ売却 === */}
      {subScreen === 'sell' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>売却するキャラを選択</div>
          <div style={{ color: '#ff4444', fontSize: 10, marginBottom: 8 }}>※編成中のキャラは売却できません</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => {
              const inParty = party.includes(i)
              const price = char.rarity === 'SSR' ? 5000 : char.rarity === 'SR' ? 2000 : 500
              return (
                <div key={i} style={{ opacity: inParty ? 0.3 : 1 }}>
                  <CharCard char={char} index={i}
                    onClick={!inParty ? () => setSelectedChar(i) : undefined}
                    showExtra={inParty ? '編成中' : `🪙 ${price.toLocaleString()}`} />
                </div>
              )
            })}
          </div>
          {selectedChar !== null && !party.includes(selectedChar) && (
            <div style={{
              marginTop: 15, background: '#111133', borderRadius: 10,
              padding: '15px', border: '1px solid #ff444444', textAlign: 'center',
            }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ color: '#ff4444', fontSize: 13, marginTop: 8 }}>このキャラを売却しますか？</div>
              <div style={{ color: '#ffcc00', fontSize: 14, marginTop: 5 }}>
                売却額: 🪙 {(characters[selectedChar].rarity === 'SSR' ? 5000 : characters[selectedChar].rarity === 'SR' ? 2000 : 500).toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 12 }}>
                <button onClick={() => sellChar(selectedChar)} style={{
                  background: '#ff4444', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 30px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
                }}>
                  売却する
                </button>
                <button onClick={() => setSelectedChar(null)} style={{
                  background: '#333344', color: '#aaa', border: '1px solid #444466', borderRadius: 8,
                  padding: '10px 30px', fontSize: 14, cursor: 'pointer',
                }}>
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* パーティ戦闘力 */}
      <div style={{
        flex: '0 0 auto', textAlign: 'center', padding: '8px 20px 12px',
        borderTop: '1px solid #222244',
      }}>
        <div style={{ color: '#888', fontSize: 11 }}>パーティ総戦闘力</div>
        <div style={{ color: '#ffcc00', fontSize: 20, fontWeight: 'bold' }}>
          {party.reduce((sum, idx) => sum + characters[idx].hp + characters[idx].attack * 5, 0).toLocaleString()}
        </div>
      </div>
    </div>
  )
}