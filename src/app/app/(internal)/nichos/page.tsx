import { Trophy, Layers, Target, Flame } from "lucide-react"
import { obterPlacarNichos } from "@/lib/prospeccao"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Nichos" }

const pct = (x: number) => `${Math.round(x * 100)}%`

export default async function NichosPage() {
  const placar = await obterPlacarNichos()

  const totCaptured = placar.reduce((s, n) => s + n.captured, 0)
  const totQualified = placar.reduce((s, n) => s + n.qualified, 0)
  const totClosed = placar.reduce((s, n) => s + n.closed, 0)
  const totReceita = placar.reduce((s, n) => s + n.ticket, 0)
  const dorGeral = totCaptured ? totQualified / totCaptured : 0
  const maxDor = Math.max(...placar.map((n) => n.dor), 0.0001)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Layers}
        title="Nichos"
        description="Placar de captação por nicho. Dor% = qualificados ÷ captados — onde a máquina acha mais oportunidade."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Captados" value={String(totCaptured)} hint={`${placar.length} nichos`} />
        <StatCard icon={Flame} label="Dor média" value={pct(dorGeral)} hint={`${totQualified} qualificados`} tone="danger" />
        <StatCard icon={Trophy} label="Fechados" value={String(totClosed)} tone="success" />
        <StatCard icon={Trophy} label="Receita" value={formatBRL(totReceita)} tone="success" />
      </div>

      <Panel icon={Layers} title="Por nicho" description="Ordenado pela dor% (maior oportunidade primeiro)." bodyClassName="p-0">
        {placar.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Sem captação ainda. Quando a máquina rodar um nicho, o placar aparece aqui.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Nicho</th>
                  <th className="px-4 py-2.5 text-right font-medium">Captados</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qualificados</th>
                  <th className="px-4 py-2.5 font-medium">Dor%</th>
                  <th className="px-4 py-2.5 text-right font-medium">Fechados</th>
                  <th className="px-4 py-2.5 text-right font-medium">Receita</th>
                </tr>
              </thead>
              <tbody>
                {placar.map((n) => (
                  <tr key={n.niche} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{n.niche}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{n.captured}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{n.qualified}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-danger"
                            style={{ width: `${(n.dor / maxDor) * 100}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs font-medium">{pct(n.dor)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{n.closed || "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {n.ticket ? formatBRL(n.ticket) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
