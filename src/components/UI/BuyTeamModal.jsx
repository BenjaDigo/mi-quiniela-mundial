import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useQuiniela } from '../../context/QuinielaContext'
import { assignExtraTeam } from '../../services/firestoreService'
import { TEAM_MAP, TEAMS } from '../../data/teams'
import TeamCrest from './TeamCrest'

const ALL_CODES = TEAMS.map(t => t.code)

export default function BuyTeamModal({ open, onClose }) {
  const { user } = useAuth()
  const { extraTeams, activeQuinielaId, quinielaInfo } = useQuiniela()

  const [phase, setPhase]         = useState('confirm') // 'confirm' | 'revealing' | 'result'
  const [cycleCode, setCycleCode] = useState(null)
  const [newTeam, setNewTeam]     = useState(null)
  const intervalRef               = useRef(null)

  const tarifa     = quinielaInfo?.tarifa
  const tarifaMode = quinielaInfo?.tarifaMode ?? 'fija'

  useEffect(() => {
    if (open) { setPhase('confirm'); setNewTeam(null); setCycleCode(null) }
    return () => clearInterval(intervalRef.current)
  }, [open])

  function runSlotAnimation(finalCode) {
    // Arranca rápido y va frenando hasta revelar el equipo real
    const schedule = [
      ...Array(14).fill(80),
      ...Array(6).fill(140),
      ...Array(5).fill(220),
      ...Array(4).fill(340),
    ]
    let i = 0
    function tick() {
      if (i < schedule.length - 1) {
        setCycleCode(ALL_CODES[Math.floor(Math.random() * ALL_CODES.length)])
        intervalRef.current = setTimeout(tick, schedule[i++])
      } else {
        setCycleCode(finalCode)
        setTimeout(() => setPhase('result'), 400)
      }
    }
    tick()
  }

  async function handleConfirm() {
    if (!activeQuinielaId || !extraTeams.length) return
    setPhase('revealing')
    try {
      const code = await assignExtraTeam(activeQuinielaId, user.uid, extraTeams)
      if (!code) {
        toast.error('Ya no hay equipos disponibles')
        setPhase('confirm')
        return
      }
      setNewTeam(code)
      runSlotAnimation(code)
    } catch {
      toast.error('No se pudo asignar el equipo')
      setPhase('confirm')
    }
  }

  function handleClose() {
    clearInterval(intervalRef.current)
    setPhase('confirm'); setNewTeam(null); setCycleCode(null)
    onClose()
  }

  if (!open) return null

  const cycleTeam   = cycleCode ? TEAM_MAP[cycleCode] : null
  // cycleCode se fija al código final justo antes de pasar a 'result', úsalo como fallback
  const displayCode = newTeam || cycleCode
  const resultTeam  = displayCode ? TEAM_MAP[displayCode] : null
  const resultFlag  = resultTeam?.flag  ?? '🏳️'
  const resultName  = resultTeam?.name  ?? displayCode ?? '???'
  const resultConf  = resultTeam?.confederation ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         onClick={phase !== 'revealing' ? handleClose : undefined}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="text-lg font-black text-white">
            {phase === 'result' ? '🎉 ¡Nuevo equipo!' : '⚡ Agregar equipo'}
          </h2>
          {phase !== 'revealing' && (
            <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* ── CONFIRM ── */}
          {phase === 'confirm' && quinielaInfo?.status !== 'active' && (
            <div className="py-6 text-center space-y-3">
              <div className="text-5xl">⏳</div>
              <p className="font-bold text-white">La quiniela aún no ha iniciado</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                El administrador debe marcarla como <span className="text-yellow-400 font-semibold">Iniciada</span> para que puedas adquirir equipos.
              </p>
              <button onClick={handleClose} className="btn-outline w-full text-sm mt-2">Entendido</button>
            </div>
          )}

          {phase === 'confirm' && quinielaInfo?.status === 'active' && !extraTeams.length && (
            <div className="py-6 text-center space-y-3">
              <div className="text-5xl">😕</div>
              <p className="font-bold text-white">Pool vacío</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                No quedan equipos disponibles. Contacta al administrador.
              </p>
              <button onClick={handleClose} className="btn-outline w-full text-sm mt-2">Cerrar</button>
            </div>
          )}

          {phase === 'confirm' && quinielaInfo?.status === 'active' && extraTeams.length > 0 && (
            <div className="space-y-4">
              {/* Aviso de costo */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">💰</span>
                <div>
                  {tarifa ? (
                    <>
                      <p className="text-sm font-bold text-yellow-400">
                        Costo adicional: ${Number(tarifa).toLocaleString('es-MX')}
                        {tarifaMode === 'por_equipo' ? ' / equipo' : ''}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Al confirmar, este monto se sumará al premio total de la quiniela.
                        Recibirás un equipo al azar del pool disponible.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Recibirás un equipo al azar del pool disponible. El administrador
                      registrará el pago correspondiente.
                    </p>
                  )}
                </div>
              </div>

              {/* Pool disponible */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Pool disponible
                  <span className="badge bg-yellow-500/20 text-yellow-400 font-bold px-2">
                    {extraTeams.length}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {extraTeams.map(code => {
                    const t = TEAM_MAP[code]
                    return (
                      <span key={code} className="badge bg-zinc-800 text-zinc-300 text-xs gap-1.5 py-1 px-2 items-center">
                        <TeamCrest team={t} size={14} />
                        {t?.name ?? code}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handleClose} className="btn-outline flex-1 text-sm">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!activeQuinielaId}
                  className="btn-gold flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* ── REVEALING ── */}
          {phase === 'revealing' && (
            <div className="py-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                className="text-5xl mx-auto w-fit mb-6"
              >
                ⚽
              </motion.div>

              <div className="h-20 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cycleCode}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.06 }}
                    className="text-center"
                  >
                    <span className="text-5xl leading-none">{cycleTeam?.flag ?? '🏴'}</span>
                    <p className="text-sm font-semibold text-zinc-300 mt-2">
                      {cycleTeam?.name ?? '...'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <p className="text-xs text-zinc-500 mt-4">Asignando tu equipo...</p>
            </div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && displayCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 text-center space-y-4"
            >
              {/* Burst de fondo */}
              <div className="relative flex items-center justify-center h-32">
                {['⭐','✨','🌟','💫','⭐','✨'].map((e, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: Math.cos((i / 6) * Math.PI * 2) * 60,
                      y: Math.sin((i / 6) * Math.PI * 2) * 50,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="absolute text-lg pointer-events-none"
                  >
                    {e}
                  </motion.span>
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                  className="relative z-10"
                >
                  {resultTeam?.flagUrl
                    ? <img src={resultTeam.flagUrl} alt={resultName} width={144} height={96}
                        className="object-cover rounded-lg shadow-2xl" />
                    : <span className="text-8xl leading-none">{resultFlag}</span>
                  }
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl font-black text-white">{resultName}</p>
                {resultConf && <p className="text-xs text-zinc-500 mt-1">{resultConf}</p>}
                {tarifa && (
                  <p className="text-xs text-zinc-400 mt-3">
                    <span className="text-yellow-400 font-semibold">
                      +${Number(tarifa).toLocaleString('es-MX')}
                    </span>{' '}
                    se añadirán al premio total
                  </p>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleClose}
                className="btn-gold w-full mt-2"
              >
                ¡Listo!
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
