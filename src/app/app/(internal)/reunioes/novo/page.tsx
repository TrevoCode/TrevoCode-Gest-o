import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarReuniao } from "@/lib/actions"
import { listarClientes } from "@/lib/data"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Agendar reunião" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function NovaReuniaoPage() {
  const clientes = await listarClientes()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/reunioes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Reuniões
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Agendar reunião</h1>

      <form action={criarReuniao} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <label className="block space-y-1.5">
          <span className={labelCls}>Título *</span>
          <input name="titulo" required placeholder="Ex.: Fechamento de proposta" className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Cliente</span>
            <select name="cliente_id" defaultValue="" className={inputCls}>
              <option value="">— Sem cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Data e hora *</span>
            <input name="data_hora" type="datetime-local" required className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Tipo</span>
            <select name="tipo" defaultValue="meet" className={inputCls}>
              <option value="meet">Meet</option>
              <option value="ligacao">Ligação</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className={labelCls}>Notas / pauta</span>
          <textarea name="notas" rows={3} placeholder="O que será tratado…" className={`${inputCls} h-auto py-2`} />
        </label>
        <label className="block space-y-1.5">
          <span className={labelCls}>Follow-up</span>
          <input name="follow_up" placeholder="Próximo passo após a reunião" className={inputCls} />
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/reunioes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Agendar
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
