import { useRef, useState, useCallback } from 'react'
import SlotMachine from './SlotMachine'
import './style/SlotMachines.css'

export default function SlotMachines() {
  const slotRefs = [useRef(), useRef(), useRef(), useRef()]
  const [spinning, setSpinning] = useState(false)
  const stoppedCount = useRef(0)
  const words = ['This', 'is', 'a', 'game']

  const handleSpinEnd = useCallback(() => {
    stoppedCount.current += 1
    if (stoppedCount.current >= slotRefs.length) {
      setSpinning(false)
    }
  }, [])

  const handleSpin = () => {
    stoppedCount.current = 0
    slotRefs.forEach((ref) => ref.current?.spin())
    setSpinning(true)
  }

  return (
    <div className="slot-machines-container">
      <div className="slot-row">
        {slotRefs.map((ref, i) => (
          <SlotMachine key={i} ref={ref} onSpinEnd={handleSpinEnd} text={words[i]} />
        ))}
      </div>
      <button className="spin-btn" onClick={handleSpin} disabled={spinning}>
        Spin
      </button>
    </div>
  )
}
