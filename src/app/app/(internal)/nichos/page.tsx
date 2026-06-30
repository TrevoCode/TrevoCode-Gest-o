import Link from "next/link"
import { Layers, Trophy } from "lucide-react"
import { obterPlacarNichos } from "@/lib/prospeccao"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"

export const metadata = { title: "Nichos" }

function dorCor(pct: number) {
  if (pct >= 60) return "text-success"
  if (pct >= 40) return "text-warning"
  return "text-muted-foreground"
}

export default async function NichosPage() {
  const placar = await obterPlacarNichos()
  // Critério: nicho que mais FECHA; depois mais dor; depois mais captado.
  const linhas = [...placar].sort(
    (a, b) => b.closed - a.closed || b.dor - a.dor || b.captured - a.captured
  )

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={Layers}
        title="Nichos"
        description="Descoberta de nicho: onde tem mais dor digital e, principalmente, onde mais FECHA."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      {linhas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Layers className="mx-auto mb-3 size-7 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhum nicho captado ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Conforme a máquina capta nichos, o placar aparece aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Nicho</th>
                <th className="px-3 py-2.5 text-right font-medium">Captados</th>
                <th className="px-3 py-2.5 text-right font-medium">Dor%</th>
                <th className="px-3 py-2.5 text-right font-medium">Fechados</th>
                <th className="px-3 py-2.5 text-right font-medium">Receita</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((n) => {
                const pct = Math.round(n.dor * 100)
                return (
                  <tr key={n.niche} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/app/prospeccao?niche=${encodeURIComponent(n.niche)}`}
                        className="font-medium text-foreground/90 hover:underline"
                      >
                        {n.niche}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{n.captured}</td>
                    <td className={`px-3 py-2.5 text-right font-medium tabular-nums ${dorCor(pct)}`}>{pct}%</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {n.closed > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-success">
                          <Trophy className="size-3" /> {n.closed}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {n.ticket ? formatBRL(n.ticket) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Dor% = qualificados ÷ captados. A coluna que decide onde escalar é <strong>Fechados</strong>.
      </p>
    </div>
  )
}
