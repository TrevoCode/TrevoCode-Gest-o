import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Star,
  MessageCircle,
  Camera,
  Mail,
  Sparkles,
  ImageIcon,
  AlertTriangle,
  Send,
} from "lucide-react"
import { obterLead, obterOutreach, obterConversas } from "@/lib/prospeccao"
import { formatBRL, formatDataHora } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { Panel } from "@/components/internal/Panel"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PainBadge } from "@/components/internal/PainBadge"
import { CopyButton } from "@/components/internal/CopyButton"
import { ProspectChat } from "@/components/internal/ProspectChat"
import { ProspectAcoes } from "@/components/internal/ProspectAcoes"

export async function generateMetadata({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params
  const lead = await obterLead(decodeURIComponent(placeId))
  return { title: lead?.name ?? "Lead" }
}

export default async function LeadDetalhePage({
  params,
}: {
  params: Promise<{ placeId: string }>
}) {
  const { placeId: raw } = await params
  const placeId = decodeURIComponent(raw)
  const [lead, outreach, conversas] = await Promise.all([
    obterLead(placeId),
    obterOutreach(placeId),
    obterConversas(placeId),
  ])
  if (!lead) notFound()

  const reasons = (lead.reasons ?? "").split(" | ").map((r) => r.trim()).filter(Boolean)
  const channels = (lead.channels ?? "").split(",").map((c) => c.trim()).filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/app/prospeccao"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para o radar
      </Link>

      <PageHeader
        icon={MapPin}
        title={lead.name ?? "Lead"}
        description={[lead.niche, lead.city].filter(Boolean).join(" · ") || undefined}
        action={
          <div className="flex flex-col items-end gap-1.5">
            <PainBadge score={lead.pain_score} />
            {outreach?.status && <StatusBadge status={outreach.status} />}
          </div>
        }
      />

      {/* Contato rápido */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {lead.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-4" /> {lead.phone}
          </span>
        )}
        {lead.website ? (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
          >
            <Globe className="size-4" /> site
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-warning">
            <Globe className="size-4" /> sem site
          </span>
        )}
        {lead.rating != null && (
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4" /> {lead.rating}
            {lead.reviews_count != null && ` (${lead.reviews_count})`}
          </span>
        )}
        {channels.map((c) => (
          <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize">
            {c}
          </span>
        ))}
      </div>

      {/* Ações */}
      <Panel
        className="mb-5"
        icon={Send}
        title="Ações"
        description="Disparam a máquina de prospecção. O resultado reflete aqui e na conversa, ao vivo."
        bodyClassName="p-4"
      >
        <ProspectAcoes
          placeId={lead.place_id}
          estado={{
            temIsca: Boolean(lead.isca_at),
            temIsca2: Boolean(lead.isca2_mockup_url || lead.isca2_demo_url),
            emCadencia: outreach?.status === "active",
            fechado: lead.closed === 1,
          }}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        {/* Coluna esquerda: dor + iscas */}
        <div className="space-y-5">
          {reasons.length > 0 && (
            <Panel
              icon={AlertTriangle}
              iconTone="warning"
              title="Dor digital detectada"
              description="Gargalos que a máquina identificou — a base da abordagem."
              bodyClassName="p-4"
            >
              <ul className="space-y-1.5">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                    {r}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel
            icon={Sparkles}
            title="Iscas — mensagens prontas"
            description={
              lead.isca_at
                ? `Geradas ${formatDataHora(lead.isca_at)}.`
                : "Ainda sem isca. Use “Gerar isca” acima."
            }
            bodyClassName="divide-y divide-border"
          >
            <IscaBloco icon={MessageCircle} titulo="WhatsApp" texto={lead.isca_whatsapp} />
            <IscaBloco icon={Camera} titulo="Instagram" texto={lead.isca_instagram} />
            <IscaBloco
              icon={Mail}
              titulo="E-mail"
              texto={
                lead.isca_email_subj || lead.isca_email_body
                  ? `${lead.isca_email_subj ?? ""}\n\n${lead.isca_email_body ?? ""}`.trim()
                  : null
              }
              assunto={lead.isca_email_subj}
            />
          </Panel>

          {(lead.isca2_mockup_url || lead.isca2_demo_url) && (
            <Panel
              icon={ImageIcon}
              iconTone="info"
              title="Artefatos visuais (Nível 2)"
              description="Mockup do site e demo do bot — gerados pela máquina."
              bodyClassName="grid gap-4 p-4 sm:grid-cols-2"
            >
              {lead.isca2_mockup_url && <Artefato url={lead.isca2_mockup_url} legenda="Mockup de site" />}
              {lead.isca2_demo_url && <Artefato url={lead.isca2_demo_url} legenda="Demo do bot" />}
            </Panel>
          )}
        </div>

        {/* Coluna direita: CRM de WhatsApp ao vivo */}
        <Panel
          icon={MessageCircle}
          iconTone="success"
          title="Conversa (WhatsApp)"
          description="Ao vivo. A IA SDR conversa; você acompanha."
          bodyClassName="p-0"
          className="lg:sticky lg:top-4 lg:self-start"
        >
          <ProspectChat placeId={lead.place_id} inicial={conversas} />
        </Panel>
      </div>

      {lead.closed === 1 && (
        <p className="mt-5 rounded-lg bg-success-muted px-4 py-2 text-sm font-medium text-success-muted-foreground">
          🏆 Fechado{lead.ticket ? ` · ${formatBRL(lead.ticket)}` : ""}.
        </p>
      )}
    </div>
  )
}

function IscaBloco({
  icon: Icon,
  titulo,
  texto,
  assunto,
}: {
  icon: typeof MessageCircle
  titulo: string
  texto: string | null
  assunto?: string | null
}) {
  return (
    <div className="p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" /> {titulo}
        </span>
        {texto && <CopyButton texto={texto} />}
      </div>
      {texto ? (
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          {assunto && <p className="mb-1 font-medium">{assunto}</p>}
          <p className="whitespace-pre-wrap text-muted-foreground">
            {assunto ? texto.replace(assunto, "").trim() : texto}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/70">—</p>
      )}
    </div>
  )
}

function Artefato({ url, legenda }: { url: string; legenda: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={legenda} className="aspect-video w-full object-cover" />
      </a>
      <figcaption className="bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">{legenda}</figcaption>
    </figure>
  )
}
