import { SignUpForm } from '@/components/signup-form'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SignUpPage() {
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
            Crie sua conta para gerenciar o bolão
          </p>
        </div>
        <SignUpForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Fazer login</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
