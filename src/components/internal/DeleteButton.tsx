"use client"

import { Trash2 } from "lucide-react"
import { excluirRegistro } from "@/lib/actions"

// Exclui um registro (com confirmação). `from` = rota para revalidar/redirecionar.
export function DeleteButton({
  tabela,
  id,
  from,
  label = "Excluir",
  iconOnly = false,
  className,
}: {
  tabela: string
  id: string
  from: string
  label?: string
  iconOnly?: boolean
  className?: string
}) {
  return (
    <form
      action={excluirRegistro}
      onSubmit={(e) => {
        if (!confirm("Excluir este registro? Esta ação não pode ser desfeita.")) e.preventDefault()
      }}
    >
      <input type="hidden" name="tabela" value={tabela} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={from} />
      <button
        type="submit"
        aria-label={label}
        className={
          className ??
          (iconOnly
            ? "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground"
            : "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger-muted")
        }
      >
        <Trash2 className="size-4" />
        {!iconOnly && label}
      </button>
    </form>
  )
}
