import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn.jsx'
import Hub from './pages/Hub.jsx'
import GamePlayer from './pages/GamePlayer.jsx'
import Admin from './pages/Admin.jsx'
import { getEmployee } from './lib/api.js'

function RequireEmployee({ children }) {
  const employee = getEmployee()
  if (!employee) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/games" element={<RequireEmployee><Hub /></RequireEmployee>} />
      <Route path="/games/:gameId" element={<RequireEmployee><GamePlayer /></RequireEmployee>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
