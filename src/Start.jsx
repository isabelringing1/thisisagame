export default function Start(props) {
const { onNextStage } = props

  return (
    <div className="starting-page">
      <div className="title">This is a game</div>
      <button className="start-btn" onClick={onNextStage}>Start</button>
    </div>
  )
}