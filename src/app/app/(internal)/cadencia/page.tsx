import Link from "next/link"
import { Send, MapPin } from "lucide-react"
import { obterCadencia } from "@/lib/prospeccao"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { PainBadge } from "@/components/internal/PainBadge"

export const metadata = { title: "Cadência" }

export default async function CadenciaPage() {
  const { colunas, emCampanha } = await obterCadencia()

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Send}
        title="Cadência"
        description="Pipeline do outreach: em que estágio está cada lead que a máquina está abordando."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      <p className="mb-4 text-sm text-muted-foreground">
        {emCampanha} {emCampanha === 1 ? "lead em campanha" : "leads em campanha"}
      </p>

      {emCampanha === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Send className="mx-auto mb-3 size-7 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhum lead em cadência ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Quando um lead entra na fila de outreach (e a máquina envia o primeiro toque), ele aparece aqui por estágio.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {colunas.map((col) => (
            <div key={col.status} className="rounded-xl border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{col.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {col.itens.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {col.itens.map((l) => (
                  <Link
                    key={l.place_id}
                    href={`/app/prospeccao/${encodeURIComponent(l.place_id)}`}
                    className="block rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-medium">{l.name ?? "—"}</p>
                      <PainBadge score={l.pain_score} size="sm" />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{l.niche ?? "—"}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      {l.city ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {l.city}
                        </span>
                      ) : (
                        <span />
                      )}
                      {l.touch_index != null && l.touch_index > 0 && (
                        <span className="tabular-nums">{l.touch_index} toques</span>
                      )}
                    </div>
                  </Link>
                ))}
                {col.itens.length === 0 && (
                  <p className="px-1 py-3 text-center text-[11px] text-muted-foreground/60">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
