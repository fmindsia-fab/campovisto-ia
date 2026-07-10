'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function UpgradeButton() {
  return (
    <Button
      onClick={() => toast.info('Upgrade para Premium chegando em breve. Entre em contato com a FMinds para saber mais.')}
      className="gap-1.5"
    >
      <Sparkles className="h-4 w-4" />
      Fazer upgrade para Premium
    </Button>
  )
}
