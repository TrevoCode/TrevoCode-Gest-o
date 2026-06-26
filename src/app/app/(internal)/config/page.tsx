import { Users, Plug, Database, CalendarDays, Globe, UserPlus } from "lucide-react"
import { ALLOWED_EMAILS } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { PageHeader } from "@/components/internal/PageHeader"

export const metadata = { title: "Configurações" }

function Pill({ ok, label }: { ok: boolean | "soon"; label: string }) {
  const cls =
    ok === "soon"
      ? "bg-neutral-100 text-neutral-600"
      : ok
        ? "bg-green-100 text-green-700"
        : "bg-amber-100 text-amber-700"
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
      <PageHeader title="Configurações" description="Equipe, integrações e preferências da plataforma." />

      {/* Equipe */}
      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 text-primary" /> Equipe
          </h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <UserPlus className="size-3.5" /> Convidar
          </button>
        </header>
        <ul className="divide-y divide-border">
          {membros.map((email) => (
            <li key={email} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
                  {email.slice(0, 2)}
                </span>
                <span className="text-sm">{email}</span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Gestor</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
          O acesso é controlado por allowlist de e-mail (variável <code>INTERNAL_ALLOWED_EMAILS</code>).
        </p>
      </section>

      {/* Integrações */}
      <section className="mt-6 rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Plug className="size-4 text-primary" /> Integrações
          </h2>
        </header>
        <ul className="divide-y divide-border">
          {integracoes.map((i) => (
            <li key={i.nome} className="flex items-center justify-between gap-3 px-5 py-3.5">
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
      </section>
    </div>
  )
}
