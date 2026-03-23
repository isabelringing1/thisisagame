import './style/Debug.css'

export default function Debug({ currentStage, onSelectStage, onWin, onLose, stages }) {
  return (
    <div className="debug-panel">
      <label className="debug-label">Stage</label>
      <select
        className="debug-select"
        value={currentStage}
        onChange={(e) => onSelectStage(e.target.value)}
      >
        {stages.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <button className="win-btn" onClick={onWin}>Win</button>
      <button className="lose-btn" onClick={onLose}>Lose</button>
    </div>
  )
}
