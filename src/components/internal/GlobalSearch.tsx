"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import type { ItemBusca } from "@/lib/data"

// Busca global na topbar — filtra um índice (clientes/projetos/propostas/leads)
// no cliente. Mock por ora; a fonte é src/lib/data.
export function GlobalSearch({ index }: { index: ItemBusca[] }) {
  const [q, setQ] = useState("")
  const query = q.trim().toLowerCase()
  const results =
    query.length >= 1
      ? index
          .filter((i) => i.label.toLowerCase().includes(query) || i.sub.toLowerCase().includes(query))
          .slice(0, 8)
      : []

  return (
    <div className="relative hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar clientes, projetos, propostas…"
        className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:bg-background"
      />
      {query.length >= 1 && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Nada encontrado.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li key={i}>
                  <Link
                    href={r.href}
                    onClick={() => setQ("")}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {r.tipo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
