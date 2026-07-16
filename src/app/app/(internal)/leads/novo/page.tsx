import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { criarLead } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Novo lead" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export default function NovoLeadPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Leads
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Novo lead</h1>
      <p className="mt-1 text-sm text-muted-foreground">Adicione um contato que veio por indicação, evento ou conversa direta.</p>

      <form action={criarLead} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Nome *</span>
            <input name="nome" required placeholder="Ex.: Dr. Lucas — Clínica Rotelli" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Empresa</span>
            <input name="empresa" placeholder="Clínica Rotelli" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Telefone</span>
            <input name="telefone" placeholder="(11) 9…" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>E-mail</span>
            <input name="email" type="email" placeholder="contato@empresa.com" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Status</span>
            <select name="status" defaultValue="qualificado" className={inputCls}>
              <option value="novo">Novo</option>
              <option value="em_contato">Em contato</option>
              <option value="qualificado">Qualificado</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Melhor canal</span>
            <select name="melhor_canal" defaultValue="" className={inputCls}>
              <option value="">—</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="ligacao">Ligação</option>
              <option value="meet">Meet</option>
              <option value="email">E-mail</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Melhor horário</span>
            <select name="melhor_horario" defaultValue="" className={inputCls}>
              <option value="">—</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="final">Final de tarde</option>
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelCls}>Observação</span>
            <textarea name="mensagem" rows={3} placeholder="Contexto: veio por indicação do…, interessado em…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring" />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Link href="/app/leads" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancelar
          </Link>
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60">
            Adicionar lead
          </SubmitButton>
        </div>
      </form>

      <p className="mt-3 text-xs text-muted-foreground">
        Depois de adicionar, use <span className="font-medium text-foreground">Promover a cliente</span> no lead para criar o cliente — e leve o negócio pro Pipeline (onde ficam as propostas).
      </p>
    </div>
  )
}
