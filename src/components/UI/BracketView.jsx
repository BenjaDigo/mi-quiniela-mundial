import { useMemo } from 'react'
import { TEAM_MAP } from '../../data/teams'
import { getBracketSlot } from '../../utils/bracketResolver'
import TeamCrest from './TeamCrest'

const CARD_H = 54
const CARD_W = 156
const GAP    = 56   // espacio entre columnas (donde van las líneas)
const UNIT   = 72   // altura de un "slot" base
const TOTAL  = 16 * UNIT  // 1152px altura total

const ROUNDS = [
  { key: 'LAST_32',        label: '32avos', count: 16 },
  { key: 'LAST_16',        label: '16avos', count: 8  },
  { key: 'QUARTER_FINALS', label: 'Cuartos', count: 4  },
  { key: 'SEMI_FINALS',    label: 'Semis',   count: 2  },
  { key: 'FINAL',          label: 'Final',   count: 1  },
]

// Centro vertical del match i en la ronda r
function cy(r, i) {
  const slot = Math.pow(2, r) * UNIT
  return i * slot + slot / 2
}

function BracketCard({ match, myTeams }) {
  const hTLA = match?.homeTeam?.tla
  const aTLA = match?.awayTeam?.tla
  const hs   = match?.score?.fullTime?.home
  const as_  = match?.score?.fullTime?.away
  const live = match?.status === 'IN_PLAY' || match?.status === 'PAUSED'
  const done = match?.status === 'FINISHED'
  const hMine = myTeams.includes(hTLA)
  const aMine = myTeams.includes(aTLA)

  // winner: para terminados usa score.winner (cubre penales), fallback a goles
  const winner = match?.score?.winner
  const hWins = done && (winner === 'HOME_TEAM' || (!winner && hs != null && hs > as_))
  const aWins = done && (winner === 'AWAY_TEAM' || (!winner && as_ != null && as_ > hs))
  const hLeads = live && hs != null && as_ != null && hs > as_
  const aLeads = live && hs != null && as_ != null && as_ > hs

  function Row({ tla, score, isMine, isGreen }) {
    const t = TEAM_MAP[tla]
    return (
      <div className={`flex items-center justify-between px-2.5 gap-1.5 ${
        isGreen ? 'bg-green-500/15' : isMine ? 'bg-yellow-500/10' : ''
      }`} style={{ height: (CARD_H - 1) / 2 }}>
        <div className="flex items-center gap-1.5 min-w-0">
          {t && <TeamCrest team={t} size={14} className="shrink-0" />}
          <span className={`text-[11px] font-semibold truncate leading-none ${
            isGreen ? 'text-green-400' : isMine ? 'text-yellow-400' : tla ? 'text-white' : 'text-zinc-600'
          }`}>
            {t ? t.name : tla ?? 'Por definir'}
          </span>
        </div>
        {(done || live) && tla && (
          <span className={`text-xs font-black ml-1 shrink-0 ${isGreen ? 'text-green-400' : 'text-white'}`}>
            {score ?? 0}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${
      live            ? 'border-red-500/60 bg-zinc-900' :
      (hMine || aMine) ? 'border-yellow-500/40 bg-zinc-900' :
                         'border-zinc-700/70 bg-zinc-900'
    }`} style={{ width: CARD_W, height: CARD_H }}>
      <Row tla={hTLA} score={hs} isMine={hMine} isGreen={hWins || hLeads} />
      <div className="border-t border-zinc-800" />
      <Row tla={aTLA} score={as_} isMine={aMine} isGreen={aWins || aLeads} />
    </div>
  )
}

export default function BracketView({ matches, myTeams = [] }) {
  const byRound = useMemo(() => {
    const g = {}
    for (const m of matches) {
      if (!g[m.stage]) g[m.stage] = []
      g[m.stage].push(m)
    }
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => getBracketSlot(a) - getBracketSlot(b))
    }
    return g
  }, [matches])

  // Rellena con placeholders si faltan matches en la ronda
  function getRoundMatches(round) {
    const real = byRound[round.key] ?? []
    const fill = Math.max(0, round.count - real.length)
    return [...real, ...Array(fill).fill(null)]
  }

  const totalW = ROUNDS.length * CARD_W + (ROUNDS.length - 1) * GAP

  // Líneas SVG de conexión entre rondas
  const svgLines = useMemo(() => {
    const lines = []
    ROUNDS.forEach((round, rIdx) => {
      if (rIdx === ROUNDS.length - 1) return
      const roundMatches = getRoundMatches(round)
      const pairs = Math.floor(roundMatches.length / 2)
      for (let j = 0; j < pairs; j++) {
        const x0  = rIdx * (CARD_W + GAP) + CARD_W
        const xM  = x0 + GAP / 2
        const x1  = x0 + GAP
        const yA  = cy(rIdx, 2 * j)
        const yB  = cy(rIdx, 2 * j + 1)
        const yMid = cy(rIdx + 1, j)
        lines.push(
          <g key={`${rIdx}-${j}`} stroke="#3f3f46" strokeWidth={1.5} fill="none">
            <line x1={x0} y1={yA}   x2={xM} y2={yA}   />
            <line x1={x0} y1={yB}   x2={xM} y2={yB}   />
            <line x1={xM} y1={yA}   x2={xM} y2={yB}   />
            <line x1={xM} y1={yMid} x2={x1} y2={yMid} />
          </g>
        )
      }
    })
    return lines
  }, [byRound])

  return (
    <div className="overflow-x-auto pb-6 select-none">
      {/* Cabeceras de columna */}
      <div className="flex mb-4" style={{ width: totalW }}>
        {ROUNDS.map((r, i) => (
          <div key={r.key}
            style={{ width: CARD_W, marginRight: i < ROUNDS.length - 1 ? GAP : 0 }}
            className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            {r.label}
          </div>
        ))}
      </div>

      {/* Cuadro */}
      <div style={{ position: 'relative', width: totalW, height: TOTAL }}>
        {/* Líneas de conexión */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
             width={totalW} height={TOTAL}>
          {svgLines}
        </svg>

        {/* Tarjetas */}
        {ROUNDS.map((round, rIdx) =>
          getRoundMatches(round).map((m, i) => (
            <div key={m?.id ?? `${rIdx}-${i}`} style={{
              position: 'absolute',
              left: rIdx * (CARD_W + GAP),
              top: cy(rIdx, i) - CARD_H / 2,
            }}>
              <BracketCard match={m} myTeams={myTeams} />
            </div>
          ))
        )}
      </div>

      {/* Tercer lugar */}
      {(byRound['THIRD_PLACE'] ?? []).length > 0 && (
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Tercer Lugar
          </p>
          <BracketCard match={byRound['THIRD_PLACE'][0]} myTeams={myTeams} />
        </div>
      )}
    </div>
  )
}
