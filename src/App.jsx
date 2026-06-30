import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import { QuinielaProvider } from './context/QuinielaContext'
import Navbar from './components/Layout/Navbar'

import Login from './pages/Login'
import Dashboard    from './pages/Dashboard'
import MyTeams      from './pages/MyTeams'
import Matches      from './pages/Matches'
import Admin        from './pages/Admin'
import JoinQuiniela from './pages/JoinQuiniela'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// Layout compartido para todas las rutas autenticadas
function AuthedLayout({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar isAdmin={!!user} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  )
}

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#FFD700', secondary: '#000' } },
        }}
      />

      <AnimatePresence mode="wait">
        {/* QuinielaProvider solo se monta cuando hay usuario */}
        {user
          ? (
            <QuinielaProvider>
              <Routes location={location} key={location.pathname}>
                <Route path="/dashboard" element={<AuthedLayout><Dashboard /></AuthedLayout>} />
                <Route path="/my-teams"  element={<AuthedLayout><MyTeams /></AuthedLayout>} />
                <Route path="/matches"   element={<AuthedLayout><Matches /></AuthedLayout>} />
                <Route path="/leaderboard" element={<Navigate to="/matches" replace />} />
                <Route path="/admin"       element={<AuthedLayout><Admin /></AuthedLayout>} />
                <Route path="/join"        element={<AuthedLayout><JoinQuiniela /></AuthedLayout>} />
                <Route path="*"            element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </QuinielaProvider>
          )
          : (
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<Login />} />
              <Route path="*"     element={<Navigate to="/login" replace />} />
            </Routes>
          )
        }
      </AnimatePresence>
    </>
  )
}
