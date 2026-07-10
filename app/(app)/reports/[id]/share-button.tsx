'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Share2, Loader2, MessageCircle, Send, Mail, Copy, Check } from 'lucide-react'
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

interface PreparedShare {
  url: string
  file: File | null
}

export function ShareButton({ reportTitle }: Props) {
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  // navegadores exigem que navigator.share() seja chamado bem dentro do
  // gesto de toque/clique original — gerar o PDF demora alguns segundos
  // (chamada ao servidor + Playwright), tempo suficiente pra perder essa
  // "ativação". Por isso o fluxo é em 2 passos: 1º clique prepara tudo
  // (PDF + blob) e guarda em estado; 2º clique chama share() na hora,
  // sem nenhum await antes, contando como um gesto novo e válido.
  const [prepared, setPrepared] = useState<PreparedShare | null>(null)

  async function generatePdf(): Promise<ShareData> {
    const res = await fetch(`/api/reports/${id}/pdf`, { method: 'POST' })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Falha ao gerar PDF')
    return { url: json.url, filename: json.filename }
  }

  async function handlePrepare() {
    setLoading(true)
    try {
      const { url, filename } = await generatePdf()

      let file: File | null = null
      try {
        const blob = await fetch(url).then((r) => r.blob())
        file = new File([blob], filename, { type: 'application/pdf' })
      } catch {
        // sem o arquivo em mãos, ainda dá pra compartilhar só o link
      }

      setPrepared({ url, file })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmShare() {
    if (!prepared) return
    const shareText = `Relatório: ${reportTitle}`

    const finish = () => setPrepared(null)

    if (prepared.file && navigator.canShare?.({ files: [prepared.file] })) {
      navigator.share({ files: [prepared.file], title: shareText, text: shareText })
        .then(finish)
        .catch((err) => { if (err?.name !== 'AbortError') toast.error('Falha ao compartilhar') })
      return
    }

    if (navigator.share) {
      navigator.share({ title: shareText, text: shareText, url: prepared.url })
        .then(finish)
        .catch((err) => { if (err?.name !== 'AbortError') toast.error('Falha ao compartilhar') })
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
    if (prepared) {
      return (
        <Button onClick={handleConfirmShare} size="sm" className="gap-1.5">
          <Check className="h-4 w-4" />
          Toque para enviar
        </Button>
      )
    }

    return (
      <Button onClick={handlePrepare} variant="outline" size="sm" disabled={loading}>
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
