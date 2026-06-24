import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
      {/* Logo mobile (sidebar fica oculta no mobile) */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-[10px] font-bold text-primary-foreground">CV</span>
        </div>
        <span className="text-sm font-semibold">CampoVisto.IA</span>
      </div>

      {/* Espaço vazio no desktop (título fica no PageHeader) */}
      <div className="hidden md:block" />

      {/* Ações à direita */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {/* Badge de contagem — implementado no M10 */}
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
