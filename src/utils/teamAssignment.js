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

/**
 * Distribuye los 48 equipos entre los participantes de forma aleatoria.
 * Si no caben equipos enteros, los sobrantes se ignoran.
 * Devuelve { [userId]: string[] } donde cada valor es un array de códigos de equipo.
 */
/**
 * Distribuye los 48 equipos entre participantes.
 * Devuelve { assignment, extraTeams, perPerson }
 * - assignment:  { [uid]: string[] }
 * - extraTeams:  string[]  — los que sobran (48 % n != 0)
 * - perPerson:   number    — equipos base por participante
 */
export function assignTeams(participantIds) {
  if (!participantIds?.length) return { assignment: {}, extraTeams: [], perPerson: 0 }

  const shuffled  = shuffle(TEAMS.map(t => t.code))
  const perPerson = Math.floor(shuffled.length / participantIds.length)
  const total     = perPerson * participantIds.length
  const assignment = {}

  participantIds.forEach((id, idx) => {
    assignment[id] = shuffled.slice(idx * perPerson, (idx + 1) * perPerson)
  })

  return { assignment, extraTeams: shuffled.slice(total), perPerson }
}
