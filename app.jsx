// Find Your Ownership — KE&G ESOP Games
// Single-file React app (no build step). Loaded and Babel-transformed by index.html.
// Data lives in Netlify Blobs via the /.netlify/functions/storage function (window.storage shim).

const { useState, useEffect, useMemo, useRef } = React;

// ─── Session helpers ──────────────────────────────────────────────────────

function getEmployee() {
  try { return JSON.parse(sessionStorage.getItem('esop_employee') || 'null') } catch { return null }
}
function saveEmployee(e) { sessionStorage.setItem('esop_employee', JSON.stringify(e)) }
function clearEmployee() { sessionStorage.removeItem('esop_employee') }

function getAdminPw() { return sessionStorage.getItem('esop_admin_pw') || '' }
function saveAdminPw(pw) {
  sessionStorage.setItem('esop_admin_pw', pw)
  window.__ADMIN_PW__ = pw
}
function clearAdminPw() {
  sessionStorage.removeItem('esop_admin_pw')
  window.__ADMIN_PW__ = ''
}
// Restore admin password into the storage shim on page load/refresh.
window.__ADMIN_PW__ = getAdminPw()

// ─── Seed content (from the original ESOP games document) ─────────────────

const SEED_GAMES = [
  { id: 'word-search', sheet_label: 'GAME 1', title: 'Find Your Ownership', description: 'ESOP word search — the Week 1 introduction.', type: 'word_search', sort_order: 1, is_unlocked: false },
  { id: 'crossword', sheet_label: 'GAME 2', title: 'Know Your ESOP', description: 'A 12-clue crossword covering ESOP basics.', type: 'crossword', sort_order: 2, is_unlocked: false },
  { id: 'myth-or-fact', sheet_label: 'GAME 3', title: 'Own the Facts', description: 'Myth or fact — 10 statements about employee ownership.', type: 'myth_fact', sort_order: 3, is_unlocked: false },
  { id: 'trivia', sheet_label: 'GAME 4', title: 'Are You Smarter Than an Employee Owner?', description: 'The grand finale — 15 trivia questions across 3 rounds.', type: 'trivia', sort_order: 4, is_unlocked: false }
]

const SEED_QUESTIONS = {
  'word-search': [
    'ESOP', 'OWNERSHIP', 'EMPLOYEE OWNER', 'SHARES', 'SHARE VALUE', 'VESTING',
    'RETIREMENT', 'BENEFIT', 'FUTURE', 'GROWTH', 'TEAMWORK', 'SAFETY', 'QUALITY', 'KEG', 'ONE HUNDRED PERCENT'
  ].map((word, i) => ({ id: `ws-${i + 1}`, order_index: i + 1, payload: { word } })),

  'crossword': [
    ['KE&G is 100% ______ owned.', 'EMPLOYEE'],
    ['The individual units of company ownership allocated to your ESOP account.', 'SHARES'],
    ['The process of earning your right to the value in your ESOP account over time.', 'VESTING'],
    ['The value assigned to one share of company stock.', 'SHAREVALUE'],
    ['An ESOP is designed to help employees build savings for this stage of life.', 'RETIREMENT'],
    ['Working safely helps protect our people, projects and company ______.', 'PERFORMANCE'],
    ['ESOP stands for Employee Stock Ownership ______.', 'PLAN'],
    ['The people who ultimately benefit when an employee-owned company succeeds.', 'EMPLOYEES'],
    ['The ESOP is one part of your total ______ package.', 'BENEFITS'],
    ['Good decisions about equipment, materials and time can help reduce ______.', 'COSTS'],
    ['Every employee owner can contribute to company success through the ______ of their work.', 'QUALITY'],
    ['Something every employee owner can help build through the ESOP.', 'FUTURE']
  ].map(([clue, answer], i) => ({ id: `cw-${i + 1}`, order_index: i + 1, payload: { clue, answer } })),

  'myth-or-fact': [
    ["Money is deducted from my paycheck to purchase the shares in my ESOP account.", 'MYTH', "ESOP shares are provided through the company's ESOP. Employees don't purchase those shares through payroll deductions."],
    ['KE&G is 100% employee-owned.', 'FACT', ''],
    ['Being 100% employee-owned means every employee owns exactly the same number of shares.', 'MYTH', 'The number of shares allocated to individual ESOP accounts can vary.'],
    ['The value of a KE&G share is guaranteed to increase every year.', 'MYTH', 'Share value can increase or decrease based on the independently determined value of the company.'],
    ['Doing quality work and avoiding unnecessary rework can contribute to company performance.', 'FACT', 'Rework costs time and money. Employee owners can influence company performance through everyday decisions.'],
    ["The ESOP is separate from my wages.", 'FACT', "Your wages are what you're paid for your work. The ESOP is an additional retirement benefit and part of the bigger picture of your total compensation."],
    ["If KE&G has a strong year, every employee automatically receives that year's profit in cash.", 'MYTH', "Employee ownership doesn't mean company profits are automatically divided into cash payments to employees."],
    ['Employee owners can influence the long-term success of the company through things like safety, productivity, quality and taking care of equipment.', 'FACT', ''],
    ['Vesting and share value mean the same thing.', 'MYTH', "Vesting determines how much of your ESOP account you're entitled to keep when you leave the company. Share value is the value assigned to company stock."],
    ['The ESOP is designed to provide employees with an additional financial benefit for retirement.', 'FACT', '']
  ].map(([statement, answer, explanation], i) => ({ id: `mf-${i + 1}`, order_index: i + 1, payload: { statement, answer, explanation } })),

  'trivia': [
    ['What does ESOP stand for?', ['Employee Savings Ownership Program', 'Employee Stock Ownership Plan', 'Employee Stock Option Program', 'Employer Savings Opportunity Plan'], 1],
    ['What percentage of KE&G is employee-owned?', ['25%', '51%', '75%', '100%'], 3],
    ['What year did KE&G establish its ESOP?', ['1996', '2006', '2010', '2014'], 1],
    ['What year did KE&G become 100% employee-owned?', ['2006', '2010', '2014', '2020'], 2],
    ['How long has KE&G had an ESOP as of 2026?', ['10 years', '12 years', '15 years', '20 years'], 3],
    ['How much money do employees contribute from their paycheck to purchase ESOP shares?', ['$25 per paycheck', '1% of wages', '3% of wages', '$0'], 3],
    ['What does "vesting" relate to?', ['Your hourly wage', 'Your job title', 'Your ownership of the value in your ESOP account', 'Your health insurance'], 2],
    ['What determines the value of the shares held by the ESOP?', ['Employees vote on the price', 'The President chooses it', 'It automatically increases every year', 'Company value is determined through an independent valuation process'], 3],
    ["Can KE&G's share value go down?", ['Yes', 'No'], 0],
    ['The ESOP should be considered part of your:', ['Regular paycheck', 'Overtime pay', 'Overall benefits and retirement package', 'Per diem'], 2],
    ['A crew completes something incorrectly and has to redo the work. What does that potentially affect?', ['Labor costs', 'Material costs', 'Schedule/productivity', 'All of the above'], 3],
    ['Which employee is thinking most like an owner?', ['"It\'s not my equipment, so it doesn\'t matter."', '"Someone else will clean it up."', '"If I see something that could cost us time or money, I should speak up."', '"Safety is the safety department\'s job."'], 2],
    ['Which of these can affect company performance?', ['Safety', 'Productivity', 'Quality, equipment care and waste', 'All of the above'], 3],
    ['Being an employee owner means:', ['I personally make every company decision.', "I'm guaranteed the stock price will increase.", 'I have a financial interest in the long-term success of the company.', 'My paycheck changes based on the stock price.'], 2],
    ['Who can make a difference in the success of an employee-owned company?', ['Executives', 'Project Managers', 'Superintendents', 'Everyone'], 3]
  ].map(([question, options, correctIndex], i) => ({ id: `tv-${i + 1}`, order_index: i + 1, payload: { question, options, correctIndex } }))
}

// ─── Word search generator ──────────────────────────────────────────────

const WS_DIRECTIONS = [
  { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
  { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: -1, dc: 1 }
]

function generateWordSearch(words) {
  const cleaned = words
    .map((w) => ({ ...w, letters: w.word.toUpperCase().replace(/[^A-Z]/g, '') }))
    .filter((w) => w.letters.length > 0)
    .sort((a, b) => b.letters.length - a.letters.length)

  const longest = cleaned.reduce((m, w) => Math.max(m, w.letters.length), 0)
  const size = Math.max(16, longest + 2)
  const grid = Array.from({ length: size }, () => Array(size).fill(null))
  const placements = []

  for (const w of cleaned) {
    let placed = false
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const dir = WS_DIRECTIONS[Math.floor(Math.random() * WS_DIRECTIONS.length)]
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      let ok = true
      for (let i = 0; i < w.letters.length; i++) {
        const r = row + dir.dr * i
        const c = col + dir.dc * i
        if (r < 0 || r >= size || c < 0 || c >= size) { ok = false; break }
        const cell = grid[r][c]
        if (cell !== null && cell !== w.letters[i]) { ok = false; break }
      }
      if (ok) {
        for (let i = 0; i < w.letters.length; i++) grid[row + dir.dr * i][col + dir.dc * i] = w.letters[i]
        placements.push({ ...w, row, col, dir })
        placed = true
      }
    }
  }

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) grid[r][c] = ALPHA[Math.floor(Math.random() * ALPHA.length)]
    }
  }

  return { grid, size, placements }
}

// ─── Crossword generator ────────────────────────────────────────────────

function generateCrossword(entries) {
  const words = entries
    .map((e) => ({ ...e, answer: String(e.answer).toUpperCase().replace(/[^A-Z]/g, '') }))
    .filter((w) => w.answer.length > 0)
    .sort((a, b) => b.answer.length - a.answer.length)

  if (words.length === 0) return { grid: [], rows: 0, cols: 0, placements: [] }

  const SIZE = 30
  const mid = Math.floor(SIZE / 2)
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  const placements = []

  function inBounds(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE }

  function canPlace(answer, row, col, dir) {
    const len = answer.length
    for (let i = 0; i < len; i++) {
      const r = dir === 'down' ? row + i : row
      const c = dir === 'across' ? col + i : col
      if (!inBounds(r, c)) return false
      const cell = grid[r][c]
      if (cell !== null && cell !== answer[i]) return false
    }
    const beforeR = dir === 'down' ? row - 1 : row
    const beforeC = dir === 'across' ? col - 1 : col
    const afterR = dir === 'down' ? row + len : row
    const afterC = dir === 'across' ? col + len : col
    if (inBounds(beforeR, beforeC) && grid[beforeR][beforeC] !== null) return false
    if (inBounds(afterR, afterC) && grid[afterR][afterC] !== null) return false

    for (let i = 0; i < len; i++) {
      const r = dir === 'down' ? row + i : row
      const c = dir === 'across' ? col + i : col
      const existing = grid[r][c]
      if (existing === answer[i]) continue
      if (dir === 'across') {
        if (inBounds(r - 1, c) && grid[r - 1][c] !== null) return false
        if (inBounds(r + 1, c) && grid[r + 1][c] !== null) return false
      } else {
        if (inBounds(r, c - 1) && grid[r][c - 1] !== null) return false
        if (inBounds(r, c + 1) && grid[r][c + 1] !== null) return false
      }
    }
    return true
  }

  function place(answer, row, col, dir) {
    for (let i = 0; i < answer.length; i++) {
      const r = dir === 'down' ? row + i : row
      const c = dir === 'across' ? col + i : col
      grid[r][c] = answer[i]
    }
  }

  const first = words[0]
  const startCol = mid - Math.floor(first.answer.length / 2)
  place(first.answer, mid, startCol, 'across')
  placements.push({ ...first, row: mid, col: startCol, dir: 'across' })

  for (let idx = 1; idx < words.length; idx++) {
    const w = words[idx]
    let best = null
    let bestScore = -1

    for (let li = 0; li < w.answer.length; li++) {
      const letter = w.answer[li]
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c] !== letter) continue
          for (const dir of ['across', 'down']) {
            const row = dir === 'down' ? r - li : r
            const col = dir === 'across' ? c - li : c
            if (!canPlace(w.answer, row, col, dir)) continue
            let score = 0
            for (let i = 0; i < w.answer.length; i++) {
              const rr = dir === 'down' ? row + i : row
              const cc = dir === 'across' ? col + i : col
              if (grid[rr][cc] === w.answer[i]) score++
            }
            if (score > bestScore) { bestScore = score; best = { row, col, dir } }
          }
        }
      }
    }

    if (best) {
      place(w.answer, best.row, best.col, best.dir)
      placements.push({ ...w, ...best })
    } else {
      outer: for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c <= SIZE - w.answer.length; c++) {
          if (canPlace(w.answer, r, c, 'across')) {
            place(w.answer, r, c, 'across')
            placements.push({ ...w, row: r, col: c, dir: 'across' })
            break outer
          }
        }
      }
    }
  }

  let minR = SIZE, maxR = 0, minC = SIZE, maxC = 0
  placements.forEach((p) => {
    const len = p.answer.length
    const endR = p.dir === 'down' ? p.row + len - 1 : p.row
    const endC = p.dir === 'across' ? p.col + len - 1 : p.col
    minR = Math.min(minR, p.row); maxR = Math.max(maxR, endR)
    minC = Math.min(minC, p.col); maxC = Math.max(maxC, endC)
  })

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const trimmed = Array.from({ length: rows }, () => Array(cols).fill(null))
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) trimmed[r][c] = grid[r + minR][c + minC]

  const adjusted = placements.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }))

  const starts = new Map()
  let num = 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (trimmed[r][c] === null) continue
      const leftFilled = c > 0 && trimmed[r][c - 1] !== null
      const rightFilled = c < cols - 1 && trimmed[r][c + 1] !== null
      const upFilled = r > 0 && trimmed[r - 1][c] !== null
      const downFilled = r < rows - 1 && trimmed[r + 1][c] !== null
      if ((!leftFilled && rightFilled) || (!upFilled && downFilled)) { starts.set(`${r},${c}`, num); num++ }
    }
  }

  const finalPlacements = adjusted.map((p) => ({ ...p, number: starts.get(`${p.row},${p.col}`) ?? null }))
  return { grid: trimmed, rows, cols, placements: finalPlacements }
}

// ─── Game components ─────────────────────────────────────────────────────

function WordSearchGame({ questions, onFinish }) {
  const words = useMemo(() => questions.map((q) => ({ id: q.id, word: q.payload.word })), [questions])
  const { grid, placements } = useMemo(() => generateWordSearch(words), [words])

  const [start, setStart] = useState(null)
  const [foundIds, setFoundIds] = useState([])
  const [foundCells, setFoundCells] = useState(new Set())
  const [finished, setFinished] = useState(false)

  function normalizeDir(dr, dc) { return { dr: dr === 0 ? 0 : dr / Math.abs(dr), dc: dc === 0 ? 0 : dc / Math.abs(dc) } }

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
    if (!start) { setStart([r, c]); return }
    const [r1, c1] = start
    if (r1 === r && c1 === c) { setStart(null); return }
    const cells = cellsBetween(r1, c1, r, c)
    setStart(null)
    if (!cells) return
    const letters = cells.map(([rr, cc]) => grid[rr][cc]).join('')
    const reversed = letters.split('').reverse().join('')
    const match = placements.find((p) => !foundIds.includes(p.id) && (p.letters === letters || p.letters === reversed))
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

  function giveUp() { setFinished(true); onFinish({ correct: foundIds.length, total: placements.length }) }

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
                  >{letter}</button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="badge-row">
        {placements.map((p) => (
          <span key={p.id} style={{
            fontSize: '0.85rem', padding: '4px 10px', border: '1.5px solid #233E87',
            color: foundIds.includes(p.id) ? '#fff' : '#233E87',
            background: foundIds.includes(p.id) ? '#233E87' : 'transparent',
            textDecoration: foundIds.includes(p.id) ? 'line-through' : 'none'
          }}>{p.word}</span>
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

function CrosswordGame({ questions, onFinish }) {
  const entries = useMemo(() => questions.map((q) => ({ id: q.id, clue: q.payload.clue, answer: q.payload.answer })), [questions])
  const { grid, rows, cols, placements } = useMemo(() => generateCrossword(entries), [entries])
  const [userGrid, setUserGrid] = useState(() => Array.from({ length: rows }, () => Array(cols).fill('')))
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

  function focusCell(r, c) { const el = inputRefs.current[`${r},${c}`]; if (el) el.focus() }

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
  placements.forEach((p) => { if (p.number != null) numberAt[`${p.row},${p.col}`] = p.number })

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
                    {num && <span style={{ position: 'absolute', top: 1, left: 2, fontSize: 9, color: '#233E87', fontWeight: 700 }}>{num}</span>}
                    <input
                      ref={(el) => (inputRefs.current[`${r},${c}`] = el)}
                      className="grid-cell"
                      style={{ padding: 0, textAlign: 'center', background: isCorrect ? '#C9A227' : isWrong ? '#f6dede' : 'white' }}
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
          {across.map((p) => <p key={p.id} style={{ fontSize: '0.9rem', margin: '6px 0' }}><strong>{p.number}.</strong> {p.clue}</p>)}
        </div>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Down</h3>
          {down.map((p) => <p key={p.id} style={{ fontSize: '0.9rem', margin: '6px 0' }}><strong>{p.number}.</strong> {p.clue}</p>)}
        </div>
      </div>
      {!checked && <button className="btn" style={{ marginTop: 16 }} onClick={handleSubmit}>Check my answers</button>}
      {checked && <p className="success-text" style={{ marginTop: 16 }}>Answers submitted — nice work!</p>}
    </div>
  )
}

function MythFactGame({ questions, onFinish }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[index]
  const isLast = index === questions.length - 1

  function choose(answer) {
    if (selected) return
    setSelected(answer)
    if (answer === q.payload.answer) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) { setDone(true); onFinish({ correct: score, total: questions.length }); return }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  if (done) return null

  return (
    <div className="sheet">
      <p className="desc">Statement {index + 1} of {questions.length}</p>
      <h2 style={{ fontSize: '1.2rem' }}>{q.payload.statement}</h2>
      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        {['MYTH', 'FACT'].map((opt) => {
          const isChosen = selected === opt
          const isRight = opt === q.payload.answer
          let bg = 'transparent', color = '#233E87', border = '#233E87'
          if (selected) {
            if (isRight) { bg = '#233E87'; color = '#fff' }
            else if (isChosen && !isRight) { bg = '#f6dede'; color = '#a4302a'; border = '#a4302a' }
          }
          return (
            <button key={opt} onClick={() => choose(opt)} disabled={!!selected} className="btn"
              style={{ background: bg, color, border: `2px solid ${border}`, flex: 1 }}>{opt}</button>
          )
        })}
      </div>
      {selected && (
        <div>
          <p className={selected === q.payload.answer ? 'success-text' : 'error-text'}>
            {selected === q.payload.answer ? 'Correct!' : `Not quite — this one is ${q.payload.answer}.`}
          </p>
          {q.payload.explanation && <p className="desc">{q.payload.explanation}</p>}
          <button className="btn" onClick={next}>{isLast ? 'See my results' : 'Next statement'}</button>
        </div>
      )}
    </div>
  )
}

function TriviaGame({ questions, onFinish }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[index]
  const isLast = index === questions.length - 1

  function choose(i) {
    if (selected != null) return
    setSelected(i)
    if (i === q.payload.correctIndex) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) { setDone(true); onFinish({ correct: score, total: questions.length }); return }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  if (done) return null

  return (
    <div className="sheet">
      <p className="desc">Question {index + 1} of {questions.length}</p>
      <h2 style={{ fontSize: '1.2rem' }}>{q.payload.question}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
        {q.payload.options.map((opt, i) => {
          const isChosen = selected === i
          const isRight = i === q.payload.correctIndex
          let bg = 'transparent', color = '#101826', border = '#A3BAD6'
          if (selected != null) {
            if (isRight) { bg = '#233E87'; color = '#fff'; border = '#233E87' }
            else if (isChosen && !isRight) { bg = '#f6dede'; color = '#a4302a'; border = '#a4302a' }
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={selected != null}
              style={{ textAlign: 'left', padding: '12px 14px', background: bg, color, border: `1.5px solid ${border}`, cursor: selected != null ? 'default' : 'pointer', fontSize: '0.98rem' }}>
              {opt}
            </button>
          )
        })}
      </div>
      {selected != null && (
        <div>
          <p className={selected === q.payload.correctIndex ? 'success-text' : 'error-text'}>
            {selected === q.payload.correctIndex ? 'Correct!' : 'Not quite.'}
          </p>
          <button className="btn" onClick={next}>{isLast ? 'See my results' : 'Next question'}</button>
        </div>
      )}
    </div>
  )
}

// ─── Storage convenience helper ─────────────────────────────────────────

async function getOr(key, fallback) {
  try {
    const res = await window.storage.get(key)
    return res.value
  } catch {
    return fallback
  }
}

// ─── Sign-in page ────────────────────────────────────────────────────────

function SignIn({ onSignedIn, onGoAdmin }) {
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const employees = await getOr('employees:list', [])
      const num = employeeNumber.trim()
      const match = employees.find((emp) => String(emp.employeeNumber).trim() === num)
      if (!match || String(match.name).trim().toLowerCase() !== name.trim().toLowerCase()) {
        setError("We couldn't find a match for that employee number and name. Check your entry and try again.")
        return
      }
      const employee = { id: match.employeeNumber, employeeNumber: match.employeeNumber, name: match.name }
      saveEmployee(employee)
      onSignedIn(employee)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell" style={{ maxWidth: 480, paddingTop: 60 }}>
      <div className="title-block" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="mark">KE&amp;G · EMPLOYEE OWNERSHIP MONTH</span>
        <h1>Find Your Ownership</h1>
        <p className="subtitle">Sign in with your employee number and name to play.</p>
      </div>
      <form onSubmit={handleSubmit} className="sheet">
        <div className="field">
          <label htmlFor="employeeNumber">Employee number</label>
          <input id="employeeNumber" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} autoComplete="off" required />
        </div>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Sign in'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="small-link" onClick={onGoAdmin}>Admin login</button>
      </p>
    </div>
  )
}

// ─── Game hub ────────────────────────────────────────────────────────────

function Hub({ employee, onSignOut, onPlay }) {
  const [games, setGames] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const list = await getOr('games:list', [])
        setGames([...list].sort((a, b) => a.sort_order - b.sort_order))
        const { keys } = await window.storage.list(`completions:${employee.employeeNumber}:`)
        setCompletedIds(keys.map((k) => k.split(':')[2]))
      } catch (err) {
        setError(err.message || 'Could not load games.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="top-nav">
        <span>Signed in as {employee.name}</span>
        <button className="small-link" style={{ color: 'white' }} onClick={onSignOut}>Sign out</button>
      </div>
      <div className="shell">
        <div className="title-block">
          <div>
            <span className="mark">KE&amp;G · EMPLOYEE OWNERSHIP MONTH</span>
            <h1>Find Your Ownership</h1>
          </div>
        </div>
        {loading && <p>Loading games…</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && games.length === 0 && <p className="desc">No games have been set up yet — check back soon.</p>}
        {!loading && games.map((game) => {
          const done = completedIds.includes(game.id)
          return (
            <div className="sheet" key={game.id}>
              <span className={`stamp ${!game.is_unlocked ? 'locked' : done ? 'done' : ''}`}>
                {!game.is_unlocked ? 'LOCKED' : done ? 'COMPLETE' : 'UNLOCKED'}
              </span>
              <span className="sheet-number">{game.sheet_label}</span>
              <h2>{game.title}</h2>
              <p className="desc">{game.description}</p>
              {game.is_unlocked
                ? <button className="btn" onClick={() => onPlay(game.id)}>{done ? 'Play again' : 'Play'}</button>
                : <button className="btn" disabled>Locked</button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Game player ─────────────────────────────────────────────────────────

function GamePlayer({ employee, gameId, onBack }) {
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const games = await getOr('games:list', [])
        const g = games.find((x) => x.id === gameId)
        if (!g) { setError('Game not found.'); return }
        if (!g.is_unlocked) { setError('This game is not unlocked yet.'); return }
        setGame(g)
        const qs = await getOr(`questions:${gameId}`, [])
        setQuestions(qs.sort((a, b) => a.order_index - b.order_index))
      } catch (err) {
        setError(err.message || 'Could not load this game.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [gameId])

  async function handleFinish(score) {
    setFinalScore(score)
    setFinished(true)
    try {
      await window.storage.set(`completions:${employee.employeeNumber}:${gameId}`, {
        employeeNumber: employee.employeeNumber,
        gameId,
        correct: score.correct,
        total: score.total,
        completedAt: new Date().toISOString()
      })
    } catch {
      // Don't block the player from seeing their result if the save fails.
    }
  }

  return (
    <div className="shell">
      <p style={{ marginBottom: 16 }}><button className="small-link" onClick={onBack}>&larr; Back to games</button></p>
      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {game && !finished && (
        <>
          <div className="title-block">
            <div>
              <span className="mark">{game.title.toUpperCase()}</span>
              <h1 style={{ fontSize: '1.6rem' }}>{game.title}</h1>
            </div>
          </div>
          {game.type === 'word_search' && <WordSearchGame questions={questions} onFinish={handleFinish} />}
          {game.type === 'crossword' && <CrosswordGame questions={questions} onFinish={handleFinish} />}
          {game.type === 'myth_fact' && <MythFactGame questions={questions} onFinish={handleFinish} />}
          {game.type === 'trivia' && <TriviaGame questions={questions} onFinish={handleFinish} />}
        </>
      )}
      {finished && (
        <div className="sheet">
          <span className="stamp done">COMPLETE</span>
          <h2>Nice work, {employee.name.split(' ')[0]}!</h2>
          <p className="desc">{finalScore ? `You scored ${finalScore.correct} out of ${finalScore.total}.` : "You've completed this game."}</p>
          <button className="btn" onClick={onBack}>Back to games</button>
        </div>
      )}
    </div>
  )
}

// ─── Admin ───────────────────────────────────────────────────────────────

const PAYLOAD_FIELDS = {
  word_search: [{ key: 'word', label: 'Word or phrase' }],
  crossword: [{ key: 'clue', label: 'Clue' }, { key: 'answer', label: 'Answer' }],
  myth_fact: [
    { key: 'statement', label: 'Statement' },
    { key: 'answer', label: 'Answer (MYTH or FACT)' },
    { key: 'explanation', label: 'Explanation (optional)' }
  ],
  trivia: [
    { key: 'question', label: 'Question' },
    { key: 'options', label: 'Options (one per line)', isList: true },
    { key: 'correctIndex', label: 'Correct option # (0 = first)', isNumber: true }
  ]
}

function toCsv(rows) {
  return rows.map((row) => row.map((cell) => {
    const s = String(cell ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')).join('\n')
}

function AdminLogin({ onAuthed }) {
  const [pw, setPw] = useState(getAdminPw())
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => { if (pw) tryAuth(pw) }, [])

  async function tryAuth(password) {
    setChecking(true); setError('')
    try {
      const ok = await window.storage.checkAdminPassword(password)
      if (!ok) { setError('Incorrect admin password.'); return }
      saveAdminPw(password)
      onAuthed()
    } catch (err) {
      setError(err.message || 'Could not verify the password.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="shell" style={{ maxWidth: 420, paddingTop: 60 }}>
      <div className="title-block" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="mark">KE&amp;G · ADMIN</span>
        <h1>Admin login</h1>
      </div>
      <form className="sheet" onSubmit={(e) => { e.preventDefault(); tryAuth(pw) }}>
        <div className="field">
          <label htmlFor="pw">Admin password</label>
          <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" disabled={checking}>{checking ? 'Checking…' : 'Log in'}</button>
      </form>
    </div>
  )
}

function GamesTab() {
  const [games, setGames] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() { setGames(await getOr('games:list', [])) }
  useEffect(() => { load() }, [])

  async function toggle(gameId, isUnlocked) {
    try {
      const updated = games.map((g) => (g.id === gameId ? { ...g, is_unlocked: isUnlocked } : g))
      await window.storage.set('games:list', updated)
      setGames(updated)
    } catch (err) { setError(err.message) }
  }

  async function loadDefaults() {
    if (!confirm('This loads the 4 default ESOP games and their questions. Existing games/questions with the same IDs will be overwritten. Continue?')) return
    setBusy(true)
    try {
      await window.storage.set('games:list', SEED_GAMES)
      for (const gameId of Object.keys(SEED_QUESTIONS)) {
        await window.storage.set(`questions:${gameId}`, SEED_QUESTIONS[gameId])
      }
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {error && <p className="error-text">{error}</p>}
      {games.length === 0 && (
        <div className="sheet">
          <p className="desc">No games are set up yet.</p>
          <button className="btn gold" onClick={loadDefaults} disabled={busy}>
            {busy ? 'Loading…' : 'Load the 4 default ESOP games'}
          </button>
        </div>
      )}
      {games.map((g) => (
        <div className="sheet" key={g.id}>
          <span className="sheet-number">{g.sheet_label}</span>
          <h2 style={{ fontSize: '1.2rem' }}>{g.title}</h2>
          <p className="desc">{g.description}</p>
          <button className={`btn ${g.is_unlocked ? 'outline' : 'gold'}`} onClick={() => toggle(g.id, !g.is_unlocked)}>
            {g.is_unlocked ? 'Lock this game' : 'Unlock this game'}
          </button>
        </div>
      ))}
      {games.length > 0 && (
        <button className="small-link" onClick={loadDefaults} style={{ marginTop: 8 }}>
          Reset to default content
        </button>
      )}
    </div>
  )
}

function EmployeesTab() {
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function load() { setEmployees(await getOr('employees:list', [])) }
  useEffect(() => { load() }, [])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        if (rows.length < 2) { setError('No data rows found in that file.'); return }
        const header = rows[0].map((h) => String(h || '').toLowerCase())
        const numberCol = header.findIndex((h) => h.includes('number'))
        const nameCol = header.findIndex((h) => h.includes('name'))
        const numCol = numberCol >= 0 ? numberCol : 0
        const nmCol = nameCol >= 0 ? nameCol : 1

        const incoming = rows.slice(1)
          .map((r) => ({ employeeNumber: String(r[numCol] ?? '').trim(), name: String(r[nmCol] ?? '').trim() }))
          .filter((r) => r.employeeNumber && r.name)

        if (incoming.length === 0) { setError('No valid rows found. Each row needs an employee number and a name.'); return }

        const existing = await getOr('employees:list', [])
        const byNumber = new Map(existing.map((e) => [e.employeeNumber, e]))
        incoming.forEach((r) => byNumber.set(r.employeeNumber, r))
        const merged = [...byNumber.values()]

        await window.storage.set('employees:list', merged)
        setStatus(`Uploaded ${incoming.length} employees. Roster now has ${merged.length}.`)
        setError('')
        load()
      } catch (err) {
        setError(err.message || 'Could not read that file.')
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  async function remove(employeeNumber) {
    if (!confirm('Remove this employee?')) return
    try {
      const existing = await getOr('employees:list', [])
      const remaining = existing.filter((e) => e.employeeNumber !== employeeNumber)
      await window.storage.set('employees:list', remaining)
      load()
    } catch (err) { setError(err.message) }
  }

  return (
    <div>
      <div className="sheet">
        <h2 style={{ fontSize: '1.15rem' }}>Bulk upload roster</h2>
        <p className="desc">
          Upload a CSV or Excel file with two columns: <strong>employee number</strong> and <strong>name</strong>.
          The header row can be named anything containing "number" and "name" — matching employee numbers are updated, new ones are added.
        </p>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} />
        {status && <p className="success-text">{status}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
      <div className="sheet">
        <h2 style={{ fontSize: '1.15rem' }}>Roster ({employees.length})</h2>
        <table className="admin-table">
          <thead><tr><th>Employee #</th><th>Name</th><th></th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.employeeNumber}>
                <td>{e.employeeNumber}</td>
                <td>{e.name}</td>
                <td><button className="small-link" onClick={() => remove(e.employeeNumber)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QuestionEditor({ question, fields, onSave, onDelete }) {
  const [payload, setPayload] = useState(question.payload)
  const [orderIndex, setOrderIndex] = useState(question.order_index)
  const [savedMsg, setSavedMsg] = useState('')

  function setField(key, value) { setPayload((p) => ({ ...p, [key]: value })) }

  function handleSave() {
    onSave({ id: question.id, order_index: orderIndex, payload })
    setSavedMsg('Saved.')
    setTimeout(() => setSavedMsg(''), 1500)
  }

  return (
    <div className="sheet">
      <div className="field" style={{ maxWidth: 100 }}>
        <label>Order</label>
        <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} />
      </div>
      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          {f.isList ? (
            <textarea rows={4} value={(payload[f.key] || []).join('\n')} onChange={(e) => setField(f.key, e.target.value.split('\n'))} />
          ) : (
            <input
              type={f.isNumber ? 'number' : 'text'}
              value={payload[f.key] ?? ''}
              onChange={(e) => setField(f.key, f.isNumber ? Number(e.target.value) : e.target.value)}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn" onClick={handleSave}>Save</button>
        {onDelete && <button className="small-link" onClick={onDelete}>Delete</button>}
        {savedMsg && <span className="success-text">{savedMsg}</span>}
      </div>
    </div>
  )
}

function QuestionsTab() {
  const [games, setGames] = useState([])
  const [gameId, setGameId] = useState('')
  const [gameType, setGameType] = useState('')
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const list = await getOr('games:list', [])
      setGames(list)
      if (list[0]) { setGameId(list[0].id); setGameType(list[0].type) }
    }
    load()
  }, [])

  async function loadQuestions(id) {
    try { setQuestions(await getOr(`questions:${id}`, [])) } catch (err) { setError(err.message) }
  }
  useEffect(() => { if (gameId) loadQuestions(gameId) }, [gameId])

  function selectGame(id) {
    setGameId(id)
    setGameType(games.find((g) => g.id === id)?.type)
  }

  async function saveAll(next) {
    try {
      await window.storage.set(`questions:${gameId}`, next)
      loadQuestions(gameId)
    } catch (err) { setError(err.message) }
  }

  function save(q) {
    const exists = questions.some((x) => x.id === q.id)
    const next = exists ? questions.map((x) => (x.id === q.id ? q : x)) : [...questions, q]
    saveAll(next)
  }

  function remove(id) {
    if (!confirm('Delete this question?')) return
    saveAll(questions.filter((x) => x.id !== id))
  }

  function addNew() {
    const fields = PAYLOAD_FIELDS[gameType] || []
    const blankPayload = {}
    fields.forEach((f) => { blankPayload[f.key] = f.isList ? [] : f.isNumber ? 0 : '' })
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setQuestions((qs) => [...qs, { id, order_index: qs.length + 1, payload: blankPayload }])
  }

  return (
    <div>
      <div className="sheet">
        <div className="field">
          <label>Game</label>
          <select value={gameId} onChange={(e) => selectGame(e.target.value)}>
            {games.map((g) => <option key={g.id} value={g.id}>{g.sheet_label} — {g.title}</option>)}
          </select>
        </div>
        {games.length === 0 && <p className="desc">Load the default games from the Games tab first.</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
      {questions.map((q) => (
        <QuestionEditor key={q.id} question={q} fields={PAYLOAD_FIELDS[gameType] || []} onSave={save} onDelete={() => remove(q.id)} />
      ))}
      {gameId && <button className="btn outline" onClick={addNew}>+ Add question</button>}
    </div>
  )
}

function CompletionsTab() {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/.netlify/functions/report?pw=${encodeURIComponent(getAdminPw())}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load the report.')
        setReport(data)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  function exportCsv() {
    if (!report) return
    const games = [...report.games].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const rows = [['Employee #', 'Name', ...games.map((g) => g.title)]]
    report.employees.forEach((emp) => {
      const row = [emp.employeeNumber, emp.name]
      games.forEach((g) => {
        const c = report.completions.find((c) => c.employeeNumber === emp.employeeNumber && c.gameId === g.id)
        row.push(c ? `${c.correct}/${c.total}` : '')
      })
      rows.push(row)
    })
    const blob = new Blob([toCsv(rows)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'esop-games-completions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) return <p className="error-text">{error}</p>
  if (!report) return <p>Loading…</p>

  const games = [...report.games].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  return (
    <div className="sheet">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem' }}>Completions</h2>
        <button className="btn outline" onClick={exportCsv}>Export CSV</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Employee #</th><th>Name</th>{games.map((g) => <th key={g.id}>{g.sheet_label}</th>)}</tr></thead>
        <tbody>
          {report.employees.map((emp) => (
            <tr key={emp.employeeNumber}>
              <td>{emp.employeeNumber}</td>
              <td>{emp.name}</td>
              {games.map((g) => {
                const c = report.completions.find((c) => c.employeeNumber === emp.employeeNumber && c.gameId === g.id)
                return <td key={g.id}>{c ? '✓' : ''}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminDashboard({ onSignOut }) {
  const [tab, setTab] = useState('games')
  return (
    <div>
      <div className="top-nav">
        <span>KE&amp;G Admin</span>
        <button className="small-link" style={{ color: 'white' }} onClick={onSignOut}>Sign out</button>
      </div>
      <div className="shell">
        <div className="title-block"><h1 style={{ fontSize: '1.6rem' }}>Game administration</h1></div>
        <div className="tabs">
          {['games', 'employees', 'questions', 'completions'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        {tab === 'games' && <GamesTab />}
        {tab === 'employees' && <EmployeesTab />}
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'completions' && <CompletionsTab />}
      </div>
    </div>
  )
}

function Admin({ onSignOut }) {
  const [authed, setAuthed] = useState(!!getAdminPw())
  function signOut() { clearAdminPw(); setAuthed(false); onSignOut() }
  if (!authed) return <AdminLogin onAuthed={() => setAuthed(true)} />
  return <AdminDashboard onSignOut={signOut} />
}

// ─── Root app ────────────────────────────────────────────────────────────

function App() {
  const [view, setView] = useState(() => (getEmployee() ? 'hub' : 'signin'))
  const [employee, setEmployee] = useState(getEmployee())
  const [activeGameId, setActiveGameId] = useState(null)

  function handleSignedIn(emp) { setEmployee(emp); setView('hub') }
  function handleSignOut() { clearEmployee(); setEmployee(null); setView('signin') }
  function handlePlay(gameId) { setActiveGameId(gameId); setView('game') }
  function handleBackToHub() { setActiveGameId(null); setView('hub') }
  function handleGoAdmin() { setView('admin') }
  function handleAdminSignOut() { setView(employee ? 'hub' : 'signin') }

  if (view === 'admin') return <Admin onSignOut={handleAdminSignOut} />
  if (view === 'signin' || !employee) return <SignIn onSignedIn={handleSignedIn} onGoAdmin={handleGoAdmin} />
  if (view === 'game' && activeGameId) return <GamePlayer employee={employee} gameId={activeGameId} onBack={handleBackToHub} />
  return <Hub employee={employee} onSignOut={handleSignOut} onPlay={handlePlay} />
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
