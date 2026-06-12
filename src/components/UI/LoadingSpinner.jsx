export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-yellow-500 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">⚽</span>
      </div>
      <p className="text-zinc-500 text-sm">{text}</p>
    </div>
  )
}
