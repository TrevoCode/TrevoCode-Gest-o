import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarSolicitacao } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Solicitar despesa" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default function SolicitarDespesaPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/planejamento" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Planejamento
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Solicitar despesa</h1>
      <p className="mt-1 text-sm text-muted-foreground">O pedido entra na fila de aprovação dos sócios.</p>

      <form action={criarSolicitacao} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <label className="block space-y-1.5">
          <span className={labelCls}>Descrição *</span>
          <input name="descricao" required placeholder="Ex.: Licença do Figma pro trimestre" className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Categoria</span>
            <select name="categoria" defaultValue="outros" className={inputCls}>
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
            <input name="valor" type="number" min="0" step="0.01" required placeholder="0,00" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Quem está pedindo</span>
            <input name="solicitante" placeholder="Seu nome" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Data</span>
            <input name="data" type="date" className={inputCls} />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/planejamento" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Enviar pra aprovação
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
