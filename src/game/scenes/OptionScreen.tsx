import { useState } from 'react'

interface OptionScreenProps {
  onBack: () => void
}

export default function OptionScreen({ onBack }: OptionScreenProps) {
  const [bgmVolume, setBgmVolume] = useState(70)
  const [seVolume, setSeVolume] = useState(80)
  const [voiceVolume, setVoiceVolume] = useState(90)
  const [quality, setQuality] = useState<'low' | 'mid' | 'high'>('high')
  const [notifications, setNotifications] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [showReset, setShowReset] = useState(false)
  const [message, setMessage] = useState('')

  const VolumeSlider = ({ label, icon, value, onChange }: {
    label: string; icon: string; value: number; onChange: (v: number) => void
  }) => (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: '#ccccee', fontSize: 13 }}>{icon} {label}</span>
        <span style={{ color: '#00ccff', fontSize: 13, fontWeight: 'bold' }}>{value}%</span>
      </div>
      <div style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center' }}>
        <input
          type="range" min="0" max="100" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%', height: 6, appearance: 'none', background: '#1a1a3a',
            borderRadius: 3, outline: 'none',
            accentColor: '#00ccff',
          }}
        />
      </div>
    </div>
  )

  const ToggleSwitch = ({ label, icon, value, onChange }: {
    label: string; icon: string; value: boolean; onChange: (v: boolean) => void
  }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid #1a1a33',
    }}>
      <span style={{ color: '#ccccee', fontSize: 13 }}>{icon} {label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 50, height: 26, borderRadius: 13, cursor: 'pointer',
          background: value ? '#00cc66' : '#333355',
          position: 'relative', transition: 'background 0.3s',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#ffffff', position: 'absolute', top: 2,
          left: value ? 26 : 2, transition: 'left 0.3s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )

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
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>⚙️ 設定</div>
        <div style={{ width: 50 }} />
      </div>

      {/* メッセージ */}
      {message && (
        <div style={{
          background: '#111133', margin: '5px 10px', padding: '8px 15px',
          borderRadius: 6, border: '1px solid #333366', textAlign: 'center',
        }}>
          <span style={{ color: '#44ff88', fontSize: 13 }}>{message}</span>
        </div>
      )}

      {/* 設定一覧 */}
      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '15px 20px' }}>

        {/* サウンド設定 */}
        <div style={{
          background: '#111133', borderRadius: 10, padding: '15px 20px',
          border: '1px solid #222255', marginBottom: 12,
        }}>
          <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>
            🔊 サウンド設定
          </div>
          <VolumeSlider label="BGM音量" icon="🎵" value={bgmVolume} onChange={setBgmVolume} />
          <VolumeSlider label="SE音量" icon="🔔" value={seVolume} onChange={setSeVolume} />
          <VolumeSlider label="ボイス音量" icon="🗣️" value={voiceVolume} onChange={setVoiceVolume} />
        </div>

        {/* ゲーム設定 */}
        <div style={{
          background: '#111133', borderRadius: 10, padding: '15px 20px',
          border: '1px solid #222255', marginBottom: 12,
        }}>
          <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
            🎮 ゲーム設定
          </div>

          {/* グラフィック品質 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#ccccee', fontSize: 13, marginBottom: 8 }}>🖥️ グラフィック品質</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['low', 'mid', 'high'] as const).map(q => (
                <div key={q} onClick={() => setQuality(q)} style={{
                  flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 6, cursor: 'pointer',
                  background: quality === q ? '#00ccff22' : '#0a0a1a',
                  border: quality === q ? '1px solid #00ccff' : '1px solid #333355',
                  color: quality === q ? '#00ccff' : '#666688',
                  fontSize: 12, fontWeight: 'bold', transition: 'all 0.2s',
                }}>
                  {q === 'low' ? '低' : q === 'mid' ? '中' : '高'}
                </div>
              ))}
            </div>
          </div>

          <ToggleSwitch label="通知" icon="🔔" value={notifications} onChange={setNotifications} />
          <ToggleSwitch label="ストーリーオート再生" icon="▶️" value={autoPlay} onChange={setAutoPlay} />

          {/* 言語設定 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid #1a1a33',
          }}>
            <span style={{ color: '#ccccee', fontSize: 13 }}>🌐 言語</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['ja', 'en'] as const).map(lang => (
                <div key={lang} onClick={() => setLanguage(lang)} style={{
                  padding: '5px 14px', borderRadius: 5, cursor: 'pointer',
                  background: language === lang ? '#00ccff22' : '#0a0a1a',
                  border: language === lang ? '1px solid #00ccff' : '1px solid #333355',
                  color: language === lang ? '#00ccff' : '#666688',
                  fontSize: 12, fontWeight: 'bold',
                }}>
                  {lang === 'ja' ? '日本語' : 'English'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* アカウント */}
        <div style={{
          background: '#111133', borderRadius: 10, padding: '15px 20px',
          border: '1px solid #222255', marginBottom: 12,
        }}>
          <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
            👤 アカウント
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid #1a1a33',
          }}>
            <span style={{ color: '#ccccee', fontSize: 13 }}>プレイヤーID</span>
            <span style={{ color: '#888', fontSize: 12 }}>SENS-2026-0001</span>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid #1a1a33',
          }}>
            <span style={{ color: '#ccccee', fontSize: 13 }}>プレイヤー名</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>甘利 悠真</span>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid #1a1a33',
          }}>
            <span style={{ color: '#ccccee', fontSize: 13 }}>データ連携</span>
            <div onClick={() => setMessage('データ連携機能は今後実装予定です')} style={{
              background: '#4444aa', color: '#fff', padding: '5px 15px',
              borderRadius: 5, fontSize: 11, cursor: 'pointer',
            }}>連携する</div>
          </div>
        </div>

        {/* サポート */}
        <div style={{
          background: '#111133', borderRadius: 10, padding: '15px 20px',
          border: '1px solid #222255', marginBottom: 12,
        }}>
          <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
            📬 サポート
          </div>

          {[
            { label: 'お問い合わせ', icon: '✉️' },
            { label: '利用規約', icon: '📄' },
            { label: 'プライバシーポリシー', icon: '🔒' },
            { label: 'クレジット', icon: '📝' },
          ].map((item, i) => (
            <div key={i} onClick={() => setMessage(`${item.label}は今後実装予定です`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < 3 ? '1px solid #1a1a33' : 'none',
              cursor: 'pointer',
            }}>
              <span style={{ color: '#ccccee', fontSize: 13 }}>{item.icon} {item.label}</span>
              <span style={{ color: '#444', fontSize: 14 }}>▶</span>
            </div>
          ))}
        </div>

        {/* バージョン情報 */}
        <div style={{
          background: '#111133', borderRadius: 10, padding: '15px 20px',
          border: '1px solid #222255', marginBottom: 12,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#ccccee', fontSize: 13 }}>📱 バージョン</span>
            <span style={{ color: '#888', fontSize: 12 }}>v0.1.0 (Early Access)</span>
          </div>
        </div>

        {/* データリセット */}
        <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 30 }}>
          <div onClick={() => setShowReset(true)} style={{
            color: '#ff4444', fontSize: 13, cursor: 'pointer',
            padding: '10px 0',
          }}>
            ⚠️ データリセット
          </div>
        </div>
      </div>

      {/* リセット確認ポップアップ */}
      {showReset && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowReset(false)}>
          <div style={{
            background: 'linear-gradient(180deg, #1a1a3a, #0a0a20)',
            border: '1px solid #ff444444', borderRadius: 12,
            padding: '25px', width: '80%', maxWidth: 350, textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>⚠️</div>
            <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              データリセット
            </div>
            <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 5 }}>
              すべてのデータが削除されます
            </div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>
              この操作は取り消せません。本当にリセットしますか？
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => {
                setShowReset(false)
                setMessage('データがリセットされました（デモ）')
              }} style={{
                background: '#ff4444', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 25px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
              }}>リセットする</button>
              <button onClick={() => setShowReset(false)} style={{
                background: '#333344', color: '#aaa', border: '1px solid #444466',
                borderRadius: 8, padding: '10px 25px', fontSize: 14, cursor: 'pointer',
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}