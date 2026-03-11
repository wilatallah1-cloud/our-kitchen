import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, Users, ChefHat, Flame, Edit, Trash2, Check, ArrowLeft,
  MessageCircle, MonitorSmartphone,
} from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import Modal from '../ui/Modal'
import RecipeChat from '../ai/RecipeChat'
import SubstitutePopover from '../ai/SubstitutePopover'
import BakingTools from '../baking/BakingTools'
import { formatTime, totalTime, difficultyColor, scaleIngredient, cookbookThemes } from '../../lib/recipeUtils'
import { markMadeIt, deleteRecipe } from '../../hooks/useRecipes'
import toast from 'react-hot-toast'

export default function RecipeDetailView({ recipe, cookbook }) {
  const navigate = useNavigate()
  const theme = cookbookThemes[cookbook] || cookbookThemes.moms
  const [servings, setServings] = useState(recipe.servings || 4)
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())
  const [checkedSteps, setCheckedSteps] = useState(new Set())
  const [showChat, setShowChat] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMadeItModal, setShowMadeItModal] = useState(false)
  const [madeItRating, setMadeItRating] = useState(0)
  const [wakeLock, setWakeLock] = useState(null)
  const [screenAwake, setScreenAwake] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const total = totalTime(recipe.prepTime, recipe.cookTime)
  const isBakery = cookbook === 'bakery'

  function toggleIngredient(i) {
    const next = new Set(checkedIngredients)
    next.has(i) ? next.delete(i) : next.add(i)
    setCheckedIngredients(next)
  }

  function toggleStep(i) {
    const next = new Set(checkedSteps)
    next.has(i) ? next.delete(i) : next.add(i)
    setCheckedSteps(next)
  }

  async function handleMadeIt() {
    try {
      await markMadeIt(cookbook, recipe.id, recipe.timesCooked, madeItRating || undefined)
      toast.success('Awesome! Marked as cooked!')
      setShowMadeItModal(false)
    } catch {
      toast.error('Failed to update')
    }
  }

  async function handleDelete() {
    try {
      await deleteRecipe(cookbook, recipe.id)
      toast.success('Recipe deleted')
      navigate(`/${cookbook}`)
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function toggleScreenAwake() {
    if (screenAwake && wakeLock) {
      wakeLock.release()
      setWakeLock(null)
      setScreenAwake(false)
      toast.success('Screen will sleep normally')
      return
    }
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen')
        setWakeLock(lock)
        setScreenAwake(true)
        toast.success('Screen will stay awake')
      }
    } catch {
      toast.error('Wake lock not supported')
    }
  }

  useEffect(() => {
    return () => wakeLock?.release()
  }, [wakeLock])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero photo */}
      <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-stone-100 mb-6">
        {recipe.photos?.length > 0 ? (
          <>
            <img
              src={recipe.photos[currentPhoto]}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            {recipe.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {recipe.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentPhoto ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {theme.icon}
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-stone-600">{recipe.description}</p>
          )}
          {recipe.category && (
            <Badge className="mt-2" variant={cookbook === 'moms' ? 'moms' : 'bakery'}>
              {recipe.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleScreenAwake}
            title="Keep screen awake"
          >
            <MonitorSmartphone className="w-4 h-4" />
            {screenAwake ? 'On' : 'Off'}
          </Button>
          <Button
            variant={cookbook === 'moms' ? 'moms' : 'bakery'}
            size="sm"
            onClick={() => setShowMadeItModal(true)}
          >
            <ChefHat className="w-4 h-4" /> Made it!
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/edit/${recipe.id}?cb=${cookbook}`)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Story */}
      {recipe.story && (
        <div className="mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-200 italic text-stone-600">
          &ldquo;{recipe.story}&rdquo;
        </div>
      )}

      {/* Info bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { icon: Clock, label: 'Prep', value: formatTime(recipe.prepTime) },
          { icon: Flame, label: 'Cook', value: formatTime(recipe.cookTime) },
          { icon: Clock, label: 'Total', value: formatTime(total) },
          { icon: Users, label: 'Servings', value: recipe.servings || '—' },
          { icon: ChefHat, label: 'Cooked', value: `${recipe.timesCooked || 0}x` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center p-3 bg-white rounded-2xl border border-stone-200">
            <Icon className="w-5 h-5 text-stone-400 mb-1" />
            <span className="text-xs text-stone-500">{label}</span>
            <span className="text-sm font-semibold text-stone-700">{value}</span>
          </div>
        ))}
      </div>

      {/* Difficulty and Rating */}
      <div className="flex items-center gap-4 mb-8">
        {recipe.difficulty && (
          <span className={`px-3 py-1 rounded-xl text-sm font-medium ${difficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        )}
        {recipe.rating > 0 && <StarRating rating={recipe.rating} readonly size="sm" />}
      </div>

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {recipe.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="md:col-span-1">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800">Ingredients</h2>
            </div>

            {/* Serving scaler */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-stone-50 rounded-xl">
              <Users className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-600">Servings:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                className="w-16 rounded-lg border border-stone-300 px-2 py-1 text-sm text-center focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            {isBakery && <BakingTools recipe={recipe} servings={servings} />}

            <ul className="space-y-2">
              {recipe.ingredients?.map((ing, i) => {
                const scaled = scaleIngredient(ing, recipe.servings || 4, servings)
                return (
                  <li key={i} className="flex items-start gap-3 group">
                    <button
                      onClick={() => toggleIngredient(i)}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checkedIngredients.has(i)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {checkedIngredients.has(i) && <Check className="w-3 h-3" />}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        checkedIngredients.has(i) ? 'line-through text-stone-400' : 'text-stone-700'
                      }`}
                    >
                      {scaled}
                    </span>
                    <SubstitutePopover ingredient={ing} recipeTitle={recipe.title} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Steps */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.steps?.map((s, i) => (
              <li key={i} className="flex gap-4 group">
                <button
                  onClick={() => toggleStep(i)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-medium transition-colors ${
                    checkedSteps.has(i)
                      ? 'bg-green-500 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {checkedSteps.has(i) ? <Check className="w-4 h-4" /> : i + 1}
                </button>
                <p className={`text-sm leading-relaxed pt-1.5 ${
                  checkedSteps.has(i) ? 'line-through text-stone-400' : 'text-stone-700'
                }`}>
                  {s}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Chat toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`fixed bottom-24 md:bottom-8 right-4 z-30 p-4 rounded-2xl shadow-lg text-white transition-colors ${
          cookbook === 'moms' ? 'bg-moms-600 hover:bg-moms-700' : 'bg-bakery-600 hover:bg-bakery-700'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {showChat && (
        <RecipeChat
          recipe={recipe}
          cookbook={cookbook}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Made It Modal */}
      <Modal isOpen={showMadeItModal} onClose={() => setShowMadeItModal(false)} title="Made it!">
        <div className="p-6 space-y-4 text-center">
          <p className="text-lg">🎉 Nice! How was it?</p>
          <StarRating rating={madeItRating} onChange={setMadeItRating} size="lg" />
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setShowMadeItModal(false)}>Cancel</Button>
            <Button onClick={handleMadeIt}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Recipe">
        <div className="p-6 space-y-4 text-center">
          <p className="text-stone-600">
            Are you sure you want to delete <strong>{recipe.title}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
