'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, Users, MapPin, ClipboardList, ImageIcon, PartyPopper, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader } from '@/components/inspections/image-uploader'
import { CityAutocomplete } from '@/components/shared/city-autocomplete'
import { PhoneInput } from '@/components/shared/phone-input'
import { LocationMapPicker } from '@/components/properties/location-map-picker'
import { OnboardingStepper } from './onboarding-stepper'
import { createClient_ } from '@/lib/clients/actions'
import { createProperty } from '@/lib/properties/actions'
import { createInspection } from '@/lib/inspections/actions'
import { updateOnboardingStep, completeOnboarding } from '@/lib/profiles/actions'
import { todayISODate } from '@/lib/utils'

const ACTIVITY_TYPES = [
  'Pecuária bovina',
  'Pecuária leiteira',
  'Agricultura - grãos',
  'Agricultura - cana',
  'Agricultura - fruticultura',
  'Silvicultura',
  'Aquicultura',
  'Misto',
  'Outro',
]

interface Props {
  initialStep: number
  initialClient: { id: string; name: string } | null
  initialProperty: { id: string; name: string } | null
  initialInspection: { id: string } | null
}

export function OnboardingWizard({ initialStep, initialClient, initialProperty, initialInspection }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(() => Math.min(Math.max(initialStep, 0), 5))
  const [client, setClient] = useState(initialClient)
  const [property, setProperty] = useState(initialProperty)
  const [inspection, setInspection] = useState(initialInspection)

  function goToStep(next: number) {
    setStep(next)
    void updateOnboardingStep(next)
  }

  async function handleSkip() {
    await completeOnboarding()
    router.push('/dashboard')
  }

  async function handleFinish() {
    await completeOnboarding()
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <OnboardingStepper currentStep={step} />

      <div className="rounded-2xl border bg-card p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]">
        {step === 0 && <WelcomeStep onNext={() => goToStep(1)} />}

        {step === 1 && (
          <ClientStep
            existing={client}
            onContinue={() => goToStep(2)}
            onCreated={(c) => { setClient(c); goToStep(2) }}
          />
        )}

        {step === 2 && client && (
          <PropertyStep
            clientId={client.id}
            existing={property}
            onContinue={() => goToStep(3)}
            onCreated={(p) => { setProperty(p); goToStep(3) }}
          />
        )}

        {step === 3 && property && (
          <InspectionStep
            propertyId={property.id}
            existing={inspection}
            onContinue={() => goToStep(4)}
            onCreated={(i) => { setInspection(i); goToStep(4) }}
          />
        )}

        {step === 4 && inspection && (
          <div className="space-y-4">
            <StepHeader
              icon={ImageIcon}
              title="Envie a primeira imagem"
              description="Fotos de drone (RGB ou multiespectral) para essa vistoria. Você pode enviar mais depois."
            />
            <ImageUploader inspectionId={inspection.id} onUploaded={() => goToStep(5)} />
          </div>
        )}

        {step === 5 && <DoneStep inspectionId={inspection?.id} onFinish={handleFinish} />}
      </div>

      {step < 5 && (
        <div className="text-center">
          <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            Pular onboarding e ir direto para o dashboard
          </button>
        </div>
      )}
    </div>
  )
}

function StepHeader({ icon: Icon, title, description }: { icon: typeof Sprout; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sprout className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold">Bem-vindo ao CampoVisto.IA</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vamos te guiar pelos primeiros passos: cadastrar um cliente, uma propriedade, criar sua primeira
        vistoria e enviar uma imagem de drone. Leva menos de 3 minutos.
      </p>
      <Button onClick={onNext} className="mt-6 gap-1.5">
        Vamos começar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ClientStep({
  existing, onContinue, onCreated,
}: {
  existing: { id: string; name: string } | null
  onContinue: () => void
  onCreated: (c: { id: string; name: string }) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (existing) {
    return (
      <div>
        <StepHeader icon={Users} title="Cliente cadastrado" description={`"${existing.name}" já está pronto.`} />
        <Button onClick={onContinue} className="w-full">Continuar</Button>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await createClient_(formData)
    if (result?.error || !result?.data) {
      setError(result?.error ?? 'Erro ao cadastrar cliente')
      setLoading(false)
      return
    }
    onCreated({ id: result.data.id, name: result.data.name })
  }

  return (
    <div>
      <StepHeader icon={Users} title="Cadastre seu primeiro cliente" description="O produtor rural dono da propriedade que você vai vistoriar." />
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required placeholder="Ex: Dino da Silva Sauro" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <PhoneInput />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <CityAutocomplete />
          </div>
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Salvar e continuar'}
        </Button>
      </form>
    </div>
  )
}

function PropertyStep({
  clientId, existing, onContinue, onCreated,
}: {
  clientId: string
  existing: { id: string; name: string } | null
  onContinue: () => void
  onCreated: (p: { id: string; name: string }) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activityType, setActivityType] = useState('')

  if (existing) {
    return (
      <div>
        <StepHeader icon={MapPin} title="Propriedade cadastrada" description={`"${existing.name}" já está pronta.`} />
        <Button onClick={onContinue} className="w-full">Continuar</Button>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('client_id', clientId)
    formData.set('activity_type', activityType)
    const result = await createProperty(formData)
    if (result?.error || !result?.data) {
      setError(result?.error ?? 'Erro ao cadastrar propriedade')
      setLoading(false)
      return
    }
    onCreated({ id: result.data.id, name: result.data.name })
  }

  return (
    <div>
      <StepHeader icon={MapPin} title="Cadastre a propriedade" description="O terreno rural onde a vistoria vai acontecer." />
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome da propriedade *</Label>
          <Input id="name" name="name" required placeholder="Ex: Fazenda do Dino" />
        </div>
        <LocationMapPicker />
        <div className="space-y-1.5">
          <Label>Tipo de atividade</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Salvar e continuar'}
        </Button>
      </form>
    </div>
  )
}

function InspectionStep({
  propertyId, existing, onContinue, onCreated,
}: {
  propertyId: string
  existing: { id: string } | null
  onContinue: () => void
  onCreated: (i: { id: string }) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (existing) {
    return (
      <div>
        <StepHeader icon={ClipboardList} title="Vistoria criada" description="Sua primeira vistoria já está pronta." />
        <Button onClick={onContinue} className="w-full">Continuar</Button>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('property_id', propertyId)
    formData.set('status', 'draft')
    const result = await createInspection(formData)
    if (result?.error || !result?.data) {
      setError(result?.error ?? 'Erro ao criar vistoria')
      setLoading(false)
      return
    }
    onCreated({ id: result.data.id })
  }

  return (
    <div>
      <StepHeader icon={ClipboardList} title="Crie sua primeira vistoria" description="Registre a visita de campo para essa propriedade." />
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="visit_date">Data da visita *</Label>
          <Input id="visit_date" name="visit_date" type="date" required defaultValue={todayISODate()} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="objective">Objetivo da vistoria</Label>
          <Input id="objective" name="objective" placeholder="Ex: Avaliação de pastagens e rebanho" />
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Salvar e continuar'}
        </Button>
      </form>
    </div>
  )
}

function DoneStep({ inspectionId, onFinish }: { inspectionId: string | undefined; onFinish: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PartyPopper className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold">Tudo pronto!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Você já tem um cliente, uma propriedade, uma vistoria e uma imagem cadastrados. Agora é só marcar os
        pontos de atenção na imagem e pedir a análise por IA.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {inspectionId && (
          <Button variant="outline" asChild>
            <a href={`/inspections/${inspectionId}`}>Ver vistoria</a>
          </Button>
        )}
        <Button onClick={onFinish}>Ir para o dashboard</Button>
      </div>
    </div>
  )
}
