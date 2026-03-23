import { useState, useEffect } from 'react'

import './style/App.css'
import Debug from './Debug'

import Start from './Start'
import Platformer from './Platformer'
import SlotMachines from './SlotMachines'
import Tetris from './Tetris'

const ORDER = [
  'start',
  'platformer',
  'slot-machines',
  'tetris'
]
var isLocalHost =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

export default function App() {
  const [stageIndex, setStageIndex] = useState(0)
  const [showDebug, setShowDebug] = useState(isLocalHost)
  const [stageState, setStageState] = useState("play") // play, win, lose

  var stage = ORDER[stageIndex]

  const onNextStage = () => {
    setStageIndex(stageIndex + 1)
    setStageState("play")
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' && isLocalHost) {
        setShowDebug((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectStage = (id) => {
    const index = ORDER.indexOf(id)
    if (index !== -1) {
      setStageIndex(index)
    }
  }

  const onStageWin = () => {
    setStageState("win")
  }

  const onStageLose = () => {
    setStageState("lose")
  }

  const onRetryStage = () => {
    setStageState("play")
  }

  const getStageById = (id) => {
    switch (id) {
      case 'start':
        return <Start onNextStage={onNextStage} />
      case 'platformer':
        return <Platformer onStageWin={onStageWin} onStageLose={onStageLose} stageState={stageState} />
      case 'slot-machines':
        return <SlotMachines onStageWin={onStageWin} onStageLose={onStageLose} stageState={stageState} />
      case 'tetris':
        return <Tetris onStageWin={onStageWin} onStageLose={onStageLose} stageState={stageState} />
    }
  }

  function getTitle(){
    if (stage == "platformer" && stageState != "win"){
      return <pre>This is a  ame</pre>
    }
    return "This is a game";
  }

  return (
    <div className="content">
      <div className="title">{getTitle()}</div>
      <div className={"stage-container stage-container-" + stage}>
        {getStageById(stage)}
      </div>
      {showDebug && (
        <Debug currentStage={stage} onSelectStage={handleSelectStage} onWin={onStageWin} onLose={onStageLose} stages={ORDER} />
      )}
      <div className="footer">
        { stageState == "win" && <button className="next-btn" onClick={onNextStage}>Next</button>}
        { stageState == "lose" && <button className="retry-btn" onClick={onRetryStage}>Retry</button>}
      </div>
    </div>
  )
}
