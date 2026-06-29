import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AnalysisResult {
  visibleElements: string[]
  attentionPoints: {
    category: string
    description: string
    priority: 'high' | 'medium' | 'low'
    confidence: 'confirmed' | 'probable' | 'uncertain'
  }[]
  analysisLimitations: string[]
  suggestedReportText: string
}

const SYSTEM_PROMPT = `Você é um assistente especializado em análise visual de imagens aéreas de propriedades rurais captadas por drones.

Analise a imagem fornecida e retorne um JSON com a seguinte estrutura EXATA (sem markdown, apenas JSON puro):

{
  "visibleElements": ["elemento1", "elemento2"],
  "attentionPoints": [
    {
      "category": "pasture",
      "description": "Descrição objetiva do que foi observado",
      "priority": "high",
      "confidence": "probable"
    }
  ],
  "analysisLimitations": ["limitação1", "limitação2"],
  "suggestedReportText": "Texto completo sugerido para o relatório descrevendo as observações da imagem"
}

Categorias válidas: bovine, pasture, bare_soil, cattle_trail, wetland, fence, waterer, shade, crop, structure, attention_point
Prioridades válidas: high, medium, low
Confiança válida: confirmed, probable, uncertain

Regras obrigatórias:
- Esta é uma análise PRELIMINAR — nunca faça diagnósticos técnicos definitivos
- Descreva apenas o que é VISÍVEL na imagem — não invente
- Use linguagem técnica rural, objetiva e profissional
- O campo suggestedReportText deve ter entre 3 e 6 frases descritivas
- Inclua sempre as limitações da análise (ângulo, resolução, condições climáticas, etc.)`

export async function analyzeImageWithOpenAI(
  imageUrl: string,
  imageType: string | null,
  fieldObservations: string | null
): Promise<AnalysisResult> {
  const userMessage = [
    imageType ? `Tipo de imagem: ${imageType}` : null,
    fieldObservations ? `Observações de campo do operador: ${fieldObservations}` : null,
    'Analise esta imagem e retorne o JSON conforme instruído.',
  ]
    .filter(Boolean)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? ''

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Resposta da IA não contém JSON válido')
  }

  return JSON.parse(jsonMatch[0]) as AnalysisResult
}
