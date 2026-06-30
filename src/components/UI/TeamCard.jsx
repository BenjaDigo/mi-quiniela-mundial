import { TEAM_MAP, CONFEDERATION_COLORS } from '../../data/teams'
import { Star } from 'lucide-react'

export default function TeamCard({ code, points = 0, stage = null, compact = false }) {
  const team = TEAM_MAP[code]
  if (!team) return null

  const gradient = CONFEDERATION_COLORS[team.confederation] ?? 'from-zinc-800 to-zinc-700'

  const stageLabel = {
    ROUND_OF_32:    '32avos',
    ROUND_OF_16:    '16avos',
    QUARTER_FINALS: 'Cuartos',
    SEMI_FINALS:    'Semifinal',
    THIRD_PLACE:    '3er lugar',
    FINAL:          'Final',
    CHAMPION:       '🏆 Campeón',
  }[stage] ?? 'Grupos'

  if (compact) {
    return (
      <div className="card-hover flex items-center gap-3 p-3 cursor-default">
        {team.flagUrl
          ? <img src={team.flagUrl} alt={team.name} width={36} height={24}
              className="object-cover rounded-sm shadow-sm shrink-0" />
          : <span className="text-2xl">{team.flag}</span>
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{team.name}</p>
          <p className="text-xs text-zinc-500">{team.confederation}</p>
        </div>
        <span className="text-yellow-400 font-bold text-sm">{points} pts</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${gradient} transition-all hover:scale-[1.02] hover:border-yellow-500/40`}>
      {/* Bandera como imagen principal en la parte superior */}
      <div className="relative h-24 overflow-hidden">
        {team.flagUrl
          ? <img src={team.flagUrl} alt={team.name}
              className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{team.flag}</div>
        }
        {/* degradado para que el contenido de abajo se funda bien */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />

        {stage === 'CHAMPION' && (
          <div className="absolute top-2 right-2">
            <Star size={16} className="text-yellow-400 fill-yellow-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Info del equipo */}
      <div className="px-4 py-3">
        <p className="font-bold text-white text-sm leading-tight">{team.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{team.confederation}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={`badge text-xs ${
            stage === 'CHAMPION' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-800/80 text-zinc-400'
          }`}>
            {stageLabel}
          </span>
          <span className="text-yellow-400 font-black text-lg">{points}</span>
        </div>
      </div>
    </div>
  )
}
