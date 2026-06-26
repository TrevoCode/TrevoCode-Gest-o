import Link from "next/link"
import { Plus, TrendingUp, Scale, Trophy, AlertTriangle } from "lucide-react"
import { obterPipeline, obterForecast } from "@/lib/data"
import type { DealView } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"

export const metadata = { title: "Pipeline" }

// Faixa de cor no topo de cada coluna, por etapa.
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
      className="block rounded-lg border border-border bg-background p-3 shadow-sm transition-colors hover:border-primary/40"
    >
      <p className="text-sm font-medium leading-snug">{d.titulo}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{d.clienteNome}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">{formatBRL(d.valor)}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {d.probabilidade}%
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{d.responsavel}</span>
        {parado && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="size-3" /> parado há {d.diasParado}d
          </span>
        )}
      </div>
    </Link>
  )
}

export default async function PipelinePage() {
  const { colunas, totalAberto, ponderado, ganhoMes, emAberto } = await obterPipeline()

  const kpis = [
    { label: "Em aberto", valor: formatBRL(totalAberto), sub: `${emAberto} negócios`, icon: TrendingUp },
    { label: "Previsão ponderada", valor: formatBRL(ponderado), sub: "por probabilidade", icon: Scale },
    { label: "Ganho (período)", valor: formatBRL(ganhoMes), sub: "fechado", icon: Trophy },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Pipeline"
        description="Funil comercial — negócios por etapa, do primeiro contato ao fechamento."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Novo negócio
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <k.icon className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{k.valor}</p>
            <p className="text-sm text-muted-foreground">{k.label} · {k.sub}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {colunas.map((col) => (
          <div key={col.etapa} className="flex w-72 shrink-0 flex-col">
            <div className="overflow-hidden rounded-t-lg">
              <div className={`h-1 ${COR_ETAPA[col.etapa] ?? "bg-muted"}`} />
            </div>
            <div className="flex items-center justify-between border-x border-border bg-card px-3 py-2">
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </div>
            <div className="border-x border-b border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              {formatBRL(col.total)}
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-b-lg border-x border-b border-border bg-muted/30 p-2">
              {col.items.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-muted-foreground">—</p>
              ) : (
                col.items.map((d) => <DealCard key={d.id} d={d} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
