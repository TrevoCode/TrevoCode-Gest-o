"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, LogOut, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/internal/Avatar"

// Menu do usuário (avatar + dropdown). Reúne perfil, Configurações e Sair —
// fica no topo, ao lado do tema. A Configurações não aparece mais na sidebar.
export function UserMenu({
  name,
  email,
  demo,
}: {
  name: string
  email: string
  demo: boolean
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/app/login")
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-lg p-0.5 pr-1.5 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Avatar name={name} />
        <ChevronDown className="size-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-1 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Avatar name={name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
            <div className="p-1">
              <Link
                href="/app/config"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Settings className="size-4 text-muted-foreground" /> Configurações
              </Link>
              {!demo && (
                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-muted"
                >
                  <LogOut className="size-4" /> Sair
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
