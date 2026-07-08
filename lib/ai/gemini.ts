import { GoogleGenAI } from '@google/genai'
import { getPrompt, buildUserMessage, type AnalysisResult } from './prompts'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error(`Falha ao baixar imagem: ${response.status}`)

  const mimeType = response.headers.get('content-type') || 'image/jpeg'
  const buffer = Buffer.from(await response.arrayBuffer())
  return { data: buffer.toString('base64'), mimeType }
}

export async function analyzeImageWithGemini(
  imageUrl: string,
  imageType: string | null,
  fieldObservations: string | null
): Promise<AnalysisResult> {
  const { data, mimeType } = await fetchImageAsBase64(imageUrl)
  const userMessage = buildUserMessage(imageType, fieldObservations)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: userMessage },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    config: {
      systemInstruction: getPrompt(imageType),
      responseMimeType: 'application/json',
    },
  })

  const raw = response.text ?? ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Resposta da IA não contém JSON válido')
  }

  return JSON.parse(jsonMatch[0]) as AnalysisResult
}
