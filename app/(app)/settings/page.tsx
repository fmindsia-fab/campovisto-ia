import Link from 'next/link'
import { CreditCard, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Perfil, plano e preferências da conta"
      />

      <Link href="/settings/plan">
        <Card className="max-w-md transition-colors hover:border-primary/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Plano</p>
              <p className="text-xs text-muted-foreground">Ver uso, limites e comparar planos</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </>
  )
}
