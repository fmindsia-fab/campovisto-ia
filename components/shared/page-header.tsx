interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div>
        <h1 className="text-2xl md:text-[26px] font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
