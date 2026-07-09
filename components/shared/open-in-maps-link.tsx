'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  lat: number
  lng: number
  children: React.ReactNode
  className?: string
}

// link de rotas do Google Maps — reconhecido pelo Android (App Links) e iOS
// (Universal Links) para abrir direto no app já com a navegação pronta pra
// iniciar; se o app não estiver instalado, cai na versão web normalmente
function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function OpenInMapsLink({ lat, lng, children, className }: Props) {
  return (
    <a
      href={directionsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}

export function CopyCoordinatesButton({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — sem fallback visual
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado!' : 'Copiar coordenadas'}
    </button>
  )
}
