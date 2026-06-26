import Link from "next/link"
import {
  Inbox,
  Users,
  FolderKanban,
  CalendarDays,
  Repeat,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { obterDashboard } from "@/lib/data"
import { formatBRL, formatDataHora, tempoRelativo } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"

export const metadata = { title: "Painel" }

export default async function DashboardPage() {
  const { kpis, proximasReunioes, leadsRecentes } = await obterDashboard()

  const cards: { label: string; valor: string; icon: LucideIcon; href: string }[] = [
    { label: "Leads novos", valor: String(kpis.leadsNovos), icon: Inbox, href: "/app/leads" },
    { label: "Clientes ativos", valor: String(kpis.clientesAtivos), icon: Users, href: "/app/clientes" },
    { label: "Projetos ativos", valor: String(kpis.projetosAtivos), icon: FolderKanban, href: "/app/projetos" },
    { label: "Receita recorrente/mês", valor: formatBRL(kpis.recorrenteMensal), icon: Repeat, href: "/app/projetos" },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Painel</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral da operação da TrevoCode.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <c.icon className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{c.valor}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Próximas reuniões */}
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 font-medium">
              <CalendarDays className="size-4 text-primary" /> Próximas reuniões
            </h2>
            <Link href="/app/reunioes" className="text-xs text-muted-foreground hover:text-foreground">
              ver todas
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {proximasReunioes.length === 0 && (
              <li className="px-5 py-6 text-sm text-muted-foreground">Nenhuma reunião agendada.</li>
            )}
            {proximasReunioes.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.clienteNome ?? "Sem cliente"} · {formatDataHora(r.data_hora)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{tempoRelativo(r.data_hora)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Leads recentes */}
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 font-medium">
              <Inbox className="size-4 text-primary" /> Leads recentes
            </h2>
            <Link href="/app/leads" className="text-xs text-muted-foreground hover:text-foreground">
              ver todos
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {leadsRecentes.length === 0 && (
              <li className="px-5 py-6 text-sm text-muted-foreground">Nenhum lead ainda.</li>
            )}
            {leadsRecentes.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {l.nome} {l.empresa && <span className="text-muted-foreground">· {l.empresa}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{l.mensagem}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={l.status} />
                  <span className="text-[11px] text-muted-foreground">{tempoRelativo(l.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/app/clientes"
            className="flex items-center justify-center gap-1 border-t border-border px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Gerenciar no CRM <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
