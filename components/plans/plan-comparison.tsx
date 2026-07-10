import { Check, X } from 'lucide-react'
import type { Plan } from '@/lib/plans/check-limit'

interface Props {
  plans: Plan[]
  currentPlanId: string
}

function formatLimit(value: number | null, unit: string): string {
  return value == null ? 'Ilimitado' : `${value} ${unit}`
}

export function PlanComparison({ plans, currentPlanId }: Props) {
  const rows: { label: string; render: (p: Plan) => React.ReactNode }[] = [
    { label: 'Propriedades', render: (p) => formatLimit(p.max_properties, 'propriedade(s)') },
    { label: 'Vistorias', render: (p) => formatLimit(p.max_inspections, 'vistoria(s)') },
    { label: 'Imagens por vistoria', render: (p) => formatLimit(p.max_images_per_inspection, 'imagem(ns)') },
    { label: 'Análise por IA', render: (p) => (p.ai_analysis ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />) },
    { label: 'Exportação de PDF', render: (p) => (p.pdf_export ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />) },
  ]

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium text-muted-foreground">Recurso</th>
            {plans.map((p) => (
              <th key={p.id} className="p-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.id === currentPlanId && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Atual</span>
                  )}
                </div>
                <span className="text-xs font-normal text-muted-foreground">
                  {p.price_monthly > 0 ? `R$ ${p.price_monthly.toFixed(2).replace('.', ',')}/mês` : 'Grátis'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-0">
              <td className="p-3 text-muted-foreground">{row.label}</td>
              {plans.map((p) => (
                <td key={p.id} className="p-3">{row.render(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
