import { createClient } from "@/lib/supabase/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isDemoMode } from "@/lib/supabase/config"

// Defesa em profundidade para Server Actions: confirma que o chamador é membro
// da allowlist (o proxy gateia /app, mas Server Actions também são alvo direto).
// Retorna o client já autenticado para a action reutilizar.
export async function requireMembro() {
  if (isDemoMode()) throw new Error("Ação indisponível no modo demonstração.")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!isAllowed(user?.email)) throw new Error("Não autorizado.")
  return supabase
}
