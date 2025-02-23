import '../styles/StatsPanel.css'

function StatsPanel({ stats, onStop, isPaused }) {
  const villages = [
    { name: 'Rose Village', color: 'rgb(255, 0, 128)' },
    { name: 'Blue Village', color: 'rgb(0, 0, 139)' },
    { name: 'Purple Village', color: 'rgb(128, 0, 128)' },
    { name: 'Red Village', color: 'rgb(139, 0, 0)' }
  ];

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

      <div className="village-stats">
        <h3>Village Populations</h3>
        {villages.map((village, index) => (
          <div key={index} className="village-stat">
            <div className="village-color" style={{ backgroundColor: village.color }}></div>
            <span>{village.name}:</span>
            <span>{stats.villageCounts?.[index] || 0}</span>
          </div>
        ))}
      </div>

      <button className="stop-button" onClick={onStop}>Stop</button>

      <div className="rules-summary">
        <h3>Key Rules</h3>
        <ul>
          <li>Blobs die after 100 cycles without food</li>
          <li>Young blobs (under 25 cycles) must eat any food they find</li>
          <li>Adult blobs can carry food back to their village</li>
          <li>Blobs can reproduce at age 25+ if both have eaten recently</li>
          <li>Seasons change every 25 cycles, affecting food spawn:</li>
          <ul>
            <li>Spring: 4 food</li>
            <li>Summer: 3 food</li>
            <li>Autumn: 2 food</li>
            <li>Winter: 1 food</li>
          </ul>
        </ul>
      </div>
    </div>
  )
}

export default StatsPanel 