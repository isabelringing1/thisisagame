import { useEffect, useRef } from 'react'
import './Platformer.css'

const CANVAS_W = 500
const CANVAS_H = 800
const LEVEL_W = 500
const GRAVITY = 0.5
const JUMP_FORCE = -10
const MOVE_SPEED = 4
const PLAYER_W = 30
const PLAYER_H = 40
const FLOOR_Y = CANVAS_H - 40

const BOXES = [
  { x: CANVAS_W/2 - 40, y: FLOOR_Y - 30, w: 80, h: 30 },
  { x: CANVAS_W/2 + 90, y: FLOOR_Y - 120, w: 80, h: 20 },
  { x: CANVAS_W/2 - 100, y: FLOOR_Y - 200, w: 80, h: 20, xVel: 2, distance: 30 },
]

export default function Platformer() {
  const canvasRef = useRef(null)
  const keysRef = useRef({})
  const cameraRef = useRef(0)
  const playerRef = useRef({
    x: 100,
    y: FLOOR_Y - PLAYER_H,
    vx: 0,
    vy: 0,
    onGround: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const onKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      keysRef.current[e.key] = true
    }
    const onKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
    }

    function update() {
      const keys = keysRef.current
      const p = playerRef.current

      // horizontal movement
      let dx = 0
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= MOVE_SPEED
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += MOVE_SPEED
      p.x += dx

      // horizontal collision with boxes
      for (const box of BOXES) {
        if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, box.x, box.y, box.w, box.h)) {
          if (dx > 0) p.x = box.x - PLAYER_W
          if (dx < 0) p.x = box.x + box.w
        }
      }

      // clamp to level bounds
      if (p.x < 0) p.x = 0
      if (p.x + PLAYER_W > LEVEL_W) p.x = LEVEL_W - PLAYER_W

      // gravity
      p.vy += GRAVITY
      p.y += p.vy

      // assume not on ground until proven otherwise
      p.onGround = false

      // vertical collision with boxes
      for (const box of BOXES) {
        if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, box.x, box.y, box.w, box.h)) {
          if (p.vy > 0) {
            p.y = box.y - PLAYER_H
            p.vy = 0
            p.onGround = true
          } else if (p.vy < 0) {
            p.y = box.y + box.h
            p.vy = 0
          }
        }
      }

      // floor collision
      if (p.y + PLAYER_H >= FLOOR_Y) {
        p.y = FLOOR_Y - PLAYER_H
        p.vy = 0
        p.onGround = true
      }

      // jump (after ground detection so onGround is accurate)
      const jumpPressed = keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']
      if (jumpPressed && p.onGround && !p.jumpHeld) {
        p.vy = JUMP_FORCE
        p.onGround = false
        p.jumpHeld = true
      }
      if (!jumpPressed) p.jumpHeld = false

      // camera follows player, centered horizontally
      let targetCam = p.x + PLAYER_W / 2 - CANVAS_W / 2
      if (targetCam < 0) targetCam = 0
      if (targetCam > LEVEL_W - CANVAS_W) targetCam = LEVEL_W - CANVAS_W
      cameraRef.current = targetCam
    }

    function draw() {
      const cam = cameraRef.current
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      ctx.save()
      ctx.translate(-cam, 0)

      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2

	  //outline canvas
	  ctx.strokeStyle = '#000'
	  ctx.lineWidth = 2
	  ctx.strokeRect(0, 0, CANVAS_W, CANVAS_H)

      // floor
      ctx.beginPath()
      ctx.moveTo(0, FLOOR_Y)
      ctx.lineTo(LEVEL_W, FLOOR_Y)
      ctx.stroke()

      // boxes
      for (const box of BOXES) {
		ctx.strokeStyle = '#000'
		ctx.fillStyle = '#00000080'
		ctx.strokeRect(box.x, box.y, box.w, box.h)
      }

	  // finish line text 

	  ctx.font = '30px Monospace'
	  ctx.fillStyle = '#000'
	  ctx.fillText('This is a  ame', LEVEL_W / 2 - 120, 70)

      // player
      const p = playerRef.current
      //ctx.strokeRect(p.x, p.y, PLAYER_W, PLAYER_H)

		ctx.font = '30px Monospace'
		ctx.fillStyle = '#000'
		ctx.fillText('g', p.x + PLAYER_W / 2 - 10, p.y + PLAYER_H / 2 + 12)

      ctx.restore()
    }

    function loop() {
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <div className="platformer-page game-page">
      <canvas
	  className="platformer-canvas"
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
      />
    </div>
  )
}
