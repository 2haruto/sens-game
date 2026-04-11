import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 設定
interface Settings {
  bgmVolume: number
  seVolume: number
  voiceVolume: number
  quality: 'low' | 'mid' | 'high'
  notifications: boolean
  autoPlay: boolean
  language: 'ja' | 'en'
}

// キャラクター
interface Character {
  id: number
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

// クリア状況
interface QuestClear {
  [questId: number]: boolean
}

// ゲーム全体の状態
interface GameState {
  // プレイヤー情報
  playerName: string
  rank: number
  exp: number
  gold: number
  diamonds: number
  stamina: number
  maxStamina: number

  // パーティ
  party: number[]

  // 所持キャラ
  characters: Character[]

  // クエストクリア状況
  questClears: QuestClear

  // 設定
  settings: Settings

  // アクション: 通貨
  addGold: (amount: number) => void
  spendGold: (amount: number) => boolean
  addDiamonds: (amount: number) => void
  spendDiamonds: (amount: number) => boolean

  // アクション: スタミナ
  useStamina: (amount: number) => boolean
  recoverStamina: (amount: number) => void

  // アクション: ランク・経験値
  addExp: (amount: number) => void

  // アクション: パーティ
  setParty: (party: number[]) => void

  // アクション: キャラ
  addCharacter: (char: Character) => void
  enhanceCharacter: (id: number) => void
  evolveCharacter: (id: number) => void
  removeCharacter: (id: number) => void

  // アクション: クエスト
  clearQuest: (questId: number) => void

  // アクション: 設定
  updateSettings: (settings: Partial<Settings>) => void

  // データリセット
  resetAll: () => void
}

const defaultCharacters: Character[] = [
  { id: 0, name: '甘利 悠真', sense: '味覚', rarity: 'SR', icon: '🧑', color: '#00ccff', level: 1, maxLevel: 50, hp: 800, attack: 65, evolved: false },
  { id: 1, name: '鶴見 杏', sense: '温度', rarity: 'SR', icon: '👩', color: '#ff88cc', level: 1, maxLevel: 50, hp: 700, attack: 55, evolved: false },
  { id: 2, name: '藤原 颯太', sense: '視覚', rarity: 'R', icon: '🧑‍🦱', color: '#88ff44', level: 1, maxLevel: 40, hp: 750, attack: 60, evolved: false },
]

const defaultSettings: Settings = {
  bgmVolume: 70,
  seVolume: 80,
  voiceVolume: 90,
  quality: 'high',
  notifications: true,
  autoPlay: false,
  language: 'ja',
}

const initialState = {
  playerName: '甘利 悠真',
  rank: 1,
  exp: 0,
  gold: 125000,
  diamonds: 1000,
  stamina: 100,
  maxStamina: 100,
  party: [0, 1, 2],
  characters: defaultCharacters,
  questClears: {} as QuestClear,
  settings: defaultSettings,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 通貨
      addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
      spendGold: (amount) => {
        if (get().gold < amount) return false
        set((s) => ({ gold: s.gold - amount }))
        return true
      },
      addDiamonds: (amount) => set((s) => ({ diamonds: s.diamonds + amount })),
      spendDiamonds: (amount) => {
        if (get().diamonds < amount) return false
        set((s) => ({ diamonds: s.diamonds - amount }))
        return true
      },

      // スタミナ
      useStamina: (amount) => {
        if (get().stamina < amount) return false
        set((s) => ({ stamina: s.stamina - amount }))
        return true
      },
      recoverStamina: (amount) => set((s) => ({
        stamina: Math.min(s.maxStamina, s.stamina + amount)
      })),

      // 経験値・ランク
      addExp: (amount) => set((s) => {
        let newExp = s.exp + amount
        let newRank = s.rank
        const expPerRank = 200

        while (newExp >= expPerRank * newRank) {
          newExp -= expPerRank * newRank
          newRank += 1
        }

        return { exp: newExp, rank: newRank, maxStamina: 100 + (newRank - 1) * 5 }
      }),

      // パーティ
      setParty: (party) => set({ party }),

      // キャラ
      addCharacter: (char) => set((s) => ({
        characters: [...s.characters, { ...char, id: Date.now() }]
      })),

      enhanceCharacter: (id) => set((s) => {
        const char = s.characters.find(c => c.id === id)
        if (!char || char.level >= char.maxLevel) return s

        const cost = char.level * 500
        if (s.gold < cost) return s

        return {
          gold: s.gold - cost,
          characters: s.characters.map(c =>
            c.id === id ? { ...c, level: c.level + 1, hp: c.hp + 15, attack: c.attack + 3 } : c
          ),
        }
      }),

      evolveCharacter: (id) => set((s) => {
        const char = s.characters.find(c => c.id === id)
        if (!char || char.evolved || char.level < 20) return s
        if (s.gold < 10000) return s

        return {
          gold: s.gold - 10000,
          characters: s.characters.map(c =>
            c.id === id ? {
              ...c,
              evolved: true,
              maxLevel: c.maxLevel + 20,
              hp: c.hp + 200,
              attack: c.attack + 30,
              rarity: (c.rarity === 'R' ? 'SR' : 'SSR') as 'R' | 'SR' | 'SSR',
            } : c
          ),
        }
      }),

      removeCharacter: (id) => set((s) => {
        const char = s.characters.find(c => c.id === id)
        if (!char || s.party.includes(s.characters.indexOf(char))) return s

        const sellPrice = char.rarity === 'SSR' ? 5000 : char.rarity === 'SR' ? 2000 : 500
        return {
          gold: s.gold + sellPrice,
          characters: s.characters.filter(c => c.id !== id),
        }
      }),

      // クエスト
      clearQuest: (questId) => set((s) => ({
        questClears: { ...s.questClears, [questId]: true }
      })),

      // 設定
      updateSettings: (newSettings) => set((s) => ({
        settings: { ...s.settings, ...newSettings }
      })),

      // リセット
      resetAll: () => set({ ...initialState, characters: defaultCharacters.map(c => ({ ...c })) }),
    }),
    {
      name: 'sens-game-data',
    }
  )
)