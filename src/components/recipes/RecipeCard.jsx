import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Star, ChefHat } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatTime, totalTime, difficultyColor } from '../../lib/recipeUtils'

export default function RecipeCard({ recipe, cookbook }) {
  const cb = cookbook || recipe.cookbook || 'moms'
  const photo = recipe.photos?.[0]
  const total = totalTime(recipe.prepTime, recipe.cookTime)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/recipe/${recipe.id}?cb=${cb}`}
        className="block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow group"
      >
        <div className="relative h-48 overflow-hidden bg-stone-100">
          {photo ? (
            <img
              src={photo}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {cb === 'moms' ? '🍲' : '🧁'}
            </div>
          )}
          {recipe.difficulty && (
            <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${difficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-stone-800 mb-1 line-clamp-1">{recipe.title}</h3>
          {recipe.category && (
            <p className="text-xs text-stone-500 mb-2">{recipe.category}</p>
          )}

          <div className="flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(total)}</span>
            </div>

            {recipe.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{recipe.rating}</span>
              </div>
            )}

            {recipe.timesCooked > 0 && (
              <div className="flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5" />
                <span>{recipe.timesCooked}x</span>
              </div>
            )}
          </div>

          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant={cb === 'moms' ? 'moms' : 'bakery'}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
