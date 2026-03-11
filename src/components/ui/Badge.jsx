export default function Badge({ children, className = '', variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    default: 'bg-stone-100 text-stone-700',
    moms: 'bg-moms-100 text-moms-700',
    bakery: 'bg-bakery-100 text-bakery-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}
