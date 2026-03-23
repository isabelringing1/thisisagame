export default function Start(props) {
const { onNextStage } = props

  return (
    <div className="starting-page">
      <button className="start-btn" onClick={onNextStage}>Start</button>
    </div>
  )
}