import {
  Banknote,
  BellRing,
  Check,
  Clock,
  Upload,
  Link2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"
import { obterTesouraria } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_FINANCEIRO } from "@/components/internal/SectionTabs"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Cobrança" }

export default async function CobrancaPage() {
  const { cobrancas, transacoes } = await obterTesouraria()
  const pendentes = transacoes.filter((t) => !t.match).length

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Banknote}
        title="Cobrança e conciliação"
        description="Régua de lembretes das faturas e conferência do extrato bancário."
      />

      <SectionTabs tabs={TABS_FINANCEIRO} />

      {/* Régua de cobrança */}
      <Panel
        icon={BellRing}
        title="Régua de cobrança"
        description="Lembretes automáticos enviados ao cliente por fatura."
      >
        <ul className="divide-y divide-border">
          {cobrancas.length === 0 && (
            <li className="px-5 py-6 text-sm text-muted-foreground">Nenhuma fatura a receber.</li>
          )}
          {cobrancas.map((c) => (
            <li key={c.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.clienteNome} · vence {formatData(c.vencimento)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums">{formatBRL(c.valor)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.lembretes.map((l) => (
                  <span
                    key={l.label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                      l.enviado
                        ? "bg-success-muted text-success-muted-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {l.enviado ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
                    {l.label}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Conciliação bancária */}
      <Panel
        className="mt-6"
        icon={Link2}
        iconTone="info"
        title="Conciliação bancária"
        description="Confira as transações do extrato com as faturas e despesas."
        action={
          pendentes > 0 ? (
            <span className="rounded-full bg-warning-muted px-2.5 py-1 text-xs font-medium text-warning-muted-foreground">
              {pendentes} pendente{pendentes === 1 ? "" : "s"}
            </span>
          ) : undefined
        }
      >
        <div className="px-5 py-4">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 py-8 text-center">
            <Upload className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Conciliação automática em breve</p>
            <p className="text-xs text-muted-foreground">
              Importação de extrato (OFX) e Open Finance entram numa próxima fase.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border border-t border-border">
          {transacoes.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              Sem transações importadas. A leitura de extrato (OFX/Open Finance) entra em breve.
            </li>
          )}
          {transacoes.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                    t.tipo === "entrada"
                      ? "bg-success-muted text-success-muted-foreground"
                      : "bg-danger-muted text-danger-muted-foreground"
                  }`}
                >
                  {t.tipo === "entrada" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm">{t.descricao}</p>
                  <p className="text-xs text-muted-foreground">{formatData(t.data)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`text-sm tabular-nums ${t.tipo === "entrada" ? "text-success" : "text-danger"}`}>
                  {t.tipo === "entrada" ? "+" : "−"}{formatBRL(t.valor)}
                </span>
                {t.match ? (
                  <span className="hidden items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-0.5 text-xs font-medium text-success-muted-foreground sm:inline-flex">
                    <Check className="size-3.5" /> {t.match}
                  </span>
                ) : (
                  <button className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                    Conciliar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mt-3 text-xs text-muted-foreground">
        A régua mostra os vencimentos e quando cada lembrete cai. Envio automático (boleto/PIX) e conciliação OFX/Open Finance são próximos passos.
      </p>
    </div>
  )
}
