import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { listenMatches, saveMatches, getActiveQuinielaId, listenActiveQuinielaId, listenQuiniela, listenParticipants, syncParticipantPhoto } from '../services/firestoreService'
import { fetchMatches } from '../services/footballApi'
import { useAuth } from './AuthContext'

const QuinielaContext = createContext(null)
const AUTO_SYNC_MS = 5  * 60 * 1000
const IDLE_SYNC_MS = 30 * 60 * 1000

export function QuinielaProvider({ children }) {
  const { user } = useAuth()
  const [matches, setMatches]                   = useState([])
  const [syncing, setSyncing]                   = useState(false)
  const [lastSync, setLastSync]                 = useState(null)
  const [extraTeams, setExtraTeams]             = useState([])
  const [activeQuinielaId, setActiveQuinielaId] = useState(null)
  const [quinielaInfo, setQuinielaInfo]         = useState(null)
  const [participants, setParticipants]         = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    const unsub = listenMatches(setMatches)
    syncScores()
    return unsub
  }, [])

  // Cargar quiniela activa y escuchar quiniela + participantes en tiempo real
  useEffect(() => {
    if (!user?.uid) return

    const subs = { quiniela: null, parts: null }
    let listenedId = null

    function subscribe(id) {
      if (!id || id === listenedId) return
      listenedId = id
      subs.quiniela?.()
      subs.parts?.()
      setActiveQuinielaId(id)
      subs.quiniela = listenQuiniela(id, q => {
        setExtraTeams(q?.extraTeams ?? [])
        setQuinielaInfo(q)
      })
      subs.parts = listenParticipants(id, setParticipants)
      // Sincroniza la foto de perfil de Google silenciosamente
      if (user?.photoURL) syncParticipantPhoto(id, user.uid, user.photoURL).catch(() => {})
    }

    // Carga inicial: admin que aún no tiene users/{uid}.activeQuinielaId
    getActiveQuinielaId(user.uid).then(id => subscribe(id))

    // Reactivo: detecta join/create después del montaje
    const unsubUser = listenActiveQuinielaId(user.uid, id => subscribe(id))

    return () => { unsubUser(); subs.quiniela?.(); subs.parts?.() }
  }, [user?.uid])

  // Premio acumulado reactivo
  const prizePool = useMemo(() => {
    if (!quinielaInfo?.tarifa) return null
    const { tarifa, tarifaMode } = quinielaInfo
    if (tarifaMode === 'por_equipo') {
      const totalTeams = participants.reduce((s, p) => s + (p.teams?.length ?? 0), 0)
      return totalTeams * tarifa
    }
    const totalExtras = participants.reduce((s, p) => s + (p.extrasBought ?? 0), 0)
    return (participants.length + totalExtras) * tarifa
  }, [participants, quinielaInfo])

  const syncScores = useCallback(async () => {
    setSyncing(true)
    try {
      const data = await fetchMatches()
      await saveMatches(data)
      setLastSync(new Date())
    } catch (e) {
      console.warn('Sync failed:', e?.message)
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
    timerRef.current = setInterval(syncScores, hasLive ? AUTO_SYNC_MS : IDLE_SYNC_MS)
    return () => clearInterval(timerRef.current)
  }, [matches, syncScores])

  return (
    <QuinielaContext.Provider value={{
      matches, syncing, lastSync, syncScores,
      extraTeams, activeQuinielaId, quinielaInfo,
      participants, prizePool,
    }}>
      {children}
    </QuinielaContext.Provider>
  )
}

export function useQuiniela() {
  return useContext(QuinielaContext)
}
