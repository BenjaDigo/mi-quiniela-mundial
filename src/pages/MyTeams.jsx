import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useQuiniela } from '../context/QuinielaContext'
import { getParticipants, getAllQuinielas } from '../services/firestoreService'
import { TEAM_MAP } from '../data/teams'
import TeamCard from '../components/UI/TeamCard'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { calcTeamPoints } from '../utils/scoring'

export default function MyTeams() {
  const { user } = useAuth()
  const { matches } = useQuiniela()
  const [myTeams, setMyTeams]     = useState(null)
  const [totalPts, setTotalPts]   = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const quinielas = await getAllQuinielas()
      if (!quinielas.length) { setLoading(false); return }
      const qId = quinielas[0].id
      const participants = await getParticipants(qId)
      const me = participants.find(p => p.uid === user?.uid)
      if (me) {
        setMyTeams(me.teams ?? [])
        const pts = (me.teams ?? []).reduce((acc, code) =>
          acc + calcTeamPoints(code, matches), 0)
        setTotalPts(pts)
      } else {
        setMyTeams([])
      }
      setLoading(false)
    }
    load()
  }, [user, matches])

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
        <p className="text-zinc-500 mt-1 text-sm">Tienes {myTeams.length} equipos — {totalPts} puntos acumulados</p>
      </motion.div>

      {/* Total points banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="card p-5 mb-8 flex items-center gap-5 border-yellow-500/20 bg-yellow-500/5">
        <span className="text-4xl">🏆</span>
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Puntos totales</p>
          <p className="text-4xl font-black gold-text">{totalPts}</p>
        </div>
      </motion.div>

      {/* Teams grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {myTeams.map((code, i) => {
          const pts = calcTeamPoints(code, matches)
          return (
            <motion.div key={code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}>
              <TeamCard code={code} points={pts} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
