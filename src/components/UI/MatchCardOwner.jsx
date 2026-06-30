import { TEAM_MAP } from '../../data/teams'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_LABEL = {
  SCHEDULED: 'Programado',
  TIMED:     'Programado',
  IN_PLAY:   'EN VIVO',
  PAUSED:    'Descanso',
  FINISHED:  'Finalizado',
}

const STAGE_LABEL = {
  GROUP_STAGE:    'Fase de Grupos',
  ROUND_OF_32:    '32avos',
  ROUND_OF_16:    '16avos',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS:    'Semis',
  THIRD_PLACE:    '3er Lugar',
  FINAL:          'Final',
}

function Avatar({ participant, isMe }) {
  if (!participant) {
    return (
      <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700
                      flex items-center justify-center mx-auto text-zinc-600 text-xl">
        ?
      </div>
    )
  }
  return (
    <div className={`w-14 h-14 rounded-full mx-auto overflow-hidden border-2 shadow-lg
      ${isMe ? 'border-yellow-400 shadow-yellow-500/20' : 'border-zinc-600'}`}>
      {participant.photoURL
        ? <img src={participant.photoURL} alt={participant.displayName}
            className="w-full h-full object-cover" />
        : <div className={`w-full h-full flex items-center justify-center font-black text-xl
            ${isMe ? 'bg-yellow-500 text-black' : 'bg-zinc-700 text-white'}`}>
            {(participant.displayName?.[0] ?? '?').toUpperCase()}
          </div>
      }
    </div>
  )
}

function OwnerSide({ tla, participant, isMe, align }) {
  const team = TEAM_MAP[tla]
  const isLeft = align === 'left'

  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <Avatar participant={participant} isMe={isMe} />

      <p className={`text-sm font-bold text-center truncate w-full px-1 ${
        isMe        ? 'text-yellow-400' :
        participant ? 'text-white' :
                     'text-zinc-600 italic'
      }`}>
        {participant?.displayName ?? 'Sin dueño'}
        {isMe && <span className="ml-1 text-yellow-500">★</span>}
      </p>

      {team && (
        <div className={`flex items-center gap-1.5 ${isLeft ? '' : 'flex-row-reverse'}`}>
          {team.flagUrl
            ? <img src={team.flagUrl} width={22} height={15}
                className="object-cover rounded-sm shadow-sm shrink-0" />
            : <span className="text-sm">{team.flag}</span>
          }
          <span className="text-xs text-zinc-400 truncate">{team?.name ?? tla}</span>
        </div>
      )}
    </div>
  )
}

export default function MatchCardOwner({ match, teamOwnerMap = {}, currentUid }) {
  const { homeTeam, awayTeam, score, status, utcDate, stage, group } = match
  const homeTLA   = homeTeam?.tla ?? homeTeam?.shortName
  const awayTLA   = awayTeam?.tla ?? awayTeam?.shortName
  const hs        = score?.fullTime?.home
  const as_       = score?.fullTime?.away
  const isLive    = status === 'IN_PLAY' || status === 'PAUSED'
  const isFinished = status === 'FINISHED'

  const homeOwner = teamOwnerMap[homeTLA]
  const awayOwner = teamOwnerMap[awayTLA]
  const isMine    = homeOwner?.uid === currentUid || awayOwner?.uid === currentUid

  let dateStr = ''
  try { dateStr = format(new Date(utcDate), 'HH:mm', { locale: es }) } catch {}

  return (
    <div className={`card p-5 transition-all ${
      isLive   ? 'border-red-500/40 bg-red-500/5' :
      isMine   ? 'border-yellow-500/30 bg-yellow-500/5' :
                 'hover:border-zinc-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-zinc-500">
          {STAGE_LABEL[stage] ?? stage}{group ? ` · ${group}` : ''}
        </span>
        <span className={`badge ${
          isLive     ? 'bg-red-500/20 text-red-400' :
          isFinished ? 'bg-zinc-800 text-zinc-400' :
                       'bg-zinc-800 text-zinc-500'
        }`}>
          {isLive && <span className="live-dot mr-1.5" />}
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {/* Duelo */}
      <div className="flex items-center gap-2">
        <OwnerSide tla={homeTLA} participant={homeOwner} isMe={homeOwner?.uid === currentUid} align="left" />

        <div className="shrink-0 flex flex-col items-center gap-1 w-16">
          {isFinished || isLive
            ? <span className="text-2xl font-black text-white tabular-nums">{hs ?? 0}–{as_ ?? 0}</span>
            : <span className="text-xl font-black text-zinc-500">vs</span>
          }
          {!isFinished && !isLive && (
            <span className="text-[11px] text-zinc-600">{dateStr}</span>
          )}
        </div>

        <OwnerSide tla={awayTLA} participant={awayOwner} isMe={awayOwner?.uid === currentUid} align="right" />
      </div>
    </div>
  )
}
