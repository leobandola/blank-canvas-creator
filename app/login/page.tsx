import { LoginForm } from '@/components/login-form'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await getUser()
  
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Sistema de Bolão
          </h1>
          <p className="text-slate-600">
            Entre para gerenciar rodadas e apostas
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
