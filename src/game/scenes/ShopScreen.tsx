import { useState } from 'react'

interface ShopScreenProps {
  onBack: () => void
}

type ShopTab = 'diamond' | 'gold' | 'item' | 'special'

interface ShopItem {
  id: number
  name: string
  description: string
  icon: string
  price: number
  currency: 'diamond' | 'gold'
  amount?: number
  category: ShopTab
  limited?: boolean
  stock?: number
}

const shopItems: ShopItem[] = [
  // ダイヤショップ
  { id: 1, name: 'ゴールドパック S', description: 'ゴールド 10,000', icon: '🪙', price: 50, currency: 'diamond', amount: 10000, category: 'diamond' },
  { id: 2, name: 'ゴールドパック M', description: 'ゴールド 50,000', icon: '💰', price: 200, currency: 'diamond', amount: 50000, category: 'diamond' },
  { id: 3, name: 'ゴールドパック L', description: 'ゴールド 200,000', icon: '👑', price: 700, currency: 'diamond', amount: 200000, category: 'diamond' },
  { id: 4, name: 'スタミナ回復', description: 'スタミナ全回復', icon: '⚡', price: 30, currency: 'diamond', category: 'diamond' },
  { id: 5, name: 'ガチャチケット', description: '単発ガチャ1回分', icon: '🎫', price: 45, currency: 'diamond', category: 'diamond' },
  // ゴールドショップ
  { id: 101, name: '経験値ポーション S', description: 'EXP +500', icon: '🧪', price: 2000, currency: 'gold', category: 'gold' },
  { id: 102, name: '経験値ポーション M', description: 'EXP +2000', icon: '⚗️', price: 7000, currency: 'gold', category: 'gold' },
  { id: 103, name: '経験値ポーション L', description: 'EXP +10000', icon: '🏺', price: 30000, currency: 'gold', category: 'gold' },
  { id: 104, name: '強化素材パック', description: '強化素材 x5', icon: '📦', price: 5000, currency: 'gold', category: 'gold' },
  { id: 105, name: '進化素材パック', description: '進化素材 x3', icon: '🎁', price: 15000, currency: 'gold', category: 'gold' },
  // アイテムショップ
  { id: 201, name: 'HPポーション', description: 'バトル中HP30%回復', icon: '❤️', price: 1000, currency: 'gold', category: 'item' },
  { id: 202, name: '攻撃力ブースター', description: 'バトル中攻撃力20%UP', icon: '💪', price: 1500, currency: 'gold', category: 'item' },
  { id: 203, name: '防御力ブースター', description: 'バトル中防御力20%UP', icon: '🛡️', price: 1500, currency: 'gold', category: 'item' },
  { id: 204, name: '復活の石', description: '戦闘不能から復活', icon: '💫', price: 100, currency: 'diamond', category: 'item' },
  // 期間限定
  { id: 301, name: '覚醒パック', description: 'ダイヤ x100 + ゴールド x50,000', icon: '🌟', price: 300, currency: 'diamond', category: 'special', limited: true, stock: 3 },
  { id: 302, name: '初心者応援セット', description: 'ガチャチケット x3 + 経験値ポーション L x5', icon: '🎊', price: 500, currency: 'diamond', category: 'special', limited: true, stock: 1 },
  { id: 303, name: '特別強化パック', description: '強化素材 x20 + 進化素材 x10', icon: '⭐', price: 200, currency: 'diamond', category: 'special', limited: true, stock: 5 },
]

const tabConfig: { key: ShopTab; label: string; icon: string; color: string }[] = [
  { key: 'diamond', label: 'ダイヤ交換', icon: '💎', color: '#00ccff' },
  { key: 'gold', label: 'ゴールド', icon: '🪙', color: '#ffcc00' },
  { key: 'item', label: 'アイテム', icon: '🧪', color: '#44ff88' },
  { key: 'special', label: '期間限定', icon: '🌟', color: '#ff4444' },
]

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const [tab, setTab] = useState<ShopTab>('diamond')
  const [gold, setGold] = useState(125000)
  const [diamonds, setDiamonds] = useState(1000)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [message, setMessage] = useState('')
  const [stocks, setStocks] = useState<Record<number, number>>(
    Object.fromEntries(shopItems.filter(i => i.stock).map(i => [i.id, i.stock!]))
  )

  const buyItem = (item: ShopItem) => {
    // 在庫チェック
    if (item.limited && stocks[item.id] !== undefined && stocks[item.id] <= 0) {
      setMessage('売り切れです！')
      return
    }

    // 通貨チェック
    if (item.currency === 'diamond') {
      if (diamonds < item.price) { setMessage('ダイヤが足りません！'); return }
      setDiamonds(prev => prev - item.price)
    } else {
      if (gold < item.price) { setMessage('ゴールドが足りません！'); return }
      setGold(prev => prev - item.price)
    }

    // ゴールドパック処理
    if (item.amount && item.name.includes('ゴールドパック')) {
      setGold(prev => prev + item.amount!)
    }

    // 在庫減少
    if (item.limited && stocks[item.id] !== undefined) {
      setStocks(prev => ({ ...prev, [item.id]: prev[item.id] - 1 }))
    }

    setMessage(`${item.name}を購入しました！`)
    setSelectedItem(null)
  }

  const filteredItems = shopItems.filter(i => i.category === tab)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ヘッダー */}
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #222244',
      }}>
        <div onClick={onBack} style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>← 戻る</div>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>🛒 ショップ</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span style={{ color: '#ffcc00' }}>🪙 {gold.toLocaleString()}</span>
          <span style={{ color: '#00ccff' }}>💎 {diamonds.toLocaleString()}</span>
        </div>
      </div>

      {/* タブ */}
      <div style={{ flex: '0 0 auto', display: 'flex', borderBottom: '1px solid #222244' }}>
        {tabConfig.map(t => (
          <div key={t.key} onClick={() => { setTab(t.key); setSelectedItem(null); setMessage('') }}
            style={{
              flex: 1, textAlign: 'center', padding: '10px 0', cursor: 'pointer',
              borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent',
              background: tab === t.key ? '#111133' : 'transparent',
              transition: 'all 0.2s',
            }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <div style={{
              color: tab === t.key ? t.color : '#666688',
              fontSize: 10, fontWeight: 'bold', marginTop: 2,
            }}>{t.label}</div>
          </div>
        ))}
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

      {/* 期間限定バナー */}
      {tab === 'special' && (
        <div style={{
          margin: '8px 15px 0', background: 'linear-gradient(135deg, #2a0a1a, #1a0a2a)',
          border: '1px solid #ff444444', borderRadius: 8, padding: '8px 15px', textAlign: 'center',
        }}>
          <span style={{ color: '#ff4444', fontSize: 12, fontWeight: 'bold' }}>
            🌟 期間限定セール — 残り 3日
          </span>
        </div>
      )}

      {/* 商品一覧 */}
      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '10px 15px' }}>
        {filteredItems.map(item => {
          const soldOut = item.limited && stocks[item.id] !== undefined && stocks[item.id] <= 0
          return (
            <div key={item.id}
              onClick={() => !soldOut && setSelectedItem(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: selectedItem?.id === item.id
                  ? 'linear-gradient(135deg, #1a1a4a, #0f0f30)'
                  : soldOut ? '#0a0a15' : '#111133',
                borderRadius: 8, padding: '12px 15px', marginBottom: 8,
                border: selectedItem?.id === item.id
                  ? `1px solid ${tabConfig.find(t => t.key === tab)?.color}`
                  : '1px solid #222244',
                cursor: soldOut ? 'not-allowed' : 'pointer',
                opacity: soldOut ? 0.4 : 1,
                transition: 'all 0.2s',
              }}>

              {/* アイコン */}
              <div style={{
                width: 50, height: 50, borderRadius: 10,
                background: 'linear-gradient(135deg, #1a1a3a, #0a0a20)',
                border: '1px solid #333355',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>{item.icon}</div>

              {/* 情報 */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{item.name}</span>
                  {item.limited && (
                    <span style={{
                      fontSize: 9, color: '#ff4444', fontWeight: 'bold',
                      background: '#ff444422', padding: '1px 5px', borderRadius: 3,
                    }}>限定</span>
                  )}
                </div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{item.description}</div>
                {item.limited && stocks[item.id] !== undefined && (
                  <div style={{ color: soldOut ? '#ff4444' : '#888', fontSize: 10, marginTop: 2 }}>
                    {soldOut ? '売り切れ' : `残り ${stocks[item.id]}個`}
                  </div>
                )}
              </div>

              {/* 価格 */}
              <div style={{
                background: item.currency === 'diamond' ? '#00ccff22' : '#ffcc0022',
                borderRadius: 6, padding: '6px 12px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 14 }}>{item.currency === 'diamond' ? '💎' : '🪙'}</span>
                <div style={{
                  color: item.currency === 'diamond' ? '#00ccff' : '#ffcc00',
                  fontSize: 14, fontWeight: 'bold',
                }}>{item.price.toLocaleString()}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 購入ボタン */}
      {selectedItem && (
        <div style={{
          flex: '0 0 auto', padding: '10px 15px 15px',
          borderTop: '1px solid #222244', background: '#0a0a1aEE',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                {selectedItem.icon} {selectedItem.name}
              </div>
              <div style={{ color: '#888', fontSize: 11 }}>{selectedItem.description}</div>
            </div>
            <div style={{
              color: selectedItem.currency === 'diamond' ? '#00ccff' : '#ffcc00',
              fontSize: 16, fontWeight: 'bold',
            }}>
              {selectedItem.currency === 'diamond' ? '💎' : '🪙'} {selectedItem.price.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => buyItem(selectedItem)} style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(90deg, #44ff88, #00cc66)',
              color: '#000', border: 'none', borderRadius: 8,
              fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
            }}>購入する</button>
            <button onClick={() => { setSelectedItem(null); setMessage('') }} style={{
              padding: '12px 20px',
              background: '#333344', color: '#aaa',
              border: '1px solid #444466', borderRadius: 8,
              fontSize: 14, cursor: 'pointer',
            }}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  )
}