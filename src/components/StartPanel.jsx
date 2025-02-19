import { useState } from 'react'
import '../styles/StartPanel.css'

function StartPanel({ onStart }) {
  const [initialBlobs, setInitialBlobs] = useState(100)
  const [initialFood, setInitialFood] = useState(100)

  const handleStart = () => {
    onStart(initialBlobs, initialFood)
  }

  return (
    <div className="start-panel">
      <h1>Blob Island</h1>
      <p className="author">A game created by Ben McLeod and Alan McLeod</p>
      <div className="input-group">
        <label htmlFor="initialBlobs">Initial Blobs:</label>
        <input
          id="initialBlobs"
          type="number"
          min="1"
          max="1000"
          value={initialBlobs}
          onChange={(e) => setInitialBlobs(Number(e.target.value))}
        />
      </div>
      <div className="input-group">
        <label htmlFor="initialFood">Initial Food:</label>
        <input
          id="initialFood"
          type="number"
          min="1"
          max="1000"
          value={initialFood}
          onChange={(e) => setInitialFood(Number(e.target.value))}
        />
      </div>
      <button onClick={handleStart}>Start</button>
    </div>
  )
}

export default StartPanel 