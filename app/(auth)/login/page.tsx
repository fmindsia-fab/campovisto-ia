import Link from 'next/link'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entrar na plataforma</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Use seu e-mail e senha para acessar
        </p>
      </div>

      <LoginForm />

      <div className="space-y-3 text-center text-sm">
        <Link
          href="/forgot-password"
          className="block text-muted-foreground hover:text-foreground transition-colors"
        >
          Esqueceu sua senha?
        </Link>
        <p className="text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
