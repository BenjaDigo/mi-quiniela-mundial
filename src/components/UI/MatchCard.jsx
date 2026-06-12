import { TEAM_MAP } from '../../data/teams'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_LABEL = {
  SCHEDULED:  'Programado',
  TIMED:      'Programado',
  IN_PLAY:    'EN VIVO',
  PAUSED:     'Descanso',
  FINISHED:   'Finalizado',
  POSTPONED:  'Aplazado',
  CANCELLED:  'Cancelado',
}

const STAGE_LABEL = {
  GROUP_STAGE:    'Fase de Grupos',
  ROUND_OF_32:    '32avos de Final',
  ROUND_OF_16:    '16avos de Final',
  QUARTER_FINALS: 'Cuartos de Final',
  SEMI_FINALS:    'Semifinales',
  THIRD_PLACE:    'Tercer Lugar',
  FINAL:          'Gran Final',
}

function TeamSide({ tla, score, side, isMine }) {
  const team = TEAM_MAP[tla]
  const isLeft = side === 'left'
  return (
    <div className={`flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'} flex-1`}>
      <span className="text-3xl">{team?.flag ?? '🏳️'}</span>
      <div className={isLeft ? 'text-left' : 'text-right'}>
        <p className={`font-bold text-sm leading-tight ${isMine ? 'text-yellow-400' : 'text-white'}`}>
          {team?.name ?? tla}
          {isMine && <span className="ml-1 text-yellow-500 text-[10px]">★</span>}
        </p>
        <p className="text-[10px] text-zinc-500">{team?.confederation ?? ''}</p>
      </div>
      {score != null && (
        <span className="text-3xl font-black text-white">{score}</span>
      )}
    </div>
  )
}

export default function MatchCard({ match, myTeams = [] }) {
  const { homeTeam, awayTeam, score, status, utcDate, stage, group } = match

  const homeTLA = homeTeam?.tla ?? homeTeam?.shortName
  const awayTLA = awayTeam?.tla ?? awayTeam?.shortName
  const hs = score?.fullTime?.home
  const as_ = score?.fullTime?.away
  const isLive = status === 'IN_PLAY' || status === 'PAUSED'
  const isFinished = status === 'FINISHED'
  const homeIsMine = myTeams.includes(homeTLA)
  const awayIsMine = myTeams.includes(awayTLA)
  const isMineMatch = homeIsMine || awayIsMine

  let dateStr = ''
  try {
    dateStr = format(new Date(utcDate), "d MMM · HH:mm", { locale: es })
  } catch { dateStr = '' }

  return (
    <div className={`card p-4 transition-all ${
      isLive       ? 'border-red-500/40 bg-red-500/5' :
      isMineMatch  ? 'border-yellow-500/30 bg-yellow-500/5' :
                     'hover:border-zinc-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{STAGE_LABEL[stage] ?? stage} {group ? `· ${group}` : ''}</span>
        <span className={`badge ${
          isLive      ? 'bg-red-500/20 text-red-400' :
          isFinished  ? 'bg-zinc-800 text-zinc-400'  :
                        'bg-zinc-800 text-zinc-500'
        }`}>
          {isLive && <span className="live-dot mr-1.5" />}
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        <TeamSide tla={homeTLA} score={hs} side="left"  isMine={homeIsMine} />
        <div className="text-center shrink-0">
          {!isFinished && !isLive
            ? <p className="text-xs text-zinc-500 font-medium">{dateStr}</p>
            : <span className="text-zinc-500 font-bold">vs</span>
          }
        </div>
        <TeamSide tla={awayTLA} score={as_} side="right" isMine={awayIsMine} />
      </div>
    </div>
  )
}
