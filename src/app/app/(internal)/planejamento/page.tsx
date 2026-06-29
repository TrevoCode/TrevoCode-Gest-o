import {
  Goal,
  TrendingUp,
  TrendingDown,
  Repeat,
  CloudRain,
  Sun,
  CloudSun,
  CheckCircle2,
  Check,
  X,
} from "lucide-react"
import { obterPlanejamento, obterCenarios, listarSolicitacoes } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_ANALISE } from "@/components/internal/SectionTabs"
import { SubmitButton } from "@/components/internal/SubmitButton"
import { decidirSolicitacao } from "@/lib/actions"
import { Panel } from "@/components/internal/Panel"
import { StatCard } from "@/components/internal/StatCard"

export const metadata = { title: "Planejamento" }

function MetaLinha({
  label,
  real,
  meta,
  menorMelhor = false,
}: {
  label: string
  real: number
  meta: number
  menorMelhor?: boolean
}) {
  const pct = meta ? Math.min(100, Math.round((real / meta) * 100)) : 0
  const bateu = menorMelhor ? real <= meta : real >= meta
  return (
    <div className="px-5 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">
          {formatBRL(real)} <span className="text-muted-foreground">/ {formatBRL(meta)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${bateu ? "bg-success" : "bg-warning"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default async function PlanejamentoPage() {
  const plan = await obterPlanejamento()
  const cen = await obterCenarios()
  const solicitacoes = await listarSolicitacoes()
  const pendentes = solicitacoes.filter((s) => s.status === "pendente").length

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Goal}
        title="Planejamento"
        description="Metas do mês, cenários de caixa e aprovações de despesa."
      />

      <SectionTabs tabs={TABS_ANALISE} />

      {/* Orçado × Realizado */}
      <Panel icon={Goal} title="Metas do mês — orçado × realizado" description="Acompanhe o realizado contra a meta.">
        <div className="divide-y divide-border">
          <MetaLinha label="Receita" real={plan.receita.real} meta={plan.receita.meta} />
          <MetaLinha label="Despesa (teto)" real={plan.despesa.real} meta={plan.despesa.meta} menorMelhor />
          <MetaLinha label="Receita recorrente (MRR)" real={plan.mrr.real} meta={plan.mrr.meta} />
        </div>
      </Panel>

      {/* Cenários de fluxo */}
      <h2 className="mb-3 mt-8 font-heading text-sm font-semibold">Cenários de caixa (saldo projetado em 6 semanas)</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CloudRain} tone="danger" label="Pessimista" value={formatBRL(cen.pessimista)} hint="atrasos + inadimplência" valueClassName={cen.pessimista < 0 ? "text-danger" : undefined} />
        <StatCard icon={CloudSun} tone="info" label="Realista" value={formatBRL(cen.realista)} hint="lançamentos atuais" valueClassName={cen.realista < 0 ? "text-danger" : undefined} />
        <StatCard icon={Sun} tone="success" label="Otimista" value={formatBRL(cen.otimista)} hint="recebimentos adiantados" />
      </div>

      {/* Aprovação de despesas */}
      <Panel
        className="mt-8"
        icon={CheckCircle2}
        iconTone="warning"
        title="Aprovação de despesas"
        description="Reembolsos e gastos solicitados pelo time."
        action={
          pendentes > 0 ? (
            <span className="rounded-full bg-warning-muted px-2.5 py-1 text-xs font-medium text-warning-muted-foreground">
              {pendentes} aguardando
            </span>
          ) : undefined
        }
      >
        <ul className="divide-y divide-border">
          {solicitacoes.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.descricao}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.solicitante} · {formatData(s.data)} · {formatBRL(s.valor)}
                </p>
              </div>
              {s.status === "pendente" ? (
                <div className="flex shrink-0 gap-1.5">
                  <form action={decidirSolicitacao}>
                    <input type="hidden" name="solicitacao_id" value={s.id} />
                    <input type="hidden" name="status" value="aprovada" />
                    <SubmitButton className="inline-flex items-center gap-1 rounded-lg bg-success-muted px-3 py-1 text-xs font-medium text-success-muted-foreground hover:opacity-90 disabled:opacity-60">
                      <Check className="size-3.5" /> Aprovar
                    </SubmitButton>
                  </form>
                  <form action={decidirSolicitacao}>
                    <input type="hidden" name="solicitacao_id" value={s.id} />
                    <input type="hidden" name="status" value="rejeitada" />
                    <SubmitButton className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60">
                      <X className="size-3.5" /> Recusar
                    </SubmitButton>
                  </form>
                </div>
              ) : (
                <StatusBadge status={s.status} />
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mt-3 text-xs text-muted-foreground">Aprovações já salvam de verdade. Metas e cenários ainda são leitura.</p>
    </div>
  )
}
