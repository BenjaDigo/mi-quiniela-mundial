import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { listenParticipants, getAllQuinielas } from '../services/firestoreService'
import { TEAM_MAP } from '../data/teams'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const MEDALS = ['🥇', '🥈', '🥉']

function Row({ participant, rank, isMe }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all
        ${isMe
          ? 'border-yellow-500/40 bg-yellow-500/8 shadow-lg shadow-yellow-500/10'
          : 'border-zinc-800/60 bg-zinc-900 hover:border-zinc-700'
        }`}
    >
      {/* Rank */}
      <div className="w-10 text-center shrink-0">
        {rank <= 3
          ? <span className="text-xl">{MEDALS[rank - 1]}</span>
          : <span className={`text-sm font-bold ${isMe ? 'text-yellow-400' : 'text-zinc-500'}`}>#{rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm
        ${isMe ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
        {(participant.displayName?.[0] ?? '?').toUpperCase()}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate text-sm ${isMe ? 'text-yellow-300' : 'text-white'}`}>
          {participant.displayName}
          {isMe && <span className="ml-1.5 text-xs text-yellow-500/70">(tú)</span>}
        </p>
        {/* Teams preview */}
        <p className="text-xs text-zinc-500 mt-0.5 truncate">
          {(participant.teams ?? []).slice(0, 6).map(c => TEAM_MAP[c]?.flag ?? '').join(' ')}
          {(participant.teams?.length ?? 0) > 6 && ` +${participant.teams.length - 6}`}
        </p>
      </div>

      {/* Teams count */}
      <div className="text-center hidden sm:block shrink-0">
        <p className="text-xs text-zinc-500">Equipos</p>
        <p className="font-bold text-zinc-300 text-sm">{participant.teams?.length ?? 0}</p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <p className="text-xs text-zinc-500">Puntos</p>
        <p className={`text-xl font-black ${isMe ? 'text-yellow-400' : 'text-white'}`}>
          {participant.points ?? 0}
        </p>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]           = useState(true)
  const [quinielaName, setQuinielName]  = useState('')

  useEffect(() => {
    async function load() {
      const qs = await getAllQuinielas()
      if (!qs.length) { setLoading(false); return }
      setQuinielName(qs[0].name ?? 'Quiniela Mundial')
      const unsub = listenParticipants(qs[0].id, ps => {
        setParticipants(ps)
        setLoading(false)
      })
      return unsub
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner text="Cargando clasificación..." />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-black text-white">{quinielaName}</h1>
        <p className="text-zinc-500 mt-1 text-sm">{participants.length} participantes · Clasificación en tiempo real</p>
      </motion.div>

      {/* Podium top 3 */}
      {participants.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 0, 2].map((idx) => {
            const p = participants[idx]
            if (!p) return null
            const isFirst = idx === 0
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`card text-center p-4 ${isFirst ? 'border-yellow-500/40 bg-yellow-500/5 -mt-4' : ''}`}>
                <div className="text-2xl mb-1">{MEDALS[idx]}</div>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-black
                  ${isFirst ? 'bg-yellow-500 text-black text-lg' : 'bg-zinc-800 text-zinc-300 text-sm'}`}>
                  {(p.displayName?.[0] ?? '?').toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-white truncate">{p.displayName}</p>
                <p className={`font-black mt-1 ${isFirst ? 'text-2xl gold-text' : 'text-lg text-zinc-300'}`}>
                  {p.points ?? 0}
                </p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        <AnimatePresence>
          {participants.map((p, i) => (
            <Row key={p.id} participant={p} rank={i + 1} isMe={p.uid === user?.uid} />
          ))}
        </AnimatePresence>
        {participants.length === 0 && (
          <div className="card p-10 text-center text-zinc-500 text-sm">
            Aún no hay participantes inscritos.
          </div>
        )}
      </div>
    </div>
  )
}
