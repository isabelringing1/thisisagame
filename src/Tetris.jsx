import { useState, useEffect, useCallback, useRef } from 'react'
import './style/Tetris.css'

const ROWS = 20
const COLS = 10
const TICK_MS = 500
const FAST_TICK_MS = 80

// Tetrominoes: each shape is an array of rotations, each rotation is an array of [row, col] offsets
const SHAPES = {
  I: { color: '#b0b0b0', rotations: [[[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]], [[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]]] },
  O: { color: '#909090', rotations: [[[0,0],[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0],[1,1]]] },
  T: { color: '#a0a0a0', rotations: [[[0,0],[0,1],[0,2],[1,1]], [[0,0],[1,0],[2,0],[1,1]], [[1,0],[1,1],[1,2],[0,1]], [[0,0],[1,0],[2,0],[1,-1]]] },
  S: { color: '#808080', rotations: [[[0,1],[0,2],[1,0],[1,1]], [[0,0],[1,0],[1,1],[2,1]], [[0,1],[0,2],[1,0],[1,1]], [[0,0],[1,0],[1,1],[2,1]]] },
  Z: { color: '#c0c0c0', rotations: [[[0,0],[0,1],[1,1],[1,2]], [[0,1],[1,0],[1,1],[2,0]], [[0,0],[0,1],[1,1],[1,2]], [[0,1],[1,0],[1,1],[2,0]]] },
  J: { color: '#707070', rotations: [[[0,0],[1,0],[1,1],[1,2]], [[0,0],[0,1],[1,0],[2,0]], [[0,0],[0,1],[0,2],[1,2]], [[0,0],[1,0],[2,0],[2,-1]]] },
  L: { color: '#d0d0d0', rotations: [[[0,2],[1,0],[1,1],[1,2]], [[0,0],[1,0],[2,0],[2,1]], [[0,0],[0,1],[0,2],[1,0]], [[0,0],[0,1],[1,1],[2,1]]] },
}

const SHAPE_KEYS = Object.keys(SHAPES)

// Map ASCII characters to colors for initial board parsing
const ASCII_COLORS = {
  '#': '#999',
  'X': '#888',
  'O': '#aaa',
  '@': '#777',
  '*': '#bbb',
}

// default board
const DEFAULT_BOARD = `
  #########
  #       #
  #       #
  `

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function parseAsciiBoard(ascii) {
  const grid = createEmptyGrid()
  if (!ascii) return grid
  const lines = ascii.split('\n').filter(l => l.length > 0)
  const startRow = ROWS - lines.length
  for (let i = 0; i < lines.length; i++) {
    const row = startRow + i
    if (row < 0 || row >= ROWS) continue
    for (let col = 0; col < Math.min(lines[i].length, COLS); col++) {
      const ch = lines[i][col]
      if (ch !== ' ' && ch !== '.') {
        grid[row][col] = ASCII_COLORS[ch] || '#999'
      }
    }
  }
  return grid
}

function randomShape() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]
  return { key, ...SHAPES[key], rotation: 0, row: 0, col: Math.floor(COLS / 2) - 1 }
}

function getCells(piece) {
  return SHAPES[piece.key].rotations[piece.rotation].map(([r, c]) => [piece.row + r, piece.col + c])
}

function isValid(piece, grid) {
  return getCells(piece).every(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c])
}

function getGhost(piece, grid) {
  let ghost = { ...piece }
  while (isValid({ ...ghost, row: ghost.row + 1 }, grid)) ghost.row++
  return ghost
}

function lockPiece(piece, grid) {
  const newGrid = grid.map(row => [...row])
  getCells(piece).forEach(([r, c]) => { newGrid[r][c] = piece.color })
  return newGrid
}

function clearLines(grid) {
  const kept = grid.filter(row => row.some(cell => !cell))
  const cleared = ROWS - kept.length
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null))
  return { grid: [...empty, ...kept], cleared }
}

export default function Tetris({ initialBoard = DEFAULT_BOARD }) {
  const [grid, setGrid] = useState(() => parseAsciiBoard(initialBoard))
  const [piece, setPiece] = useState(() => randomShape())
  const [gameOver, setGameOver] = useState(false)
  const [softDrop, setSoftDrop] = useState(false)
  const tickRef = useRef(null)

  const drop = useCallback(() => {
    if (gameOver) return
    setPiece(prev => {
      const moved = { ...prev, row: prev.row + 1 }
      if (isValid(moved, grid)) return moved
      const locked = lockPiece(prev, grid)
      const { grid: cleared } = clearLines(locked)
      setGrid(cleared)
      const next = randomShape()
      if (!isValid(next, cleared)) {
        setGameOver(true)
        return prev
      }
      return next
    })
  }, [grid, gameOver])

  // Gravity tick — faster when holding down
  useEffect(() => {
    tickRef.current = setInterval(drop, softDrop ? FAST_TICK_MS : TICK_MS)
    return () => clearInterval(tickRef.current)
  }, [drop, softDrop])

  // Keyboard
  useEffect(() => {
    const handleDown = (e) => {
      if (gameOver) return
      if (e.key === 'ArrowLeft') {
        setPiece(p => { const m = { ...p, col: p.col - 1 }; return isValid(m, grid) ? m : p })
      } else if (e.key === 'ArrowRight') {
        setPiece(p => { const m = { ...p, col: p.col + 1 }; return isValid(m, grid) ? m : p })
      } else if (e.key === 'ArrowDown') {
        setSoftDrop(true)
      } else if (e.key === 'ArrowUp') {
        setPiece(p => {
          const m = { ...p, rotation: (p.rotation + 1) % 4 }
          return isValid(m, grid) ? m : p
        })
      } else if (e.key === 'a' || e.key === 'A') {
        setPiece(p => {
          const m = { ...p, rotation: (p.rotation + 3) % 4 }
          return isValid(m, grid) ? m : p
        })
      } else if (e.key === ' ') {
        setPiece(p => {
          let m = { ...p }
          while (isValid({ ...m, row: m.row + 1 }, grid)) m.row++
          const locked = lockPiece(m, grid)
          const { grid: cleared } = clearLines(locked)
          setGrid(cleared)
          const next = randomShape()
          if (!isValid(next, cleared)) {
            setGameOver(true)
            return m
          }
          return next
        })
      }
    }
    const handleUp = (e) => {
      if (e.key === 'ArrowDown') setSoftDrop(false)
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [grid, gameOver, drop])

  // Build display grid: board + ghost + active piece
  const display = grid.map(row => [...row])
  const ghostDisplay = grid.map(() => Array(COLS).fill(false))
  if (!gameOver) {
    const ghost = getGhost(piece, grid)
    getCells(ghost).forEach(([r, c]) => {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) ghostDisplay[r][c] = piece.color
    })
    getCells(piece).forEach(([r, c]) => {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        display[r][c] = piece.color
        ghostDisplay[r][c] = false
      }
    })
  }

  const restart = () => {
    setGrid(parseAsciiBoard(initialBoard))
    setPiece(randomShape())
    setGameOver(false)
    setSoftDrop(false)
  }

  return (
    <div className="tetris-container">
      <div
        className="tetris-board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 28px)`,
          gridTemplateRows: `repeat(${ROWS}, 28px)`,
        }}
      >
        {display.map((row, r) => row.map((cell, c) => {
          const ghost = ghostDisplay[r][c]
          const className = `tetris-cell ${cell ? 'tetris-cell--filled' : ghost ? 'tetris-cell--ghost' : 'tetris-cell--empty'}`
          return (
            <div
              key={r * COLS + c}
              className={className}
              style={{
                ...(cell ? { background: cell } : {}),
                ...(ghost ? { borderColor: ghost } : {}),
              }}
            />
          )
        }))}
      </div>
      {gameOver && (
        <div className="tetris-game-over">
          <div className="tetris-game-over__title">Game Over</div>
          <button onClick={restart} className="tetris-game-over__button">
            Restart
          </button>
        </div>
      )}
      <div className="tetris-controls">
        Arrow keys to move/rotate &middot; A to reverse rotate &middot; Space to hard drop
      </div>
    </div>
  )
}
