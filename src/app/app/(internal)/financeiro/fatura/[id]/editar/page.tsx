import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterFatura, listarClientes } from "@/lib/data"
import { editarFatura } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar fatura" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarFaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [f, clientes] = await Promise.all([obterFatura(id), listarClientes()])
  if (!f) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/financeiro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Financeiro
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar fatura</h1>

      <form action={editarFatura} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={f.id} />
        <label className="block space-y-1.5">
          <span className={labelCls}>Descrição *</span>
          <input name="descricao" required defaultValue={f.descricao} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Cliente *</span>
            <select name="cliente_id" required defaultValue={f.cliente_id} className={inputCls}>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$) *</span>
            <input name="valor" type="number" min="0" step="0.01" required defaultValue={f.valor ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Vencimento *</span>
            <input name="vencimento" type="date" required defaultValue={f.vencimento ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue={f.status} className={inputCls}>
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
              <option value="paga">Paga</option>
              <option value="atrasada">Atrasada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/financeiro" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar alterações
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
