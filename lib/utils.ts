import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Máscara de telefone BR — (DD) NNNN-NNNN (fixo) ou (DD) NNNNN-NNNN (celular),
// formata progressivamente conforme os dígitos são digitados
export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const len = digits.length

  if (len === 0) return ''
  if (len <= 2) return `(${digits}`
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Fuso fixo do Brasil (sem DST desde 2019) — não usar o fuso "local" do runtime:
// em Server Components/Server Actions rodando na Vercel, o runtime opera em UTC
// por padrão, o que faria "hoje" virar o dia seguinte durante a noite no Brasil.
const APP_TIMEZONE = 'America/Sao_Paulo'

// Data no formato YYYY-MM-DD, N dias a partir de hoje, sempre no fuso do Brasil
// (independente do fuso do servidor ou do navegador). Usar para comparar com
// colunas `date` do Postgres — evita bugs de fuso horário que ocorrem ao usar
// Date.toISOString() (sempre UTC) ou comparar objetos Date criados a partir de
// strings de data "bare" (também interpretadas como UTC).
export function addDaysISODate(days = 0): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function todayISODate(): string {
  return addDaysISODate(0)
}
