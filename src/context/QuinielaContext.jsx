import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { listenMatches, saveMatches } from '../services/firestoreService'
import { fetchMatches } from '../services/footballApi'

const QuinielaContext = createContext(null)
const AUTO_SYNC_MS = 5 * 60 * 1000 // 5 minutos

export function QuinielaProvider({ children }) {
  const [matches, setMatches]     = useState([])
  const [syncing, setSyncing]     = useState(false)
  const [lastSync, setLastSync]   = useState(null)
  const timerRef = useRef(null)

  // Escuchar partidos en tiempo real desde Firestore
  useEffect(() => {
    const unsub = listenMatches(setMatches)
    return unsub
  }, [])

  // Sincronizar resultados desde la API de fútbol → Firestore
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

  // Auto-sync cada 5 min si hay partido en vivo
  useEffect(() => {
    const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
    if (hasLive) {
      timerRef.current = setInterval(syncScores, AUTO_SYNC_MS)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [matches, syncScores])

  return (
    <QuinielaContext.Provider value={{ matches, syncing, lastSync, syncScores }}>
      {children}
    </QuinielaContext.Provider>
  )
}

export function useQuiniela() {
  return useContext(QuinielaContext)
}
