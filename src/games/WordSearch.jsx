import { useMemo, useState } from 'react'
import { generateWordSearch } from './wordSearchGenerator.js'

export default function WordSearch({ questions, onFinish }) {
  const words = useMemo(() => questions.map((q) => ({ id: q.id, word: q.payload.word })), [questions])
  const { grid, size, placements } = useMemo(() => generateWordSearch(words), [words])

  const [start, setStart] = useState(null)
  const [foundIds, setFoundIds] = useState([])
  const [foundCells, setFoundCells] = useState(new Set())
  const [finished, setFinished] = useState(false)

  function normalizeDir(dr, dc) {
    return { dr: dr === 0 ? 0 : dr / Math.abs(dr), dc: dc === 0 ? 0 : dc / Math.abs(dc) }
  }

  function cellsBetween(r1, c1, r2, c2) {
    const rawDr = r2 - r1
    const rawDc = c2 - c1
    if (rawDr !== 0 && rawDc !== 0 && Math.abs(rawDr) !== Math.abs(rawDc)) return null
    const { dr, dc } = normalizeDir(rawDr, rawDc)
    const len = Math.max(Math.abs(rawDr), Math.abs(rawDc)) + 1
    const cells = []
    for (let i = 0; i < len; i++) cells.push([r1 + dr * i, c1 + dc * i])
    return cells
  }

  function handleCellClick(r, c) {
    if (!start) {
      setStart([r, c])
      return
    }
    const [r1, c1] = start
    if (r1 === r && c1 === c) { setStart(null); return }

    const cells = cellsBetween(r1, c1, r, c)
    setStart(null)
    if (!cells) return

    const letters = cells.map(([rr, cc]) => grid[rr][cc]).join('')
    const reversed = letters.split('').reverse().join('')

    const match = placements.find(
      (p) => !foundIds.includes(p.id) && (p.letters === letters || p.letters === reversed)
    )
    if (match) {
      const newFound = new Set(foundCells)
      cells.forEach(([rr, cc]) => newFound.add(`${rr},${cc}`))
      setFoundCells(newFound)
      const newFoundIds = [...foundIds, match.id]
      setFoundIds(newFoundIds)
      if (newFoundIds.length === placements.length) {
        setFinished(true)
        onFinish({ correct: newFoundIds.length, total: placements.length })
      }
    }
  }

  function giveUp() {
    setFinished(true)
    onFinish({ correct: foundIds.length, total: placements.length })
  }

  return (
    <div className="sheet">
      <p className="desc">Tap the first letter of a word, then tap the last letter, to find it in the grid.</p>
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <div style={{ display: 'inline-block' }}>
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((letter, c) => {
                const key = `${r},${c}`
                const isFound = foundCells.has(key)
                const isSelected = start && start[0] === r && start[1] === c
                return (
                  <button
                    key={c}
                    className={`grid-cell ${isFound ? 'found' : ''} ${isSelected ? 'selected' : ''}`}
                    style={{ cursor: finished ? 'default' : 'pointer' }}
                    onClick={() => !finished && handleCellClick(r, c)}
                    disabled={finished}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="badge-row">
        {placements.map((p) => (
          <span
            key={p.id}
            style={{
              fontSize: '0.85rem',
              padding: '4px 10px',
              border: '1.5px solid #233E87',
              color: foundIds.includes(p.id) ? '#fff' : '#233E87',
              background: foundIds.includes(p.id) ? '#233E87' : 'transparent',
              textDecoration: foundIds.includes(p.id) ? 'line-through' : 'none'
            }}
          >
            {p.word}
          </span>
        ))}
      </div>

      {!finished && (
        <button className="btn outline" style={{ marginTop: 16 }} onClick={giveUp}>
          Finish ({foundIds.length}/{placements.length} found)
        </button>
      )}
      {finished && <p className="success-text" style={{ marginTop: 16 }}>Found {foundIds.length} of {placements.length} words.</p>}
    </div>
  )
}
