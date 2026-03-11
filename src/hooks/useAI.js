import { useState, useCallback } from 'react'
import { generateAIResponse, streamAIResponse, generateJSON } from '../lib/gemini'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getRecipeSuggestions = useCallback(async (recipe) => {
    setLoading(true)
    setError(null)
    try {
      const prompt = `Analyze this recipe and return a JSON response:
Recipe Title: ${recipe.title}
Description: ${recipe.description || ''}
Category: ${recipe.category || ''}
Ingredients: ${(recipe.ingredients || []).join(', ')}
Steps: ${(recipe.steps || []).join(' | ')}
Prep Time: ${recipe.prepTime || '?'} min
Cook Time: ${recipe.cookTime || '?'} min

Return JSON with:
{
  "tags": ["tag1", "tag2", ...],  // 3-6 relevant tags like "vegetarian", "comfort food", "under 30 min", "Italian"
  "difficulty": "Easy" | "Medium" | "Hard",  // suggested difficulty
  "missingWarnings": ["warning1", ...],  // any potentially missing ingredients or steps
  "tip": "one practical tip to improve the recipe"
}`
      const result = await generateJSON(prompt)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  const getSubstitutes = useCallback(async (ingredient, recipeContext) => {
    setLoading(true)
    setError(null)
    try {
      const prompt = `For the ingredient "${ingredient}" used in a recipe for "${recipeContext}", suggest 2-3 substitutes. Return JSON:
{
  "substitutes": [
    { "name": "substitute name", "explanation": "brief explanation" }
  ]
}`
      const result = await generateJSON(prompt)
      setLoading(false)
      return result.substitutes || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  const getAutoTags = useCallback(async (recipe) => {
    try {
      const prompt = `Generate 3-6 tags for this recipe. Return JSON: { "tags": ["tag1", "tag2", ...] }
Title: ${recipe.title}
Category: ${recipe.category || ''}
Ingredients: ${(recipe.ingredients || []).join(', ')}
Prep+Cook: ${(recipe.prepTime || 0) + (recipe.cookTime || 0)} min`
      const result = await generateJSON(prompt)
      return result.tags || []
    } catch {
      return []
    }
  }, [])

  const chatWithRecipe = useCallback(async (recipe, message, onChunk) => {
    const systemPrompt = `You are a helpful cooking assistant. You are answering questions about this specific recipe:

Title: ${recipe.title}
Description: ${recipe.description || ''}
Category: ${recipe.category || ''}
Ingredients: ${(recipe.ingredients || []).join('\n- ')}
Steps: ${(recipe.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}
Prep Time: ${recipe.prepTime || '?'} min
Cook Time: ${recipe.cookTime || '?'} min
Servings: ${recipe.servings || '?'}
Difficulty: ${recipe.difficulty || '?'}

Be concise, friendly, and practical. If asked about substitutions, wine pairings, make-ahead tips, storage, or dietary modifications, give specific advice for THIS recipe.`

    return streamAIResponse(message, systemPrompt, onChunk)
  }, [])

  const whatCanICook = useCallback(async (availableIngredients, allRecipes) => {
    setLoading(true)
    setError(null)
    try {
      const recipeSummaries = allRecipes.map((r) => ({
        id: r.id,
        title: r.title,
        cookbook: r.cookbook,
        ingredients: r.ingredients || [],
      }))

      const prompt = `I have these ingredients: ${availableIngredients.join(', ')}

Here are my saved recipes:
${JSON.stringify(recipeSummaries, null, 2)}

Analyze which recipes I can make with my available ingredients. Return JSON:
{
  "matches": [
    {
      "id": "recipe id",
      "title": "recipe title",
      "cookbook": "moms or bakery",
      "matchPercentage": 85,
      "haveIngredients": ["ingredient1", ...],
      "missingIngredients": ["ingredient1", ...]
    }
  ],
  "shoppingTip": "Buy X and Y to unlock N more recipes"
}

Sort by matchPercentage descending. Only include recipes with >50% match.`

      const result = await generateJSON(prompt)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  const importFromURL = useCallback(async (url) => {
    setLoading(true)
    setError(null)
    try {
      const prompt = `I want to extract a recipe from this URL: ${url}

Please extract the recipe and return it as JSON matching this schema:
{
  "title": "recipe title",
  "description": "short description",
  "category": "e.g. Pasta, Soup, Cake",
  "ingredients": ["2 cups flour", "1 tsp salt", ...],
  "steps": ["Preheat oven to 350F", "Mix dry ingredients", ...],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy" | "Medium" | "Hard"
}

If you cannot access the URL, return: { "error": "Could not access the URL. Please paste the recipe text directly." }`

      const result = await generateJSON(prompt)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  const getBakingAdjustment = useCallback(async (recipe, altitude) => {
    setLoading(true)
    try {
      const prompt = `For a baking recipe at ${altitude} feet altitude:
Title: ${recipe.title}
Ingredients: ${(recipe.ingredients || []).join(', ')}
Oven temp in steps: check the steps
Steps: ${(recipe.steps || []).join(' | ')}

Return JSON with altitude adjustments:
{
  "adjustments": [
    { "item": "what to adjust", "original": "original value", "adjusted": "new value", "reason": "why" }
  ],
  "generalTip": "one general high-altitude baking tip"
}`
      const result = await generateJSON(prompt)
      setLoading(false)
      return result
    } catch (err) {
      setLoading(false)
      return null
    }
  }, [])

  const getSmartScalingNote = useCallback(async (recipe, originalServings, newServings) => {
    try {
      const prompt = `This baking recipe is being scaled from ${originalServings} to ${newServings} servings.
Ingredients: ${(recipe.ingredients || []).join(', ')}

Are there any ingredients that don't scale linearly (like baking powder, eggs, etc)?
Return JSON: { "notes": ["note1", "note2"] } — only return notes if there are non-linear scaling concerns.`
      const result = await generateJSON(prompt)
      return result.notes || []
    } catch {
      return []
    }
  }, [])

  return {
    loading,
    error,
    getRecipeSuggestions,
    getSubstitutes,
    getAutoTags,
    chatWithRecipe,
    whatCanICook,
    importFromURL,
    getBakingAdjustment,
    getSmartScalingNote,
  }
}
