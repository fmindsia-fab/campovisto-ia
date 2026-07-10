'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AvatarUploader } from './avatar-uploader'
import { ProfileForm } from './profile-form'
import { ChangePasswordForm } from './change-password-form'
import { NotificationPreferencesForm } from './notification-preferences-form'
import { InviteLinkCard } from './invite-link-card'
import { TeamList } from './team-list'
import type { TeamMember } from '@/lib/profiles/actions'

interface Props {
  userId: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  initials: string
  notificationPreferences: Record<string, boolean>
  isAdmin: boolean
  teamMembers: TeamMember[]
}

export function SettingsTabs({
  userId, fullName, phone, avatarUrl, initials, notificationPreferences, isAdmin, teamMembers,
}: Props) {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
        {isAdmin && <TabsTrigger value="team">Equipe</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <AvatarUploader userId={userId} avatarUrl={avatarUrl} initials={initials} />
        <ProfileForm fullName={fullName} phone={phone} />
        <div className="border-t pt-6">
          <h3 className="mb-3 text-sm font-semibold">Alterar senha</h3>
          <ChangePasswordForm />
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPreferencesForm preferences={notificationPreferences} />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="team">
          <InviteLinkCard />
          <TeamList members={teamMembers} currentUserId={userId} />
        </TabsContent>
      )}
    </Tabs>
  )
}
