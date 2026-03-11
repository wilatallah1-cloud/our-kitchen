import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/recipes/RecipeCard'
import { RecipeCardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { cookbookThemes, totalTime } from '../lib/recipeUtils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most-cooked', label: 'Most Cooked' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'a-z', label: 'A–Z' },
]

const TIME_FILTERS = [
  { value: 'all', label: 'Any time' },
  { value: 'under30', label: 'Under 30 min' },
  { value: '30to60', label: '30–60 min' },
  { value: 'over60', label: '60+ min' },
]

const DIFFICULTY_FILTERS = ['Easy', 'Medium', 'Hard']

export default function Cookbook() {
  const location = useLocation()
  const cb = location.pathname === '/bakery' ? 'bakery' : 'moms'
  const theme = cookbookThemes[cb]
  const { recipes, loading } = useRecipes(cb)
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const categories = useMemo(() => {
    const cats = new Set()
    recipes.forEach((r) => r.category && cats.add(r.category))
    return [...cats].sort()
  }, [recipes])

  const allTags = useMemo(() => {
    const tags = new Set()
    recipes.forEach((r) => r.tags?.forEach((t) => tags.add(t)))
    return [...tags].sort()
  }, [recipes])

  const filtered = useMemo(() => {
    let result = [...recipes]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.category?.toLowerCase().includes(q)
      )
    }

    // Difficulty
    if (difficultyFilter) {
      result = result.filter((r) => r.difficulty === difficultyFilter)
    }

    // Time
    if (timeFilter !== 'all') {
      result = result.filter((r) => {
        const t = totalTime(r.prepTime, r.cookTime)
        if (timeFilter === 'under30') return t < 30
        if (timeFilter === '30to60') return t >= 30 && t <= 60
        if (timeFilter === 'over60') return t > 60
        return true
      })
    }

    // Category
    if (categoryFilter) {
      result = result.filter((r) => r.category === categoryFilter)
    }

    // Tag
    if (tagFilter) {
      result = result.filter((r) => r.tags?.includes(tagFilter))
    }

    // Sort
    switch (sortBy) {
      case 'most-cooked':
        result.sort((a, b) => (b.timesCooked || 0) - (a.timesCooked || 0))
        break
      case 'highest-rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'a-z':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      default:
        result.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
    }

    return result
  }, [recipes, searchQuery, sortBy, difficultyFilter, timeFilter, categoryFilter, tagFilter])

  const hasActiveFilters = difficultyFilter || timeFilter !== 'all' || categoryFilter || tagFilter

  function clearFilters() {
    setDifficultyFilter('')
    setTimeFilter('all')
    setCategoryFilter('')
    setTagFilter('')
  }

  return (
    <div>
      {/* Hero */}
      <div className={`bg-gradient-to-r ${theme.heroGradient} text-white py-12 sm:py-16 px-4`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-5xl">{theme.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-bold mt-3">{theme.name}</h1>
            <p className="text-white/80 mt-1">{theme.tagline}</p>
            <p className="text-sm text-white/60 mt-2">{recipes.length} recipes</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search + Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>

            <Button
              variant={cb === 'moms' ? 'moms' : 'bakery'}
              size="md"
              onClick={() => navigate('/add')}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-6 p-4 bg-white rounded-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-700">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {DIFFICULTY_FILTERS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Cooking Time</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                >
                  {TIME_FILTERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Tag</label>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recipe grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} cookbook={cb} />
            ))}
          </div>
        ) : searchQuery || hasActiveFilters ? (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            description="Try adjusting your search or filters"
            actionLabel="Clear filters"
            onAction={() => { setSearchQuery(''); clearFilters() }}
          />
        ) : (
          <EmptyState
            icon={theme.icon}
            title={`No recipes in ${theme.name} yet`}
            description="Add your first recipe to get started!"
            actionLabel="Add Recipe"
            onAction={() => navigate('/add')}
          />
        )}
      </div>
    </div>
  )
}
