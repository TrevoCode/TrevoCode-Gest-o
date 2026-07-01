"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import type { ThreadResumo } from "@/lib/prospeccao"
import type { OutreachStatus } from "@/lib/db/prospect"

// Tag por situação do lead (do outreach.status).
const TAG: Record<OutreachStatus, { label: string; cls: string }> = {
  active: { label: "Em aberto", cls: "bg-info/10 text-info" },
  replied: { label: "Respondeu", cls: "bg-warning/10 text-warning" },
  booked: { label: "Call marcada", cls: "bg-success/10 text-success" },
  optout: { label: "Recusou", cls: "bg-danger/10 text-danger" },
  exhausted: { label: "Esgotado", cls: "bg-muted text-muted-foreground" },
}

// Filtros do topo (situação). "aguardando" é derivado (última msg do lead).
const FILTROS: { key: string; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aguardando", label: "Aguardando" },
  { key: "active", label: "Em aberto" },
  { key: "replied", label: "Respondeu" },
  { key: "booked", label: "Call marcada" },
  { key: "optout", label: "Recusou" },
]

function quando(iso: string) {
  const d = new Date(iso)
  const hoje = new Date()
  return d.toDateString() === hoje.toDateString()
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function CrmConversaList({
  threads,
  selId,
}: {
  threads: ThreadResumo[]
  selId: string | null
}) {
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState("todos")

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return threads.filter((t) => {
      if (filtro === "aguardando" && !t.aguardando) return false
      if (filtro !== "todos" && filtro !== "aguardando" && t.status !== filtro) return false
      if (q && !(`${t.name ?? ""} ${t.lastText}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [threads, busca, filtro])

  const aguardandoCount = threads.filter((t) => t.aguardando).length

  return (
    <div className="flex h-full flex-col border-r border-border">
      {/* Busca */}
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar conversa…"
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {/* Filtros por situação */}
        <div className="mt-2 flex flex-wrap gap-1">
          {FILTROS.map((f) => {
            const ativo = filtro === f.key
            const badge = f.key === "aguardando" && aguardandoCount > 0 ? ` ${aguardandoCount}` : ""
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFiltro(f.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {f.label}
                {badge}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lista.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">Nenhuma conversa nesse filtro.</p>
        ) : (
          lista.map((t) => {
            const ativo = t.place_id === selId
            const tag = t.status ? TAG[t.status] : null
            return (
              <Link
                key={t.place_id}
                href={`/app/conversas?lead=${encodeURIComponent(t.place_id)}`}
                className={`flex items-start gap-3 border-b border-border/60 px-3 py-3 transition-colors ${
                  ativo ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <div className="relative">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                    {(t.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  {t.aguardando && (
                    <span
                      className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-card bg-warning"
                      title="Aguardando sua resposta"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${t.aguardando ? "font-semibold" : "font-medium"}`}>
                      {t.name ?? t.place_id}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{quando(t.lastAt)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.lastRole === "sdr" ? "Você: " : ""}
                    {t.lastText}
                  </p>
                  {tag && (
                    <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tag.cls}`}>
                      {tag.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
