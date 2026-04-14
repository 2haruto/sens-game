import { useState } from 'react'
import TitleScreen from './game/scenes/TitleScreen'
import MenuScreen from './game/scenes/MenuScreen'
import StoryScreen from './game/scenes/StoryScreen'
import BattleScreen from './game/scenes/BattleScreen'
import GachaScreen from './game/scenes/GachaScreen'
import TeamScreen from './game/scenes/TeamScreen'
import QuestScreen from './game/scenes/QuestScreen'
import ShopScreen from './game/scenes/ShopScreen'
import OptionScreen from './game/scenes/OptionScreen'
import type { QuestData } from './game/scenes/QuestScreen'
import './App.css'

type Screen = 'title' | 'menu' | 'battle' | 'gacha' | 'story' | 'team' | 'quest' | 'shop' | 'option'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('title')
  const [currentQuest, setCurrentQuest] = useState<QuestData | null>(null)

  const handleStartBattle = (quest: QuestData) => {
    setCurrentQuest(quest)
    if (quest.type === 'story') {
      setCurrentScreen('story')
    } else {
      setCurrentScreen('battle')
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {currentScreen === 'title' && (
        <TitleScreen onStart={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'menu' && (
        <MenuScreen onNavigate={(screen) => {
          if (screen === 'story' || screen === 'battle') setCurrentScreen('quest')
          else setCurrentScreen(screen as Screen)
        }} />
      )}
      {currentScreen === 'quest' && (
        <QuestScreen onBack={() => setCurrentScreen('menu')} onStartBattle={handleStartBattle} />
      )}
      {currentScreen === 'story' && (
        <StoryScreen onBack={() => {
          if (currentQuest) setCurrentScreen('battle')
          else setCurrentScreen('menu')
        }} />
      )}
      {currentScreen === 'battle' && (
        <BattleScreen
          onBack={() => setCurrentScreen('quest')}
          questName={currentQuest?.name}
          questId={currentQuest?.id}
          enemyLevel={currentQuest?.enemyLevel}
          rewards={currentQuest?.rewards}
        />
      )}
      {currentScreen === 'gacha' && (
        <GachaScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'team' && (
        <TeamScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'shop' && (
        <ShopScreen onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'option' && (
        <OptionScreen onBack={() => setCurrentScreen('menu')} />
      )}
    </div>
  )
}

export default App