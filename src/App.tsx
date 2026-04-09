import { useState } from 'react'
import TitleScreen from './game/scenes/TitleScreen'
import MenuScreen from './game/scenes/MenuScreen'
import StoryScreen from './game/scenes/StoryScreen'
import BattleScreen from './game/scenes/BattleScreen'
import GachaScreen from './game/scenes/GachaScreen'
import TeamScreen from './game/scenes/TeamScreen'
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
        <GachaScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'team' && (
        <TeamScreen onBack={() => setCurrentScreen('menu')} />
      )}
    </div>
  )
}

export default App