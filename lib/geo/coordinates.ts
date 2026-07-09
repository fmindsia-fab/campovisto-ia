export interface Coordinates {
  lat: number
  lng: number
}

function dmsToDecimal(deg: number, min: number, sec: number, dir: string): number {
  let dec = deg + min / 60 + sec / 3600
  if (dir === 'S' || dir === 'W') dec *= -1
  return dec
}

// Aceita coordenadas decimais ("-23.42066, -51.17668") ou o formato DMS que o
// Google Maps copia (23°25'14.1"S 51°10'35.9"W)
export function parseCoordinates(text: string): Coordinates | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const decimalMatch = trimmed.match(/^(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)$/)
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1])
    const lng = parseFloat(decimalMatch[2])
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
    return null
  }

  const dmsRegex = /(\d+)°\s*(\d+)'\s*([\d.]+)"?\s*([NSEWnsew])/g
  const matches = [...trimmed.matchAll(dmsRegex)]
  if (matches.length === 2) {
    const values = matches.map((m) => ({
      value: dmsToDecimal(Number(m[1]), Number(m[2]), Number(m[3]), m[4].toUpperCase()),
      axis: /[NS]/i.test(m[4]) ? 'lat' : 'lng',
    }))
    const lat = values.find((v) => v.axis === 'lat')?.value
    const lng = values.find((v) => v.axis === 'lng')?.value
    if (lat !== undefined && lng !== undefined) return { lat, lng }
  }

  return null
}
