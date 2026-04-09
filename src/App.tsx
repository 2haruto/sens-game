import { useState } from 'react'
import TitleScreen from './game/scenes/TitleScreen'
import MenuScreen from './game/scenes/MenuScreen'
import StoryScreen from './game/scenes/StoryScreen'
import BattleScreen from './game/scenes/BattleScreen'
import './App.css'

type Screen = 'title' | 'menu' | 'battle' | 'gacha' | 'story' | 'team'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('title')

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {currentScreen === 'title' && (
        <TitleScreen onStart={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'menu' && (
        <MenuScreen onNavigate={(screen) => setCurrentScreen(screen as Screen)} />
      )}
      {currentScreen === 'story' && (
        <StoryScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'battle' && (
        <BattleScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'gacha' && (
        <div style={{ color: 'white', fontSize: '24px', textAlign: 'center', paddingTop: '200px' }}>
          🎲 ガチャ画面（次回作成）
          <div
            style={{ marginTop: '40px', fontSize: '16px', color: '#888', cursor: 'pointer' }}
            onClick={() => setCurrentScreen('menu')}
          >
            ← メニューに戻る
          </div>
        </div>
      )}
      {currentScreen === 'team' && (
        <div style={{ color: 'white', fontSize: '24px', textAlign: 'center', paddingTop: '200px' }}>
          👥 編成画面（次回作成）
          <div
            style={{ marginTop: '40px', fontSize: '16px', color: '#888', cursor: 'pointer' }}
            onClick={() => setCurrentScreen('menu')}
          >
            ← メニューに戻る
          </div>
        </div>
      )}
    </div>
  )
}

export default App