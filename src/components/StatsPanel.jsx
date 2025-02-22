import '../styles/StatsPanel.css'

function StatsPanel({ stats, onStop, isPaused }) {
  return (
    <div className="stats-panel">
      <h2>Island Statistics</h2>
      {isPaused && (
        <div className="paused-message">
          Game Paused - Only One Blob Remains
        </div>
      )}
      <div className="stat season">
        <label>Season:</label>
        <span>{stats.season}</span>
      </div>
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