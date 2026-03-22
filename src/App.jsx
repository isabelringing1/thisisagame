import { useState } from 'react'

import './App.css'
import Start from './Start'
import Platformer from './Platformer'

const ORDER = [
  'start',
  'platformer',
]

export default function App() {
  const [stageIndex, setStageIndex] = useState(0)

  var stage = ORDER[stageIndex]

  const onNextStage = () => {
    setStageIndex(stageIndex + 1)
  }

  return (
    <div className="content">
      {stage === 'start' && <Start onNextStage={onNextStage} />}
      {stage === 'platformer' && <Platformer />}
    </div>
  )
}