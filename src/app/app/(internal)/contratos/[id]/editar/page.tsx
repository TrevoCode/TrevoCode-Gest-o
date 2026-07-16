import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterContrato } from "@/lib/data"
import { editarContrato } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar contrato" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarContratoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const contrato = await obterContrato(id)
  if (!contrato) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/contratos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Contratos
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar contrato</h1>

      <form action={editarContrato} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={contrato.id} />
        <label className="block space-y-1.5">
          <span className={labelCls}>Título *</span>
          <input name="titulo" required defaultValue={contrato.titulo} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$) *</span>
            <input name="valor" type="number" min="0" step="0.01" required defaultValue={contrato.valor} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Tipo</span>
            <select name="tipo" defaultValue={contrato.tipo} className={inputCls}>
              <option value="projeto">Projeto (valor único)</option>
              <option value="recorrente">Recorrente (mensal)</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Início da vigência</span>
            <input name="vigencia_inicio" type="date" defaultValue={contrato.vigencia_inicio ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Fim da vigência</span>
            <input name="vigencia_fim" type="date" defaultValue={contrato.vigencia_fim ?? ""} className={inputCls} />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/contratos" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar alterações
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
