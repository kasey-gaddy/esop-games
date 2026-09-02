import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, saveEmployee } from '../lib/api.js'

export default function SignIn() {
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { employee } = await api.login(employeeNumber, name)
      saveEmployee(employee)
      navigate('/games')
    } catch (err) {
      setError(err.message)
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
          <input
            id="employeeNumber"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/admin" className="small-link">Admin login</Link>
      </p>
    </div>
  )
}
