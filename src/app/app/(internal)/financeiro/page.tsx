import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Plus,
  AlertCircle,
  LineChart,
  CalendarClock,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import { obterFinanceiro, obterFluxoProjetado, listarContasPagar } from "@/lib/data"
import { marcarFatura, pagarConta } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_FINANCEIRO } from "@/components/internal/SectionTabs"
import { StatCard } from "@/components/internal/StatCard"
import { HeroStat } from "@/components/internal/HeroStat"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Financeiro" }

const CAT_LABEL: Record<string, string> = {
  ferramentas: "Ferramentas",
  infraestrutura: "Infraestrutura",
  salarios: "Salários",
  marketing: "Marketing",
  impostos: "Impostos",
  outros: "Outros",
}

export default async function FinanceiroPage() {
  const { kpis, faturas, porCategoria } = await obterFinanceiro()
  const { saldoInicial, linha } = await obterFluxoProjetado()
  const contas = await listarContasPagar()

  const maxCat = Math.max(...porCategoria.map((c) => c.total), 1)
  const positivo = kpis.resultadoMes >= 0
  const maxAbs = Math.max(saldoInicial, ...linha.map((s) => Math.abs(s.saldo)), 1)
  const piorSaldo = Math.min(...linha.map((s) => s.saldo))
  const aPagar = contas.filter((c) => c.situacao !== "paga").reduce((s, c) => s + c.valor, 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Wallet}
        title="Financeiro"
        description="Recebimentos, contas a pagar e projeção de caixa."
        action={
          <div className="flex gap-2">
            <Link href="/app/financeiro/nova-despesa" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
              <Plus className="size-4" /> Despesa
            </Link>
            <Link href="/app/financeiro/nova-fatura" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
              <Plus className="size-4" /> Nova fatura
            </Link>
          </div>
        }
      />

      <SectionTabs tabs={TABS_FINANCEIRO} />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroStat
          icon={Clock}
          label="A receber"
          value={formatBRL(kpis.aReceber)}
          hint={
            kpis.atrasado > 0 ? (
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="size-3.5" /> {formatBRL(kpis.atrasado)} em atraso
              </span>
            ) : (
              "tudo no prazo"
            )
          }
        />
        <StatCard
          icon={CalendarClock}
          tone="danger"
          label="A pagar (em aberto)"
          value={formatBRL(aPagar)}
        />
        <StatCard
          icon={TrendingUp}
          tone="success"
          label="Recebido no mês"
          value={formatBRL(kpis.recebidoMes)}
        />
        <StatCard
          icon={Wallet}
          tone={positivo ? "success" : "danger"}
          label="Resultado do mês"
          value={formatBRL(kpis.resultadoMes)}
          valueClassName={positivo ? "text-success" : "text-danger"}
        />
      </div>

      {/* Fluxo de caixa projetado */}
      <Panel
        className="mt-6"
        icon={LineChart}
        title="Fluxo de caixa projetado — 6 semanas"
        description="Saldo previsto semana a semana com recebimentos e contas a pagar."
        action={
          <span className="text-xs text-muted-foreground tabular-nums">
            Saldo atual: {formatBRL(saldoInicial)}
          </span>
        }
        bodyClassName="p-5"
      >
        {piorSaldo < 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger-muted bg-danger-muted px-3 py-2 text-sm text-danger-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            O caixa projetado fica negativo (mínimo {formatBRL(piorSaldo)}). Antecipe
            recebimentos ou renegocie vencimentos.
          </div>
        )}

        <ul className="space-y-2.5">
          {linha.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs text-muted-foreground">{s.label}</span>
              <span className="hidden w-40 shrink-0 text-xs tabular-nums sm:block">
                <span className="text-success">+{formatBRL(s.entradas)}</span>{" "}
                <span className="text-danger">−{formatBRL(s.saidas)}</span>
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${s.saldo >= 0 ? "bg-success/55" : "bg-danger/55"}`}
                  style={{ width: `${(Math.abs(s.saldo) / maxAbs) * 100}%` }}
                />
              </div>
              <span
                className={`w-24 shrink-0 text-right text-sm tabular-nums ${s.saldo >= 0 ? "text-foreground" : "font-medium text-danger"}`}
              >
                {formatBRL(s.saldo)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Faturas + Contas a pagar */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel
          icon={TrendingUp}
          iconTone="success"
          title="Faturas a receber"
          description="Cobranças emitidas aguardando pagamento."
        >
          <ul className="divide-y divide-border">
            {faturas.filter((f) => f.status !== "paga").length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma fatura a receber.</li>
            )}
            {faturas
              .filter((f) => f.status !== "paga")
              .map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.descricao}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.clienteNome} · vence {formatData(f.vencimento)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums">{formatBRL(f.valor)}</span>
                    <StatusBadge status={f.status} />
                    {f.status === "rascunho" && (
                      <form action={marcarFatura}>
                        <input type="hidden" name="fatura_id" value={f.id} />
                        <input type="hidden" name="status" value="enviada" />
                        <SubmitButton className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60">
                          Enviar
                        </SubmitButton>
                      </form>
                    )}
                    <form action={marcarFatura}>
                      <input type="hidden" name="fatura_id" value={f.id} />
                      <input type="hidden" name="status" value="paga" />
                      <SubmitButton className="rounded-lg bg-success-muted px-2.5 py-1 text-xs font-medium text-success-muted-foreground hover:opacity-90 disabled:opacity-60">
                        Paga
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>

        <Panel
          icon={TrendingDown}
          iconTone="danger"
          title="Contas a pagar"
          description="Despesas com vencimento próximo."
        >
          <ul className="divide-y divide-border">
            {contas.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma conta a pagar.</li>
            )}
            {contas.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CAT_LABEL[c.categoria] ?? c.categoria} · vence {formatData(c.vencimento)}
                    {c.recorrente && " · recorrente"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm tabular-nums">{formatBRL(c.valor)}</span>
                  <StatusBadge status={c.situacao} />
                  {c.situacao !== "paga" && (
                    <form action={pagarConta}>
                      <input type="hidden" name="conta_id" value={c.id} />
                      <SubmitButton className="rounded-lg bg-success-muted px-2.5 py-1 text-xs font-medium text-success-muted-foreground hover:opacity-90 disabled:opacity-60">
                        Pagar
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Despesas por categoria */}
      <Panel
        className="mt-6"
        icon={PieChart}
        iconTone="warning"
        title="Despesas do mês por categoria"
        description="Para onde o dinheiro foi neste mês."
        bodyClassName="p-5"
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {porCategoria.length === 0 && (
            <li className="text-sm text-muted-foreground">Sem despesas no mês.</li>
          )}
          {porCategoria.map((c) => (
            <li key={c.categoria}>
              <div className="flex justify-between text-sm">
                <span>{CAT_LABEL[c.categoria] ?? c.categoria}</span>
                <span className="tabular-nums text-muted-foreground">{formatBRL(c.total)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(c.total / maxCat) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
