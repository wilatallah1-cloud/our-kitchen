import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import { useAI } from '../../hooks/useAI'
import { cookbookThemes } from '../../lib/recipeUtils'

const STARTERS = [
  'Can I make this ahead?',
  'What wine pairs with this?',
  'How do I store leftovers?',
  'Can I make this vegan?',
]

export default function RecipeChat({ recipe, cookbook, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const { chatWithRecipe } = useAI()
  const scrollRef = useRef(null)
  const theme = cookbookThemes[cookbook] || cookbookThemes.moms

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text) {
    const message = text || input.trim()
    if (!message || streaming) return

    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setInput('')
    setStreaming(true)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    await chatWithRecipe(recipe, message, (partial) => {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: partial }
        return updated
      })
    })

    setStreaming(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 md:bottom-20 right-4 z-40 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[500px]"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${theme.heroGradient} text-white`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Recipe Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-stone-500 mb-3">Ask me anything about this recipe!</p>
            {STARTERS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-3 py-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-br-md'
                  : 'bg-stone-100 text-stone-700 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this recipe..."
            disabled={streaming}
            className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSend()}
            disabled={streaming || !input.trim()}
            className="p-2 bg-stone-800 text-white rounded-xl hover:bg-stone-900 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
