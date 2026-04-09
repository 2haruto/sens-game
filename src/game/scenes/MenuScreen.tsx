import { useEffect, useState } from 'react'

interface MenuScreenProps {
  onNavigate: (screen: string) => void
}

const newsItems = [
  '🔥 新イベント「覚醒の試練」開催中！',
  '🎉 アップデート v1.1 配信開始！',
  '⚔️ 新キャラ「鷹宮 零」参戦！',
  '📢 メンテナンス予定: 4/15 03:00〜05:00',
  '🎲 SSR確率2倍ガチャ開催中！',
]

export default function MenuScreen({ onNavigate }: MenuScreenProps) {
  const [newsIndex, setNewsIndex] = useState(0)
  const [newsFade, setNewsFade] = useState(true)
  const [showNews, setShowNews] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setNewsFade(false)
      setTimeout(() => {
        setNewsIndex(prev => (prev + 1) % newsItems.length)
        setNewsFade(true)
      }, 300)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const navButtons = [
    { label: 'メニュー', screen: 'menu_sub', icon: '📋', color: '#aa88ff' },
    { label: 'クエスト', screen: 'story', icon: '⚔️', color: '#ff4444' },
    { label: '編成', screen: 'team', icon: '👥', color: '#00ccff' },
    { label: 'ガチャ', screen: 'gacha', icon: '🎲', color: '#ffaa00' },
    { label: 'ショップ', screen: 'shop', icon: '🛒', color: '#44ff88' },
    { label: '設定', screen: 'option', icon: '⚙️', color: '#888888' },
  ]

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* === 上部ステータスバー === */}
      <div style={{
        flex: '0 0 auto', display: 'flex', alignItems: 'stretch',
        padding: '8px 10px', gap: 8,
      }}>
        {/* 左：コイン＋スタミナ */}
        <div style={{
          flex: '1 1 0', background: '#111133', borderRadius: 8,
          padding: '6px 12px', border: '1px solid #222255',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 13 }}>🪙</span>
            <span style={{ color: '#ffcc00', fontSize: 13, fontWeight: 'bold' }}>125,000</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{
                background: '#0a0a1a', borderRadius: 3, height: 10,
                border: '1px solid #333355', overflow: 'hidden',
              }}>
                <div style={{
                  width: '75%', height: '100%', borderRadius: 3,
                  background: 'linear-gradient(90deg, #44ff88, #00cc66)',
                }} />
              </div>
            </div>
            <span style={{ color: '#44ff88', fontSize: 10, fontWeight: 'bold' }}>75/100</span>
          </div>
        </div>

        {/* 中央：ランク */}
        <div style={{
          flex: '0 0 70px', background: '#111133', borderRadius: 8,
          padding: '6px 8px', border: '1px solid #222255',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 8, color: '#888', letterSpacing: 2 }}>RANK</div>
          <div style={{
            fontSize: 24, fontWeight: 'bold', lineHeight: 1,
            background: 'linear-gradient(180deg, #ffcc00, #ff8800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>1</div>
        </div>

        {/* 右：名前＋ダイヤ＋お知らせ */}
        <div style={{
          flex: '1 1 0', display: 'flex', gap: 6,
        }}>
          <div style={{
            flex: '1 1 auto', background: '#111133', borderRadius: 8,
            padding: '6px 12px', border: '1px solid #222255',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-end',
          }}>
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
              甘利 悠真
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>💎</span>
              <span style={{ color: '#00ccff', fontSize: 13, fontWeight: 'bold' }}>1,000</span>
            </div>
          </div>

          {/* お知らせアイコン */}
          <div
            onClick={() => setShowNews(!showNews)}
            style={{
              flex: '0 0 45px', background: '#111133', borderRadius: 8,
              border: '1px solid #222255', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 22 }}>✉️</span>
            {/* 通知バッジ */}
            <div style={{
              position: 'absolute', top: 3, right: 3, width: 16, height: 16,
              borderRadius: '50%', background: '#ff4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#fff', fontWeight: 'bold',
            }}>3</div>
          </div>
        </div>
      </div>

      {/* === お知らせティッカー === */}
      <div style={{
        flex: '0 0 auto', margin: '0 10px', marginBottom: 5,
      }}>
        <div style={{
          background: '#111133', borderRadius: 6, padding: '5px 12px',
          border: '1px solid #222255', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontSize: 9, color: '#ffffff', fontWeight: 'bold', background: '#ff4444',
            borderRadius: 3, padding: '2px 6px', whiteSpace: 'nowrap',
          }}>NEWS</span>
          <span style={{
            fontSize: 11, color: '#ccccee', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
            opacity: newsFade ? 1 : 0, transition: 'opacity 0.3s',
          }}>
            {newsItems[newsIndex]}
          </span>
        </div>
      </div>

      {/* === 中央：キャラ表示エリア === */}
      <div style={{
        flex: '1 1 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        minHeight: 0,
      }}>
        {/* 背景エフェクト */}
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,204,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* キャラ立ち絵 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1,
        }}>
          <span style={{ fontSize: 100 }}>🧑</span>
          <div style={{ color: '#00ccff', fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
            甘利 悠真
          </div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>D級 | 味覚</div>
          <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>Lv.1</div>
        </div>

        {/* イベントバナー（右） */}
        <div
          onClick={() => alert('イベント詳細（今後実装）')}
          style={{
            position: 'absolute', right: 10, top: 10,
            background: 'linear-gradient(135deg, #2a0a3a, #1a0a2a)',
            border: '1px solid #aa44ff44', borderRadius: 8,
            padding: '8px 12px', cursor: 'pointer', maxWidth: 120,
          }}
        >
          <div style={{ color: '#aa44ff', fontSize: 9, fontWeight: 'bold' }}>EVENT</div>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>覚醒の試練</div>
          <div style={{ color: '#888', fontSize: 9, marginTop: 2 }}>残り 3日</div>
        </div>

        {/* デイリー（左） */}
        <div
          onClick={() => alert('ミッション（今後実装）')}
          style={{
            position: 'absolute', left: 10, top: 10,
            background: 'linear-gradient(135deg, #0a2a1a, #0a1a0a)',
            border: '1px solid #44ff8844', borderRadius: 8,
            padding: '8px 12px', cursor: 'pointer', maxWidth: 120,
          }}
        >
          <div style={{ color: '#44ff88', fontSize: 9, fontWeight: 'bold' }}>DAILY</div>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>デイリー任務</div>
          <div style={{ color: '#888', fontSize: 9, marginTop: 2 }}>2/5 達成</div>
        </div>
      </div>

      {/* === 下部ナビバー（丸アイコン） === */}
      <div style={{
        flex: '0 0 auto', background: '#0a0a1aEE',
        borderTop: '1px solid #222244',
        padding: '10px 10px 15px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {navButtons.map((btn, i) => (
          <div
            key={i}
            onClick={() => {
              if (btn.screen === 'menu_sub' || btn.screen === 'option' || btn.screen === 'shop') {
                alert(`${btn.label}画面（今後実装）`)
              } else {
                onNavigate(btn.screen)
              }
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a1a3a, #0f0f25)',
                border: `2px solid ${btn.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, transition: 'all 0.2s',
                boxShadow: `0 2px 10px ${btn.color}22`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `2px solid ${btn.color}`
                e.currentTarget.style.boxShadow = `0 2px 15px ${btn.color}44`
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = `2px solid ${btn.color}44`
                e.currentTarget.style.boxShadow = `0 2px 10px ${btn.color}22`
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {btn.icon}
            </div>
            <span style={{ color: '#cccccc', fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>
              {btn.label}
            </span>
          </div>
        ))}
      </div>

      {/* === お知らせポップアップ === */}
      {showNews && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setShowNews(false)}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #1a1a3a, #0a0a20)',
              border: '1px solid #333366', borderRadius: 12,
              padding: '20px', width: '85%', maxWidth: 400, maxHeight: '70vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 15, borderBottom: '1px solid #222244', paddingBottom: 10,
            }}>
              <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>📬 お知らせ</div>
              <div
                onClick={() => setShowNews(false)}
                style={{ color: '#666', fontSize: 20, cursor: 'pointer' }}
              >✕</div>
            </div>

            {newsItems.map((news, i) => (
              <div key={i} style={{
                padding: '12px 10px', borderBottom: '1px solid #1a1a33',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 8, color: '#fff', fontWeight: 'bold',
                    background: i === 0 ? '#ff4444' : '#444466',
                    borderRadius: 3, padding: '2px 5px',
                  }}>
                    {i === 0 ? 'NEW' : 'INFO'}
                  </span>
                  <span style={{ color: '#ccccee', fontSize: 13 }}>{news}</span>
                </div>
                <div style={{ color: '#555', fontSize: 10, marginTop: 4, paddingLeft: 40 }}>
                  2026/04/{String(9 - i).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}