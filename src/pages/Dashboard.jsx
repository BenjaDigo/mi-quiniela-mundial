import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Users, RefreshCw, Globe, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useQuiniela } from '../context/QuinielaContext'
import { listenParticipants, getAllQuinielas } from '../services/firestoreService'
import MatchCard from '../components/UI/MatchCard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function StatCard({ icon: Icon, label, value, color = 'yellow' }) {
  const colors = {
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green:  'text-emerald-400 bg-emerald-500/10',
    blue:   'text-blue-400 bg-blue-500/10',
    red:    'text-red-400 bg-red-500/10',
  }
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={20} className={colors[color].split(' ')[0]} />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard({ quinielaId }) {
  const { user } = useAuth()
  const { matches, syncing, lastSync, syncScores } = useQuiniela()
  const [participants, setParticipants] = useState([])
  const [quinielas, setQuinielas]       = useState([])
  const [myPoints, setMyPoints]         = useState(0)
  const [myRank, setMyRank]             = useState(null)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    getAllQuinielas().then(setQuinielas)
  }, [])

  // Si hay quiniela activa, escuchar participantes
  const activeId = quinielaId ?? quinielas[0]?.id
  useEffect(() => {
    if (!activeId) return
    return listenParticipants(activeId, (ps) => {
      setParticipants(ps)
      const me = ps.find(p => p.uid === user?.uid)
      setIsParticipant(!!me)
      if (me) {
        setMyPoints(me.points ?? 0)
        setMyRank((ps.findIndex(p => p.uid === user?.uid) + 1) || null)
      }
    })
  }, [activeId, user])

  const todayMatches = matches.filter(m => {
    try {
      const d = new Date(m.utcDate)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    } catch { return false }
  })

  const liveMatches = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero welcome */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden card p-6 md:p-8
                   bg-gradient-to-br from-zinc-900 via-zinc-900 to-yellow-950/30
                   border-yellow-500/20">
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-medium">¡Bienvenido de vuelta,</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-0.5">
            {user?.displayName} <span className="gold-text">⚽</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">FIFA World Cup 2026 · USA / México / Canadá</p>
          {quinielas.length > 0 && !isParticipant && (
            <Link to="/join" className="inline-flex items-center gap-2 mt-4 btn-gold text-xs py-1.5 px-3">
              <UserPlus size={13} /> Unirme a la quiniela
            </Link>
          )}
        </div>
        <div className="absolute -right-4 -top-4 text-[120px] opacity-5 select-none">🏆</div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy,    label: 'Mis puntos',     value: myPoints,              color: 'yellow' },
          { icon: TrendingUp,label: 'Mi posición',    value: myRank ? `#${myRank}` : '-', color: 'green' },
          { icon: Users,     label: 'Participantes',  value: participants.length,   color: 'blue'   },
          { icon: Globe,     label: 'En vivo',        value: liveMatches.length,    color: 'red'    },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="live-dot" />
            <h2 className="font-bold text-white">Partidos en vivo</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Today's matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Partidos de hoy</h2>
          <button onClick={syncScores} disabled={syncing}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-yellow-400 transition-colors">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {lastSync ? `Sync ${format(lastSync, 'HH:mm')}` : 'Sincronizar'}
          </button>
        </div>
        {todayMatches.length === 0
          ? <div className="card p-8 text-center text-zinc-500 text-sm">No hay partidos programados para hoy</div>
          : <div className="grid md:grid-cols-2 gap-3">
              {todayMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
        }
      </section>

      {/* Top 3 */}
      {participants.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Top del torneo</h2>
          <div className="space-y-2">
            {participants.slice(0, 5).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`card-hover flex items-center gap-4 p-4 ${p.uid === user?.uid ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
                <span className="text-lg font-black w-8 text-center">{['🥇','🥈','🥉'][i] ?? `#${i+1}`}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{p.displayName}</p>
                  <p className="text-xs text-zinc-500">{p.teams?.length ?? 0} selecciones</p>
                </div>
                <span className="text-yellow-400 font-black text-lg">{p.points ?? 0}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
