import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarProjeto } from "@/lib/actions"
import { listarClientes } from "@/lib/data"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Novo projeto" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function NovoProjetoPage() {
  const clientes = await listarClientes()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/projetos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Projetos
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Novo projeto</h1>

      <form action={criarProjeto} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <label className="block space-y-1.5">
          <span className={labelCls}>Nome do projeto *</span>
          <input name="nome" required placeholder="Ex.: App de delivery iOS/Android" className={inputCls} />
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
            <span className={labelCls}>Tipo</span>
            <select name="tipo" defaultValue="one_off" className={inputCls}>
              <option value="one_off">Projeto avulso</option>
              <option value="recorrente">Recorrente (mensal)</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Valor (R$)</span>
            <input name="valor" type="number" min="0" step="100" placeholder="0,00" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Custo estimado (R$)</span>
            <input name="custo" type="number" min="0" step="100" placeholder="0,00" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue="proposta" className={inputCls}>
              <option value="proposta">Proposta</option>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="concluido">Concluído</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Início</span>
            <input name="data_inicio" type="date" className={inputCls} />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className={labelCls}>Descrição</span>
          <textarea name="descricao" rows={3} placeholder="Escopo do projeto…" className={`${inputCls} h-auto py-2`} />
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/projetos" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Criar projeto
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
