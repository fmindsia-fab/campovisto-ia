import { Check } from 'lucide-react'

const STEP_LABELS = ['Boas-vindas', 'Cliente', 'Propriedade', 'Vistoria', 'Imagem', 'Pronto']

interface Props {
  currentStep: number
}

export function OnboardingStepper({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {STEP_LABELS.map((label, i) => {
        const isDone = i < currentStep
        const isCurrent = i === currentStep
        return (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-[10px] sm:block ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-4 sm:w-10 ${isDone ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
