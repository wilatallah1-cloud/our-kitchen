import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, Sparkles } from 'lucide-react'
import { useCookbookStats, useAllRecentRecipes } from '../hooks/useRecipes'
import { Skeleton } from '../components/ui/Skeleton'
import WhatCanICookWidget from '../components/ai/WhatCanICookWidget'
import { formatTime } from '../lib/recipeUtils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function CookbookCard({ to, icon, name, tagline, count, lastAdded, gradient }) {
  return (
    <motion.div variants={item}>
      <Link
        to={to}
        className="block group relative overflow-hidden rounded-2xl h-64 sm:h-72"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          <div>
            <span className="text-4xl">{icon}</span>
            <h2 className="text-2xl font-bold mt-3">{name}</h2>
            <p className="text-white/80 text-sm mt-1">{tagline}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{count} recipes</p>
              {lastAdded && (
                <p className="text-xs text-white/70 mt-0.5">Last: {lastAdded}</p>
              )}
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const { stats, loading: statsLoading } = useCookbookStats()
  const { recipes: recent, loading: recentLoading } = useAllRecentRecipes(5)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-2">
          Welcome to Our Kitchen
        </h1>
        <p className="text-stone-500">All our family recipes in one place</p>
      </motion.div>

      {/* Cookbook Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8"
      >
        {statsLoading ? (
          <>
            <Skeleton className="h-64 sm:h-72" />
            <Skeleton className="h-64 sm:h-72" />
          </>
        ) : (
          <>
            <CookbookCard
              to="/moms"
              icon="🍲"
              name="Mom's Kitchen"
              tagline="Recipes passed down with love"
              count={stats.moms.count}
              lastAdded={stats.moms.lastAdded}
              gradient="from-moms-700 via-moms-600 to-amber-600"
            />
            <CookbookCard
              to="/bakery"
              icon="🧁"
              name="Girlfriend's Bakery"
              tagline="Baked with patience and sugar"
              count={stats.bakery.count}
              lastAdded={stats.bakery.lastAdded}
              gradient="from-bakery-700 via-purple-600 to-pink-500"
            />
          </>
        )}
      </motion.div>

      {/* What Can I Cook */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <WhatCanICookWidget />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-stone-400" />
          Recent Activity
        </h2>

        {recentLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map((r) => (
              <Link
                key={`${r.cookbook}-${r.id}`}
                to={`/recipe/${r.id}?cb=${r.cookbook}`}
                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-stone-200 hover:shadow-sm transition-shadow"
              >
                <span className="text-2xl">{r.cookbook === 'moms' ? '🍲' : '🧁'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{r.title}</p>
                  <p className="text-xs text-stone-500">
                    {r.category || 'No category'} • {formatTime((r.prepTime || 0) + (r.cookTime || 0))}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-stone-500">No recipes yet. Add your first one!</p>
            <Link
              to="/add"
              className="inline-block mt-4 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors"
            >
              Add Recipe
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
