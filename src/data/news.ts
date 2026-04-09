export interface NewsItem {
  id: number
  type: 'event' | 'update' | 'gacha' | 'maintenance' | 'info'
  title: string
  date: string
}

// 後でサーバーから取得する形に切り替え可能
export const newsItems: NewsItem[] = [
  { id: 1, type: 'event', title: '新イベント「覚醒の試練」開催中！', date: '2026/04/09' },
  { id: 2, type: 'update', title: 'アップデート v1.1 配信開始！', date: '2026/04/08' },
  { id: 3, type: 'gacha', title: '新キャラ「鷹宮 零」参戦！', date: '2026/04/07' },
  { id: 4, type: 'maintenance', title: 'メンテナンス予定: 4/15 03:00〜05:00', date: '2026/04/06' },
  { id: 5, type: 'gacha', title: 'SSR確率2倍ガチャ開催中！', date: '2026/04/05' },
]

export const newsIcons: Record<string, string> = {
  event: '🔥',
  update: '🎉',
  gacha: '🎲',
  maintenance: '📢',
  info: 'ℹ️',
}