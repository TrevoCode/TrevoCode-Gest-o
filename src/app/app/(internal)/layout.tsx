import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { LogoutButton } from "@/components/internal/LogoutButton"
import { Sidebar } from "@/components/internal/Sidebar"

// Shell da área interna. O proxy já gateia; aqui revalidamos no servidor
// (defesa em profundidade). Sem Supabase, roda em modo demonstração.
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const demo = !isSupabaseConfigured()
  let email: string | undefined

  if (!demo) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!isAllowed(user?.email)) {
      redirect("/app/login")
    }
    email = user?.email ?? undefined
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {demo && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-center text-xs text-amber-800">
            Modo demonstração — dados de exemplo. Conecte o Supabase para login e dados reais.
          </div>
        )}
        <header className="flex items-center justify-end gap-3 border-b border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">{demo ? "Demonstração" : email}</span>
          {!demo && <LogoutButton />}
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
