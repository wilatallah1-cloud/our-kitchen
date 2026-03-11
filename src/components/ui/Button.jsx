import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-stone-800 text-white hover:bg-stone-900 focus:ring-stone-500',
  secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 focus:ring-stone-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-stone-600 hover:bg-stone-100 focus:ring-stone-400',
  moms: 'bg-moms-600 text-white hover:bg-moms-700 focus:ring-moms-500',
  bakery: 'bg-bakery-600 text-white hover:bg-bakery-700 focus:ring-bakery-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, disabled, loading, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

export default Button
