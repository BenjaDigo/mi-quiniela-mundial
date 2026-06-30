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

// Orden visual de LAST_32: cada entrada es [tlaA, tlaB] del partido.
// Slots 0-7 → camino a Semi A (Cuartos 1 y 3).
// Slots 8-15 → camino a Semi B (Cuartos 2 y 4).
// Los pares adyacentes [0,1],[2,3],... alimentan el mismo partido de 16avos.
const LAST_32_VISUAL_ORDER = [
  ['GER', 'PAR'],  // 0 — llave 1a → L16 537375 home
  ['FRA', 'SWE'],  // 1 — llave 1b → L16 537375 away
  ['RSA', 'CAN'],  // 2 — llave 2a → L16 537376 home
  ['MAR', 'NED'],  // 3 — llave 2b → L16 537376 away
  ['POR', 'CRO'],  // 4 — llave 5a → L16 537380 home
  ['ESP', 'AUT'],  // 5 — llave 5b → L16 537380 away
  ['USA', 'BIH'],  // 6 — llave 6a → L16 537379 home
  ['BEL', 'SEN'],  // 7 — llave 6b → L16 537379 away
  ['BRA', 'JPN'],  // 8  — llave 3a → L16 537377 home
  ['CIV', 'NOR'],  // 9  — llave 3b → L16 537377 away
  ['MEX', 'ECU'],  // 10 — llave 4a → L16 537378 home
  ['ENG', 'COD'],  // 11 — llave 4b → L16 537378 away
  ['ARG', 'CPV'],  // 12 — llave 7a → L16 537381 home
  ['AUS', 'EGY'],  // 13 — llave 7b → L16 537381 away
  ['SUI', 'ALG'],  // 14 — llave 8a → L16 537382 home
  ['COL', 'GHA'],  // 15 — llave 8b → L16 537382 away
]

// Orden visual de LAST_16 por ID, reordenado para que pares adyacentes
// alimenten el cuarto correcto y respeten el camino a semis:
// slots 0+1 → Cuartos 1 → Semi A
// slots 2+3 → Cuartos 3 → Semi A  (¡intercambiados con respecto al orden numérico!)
// slots 4+5 → Cuartos 2 → Semi B
// slots 6+7 → Cuartos 4 → Semi B
const LAST_16_VISUAL_ORDER = [
  '537375', // 0 — Llave 1 → Cuartos 1
  '537376', // 1 — Llave 2 → Cuartos 1
  '537380', // 2 — Llave 5 → Cuartos 3
  '537379', // 3 — Llave 6 → Cuartos 3
  '537377', // 4 — Llave 3 → Cuartos 2
  '537378', // 5 — Llave 4 → Cuartos 2
  '537381', // 6 — Llave 7 → Cuartos 4
  '537382', // 7 — Llave 8 → Cuartos 4
]

export function getBracketSlot(match) {
  if (match.stage === 'LAST_32') {
    const tlas = new Set([match.homeTeam?.tla, match.awayTeam?.tla].filter(Boolean))
    const slot = LAST_32_VISUAL_ORDER.findIndex(pair => pair.every(t => tlas.has(t)))
    return slot >= 0 ? slot : 999
  }
  if (match.stage === 'LAST_16') {
    const slot = LAST_16_VISUAL_ORDER.indexOf(String(match.id))
    return slot >= 0 ? slot : 999
  }
  // Para cuartos en adelante: orden por fecha (ajustar si se conocen los IDs de QF)
  return new Date(match.utcDate).getTime()
}

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
