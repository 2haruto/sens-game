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
  hp: number
  attack: number
}

const ownedCharacters: Character[] = [
  { name: '甘利 悠真', sense: '味覚', rarity: 'SR', icon: '🧑', color: '#00ccff', level: 1, hp: 800, attack: 65 },
  { name: '鶴見 杏', sense: '温度', rarity: 'SR', icon: '👩', color: '#ff88cc', level: 1, hp: 700, attack: 55 },
  { name: '藤原 颯太', sense: '視覚', rarity: 'R', icon: '🧑‍🦱', color: '#88ff44', level: 1, hp: 750, attack: 60 },
  { name: '高橋 蓮', sense: '視覚', rarity: 'R', icon: '🧑', color: '#88aacc', level: 1, hp: 720, attack: 58 },
  { name: '西園寺 陸', sense: '聴覚', rarity: 'R', icon: '🧑‍🦰', color: '#cc88ff', level: 1, hp: 680, attack: 52 },
  { name: '黒田 大和', sense: '触覚', rarity: 'R', icon: '💪', color: '#ffaa44', level: 1, hp: 800, attack: 70 },
  { name: '朝倉 瑛太', sense: '嗅覚', rarity: 'R', icon: '🌿', color: '#44cc88', level: 1, hp: 690, attack: 54 },
  { name: '柏木 湊', sense: '味覚', rarity: 'R', icon: '🍴', color: '#88ccff', level: 1, hp: 710, attack: 56 },
]

const rarityColors: Record<string, string> = {
  SSR: '#ffcc00',
  SR: '#aa44ff',
  R: '#4466aa',
}

export default function TeamScreen({ onBack }: TeamScreenProps) {
  const [party, setParty] = useState<number[]>([0, 1, 2])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  const handleCharSelect = (charIndex: number) => {
    if (selectedSlot === null) return
    if (party.includes(charIndex) && party[selectedSlot] !== charIndex) {
      // 入れ替え
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

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #222244',
      }}>
        <div onClick={onBack} style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>← 戻る</div>
        <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>👥 編成</div>
        <div style={{ width: 50 }} />
      </div>

      {/* 現在のパーティ */}
      <div style={{ flex: '0 0 auto', padding: '15px 20px' }}>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>現在のパーティ</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
          {party.map((charIdx, slot) => {
            const char = ownedCharacters[charIdx]
            const isSelected = selectedSlot === slot
            return (
              <div
                key={slot}
                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                style={{
                  width: 100, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                  background: isSelected
                    ? 'linear-gradient(135deg, #2a2a5a, #1a1a40)'
                    : 'linear-gradient(135deg, #1a1a3a, #0a0a20)',
                  border: isSelected ? '2px solid #00ccff' : `1px solid ${rarityColors[char.rarity]}44`,
                  textAlign: 'center', transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 0 15px #00ccff44' : 'none',
                }}
              >
                <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
                  {slot === 0 ? 'リーダー' : `メンバー${slot}`}
                </div>
                <span style={{ fontSize: 32 }}>{char.icon}</span>
                <div style={{
                  color: rarityColors[char.rarity], fontSize: 10,
                  fontWeight: 'bold', marginTop: 4,
                }}>
                  {char.rarity}
                </div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>
                  {char.name.split(' ')[1]}
                </div>
                <div style={{ color: char.color, fontSize: 10 }}>{char.sense}</div>
                <div style={{ color: '#888', fontSize: 9, marginTop: 4 }}>
                  Lv.{char.level} | HP {char.hp}
                </div>
              </div>
            )
          })}
        </div>
        {selectedSlot !== null && (
          <div style={{ textAlign: 'center', color: '#00ccff', fontSize: 12, marginTop: 8 }}>
            ▼ 下のキャラを選んで入れ替え ▼
          </div>
        )}
      </div>

      {/* 区切り線 */}
      <div style={{ borderTop: '1px solid #222244', margin: '0 20px' }} />

      {/* 所持キャラ一覧 */}
      <div style={{
        flex: '1 1 auto', padding: '10px 15px', overflowY: 'auto',
      }}>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
          所持キャラ ({ownedCharacters.length})
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 8,
        }}>
          {ownedCharacters.map((char, i) => {
            const inParty = party.includes(i)
            return (
              <div
                key={i}
                onClick={() => handleCharSelect(i)}
                style={{
                  padding: '10px 5px', borderRadius: 8, cursor: selectedSlot !== null ? 'pointer' : 'default',
                  background: inParty
                    ? 'linear-gradient(135deg, #1a2a1a, #0a1a0a)'
                    : 'linear-gradient(135deg, #1a1a2a, #0a0a15)',
                  border: inParty
                    ? '1px solid #44ff4444'
                    : `1px solid ${rarityColors[char.rarity]}33`,
                  textAlign: 'center', transition: 'all 0.2s',
                  opacity: selectedSlot !== null ? 1 : 0.7,
                }}
              >
                <span style={{ fontSize: 24 }}>{char.icon}</span>
                <div style={{
                  color: rarityColors[char.rarity], fontSize: 9,
                  fontWeight: 'bold', marginTop: 2,
                }}>
                  {char.rarity}
                </div>
                <div style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {char.name.split(' ')[1]}
                </div>
                <div style={{ color: char.color, fontSize: 9 }}>{char.sense}</div>
                <div style={{ color: '#666', fontSize: 8 }}>Lv.{char.level}</div>
                {inParty && (
                  <div style={{
                    color: '#44ff44', fontSize: 8, fontWeight: 'bold', marginTop: 2,
                  }}>
                    編成中
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* パーティ戦闘力 */}
      <div style={{
        flex: '0 0 auto', textAlign: 'center', padding: '10px 20px 15px',
        borderTop: '1px solid #222244',
      }}>
        <div style={{ color: '#888', fontSize: 12 }}>パーティ総戦闘力</div>
        <div style={{ color: '#ffcc00', fontSize: 22, fontWeight: 'bold' }}>
          {party.reduce((sum, idx) => sum + ownedCharacters[idx].hp + ownedCharacters[idx].attack * 5, 0).toLocaleString()}
        </div>
      </div>
    </div>
  )
}