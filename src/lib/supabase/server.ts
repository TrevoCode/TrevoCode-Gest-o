import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isDemoMode } from "./config"
import { createDemoClient } from "./demo-client"

// Cliente Supabase para Server Components / Route Handlers.
// Lê e grava a sessão via cookies do Next.
export async function createClient() {
  // Modo demo (sem env, fora de prod): stub que degrada pra vazio em vez de
  // estourar "Your project's URL and Key are required".
  if (isDemoMode()) return createDemoClient()

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Chamado de um Server Component — pode ser ignorado quando há
            // middleware cuidando do refresh da sessão.
          }
        },
      },
    }
  )
}
