import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useQuiniela } from '../../context/QuinielaContext'

export default function PrizePoolBanner({ className = '' }) {
  const { prizePool, quinielaInfo, participants } = useQuiniela()

  if (prizePool == null) return null

  const tarifaMode  = quinielaInfo?.tarifaMode ?? 'fija'
  const tarifa      = quinielaInfo?.tarifa
  const totalTeams  = participants.reduce((s, p) => s + (p.teams?.length ?? 0), 0)
  const totalExtras = participants.reduce((s, p) => s + (p.extrasBought ?? 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl px-5 py-4 ${className}`}
    >
      <Trophy size={22} className="text-yellow-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-400 font-medium">Premio total acumulado</p>
        <p className="text-2xl font-black text-yellow-400 leading-tight">
          ${prizePool.toLocaleString('es-MX')}
        </p>
      </div>
      <div className="text-right text-xs text-zinc-500 shrink-0">
        {tarifaMode === 'por_equipo' ? (
          <>
            <p>{totalTeams} equipo{totalTeams !== 1 ? 's' : ''} asignado{totalTeams !== 1 ? 's' : ''}</p>
            {tarifa && <p>× ${Number(tarifa).toLocaleString('es-MX')}/eq</p>}
          </>
        ) : (
          <>
            <p>{participants.length} participante{participants.length !== 1 ? 's' : ''}</p>
            {totalExtras > 0 && <p>+{totalExtras} extra{totalExtras !== 1 ? 's' : ''}</p>}
            {tarifa && <p>${Number(tarifa).toLocaleString('es-MX')}/persona</p>}
          </>
        )}
      </div>
    </motion.div>
  )
}
