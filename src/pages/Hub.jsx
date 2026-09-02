import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getEmployee, clearEmployee } from '../lib/api.js'

export default function Hub() {
  const employee = getEmployee()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getGames(employee.id)
      .then(({ games, completedIds }) => {
        setGames(games)
        setCompletedIds(completedIds)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function signOut() {
    clearEmployee()
    navigate('/')
  }

  return (
    <div>
      <div className="top-nav">
        <span>Signed in as {employee.name}</span>
        <button className="small-link" style={{ color: 'white' }} onClick={signOut}>Sign out</button>
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
              {game.is_unlocked ? (
                <Link to={`/games/${game.id}`} className="btn">
                  {done ? 'Play again' : 'Play'}
                </Link>
              ) : (
                <button className="btn" disabled>Locked</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
