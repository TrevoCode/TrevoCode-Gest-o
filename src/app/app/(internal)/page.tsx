import Link from "next/link"
import {
  Users,
  CalendarDays,
  FolderKanban,
  Wallet,
  Inbox,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Painel interno" }

type Kpis = {
  clientesAtivos: number
  leadsNovos: number
  projetosAtivos: number
  reunioesProximas: number
  pronto: boolean
}

// Conta registros por módulo. Degrada para zero (e pronto=false) enquanto o
// schema não estiver aplicado ou o Supabase não estiver configurado.
async function getKpis(): Promise<Kpis> {
  try {
    const supabase = await createClient()
    const head = { count: "exact" as const, head: true }
    const [clientes, leads, projetos, reunioes] = await Promise.all([
      supabase.from("clientes").select("*", head).eq("status", "ativo"),
      supabase.from("leads").select("*", head).eq("status", "novo"),
      supabase.from("projetos").select("*", head).eq("status", "ativo"),
      supabase
        .from("reunioes")
        .select("*", head)
        .eq("status", "agendada")
        .gte("data_hora", new Date().toISOString()),
    ])
    const pronto =
      !clientes.error && !leads.error && !projetos.error && !reunioes.error
    return {
      clientesAtivos: clientes.count ?? 0,
      leadsNovos: leads.count ?? 0,
      projetosAtivos: projetos.count ?? 0,
      reunioesProximas: reunioes.count ?? 0,
      pronto,
    }
  } catch {
    return {
      clientesAtivos: 0,
      leadsNovos: 0,
      projetosAtivos: 0,
      reunioesProximas: 0,
      pronto: false,
    }
  }
}

const KPI_CARDS: { key: keyof Omit<Kpis, "pronto">; label: string; icon: LucideIcon }[] = [
  { key: "leadsNovos", label: "Leads novos", icon: Inbox },
  { key: "clientesAtivos", label: "Clientes ativos", icon: Users },
  { key: "projetosAtivos", label: "Projetos ativos", icon: FolderKanban },
  { key: "reunioesProximas", label: "Reuniões agendadas", icon: CalendarDays },
]

const MODULOS = [
  { href: "/app/clientes", nome: "Clientes / CRM", desc: "Leads do site, pipeline e contatos", icon: Users },
  { href: "/app/reunioes", nome: "Reuniões", desc: "Agenda, notas e follow-ups", icon: CalendarDays },
  { href: "/app/projetos", nome: "Projetos", desc: "Status, prazos e contratos", icon: FolderKanban },
  { href: "/app/financeiro", nome: "Financeiro", desc: "Receitas, custos e margem (em breve)", icon: Wallet },
]

export default async function DashboardPage() {
  const kpis = await getKpis()

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Painel interno</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Visão geral da operação da TrevoCode.
      </p>

      {!kpis.pronto && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Conecte o Supabase (<code>.env.local</code>) e aplique a migration{" "}
          <code>0001_fundacao.sql</code> para ver os números reais.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((c) => (
          <div key={c.key} className="rounded-xl border border-border bg-card p-5">
            <c.icon className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{kpis[c.key]}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Módulos
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {MODULOS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <m.icon className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1 font-medium">
                {m.nome}
                <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
