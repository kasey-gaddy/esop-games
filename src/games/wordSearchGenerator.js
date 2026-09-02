const DIRECTIONS = [
  { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
  { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: -1, dc: 1 }
]

export function generateWordSearch(words) {
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
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
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
        for (let i = 0; i < w.letters.length; i++) {
          grid[row + dir.dr * i][col + dir.dc * i] = w.letters[i]
        }
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
