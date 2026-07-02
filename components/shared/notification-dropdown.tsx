'use client'

import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notifications/actions'
import { NotificationItem } from './notification-item'
import type { Notification } from '@/types'

interface Props {
  initialUnreadCount: number
}

export function NotificationDropdown({ initialUnreadCount }: Props) {
  const [notifications, setNotifications] = useState<Notification[] | null>(null)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [loading, setLoading] = useState(false)

  async function handleOpenChange(open: boolean) {
    if (open && notifications === null) {
      setLoading(true)
      const data = await getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.read_at).length)
      setLoading(false)
    }
  }

  async function handleRead(id: string) {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)) ?? null)
    setUnreadCount((c) => Math.max(0, c - 1))
    await markAsRead(id)
  }

  async function handleReadAll() {
    setNotifications((prev) => prev?.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })) ?? null)
    setUnreadCount(0)
    await markAllAsRead()
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <p className="text-sm font-semibold">Notificações</p>
          {unreadCount > 0 && (
            <button
              onClick={handleReadAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3" /> Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <p className="text-xs text-muted-foreground text-center py-6">Carregando...</p>
          )}
          {!loading && notifications?.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma notificação.</p>
          )}
          {!loading && notifications?.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
