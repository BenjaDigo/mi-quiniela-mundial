import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getQuiniela, joinQuiniela } from '../services/firestoreService'

export default function JoinQuiniela() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      const q = await getQuiniela(code.trim().toUpperCase())
      if (!q) { toast.error('Código no válido'); return }
      await joinQuiniela(q.id, user)
      toast.success(`¡Te uniste a "${q.name}"! 🎉`)
      navigate('/dashboard')
    } catch {
      toast.error('Error al unirse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎟️</div>
          <h1 className="text-3xl font-black gold-text">Unirse a quiniela</h1>
          <p className="text-zinc-500 text-sm mt-1">Ingresa el código que te compartió el admin</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Código de invitación</label>
              <div className="relative">
                <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  className="input-dark pl-10 font-mono tracking-widest text-yellow-400 uppercase"
                  placeholder="XXXXXXXX" maxLength={12}
                />
              </div>
            </div>
            <button type="submit" disabled={loading || !code} className="btn-gold w-full h-11 text-sm">
              {loading ? 'Uniéndome...' : 'Entrar a la quiniela ⚽'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          El código lo genera el administrador de la quiniela
        </p>
      </motion.div>
    </div>
  )
}
