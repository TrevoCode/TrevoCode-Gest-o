import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarCliente } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Novo cliente" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/clientes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Novo cliente</h1>

      <form action={criarCliente} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Nome / Empresa *</span>
            <input name="nome" required placeholder="Ex.: Restaurante Sabor & Cia" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>CNPJ</span>
            <input name="cnpj" placeholder="00.000.000/0001-00" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Segmento</span>
            <input name="segmento" placeholder="Ex.: Restaurantes" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue="lead" className={inputCls}>
              <option value="lead">Lead</option>
              <option value="qualificado">Qualificado</option>
              <option value="proposta">Proposta</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Origem</span>
            <input name="origem" placeholder="Site, indicação, outbound…" className={inputCls} />
          </label>
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm font-medium">Contato principal</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="contato_nome" aria-label="Nome do contato" placeholder="Nome" className={inputCls} />
            <input name="contato_email" type="email" aria-label="E-mail do contato" placeholder="E-mail" className={inputCls} />
            <input name="contato_telefone" aria-label="Telefone do contato" placeholder="Telefone" className={inputCls} />
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className={labelCls}>Observações</span>
          <textarea name="observacoes" rows={3} placeholder="Contexto, necessidade, próximos passos…" className={`${inputCls} h-auto py-2`} />
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/clientes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Salvar cliente
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
