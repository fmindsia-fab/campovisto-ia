import OpenAI from 'openai'
import { SPECTRAL_IMAGE_TYPES } from '@/types'
import type { ImageType } from '@/types'

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

const RGB_PROMPT = `Você é um assistente especializado em análise visual de imagens aéreas RGB de propriedades rurais captadas por drones.

Analise a imagem fornecida e retorne um JSON com a seguinte estrutura EXATA (sem markdown, apenas JSON puro):

{
  "visibleElements": ["elemento1 em português", "elemento2 em português"],
  "attentionPoints": [
    {
      "category": "pasture",
      "description": "Descrição objetiva do que foi observado, em português",
      "priority": "high",
      "confidence": "probable"
    }
  ],
  "analysisLimitations": ["limitação1 em português", "limitação2 em português"],
  "suggestedReportText": "Texto completo sugerido para o relatório descrevendo as observações da imagem, em português"
}

Categorias válidas (use exatamente esses valores em inglês no campo category): bovine, pasture, bare_soil, cattle_trail, wetland, fence, waterer, shade, crop, structure, attention_point
Prioridades válidas: high, medium, low
Confiança válida: confirmed, probable, uncertain

Regras obrigatórias:
- TODOS os textos (visibleElements, description, analysisLimitations, suggestedReportText) devem estar em PORTUGUÊS DO BRASIL
- Apenas o campo "category" deve usar os valores em inglês listados acima
- Esta é uma análise PRELIMINAR — nunca faça diagnósticos técnicos definitivos
- Descreva apenas o que é VISÍVEL na imagem — não invente
- Use linguagem técnica rural, objetiva e profissional
- O campo suggestedReportText deve ter entre 3 e 6 frases descritivas
- Inclua sempre as limitações da análise (ângulo, resolução, condições climáticas, etc.)`

const LIVESTOCK_PROMPT = `Você é um assistente especializado em análise visual de imagens aéreas RGB de propriedades rurais captadas por drones, com foco em contagem e avaliação de rebanho bovino.

Analise a imagem e retorne um JSON com a seguinte estrutura EXATA (sem markdown, apenas JSON puro):

{
  "visibleElements": ["elemento1 em português", "elemento2 em português"],
  "attentionPoints": [
    {
      "category": "bovine",
      "description": "Descrição objetiva em português, incluindo contagem e comportamento observado",
      "priority": "medium",
      "confidence": "probable"
    }
  ],
  "analysisLimitations": ["limitação1 em português"],
  "suggestedReportText": "Texto técnico em português com contagem, comportamento e condição geral do rebanho"
}

Categorias válidas: bovine, cattle_trail, pasture, bare_soil, wetland, fence, waterer, shade, attention_point
Prioridades válidas: high, medium, low
Confiança válida: confirmed, probable, uncertain

Regras obrigatórias:
- TODOS os textos em PORTUGUÊS DO BRASIL
- Apenas o campo "category" usa os valores em inglês listados acima
- CONTE os animais visíveis — forneça um número exato ou estimativa com margem (ex: "aproximadamente 45–50 bovinos")
- Inclua nos visibleElements a contagem: ex: "aproximadamente 48 bovinos visíveis"
- Identifique raças se possível (nelore, angus, gir, girolando, etc.) com base na coloração e morfologia
- Observe o comportamento: em movimento, pastando, agrupados, dispersos, próximos a água
- Avalie condição corporal geral se possível (magros, bom estado, etc.)
- Identifique se há separação de lotes, bezerros, touros
- Aponte riscos: superlotação, animais isolados, comportamento anormal
- Esta é uma análise PRELIMINAR — deve ser validada por zootecnista ou médico veterinário
- Inclua limitações: ângulo, resolução, animais fora do quadro, sobreposição`

const SPECTRAL_PROMPTS: Record<string, string> = {
  ndvi: `Você é um especialista em sensoriamento remoto e manejo de pastagens. Está analisando um mapa NDVI (Índice de Diferença Normalizada de Vegetação) gerado por drone com câmera multiespectral.

ESCALA DE CORES DO NDVI:
- Vermelho/laranja intenso → NDVI baixo (< 0,2): solo exposto, vegetação morta ou inexistente
- Amarelo → NDVI médio-baixo (0,2–0,4): vegetação esparsa, possível estresse ou degradação
- Verde claro → NDVI médio (0,4–0,6): vegetação moderada, pastagem em recuperação
- Verde escuro → NDVI alto (0,6–1,0): vegetação densa e saudável

Analise o mapa e retorne um JSON com a estrutura EXATA abaixo (sem markdown, apenas JSON puro):

{
  "visibleElements": ["descrição das zonas de cor identificadas em português"],
  "attentionPoints": [
    {
      "category": "pasture_degradation",
      "description": "Descrição da zona crítica identificada, localização no mapa e impacto estimado, em português",
      "priority": "high",
      "confidence": "probable"
    }
  ],
  "analysisLimitations": ["limitação em português"],
  "suggestedReportText": "Texto técnico para relatório descrevendo saúde da pastagem, zonas críticas e recomendações de manejo, em português"
}

Categorias válidas: pasture_degradation, water_stress, low_biomass, nutrient_deficiency, healthy_vegetation, bare_soil, wetland, attention_point
Prioridades válidas: high, medium, low
Confiança válida: confirmed, probable, uncertain

Regras:
- TODOS os textos em PORTUGUÊS DO BRASIL
- Apenas o campo "category" usa os valores em inglês listados acima
- Interprete as cores do heatmap conforme a escala NDVI acima
- Estime percentual aproximado de área afetada quando possível
- Sugira ações de manejo (rotação de pasto, irrigação, revegetação, etc.)
- Esta é uma análise PRELIMINAR — deve ser validada por agrônomo`,

  ndre: `Você é um especialista em sensoriamento remoto. Está analisando um mapa NDRE (Índice de Diferença Normalizada Red-Edge) gerado por drone multiespectral.

O NDRE é superior ao NDVI para detectar estresse em vegetação densa pois usa a banda Red-Edge (700–740nm).

ESCALA: tons frios (azul/roxo) = baixo vigor → tons quentes (amarelo/vermelho) = alto vigor.

Analise o mapa e retorne JSON com a estrutura EXATA (sem markdown):

{
  "visibleElements": ["zonas identificadas em português"],
  "attentionPoints": [{ "category": "low_biomass", "description": "descrição em português", "priority": "medium", "confidence": "probable" }],
  "analysisLimitations": ["limitação em português"],
  "suggestedReportText": "texto técnico em português"
}

Categorias válidas: pasture_degradation, water_stress, low_biomass, nutrient_deficiency, healthy_vegetation, bare_soil, attention_point
Foque em: deficiência de clorofila, estresse nutricional (N, Mg), vigor diferenciado em áreas densas.
TODOS os textos em PORTUGUÊS DO BRASIL.`,

  ndwi: `Você é um especialista em sensoriamento remoto. Está analisando um mapa NDWI (Índice de Diferença Normalizada de Água) gerado por drone multiespectral.

O NDWI detecta estresse hídrico nas plantas e umidade do solo.

ESCALA: azul/verde = alta umidade → amarelo/vermelho = baixa umidade/estresse hídrico severo.

Analise o mapa e retorne JSON com a estrutura EXATA (sem markdown):

{
  "visibleElements": ["zonas de umidade identificadas em português"],
  "attentionPoints": [{ "category": "water_stress", "description": "descrição em português", "priority": "high", "confidence": "probable" }],
  "analysisLimitations": ["limitação em português"],
  "suggestedReportText": "texto técnico em português"
}

Categorias válidas: water_stress, pasture_degradation, wetland, low_biomass, healthy_vegetation, bare_soil, attention_point
Foque em: zonas de déficit hídrico, áreas encharcadas, distribuição de umidade.
TODOS os textos em PORTUGUÊS DO BRASIL.`,

  evi: `Você é um especialista em sensoriamento remoto. Está analisando um mapa EVI (Índice de Vegetação Aprimorado) que corrige saturação do NDVI em vegetação densa.

ESCALA: vermelho = baixo vigor → verde escuro = alto vigor.

Analise e retorne JSON com estrutura EXATA (sem markdown):

{
  "visibleElements": ["zonas identificadas em português"],
  "attentionPoints": [{ "category": "pasture_degradation", "description": "descrição em português", "priority": "medium", "confidence": "probable" }],
  "analysisLimitations": ["limitação em português"],
  "suggestedReportText": "texto técnico em português"
}

Categorias válidas: pasture_degradation, water_stress, low_biomass, nutrient_deficiency, healthy_vegetation, bare_soil, attention_point
TODOS os textos em PORTUGUÊS DO BRASIL.`,

  savi: `Você é um especialista em sensoriamento remoto. Está analisando um mapa SAVI (Índice de Vegetação Ajustado para Solo), ideal para áreas com cobertura vegetal abaixo de 40%.

ESCALA: vermelho/laranja = pouca vegetação/solo exposto → verde = cobertura adequada.

Analise e retorne JSON com estrutura EXATA (sem markdown):

{
  "visibleElements": ["zonas identificadas em português"],
  "attentionPoints": [{ "category": "bare_soil", "description": "descrição em português", "priority": "high", "confidence": "probable" }],
  "analysisLimitations": ["limitação em português"],
  "suggestedReportText": "texto técnico em português"
}

Categorias válidas: pasture_degradation, bare_soil, low_biomass, water_stress, healthy_vegetation, attention_point
Foque em: exposição de solo, degradação de pastagem em áreas de baixa cobertura.
TODOS os textos em PORTUGUÊS DO BRASIL.`,
}

function getPrompt(imageType: string | null): string {
  if (imageType === 'livestock') return LIVESTOCK_PROMPT
  if (imageType && imageType in SPECTRAL_PROMPTS) return SPECTRAL_PROMPTS[imageType]
  return RGB_PROMPT
}

export function isSpectralImage(imageType: string | null): boolean {
  if (!imageType) return false
  return SPECTRAL_IMAGE_TYPES.includes(imageType as ImageType)
}

export async function analyzeImageWithOpenAI(
  imageUrl: string,
  imageType: string | null,
  fieldObservations: string | null
): Promise<AnalysisResult> {
  const spectral = isSpectralImage(imageType)

  const userMessage = [
    imageType ? `Tipo de imagem: ${imageType.toUpperCase()}` : null,
    fieldObservations ? `Observações de campo do operador: ${fieldObservations}` : null,
    spectral
      ? 'Analise este mapa de índice vegetal e retorne o JSON conforme instruído.'
      : 'Analise esta imagem e retorne o JSON conforme instruído.',
  ]
    .filter(Boolean)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: getPrompt(imageType) },
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
