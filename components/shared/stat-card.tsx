import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const VARIANT_CLASSES = {
  green: 'bg-primary/10 text-primary',
  purple: 'bg-brand-purple/10 text-brand-purple',
  blue: 'bg-brand-blue/10 text-brand-blue',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
} as const

type StatCardVariant = keyof typeof VARIANT_CLASSES

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  variant?: StatCardVariant
  iconClassName?: string
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'green',
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              VARIANT_CLASSES[variant],
              iconClassName
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
