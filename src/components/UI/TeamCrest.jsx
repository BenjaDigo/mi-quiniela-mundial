export default function TeamCrest({ team, size = 32, className = '' }) {
  if (!team) return null
  if (team.flagUrl) {
    return (
      <img
        src={team.flagUrl}
        alt={team.name}
        width={size}
        height={Math.round(size * 0.67)}
        className={`object-cover rounded-sm shadow-sm ${className}`}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    )
  }
  return <span className={className}>{team.flag}</span>
}
