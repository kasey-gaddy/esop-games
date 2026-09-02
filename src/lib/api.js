const BASE = '/api'

async function call(path, options = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const api = {
  login: (employeeNumber, name) => call('login', { method: 'POST', body: { employeeNumber, name } }),
  getGames: (employeeId) => call(`games${employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ''}`),
  getQuestions: (gameId) => call(`questions?gameId=${encodeURIComponent(gameId)}`),
  complete: (employeeId, gameId, score) => call('complete', { method: 'POST', body: { employeeId, gameId, score } }),
  admin: (adminPassword, action, extra = {}) =>
    call('admin', { method: 'POST', body: { adminPassword, action, ...extra } })
}

// --- Local session helpers (display info only, no secrets) ---
export function saveEmployee(employee) {
  sessionStorage.setItem('esop_employee', JSON.stringify(employee))
}
export function getEmployee() {
  try {
    return JSON.parse(sessionStorage.getItem('esop_employee') || 'null')
  } catch {
    return null
  }
}
export function clearEmployee() {
  sessionStorage.removeItem('esop_employee')
}

export function saveAdminPassword(pw) {
  sessionStorage.setItem('esop_admin_pw', pw)
}
export function getAdminPassword() {
  return sessionStorage.getItem('esop_admin_pw') || ''
}
export function clearAdminPassword() {
  sessionStorage.removeItem('esop_admin_pw')
}
