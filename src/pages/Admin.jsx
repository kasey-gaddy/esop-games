import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { api, saveAdminPassword, getAdminPassword, clearAdminPassword } from '../lib/api.js'

export default function Admin() {
  const [pw, setPw] = useState(getAdminPassword())
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (pw) tryAuth(pw)
  }, [])

  async function tryAuth(password) {
    setChecking(true)
    setAuthError('')
    try {
      await api.admin(password, 'listEmployees')
      saveAdminPassword(password)
      setAuthed(true)
    } catch (e) {
      setAuthError(e.message)
      setAuthed(false)
    } finally {
      setChecking(false)
    }
  }

  function signOut() {
    clearAdminPassword()
    setAuthed(false)
    setPw('')
  }

  if (!authed) {
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
          {authError && <p className="error-text">{authError}</p>}
          <button className="btn" disabled={checking}>{checking ? 'Checking…' : 'Log in'}</button>
        </form>
      </div>
    )
  }

  return <AdminDashboard onSignOut={signOut} />
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
        <div className="title-block">
          <h1 style={{ fontSize: '1.6rem' }}>Game administration</h1>
        </div>
        <div className="tabs">
          {['games', 'employees', 'questions', 'completions'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
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

function GamesTab() {
  const [games, setGames] = useState([])
  const [error, setError] = useState('')
  const pw = getAdminPassword()

  function load() {
    api.getGames().then((d) => setGames(d.games)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function toggle(gameId, isUnlocked) {
    try {
      await api.admin(pw, 'toggleGame', { gameId, isUnlocked })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      {error && <p className="error-text">{error}</p>}
      {games.map((g) => (
        <div className="sheet" key={g.id}>
          <span className="sheet-number">{g.sheet_label}</span>
          <h2 style={{ fontSize: '1.2rem' }}>{g.title}</h2>
          <p className="desc">{g.description}</p>
          <button
            className={`btn ${g.is_unlocked ? 'outline' : 'gold'}`}
            onClick={() => toggle(g.id, !g.is_unlocked)}
          >
            {g.is_unlocked ? 'Lock this game' : 'Unlock this game'}
          </button>
        </div>
      ))}
    </div>
  )
}

function EmployeesTab() {
  const pw = getAdminPassword()
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  function load() {
    api.admin(pw, 'listEmployees').then((d) => setEmployees(d.employees)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.map((r) => {
          const keys = Object.keys(r)
          const numberKey = keys.find((k) => /number/i.test(k)) || keys[0]
          const nameKey = keys.find((k) => /name/i.test(k)) || keys[1]
          return { employeeNumber: r[numberKey], name: r[nameKey] }
        })
        try {
          const res = await api.admin(pw, 'bulkUploadEmployees', { employees: rows })
          setStatus(`Uploaded ${res.inserted} employees.`)
          load()
        } catch (err) {
          setError(err.message)
        }
      }
    })
    e.target.value = ''
  }

  async function remove(id) {
    if (!confirm('Remove this employee?')) return
    try {
      await api.admin(pw, 'deleteEmployee', { id })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div className="sheet">
        <h2 style={{ fontSize: '1.15rem' }}>Bulk upload roster</h2>
        <p className="desc">
          Upload a CSV with two columns: <strong>employee number</strong> and <strong>name</strong>.
          The header row can be named anything containing "number" and "name" — matching employee numbers are updated, new ones are added.
        </p>
        <input type="file" accept=".csv" onChange={handleFile} />
        {status && <p className="success-text">{status}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="sheet">
        <h2 style={{ fontSize: '1.15rem' }}>Roster ({employees.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Employee #</th><th>Name</th><th></th></tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.employee_number}</td>
                <td>{e.name}</td>
                <td><button className="small-link" onClick={() => remove(e.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

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

function QuestionsTab() {
  const pw = getAdminPassword()
  const [games, setGames] = useState([])
  const [gameId, setGameId] = useState('')
  const [gameType, setGameType] = useState('')
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.getGames().then((d) => {
      setGames(d.games)
      if (d.games[0]) { setGameId(d.games[0].id); setGameType(d.games[0].type) }
    })
  }, [])

  function loadQuestions(id) {
    api.admin(pw, 'listQuestions', { gameId: id }).then((d) => setQuestions(d.questions)).catch((e) => setError(e.message))
  }
  useEffect(() => { if (gameId) loadQuestions(gameId) }, [gameId])

  function selectGame(id) {
    setGameId(id)
    setGameType(games.find((g) => g.id === id)?.type)
  }

  async function save(q) {
    try {
      await api.admin(pw, 'upsertQuestion', { id: q.id, gameId, orderIndex: q.order_index, payload: q.payload })
      loadQuestions(gameId)
    } catch (e) {
      setError(e.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this question?')) return
    try {
      await api.admin(pw, 'deleteQuestion', { id })
      loadQuestions(gameId)
    } catch (e) {
      setError(e.message)
    }
  }

  function addNew() {
    const fields = PAYLOAD_FIELDS[gameType] || []
    const blankPayload = {}
    fields.forEach((f) => { blankPayload[f.key] = f.isList ? [] : f.isNumber ? 0 : '' })
    setQuestions((qs) => [...qs, { id: null, order_index: qs.length + 1, payload: blankPayload, _new: true }])
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
        {error && <p className="error-text">{error}</p>}
      </div>

      {questions.map((q, idx) => (
        <QuestionEditor
          key={q.id || `new-${idx}`}
          question={q}
          fields={PAYLOAD_FIELDS[gameType] || []}
          onSave={save}
          onDelete={q.id ? () => remove(q.id) : null}
        />
      ))}

      <button className="btn outline" onClick={addNew}>+ Add question</button>
    </div>
  )
}

function QuestionEditor({ question, fields, onSave, onDelete }) {
  const [payload, setPayload] = useState(question.payload)
  const [orderIndex, setOrderIndex] = useState(question.order_index)
  const [savedMsg, setSavedMsg] = useState('')

  function setField(key, value) {
    setPayload((p) => ({ ...p, [key]: value }))
  }

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
            <textarea
              rows={4}
              value={(payload[f.key] || []).join('\n')}
              onChange={(e) => setField(f.key, e.target.value.split('\n'))}
            />
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

function CompletionsTab() {
  const pw = getAdminPassword()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin(pw, 'completionsReport').then(setReport).catch((e) => setError(e.message))
  }, [])

  function exportCsv() {
    if (!report) return
    const rows = [['Employee #', 'Name', ...report.games.map((g) => g.title)]]
    report.employees.forEach((emp) => {
      const row = [emp.employee_number, emp.name]
      report.games.forEach((g) => {
        const c = report.completions.find((c) => c.employee_id === emp.id && c.game_id === g.id)
        row.push(c ? (c.score ? `${c.score.correct}/${c.score.total}` : 'Complete') : '')
      })
      rows.push(row)
    })
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'esop-games-completions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) return <p className="error-text">{error}</p>
  if (!report) return <p>Loading…</p>

  return (
    <div className="sheet">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem' }}>Completions</h2>
        <button className="btn outline" onClick={exportCsv}>Export CSV</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Employee #</th>
            <th>Name</th>
            {report.games.map((g) => <th key={g.id}>{g.sheet_label}</th>)}
          </tr>
        </thead>
        <tbody>
          {report.employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.employee_number}</td>
              <td>{emp.name}</td>
              {report.games.map((g) => {
                const c = report.completions.find((c) => c.employee_id === emp.id && c.game_id === g.id)
                return <td key={g.id}>{c ? '✓' : ''}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
