import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { chapters } from '@/data/chapters'
import { StartPage } from '@/pages/StartPage'
import { GamePage } from '@/pages/GamePage'

function App() {
  const setChapters = useGameStore((state) => state.setChapters)

  useEffect(() => {
    setChapters(chapters)
  }, [setChapters])

  return (
    <div className="min-h-screen">
      <StartPage />
      <GamePage />
    </div>
  )
}

export default App
