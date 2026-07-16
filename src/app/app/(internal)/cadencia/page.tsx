import Link from "next/link"
import { Send, Clock } from "lucide-react"
import { obterCadencia } from "@/lib/prospeccao"
import type { LeadView } from "@/lib/prospeccao"
import { tempoRelativo } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { PainBadge } from "@/components/internal/PainBadge"

export const metadata = { title: "Cadência" }

// Faixa de cor no topo de cada coluna, pela progressão do outreach.
const COR_STATUS: Record<string, string> = {
  active: "bg-blue-400",
  replied: "bg-violet-400",
  booked: "bg-green-500",
  exhausted: "bg-slate-400",
  optout: "bg-rose-400",
}

function CadenciaCard({ l }: { l: LeadView }) {
  return (
    <Link
      href={`/app/prospeccao/${encodeURIComponent(l.place_id)}`}
      className="block rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium leading-snug">{l.name ?? "—"}</p>
        <PainBadge score={l.pain_score} size="sm" />
      </div>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {[l.niche, l.city].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums">{l.touch_index ?? 0} toques</span>
        {l.next_action_at && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {tempoRelativo(l.next_action_at)}
          </span>
        )}
      </div>
    </Link>
  )
}

export default async function CadenciaPage() {
  const { colunas, emCampanha } = await obterCadencia()

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Send}
        title="Cadência"
        description="Pipeline de outreach — cada lead pela fase da campanha de contato. A máquina move; você acompanha."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      <p className="mb-4 text-sm text-muted-foreground">
        {emCampanha} {emCampanha === 1 ? "lead em campanha" : "leads em campanha"}
      </p>

      {emCampanha === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Send className="mx-auto mb-3 size-7 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhum lead em cadência</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Enfileire um lead na cadência (no detalhe dele, em “Ações”) para a máquina começar os toques.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {colunas.map((col) => (
            <div
              key={col.status}
              className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border shadow-xs"
            >
              <div className={`h-1 ${COR_STATUS[col.status] ?? "bg-muted"}`} />
              <div className="flex items-center justify-between bg-card px-3 pt-2.5">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                  {col.itens.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 border-t border-border bg-muted/30 p-2">
                {col.itens.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">—</p>
                ) : (
                  col.itens.map((l) => <CadenciaCard key={l.place_id} l={l} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
