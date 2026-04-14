import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

interface TeamScreenProps {
  onBack: () => void
}

const rarityColors: Record<string, string> = { SSR: '#ffcc00', SR: '#aa44ff', R: '#4466aa' }

type SubScreen = 'menu' | 'party' | 'enhance' | 'evolve' | 'list' | 'limit_break' | 'sell'

export default function TeamScreen({ onBack }: TeamScreenProps) {
  const { characters, party, gold, setParty, enhanceCharacter, evolveCharacter, removeCharacter } = useGameStore()
  const [subScreen, setSubScreen] = useState<SubScreen>('menu')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [selectedChar, setSelectedChar] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const handleCharSelect = (charIndex: number) => {
    if (selectedSlot === null) return
    const newParty = [...party]
    if (party.includes(charIndex) && party[selectedSlot] !== charIndex) {
      const otherSlot = party.indexOf(charIndex)
      newParty[otherSlot] = party[selectedSlot]
    }
    newParty[selectedSlot] = charIndex
    setParty(newParty)
    setSelectedSlot(null)
  }

  const handleEnhance = (index: number) => {
    const char = characters[index]
    if (!char) return
    if (char.level >= char.maxLevel) { setMessage('最大レベルです！'); return }
    const cost = char.level * 500
    if (gold < cost) { setMessage('お金が足りません！'); return }
    enhanceCharacter(char.id)
    setMessage(`${char.name.split(' ')[1]}がLv.${char.level + 1}に強化されました！`)
  }

  const handleEvolve = (index: number) => {
    const char = characters[index]
    if (!char) return
    if (char.evolved) { setMessage('既に進化済みです！'); return }
    if (char.level < 20) { setMessage('Lv.20以上で進化可能です！'); return }
    if (gold < 10000) { setMessage('お金が足りません！（10,000必要）'); return }
    evolveCharacter(char.id)
    setMessage(`${char.name.split(' ')[1]}が進化しました！`)
  }

  const handleSell = (index: number) => {
    const char = characters[index]
    if (!char) return
    if (party.some(p => characters[p]?.id === char.id)) { setMessage('編成中のキャラは売却できません！'); return }
    const price = char.rarity === 'SSR' ? 5000 : char.rarity === 'SR' ? 2000 : 500
    removeCharacter(char.id)
    setMessage(`${char.name.split(' ')[1]}を売却しました！（+${price.toLocaleString()}G）`)
    setSelectedChar(null)
  }

  const menuButtons = [
    { label: 'パーティ編成', sub: 'チームを組む', screen: 'party' as SubScreen, color: '#00ccff', icon: '👥' },
    { label: 'キャラ強化', sub: 'レベルアップ', screen: 'enhance' as SubScreen, color: '#44ff88', icon: '⬆️' },
    { label: 'キャラ進化', sub: 'レアリティUP', screen: 'evolve' as SubScreen, color: '#ffaa00', icon: '⭐' },
    { label: 'キャラ一覧', sub: '所持キャラ確認', screen: 'list' as SubScreen, color: '#aa88ff', icon: '📋' },
    { label: '限界突破', sub: 'さらに強く', screen: 'limit_break' as SubScreen, color: '#ff4444', icon: '🔥' },
    { label: 'キャラ売却', sub: 'お金に変換', screen: 'sell' as SubScreen, color: '#888888', icon: '🪙' },
  ]

  const CharCard = ({ char, index, onClick, extra }: { char: typeof characters[0]; index: number; onClick?: () => void; extra?: string }) => (
    <div onClick={onClick} style={{
      padding: '10px 6px', borderRadius: 8, cursor: onClick ? 'pointer' : 'default',
      background: 'linear-gradient(135deg, #1a1a3a, #0a0a20)',
      border: `1px solid ${rarityColors[char.rarity]}44`, textAlign: 'center', width: 85,
    }}>
      <span style={{ fontSize: 28 }}>{char.icon}</span>
      <div style={{ color: rarityColors[char.rarity], fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>{char.rarity}{char.evolved ? ' ✦' : ''}</div>
      <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{char.name.split(' ')[1]}</div>
      <div style={{ color: char.color, fontSize: 9 }}>{char.sense}</div>
      <div style={{ color: '#666', fontSize: 8 }}>Lv.{char.level}/{char.maxLevel}</div>
      {extra && <div style={{ color: '#44ff88', fontSize: 8, fontWeight: 'bold', marginTop: 2 }}>{extra}</div>}
    </div>
  )

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #222244' }}>
        <div onClick={subScreen === 'menu' ? onBack : () => { setSubScreen('menu'); setMessage(''); setSelectedChar(null); setSelectedSlot(null) }}
          style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>← {subScreen === 'menu' ? '戻る' : 'メニューへ'}</div>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
          {subScreen === 'menu' ? '👥 キャラ管理' : subScreen === 'party' ? '👥 パーティ編成' : subScreen === 'enhance' ? '⬆️ キャラ強化' : subScreen === 'evolve' ? '⭐ キャラ進化' : subScreen === 'list' ? '📋 キャラ一覧' : subScreen === 'limit_break' ? '🔥 限界突破' : '🪙 キャラ売却'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ color: '#ffcc00', fontSize: 13, fontWeight: 'bold' }}>{gold.toLocaleString()}</span>
        </div>
      </div>

      {message && (
        <div style={{ background: '#111133', margin: '5px 10px', padding: '8px 15px', borderRadius: 6, border: '1px solid #333366', textAlign: 'center' }}>
          <span style={{ color: '#ccccee', fontSize: 13 }}>{message}</span>
        </div>
      )}

      {subScreen === 'menu' && (
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 350, width: '100%' }}>
            {menuButtons.map((btn, i) => (
              <div key={i} onClick={() => setSubScreen(btn.screen)} style={{
                background: 'linear-gradient(135deg, #1a1a3a, #0f0f25)', border: `1px solid ${btn.color}44`,
                borderRadius: 10, padding: '18px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${btn.color}`; e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.border = `1px solid ${btn.color}44`; e.currentTarget.style.transform = 'scale(1)' }}>
                <span style={{ fontSize: 30 }}>{btn.icon}</span>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 6 }}>{btn.label}</div>
                <div style={{ color: '#888', fontSize: 10, marginTop: 2 }}>{btn.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subScreen === 'party' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>現在のパーティ</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 15 }}>
            {party.map((charIdx, slot) => {
              const char = characters[charIdx]
              if (!char) return null
              return (
                <div key={slot} onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  style={{ width: 100, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', background: selectedSlot === slot ? 'linear-gradient(135deg, #2a2a5a, #1a1a40)' : 'linear-gradient(135deg, #1a1a3a, #0a0a20)', border: selectedSlot === slot ? '2px solid #00ccff' : `1px solid ${rarityColors[char.rarity]}44`, textAlign: 'center' }}>
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
              <CharCard key={i} char={char} index={i} onClick={selectedSlot !== null ? () => handleCharSelect(i) : undefined} extra={party.includes(i) ? '編成中' : undefined} />
            ))}
          </div>
        </div>
      )}

      {subScreen === 'enhance' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>強化するキャラを選択</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => <CharCard key={i} char={char} index={i} onClick={() => setSelectedChar(i)} />)}
          </div>
          {selectedChar !== null && characters[selectedChar] && (
            <div style={{ marginTop: 15, background: '#111133', borderRadius: 10, padding: '15px', border: '1px solid #333366', textAlign: 'center' }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 5 }}>Lv.{characters[selectedChar].level}/{characters[selectedChar].maxLevel} | HP {characters[selectedChar].hp} | ATK {characters[selectedChar].attack}</div>
              <div style={{ color: '#ffcc00', fontSize: 12, marginTop: 8 }}>コスト: 🪙 {(characters[selectedChar].level * 500).toLocaleString()}</div>
              <button onClick={() => handleEnhance(selectedChar)} style={{ background: 'linear-gradient(90deg, #44ff88, #00cc66)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 40px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', marginTop: 10 }}>⬆️ 強化する</button>
            </div>
          )}
        </div>
      )}

      {subScreen === 'evolve' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>進化するキャラを選択（Lv.20以上）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => (
              <div key={i} style={{ opacity: char.level >= 20 && !char.evolved ? 1 : 0.4 }}>
                <CharCard char={char} index={i} onClick={char.level >= 20 && !char.evolved ? () => setSelectedChar(i) : undefined} extra={char.evolved ? '進化済' : char.level < 20 ? 'Lv.20必要' : undefined} />
              </div>
            ))}
          </div>
          {selectedChar !== null && characters[selectedChar] && !characters[selectedChar].evolved && (
            <div style={{ marginTop: 15, background: '#111133', borderRadius: 10, padding: '15px', border: '1px solid #ffaa0044', textAlign: 'center' }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ color: '#ffcc00', fontSize: 12, marginTop: 10 }}>進化コスト: 🪙 10,000</div>
              <button onClick={() => handleEvolve(selectedChar)} style={{ background: 'linear-gradient(90deg, #ffaa00, #ff6600)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 40px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', marginTop: 10 }}>⭐ 進化させる</button>
            </div>
          )}
        </div>
      )}

      {subScreen === 'list' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>所持キャラ ({characters.length})</div>
          {characters.map((char, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111133', borderRadius: 8, padding: '10px 15px', border: `1px solid ${rarityColors[char.rarity]}33`, marginBottom: 6 }}>
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
      )}

      {subScreen === 'limit_break' && (
        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 50 }}>🔥</span>
            <div style={{ color: '#ff4444', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>限界突破</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 5 }}>Coming Soon...</div>
          </div>
        </div>
      )}

      {subScreen === 'sell' && (
        <div style={{ flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto' }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>売却するキャラを選択</div>
          <div style={{ color: '#ff4444', fontSize: 10, marginBottom: 8 }}>※編成中のキャラは売却できません</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {characters.map((char, i) => {
              const inParty = party.some(p => characters[p]?.id === char.id)
              const price = char.rarity === 'SSR' ? 5000 : char.rarity === 'SR' ? 2000 : 500
              return <div key={i} style={{ opacity: inParty ? 0.3 : 1 }}>
                <CharCard char={char} index={i} onClick={!inParty ? () => setSelectedChar(i) : undefined} extra={inParty ? '編成中' : `🪙 ${price.toLocaleString()}`} />
              </div>
            })}
          </div>
          {selectedChar !== null && characters[selectedChar] && (
            <div style={{ marginTop: 15, background: '#111133', borderRadius: 10, padding: '15px', border: '1px solid #ff444444', textAlign: 'center' }}>
              <span style={{ fontSize: 40 }}>{characters[selectedChar].icon}</span>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>{characters[selectedChar].name}</div>
              <div style={{ color: '#ff4444', fontSize: 13, marginTop: 8 }}>このキャラを売却しますか？</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
                <button onClick={() => handleSell(selectedChar)} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 30px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>売却する</button>
                <button onClick={() => setSelectedChar(null)} style={{ background: '#333344', color: '#aaa', border: '1px solid #444466', borderRadius: 8, padding: '10px 30px', fontSize: 14, cursor: 'pointer' }}>キャンセル</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: '0 0 auto', textAlign: 'center', padding: '8px 20px 12px', borderTop: '1px solid #222244' }}>
        <div style={{ color: '#888', fontSize: 11 }}>パーティ総戦闘力</div>
        <div style={{ color: '#ffcc00', fontSize: 20, fontWeight: 'bold' }}>
          {party.reduce((sum, idx) => { const c = characters[idx]; return sum + (c ? c.hp + c.attack * 5 : 0) }, 0).toLocaleString()}
        </div>
      </div>
    </div>
  )
}