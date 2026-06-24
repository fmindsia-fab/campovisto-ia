import { ResetPasswordForm } from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Escolha uma nova senha para sua conta
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
