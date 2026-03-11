import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useAI } from '../../hooks/useAI'

export default function SubstitutePopover({ ingredient, recipeTitle }) {
  const [show, setShow] = useState(false)
  const [substitutes, setSubstitutes] = useState(null)
  const { getSubstitutes, loading } = useAI()

  async function handleClick() {
    if (show) {
      setShow(false)
      return
    }
    setShow(true)
    if (!substitutes) {
      const result = await getSubstitutes(ingredient, recipeTitle)
      setSubstitutes(result)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-1 text-stone-400 hover:text-stone-600 transition-colors opacity-0 group-hover:opacity-100"
        title="Find substitutes"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute right-0 top-8 z-20 w-64 bg-white rounded-xl shadow-lg border border-stone-200 p-3"
          >
            <h4 className="text-xs font-semibold text-stone-700 mb-2">
              Substitutes for &ldquo;{ingredient}&rdquo;
            </h4>
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ) : substitutes?.length > 0 ? (
              <ul className="space-y-2">
                {substitutes.map((sub, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-medium text-stone-700">{sub.name}</span>
                    <p className="text-stone-500 mt-0.5">{sub.explanation}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500">No substitutes found.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
