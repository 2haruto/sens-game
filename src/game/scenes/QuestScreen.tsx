import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

interface QuestScreenProps {
  onBack: () => void
  onStartBattle: (quest: QuestData) => void
}

export interface QuestData {
  id: number
  name: string
  type: 'story' | 'event' | 'gold' | 'diamond'
  chapter?: string
  difficulty: string
  stamina: number
  rewards: { gold: number; diamond: number; exp: number }
  enemyLevel: number
}

const quests: QuestData[] = [
  { id: 1, name: '覚醒の始まり', type: 'story', chapter: '第1章 第1話', difficulty: 'Easy', stamina: 5, rewards: { gold: 500, diamond: 10, exp: 50 }, enemyLevel: 1 },
  { id: 2, name: '桐生翔との再会', type: 'story', chapter: '第1章 第2話', difficulty: 'Easy', stamina: 5, rewards: { gold: 500, diamond: 10, exp: 50 }, enemyLevel: 2 },
  { id: 3, name: '鷹宮零の試練', type: 'story', chapter: '第1章 第3話', difficulty: 'Normal', stamina: 8, rewards: { gold: 800, diamond: 15, exp: 80 }, enemyLevel: 3 },
  { id: 4, name: '初めてのロスト討伐', type: 'story', chapter: '第1章 第4話', difficulty: 'Normal', stamina: 10, rewards: { gold: 1000, diamond: 20, exp: 100 }, enemyLevel: 5 },
  { id: 101, name: '覚醒の試練 初級', type: 'event', difficulty: 'Easy', stamina: 8, rewards: { gold: 1000, diamond: 5, exp: 60 }, enemyLevel: 3 },
  { id: 102, name: '覚醒の試練 中級', type: 'event', difficulty: 'Hard', stamina: 15, rewards: { gold: 2000, diamond: 15, exp: 120 }, enemyLevel: 8 },
  { id: 103, name: '覚醒の試練 上級', type: 'event', difficulty: 'Expert', stamina: 25, rewards: { gold: 5000, diamond: 30, exp: 200 }, enemyLevel: 15 },
  { id: 201, name: 'ゴールドラッシュ 初級', type: 'gold', difficulty: 'Easy', stamina: 10, rewards: { gold: 5000, diamond: 0, exp: 30 }, enemyLevel: 3 },
  { id: 202, name: 'ゴールドラッシュ 中級', type: 'gold', difficulty: 'Normal', stamina: 15, rewards: { gold: 15000, diamond: 0, exp: 50 }, enemyLevel: 6 },
  { id: 203, name: 'ゴールドラッシュ 上級', type: 'gold', difficulty: 'Hard', stamina: 25, rewards: { gold: 50000, diamond: 0, exp: 80 }, enemyLevel: 10 },
  { id: 301, name: 'ダイヤ発掘 初級', type: 'diamond', difficulty: 'Normal', stamina: 15, rewards: { gold: 500, diamond: 30, exp: 40 }, enemyLevel: 5 },
  { id: 302, name: 'ダイヤ発掘 上級', type: 'diamond', difficulty: 'Expert', stamina: 30, rewards: { gold: 1000, diamond: 80, exp: 100 }, enemyLevel: 12 },
]

type QuestTab = 'story' | 'event' | 'gold' | 'diamond'

const tabConfig: { key: QuestTab; label: string; icon: string; color: string }[] = [
  { key: 'story', label: 'ストーリー', icon: '📖', color: '#00ccff' },
  { key: 'event', label: 'イベント', icon: '🔥', color: '#ff4444' },
  { key: 'gold', label: 'ゴールド', icon: '🪙', color: '#ffcc00' },
  { key: 'diamond', label: 'ダイヤ', icon: '💎', color: '#00ccff' },
]

const difficultyColors: Record<string, string> = {
  Easy: '#44ff88', Normal: '#ffcc00', Hard: '#ff8844', Expert: '#ff4444',
}

export default function QuestScreen({ onBack, onStartBattle }: QuestScreenProps) {
  const { stamina, maxStamina, useStamina, questClears } = useGameStore()
  const [tab, setTab] = useState<QuestTab>('story')
  const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null)
  const [message, setMessage] = useState('')

  const handleStartQuest = () => {
    if (!selectedQuest) return
    if (!useStamina(selectedQuest.stamina)) {
      setMessage('スタミナが足りません！')
      return
    }
    onStartBattle(selectedQuest)
  }

  const filteredQuests = quests.filter(q => q.type === tab)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2a 0%, #050510 100%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
    }}>
      <div style={{
        flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #222244',
      }}>
        <div onClick={onBack} style={{ color: '#666688', fontSize: 14, cursor: 'pointer' }}>← 戻る</div>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>⚔️ クエスト</div>
        <div style={{ color: '#44ff88', fontSize: 12 }}>⚡ {stamina}/{maxStamina}</div>
      </div>

      <div style={{ flex: '0 0 auto', display: 'flex', borderBottom: '1px solid #222244' }}>
        {tabConfig.map(t => (
          <div key={t.key} onClick={() => { setTab(t.key); setSelectedQuest(null); setMessage('') }}
            style={{
              flex: 1, textAlign: 'center', padding: '10px 0', cursor: 'pointer',
              borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent',
              background: tab === t.key ? '#111133' : 'transparent',
            }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <div style={{ color: tab === t.key ? t.color : '#666688', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: '#111133', margin: '5px 10px', padding: '8px 15px', borderRadius: 6, border: '1px solid #ff444444', textAlign: 'center' }}>
          <span style={{ color: '#ff4444', fontSize: 13 }}>{message}</span>
        </div>
      )}

      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '10px 15px' }}>
        {tab === 'event' && (
          <div style={{ background: 'linear-gradient(135deg, #2a0a1a, #1a0a2a)', border: '1px solid #ff444444', borderRadius: 8, padding: '10px 15px', marginBottom: 10, textAlign: 'center' }}>
            <span style={{ color: '#ff4444', fontSize: 12, fontWeight: 'bold' }}>🔥 覚醒の試練 — 残り 3日</span>
          </div>
        )}
        {filteredQuests.map(quest => {
          const cleared = questClears[quest.id]
          return (
            <div key={quest.id} onClick={() => { setSelectedQuest(quest); setMessage('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: selectedQuest?.id === quest.id ? 'linear-gradient(135deg, #1a1a4a, #0f0f30)' : '#111133',
                borderRadius: 8, padding: '12px 15px', marginBottom: 8,
                border: selectedQuest?.id === quest.id ? '1px solid #00ccff' : '1px solid #222244',
                cursor: 'pointer',
              }}>
              <div style={{
                width: 45, height: 45, borderRadius: 8,
                background: `linear-gradient(135deg, ${tabConfig.find(t => t.key === quest.type)?.color}22, #0a0a1a)`,
                border: `1px solid ${tabConfig.find(t => t.key === quest.type)?.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {quest.type === 'story' ? '📖' : quest.type === 'event' ? '🔥' : quest.type === 'gold' ? '🪙' : '💎'}
              </div>
              <div style={{ flex: 1 }}>
                {quest.chapter && <div style={{ color: '#888', fontSize: 10, marginBottom: 2 }}>{quest.chapter}</div>}
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{quest.name}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ color: difficultyColors[quest.difficulty], fontSize: 10, fontWeight: 'bold', background: `${difficultyColors[quest.difficulty]}22`, padding: '1px 6px', borderRadius: 3 }}>{quest.difficulty}</span>
                  <span style={{ color: '#888', fontSize: 10 }}>Lv.{quest.enemyLevel}</span>
                  <span style={{ color: stamina >= quest.stamina ? '#44ff88' : '#ff4444', fontSize: 10 }}>⚡{quest.stamina}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {quest.rewards.gold > 0 && <div style={{ color: '#ffcc00', fontSize: 10 }}>🪙 {quest.rewards.gold.toLocaleString()}</div>}
                {quest.rewards.diamond > 0 && <div style={{ color: '#00ccff', fontSize: 10 }}>💎 {quest.rewards.diamond}</div>}
                <div style={{ color: '#888', fontSize: 9 }}>EXP +{quest.rewards.exp}</div>
                {cleared && <div style={{ color: '#44ff88', fontSize: 9, fontWeight: 'bold' }}>✓ クリア済</div>}
              </div>
            </div>
          )
        })}
      </div>

      {selectedQuest && (
        <div style={{ flex: '0 0 auto', padding: '10px 15px 15px', borderTop: '1px solid #222244', background: '#0a0a1aEE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{selectedQuest.name}</div>
              <div style={{ color: '#888', fontSize: 11 }}>消費: ⚡{selectedQuest.stamina} | 敵Lv.{selectedQuest.enemyLevel}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#ffcc00', fontSize: 11 }}>🪙 {selectedQuest.rewards.gold.toLocaleString()}</div>
              {selectedQuest.rewards.diamond > 0 && <div style={{ color: '#00ccff', fontSize: 11 }}>💎 {selectedQuest.rewards.diamond}</div>}
            </div>
          </div>
          <button onClick={handleStartQuest} style={{
            width: '100%', padding: '14px',
            background: stamina >= selectedQuest.stamina ? 'linear-gradient(90deg, #ff4444, #ff6622)' : '#333344',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 18, fontWeight: 'bold',
            cursor: stamina >= selectedQuest.stamina ? 'pointer' : 'not-allowed',
          }}>
            {stamina >= selectedQuest.stamina ? '⚔️ 出撃する' : '⚡ スタミナ不足'}
          </button>
        </div>
      )}
    </div>
  )
}