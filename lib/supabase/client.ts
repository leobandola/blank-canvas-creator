import { createBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Retorna instância existente se já foi criada
  if (clientInstance) {
    return clientInstance
  }

  // Cria nova instância apenas uma vez
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return clientInstance
}
