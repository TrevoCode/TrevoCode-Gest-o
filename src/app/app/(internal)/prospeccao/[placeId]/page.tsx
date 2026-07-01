import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Globe, MessageCircle, Send, Mail } from "lucide-react"
import { obterLead, obterOutreach, obterConversas } from "@/lib/prospeccao"
import type { OutreachStatus } from "@/lib/db/prospect"
import { ProspectChat } from "@/components/internal/ProspectChat"
import { ProspectAcoes } from "@/components/internal/ProspectAcoes"

const STATUS_LABEL: Record<OutreachStatus, { label: string; cls: string }> = {
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

export default async function ProspectLeadPage({
  params,
}: {
  params: Promise<{ placeId: string }>
}) {
  const { placeId } = await params
  const id = decodeURIComponent(placeId)

  const [lead, outreach, conversas] = await Promise.all([
    obterLead(id),
    obterOutreach(id),
    obterConversas(id),
  ])
  if (!lead) notFound()

  const reasons = (lead.reasons ?? "").split(" | ").filter(Boolean)
  const st = outreach?.status ? STATUS_LABEL[outreach.status] : null

  const estado = {
    temIsca: Boolean(lead.isca_at),
    temIsca2: Boolean(lead.isca2_mockup_url || lead.isca2_demo_url),
    emCadencia: Boolean(outreach) && outreach?.status !== "optout" && outreach?.status !== "exhausted",
    fechado: lead.closed === 1,
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/app/prospeccao"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Prospecção
      </Link>

      {/* Cabeçalho */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-2xl font-bold tabular-nums ${dorCor(lead.pain_score)}`}>
                {lead.pain_score}
              </span>
              <h1 className="text-xl font-semibold">{lead.name}</h1>
              {st && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                  {st.label}
                </span>
              )}
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{lead.niche}</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {lead.city}
              </span>
              {lead.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {lead.phone}
                </span>
              )}
              {lead.rating != null && (
                <span>
                  ⭐ {lead.rating}
                  {lead.reviews_count != null ? ` (${lead.reviews_count})` : ""}
                </span>
              )}
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe className="size-3.5" /> site
                </a>
              )}
            </p>
          </div>
        </div>
        {reasons.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Gargalo detectado
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r, i) => (
                <span key={i} className="rounded-md bg-muted/70 px-2 py-1 text-xs text-foreground/80">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 border-t border-border pt-4">
          <ProspectAcoes placeId={lead.place_id} estado={estado} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Isca + artefatos */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Abordagem (isca)
          </h2>
          {!lead.isca_at && (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Isca ainda não gerada para este lead.
            </p>
          )}
          {lead.isca_whatsapp && (
            <IscaBloco icon={MessageCircle} titulo="WhatsApp" texto={lead.isca_whatsapp} />
          )}
          {lead.isca_instagram && (
            <IscaBloco icon={Send} titulo="Instagram DM" texto={lead.isca_instagram} />
          )}
          {lead.isca_email_body && (
            <IscaBloco
              icon={Mail}
              titulo="E-mail"
              texto={`Assunto: ${lead.isca_email_subj ?? ""}\n\n${lead.isca_email_body}`}
            />
          )}

          {(lead.isca2_mockup_url || lead.isca2_demo_url) && (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Demonstração (Nível 2)
              </h2>
              {lead.isca2_mockup_url && (
                <a
                  href={lead.isca2_mockup_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lead.isca2_mockup_url} alt="Mockup do site" className="w-full" />
                </a>
              )}
              {lead.isca2_demo_url && (
                <a
                  href={lead.isca2_demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lead.isca2_demo_url} alt="Demo do bot" className="mx-auto max-h-[520px]" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* CRM de WhatsApp */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Conversa (WhatsApp)
          </h2>
          <ProspectChat placeId={lead.place_id} inicial={conversas} />
        </div>
      </div>
    </div>
  )
}

function IscaBloco({
  icon: Icon,
  titulo,
  texto,
}: {
  icon: React.ComponentType<{ className?: string }>
  titulo: string
  texto: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {titulo}
      </p>
      <p className="whitespace-pre-wrap text-sm text-foreground/90">{texto}</p>
    </div>
  )
}
