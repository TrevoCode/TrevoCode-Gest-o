"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import type { Notificacao } from "@/lib/data"

const DOT: Record<Notificacao["tom"], string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
}

// Central de notificações (sino + dropdown). Alertas derivados dos dados:
// faturas em atraso, contas vencidas, negócios parados, leads novos.
export function Notifications({ items }: { items: Notificacao[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificações${items.length ? ` (${items.length})` : ""}`}
        className="relative grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
      >
        <Bell className="size-4.5" />
        {items.length > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-background" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-1 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold">Notificações</span>
              {items.length > 0 && (
                <span className="rounded-full bg-danger-muted px-2 py-0.5 text-[10px] font-medium text-danger-muted-foreground">
                  {items.length}
                </span>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Tudo em dia.</p>
            ) : (
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3 hover:bg-accent"
                    >
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[n.tom]}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-snug">{n.texto}</span>
                        <span className="block truncate text-xs text-muted-foreground">{n.sub}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
