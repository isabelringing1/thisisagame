import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const SlotMachine = forwardRef(function SlotMachine({ text = 'word', onSpinEnd }, ref) {
  const [spinning, setSpinning] = useState(false)
  const [offset, setOffset] = useState(0)
  const animRef = useRef(null)
  const speedRef = useRef(0)
  const offsetRef = useRef(0)
  const itemHeight = 120

  const elements = [
    { type: 'image', src: '/cherry.png' },
    { type: 'image', src: '/seven.png' },
    { type: 'text', value: text },
  ]

  const cycleHeight = elements.length * itemHeight

  useImperativeHandle(ref, () => ({
    spin() {
      if (spinning) return
      setSpinning(true)
      speedRef.current = 15 + Math.random() * 5
      offsetRef.current = offset

      const animate = () => {
        speedRef.current *= 0.985
        offsetRef.current += speedRef.current

        if (speedRef.current < 0.3) {
          const snapped = Math.round(offsetRef.current / itemHeight) * itemHeight
          setOffset(snapped % cycleHeight)
          setSpinning(false)
          onSpinEnd?.()
          return
        }

        setOffset(offsetRef.current % cycleHeight)
        animRef.current = requestAnimationFrame(animate)
      }

      animRef.current = requestAnimationFrame(animate)
    },
    isSpinning: spinning,
  }))

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const renderElements = () => {
    const copies = 4
    const allItems = []
    for (let c = 0; c < copies; c++) {
      elements.forEach((el, i) => {
        const key = `${c}-${i}`
        allItems.push(
          <div key={key} className="slot-item" style={{ height: itemHeight }}>
            {el.type === 'image' ? (
              <img src={el.src} alt="" className="slot-img" />
            ) : (
              <span className="slot-text">{el.value}</span>
            )}
          </div>
        )
      })
    }
    return allItems
  }

  return (
    <div className="slot-outer">
      <div className="slot-inner">
        <div
          className="slot-strip"
          style={{ transform: `translateY(${-offset}px)` }}
        >
          {renderElements()}
        </div>
      </div>
    </div>
  )
})

export default SlotMachine
