import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg">Página não encontrada</p>
      <Link href="/dashboard" className="text-primary underline underline-offset-4">
        Voltar ao dashboard
      </Link>
    </div>
  )
}
