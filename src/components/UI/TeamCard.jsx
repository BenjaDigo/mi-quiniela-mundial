import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TEAM_MAP, CONFEDERATION_COLORS } from '../../data/teams'
import { Star } from 'lucide-react'

export default function TeamCard({ code, stage = null, compact = false, isAlive = true, nextMatch = null }) {
  const team = TEAM_MAP[code]
  if (!team) return null

  const gradient = CONFEDERATION_COLORS[team.confederation] ?? 'from-zinc-800 to-zinc-700'

  // Rival en el próximo partido
  const opponentTla = nextMatch
    ? (nextMatch.homeTeam?.tla === code ? nextMatch.awayTeam?.tla : nextMatch.homeTeam?.tla)
    : null
  const opponent = opponentTla ? TEAM_MAP[opponentTla] : null

  let matchDateStr = ''
  if (nextMatch?.utcDate) {
    try { matchDateStr = format(new Date(nextMatch.utcDate), "d MMM · HH:mm", { locale: es }) } catch {}
  }

  const linkTo = nextMatch?.utcDate
    ? `/matches?day=${new Date(nextMatch.utcDate).toISOString().slice(0, 10)}`
    : '/matches'

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
      </div>
    )
  }

  const inner = (
    <>
      {/* Bandera */}
      <div className="relative h-24 overflow-hidden">
        {team.flagUrl
          ? <img src={team.flagUrl} alt={team.name} className={`w-full h-full object-cover ${!isAlive ? 'grayscale' : ''}`} />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{team.flag}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />

        {stage === 'CHAMPION' && isAlive && (
          <div className="absolute top-2 right-2">
            <Star size={16} className="text-yellow-400 fill-yellow-400 drop-shadow" />
          </div>
        )}

        {!isAlive && (
          <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
            <span className="text-xl">❌</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className={`font-bold text-sm leading-tight truncate ${!isAlive ? 'text-zinc-500' : 'text-white'}`}>
          {team.name}
        </p>

        <div className="mt-1.5 min-h-[28px]">
          {!isAlive ? (
            <span className="badge text-xs bg-red-500/15 text-red-400">Eliminado</span>
          ) : opponent ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500">vs</span>
                {opponent.flagUrl
                  ? <img src={opponent.flagUrl} width={14} height={9} className="object-cover rounded-sm shrink-0" />
                  : <span className="text-[11px]">{opponent.flag}</span>
                }
                <span className="text-[10px] text-zinc-300 font-medium truncate">{opponent.name}</span>
              </div>
              {matchDateStr && (
                <p className="text-[10px] text-zinc-500">{matchDateStr}</p>
              )}
            </div>
          ) : (
            <span className="badge text-xs bg-zinc-800/80 text-zinc-400">En espera</span>
          )}
        </div>
      </div>
    </>
  )

  if (!isAlive) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${gradient} opacity-50`}>
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={linkTo}
      className={`block relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${gradient} transition-all hover:scale-[1.02] hover:border-yellow-500/40`}
    >
      {inner}
    </Link>
  )
}
