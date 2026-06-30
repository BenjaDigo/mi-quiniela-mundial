// Sistema de puntos de la quiniela
export const DEFAULT_SCORING = {
  groupWin:    3,   // victoria en fase de grupos
  groupDraw:   1,   // empate en fase de grupos
  r32:         2,   // clasificar a 32vos de final
  r16:         3,   // ganar en 32vos (pasar a 16avos)
  qf:          5,   // ganar en 16avos (pasar a cuartos)
  sf:          8,   // ganar en cuartos (pasar a semis)
  runnerUp:   10,   // llegar a la final
  champion:   20,   // ganar el mundial
}

export const SCORING_LABELS = {
  groupWin:   'Victoria en grupos',
  groupDraw:  'Empate en grupos',
  r32:        'Clasificar a 32avos',
  r16:        'Pasar a 16avos',
  qf:         'Pasar a cuartos',
  sf:         'Pasar a semis',
  runnerUp:   'Llegar a la final',
  champion:   '¡CAMPEÓN!',
}

export function calcTeamPoints(team, matches, stage, scoring = DEFAULT_SCORING) {
  let pts = 0
  for (const m of matches) {
    if (m.status !== 'FINISHED') continue
    const isHome = m.homeTeam?.shortName === team || m.homeTeam?.tla === team
    const isAway = m.awayTeam?.shortName === team || m.awayTeam?.tla === team
    if (!isHome && !isAway) continue
    const hs = m.score?.fullTime?.home ?? 0
    const as_ = m.score?.fullTime?.away ?? 0

    if (m.stage === 'GROUP_STAGE') {
      if (isHome) {
        if (hs > as_) pts += scoring.groupWin
        else if (hs === as_) pts += scoring.groupDraw
      } else {
        if (as_ > hs) pts += scoring.groupWin
        else if (hs === as_) pts += scoring.groupDraw
      }
    }
  }

  const stageBonus = {
    LAST_32:          scoring.r32,
    LAST_16:          scoring.r16,
    ROUND_OF_32:      scoring.r32,  // alias por si está cacheado con nombre anterior
    ROUND_OF_16:      scoring.r16,
    QUARTER_FINALS:   scoring.qf,
    SEMI_FINALS:      scoring.sf,
    THIRD_PLACE:      scoring.sf,
    FINAL:            scoring.runnerUp,
  }

  if (stage && stageBonus[stage]) pts += stageBonus[stage]
  if (stage === 'CHAMPION') pts += scoring.champion
  return pts
}

export function calcParticipantPoints(participant, matches, teamStages, scoring = DEFAULT_SCORING) {
  if (!participant?.teams) return 0
  return participant.teams.reduce((total, teamCode) => {
    return total + calcTeamPoints(teamCode, matches, teamStages?.[teamCode] ?? null, scoring)
  }, 0)
}
