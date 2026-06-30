"use client"

import { useRouter, useSearchParams } from "next/navigation"

const STATUS = [
  { v: "", l: "Todos os estágios" },
  { v: "active", l: "Em cadência" },
  { v: "replied", l: "Respondeu" },
  { v: "booked", l: "Reunião marcada" },
  { v: "exhausted", l: "Esgotado" },
  { v: "optout", l: "Opt-out" },
]

// Filtros da lista (nicho + estágio) via query params, sem recarregar a página.
export function ProspectFiltros({ nichos }: { nichos: string[] }) {
  const router = useRouter()
  const sp = useSearchParams()

  function set(chave: string, valor: string) {
    const next = new URLSearchParams(sp.toString())
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    router.replace(`/app/prospeccao${next.toString() ? `?${next}` : ""}`)
  }

  const sel =
    "rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"

  return (
    <div className="flex flex-wrap gap-2">
      <select
        aria-label="Filtrar por nicho"
        value={sp.get("niche") ?? ""}
        onChange={(e) => set("niche", e.target.value)}
        className={sel}
      >
        <option value="">Todos os nichos</option>
        {nichos.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <select
        aria-label="Filtrar por estágio"
        value={sp.get("status") ?? ""}
        onChange={(e) => set("status", e.target.value)}
        className={sel}
      >
        {STATUS.map((s) => (
          <option key={s.v} value={s.v}>
            {s.l}
          </option>
        ))}
      </select>
    </div>
  )
}
