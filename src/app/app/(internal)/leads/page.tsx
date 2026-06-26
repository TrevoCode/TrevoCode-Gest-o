import {
  MessageCircle,
  Phone,
  Video,
  Mail,
  Clock,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { listarLeads } from "@/lib/data"
import { tempoRelativo } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { PromoverLeadButton } from "@/components/internal/PromoverLeadButton"
import { Avatar } from "@/components/internal/Avatar"

export const metadata = { title: "Leads" }

const CANAL: Record<string, { label: string; icon: LucideIcon }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  ligacao: { label: "Ligação", icon: Phone },
  meet: { label: "Meet", icon: Video },
  email: { label: "E-mail", icon: Mail },
}
const HORARIO: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  final: "Final de tarde",
}

export default async function LeadsPage() {
  const leads = await listarLeads()
  const novos = leads.filter((l) => l.status === "novo").length

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Leads"
        description="Contatos recebidos pelo formulário do site, prontos para virar clientes."
      />

      <div className="mb-4 text-sm text-muted-foreground">
        {leads.length} no total · <span className="font-medium text-foreground">{novos} novos</span>
      </div>

      <ul className="space-y-3">
        {leads.map((l) => {
          const canal = l.melhor_canal ? CANAL[l.melhor_canal] : null
          return (
            <li key={l.id} className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <Avatar name={l.nome} className="mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{l.nome}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    {l.empresa && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="size-3.5" /> {l.empresa}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{tempoRelativo(l.created_at)}</span>
              </div>

              {l.mensagem && (
                <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground/90">
                  “{l.mensagem}”
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {l.email && <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {l.email}</span>}
                {l.telefone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {l.telefone}</span>}
                {canal && <span className="flex items-center gap-1.5"><canal.icon className="size-3.5" /> Prefere {canal.label}</span>}
                {l.melhor_horario && <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {HORARIO[l.melhor_horario] ?? l.melhor_horario}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                {l.prefere_conversar ? (
                  <span className="text-xs text-warning">Prefere conversar antes de detalhar</span>
                ) : (
                  <span />
                )}
                <PromoverLeadButton nome={l.nome} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
