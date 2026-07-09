'use client'

interface Props {
  lat: number
  lng: number
  children: React.ReactNode
  className?: string
}

export function OpenInMapsLink({ lat, lng, children, className }: Props) {
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Android: dispara o seletor nativo de apps de navegação (Google Maps, Waze, etc.)
    // em vez de só abrir a versão web — é o que o esquema geo: foi feito para fazer
    if (/Android/i.test(navigator.userAgent)) {
      e.preventDefault()
      window.location.href = `geo:${lat},${lng}?q=${encodeURIComponent(`${lat},${lng}`)}`
    }
  }

  return (
    <a href={webUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
