"use client"

import { useTransition } from "react"
import { moverTarefa } from "@/lib/actions"

const ST = [
  { v: "todo", l: "A fazer" },
  { v: "doing", l: "Em andamento" },
  { v: "done", l: "Concluída" },
]

// Muda o status da tarefa (server action) sem recarregar.
export function MoverTarefaSelect({
  tarefaId,
  projetoId,
  status,
}: {
  tarefaId: string
  projetoId: string
  status: string
}) {
  const [pending, start] = useTransition()
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const fd = new FormData()
        fd.set("tarefa_id", tarefaId)
        fd.set("projeto_id", projetoId)
        fd.set("status", e.target.value)
        start(() => moverTarefa(fd))
      }}
      aria-label="Mover status da tarefa"
      className="mt-2 w-full cursor-pointer rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus-visible:border-ring disabled:opacity-50"
    >
      {ST.map((s) => (
        <option key={s.v} value={s.v}>
          {s.l}
        </option>
      ))}
    </select>
  )
}
