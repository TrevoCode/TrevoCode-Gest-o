"use client"

import { useTransition } from "react"
import { moverDeal } from "@/lib/actions"

const ETAPAS = [
  { v: "novo", l: "Novo" },
  { v: "qualificacao", l: "Qualificação" },
  { v: "proposta", l: "Proposta" },
  { v: "negociacao", l: "Negociação" },
  { v: "ganho", l: "Ganho" },
  { v: "perdido", l: "Perdido" },
]

// Muda a etapa do deal no banco (server action) sem sair da página.
export function MoverDealSelect({ dealId, etapa }: { dealId: string; etapa: string }) {
  const [pending, start] = useTransition()
  return (
    <select
      defaultValue={etapa}
      disabled={pending}
      onChange={(e) => {
        const fd = new FormData()
        fd.set("deal_id", dealId)
        fd.set("etapa", e.target.value)
        start(() => moverDeal(fd))
      }}
      aria-label="Mover etapa do negócio"
      className="w-full cursor-pointer rounded border border-border bg-background px-1.5 py-1 text-[11px] font-medium outline-none focus-visible:border-ring disabled:opacity-50"
    >
      {ETAPAS.map((s) => (
        <option key={s.v} value={s.v}>
          {s.l}
        </option>
      ))}
    </select>
  )
}
