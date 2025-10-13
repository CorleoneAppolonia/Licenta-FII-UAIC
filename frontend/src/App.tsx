import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAuth } from './context/AuthContext'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProxyPage } from './pages/ProxyPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" aria-hidden />
        <p>Loading session…</p>
      </div>
    )
  }

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/proxy" element={<ProxyPage />} />
          <Route
            path="/admin"
            element={user.is_staff ? <AdminPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
