import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Percent,
  ListChecks,
  Repeat,
  CalendarDays,
  Flag,
  Check,
} from "lucide-react"
import { obterProjeto, listarMarcos } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { StatCard } from "@/components/internal/StatCard"
import { Panel } from "@/components/internal/Panel"
import type { TarefaStatus } from "@/lib/db/types"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await obterProjeto(id)
  return { title: p ? p.nome : "Projeto" }
}

const COLS: { status: TarefaStatus; label: string }[] = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluída" },
]

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const p = await obterProjeto(id)
  if (!p) notFound()
  const marcos = await listarMarcos(id)

  const margemPos = (p.margem ?? 0) >= 0

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/app/projetos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Projetos
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{p.nome}</h1>
        <StatusBadge status={p.status} />
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/app/clientes/${p.cliente_id}`} className="hover:text-foreground">{p.clienteNome}</Link>
        <span>·</span>
        {p.tipo === "recorrente" ? (
          <span className="inline-flex items-center gap-1"><Repeat className="size-3.5" /> Recorrente</span>
        ) : (
          "Projeto avulso"
        )}
        {p.data_inicio && (
          <><span>·</span><span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> início {formatData(p.data_inicio)}</span></>
        )}
      </p>

      {/* Margem */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          tone="success"
          label={p.tipo === "recorrente" ? "Receita / mês" : "Receita do contrato"}
          value={formatBRL(p.valor)}
        />
        <StatCard icon={TrendingDown} tone="danger" label="Custo estimado" value={formatBRL(p.custo)} />
        <StatCard
          icon={Percent}
          tone={margemPos ? "success" : "danger"}
          label="Margem"
          value={p.margem != null ? formatBRL(p.margem) : "—"}
          hint={p.margemPct != null ? `${p.margemPct}% sobre a receita` : undefined}
          valueClassName={margemPos ? "text-success" : "text-danger"}
        />
      </div>

      {/* Tarefas */}
      <Panel
        className="mt-8"
        icon={ListChecks}
        title="Tarefas"
        description="Execução do projeto por etapa."
      >
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {COLS.map((col) => {
            const itens = p.tarefas.filter((t) => t.status === col.status)
            return (
              <div key={col.status}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="text-xs text-muted-foreground">{itens.length}</span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2">
                  {itens.length === 0 ? (
                    <p className="px-1 py-3 text-center text-xs text-muted-foreground">—</p>
                  ) : (
                    itens.map((t) => (
                      <div key={t.id} className="rounded-lg border border-border bg-card p-3 shadow-xs">
                        <p className="text-sm leading-snug">{t.titulo}</p>
                        {t.responsavel && (
                          <p className="mt-1.5 text-xs text-muted-foreground">{t.responsavel}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel className="mt-6" icon={Flag} title="Marcos" description="Entregas-chave do cronograma.">
        <ol className="ml-6 border-l border-border py-2">
          {marcos.length === 0 && (
            <li className="px-5 py-3 text-sm text-muted-foreground">Sem marcos.</li>
          )}
          {marcos.map((ms) => (
            <li key={ms.id} className="relative px-5 py-2.5">
              <span className={`absolute -left-[7px] top-3.5 size-3 rounded-full border-2 border-card ${ms.concluido ? "bg-success" : "bg-muted-foreground/40"}`} />
              <div className="flex items-center gap-2">
                <p className={`text-sm ${ms.concluido ? "" : "text-muted-foreground"}`}>{ms.titulo}</p>
                {ms.concluido && <Check className="size-3.5 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground">{formatData(ms.data)}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {p.descricao && (
        <Panel className="mt-6" title="Sobre o projeto">
          <p className="px-5 py-4 text-sm text-muted-foreground">{p.descricao}</p>
        </Panel>
      )}
    </div>
  )
}
