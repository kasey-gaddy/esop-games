// Generates a crossword layout at runtime from a list of { id, clue, answer }.
// No manual grid coordinates are needed — admins only ever edit clue/answer text.

export function generateCrossword(entries) {
  const words = entries
    .map((e) => ({ ...e, answer: String(e.answer).toUpperCase().replace(/[^A-Z]/g, '') }))
    .filter((w) => w.answer.length > 0)
    .sort((a, b) => b.answer.length - a.answer.length)

  if (words.length === 0) return { grid: [], rows: 0, cols: 0, placements: [] }

  const SIZE = 30
  const mid = Math.floor(SIZE / 2)
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  const placements = []

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE
  }

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
      if (existing === answer[i]) continue // intersection cell, fine
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
            if (score > bestScore) {
              bestScore = score
              best = { row, col, dir }
            }
          }
        }
      }
    }

    if (best) {
      place(w.answer, best.row, best.col, best.dir)
      placements.push({ ...w, ...best })
    } else {
      // Fallback: no intersection found, drop it in the first open spot.
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
      if ((!leftFilled && rightFilled) || (!upFilled && downFilled)) {
        starts.set(`${r},${c}`, num)
        num++
      }
    }
  }

  const finalPlacements = adjusted.map((p) => ({ ...p, number: starts.get(`${p.row},${p.col}`) ?? null }))

  return { grid: trimmed, rows, cols, placements: finalPlacements }
}
