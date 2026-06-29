import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarFatura } from "@/lib/actions"
import { listarClientes } from "@/lib/data"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Nova fatura" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function NovaFaturaPage() {
  const clientes = await listarClientes()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/financeiro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Financeiro
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Nova fatura</h1>

      <form action={criarFatura} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <label className="block space-y-1.5">
          <span className={labelCls}>Descrição *</span>
          <input name="descricao" required placeholder="Ex.: Mensalidade de manutenção — junho" className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Cliente *</span>
            <select name="cliente_id" required defaultValue="" className={inputCls}>
              <option value="" disabled>Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$) *</span>
            <input name="valor" type="number" min="0" step="0.01" required placeholder="0,00" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Vencimento *</span>
            <input name="vencimento" type="date" required className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue="rascunho" className={inputCls}>
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
              <option value="paga">Paga</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/financeiro" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Criar fatura
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
