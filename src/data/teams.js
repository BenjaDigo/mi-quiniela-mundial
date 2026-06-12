// 48 selecciones clasificadas al Mundial 2026
export const TEAMS = [
  // CONMEBOL (6)
  { code: 'ARG', name: 'Argentina',    flag: '🇦🇷', confederation: 'CONMEBOL' },
  { code: 'BRA', name: 'Brasil',       flag: '🇧🇷', confederation: 'CONMEBOL' },
  { code: 'COL', name: 'Colombia',     flag: '🇨🇴', confederation: 'CONMEBOL' },
  { code: 'URU', name: 'Uruguay',      flag: '🇺🇾', confederation: 'CONMEBOL' },
  { code: 'ECU', name: 'Ecuador',      flag: '🇪🇨', confederation: 'CONMEBOL' },
  { code: 'VEN', name: 'Venezuela',    flag: '🇻🇪', confederation: 'CONMEBOL' },

  // CONCACAF (6) — USA, México y Canadá son anfitriones
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', confederation: 'CONCACAF' },
  { code: 'MEX', name: 'México',         flag: '🇲🇽', confederation: 'CONCACAF' },
  { code: 'CAN', name: 'Canadá',         flag: '🇨🇦', confederation: 'CONCACAF' },
  { code: 'PAN', name: 'Panamá',         flag: '🇵🇦', confederation: 'CONCACAF' },
  { code: 'HON', name: 'Honduras',       flag: '🇭🇳', confederation: 'CONCACAF' },
  { code: 'CRC', name: 'Costa Rica',     flag: '🇨🇷', confederation: 'CONCACAF' },

  // UEFA (16)
  { code: 'GER', name: 'Alemania',     flag: '🇩🇪', confederation: 'UEFA' },
  { code: 'FRA', name: 'Francia',      flag: '🇫🇷', confederation: 'UEFA' },
  { code: 'ESP', name: 'España',       flag: '🇪🇸', confederation: 'UEFA' },
  { code: 'ENG', name: 'Inglaterra',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { code: 'POR', name: 'Portugal',     flag: '🇵🇹', confederation: 'UEFA' },
  { code: 'NED', name: 'Países Bajos', flag: '🇳🇱', confederation: 'UEFA' },
  { code: 'BEL', name: 'Bélgica',      flag: '🇧🇪', confederation: 'UEFA' },
  { code: 'CRO', name: 'Croacia',      flag: '🇭🇷', confederation: 'UEFA' },
  { code: 'POL', name: 'Polonia',      flag: '🇵🇱', confederation: 'UEFA' },
  { code: 'SUI', name: 'Suiza',        flag: '🇨🇭', confederation: 'UEFA' },
  { code: 'AUT', name: 'Austria',      flag: '🇦🇹', confederation: 'UEFA' },
  { code: 'SRB', name: 'Serbia',       flag: '🇷🇸', confederation: 'UEFA' },
  { code: 'DEN', name: 'Dinamarca',    flag: '🇩🇰', confederation: 'UEFA' },
  { code: 'SCO', name: 'Escocia',      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA' },
  { code: 'TUR', name: 'Turquía',      flag: '🇹🇷', confederation: 'UEFA' },
  { code: 'UKR', name: 'Ucrania',      flag: '🇺🇦', confederation: 'UEFA' },

  // CAF — África (9)
  { code: 'MAR', name: 'Marruecos',    flag: '🇲🇦', confederation: 'CAF' },
  { code: 'NGA', name: 'Nigeria',      flag: '🇳🇬', confederation: 'CAF' },
  { code: 'SEN', name: 'Senegal',      flag: '🇸🇳', confederation: 'CAF' },
  { code: 'EGY', name: 'Egipto',       flag: '🇪🇬', confederation: 'CAF' },
  { code: 'CMR', name: 'Camerún',      flag: '🇨🇲', confederation: 'CAF' },
  { code: 'GHA', name: 'Ghana',        flag: '🇬🇭', confederation: 'CAF' },
  { code: 'RSA', name: 'Sudáfrica',    flag: '🇿🇦', confederation: 'CAF' },
  { code: 'TUN', name: 'Túnez',        flag: '🇹🇳', confederation: 'CAF' },
  { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', confederation: 'CAF' },

  // AFC — Asia (8)
  { code: 'JPN', name: 'Japón',        flag: '🇯🇵', confederation: 'AFC' },
  { code: 'KOR', name: 'Corea del Sur',flag: '🇰🇷', confederation: 'AFC' },
  { code: 'AUS', name: 'Australia',    flag: '🇦🇺', confederation: 'AFC' },
  { code: 'KSA', name: 'Arabia Saudita',flag: '🇸🇦', confederation: 'AFC' },
  { code: 'IRN', name: 'Irán',         flag: '🇮🇷', confederation: 'AFC' },
  { code: 'IRQ', name: 'Iraq',         flag: '🇮🇶', confederation: 'AFC' },
  { code: 'JOR', name: 'Jordania',     flag: '🇯🇴', confederation: 'AFC' },
  { code: 'CHN', name: 'China',        flag: '🇨🇳', confederation: 'AFC' },

  // OFC (1)
  { code: 'NZL', name: 'Nueva Zelanda',flag: '🇳🇿', confederation: 'OFC' },

  // Intercontinental playoff (1)
  { code: 'MLI', name: 'Mali',         flag: '🇲🇱', confederation: 'CAF' },
]

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.code, t]))

export const CONFEDERATION_COLORS = {
  CONMEBOL: 'from-blue-900 to-blue-800',
  CONCACAF: 'from-red-900 to-red-800',
  UEFA:     'from-indigo-900 to-indigo-800',
  CAF:      'from-green-900 to-green-800',
  AFC:      'from-orange-900 to-orange-800',
  OFC:      'from-teal-900 to-teal-800',
}
