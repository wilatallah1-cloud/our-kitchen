import { useParams, useSearchParams } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import RecipeDetailView from '../components/recipes/RecipeDetail'
import { RecipeDetailSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const cookbook = searchParams.get('cb') || 'moms'
  const { recipe, loading } = useRecipe(id, cookbook)

  if (loading) return <div className="p-4"><RecipeDetailSkeleton /></div>

  if (!recipe) {
    return (
      <div className="p-4">
        <EmptyState
          icon="🍽️"
          title="Recipe not found"
          description="This recipe may have been deleted or the link is incorrect."
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <RecipeDetailView recipe={recipe} cookbook={cookbook} />
    </div>
  )
}
