import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterCliente } from "@/lib/data"
import { editarCliente } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar cliente" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await obterCliente(id)
  if (!c) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/app/clientes/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {c.nome}
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar cliente</h1>

      <form action={editarCliente} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={c.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Nome / Empresa *</span>
            <input name="nome" required defaultValue={c.nome} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>CNPJ</span>
            <input name="cnpj" defaultValue={c.cnpj ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Segmento</span>
            <input name="segmento" defaultValue={c.segmento ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue={c.status} className={inputCls}>
              <option value="lead">Lead</option>
              <option value="qualificado">Qualificado</option>
              <option value="proposta">Proposta</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Origem</span>
            <input name="origem" defaultValue={c.origem ?? ""} className={inputCls} />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className={labelCls}>Observações</span>
          <textarea name="observacoes" rows={3} defaultValue={c.observacoes ?? ""} className={`${inputCls} h-auto py-2`} />
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href={`/app/clientes/${id}`} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
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
