import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, GripVertical, Upload, Sparkles, Check, X, ChevronRight, ChevronLeft, Link as LinkIcon,
} from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useAI } from '../../hooks/useAI'
import toast from 'react-hot-toast'

function SortableStep({ id, index, value, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 group">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2.5 cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-600"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="mt-2.5 text-sm font-medium text-stone-400 w-6">{index + 1}.</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
        placeholder={`Step ${index + 1}...`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

const STEPS = ['Basics', 'Ingredients', 'Steps', 'Story & Photos', 'AI Review']

export default function RecipeForm({ initialData, onSubmit, isEditing = false }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    description: '',
    cookbook: 'moms',
    category: '',
    difficulty: 'Easy',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    steps: [''],
    story: '',
    tags: [],
    photos: [],
    existingPhotos: [],
    ...initialData,
  })
  const [photoFiles, setPhotoFiles] = useState([])
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const { getRecipeSuggestions, importFromURL, loading: aiLoading } = useAI()
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addIngredient() {
    update('ingredients', [...form.ingredients, ''])
  }

  function removeIngredient(index) {
    update('ingredients', form.ingredients.filter((_, i) => i !== index))
  }

  function updateIngredient(index, value) {
    const updated = [...form.ingredients]
    updated[index] = value
    update('ingredients', updated)
  }

  function addStep() {
    update('steps', [...form.steps, ''])
  }

  function removeStep(index) {
    update('steps', form.steps.filter((_, i) => i !== index))
  }

  function updateStep(index, value) {
    const updated = [...form.steps]
    updated[index] = value
    update('steps', updated)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = form.steps.findIndex((_, i) => `step-${i}` === active.id)
      const newIndex = form.steps.findIndex((_, i) => `step-${i}` === over.id)
      update('steps', arrayMove(form.steps, oldIndex, newIndex))
    }
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files)
    setPhotoFiles((prev) => [...prev, ...files])
  }

  function removePhoto(index) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingPhoto(index) {
    update('existingPhotos', form.existingPhotos.filter((_, i) => i !== index))
  }

  async function handleAIReview() {
    const suggestions = await getRecipeSuggestions(form)
    if (suggestions) {
      setAiSuggestions(suggestions)
      toast.success('AI review complete!')
    } else {
      toast.error('Could not get AI suggestions')
    }
  }

  function acceptTag(tag) {
    if (!form.tags.includes(tag)) {
      update('tags', [...form.tags, tag])
    }
  }

  function acceptDifficulty(d) {
    update('difficulty', d)
  }

  async function handleImportURL() {
    if (!importUrl.trim()) return
    setImporting(true)
    const result = await importFromURL(importUrl)
    setImporting(false)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    if (result) {
      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        category: result.category || prev.category,
        ingredients: result.ingredients?.length ? result.ingredients : prev.ingredients,
        steps: result.steps?.length ? result.steps : prev.steps,
        prepTime: result.prepTime || prev.prepTime,
        cookTime: result.cookTime || prev.cookTime,
        servings: result.servings || prev.servings,
        difficulty: result.difficulty || prev.difficulty,
      }))
      toast.success('Recipe imported! Review and save.')
      setStep(0)
    }
  }

  function handleSubmit() {
    const filteredIngredients = form.ingredients.filter((i) => i.trim())
    const filteredSteps = form.steps.filter((s) => s.trim())
    if (!form.title.trim()) {
      toast.error('Please enter a recipe title')
      setStep(0)
      return
    }
    if (filteredIngredients.length === 0) {
      toast.error('Please add at least one ingredient')
      setStep(1)
      return
    }
    if (filteredSteps.length === 0) {
      toast.error('Please add at least one step')
      setStep(2)
      return
    }
    onSubmit({
      ...form,
      ingredients: filteredIngredients,
      steps: filteredSteps,
      prepTime: Number(form.prepTime) || 0,
      cookTime: Number(form.cookTime) || 0,
      servings: Number(form.servings) || 1,
    }, photoFiles)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Import from URL */}
      {!isEditing && (
        <div className="mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-stone-500" />
            <span className="text-sm font-medium text-stone-700">Import from URL</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="Paste recipe URL..."
              className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
            <Button onClick={handleImportURL} loading={importing} size="sm">
              Import
            </Button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i === step
                  ? 'bg-stone-800 text-white'
                  : i < step
                  ? 'bg-green-100 text-green-700'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] text-stone-500 hidden sm:block">{s}</span>
          </button>
        ))}
      </div>

      {/* Form steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Grandma's Chocolate Cake"
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="A short summary of this recipe..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cookbook *</label>
                  <select
                    value={form.cookbook}
                    onChange={(e) => update('cookbook', e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  >
                    <option value="moms">🍲 Mom&apos;s Kitchen</option>
                    <option value="bakery">🧁 Girlfriend&apos;s Bakery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    placeholder="e.g. Pasta, Soup, Cake"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => update('difficulty', e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prep (min)</label>
                  <input
                    type="number"
                    value={form.prepTime}
                    onChange={(e) => update('prepTime', e.target.value)}
                    placeholder="15"
                    min="0"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cook (min)</label>
                  <input
                    type="number"
                    value={form.cookTime}
                    onChange={(e) => update('cookTime', e.target.value)}
                    placeholder="30"
                    min="0"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Servings</label>
                  <input
                    type="number"
                    value={form.servings}
                    onChange={(e) => update('servings', e.target.value)}
                    placeholder="4"
                    min="1"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Ingredients */}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-800">Ingredients</h3>
              {form.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateIngredient(i, e.target.value)}
                    placeholder={`e.g. 2 cups flour`}
                    className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="p-2 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addIngredient}>
                <Plus className="w-4 h-4" /> Add Ingredient
              </Button>
            </div>
          )}

          {/* Step 2: Steps */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-800">Instructions</h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={form.steps.map((_, i) => `step-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {form.steps.map((s, i) => (
                    <SortableStep
                      key={`step-${i}`}
                      id={`step-${i}`}
                      index={i}
                      value={s}
                      onChange={(val) => updateStep(i, val)}
                      onRemove={() => removeStep(i)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button variant="secondary" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4" /> Add Step
              </Button>
            </div>
          )}

          {/* Step 3: Story & Photos */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Story (optional)
                </label>
                <textarea
                  value={form.story}
                  onChange={(e) => update('story', e.target.value)}
                  placeholder="Tell us about this recipe... Where did it come from? What memories does it bring?"
                  rows={4}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:border-stone-400 transition-colors">
                  <Upload className="w-8 h-8 text-stone-400 mb-2" />
                  <span className="text-sm text-stone-500">Click to upload photos</span>
                  <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 10MB each</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {(form.existingPhotos?.length > 0 || photoFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-3">
                  {form.existingPhotos?.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group rounded-xl overflow-hidden">
                      <img src={url} alt="" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photoFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative group rounded-xl overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: AI Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Button
                  onClick={handleAIReview}
                  loading={aiLoading}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Get AI Suggestions
                </Button>
              </div>

              {aiSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Tags */}
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.tags?.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => acceptTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            form.tags.includes(tag)
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          {form.tags.includes(tag) ? '✓ ' : '+ '}{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  {aiSuggestions.difficulty && (
                    <div className="p-4 bg-amber-50 rounded-2xl">
                      <h4 className="text-sm font-medium text-amber-800 mb-2">Suggested Difficulty</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-amber-700">{aiSuggestions.difficulty}</span>
                        {form.difficulty !== aiSuggestions.difficulty && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => acceptDifficulty(aiSuggestions.difficulty)}
                          >
                            Accept
                          </Button>
                        )}
                        {form.difficulty === aiSuggestions.difficulty && (
                          <span className="text-xs text-green-600 font-medium">✓ Applied</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {aiSuggestions.missingWarnings?.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Missing Ingredient Warnings</h4>
                      <ul className="space-y-1">
                        {aiSuggestions.missingWarnings.map((w, i) => (
                          <li key={i} className="text-sm text-red-700">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tip */}
                  {aiSuggestions.tip && (
                    <div className="p-4 bg-green-50 rounded-2xl">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Pro Tip</h4>
                      <p className="text-sm text-green-700">{aiSuggestions.tip}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Current tags */}
              {form.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Current Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => update('tags', form.tags.filter((t) => t !== tag))}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-stone-200">
        <Button
          variant="secondary"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            {isEditing ? 'Update Recipe' : 'Save Recipe'}
          </Button>
        )}
      </div>
    </div>
  )
}
