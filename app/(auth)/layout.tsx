export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <span className="text-sm font-bold text-white">CV</span>
          </div>
          <div>
            <p className="text-base font-semibold text-white">CampoVisto.IA</p>
            <p className="text-xs text-white/60">by FMinds</p>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-semibold leading-snug text-white">
            &ldquo;Vistorias rurais com drone, análise por IA e relatórios profissionais — tudo em um lugar.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-white/60">
            Plataforma de inspeção visual para propriedades rurais.
          </p>
        </div>

        <p className="text-xs text-white/40">© 2025 FMinds. Todos os direitos reservados.</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">CV</span>
          </div>
          <span className="text-base font-semibold">CampoVisto.IA</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
