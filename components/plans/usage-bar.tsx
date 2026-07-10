interface Props {
  label: string
  used: number
  limit: number | null
}

export function UsageBar({ label, used, limit }: Props) {
  const pct = limit == null ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isFull = limit != null && used >= limit

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={isFull ? 'font-medium text-destructive' : 'font-medium'}>
          {used}{limit != null ? ` / ${limit}` : ''}
          {limit == null && ' (ilimitado)'}
        </span>
      </div>
      {limit != null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${isFull ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
