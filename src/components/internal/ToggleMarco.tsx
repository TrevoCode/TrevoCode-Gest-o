"use client"

import { useTransition } from "react"
import { Check } from "lucide-react"
import { toggleMarco } from "@/lib/actions"

// Marca/desmarca um marco como concluído (server action) sem recarregar.
export function ToggleMarco({
  marcoId,
  projetoId,
  concluido,
}: {
  marcoId: string
  projetoId: string
  concluido: boolean
}) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={concluido ? "Desmarcar marco concluído" : "Marcar marco como concluído"}
      onClick={() => {
        const fd = new FormData()
        fd.set("marco_id", marcoId)
        fd.set("projeto_id", projetoId)
        fd.set("concluido", String(concluido))
        start(() => toggleMarco(fd))
      }}
      className={`inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
        concluido
          ? "border-success bg-success text-white"
          : "border-muted-foreground/40 hover:border-success"
      }`}
    >
      {concluido && <Check className="size-3" />}
    </button>
  )
}
