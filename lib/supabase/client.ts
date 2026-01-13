import { createBrowserClient } from "@supabase/ssr"

// Use global para garantir singleton entre hot-reloads em desenvolvimento
declare global {
  var __supabase_client__: ReturnType<typeof createBrowserClient> | undefined
}

export function createClient() {
  // Retorna instância existente do global se já foi criada
  if (typeof window !== "undefined" && globalThis.__supabase_client__) {
    return globalThis.__supabase_client__
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )

  // Armazena no global para reutilização
  if (typeof window !== "undefined") {
    globalThis.__supabase_client__ = client
  }

  return client
}
