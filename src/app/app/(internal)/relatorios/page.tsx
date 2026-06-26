import {
  BarChart3,
  FileSpreadsheet,
  Repeat,
  TrendingDown,
  Wallet,
  Filter,
  Trophy,
} from "lucide-react"
import { obterDRE, obterRecorrencias, obterFunilVendas } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { Panel } from "@/components/internal/Panel"
import { StatCard } from "@/components/internal/StatCard"

export const metadata = { title: "Relatórios" }

const CAT: Record<string, string> = {
  salarios: "Salários",
  infraestrutura: "Infraestrutura",
  ferramentas: "Ferramentas",
  marketing: "Marketing",
  impostos: "Impostos",
  outros: "Outros",
}

export default async function RelatoriosPage() {
  const dre = await obterDRE()
  const rec = await obterRecorrencias()
  const funil = await obterFunilVendas()
  const maxFunil = Math.max(...funil.porEtapa.map((e) => e.valor), 1)
  const drePos = dre.resultado >= 0
  const recPos = rec.resultadoRecorrente >= 0

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={BarChart3}
        title="Relatórios"
        description="DRE gerencial, receita recorrente e funil de vendas."
      />

      {/* DRE */}
      <Panel icon={FileSpreadsheet} title="DRE gerencial — mês" description="Receita recebida menos custos e despesas.">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">Receita de serviços</span>
            <span className="tabular-nums text-success">+{formatBRL(dre.receita)}</span>
          </div>
          <div className="border-t border-border pt-2">
            <p className="py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custos e despesas</p>
            {dre.custos.map((c) => (
              <div key={c.categoria} className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground">{CAT[c.categoria] ?? c.categoria}</span>
                <span className="tabular-nums">−{formatBRL(c.total)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border py-2 text-sm">
              <span className="font-medium">Total de custos</span>
              <span className="tabular-nums text-danger">−{formatBRL(dre.totalCustos)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t-2 border-border pt-3 text-base">
            <span className="font-semibold">Resultado do mês</span>
            <span className={`font-heading font-semibold tabular-nums ${drePos ? "text-success" : "text-danger"}`}>
              {formatBRL(dre.resultado)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">margem {dre.margem}%</span>
            </span>
          </div>
        </div>
      </Panel>

      {/* Recorrências */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Repeat} tone="success" label="Receita recorrente (MRR)" value={formatBRL(rec.mrr)} />
        <StatCard icon={TrendingDown} tone="danger" label="Custo fixo mensal" value={formatBRL(rec.custoFixo)} />
        <StatCard
          icon={Wallet}
          tone={recPos ? "success" : "danger"}
          label="Resultado recorrente"
          value={formatBRL(rec.resultadoRecorrente)}
          valueClassName={recPos ? "text-success" : "text-danger"}
          hint={recPos ? "recorrência cobre o fixo" : "recorrência não cobre o custo fixo"}
        />
      </div>

      {/* Funil de vendas */}
      <Panel
        className="mt-6"
        icon={Filter}
        title="Funil de vendas"
        description="Negócios por etapa e taxa de conversão."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-xs font-medium text-success-muted-foreground">
            <Trophy className="size-3.5" /> {funil.taxaGanho}% de ganho
          </span>
        }
      >
        <ul className="space-y-3 px-5 py-4">
          {funil.porEtapa.map((e) => (
            <li key={e.etapa} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{e.label}</span>
              <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${e.etapa === "ganho" ? "bg-success" : e.etapa === "perdido" ? "bg-danger/70" : "bg-primary/70"}`}
                  style={{ width: `${(e.valor / maxFunil) * 100}%` }}
                />
              </div>
              <span className="w-40 shrink-0 text-right text-sm tabular-nums">
                {formatBRL(e.valor)} <span className="text-xs text-muted-foreground">· {e.n}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
