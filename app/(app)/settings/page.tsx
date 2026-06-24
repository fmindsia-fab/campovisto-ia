import { PageHeader } from '@/components/shared/page-header'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Perfil, plano e preferências da conta"
      />
      <p className="text-sm text-muted-foreground">Implementado no M12.</p>
    </>
  )
}
