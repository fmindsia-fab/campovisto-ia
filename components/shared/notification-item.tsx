'use client'

import Link from 'next/link'
import { AlertTriangle, Eye, FileCheck2, CalendarClock, Mail, Bell } from 'lucide-react'
import type { Notification, NotificationType } from '@/types'

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  activity_overdue: AlertTriangle,
  analysis_pending_review: Eye,
  report_ready: FileCheck2,
  activity_due_soon: CalendarClock,
  invite: Mail,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  activity_overdue: 'text-red-500',
  analysis_pending_review: 'text-amber-500',
  report_ready: 'text-green-500',
  activity_due_soon: 'text-blue-500',
  invite: 'text-purple-500',
}

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell
  const isUnread = !notification.read_at

  const content = (
    <div
      className={`flex gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
      onClick={() => isUnread && onRead(notification.id)}
    >
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${TYPE_COLORS[notification.type] ?? 'text-muted-foreground'}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-tight">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUnread && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
    </div>
  )

  if (notification.link) {
    return <Link href={notification.link} className="block cursor-pointer">{content}</Link>
  }
  return <div className="cursor-pointer">{content}</div>
}
