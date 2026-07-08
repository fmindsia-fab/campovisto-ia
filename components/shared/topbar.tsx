import Image from 'next/image'
import { LogOut, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/auth/actions'
import { getUnreadCount } from '@/lib/notifications/actions'
import { NotificationDropdown } from './notification-dropdown'
import { MobileNav } from './mobile-nav'

export async function Topbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const unreadCount = await getUnreadCount()

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
      {/* Menu e logo mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav />
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-700">
            <Image src="/logo.png" alt="CampoVisto.IA" width={17} height={17} />
          </div>
          <span className="text-sm font-semibold">CampoVisto.IA</span>
        </div>
      </div>

      <div className="hidden md:block" />

      {/* Ações à direita */}
      <div className="flex items-center gap-1">
        <NotificationDropdown initialUnreadCount={unreadCount} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">
                {user?.user_metadata?.full_name ?? 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Configurações
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
