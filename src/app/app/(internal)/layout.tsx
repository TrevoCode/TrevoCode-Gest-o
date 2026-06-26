import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { LogoutButton } from "@/components/internal/LogoutButton"
import { Sidebar } from "@/components/internal/Sidebar"

// Shell da área interna. O middleware já gateia, mas revalidamos aqui
// no servidor como segunda camada (defesa em profundidade).
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Sem Supabase configurado, não há sessão possível: volta pro login.
  if (!isSupabaseConfigured()) {
    redirect("/app/login")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAllowed(user?.email)) {
    redirect("/app/login")
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <LogoutButton />
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
