import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Plus,
  AlertCircle,
} from "lucide-react"
import { obterFinanceiro } from "@/lib/data"
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
  const { kpis, faturas, despesas, porCategoria } = await obterFinanceiro()
  const maxCat = Math.max(...porCategoria.map((c) => c.total), 1)
  const positivo = kpis.resultadoMes >= 0

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Financeiro"
        description="Faturamento, recebimentos e despesas do mês."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Nova fatura
          </button>
        }
      />

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
          <TrendingUp className="size-5 text-green-600" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(kpis.recebidoMes)}</p>
          <p className="text-sm text-muted-foreground">Recebido no mês</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <TrendingDown className="size-5 text-rose-500" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(kpis.despesasMes)}</p>
          <p className="text-sm text-muted-foreground">Despesas no mês</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Wallet className={`size-5 ${positivo ? "text-green-600" : "text-rose-500"}`} />
          <p className={`mt-3 text-2xl font-semibold tabular-nums ${positivo ? "text-green-700" : "text-rose-600"}`}>
            {formatBRL(kpis.resultadoMes)}
          </p>
          <p className="text-sm text-muted-foreground">Resultado do mês</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Faturas */}
        <section className="rounded-xl border border-border bg-card lg:col-span-2">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Faturas</h2>
          </header>
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Descrição</span>
            <span>Vencimento</span>
            <span className="text-right">Valor</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-border">
            {faturas.map((f) => (
              <li key={f.id} className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.clienteNome}</p>
                </div>
                <span className="text-sm text-muted-foreground">{formatData(f.vencimento)}</span>
                <span className="text-sm tabular-nums sm:text-right">{formatBRL(f.valor)}</span>
                <span><StatusBadge status={f.status} /></span>
              </li>
            ))}
          </ul>
        </section>

        {/* Despesas */}
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Despesas do mês por categoria</h2>
            <ul className="mt-4 space-y-3">
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
          </div>

          <div className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Lançamentos recentes</h2>
            </header>
            <ul className="divide-y divide-border">
              {despesas.slice(0, 6).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{d.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {CAT_LABEL[d.categoria] ?? d.categoria} · {formatData(d.data)}
                      {d.recorrente && " · recorrente"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-rose-600">– {formatBRL(d.valor)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
