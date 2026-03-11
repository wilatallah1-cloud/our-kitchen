import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Mountain, Percent } from 'lucide-react'
import { useAI } from '../../hooks/useAI'
import Button from '../ui/Button'

export default function BakingTools({ recipe, servings }) {
  const [showConverter, setShowConverter] = useState(false)
  const [showPercentage, setShowPercentage] = useState(false)
  const [showAltitude, setShowAltitude] = useState(false)
  const [altitude, setAltitude] = useState('')
  const [altitudeResult, setAltitudeResult] = useState(null)
  const [unit, setUnit] = useState('cups') // cups, grams, oz
  const { getBakingAdjustment, loading } = useAI()

  async function handleAltitudeCalc() {
    if (!altitude) return
    const result = await getBakingAdjustment(recipe, altitude)
    setAltitudeResult(result)
  }

  // Simple baker's percentage: each ingredient as % of total flour
  function calculateBakersPercentage() {
    const ingredients = recipe.ingredients || []
    const flourIngredients = ingredients.filter((i) =>
      i.toLowerCase().includes('flour')
    )
    // Rough extraction: find the number at the start
    let totalFlour = 0
    for (const fi of flourIngredients) {
      const match = fi.match(/^([\d.]+)/)
      if (match) totalFlour += parseFloat(match[1])
    }
    if (totalFlour === 0) return null

    return ingredients.map((ing) => {
      const match = ing.match(/^([\d.]+)/)
      const qty = match ? parseFloat(match[1]) : 0
      const pct = totalFlour > 0 ? ((qty / totalFlour) * 100).toFixed(0) : '—'
      return { ingredient: ing, percentage: pct }
    })
  }

  const bakersPercentages = showPercentage ? calculateBakersPercentage() : null

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowConverter(!showConverter)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showConverter ? 'bg-bakery-100 text-bakery-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Units
        </button>
        <button
          onClick={() => setShowPercentage(!showPercentage)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showPercentage ? 'bg-bakery-100 text-bakery-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          Baker&apos;s %
        </button>
        <button
          onClick={() => setShowAltitude(!showAltitude)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showAltitude ? 'bg-bakery-100 text-bakery-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          Altitude
        </button>
      </div>

      <AnimatePresence>
        {showConverter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-bakery-50 rounded-xl text-xs space-y-2">
              <div className="flex gap-1">
                {['cups', 'grams', 'oz'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      unit === u ? 'bg-bakery-200 text-bakery-800' : 'bg-white text-stone-600'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <p className="text-stone-500">
                Toggle above to see approximate conversions for common baking ingredients.
              </p>
            </div>
          </motion.div>
        )}

        {showPercentage && bakersPercentages && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-bakery-50 rounded-xl text-xs space-y-1">
              <h4 className="font-medium text-bakery-800 mb-1">Baker&apos;s Percentage</h4>
              {bakersPercentages.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-stone-600">{item.ingredient}</span>
                  <span className="font-medium text-bakery-700">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {showAltitude && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-bakery-50 rounded-xl text-xs space-y-2">
              <h4 className="font-medium text-bakery-800">Altitude Adjustment</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                  placeholder="Altitude (feet)"
                  className="flex-1 rounded-lg border border-bakery-200 px-2 py-1.5 text-xs focus:ring-1 focus:ring-bakery-500"
                />
                <Button size="sm" variant="bakery" onClick={handleAltitudeCalc} loading={loading}>
                  Calculate
                </Button>
              </div>
              {altitudeResult && (
                <div className="space-y-1 mt-2">
                  {altitudeResult.adjustments?.map((adj, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg">
                      <span className="font-medium text-stone-700">{adj.item}:</span>
                      <span className="text-stone-500"> {adj.original} → {adj.adjusted}</span>
                      <p className="text-stone-400 mt-0.5">{adj.reason}</p>
                    </div>
                  ))}
                  {altitudeResult.generalTip && (
                    <p className="text-bakery-600 italic mt-1">{altitudeResult.generalTip}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
