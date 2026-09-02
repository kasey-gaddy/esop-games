import { useMemo, useRef, useState } from 'react'
import { generateCrossword } from './crosswordGenerator.js'

export default function Crossword({ questions, onFinish }) {
  const entries = useMemo(
    () => questions.map((q) => ({ id: q.id, clue: q.payload.clue, answer: q.payload.answer })),
    [questions]
  )
  const { grid, rows, cols, placements } = useMemo(() => generateCrossword(entries), [entries])

  const [userGrid, setUserGrid] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  )
  const [checked, setChecked] = useState(false)
  const inputRefs = useRef({})

  const across = placements.filter((p) => p.dir === 'across').sort((a, b) => a.number - b.number)
  const down = placements.filter((p) => p.dir === 'down').sort((a, b) => a.number - b.number)

  function setCell(r, c, val) {
    setUserGrid((prev) => {
      const next = prev.map((row) => row.slice())
      next[r][c] = val.slice(-1).toUpperCase()
      return next
    })
  }

  function focusCell(r, c) {
    const el = inputRefs.current[`${r},${c}`]
    if (el) el.focus()
  }

  function handleKeyDown(e, r, c) {
    if (e.key === 'ArrowRight') focusCell(r, c + 1)
    if (e.key === 'ArrowLeft') focusCell(r, c - 1)
    if (e.key === 'ArrowDown') focusCell(r + 1, c)
    if (e.key === 'ArrowUp') focusCell(r - 1, c)
    if (e.key === 'Backspace' && !userGrid[r][c]) focusCell(r, c - 1)
  }

  function handleSubmit() {
    setChecked(true)
    let correct = 0
    placements.forEach((p) => {
      let match = true
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.dir === 'down' ? p.row + i : p.row
        const c = p.dir === 'across' ? p.col + i : p.col
        if (userGrid[r][c] !== p.answer[i]) match = false
      }
      if (match) correct++
    })
    onFinish({ correct, total: placements.length })
  }

  const numberAt = {}
  placements.forEach((p) => {
    if (p.number != null) numberAt[`${p.row},${p.col}`] = p.number
  })

  return (
    <div className="sheet">
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <div style={{ display: 'inline-block' }}>
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((cell, c) => {
                if (cell === null) return <div key={c} className="grid-cell block" />
                const num = numberAt[`${r},${c}`]
                const isCorrect = checked && userGrid[r][c] === cell
                const isWrong = checked && userGrid[r][c] !== cell
                return (
                  <div key={c} style={{ position: 'relative' }}>
                    {num && (
                      <span style={{ position: 'absolute', top: 1, left: 2, fontSize: 9, color: '#233E87', fontWeight: 700 }}>
                        {num}
                      </span>
                    )}
                    <input
                      ref={(el) => (inputRefs.current[`${r},${c}`] = el)}
                      className="grid-cell"
                      style={{
                        padding: 0,
                        textAlign: 'center',
                        background: isCorrect ? '#C9A227' : isWrong ? '#f6dede' : 'white'
                      }}
                      maxLength={1}
                      value={userGrid[r][c]}
                      disabled={checked}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Across</h3>
          {across.map((p) => (
            <p key={p.id} style={{ fontSize: '0.9rem', margin: '6px 0' }}>
              <strong>{p.number}.</strong> {p.clue}
            </p>
          ))}
        </div>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Down</h3>
          {down.map((p) => (
            <p key={p.id} style={{ fontSize: '0.9rem', margin: '6px 0' }}>
              <strong>{p.number}.</strong> {p.clue}
            </p>
          ))}
        </div>
      </div>

      {!checked && (
        <button className="btn" style={{ marginTop: 16 }} onClick={handleSubmit}>
          Check my answers
        </button>
      )}
      {checked && <p className="success-text" style={{ marginTop: 16 }}>Answers submitted — nice work!</p>}
    </div>
  )
}
