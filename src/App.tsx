import { useState } from 'react'
import TitleScreen from './game/scenes/TitleScreen.tsx'
import './App.css'

type Screen = 'title' | 'menu' | 'battle' | 'gacha' | 'story'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('title')

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {currentScreen === 'title' && (
        <TitleScreen onStart={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'menu' && (
        <div style={{ color: 'white', fontSize: '24px', textAlign: 'center', paddingTop: '200px' }}>
          メニュー画面（次回作成）
        </div>
      )}
    </div>
  )
}

export default App