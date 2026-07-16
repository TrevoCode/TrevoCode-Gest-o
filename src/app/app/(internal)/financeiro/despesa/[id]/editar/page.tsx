import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterDespesa } from "@/lib/data"
import { editarDespesa } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar despesa" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarDespesaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const despesa = await obterDespesa(id)
  if (!despesa) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/financeiro/despesas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Despesas
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar despesa</h1>

      <form action={editarDespesa} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={despesa.id} />
        <label className="block space-y-1.5">
          <span className={labelCls}>Descrição *</span>
          <input name="descricao" required defaultValue={despesa.descricao} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Categoria</span>
            <select name="categoria" defaultValue={despesa.categoria} className={inputCls}>
              <option value="ferramentas">Ferramentas</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="salarios">Salários</option>
              <option value="marketing">Marketing</option>
              <option value="impostos">Impostos</option>
              <option value="outros">Outros</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$) *</span>
            <input name="valor" type="number" min="0" step="0.01" required defaultValue={despesa.valor} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Data</span>
            <input name="data" type="date" defaultValue={despesa.data ?? ""} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 pt-7">
            <input name="recorrente" type="checkbox" defaultChecked={despesa.recorrente} className="size-4 rounded border-border" />
            <span className="text-sm">Despesa recorrente (mensal)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/financeiro/despesas" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
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
