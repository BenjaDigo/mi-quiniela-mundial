// Mapa fijo: qué par de equipos de LAST_32 alimenta cada slot home/away de LAST_16
// IDs confirmados consultando la API de football-data.org
const BRACKET_PAIRS = [
  { home: ['PAR', 'GER'], away: ['FRA', 'SWE'], last16Id: '537375' },
  { home: ['CAN', 'RSA'], away: ['MAR', 'NED'], last16Id: '537376' },
  { home: ['BRA', 'JPN'], away: ['CIV', 'NOR'], last16Id: '537377' },
  { home: ['MEX', 'ECU'], away: ['ENG', 'COD'], last16Id: '537378' },
  { home: ['USA', 'BIH'], away: ['BEL', 'SEN'], last16Id: '537379' },
  { home: ['POR', 'CRO'], away: ['ESP', 'AUT'], last16Id: '537380' },
  { home: ['ARG', 'CPV'], away: ['AUS', 'EGY'], last16Id: '537381' },
  { home: ['SUI', 'ALG'], away: ['COL', 'GHA'], last16Id: '537382' },
]

function getWinnerTla(match) {
  if (match.status !== 'FINISHED') return null
  const w = match.score?.winner
  if (!w || w === 'DRAW') return null
  return w === 'HOME_TEAM' ? match.homeTeam?.tla : match.awayTeam?.tla
}

/**
 * Rellena los slots vacíos de LAST_16 con los ganadores calculados de LAST_32.
 * Solo toca campos donde la API aún no tiene equipo (tla vacío).
 * Marca los calculados con _homeCalc / _awayCalc para mostrarlos diferente en la UI.
 */
export function resolveBracket(matches) {
  const last32 = matches.filter(m => m.stage === 'LAST_32')
  const last16Map = Object.fromEntries(
    matches.filter(m => m.stage === 'LAST_16').map(m => [String(m.id), m])
  )

  // Construir mapa de ganadores TLA → objeto equipo
  const winners = {}
  for (const m of last32) {
    const tla = getWinnerTla(m)
    if (tla) {
      winners[tla] = m.score?.winner === 'HOME_TEAM' ? m.homeTeam : m.awayTeam
    }
  }

  const patches = {}
  for (const pair of BRACKET_PAIRS) {
    const l16 = last16Map[pair.last16Id]
    if (!l16) continue

    const patch = {}

    if (!l16.homeTeam?.tla) {
      const winnerTla = pair.home.find(tla => winners[tla])
      if (winnerTla) {
        patch.homeTeam = { ...winners[winnerTla], tla: winnerTla }
        patch._homeCalc = true
      }
    }

    if (!l16.awayTeam?.tla) {
      const winnerTla = pair.away.find(tla => winners[tla])
      if (winnerTla) {
        patch.awayTeam = { ...winners[winnerTla], tla: winnerTla }
        patch._awayCalc = true
      }
    }

    if (Object.keys(patch).length > 0) {
      patches[pair.last16Id] = patch
    }
  }

  return matches.map(m => {
    const p = patches[String(m.id)]
    return p ? { ...m, ...p } : m
  })
}
