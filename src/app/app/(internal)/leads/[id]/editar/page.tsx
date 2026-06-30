import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { obterLead } from "@/lib/data"
import { editarLead } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Editar lead" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default async function EditarLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const l = await obterLead(id)
  if (!l) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Leads
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Editar lead</h1>

      <form action={editarLead} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <input type="hidden" name="id" value={l.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelCls}>Nome *</span>
            <input name="nome" required defaultValue={l.nome} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Empresa</span>
            <input name="empresa" defaultValue={l.empresa ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>E-mail</span>
            <input name="email" type="email" defaultValue={l.email ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Telefone</span>
            <input name="telefone" defaultValue={l.telefone ?? ""} className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue={l.status} className={inputCls}>
              <option value="novo">Novo</option>
              <option value="em_contato">Em contato</option>
              <option value="qualificado">Qualificado</option>
              <option value="descartado">Descartado</option>
              <option value="convertido">Convertido</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Melhor canal</span>
            <select name="melhor_canal" defaultValue={l.melhor_canal ?? ""} className={inputCls}>
              <option value="">—</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="ligacao">Ligação</option>
              <option value="meet">Meet</option>
              <option value="email">E-mail</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className={labelCls}>Mensagem / necessidade</span>
          <textarea name="mensagem" rows={3} defaultValue={l.mensagem ?? ""} className={`${inputCls} h-auto py-2`} />
        </label>
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/leads" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar alterações
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
