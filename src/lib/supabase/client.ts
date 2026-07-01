import { createBrowserClient } from "@supabase/ssr"
import { isDemoMode } from "./config"
import { createDemoClient } from "./demo-client"

// Cliente Supabase para Client Components (login, formulários).
export function createClient() {
  // Modo demo: stub encadeável (Realtime/auth no-op) em vez de estourar.
  if (isDemoMode()) return createDemoClient()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
