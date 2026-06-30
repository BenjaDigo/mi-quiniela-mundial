import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQuiniela } from '../../context/QuinielaContext'
import { TEAM_MAP } from '../../data/teams'
import { getAliveTeams } from '../../utils/teamAssignment'
import TeamCrest from './TeamCrest'

export default function PoolTeams({ className = '' }) {
  const { extraTeams, matches } = useQuiniela()
  const [expanded, setExpanded] = useState(false)

  const allAlive = useMemo(() => getAliveTeams(matches), [matches])
  const availableSet = useMemo(() => new Set(extraTeams), [extraTeams])

  if (!allAlive.length) return null

  const visible = expanded ? allAlive : allAlive.slice(0, 12)

  return (
    <div className={`card p-4 border-yellow-500/15 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          ⚡ Pool disponible
          <span className="badge bg-yellow-500/20 text-yellow-400 font-bold px-2">
            {extraTeams.length}
          </span>
          <span className="text-zinc-600 font-normal normal-case">/ {allAlive.length} vivos</span>
        </p>
        {allAlive.length > 12 && (
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
          const available = availableSet.has(code)
          return (
            <span
              key={code}
              className={`badge text-xs gap-1.5 py-1 px-2 items-center ${
                available
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-zinc-900/50 text-zinc-600 line-through decoration-zinc-700'
              }`}
            >
              <TeamCrest team={t} size={14} />
              {t?.name ?? code}
            </span>
          )
        })}
        {!expanded && allAlive.length > 12 && (
          <span className="badge bg-zinc-800/50 text-zinc-500 text-xs py-1 px-2">
            +{allAlive.length - 12} más
          </span>
        )}
      </div>
    </div>
  )
}
