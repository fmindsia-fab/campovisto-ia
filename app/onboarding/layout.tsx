import Image from 'next/image'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/30 px-6 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-700">
          <Image src="/logo.png" alt="CampoVisto.IA" width={20} height={20} />
        </div>
        <span className="text-base font-semibold">CampoVisto.IA</span>
      </div>
      {children}
    </div>
  )
}
