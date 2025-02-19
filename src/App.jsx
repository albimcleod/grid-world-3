import { useState, useEffect } from 'react'
import './App.css'
import GameBoard from './components/GameBoard'
import StatsPanel from './components/StatsPanel'
import StartPanel from './components/StartPanel'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [initialBlobCount, setInitialBlobCount] = useState(100)
  const [initialFoodCount, setInitialFoodCount] = useState(100)
  const [gameStats, setGameStats] = useState({
    blobCount: initialBlobCount,
    foodCount: initialFoodCount,
    cycleCount: 0
  })

  const handleStartGame = (blobCount, foodCount) => {
    setInitialBlobCount(blobCount)
    setInitialFoodCount(foodCount)
    setGameStarted(true)
    setGameStats(prev => ({
      ...prev,
      blobCount: blobCount,
      foodCount: foodCount
    }))
  }

  const handleStopGame = () => {
    setGameStarted(false)
    // Reset stats for next game
    setGameStats({
      blobCount: initialBlobCount,
      foodCount: initialFoodCount,
      cycleCount: 0
    })
  }

  return (
    <div className="app-container">
      {!gameStarted ? (
        <StartPanel onStart={handleStartGame} />
      ) : (
        <div className="game-container">
          <GameBoard 
            onStatsChange={setGameStats}
            initialBlobCount={initialBlobCount}
            initialFoodCount={initialFoodCount}
          />
          <StatsPanel stats={gameStats} onStop={handleStopGame} />
        </div>
      )}
    </div>
  )
}

export default App
