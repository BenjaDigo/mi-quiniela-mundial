import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, Users, Settings, Copy, Check, DollarSign, Save, Trophy, UserPlus, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useQuiniela } from '../context/QuinielaContext'
import {
  createQuiniela, getMyQuinielas, updateQuiniela, deleteQuiniela,
  getParticipants, assignTeamsToParticipants,
  updateParticipantPoints, listenParticipants,
  markParticipantPaid, assignExtraTeam, setShareBuddy, saveUserProfile,
  updateDisabledTeams,
} from '../services/firestoreService'
import { assignTeams, getAliveTeams } from '../utils/teamAssignment'
import { calcParticipantPoints, DEFAULT_SCORING } from '../utils/scoring'
import { TEAM_MAP, TEAMS, CONFEDERATION_COLORS } from '../data/teams'

const CONFEDERATION_ORDER = ['CONMEBOL', 'CONCACAF', 'UEFA', 'CAF', 'AFC', 'OFC']
import Modal from '../components/UI/Modal'
import LoadingSpinner from '../components/UI/LoadingSpinner'

function nanoid() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export default function Admin() {
  const { user } = useAuth()
  const { matches, syncScores, syncing, quinielaInfo } = useQuiniela()

  const [quinielas, setQuinielas]     = useState([])
  const [active, setActive]           = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [assigning, setAssigning]     = useState(false)
  const [creating, setCreating]       = useState(false)
  const [showCreate, setShowCreate]   = useState(false)
  const [copied, setCopied]           = useState(false)
  const [newName, setNewName]         = useState('')
  const [updatingPts, setUpdatingPts] = useState(false)

  // tarifa
  const [tarifaInput, setTarifaInput]   = useState('')
  const [tarifaMode, setTarifaMode]     = useState('fija') // 'fija' | 'por_equipo'
  const [savingTarifa, setSavingTarifa] = useState(false)

  // acciones por participante
  const [togglingPaid, setTogglingPaid]     = useState(null)
  const [assigningExtra, setAssigningExtra] = useState(null)

  // distribución: solo vivos
  const [onlyAlive, setOnlyAlive] = useState(false)

  // pool: gestión manual de equipos excluidos
  const [showPoolManager, setShowPoolManager] = useState(false)

  // estado quiniela
  const [togglingStatus, setTogglingStatus] = useState(false)

  // borrar quiniela
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting]                   = useState(false)

  // compartir apuesta
  const [shareModal, setShareModal]   = useState(null) // { uid } | null
  const [buddyName, setBuddyName]     = useState('')
  const [buddyEmail, setBuddyEmail]   = useState('')
  const [savingBuddy, setSavingBuddy] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const qs = await getMyQuinielas(user.uid)
    setQuinielas(qs)
    if (qs.length > 0) {
      setActive(qs[0])
      setTarifaInput(qs[0].tarifa ?? '')
      const ps = await getParticipants(qs[0].id)
      setParticipants(ps)
    } else {
      setActive(null)
      setParticipants([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!active?.id) return
    setTarifaMode(active.tarifaMode ?? 'fija')
    return listenParticipants(active.id, setParticipants)
  }, [active?.id])

  // ── distribución ──────────────────────────────────────────────────
  const aliveTeams = useMemo(() => getAliveTeams(matches), [matches])

  const distribution = useMemo(() => {
    const n = participants.length
    if (!n) return null
    const disabled  = new Set(active?.disabledTeams ?? [])
    const basePool  = onlyAlive ? aliveTeams : TEAMS.map(t => t.code)
    const pool      = basePool.filter(c => !disabled.has(c))
    const perPerson = tarifaMode === 'por_equipo' ? 1 : Math.floor(pool.length / n)
    const extra     = pool.length - perPerson * n
    return { perPerson, extra, total: pool.length }
  }, [participants.length, onlyAlive, aliveTeams, tarifaMode, active?.disabledTeams])

  const extraTeams = active?.extraTeams ?? []

  const prizePool = useMemo(() => {
    if (!active?.tarifa) return null
    if ((active.tarifaMode ?? 'fija') === 'por_equipo') {
      const totalTeams = participants.reduce((s, p) => s + (p.teams?.length ?? 0), 0)
      return totalTeams * active.tarifa
    }
    const totalExtras = participants.reduce((s, p) => s + (p.extrasBought ?? 0), 0)
    return (participants.length + totalExtras) * active.tarifa
  }, [participants, active?.tarifa, active?.tarifaMode])

  // ── handlers ──────────────────────────────────────────────────────
  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const id = nanoid()
    const data = { name: newName.trim(), adminUid: user.uid, inviteCode: id, tarifa: null, extraTeams: [] }
    await createQuiniela(id, data)
    await saveUserProfile(user.uid, { activeQuinielaId: id })
    const created = { id, ...data, status: 'draft' }
    setQuinielas(prev => [created, ...prev])
    setActive(created)
    setTarifaInput('')
    setParticipants([])
    toast.success(`Quiniela "${newName}" creada ✅`)
    setShowCreate(false)
    setNewName('')
    setCreating(false)
  }

  async function handleSaveTarifa() {
    const val = parseFloat(tarifaInput)
    if (isNaN(val) || val < 0) { toast.error('Tarifa inválida'); return }
    setSavingTarifa(true)
    await updateQuiniela(active.id, { tarifa: val, tarifaMode })
    setActive(a => ({ ...a, tarifa: val, tarifaMode }))
    toast.success('Tarifa guardada')
    setSavingTarifa(false)
  }

  async function handleToggleStatus() {
    setTogglingStatus(true)
    const next = active.status === 'finished' ? 'finished'
               : active.status === 'active'   ? 'finished'
               :                                'active'
    await updateQuiniela(active.id, { status: next })
    setActive(a => ({ ...a, status: next }))
    toast.success(
      next === 'active'   ? '¡Quiniela iniciada! Los participantes ya pueden adquirir equipos.' :
      next === 'finished' ? '🏁 Quiniela finalizada.' :
                            'Quiniela pausada.'
    )
    setTogglingStatus(false)
  }

  async function handleToggleTeam(code) {
    const current = active?.disabledTeams ?? []
    const next = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
    await updateDisabledTeams(active.id, next)
    setActive(a => ({ ...a, disabledTeams: next }))
  }

  async function handleResetDisabled() {
    await updateDisabledTeams(active.id, [])
    setActive(a => ({ ...a, disabledTeams: [] }))
  }

  async function handleAssign() {
    if (!active) return
    setAssigning(true)
    try {
      const disabled  = new Set(active?.disabledTeams ?? [])
      const basePool  = onlyAlive ? aliveTeams : TEAMS.map(t => t.code)
      const pool      = basePool.filter(c => !disabled.has(c))

      if (tarifaMode === 'por_equipo') {
        await updateQuiniela(active.id, { extraTeams: pool })
        setActive(a => ({ ...a, extraTeams: pool }))
        toast.success(`${pool.length} equipos cargados al pool`)
        return
      }
      if (!participants.length) { toast.error('Sin participantes'); return }
      if (pool.length < participants.length) {
        toast.error(`Solo hay ${pool.length} equipos disponibles para ${participants.length} participantes`)
        return
      }
      const { assignment, extraTeams: extras, perPerson } = assignTeams(participants.map(p => p.uid), pool)
      await assignTeamsToParticipants(active.id, assignment)
      await updateQuiniela(active.id, { extraTeams: extras })
      setActive(a => ({ ...a, extraTeams: extras }))
      const disabledCount = disabled.size
      const poolLabel = `${pool.length} equipos${disabledCount ? ` (${disabledCount} excluidos)` : ''}`
      const msg = extras.length
        ? `${participants.length} participantes · ${perPerson} equipos c/u · ${extras.length} extras · ${poolLabel}`
        : `${participants.length} participantes · ${perPerson} equipos c/u · distribución exacta · ${poolLabel}`
      toast.success(msg)
    } finally {
      setAssigning(false)
    }
  }

  async function handleUpdatePoints() {
    if (!active || !participants.length || !matches.length) {
      toast.error('Necesitas partidos sincronizados primero')
      return
    }
    setUpdatingPts(true)
    try {
      await Promise.all(participants.map(async p => {
        const pts = calcParticipantPoints(p, matches, {}, DEFAULT_SCORING)
        await updateParticipantPoints(active.id, p.uid, pts)
      }))
      toast.success('Puntos actualizados ✅')
    } finally {
      setUpdatingPts(false)
    }
  }

  async function handleSync() {
    await syncScores()
    toast.success('Partidos sincronizados desde la API ⚽')
  }

  async function handleTogglePaid(uid, currentPaid) {
    setTogglingPaid(uid)
    try {
      await markParticipantPaid(active.id, uid, !currentPaid)
    } finally {
      setTogglingPaid(null)
    }
  }

  async function handleAssignExtra(uid) {
    if (!extraTeams.length) return
    setAssigningExtra(uid)
    try {
      const team = await assignExtraTeam(active.id, uid, extraTeams)
      setActive(a => ({ ...a, extraTeams: a.extraTeams.filter(t => t !== team) }))
      const t = TEAM_MAP[team]
      toast.success(`${t?.flag ?? ''} ${t?.name ?? team} asignado`)
    } finally {
      setAssigningExtra(null)
    }
  }

  function openShareModal(p) {
    setShareModal({ uid: p.uid })
    setBuddyName(p.shareBuddy?.displayName ?? '')
    setBuddyEmail(p.shareBuddy?.email ?? '')
  }

  async function handleSaveBuddy() {
    if (!buddyName.trim()) return
    setSavingBuddy(true)
    await setShareBuddy(active.id, shareModal.uid, {
      displayName: buddyName.trim(),
      email: buddyEmail.trim() || null,
    })
    toast.success('Socio guardado')
    setSavingBuddy(false)
    setShareModal(null)
  }

  async function handleClearBuddy(uid) {
    await setShareBuddy(active.id, uid, null)
    toast.success('Apuesta compartida eliminada')
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteQuiniela(active.id)
      const updated = quinielas.filter(q => q.id !== active.id)
      setQuinielas(updated)
      if (updated.length > 0) {
        setActive(updated[0])
        setTarifaInput(updated[0].tarifa ?? '')
        const ps = await getParticipants(updated[0].id)
        setParticipants(ps)
      } else {
        setActive(null)
        setParticipants([])
        setTarifaInput('')
      }
      toast.success('Quiniela eliminada')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  function copyInvite() {
    if (!active?.inviteCode) return
    navigator.clipboard.writeText(active.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Código copiado 📋')
  }

  if (loading) return <LoadingSpinner text="Cargando panel admin..." />

  // Bloquear a participantes (quiniela activa que no administran)
  const isOnlyParticipant = quinielaInfo
    && quinielaInfo.adminUid !== user.uid
    && quinielaInfo.status !== 'finished'
  if (isOnlyParticipant) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full p-8 text-center border-zinc-700"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-white mb-3">Acceso restringido</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Actualmente solo puedes participar en una quiniela activa. Si deseas
            administrar tu propia quiniela, espera a que la actual termine o ingresa
            con una cuenta diferente.
          </p>
          <div className="mt-6 pt-5 border-t border-zinc-800 text-xs text-zinc-600">
            Quiniela activa:{' '}
            <span className="text-zinc-400 font-semibold">{quinielaInfo.name}</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Settings size={26} className="text-yellow-400" /> Panel de Admin
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">Gestiona la quiniela, asigna equipos y controla pagos</p>
      </motion.div>

      {!active ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">🏗️</div>
          <h2 className="text-xl font-bold text-white mb-2">No hay quinielas</h2>
          <p className="text-zinc-500 text-sm mb-6">Crea la primera para empezar</p>
          <button onClick={() => setShowCreate(true)} className="btn-gold">
            <Plus size={16} className="inline mr-1.5" /> Crear quiniela
          </button>
        </div>
      ) : (
        <>
          {/* ── Quiniela info ── */}
          <div className="card p-5 border-yellow-500/20 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Quiniela activa</p>
                <h2 className="text-2xl font-black text-white">{active.name}</h2>
                <p className="text-xs text-zinc-500 mt-1">ID: {active.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowCreate(true)} className="btn-outline text-xs flex items-center gap-1.5">
                  <Plus size={13} /> Nueva quiniela
                </button>
                {active.adminUid === user.uid && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-outline text-xs flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    title="Borrar quiniela"
                  >
                    <Trash2 size={13} /> Borrar
                  </button>
                )}
              </div>
            </div>

            {/* Código de invitación */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-800 rounded-xl px-4 py-2.5">
                <p className="text-xs text-zinc-500 mb-0.5">Código de invitación</p>
                <p className="font-black text-yellow-400 tracking-widest text-lg">{active.inviteCode ?? active.id}</p>
              </div>
              <button onClick={copyInvite} className="btn-gold flex items-center gap-1.5 h-full px-4">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            {/* Estado */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Estado</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  active.status === 'active'   ? 'bg-green-500/15 text-green-400' :
                  active.status === 'finished' ? 'bg-zinc-700 text-zinc-300'      :
                                                 'bg-zinc-800 text-zinc-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    active.status === 'active'   ? 'bg-green-400' :
                    active.status === 'finished' ? 'bg-zinc-400'  : 'bg-zinc-500'
                  }`} />
                  {active.status === 'active' ? 'Iniciada' : active.status === 'finished' ? 'Finalizada' : 'Borrador'}
                </span>
              </div>
              {active.status !== 'finished' && (
                <button
                  onClick={handleToggleStatus}
                  disabled={togglingStatus}
                  className={`btn-outline text-xs flex items-center gap-1.5 ${
                    active.status === 'active'
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {togglingStatus ? '...' : active.status === 'active' ? '🏁 Finalizar' : '▶ Iniciar quiniela'}
                </button>
              )}
            </div>

            {/* Tarifa de entrada */}
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                <DollarSign size={13} />
                {tarifaMode === 'por_equipo' ? 'Precio por equipo' : 'Tarifa de entrada'}
              </p>

              {/* Modo de cobro */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/50 rounded-lg p-0.5 w-fit mb-3">
                <button
                  onClick={() => setTarifaMode('fija')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    tarifaMode === 'fija'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Por participante
                </button>
                <button
                  onClick={() => setTarifaMode('por_equipo')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    tarifaMode === 'por_equipo'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Por equipo
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                  <input
                    type="number" min="0" step="any"
                    value={tarifaInput}
                    onChange={e => setTarifaInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveTarifa()}
                    className="input-dark pl-8 h-10 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <button onClick={handleSaveTarifa} disabled={savingTarifa}
                  className="btn-outline text-xs flex items-center gap-1.5 h-10 px-4">
                  <Save size={13} />
                  {savingTarifa ? 'Guardando...' : 'Guardar'}
                </button>
                {active.tarifa != null && (
                  <p className="text-sm text-zinc-300">
                    Actual: <span className="font-black text-yellow-400">${Number(active.tarifa).toLocaleString('es-MX')}</span>
                    <span className="text-zinc-500">{active.tarifaMode === 'por_equipo' ? '/equipo' : '/persona'}</span>
                  </p>
                )}
              </div>
              {distribution && (
                <p className="text-xs text-zinc-500 mt-2">
                  Con {participants.length} participante{participants.length !== 1 ? 's' : ''}:
                  {' '}<span className="text-zinc-300">{distribution.total} ÷ {participants.length} = {distribution.perPerson} equipo{distribution.perPerson !== 1 ? 's' : ''} c/u</span>
                  {distribution.extra > 0
                    ? <>, sobran <span className="text-yellow-400 font-semibold">{distribution.extra} en el pool</span> a compra adicional</>
                    : <span className="text-green-400"> · distribución exacta</span>
                  }
                  {active.tarifa != null && tarifaMode === 'por_equipo' &&
                    <> · <span className="text-yellow-400">${Number(active.tarifa).toLocaleString('es-MX')}</span>/equipo</>
                  }
                </p>
              )}

              {/* Premio total */}
              {prizePool != null && (
                <div className="mt-3 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                  <Trophy size={18} className="text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">Premio total acumulado</p>
                    <p className="text-2xl font-black text-yellow-400">
                      ${prizePool.toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div className="ml-auto text-right text-xs text-zinc-500">
                    {(active.tarifaMode ?? 'fija') === 'por_equipo' ? (
                      <>
                        <p>{participants.reduce((s, p) => s + (p.teams?.length ?? 0), 0)} equipos asignados</p>
                        <p>× ${Number(active.tarifa).toLocaleString('es-MX')}/eq</p>
                      </>
                    ) : (
                      <>
                        <p>{participants.length} participantes</p>
                        {participants.reduce((s, p) => s + (p.extrasBought ?? 0), 0) > 0 &&
                          <p>+{participants.reduce((s, p) => s + (p.extrasBought ?? 0), 0)} extras</p>
                        }
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Opción distribución ── */}
          <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Solo equipos vivos</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {onlyAlive
                  ? aliveTeams.length < TEAMS.length
                    ? `${aliveTeams.length} de 48 equipos siguen en el torneo`
                    : 'Todos los equipos siguen vivos (fase de grupos)'
                  : '48 equipos — todos los del torneo'}
              </p>
            </div>
            <button
              onClick={() => setOnlyAlive(v => !v)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                onlyAlive ? 'bg-yellow-500' : 'bg-zinc-600'
              }`}
              aria-checked={onlyAlive}
              role="switch"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                onlyAlive ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* ── Pool de equipos ── */}
          {(() => {
            const disabledTeams = active?.disabledTeams ?? []
            return (
              <div className="card p-4 border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Equipos excluidos del pool</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {disabledTeams.length > 0
                        ? `${disabledTeams.length} equipo${disabledTeams.length !== 1 ? 's' : ''} excluido${disabledTeams.length !== 1 ? 's' : ''} · ${48 - disabledTeams.length} disponibles`
                        : 'Todos los equipos disponibles'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPoolManager(v => !v)}
                    className="btn-outline text-xs"
                  >
                    {showPoolManager ? 'Cerrar' : 'Gestionar'}
                  </button>
                </div>

                {showPoolManager && (
                  <div className="mt-4 space-y-4">
                    {CONFEDERATION_ORDER.map(conf => {
                      const confTeams = TEAMS.filter(t => t.confederation === conf)
                      return (
                        <div key={conf}>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{conf}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {confTeams.map(team => {
                              const isDisabled = disabledTeams.includes(team.code)
                              return (
                                <button
                                  key={team.code}
                                  onClick={() => handleToggleTeam(team.code)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                    isDisabled
                                      ? 'bg-zinc-900 border-red-500/30 text-zinc-500 line-through opacity-60'
                                      : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-yellow-500/50 hover:text-white'
                                  }`}
                                >
                                  <span>{team.flag}</span>
                                  <span>{team.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                    {disabledTeams.length > 0 && (
                      <button
                        onClick={handleResetDisabled}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors mt-1"
                      >
                        Restablecer todos
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Acciones ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            <ActionCard
              icon={tarifaMode === 'por_equipo' ? '📦' : '🎲'}
              title={tarifaMode === 'por_equipo' ? 'Cargar pool' : 'Asignar equipos'}
              desc={tarifaMode === 'por_equipo'
                ? onlyAlive
                  ? `Mueve los ${aliveTeams.length} equipos vivos al pool para adquisición libre`
                  : 'Mueve los 48 equipos al pool para que los participantes los adquieran'
                : distribution
                  ? `${distribution.perPerson} eq/persona · ${distribution.extra} extras · pool: ${distribution.total}`
                  : 'Agrega participantes primero'}
              action={handleAssign}
              loading={assigning}
              label={tarifaMode === 'por_equipo' ? 'Cargar al pool' : 'Asignar al azar'}
              disabled={tarifaMode !== 'por_equipo' && participants.length === 0}
            />
            <ActionCard
              icon="⚽"
              title="Sincronizar partidos"
              desc="Actualiza los resultados desde football-data.org"
              action={handleSync}
              loading={syncing}
              label="Sincronizar API"
            />
          </div>

          {/* ── Equipos Extra ── */}
          {extraTeams.length > 0 && (
            <section className="card p-5 border-yellow-500/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-black text-white text-lg flex items-center gap-2">
                    ⚡ Equipos Extra
                    <span className="badge bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                      {extraTeams.length} disponible{extraTeams.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  {active.tarifa != null && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Precio por equipo adicional: <span className="text-yellow-400 font-semibold">${Number(active.tarifa).toLocaleString('es-MX')}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {extraTeams.map(code => {
                  const t = TEAM_MAP[code]
                  return (
                    <span key={code} className="badge bg-zinc-800 text-zinc-300 text-xs gap-1.5 py-1 px-2.5">
                      {t?.flag} {t?.name ?? code}
                    </span>
                  )
                })}
              </div>
              <p className="text-xs text-zinc-600 mt-3">
                Usa el botón <span className="text-zinc-400">+ Extra</span> en la lista de participantes para asignar uno al azar cuando alguien pague.
              </p>
            </section>
          )}

          {/* ── Participantes ── */}
          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Users size={20} className="text-yellow-400" />
              Participantes ({participants.length})
              {participants.length > 0 && (
                <span className="text-sm font-normal text-zinc-500 ml-1">
                  · {participants.filter(p => p.paid).length} pagados
                </span>
              )}
            </h2>
            <div className="space-y-2">
              {participants.length === 0 ? (
                <div className="card p-8 text-center text-zinc-500 text-sm">
                  Nadie se ha unido todavía. Comparte el código de invitación.
                </div>
              ) : (
                participants.map((p, i) => (
                  <div key={p.id} className="card-hover flex items-center gap-3 p-4 flex-wrap">
                    <span className="text-zinc-500 text-sm w-6 text-center font-bold shrink-0">#{i+1}</span>

                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                      {(p.displayName?.[0] ?? '?').toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-tight">{p.displayName}</p>
                      {p.shareBuddy
                        ? <p className="text-xs text-yellow-400/80">& {p.shareBuddy.displayName}</p>
                        : <p className="text-xs text-zinc-500 truncate">{p.email}</p>
                      }
                    </div>

                    {/* Paid toggle */}
                    <button
                      onClick={() => handleTogglePaid(p.uid, p.paid)}
                      disabled={togglingPaid === p.uid}
                      className={`badge text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                        p.paid
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {togglingPaid === p.uid
                        ? '...'
                        : p.paid
                          ? '✓ Pagó'
                          : (active.tarifaMode === 'por_equipo' && active.tarifa && (p.teams?.length ?? 0) > 0)
                            ? `Debe $${((p.teams?.length ?? 0) * active.tarifa).toLocaleString('es-MX')}`
                            : 'Pendiente'}
                    </button>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-500">Equipos</p>
                      <p className="font-bold text-sm text-zinc-300">{p.teams?.length ?? 0}</p>
                    </div>

                    <div className="text-xs text-zinc-600 hidden md:block w-24 truncate shrink-0">
                      {(p.teams ?? []).slice(0, 5).map(c => TEAM_MAP[c]?.flag ?? '').join(' ')}
                    </div>

                    {/* Botón extra team */}
                    {extraTeams.length > 0 && (
                      <button
                        onClick={() => handleAssignExtra(p.uid)}
                        disabled={assigningExtra === p.uid}
                        className="btn-outline text-xs px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1"
                        title="Asignar equipo extra al azar"
                      >
                        {assigningExtra === p.uid ? '...' : '+ Extra'}
                      </button>
                    )}

                    {/* Botón compartir */}
                    <button
                      onClick={() => openShareModal(p)}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                        p.shareBuddy
                          ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                      title="Compartir apuesta"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Modal compartir apuesta */}
      <Modal
        open={!!shareModal}
        onClose={() => setShareModal(null)}
        title="Compartir apuesta"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 leading-relaxed">
            El socio comparte los mismos equipos. Cada uno paga la mitad de la tarifa.
            El app solo lleva el registro, el pago es externo.
          </p>
          {(() => {
            const p = participants.find(x => x.uid === shareModal?.uid)
            return p?.shareBuddy ? (
              <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Socio actual</p>
                  <p className="font-semibold text-yellow-400">{p.shareBuddy.displayName}</p>
                  {p.shareBuddy.email && <p className="text-xs text-zinc-500">{p.shareBuddy.email}</p>}
                </div>
                <button
                  onClick={() => { handleClearBuddy(shareModal.uid); setShareModal(null) }}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  title="Quitar socio"
                >
                  <X size={16} />
                </button>
              </div>
            ) : null
          })()}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Nombre del socio *</label>
            <input
              value={buddyName}
              onChange={e => setBuddyName(e.target.value)}
              className="input-dark"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Correo (opcional)</label>
            <input
              value={buddyEmail}
              onChange={e => setBuddyEmail(e.target.value)}
              className="input-dark"
              placeholder="juan@correo.com"
              type="email"
            />
          </div>
          <button
            onClick={handleSaveBuddy}
            disabled={savingBuddy || !buddyName.trim()}
            className="btn-gold w-full"
          >
            {savingBuddy ? 'Guardando...' : 'Guardar socio'}
          </button>
        </div>
      </Modal>

      {/* Modal confirmar borrado */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Borrar quiniela">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            ¿Seguro que quieres borrar <span className="font-bold text-white">"{active?.name}"</span>?
            Se eliminarán todos los participantes y sus datos. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-outline flex-1"
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Borrando...' : 'Sí, borrar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal crear quiniela */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear nueva quiniela">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Nombre de la quiniela</label>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              className="input-dark" placeholder="Quiniela Mundial 2026"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button onClick={handleCreate} disabled={creating || !newName.trim()} className="btn-gold w-full">
            {creating ? 'Creando...' : 'Crear quiniela 🚀'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function ActionCard({ icon, title, desc, action, loading, label, disabled }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
      </div>
      <button onClick={action} disabled={loading || disabled}
        className={`btn-gold text-xs mt-auto ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {loading ? 'Procesando...' : label}
      </button>
    </div>
  )
}
