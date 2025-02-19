import '../styles/StatsPanel.css'

function StatsPanel({ stats, onStop }) {
  return (
    <div className="stats-panel">
      <h2>Island Statistics</h2>
      <div className="stat">
        <label>Blobs:</label>
        <span>{stats.blobCount}</span>
      </div>
      <div className="stat">
        <label>Food:</label>
        <span>{stats.foodCount}</span>
      </div>
      <div className="stat">
        <label>Cycles:</label>
        <span>{stats.cycleCount}</span>
      </div>
      <button className="stop-button" onClick={onStop}>Stop</button>
    </div>
  )
}

export default StatsPanel 