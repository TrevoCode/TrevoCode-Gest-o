"use client"

import { useState, useTransition } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { definirSituacao } from "@/lib/prospect-actions"
import type { OutreachStatus } from "@/lib/db/prospect"

const OPCOES: { value: OutreachStatus; label: string }[] = [
  { value: "active", label: "Em aberto" },
  { value: "replied", label: "Respondeu" },
  { value: "booked", label: "Call marcada" },
  { value: "optout", label: "Recusou" },
  { value: "exhausted", label: "Esgotado" },
]

// Seletor de situação do lead (move entre as tags do pipeline). Grava via
// máquina (Server Action). A lista/filtros atualizam pelo revalidate.
export function SituacaoSelect({
  placeId,
  atual,
}: {
  placeId: string
  atual: OutreachStatus | null
}) {
  const [val, setVal] = useState<string>(atual ?? "")
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function mudar(novo: string) {
    if (!novo || novo === val) return
    setVal(novo)
    setErro(null)
    start(async () => {
      const res = await definirSituacao(placeId, novo)
      if (!res.ok) {
        setErro(res.error ?? "Falha")
        setVal(atual ?? "")
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <select
          value={val}
          onChange={(e) => mudar(e.target.value)}
          disabled={pending}
          className="appearance-none rounded-md border border-border bg-background py-1 pl-2.5 pr-7 text-xs outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="" disabled>
            Situação…
          </option>
          {OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronDown className="size-3.5" />}
        </span>
      </div>
      {erro && <span className="text-[10px] text-danger">{erro}</span>}
    </div>
  )
}
