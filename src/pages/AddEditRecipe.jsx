import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RecipeForm from '../components/recipes/RecipeForm'
import { RecipeDetailSkeleton } from '../components/ui/Skeleton'
import { useRecipe, addRecipe, updateRecipe, uploadRecipePhotos } from '../hooks/useRecipes'
import { useAI } from '../hooks/useAI'
import toast from 'react-hot-toast'

export default function AddEditRecipe() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const cookbook = searchParams.get('cb') || ''
  const navigate = useNavigate()
  const isEditing = !!id
  const { recipe, loading: recipeLoading } = useRecipe(id, cookbook)
  const { getAutoTags } = useAI()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(formData, photoFiles) {
    setSaving(true)
    try {
      const cb = formData.cookbook || 'moms'
      let photoUrls = formData.existingPhotos || []

      if (isEditing) {
        // Upload new photos
        if (photoFiles?.length > 0) {
          const newUrls = await uploadRecipePhotos(cb, id, photoFiles)
          photoUrls = [...photoUrls, ...newUrls]
        }

        const { existingPhotos, ...rest } = formData
        await updateRecipe(cb, id, { ...rest, photos: photoUrls })
        toast.success('Recipe updated!')
        navigate(`/recipe/${id}?cb=${cb}`)
      } else {
        // Create recipe first to get ID
        const { existingPhotos, ...rest } = formData
        const newId = await addRecipe(cb, { ...rest, photos: [] })

        // Upload photos with the new ID
        if (photoFiles?.length > 0) {
          const urls = await uploadRecipePhotos(cb, newId, photoFiles)
          await updateRecipe(cb, newId, { photos: urls })
        }

        // Auto-tag in background
        getAutoTags(formData).then(async (tags) => {
          if (tags?.length > 0) {
            const mergedTags = [...new Set([...(formData.tags || []), ...tags])]
            await updateRecipe(cb, newId, { tags: mergedTags })
          }
        })

        toast.success('Recipe saved!')
        navigate(`/recipe/${newId}?cb=${cb}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save recipe')
    }
    setSaving(false)
  }

  if (isEditing && recipeLoading) {
    return <div className="p-4"><RecipeDetailSkeleton /></div>
  }

  const initialData = isEditing && recipe
    ? {
        ...recipe,
        existingPhotos: recipe.photos || [],
      }
    : undefined

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-800 mb-6">
          {isEditing ? 'Edit Recipe' : 'Add New Recipe'}
        </h1>

        <RecipeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={isEditing}
        />
      </motion.div>
    </div>
  )
}
