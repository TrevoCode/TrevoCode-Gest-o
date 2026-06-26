import { Users, Plug, Database, CalendarDays, Globe, UserPlus, Settings } from "lucide-react"
import { ALLOWED_EMAILS } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { PageHeader } from "@/components/internal/PageHeader"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Configurações" }

function Pill({ ok, label }: { ok: boolean | "soon"; label: string }) {
  const cls =
    ok === "soon"
      ? "bg-muted text-muted-foreground"
      : ok
        ? "bg-success-muted text-success-muted-foreground"
        : "bg-warning-muted text-warning-muted-foreground"
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export default function ConfigPage() {
  const membros = ALLOWED_EMAILS.length ? ALLOWED_EMAILS : ["fabricio@trevocode.com", "yuri@trevocode.com"]
  const supaOk = isSupabaseConfigured()

  const integracoes = [
    { icon: Database, nome: "Supabase (banco de dados)", desc: "Persistência de clientes, projetos e financeiro.", pill: <Pill ok={supaOk} label={supaOk ? "Conectado" : "Não conectado"} /> },
    { icon: Globe, nome: "Captura de leads do site", desc: "Formulário do trevocode.com gravando direto no CRM.", pill: <Pill ok={supaOk ? true : false} label={supaOk ? "Ativa" : "Pendente"} /> },
    { icon: CalendarDays, nome: "Google Calendar", desc: "Sincronizar reuniões com a agenda da equipe.", pill: <Pill ok="soon" label="Em breve" /> },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={Settings}
        title="Configurações"
        description="Equipe, integrações e preferências da plataforma."
      />

      <Panel
        icon={Users}
        title="Equipe"
        description="Quem tem acesso à plataforma."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-muted">
            <UserPlus className="size-3.5" /> Convidar
          </button>
        }
        footer={
          <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
            O acesso é controlado por allowlist de e-mail (variável{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">INTERNAL_ALLOWED_EMAILS</code>).
          </p>
        }
      >
        <ul className="divide-y divide-border">
          {membros.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
                  {email.slice(0, 2)}
                </span>
                <span className="text-sm">{email}</span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Gestor
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        className="mt-6"
        icon={Plug}
        iconTone="info"
        title="Integrações"
        description="Serviços conectados ao sistema."
      >
        <ul className="divide-y divide-border">
          {integracoes.map((i) => (
            <li
              key={i.nome}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <i.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{i.nome}</p>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                </div>
              </div>
              {i.pill}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
