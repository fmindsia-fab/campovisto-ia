import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsTabs } from '@/components/settings/settings-tabs'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getTeamMembers, type TeamMember } from '@/lib/profiles/actions'
import { hasRole } from '@/lib/auth/has-role'

export default async function SettingsPage() {
  const current = await getCurrentUser()
  if (!current) redirect('/login')

  const isAdmin = hasRole(current.roles, 'admin')
  const teamResult = isAdmin ? await getTeamMembers() : []
  const teamMembers: TeamMember[] = Array.isArray(teamResult) ? teamResult : []

  const initials = current.profile?.full_name
    ? current.profile.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : current.user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Perfil, plano e preferências da conta"
      />

      <Link href="/settings/plan">
        <Card className="mb-6 max-w-md transition-colors hover:border-primary/50">
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

      <SettingsTabs
        userId={current.user.id}
        fullName={current.profile?.full_name ?? null}
        phone={current.profile?.phone ?? null}
        avatarUrl={current.profile?.avatar_url ?? null}
        initials={initials}
        notificationPreferences={current.profile?.notification_preferences ?? {}}
        isAdmin={isAdmin}
        teamMembers={teamMembers}
      />
    </>
  )
}
