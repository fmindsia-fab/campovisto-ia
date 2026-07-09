'use client'

import { useEffect, useState } from 'react'

interface Props {
  lat: number
  lng: number
  children: React.ReactNode
  className?: string
}

export function OpenInMapsLink({ lat, lng, children, className }: Props) {
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const [href, setHref] = useState(webUrl)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Android: um <a href="geo:..."> clicado de verdade dispara o seletor nativo de
    // apps de navegação de forma confiável — reatribuir window.location via JS num
    // onClick é tratado com mais restrição pelo Chrome e o app não chega a abrir
    if (/Android/i.test(navigator.userAgent)) {
      setIsAndroid(true)
      setHref(`geo:${lat},${lng}?q=${lat},${lng}`)
    }
  }, [lat, lng])

  return (
    <a
      href={href}
      target={isAndroid ? undefined : '_blank'}
      rel={isAndroid ? undefined : 'noopener noreferrer'}
      className={className}
    >
      {children}
    </a>
  )
}
