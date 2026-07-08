import Image from 'next/image'

const VALUE_PROPS = [
  'Relatórios prontos em horas, não semanas',
  'Análise por IA sempre revisada por humano',
  'Organize clientes, propriedades e vistorias em um só lugar',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — branding */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-800 p-12"
      >
        {/* textura decorativa sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Image src="/logo.png" alt="CampoVisto.IA" width={22} height={22} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">CampoVisto.IA</p>
            <p className="text-xs text-white/60">by FMinds</p>
          </div>
        </div>

        <div className="relative">
          <blockquote className="text-3xl font-bold leading-tight text-white">
            Chega de perder dias entre a vistoria em campo e o relatório pronto.
          </blockquote>
          <p className="mt-4 text-base text-white/70 max-w-md">
            Transforme fotos de drone em laudos visuais profissionais com IA revisada por humano —
            prontos para impressionar seus clientes rurais.
          </p>

          <ul className="mt-8 space-y-3">
            {VALUE_PROPS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-white/70">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© 2025 FMinds. Todos os direitos reservados.</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-700">
            <Image src="/logo.png" alt="CampoVisto.IA" width={20} height={20} />
          </div>
          <span className="text-base font-semibold">CampoVisto.IA</span>
        </div>

        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]">
          {children}
        </div>
      </div>
    </div>
  )
}
