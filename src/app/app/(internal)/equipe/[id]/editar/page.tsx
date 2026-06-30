import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterMembro } from "@/lib/data"
import { editarMembro } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar membro" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarMembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const m = await obterMembro(id)
  if (!m) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/equipe" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Equipe
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar membro</h1>

      <form action={editarMembro} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={m.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Nome *</span>
            <input name="nome" required defaultValue={m.nome} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Papel</span>
            <input name="papel" defaultValue={m.papel ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Capacidade (h/semana)</span>
            <input name="capacidade_semanal" type="number" min="0" max="60" defaultValue={m.capacidade_semanal ?? 40} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Custo por hora (R$)</span>
            <input name="custo_hora" type="number" min="0" step="0.01" defaultValue={m.custo_hora ?? ""} className={inputCls} />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/equipe" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar alterações
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
