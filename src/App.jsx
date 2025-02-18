import { useState, useEffect } from 'react'
import './App.css'
import GameBoard from './components/GameBoard'
import StatsPanel from './components/StatsPanel'

function App() {
  const [gameStats, setGameStats] = useState({
    blobCount: 100,
    foodCount: 100,
    cycleCount: 0
  })

  return (
    <div className="game-container">
      <GameBoard onStatsChange={setGameStats} />
      <StatsPanel stats={gameStats} />
    </div>
  )
}

export default App
