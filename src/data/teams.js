// 48 selecciones clasificadas al Mundial 2026
// Banderas: https://flagcdn.com/w320/{iso2}.png
export const TEAMS = [
  // CONMEBOL (6)
  { code: 'ARG', name: 'Argentina',      flag: '🇦🇷', flagUrl: 'https://flagcdn.com/w320/ar.png',     confederation: 'CONMEBOL' },
  { code: 'BRA', name: 'Brasil',          flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w320/br.png',     confederation: 'CONMEBOL' },
  { code: 'COL', name: 'Colombia',        flag: '🇨🇴', flagUrl: 'https://flagcdn.com/w320/co.png',     confederation: 'CONMEBOL' },
  { code: 'ECU', name: 'Ecuador',         flag: '🇪🇨', flagUrl: 'https://flagcdn.com/w320/ec.png',     confederation: 'CONMEBOL' },
  { code: 'PAR', name: 'Paraguay',        flag: '🇵🇾', flagUrl: 'https://flagcdn.com/w320/py.png',     confederation: 'CONMEBOL' },
  { code: 'URU', name: 'Uruguay',         flag: '🇺🇾', flagUrl: 'https://flagcdn.com/w320/uy.png',     confederation: 'CONMEBOL' },

  // CONCACAF (6)
  { code: 'CAN', name: 'Canadá',          flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w320/ca.png',     confederation: 'CONCACAF' },
  { code: 'CUW', name: 'Curazao',         flag: '🇨🇼', flagUrl: 'https://flagcdn.com/w320/cw.png',     confederation: 'CONCACAF' },
  { code: 'HAI', name: 'Haití',           flag: '🇭🇹', flagUrl: 'https://flagcdn.com/w320/ht.png',     confederation: 'CONCACAF' },
  { code: 'MEX', name: 'México',          flag: '🇲🇽', flagUrl: 'https://flagcdn.com/w320/mx.png',     confederation: 'CONCACAF' },
  { code: 'PAN', name: 'Panamá',          flag: '🇵🇦', flagUrl: 'https://flagcdn.com/w320/pa.png',     confederation: 'CONCACAF' },
  { code: 'USA', name: 'Estados Unidos',  flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w320/us.png',     confederation: 'CONCACAF' },

  // UEFA (16)
  { code: 'AUT', name: 'Austria',         flag: '🇦🇹', flagUrl: 'https://flagcdn.com/w320/at.png',     confederation: 'UEFA' },
  { code: 'BEL', name: 'Bélgica',         flag: '🇧🇪', flagUrl: 'https://flagcdn.com/w320/be.png',     confederation: 'UEFA' },
  { code: 'BIH', name: 'Bosnia y Herz.',  flag: '🇧🇦', flagUrl: 'https://flagcdn.com/w320/ba.png',     confederation: 'UEFA' },
  { code: 'CRO', name: 'Croacia',         flag: '🇭🇷', flagUrl: 'https://flagcdn.com/w320/hr.png',     confederation: 'UEFA' },
  { code: 'CZE', name: 'Chequia',         flag: '🇨🇿', flagUrl: 'https://flagcdn.com/w320/cz.png',     confederation: 'UEFA' },
  { code: 'ENG', name: 'Inglaterra',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagUrl: 'https://flagcdn.com/w320/gb-eng.png', confederation: 'UEFA' },
  { code: 'ESP', name: 'España',          flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w320/es.png',     confederation: 'UEFA' },
  { code: 'FRA', name: 'Francia',         flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w320/fr.png',     confederation: 'UEFA' },
  { code: 'GER', name: 'Alemania',        flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w320/de.png',     confederation: 'UEFA' },
  { code: 'NED', name: 'Países Bajos',    flag: '🇳🇱', flagUrl: 'https://flagcdn.com/w320/nl.png',     confederation: 'UEFA' },
  { code: 'NOR', name: 'Noruega',         flag: '🇳🇴', flagUrl: 'https://flagcdn.com/w320/no.png',     confederation: 'UEFA' },
  { code: 'POR', name: 'Portugal',        flag: '🇵🇹', flagUrl: 'https://flagcdn.com/w320/pt.png',     confederation: 'UEFA' },
  { code: 'SCO', name: 'Escocia',         flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', flagUrl: 'https://flagcdn.com/w320/gb-sct.png', confederation: 'UEFA' },
  { code: 'SUI', name: 'Suiza',           flag: '🇨🇭', flagUrl: 'https://flagcdn.com/w320/ch.png',     confederation: 'UEFA' },
  { code: 'SWE', name: 'Suecia',          flag: '🇸🇪', flagUrl: 'https://flagcdn.com/w320/se.png',     confederation: 'UEFA' },
  { code: 'TUR', name: 'Turquía',         flag: '🇹🇷', flagUrl: 'https://flagcdn.com/w320/tr.png',     confederation: 'UEFA' },

  // CAF — África (10)
  { code: 'ALG', name: 'Argelia',         flag: '🇩🇿', flagUrl: 'https://flagcdn.com/w320/dz.png',     confederation: 'CAF' },
  { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', flagUrl: 'https://flagcdn.com/w320/ci.png',     confederation: 'CAF' },
  { code: 'COD', name: 'R. D. del Congo', flag: '🇨🇩', flagUrl: 'https://flagcdn.com/w320/cd.png',     confederation: 'CAF' },
  { code: 'CPV', name: 'Cabo Verde',      flag: '🇨🇻', flagUrl: 'https://flagcdn.com/w320/cv.png',     confederation: 'CAF' },
  { code: 'EGY', name: 'Egipto',          flag: '🇪🇬', flagUrl: 'https://flagcdn.com/w320/eg.png',     confederation: 'CAF' },
  { code: 'GHA', name: 'Ghana',           flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w320/gh.png',     confederation: 'CAF' },
  { code: 'MAR', name: 'Marruecos',       flag: '🇲🇦', flagUrl: 'https://flagcdn.com/w320/ma.png',     confederation: 'CAF' },
  { code: 'RSA', name: 'Sudáfrica',       flag: '🇿🇦', flagUrl: 'https://flagcdn.com/w320/za.png',     confederation: 'CAF' },
  { code: 'SEN', name: 'Senegal',         flag: '🇸🇳', flagUrl: 'https://flagcdn.com/w320/sn.png',     confederation: 'CAF' },
  { code: 'TUN', name: 'Túnez',           flag: '🇹🇳', flagUrl: 'https://flagcdn.com/w320/tn.png',     confederation: 'CAF' },

  // AFC — Asia (9)
  { code: 'AUS', name: 'Australia',       flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w320/au.png',     confederation: 'AFC' },
  { code: 'IRN', name: 'Irán',            flag: '🇮🇷', flagUrl: 'https://flagcdn.com/w320/ir.png',     confederation: 'AFC' },
  { code: 'IRQ', name: 'Iraq',            flag: '🇮🇶', flagUrl: 'https://flagcdn.com/w320/iq.png',     confederation: 'AFC' },
  { code: 'JOR', name: 'Jordania',        flag: '🇯🇴', flagUrl: 'https://flagcdn.com/w320/jo.png',     confederation: 'AFC' },
  { code: 'JPN', name: 'Japón',           flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w320/jp.png',     confederation: 'AFC' },
  { code: 'KOR', name: 'Corea del Sur',   flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w320/kr.png',     confederation: 'AFC' },
  { code: 'KSA', name: 'Arabia Saudita',  flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w320/sa.png',     confederation: 'AFC' },
  { code: 'QAT', name: 'Qatar',           flag: '🇶🇦', flagUrl: 'https://flagcdn.com/w320/qa.png',     confederation: 'AFC' },
  { code: 'UZB', name: 'Uzbekistán',      flag: '🇺🇿', flagUrl: 'https://flagcdn.com/w320/uz.png',     confederation: 'AFC' },

  // OFC (1)
  { code: 'NZL', name: 'Nueva Zelanda',   flag: '🇳🇿', flagUrl: 'https://flagcdn.com/w320/nz.png',     confederation: 'OFC' },
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
