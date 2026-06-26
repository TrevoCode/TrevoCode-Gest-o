import Link from "next/link"
import {
  Inbox,
  Users,
  FolderKanban,
  Repeat,
  CalendarDays,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { obterDashboard, listarLeads, listarClientes, listarProjetos } from "@/lib/data"
import { formatBRL, formatDataHora, tempoRelativo } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { StatCard } from "@/components/internal/StatCard"
import { Panel } from "@/components/internal/Panel"
import { Avatar } from "@/components/internal/Avatar"

export const metadata = { title: "Painel" }

const DIA = 86_400_000

type Tone = "primary" | "success" | "info"

export default async function DashboardPage() {
  const [{ kpis, proximasReunioes, leadsRecentes }, leads, clientes, projetos] =
    await Promise.all([
      obterDashboard(),
      listarLeads(),
      listarClientes(),
      listarProjetos(),
    ])

  // Contexto honesto derivado dos dados existentes (sem inventar tendências).
  const agora = Date.now()
  const leadsSemana = leads.filter(
    (l) => agora - new Date(l.created_at).getTime() < 7 * DIA
  ).length
  const recorrentesAtivos = projetos.filter(
    (p) => p.tipo === "recorrente" && p.status === "ativo"
  ).length

  const cards: {
    label: string
    valor: string
    icon: LucideIcon
    href: string
    tone: Tone
    hint: string
  }[] = [
    {
      label: "Leads novos",
      valor: String(kpis.leadsNovos),
      icon: Inbox,
      href: "/app/leads",
      tone: "info",
      hint: `${leadsSemana} nos últimos 7 dias`,
    },
    {
      label: "Clientes ativos",
      valor: String(kpis.clientesAtivos),
      icon: Users,
      href: "/app/clientes",
      tone: "primary",
      hint: `de ${clientes.length} no total`,
    },
    {
      label: "Projetos ativos",
      valor: String(kpis.projetosAtivos),
      icon: FolderKanban,
      href: "/app/projetos",
      tone: "primary",
      hint: `${recorrentesAtivos} recorrentes`,
    },
    {
      label: "Receita recorrente",
      valor: formatBRL(kpis.recorrenteMensal),
      icon: Repeat,
      href: "/app/financeiro",
      tone: "success",
      hint: "por mês · MRR",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Painel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da operação da TrevoCode.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.valor}
            href={c.href}
            tone={c.tone}
            hint={c.hint}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel
          icon={CalendarDays}
          title="Próximas reuniões"
          action={
            <Link
              href="/app/reunioes"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ver todas
            </Link>
          }
        >
          {proximasReunioes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhuma reunião agendada.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {proximasReunioes.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.clienteNome ?? "Sem cliente"} · {formatDataHora(r.data_hora)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                    {tempoRelativo(r.data_hora)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          icon={Inbox}
          title="Leads recentes"
          action={
            <Link
              href="/app/leads"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ver todos
            </Link>
          }
          footer={
            <Link
              href="/app/clientes"
              className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              Gerenciar no CRM <ArrowRight className="size-4" />
            </Link>
          }
        >
          {leadsRecentes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum lead ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {leadsRecentes.map((l) => (
                <li
                  key={l.id}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <Avatar name={l.nome} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {l.nome}
                      {l.empresa && (
                        <span className="text-muted-foreground"> · {l.empresa}</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{l.mensagem}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={l.status} />
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {tempoRelativo(l.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
