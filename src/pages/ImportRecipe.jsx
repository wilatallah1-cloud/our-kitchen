import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAI } from '../hooks/useAI'
import toast from 'react-hot-toast'

export default function ImportRecipe() {
  const [url, setUrl] = useState('')
  const { importFromURL, loading } = useAI()
  const navigate = useNavigate()

  async function handleImport() {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }
    const result = await importFromURL(url)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    if (result) {
      // Store imported data and navigate to add page
      sessionStorage.setItem('importedRecipe', JSON.stringify(result))
      toast.success('Recipe extracted! Review and save it.')
      navigate('/add')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="text-5xl block mb-4">📎</span>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Import Recipe from URL</h1>
        <p className="text-stone-500 mb-8">
          Paste a recipe URL and our AI will extract all the details for you
        </p>

        <div className="max-w-lg mx-auto space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe/chocolate-cake"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
            />
          </div>

          <Button onClick={handleImport} loading={loading} size="lg" className="w-full gap-2">
            <Sparkles className="w-5 h-5" />
            Extract Recipe
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
