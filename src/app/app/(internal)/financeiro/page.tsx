import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Plus,
  AlertCircle,
  LineChart,
  CalendarClock,
} from "lucide-react"
import { obterFinanceiro, obterFluxoProjetado, listarContasPagar } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"

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
        title="Financeiro"
        description="Recebimentos, contas a pagar e projeção de caixa."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Nova fatura
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <Clock className="size-5 text-amber-500" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(kpis.aReceber)}</p>
          <p className="text-sm text-muted-foreground">A receber</p>
          {kpis.atrasado > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="size-3.5" /> {formatBRL(kpis.atrasado)} em atraso
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <CalendarClock className="size-5 text-rose-500" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(aPagar)}</p>
          <p className="text-sm text-muted-foreground">A pagar (em aberto)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <TrendingUp className="size-5 text-green-600" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(kpis.recebidoMes)}</p>
          <p className="text-sm text-muted-foreground">Recebido no mês</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Wallet className={`size-5 ${positivo ? "text-green-600" : "text-rose-500"}`} />
          <p className={`mt-3 text-2xl font-semibold tabular-nums ${positivo ? "text-green-700" : "text-rose-600"}`}>
            {formatBRL(kpis.resultadoMes)}
          </p>
          <p className="text-sm text-muted-foreground">Resultado do mês</p>
        </div>
      </div>

      {/* Fluxo de caixa projetado */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <LineChart className="size-4 text-primary" /> Fluxo de caixa projetado — 6 semanas
          </h2>
          <span className="text-xs text-muted-foreground">Saldo atual: {formatBRL(saldoInicial)}</span>
        </div>

        {piorSaldo < 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            O caixa projetado fica negativo (mínimo {formatBRL(piorSaldo)}). Antecipe recebimentos ou renegocie vencimentos.
          </div>
        )}

        <ul className="mt-4 space-y-2.5">
          {linha.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs text-muted-foreground">{s.label}</span>
              <span className="hidden w-40 shrink-0 text-xs sm:block">
                <span className="text-green-600">+{formatBRL(s.entradas)}</span>{" "}
                <span className="text-rose-600">−{formatBRL(s.saidas)}</span>
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${s.saldo >= 0 ? "bg-green-500/60" : "bg-rose-500/60"}`}
                  style={{ width: `${(Math.abs(s.saldo) / maxAbs) * 100}%` }}
                />
              </div>
              <span className={`w-24 shrink-0 text-right text-sm tabular-nums ${s.saldo >= 0 ? "text-foreground" : "font-medium text-rose-600"}`}>
                {formatBRL(s.saldo)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Faturas + Contas a pagar */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="size-4 text-primary" /> Faturas a receber
            </h2>
          </header>
          <ul className="divide-y divide-border">
            {faturas.filter((f) => f.status !== "paga").map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.clienteNome} · vence {formatData(f.vencimento)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums">{formatBRL(f.valor)}</span>
                  <StatusBadge status={f.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="size-4 text-primary" /> Contas a pagar
            </h2>
          </header>
          <ul className="divide-y divide-border">
            {contas.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CAT_LABEL[c.categoria] ?? c.categoria} · vence {formatData(c.vencimento)}
                    {c.recorrente && " · recorrente"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums">{formatBRL(c.valor)}</span>
                  <StatusBadge status={c.situacao} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Despesas por categoria */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Despesas do mês por categoria</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {porCategoria.length === 0 && (
            <li className="text-sm text-muted-foreground">Sem despesas no mês.</li>
          )}
          {porCategoria.map((c) => (
            <li key={c.categoria}>
              <div className="flex justify-between text-sm">
                <span>{CAT_LABEL[c.categoria] ?? c.categoria}</span>
                <span className="tabular-nums text-muted-foreground">{formatBRL(c.total)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(c.total / maxCat) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
