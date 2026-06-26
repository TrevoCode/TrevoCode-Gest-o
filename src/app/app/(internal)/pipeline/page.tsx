import Link from "next/link"
import { Plus, TrendingUp, Scale, Trophy, AlertTriangle, Target, BarChart3 } from "lucide-react"
import { obterPipeline, obterForecast } from "@/lib/data"
import type { DealView } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Pipeline" }

// Faixa de cor no topo de cada coluna, por etapa (progressão do funil).
const COR_ETAPA: Record<string, string> = {
  novo: "bg-slate-400",
  qualificacao: "bg-blue-400",
  proposta: "bg-amber-400",
  negociacao: "bg-violet-400",
  ganho: "bg-green-500",
}

function DealCard({ d }: { d: DealView }) {
  const parado = d.diasParado > 7 && d.etapa !== "ganho"
  return (
    <Link
      href={`/app/clientes/${d.cliente_id}`}
      className="block rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
    >
      <p className="text-sm font-medium leading-snug">{d.titulo}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{d.clienteNome}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">{formatBRL(d.valor)}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {d.probabilidade}%
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{d.responsavel}</span>
        {parado && (
          <span className="flex items-center gap-1 text-warning">
            <AlertTriangle className="size-3" /> parado há {d.diasParado}d
          </span>
        )}
      </div>
    </Link>
  )
}

export default async function PipelinePage() {
  const { colunas, totalAberto, ponderado, ganhoMes, emAberto } = await obterPipeline()
  const forecast = await obterForecast()
  const maxForecast = Math.max(...forecast.map((f) => f.valor), 1)

  const kpis = [
    { label: "Em aberto", valor: formatBRL(totalAberto), sub: `${emAberto} negócios`, icon: TrendingUp },
    { label: "Previsão ponderada", valor: formatBRL(ponderado), sub: "por probabilidade", icon: Scale },
    { label: "Ganho (período)", valor: formatBRL(ganhoMes), sub: "fechado", icon: Trophy },
  ] as const

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Target}
        title="Pipeline"
        description="Funil comercial — negócios por etapa, do primeiro contato ao fechamento."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Novo negócio
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            icon={k.icon}
            label={k.label}
            value={k.valor}
            hint={k.sub}
          />
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {colunas.map((col) => (
          <div
            key={col.etapa}
            className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border shadow-xs"
          >
            <div className={`h-1 ${COR_ETAPA[col.etapa] ?? "bg-muted"}`} />
            <div className="flex items-center justify-between bg-card px-3 pt-2.5">
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                {col.items.length}
              </span>
            </div>
            <div className="bg-card px-3 pb-2 pt-0.5 text-xs text-muted-foreground tabular-nums">
              {formatBRL(col.total)}
            </div>
            <div className="flex flex-1 flex-col gap-2 border-t border-border bg-muted/30 p-2">
              {col.items.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">—</p>
              ) : (
                col.items.map((d) => <DealCard key={d.id} d={d} />)
              )}
            </div>
          </div>
        ))}
      </div>

      <Panel
        className="mt-6"
        icon={BarChart3}
        title="Previsão por mês (negócios em aberto)"
        description="Quanto deve entrar por mês, ponderado pela probabilidade de cada negócio."
        bodyClassName="p-5"
      >
        <ul className="space-y-3">
          {forecast.length === 0 && (
            <li className="text-sm text-muted-foreground">Sem negócios em aberto.</li>
          )}
          {forecast.map((f) => (
            <li key={f.mes} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm capitalize">
                {new Date(`${f.mes}-01T12:00:00`).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "2-digit",
                })}
              </span>
              <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded bg-primary/30"
                  style={{ width: `${(f.valor / maxForecast) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded bg-primary"
                  style={{ width: `${(f.ponderado / maxForecast) * 100}%` }}
                />
              </div>
              <span className="w-44 shrink-0 text-right text-sm tabular-nums">
                {formatBRL(f.ponderado)}{" "}
                <span className="text-xs text-muted-foreground">de {formatBRL(f.valor)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Barra clara = total · barra cheia = ponderado pela probabilidade.
        </p>
      </Panel>
    </div>
  )
}
