'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { updateNotificationPreferences } from '@/lib/profiles/actions'

const OPTIONS: { key: string; label: string; description: string }[] = [
  { key: 'report_ready', label: 'Relatório pronto', description: 'Quando um relatório terminar de ser gerado.' },
  { key: 'activity_overdue', label: 'Atividade atrasada', description: 'Quando uma atividade atribuída a você vencer o prazo.' },
  { key: 'analysis_pending_review', label: 'Análise aguardando revisão', description: 'Quando uma análise de IA ficar mais de 24h sem revisão (revisores/admin).' },
]

interface Props {
  preferences: Record<string, boolean>
}

export function NotificationPreferencesForm({ preferences }: Props) {
  const [prefs, setPrefs] = useState(preferences)

  async function toggle(key: string, value: boolean) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    const result = await updateNotificationPreferences(next)
    if (result?.error) toast.error(result.error)
  }

  return (
    <div className="max-w-lg space-y-4">
      {OPTIONS.map((opt) => (
        <div key={opt.key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.description}</p>
          </div>
          <Switch
            checked={prefs[opt.key] ?? true}
            onCheckedChange={(checked) => toggle(opt.key, checked)}
          />
        </div>
      ))}
    </div>
  )
}
