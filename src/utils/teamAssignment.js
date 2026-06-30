import { TEAMS } from '../data/teams'

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const KNOCKOUT_STAGE_ORDER = {
  LAST_32:        1,  // nombre real que usa football-data.org
  LAST_16:        2,
  ROUND_OF_32:    1,  // alias por si ya está cacheado con el nombre anterior
  ROUND_OF_16:    2,
  QUARTER_FINALS: 3,
  SEMI_FINALS:    4,
  THIRD_PLACE:    5,
  FINAL:          5,
}

/**
 * Devuelve los códigos TLA de los equipos que siguen vivos en el torneo.
 * - Si no hay partidos de eliminatoria aún: los 48.
 * - Si los hay: sólo los que clasificaron, restando los eliminados
 *   (perdedor de cada partido terminado; usa score.winner para cubrir penaltis).
 */
export function getAliveTeams(matches) {
  const allCodes = TEAMS.map(t => t.code)
  if (!matches?.length) return allCodes

  const knockoutMatches = matches.filter(m => KNOCKOUT_STAGE_ORDER[m.stage] != null)
  if (!knockoutMatches.length) return allCodes

  // Para cada TLA del API, guardamos el partido de mayor ronda en que aparece
  const teamLastMatch = {}
  knockoutMatches.forEach(m => {
    for (const side of ['homeTeam', 'awayTeam']) {
      const tla = m[side]?.tla
      if (!tla) continue
      const prev = teamLastMatch[tla]
      if (!prev || KNOCKOUT_STAGE_ORDER[m.stage] > KNOCKOUT_STAGE_ORDER[prev.stage]) {
        teamLastMatch[tla] = m
      }
    }
  })

  // TLAs del API que siguen vivos
  const aliveTlas = new Set(
    Object.keys(teamLastMatch).filter(tla => {
      const m = teamLastMatch[tla]
      if (m.status !== 'FINISHED') return true
      const winner = m.score?.winner
      if (!winner || winner === 'DRAW') return true
      return (winner === 'HOME_TEAM' && m.homeTeam?.tla === tla) ||
             (winner === 'AWAY_TEAM' && m.awayTeam?.tla === tla)
    })
  )

  // Devolvemos nuestros propios códigos (garantizados en TEAM_MAP) que coincidan con los TLA vivos.
  // Esto evita que códigos del API que difieran de teams.js entren al pool sin nombre/bandera.
  return allCodes.filter(code => aliveTlas.has(code))
}

/**
 * Distribuye equipos entre participantes.
 * @param {string[]} participantIds
 * @param {string[]|null} teamCodes       — pool a repartir; null = los 48
 * @param {number|null}   perPersonOverride — fuerza N equipos por persona (p.ej. 1 en modo por_equipo)
 * Devuelve { assignment, extraTeams, perPerson }
 */
export function assignTeams(participantIds, teamCodes = null, perPersonOverride = null) {
  if (!participantIds?.length) return { assignment: {}, extraTeams: [], perPerson: 0 }

  const pool      = teamCodes ?? TEAMS.map(t => t.code)
  const shuffled  = shuffle(pool)
  const perPerson = perPersonOverride ?? Math.floor(shuffled.length / participantIds.length)
  const total     = perPerson * participantIds.length
  const assignment = {}

  participantIds.forEach((id, idx) => {
    assignment[id] = shuffled.slice(idx * perPerson, (idx + 1) * perPerson)
  })

  return { assignment, extraTeams: shuffled.slice(total), perPerson }
}
