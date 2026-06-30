"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  // Só aceita destino interno (evita open-redirect via ?next=).
  const rawNext = params.get("next")
  const next = rawNext?.startsWith("/app") ? rawNext : "/app"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const configured = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!configured) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("E-mail ou senha inválidos.")
      setLoading(false)
      return
    }

    // O middleware valida a allowlist no redirect.
    router.replace(next)
    router.refresh()
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <h1 className="text-lg font-semibold">Plataforma interna</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito à equipe TrevoCode</p>
        </div>

        {!configured && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Plataforma ainda não conectada ao banco. Configure o Supabase em{" "}
            <code>.env.local</code> para habilitar o login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            aria-label="E-mail"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <input
            type="password"
            required
            aria-label="Senha"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !configured} className="mt-1 w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
