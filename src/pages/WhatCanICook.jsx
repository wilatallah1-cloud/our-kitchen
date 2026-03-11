import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, X, ShoppingCart, ChefHat, Sparkles } from 'lucide-react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAI } from '../hooks/useAI'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { formatTime, totalTime } from '../lib/recipeUtils'

export default function WhatCanICook() {
  const [ingredients, setIngredients] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [allRecipes, setAllRecipes] = useState([])
  const [results, setResults] = useState(null)
  const [loadingRecipes, setLoadingRecipes] = useState(true)
  const { whatCanICook, loading: aiLoading } = useAI()

  useEffect(() => {
    async function fetchAll() {
      try {
        const [momsSnap, bakerySnap] = await Promise.all([
          getDocs(collection(db, 'recipes_moms')),
          getDocs(collection(db, 'recipes_bakery')),
        ])
        const moms = momsSnap.docs.map((d) => ({ id: d.id, cookbook: 'moms', ...d.data() }))
        const bakery = bakerySnap.docs.map((d) => ({ id: d.id, cookbook: 'bakery', ...d.data() }))
        setAllRecipes([...moms, ...bakery])
      } catch (err) {
        console.error(err)
      }
      setLoadingRecipes(false)
    }
    fetchAll()
  }, [])

  function addIngredient() {
    const trimmed = inputValue.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setInputValue('')
    }
  }

  function removeIngredient(ing) {
    setIngredients(ingredients.filter((i) => i !== ing))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredient()
    }
  }

  async function handleSearch() {
    if (ingredients.length === 0) return
    const result = await whatCanICook(ingredients, allRecipes)
    setResults(result)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl">🔍</span>
          <h1 className="text-2xl font-bold text-stone-800 mt-3">What Can I Cook?</h1>
          <p className="text-stone-500 mt-1">
            Enter the ingredients you have and we&apos;ll find matching recipes
          </p>
        </div>

        {/* Ingredient input */}
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient and press Enter..."
              className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
            <Button variant="secondary" onClick={addIngredient}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {ing}
                  <button onClick={() => removeIngredient(ing)} className="hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={handleSearch}
            loading={aiLoading}
            disabled={ingredients.length === 0 || loadingRecipes}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            Find Recipes
          </Button>
        </div>

        {/* Results */}
        {aiLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}

        {results && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Shopping tip */}
            {results.shoppingTip && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">{results.shoppingTip}</p>
                </div>
              </div>
            )}

            {/* Matches */}
            {results.matches?.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-stone-800">
                  {results.matches.length} recipe{results.matches.length !== 1 ? 's' : ''} found
                </h2>
                {results.matches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/recipe/${match.id}?cb=${match.cookbook}`}
                    className="block p-4 bg-white rounded-2xl border border-stone-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{match.cookbook === 'moms' ? '🍲' : '🧁'}</span>
                        <h3 className="font-medium text-stone-800">{match.title}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.matchPercentage >= 80
                          ? 'bg-green-100 text-green-700'
                          : match.matchPercentage >= 60
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {match.matchPercentage}% match
                      </span>
                    </div>

                    {match.missingIngredients?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-stone-500">Missing:</span>
                        {match.missingIngredients.map((mi) => (
                          <Badge key={mi} variant="red">{mi}</Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">😕</span>
                <p className="text-stone-500">No matching recipes found. Try adding more ingredients!</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
