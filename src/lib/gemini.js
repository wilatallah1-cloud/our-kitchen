import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

export async function generateAIResponse(prompt, systemInstruction = '') {
  const chat = geminiModel.startChat({
    history: [],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    ...(systemInstruction && { systemInstruction }),
  })
  const result = await chat.sendMessage(prompt)
  return result.response.text()
}

export async function streamAIResponse(prompt, systemInstruction = '', onChunk) {
  const chat = geminiModel.startChat({
    history: [],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    ...(systemInstruction && { systemInstruction }),
  })
  const result = await chat.sendMessageStream(prompt)
  let full = ''
  for await (const chunk of result.stream) {
    const text = chunk.text()
    full += text
    onChunk?.(full)
  }
  return full
}

export async function generateJSON(prompt, systemInstruction = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
    },
    ...(systemInstruction && { systemInstruction }),
  })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}
