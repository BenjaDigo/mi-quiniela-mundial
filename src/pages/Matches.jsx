import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RefreshCw, List, GitBranch, Users } from 'lucide-react'
import { useQuiniela } from '../context/QuinielaContext'
import { useAuth } from '../context/AuthContext'
import MatchCard from '../components/UI/MatchCard'
import MatchCardOwner from '../components/UI/MatchCardOwner'
import BracketView from '../components/UI/BracketView'
import PoolTeams from '../components/UI/PoolTeams'
import { getUserTeams, listenParticipants } from '../services/firestoreService'
import { format, isSameDay, isToday, isYesterday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

function dayLabel(d) {
  if (isToday(d))     return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  if (isTomorrow(d))  return 'Mañana'
  return format(d, "EEE d MMM", { locale: es })
}

function shiftDay(d, delta) {
  const n = new Date(d)
  n.setDate(n.getDate() + delta)
  return n
}

function MatchGrid({ matches, myTeams, emptyText }) {
  if (matches.length === 0)
    return <div className="card p-8 text-center text-zinc-500 text-sm">{emptyText}</div>
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {matches.map((m, i) => (
        <motion.div key={m.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
          <MatchCard match={m} myTeams={myTeams} />
        </motion.div>
      ))}
    </div>
  )
}

function OwnerGrid({ matches, teamOwnerMap, currentUid, emptyText }) {
  if (matches.length === 0)
    return <div className="card p-8 text-center text-zinc-500 text-sm">{emptyText}</div>
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {matches.map((m, i) => (
        <motion.div key={m.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
          <MatchCardOwner match={m} teamOwnerMap={teamOwnerMap} currentUid={currentUid} />
        </motion.div>
      ))}
    </div>
  )
}

export default function Matches() {
  const { matches, syncing, lastSync, syncScores, activeQuinielaId } = useQuiniela()
  const { user } = useAuth()
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [myTeams, setMyTeams]         = useState([])
  const [participants, setParticipants] = useState([])
  const [view, setView]               = useState('list')

  useEffect(() => {
    if (user) getUserTeams(user.uid).then(setMyTeams)
  }, [user])

  useEffect(() => {
    if (!activeQuinielaId) return
    return listenParticipants(activeQuinielaId, setParticipants)
  }, [activeQuinielaId])

  // Mapa: código de equipo → participante dueño
  const teamOwnerMap = useMemo(() => {
    const map = {}
    participants.forEach(p => {
      ;(p.teams ?? []).forEach(code => { map[code] = p })
    })
    return map
  }, [participants])

  const myTeamMatches = useMemo(() => {
    if (!myTeams.length) return []
    return matches
      .filter(m => myTeams.includes(m.homeTeam?.tla) || myTeams.includes(m.awayTeam?.tla))
      .sort((a, b) => {
        const order = { IN_PLAY: 0, PAUSED: 0, FINISHED: 1, TIMED: 2, SCHEDULED: 2 }
        const diff = (order[a.status] ?? 2) - (order[b.status] ?? 2)
        return diff !== 0 ? diff : new Date(a.utcDate) - new Date(b.utcDate)
      })
  }, [matches, myTeams])

  const dayMatches = useMemo(() =>
    matches
      .filter(m => { try { return isSameDay(new Date(m.utcDate), selectedDay) } catch { return false } })
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
    [matches, selectedDay]
  )

  const VIEWS = [
    { key: 'list',     label: 'Lista',    Icon: List },
    { key: 'quiniela', label: 'Quiniela', Icon: Users },
    { key: 'bracket',  label: 'Cuadro',   Icon: GitBranch },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-white">Partidos</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{matches.length} partidos · Mundial 2026</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle de vista */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              {VIEWS.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setView(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    view === key ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            <button onClick={syncScores} disabled={syncing}
              className="flex items-center gap-2 btn-outline text-xs">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : lastSync ? `Actualizado ${format(lastSync, 'HH:mm')}` : 'Sincronizar'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── VISTA CUADRO ── */}
      {view === 'bracket' && (
        <section>
          <h2 className="section-title mb-1">Cuadro Eliminatorio</h2>
          <p className="text-zinc-500 text-xs mb-5">
            Fase de eliminación directa · tus equipos marcados en dorado
          </p>
          <BracketView matches={matches} myTeams={myTeams} />
        </section>
      )}

      {/* ── VISTA LISTA ── */}
      {view === 'list' && (
        <>
          <PoolTeams />

          <section>
            <h2 className="section-title mb-1">Mis Equipos</h2>
            <p className="text-zinc-500 text-xs mb-4">
              {myTeams.length
                ? `${myTeams.length} equipos asignados · los equipos marcados con ★ son tuyos`
                : 'Aún no tienes equipos asignados en ninguna quiniela'}
            </p>
            <MatchGrid
              matches={myTeamMatches}
              myTeams={myTeams}
              emptyText={myTeams.length ? 'Ninguno de tus equipos ha jugado todavía.' : 'Únete a una quiniela para ver tus equipos aquí.'}
            />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setSelectedDay(d => shiftDay(d, -1))} className="btn-outline p-2 rounded-xl">
                <ChevronLeft size={16} />
              </button>
              <div className="flex-1 text-center">
                <h2 className="section-title inline">{dayLabel(selectedDay)}</h2>
                <span className="text-zinc-500 text-sm ml-2">
                  {format(selectedDay, "d MMM yyyy", { locale: es })} · {dayMatches.length} partidos
                </span>
              </div>
              <button onClick={() => setSelectedDay(d => shiftDay(d, 1))} className="btn-outline p-2 rounded-xl">
                <ChevronRight size={16} />
              </button>
            </div>
            <MatchGrid matches={dayMatches} myTeams={myTeams} emptyText="No hay partidos este día." />
          </section>
        </>
      )}

      {/* ── VISTA QUINIELA ── */}
      {view === 'quiniela' && (
        <>
          <section>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setSelectedDay(d => shiftDay(d, -1))} className="btn-outline p-2 rounded-xl">
                <ChevronLeft size={16} />
              </button>
              <div className="flex-1 text-center">
                <h2 className="section-title inline">{dayLabel(selectedDay)}</h2>
                <span className="text-zinc-500 text-sm ml-2">
                  {format(selectedDay, "d MMM yyyy", { locale: es })} · {dayMatches.length} partidos
                </span>
              </div>
              <button onClick={() => setSelectedDay(d => shiftDay(d, 1))} className="btn-outline p-2 rounded-xl">
                <ChevronRight size={16} />
              </button>
            </div>
            <OwnerGrid
              matches={dayMatches}
              teamOwnerMap={teamOwnerMap}
              currentUid={user?.uid}
              emptyText="No hay partidos este día."
            />
          </section>
        </>
      )}

    </div>
  )
}
