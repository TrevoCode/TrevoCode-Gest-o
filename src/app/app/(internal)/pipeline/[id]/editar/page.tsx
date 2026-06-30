import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterDeal } from "@/lib/data"
import { editarDeal } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar negócio" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await obterDeal(id)
  if (!d) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/pipeline" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Pipeline
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar negócio</h1>

      <form action={editarDeal} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={d.id} />
        <label className="block space-y-1.5">
          <span className={labelCls}>Título *</span>
          <input name="titulo" required defaultValue={d.titulo} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Etapa</span>
            <select name="etapa" defaultValue={d.etapa} className={inputCls}>
              <option value="novo">Novo</option>
              <option value="qualificacao">Qualificação</option>
              <option value="proposta">Proposta</option>
              <option value="negociacao">Negociação</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$)</span>
            <input name="valor" type="number" min="0" step="100" defaultValue={d.valor ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Probabilidade (%)</span>
            <input name="probabilidade" type="number" min="0" max="100" step="5" defaultValue={d.probabilidade ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Fechamento esperado</span>
            <input name="fechamento_esperado" type="date" defaultValue={d.fechamento_esperado ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Responsável</span>
            <input name="responsavel" defaultValue={d.responsavel ?? ""} className={inputCls} />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/pipeline" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar alterações
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
