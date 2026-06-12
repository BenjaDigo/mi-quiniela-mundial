import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    try {
      await register(form.email, form.password, form.name)
      toast.success('¡Cuenta creada! Bienvenido al mundial 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Ese correo ya existe' : 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4
                    bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.12),transparent)]">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-3xl font-black gold-text">Únete al mundial</h1>
          <p className="text-zinc-500 text-sm mt-1">Crea tu cuenta de quiniela</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-5">Registro</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',    label: 'Nombre',    type: 'text',     icon: User,  placeholder: 'Tu nombre' },
              { key: 'email',   label: 'Correo',    type: 'email',    icon: Mail,  placeholder: 'tu@correo.com' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type={type} required value={form[key]} onChange={set(key)}
                    className="input-dark pl-10" placeholder={placeholder} />
                </div>
              </div>
            ))}

            {['password', 'confirm'].map((key, i) => (
              <div key={key}>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                  {i === 0 ? 'Contraseña' : 'Confirmar contraseña'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type={showPwd ? 'text' : 'password'} required
                    value={form[key]} onChange={set(key)}
                    className="input-dark pl-10 pr-10" placeholder="••••••••" />
                  {i === 1 && (
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-gold w-full h-11 text-sm mt-1">
              {loading ? 'Creando cuenta...' : 'Crear cuenta 🚀'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">Iniciar sesión</Link>
        </p>
      </motion.div>
    </div>
  )
}
