import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQuiniela } from '../../context/QuinielaContext'
import { TEAM_MAP } from '../../data/teams'
import TeamCrest from './TeamCrest'

export default function PoolTeams({ className = '' }) {
  const { extraTeams } = useQuiniela()
  const [expanded, setExpanded] = useState(false)

  if (!extraTeams.length) return null

  const visible = expanded ? extraTeams : extraTeams.slice(0, 12)

  return (
    <div className={`card p-4 border-yellow-500/15 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          ⚡ Pool disponible
          <span className="badge bg-yellow-500/20 text-yellow-400 font-bold px-2">
            {extraTeams.length}
          </span>
        </p>
        {extraTeams.length > 12 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {expanded ? <><ChevronUp size={13} /> Ver menos</> : <><ChevronDown size={13} /> Ver todos</>}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map(code => {
          const t = TEAM_MAP[code]
          return (
            <span key={code} className="badge bg-zinc-800 text-zinc-300 text-xs gap-1.5 py-1 px-2 items-center">
              <TeamCrest team={t} size={14} />
              {t?.name ?? code}
            </span>
          )
        })}
        {!expanded && extraTeams.length > 12 && (
          <span className="badge bg-zinc-800/50 text-zinc-500 text-xs py-1 px-2">
            +{extraTeams.length - 12} más
          </span>
        )}
      </div>
    </div>
  )
}
