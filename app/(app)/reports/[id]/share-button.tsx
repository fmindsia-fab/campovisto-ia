'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Share2, Loader2, MessageCircle, Send, Mail, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  reportTitle: string
}

interface ShareData {
  url: string
  filename: string
}

export function ShareButton({ reportTitle }: Props) {
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)

  async function generatePdf(): Promise<ShareData> {
    const res = await fetch(`/api/reports/${id}/pdf`, { method: 'POST' })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Falha ao gerar PDF')
    return { url: json.url, filename: json.filename }
  }

  // Dispara o menu nativo de compartilhamento do sistema (WhatsApp, Telegram,
  // e-mail, etc. — o que a pessoa tiver instalado). Existe em praticamente
  // todo navegador mobile, mas quase nenhum navegador desktop — por isso o
  // clique verifica a disponibilidade antes de decidir entre isso e o menu manual.
  async function handleNativeShare(shareData: ShareData) {
    const shareText = `Relatório: ${reportTitle}`

    try {
      const blob = await fetch(shareData.url).then((r) => r.blob())
      const file = new File([blob], shareData.filename, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: shareText, text: shareText })
        return true
      }
    } catch {
      // segue pro fallback de compartilhar só o link
    }

    if (navigator.share) {
      await navigator.share({ title: shareText, text: shareText, url: shareData.url })
      return true
    }

    return false
  }

  async function handleShareClick() {
    setLoading(true)
    try {
      const shareData = await generatePdf()
      const shared = await handleNativeShare(shareData)
      if (!shared) {
        // navegador sem Web Share API (a maioria dos desktops) — o menu com
        // os links manuais abre pelo próprio DropdownMenu abaixo
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        toast.error(err instanceof Error ? err.message : 'Falha ao compartilhar')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleManualShare(kind: 'whatsapp' | 'telegram' | 'email' | 'copy') {
    setLoading(true)
    try {
      const { url } = await generatePdf()
      const text = `Relatório: ${reportTitle}`

      if (kind === 'copy') {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado!')
        return
      }

      const targets: Record<'whatsapp' | 'telegram' | 'email', string> = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
      }
      window.open(targets[kind], '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao gerar link')
    } finally {
      setLoading(false)
    }
  }

  // detecta só depois de montar — durante o SSR `navigator` não existe, e
  // decidir isso já no primeiro render causaria descompasso de hidratação
  // entre o HTML do servidor e o do cliente
  const [hasNativeShare, setHasNativeShare] = useState(false)
  useEffect(() => {
    setHasNativeShare(!!navigator.share)
  }, [])

  if (hasNativeShare) {
    return (
      <Button onClick={handleShareClick} variant="outline" size="sm" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Share2 className="h-4 w-4 mr-1.5" />}
        {loading ? 'Preparando...' : 'Compartilhar'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Share2 className="h-4 w-4 mr-1.5" />}
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleManualShare('whatsapp')} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualShare('telegram')} className="cursor-pointer">
          <Send className="h-4 w-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualShare('email')} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2" />
          E-mail
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualShare('copy')} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
