import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { LogoutButton } from "@/components/internal/LogoutButton"
import { Sidebar } from "@/components/internal/Sidebar"
import { MobileNav } from "@/components/internal/MobileNav"
import { ThemeToggle } from "@/components/internal/ThemeToggle"
import { Avatar } from "@/components/internal/Avatar"
import { TrevoMark } from "@/components/internal/TrevoMark"

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

  const name = demo ? "Demonstração" : (email?.split("@")[0] ?? "Usuário")
  const emailLine = demo ? "Dados de exemplo" : (email ?? "")

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar user={{ name, email: emailLine }} demo={demo} />
      <div className="flex min-w-0 flex-1 flex-col">
        {demo && (
          <div className="border-b border-warning-muted bg-warning-muted px-6 py-1.5 text-center text-xs text-warning-muted-foreground">
            Modo demonstração — dados de exemplo. Conecte o Supabase para login e dados reais.
          </div>
        )}
        <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-2.5">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <Link href="/app" className="flex items-center gap-2">
              <TrevoMark className="size-5 text-primary" />
              <span className="text-sm font-semibold tracking-tight">TrevoCode</span>
            </Link>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="flex items-center gap-2 md:hidden">
              <Avatar name={name} />
              {!demo && <LogoutButton />}
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
