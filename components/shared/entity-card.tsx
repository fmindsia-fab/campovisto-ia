import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EntityCardProps {
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  badge?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }
  meta?: string
  className?: string
  onClick?: () => void
}

export function EntityCard({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  meta,
  className,
  onClick,
}: EntityCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-semibold">{title}</h3>
              {badge && <Badge variant={badge.variant ?? 'secondary'}>{badge.label}</Badge>}
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
            )}
            {description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>
            )}
            {meta && <p className="mt-2 text-xs text-muted-foreground">{meta}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
