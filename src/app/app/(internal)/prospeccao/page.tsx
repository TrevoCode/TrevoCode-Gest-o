import Link from "next/link"
import { Radar, MapPin, Phone, ChevronRight } from "lucide-react"
import { listarProspectLeads, obterProspectPlacar, type ProspectStatus } from "@/lib/prospect"
import { PageHeader } from "@/components/internal/PageHeader"

export const metadata = { title: "Prospecção" }

const STATUS_LABEL: Record<ProspectStatus, { label: string; cls: string }> = {
  active: { label: "Em campanha", cls: "bg-info/10 text-info" },
  replied: { label: "Respondeu", cls: "bg-warning/10 text-warning" },
  booked: { label: "Call agendada", cls: "bg-success/10 text-success" },
  optout: { label: "Opt-out", cls: "bg-muted text-muted-foreground" },
  exhausted: { label: "Esgotado", cls: "bg-muted text-muted-foreground" },
}

function dorCor(score: number) {
  if (score >= 60) return "text-success"
  if (score >= 40) return "text-warning"
  return "text-muted-foreground"
}

export default async function ProspeccaoPage({
  searchParams,
}: {
  searchParams: Promise<{ nicho?: string }>
}) {
  const { nicho } = await searchParams
  const [placar, leads] = await Promise.all([obterProspectPlacar(), listarProspectLeads(nicho)])
  const totalFila = placar.reduce((s, p) => s + p.fila, 0)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Radar}
        title="Prospecção"
        description="Leads captados pela máquina, com a dor digital detectada e a abordagem pronta."
      />

      {/* Placar de nichos */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Nicho</th>
              <th className="px-3 py-2.5 text-right font-medium">Captados</th>
              <th className="px-3 py-2.5 text-right font-medium">Dor%</th>
              <th className="px-3 py-2.5 text-right font-medium">Fila</th>
              <th className="px-3 py-2.5 text-right font-medium">Resp.</th>
              <th className="px-3 py-2.5 text-right font-medium">Fech.</th>
            </tr>
          </thead>
          <tbody>
            {placar.map((p) => {
              const ativo = nicho === p.niche
              return (
                <tr key={p.niche} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={ativo ? "/app/prospeccao" : `/app/prospeccao?nicho=${encodeURIComponent(p.niche)}`}
                      className={`hover:underline ${ativo ? "font-semibold text-foreground" : "text-foreground/90"}`}
                    >
                      {p.niche}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{p.captados}</td>
                  <td className={`px-3 py-2 text-right font-medium tabular-nums ${dorCor(p.dorPct)}`}>{p.dorPct}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.fila}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{p.responderam}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{p.fechados}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {nicho ? (
            <>
              <span className="font-medium text-foreground">{nicho}</span> · {leads.length} leads ·{" "}
              <Link href="/app/prospeccao" className="text-primary hover:underline">ver todos</Link>
            </>
          ) : (
            <>{totalFila} leads na fila (todos os nichos)</>
          )}
        </span>
      </div>

      <ul className="space-y-3">
        {leads.map((l) => {
          const st = l.status ? STATUS_LABEL[l.status] : null
          const reasons = (l.reasons ?? "").split(" | ").filter(Boolean)
          return (
            <li key={l.place_id}>
              <Link
                href={`/app/prospeccao/${encodeURIComponent(l.place_id)}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/30"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-lg font-bold tabular-nums ${dorCor(l.pain_score)}`}>{l.pain_score}</span>
                    <p className="font-medium">{l.name}</p>
                    {st && <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>}
                    {l.isca_at && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">isca pronta</span>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{l.niche}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {l.city}</span>
                    {l.phone && <span className="flex items-center gap-1"><Phone className="size-3" /> {l.phone}</span>}
                  </p>
                  {reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {reasons.map((r, i) => (
                        <span key={i} className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] text-foreground/80">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          )
        })}
        {leads.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum lead nesse filtro.
          </li>
        )}
      </ul>
    </div>
  )
}
