import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Loader2, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import { transcribeAudio, parseRecipeFromTranscript } from '../../lib/openai'
import toast from 'react-hot-toast'

export default function VoiceRecipeTranscriber({ onRecipeParsed }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState('')
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = processAudio

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      setTranscript('')

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
      
      // Stop all audio tracks to release the microphone fully
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return
    
    setIsProcessing(true)
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

    try {
      toast.loading('Transcribing audio...', { id: 'voice-recipe' })
      const rawText = await transcribeAudio(audioBlob)
      setTranscript(rawText)
      
      toast.loading('Structuring your recipe...', { id: 'voice-recipe' })
      const parsedRecipe = await parseRecipeFromTranscript(rawText)
      
      toast.success('Recipe processed successfully!', { id: 'voice-recipe' })
      onRecipeParsed(parsedRecipe)
      
    } catch (error) {
      console.error('Voice processing error:', error)
      toast.error('Failed to process recording. Please try again.', { id: 'voice-recipe' })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-emerald-600" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex-1 w-full">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-1">
            <Mic className="w-4 h-4" /> 
            Voice Recipe Creator
          </h3>
          <p className="text-xs text-emerald-600">
            Tell me what you made, ingredients, and steps. I'll write it out for you!
          </p>
          
          {transcript && !isProcessing && !isRecording && (
            <div className="mt-3 p-3 bg-white/60 rounded-xl text-xs text-stone-600 italic border border-emerald-50 max-h-32 overflow-y-auto">
              "{transcript}"
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-500 font-mono text-sm">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2.5 h-2.5 bg-red-500 rounded-full" 
              />
              {formatTime(recordingTime)}
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          )}

          {!isRecording && !isProcessing && (
            <Button 
              onClick={startRecording}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md gap-2"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </Button>
          )}

          {isRecording && (
            <Button 
              onClick={stopRecording}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 gap-2"
            >
              <Square className="w-4 h-4 fill-current" /> Stop Audio
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
