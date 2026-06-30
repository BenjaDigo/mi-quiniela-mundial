import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Trophy, LayoutDashboard, Users, Calendar, Shield, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', label: 'Inicio',      icon: LayoutDashboard },
  { to: '/my-teams',  label: 'Mis Equipos', icon: Trophy },
  { to: '/matches',   label: 'Partidos',    icon: Calendar },
  { to: '/admin',     label: 'Admin',       icon: Shield, admin: true },
]

export default function Navbar({ isAdmin }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await logout()
    toast.success('Hasta pronto 👋')
    navigate('/login')
  }

  const links = NAV.filter(n => !n.admin || isAdmin)

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl">🏆</span>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-wide gold-text">QUINIELA</p>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase -mt-0.5">Mundial 2026</p>
          </div>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User info */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white leading-none">{user?.displayName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={17} />
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 text-zinc-400">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-yellow-500/10 text-yellow-400' : 'text-zinc-300 hover:bg-zinc-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg w-full">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}
