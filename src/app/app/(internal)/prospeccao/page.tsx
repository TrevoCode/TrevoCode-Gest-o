import Link from "next/link"
import { Radar, Flame, Send, MessageSquareReply, Trophy, MapPin, Phone } from "lucide-react"
import { listarLeads, listarNichos } from "@/lib/prospeccao"
import type { LeadView } from "@/lib/prospeccao"
import { formatBRL } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { PainBadge } from "@/components/internal/PainBadge"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { ProspectFiltros } from "@/components/internal/ProspectFiltros"

export const metadata = { title: "Prospecção" }

const STATUS_LABEL: Record<string, string> = {
  active: "Em cadência",
  replied: "Respondeu",
  booked: "Reunião marcada",
  exhausted: "Esgotado",
  optout: "Opt-out",
}

function LeadCard({ l }: { l: LeadView }) {
  const reasons = (l.reasons ?? "").split(" | ").map((r) => r.trim()).filter(Boolean)
  return (
    <Link
      href={`/app/prospeccao/${encodeURIComponent(l.place_id)}`}
      className="group block rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium leading-snug">{l.name ?? "—"}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{l.niche ?? "—"}</p>
        </div>
        <PainBadge score={l.pain_score} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {l.city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {l.city}
          </span>
        )}
        {l.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="size-3" /> {l.phone}
          </span>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {reasons.slice(0, 3).map((r, i) => (
            <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {r}
            </span>
          ))}
          {reasons.length > 3 && (
            <span className="px-1 text-[11px] text-muted-foreground">+{reasons.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-1.5">
          {l.status ? (
            <StatusBadge status={l.status} />
          ) : l.isca_at ? (
            <span className="text-[11px] text-muted-foreground">isca pronta</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">novo</span>
          )}
          {l.closed === 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
              <Trophy className="size-3" /> {l.ticket ? formatBRL(l.ticket) : "fechado"}
            </span>
          )}
        </div>
        {l.touch_index != null && l.touch_index > 0 && (
          <span className="text-[11px] tabular-nums text-muted-foreground">{l.touch_index} toques</span>
        )}
      </div>
    </Link>
  )
}

export default async function ProspeccaoPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string; status?: string }>
}) {
  const { niche, status } = await searchParams
  const [leads, nichos] = await Promise.all([listarLeads({ niche, status }), listarNichos()])

  const quentes = leads.filter((l) => l.pain_score >= 70).length
  const emCadencia = leads.filter((l) => l.status === "active").length
  const responderam = leads.filter((l) => l.replied === 1).length
  const fechados = leads.filter((l) => l.closed === 1)
  const receita = fechados.reduce((s, l) => s + (l.ticket ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Radar}
        title="Prospecção"
        description="Leads captados pela máquina no Google Maps, ordenados por dor digital. Maior dor = maior oportunidade."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Leads quentes" value={String(quentes)} hint="dor ≥ 70" tone="danger" />
        <StatCard icon={Send} label="Em cadência" value={String(emCadencia)} hint="outreach ativo" tone="info" />
        <StatCard icon={MessageSquareReply} label="Responderam" value={String(responderam)} tone="primary" />
        <StatCard
          icon={Trophy}
          label="Fechados"
          value={String(fechados.length)}
          hint={receita ? formatBRL(receita) : undefined}
          tone="success"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {leads.length} {leads.length === 1 ? "lead" : "leads"}
          {(niche || status) && " (filtrado)"}
          {status && STATUS_LABEL[status] ? ` · ${STATUS_LABEL[status]}` : ""}
        </p>
        <ProspectFiltros nichos={nichos} />
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Radar className="mx-auto mb-3 size-7 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhum lead por aqui ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {niche || status
              ? "Nenhum lead bate com esse filtro. Limpe os filtros para ver todos."
              : "Assim que a máquina captar um nicho, os leads aparecem aqui automaticamente."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((l) => (
            <LeadCard key={l.place_id} l={l} />
          ))}
        </div>
      )}
    </div>
  )
}
