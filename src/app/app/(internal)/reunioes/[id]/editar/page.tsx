import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterReuniao, listarClientes } from "@/lib/data"
import { atualizarReuniao } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar reunião" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

// "2026-06-29T14:00" para o input datetime-local (a partir do ISO armazenado).
function paraInput(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 16)
}

export default async function EditarReuniaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [r, clientes] = await Promise.all([obterReuniao(id), listarClientes()])
  if (!r) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/reunioes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Reuniões
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar reunião</h1>

      <form action={atualizarReuniao} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={r.id} />
        <input type="hidden" name="back" value="/app/reunioes" />
        <label className="block space-y-1.5">
          <span className={labelCls}>Título *</span>
          <input name="titulo" required defaultValue={r.titulo} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Cliente</span>
            <select name="cliente_id" defaultValue={r.cliente_id ?? ""} className={inputCls}>
              <option value="">— Sem cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Data e hora</span>
            <input name="data_hora" type="datetime-local" defaultValue={paraInput(r.data_hora)} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Tipo</span>
            <select name="tipo" defaultValue={r.tipo} className={inputCls}>
              <option value="meet">Meet</option>
              <option value="ligacao">Ligação</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue={r.status} className={inputCls}>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className={labelCls}>Notas / pauta</span>
          <textarea name="notas" rows={3} defaultValue={r.notas ?? ""} className={`${inputCls} h-auto py-2`} />
        </label>
        <label className="block space-y-1.5">
          <span className={labelCls}>Follow-up</span>
          <input name="follow_up" defaultValue={r.follow_up ?? ""} className={inputCls} />
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/reunioes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
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
