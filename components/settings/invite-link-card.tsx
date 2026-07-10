'use client'

import { useState } from 'react'
import { Copy, Check, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function InviteLinkCard() {
  const [copied, setCopied] = useState(false)
  const signupUrl = typeof window !== 'undefined' ? `${window.location.origin}/signup` : ''

  async function handleCopy() {
    await navigator.clipboard.writeText(signupUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mb-4">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserPlus className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Convidar novo integrante</p>
          <p className="text-xs text-muted-foreground">
            Compartilhe este link para a pessoa criar a própria conta — depois é só atribuir os papéis dela aqui embaixo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
      </CardContent>
    </Card>
  )
}
