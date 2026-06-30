import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useQuiniela } from '../context/QuinielaContext'
import { getParticipants, getActiveQuinielaId } from '../services/firestoreService'
import { getAliveTeams } from '../utils/teamAssignment'
import TeamCard from '../components/UI/TeamCard'
import PoolTeams from '../components/UI/PoolTeams'
import PrizePoolBanner from '../components/UI/PrizePoolBanner'
import LoadingSpinner from '../components/UI/LoadingSpinner'

export default function MyTeams() {
  const { user } = useAuth()
  const { matches } = useQuiniela()
  const [myTeams, setMyTeams] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const qId = await getActiveQuinielaId(user.uid)
      if (!qId) { setMyTeams([]); setLoading(false); return }
      const participants = await getParticipants(qId)
      const me = participants.find(p => p.uid === user?.uid)
      setMyTeams(me?.teams ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  // Equipos que siguen vivos en el torneo
  const aliveSet = useMemo(() => new Set(getAliveTeams(matches)), [matches])

  // Próximo partido (o en curso) por equipo
  const nextMatchMap = useMemo(() => {
    const map = {}
    ;(myTeams ?? []).forEach(code => {
      const upcoming = matches
        .filter(m =>
          (m.homeTeam?.tla === code || m.awayTeam?.tla === code) &&
          (m.status === 'SCHEDULED' || m.status === 'TIMED' ||
           m.status === 'IN_PLAY'   || m.status === 'PAUSED')
        )
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      map[code] = upcoming[0] ?? null
    })
    return map
  }, [myTeams, matches])

  // Vivos primero, eliminados al final
  const sortedTeams = useMemo(() => {
    if (!myTeams) return []
    return [...myTeams].sort((a, b) => {
      const aElim = aliveSet.has(a) ? 0 : 1
      const bElim = aliveSet.has(b) ? 0 : 1
      return aElim - bElim
    })
  }, [myTeams, aliveSet])

  const eliminated = sortedTeams.filter(c => !aliveSet.has(c))

  if (loading) return <LoadingSpinner text="Cargando tus selecciones..." />

  if (!myTeams?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">Aún sin selecciones asignadas</h2>
        <p className="text-zinc-500 text-sm">El admin debe asignar los equipos antes de que puedas verlos aquí.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white">Mis selecciones</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {myTeams.length} selecciones
          {eliminated.length > 0 && ` · ${eliminated.length} eliminada${eliminated.length > 1 ? 's' : ''}`}
        </p>
      </motion.div>

      {/* Premio y pool */}
      <PrizePoolBanner className="mb-4" />
      <PoolTeams className="mb-8" />

      {/* Teams grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sortedTeams.map((code, i) => (
          <motion.div key={code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}>
            <TeamCard
              code={code}
              isAlive={aliveSet.has(code)}
              nextMatch={nextMatchMap[code]}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
