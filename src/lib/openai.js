import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This runs in the browser for this demo/local app
})

export async function transcribeAudio(audioBlob) {
  try {
    const file = new File([audioBlob], 'recipe_audio.webm', { type: 'audio/webm' })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })

    return transcription.text
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
}

export async function parseRecipeFromTranscript(transcript) {
  try {
    const prompt = `You are a culinary AI assistant. Convert the following spoken recipe transcript into a structured recipe format.

Transcript: "${transcript}"

Extract and format the recipe as JSON matching this exact schema:
{
  "title": "recipe title (make it sound good)",
  "description": "short description based on what they said",
  "category": "e.g. Pasta, Soup, Cake (infer if not stated)",
  "ingredients": ["2 cups flour", "1 tsp salt", "(extract all mentioned ingredients with their quantities)"],
  "steps": ["Preheat oven to 350F", "Mix dry ingredients", "(extract chronological instructions)"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy"
}

Note: If a specific time (prep/cook) or servings isn't mentioned, leave the field as an empty string ("") or 0.
Return ONLY valid JSON.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful culinary AI that structures spoken recipes into JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })

    const resultText = response.choices[0].message.content
    return JSON.parse(resultText)
  } catch (error) {
    console.error('Error parsing recipe from transcript:', error)
    throw error
  }
}
