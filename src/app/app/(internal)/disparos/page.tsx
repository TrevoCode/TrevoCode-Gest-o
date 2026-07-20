import Link from "next/link"
import { Send, MailCheck, MailOpen, MailX, Inbox, CalendarDays, Package } from "lucide-react"
import { obterDisparosEmail, type EstadoEnvio } from "@/lib/prospeccao"
import { formatData, formatDataHora } from "@/lib/format"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { Panel } from "@/components/internal/Panel"

export const metadata = { title: "Disparos" }

// Badge do estado do envio (mesma paleta semântica do StatusBadge).
const ESTADO: Record<EstadoEnvio, { label: string; classes: string; dot: string }> = {
  sent: { label: "Enviado", classes: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
  delivered: { label: "Entregue", classes: "bg-info-muted text-info-muted-foreground", dot: "bg-info" },
  opened: { label: "Aberto", classes: "bg-success-muted text-success-muted-foreground", dot: "bg-success" },
  clicked: { label: "Clicou", classes: "bg-success-muted text-success-muted-foreground", dot: "bg-success" },
  bounced: { label: "Bounce", classes: "bg-danger-muted text-danger-muted-foreground", dot: "bg-danger" },
  complained: { label: "Spam", classes: "bg-danger-muted text-danger-muted-foreground", dot: "bg-danger" },
}

function EstadoBadge({ estado }: { estado: EstadoEnvio }) {
  const e = ESTADO[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${e.classes}`}>
      <span className={`size-1.5 rounded-full ${e.dot}`} />
      {e.label}
    </span>
  )
}

export default async function DisparosPage() {
  const { hoje, porDia, envios, estoque, estoqueTotal } = await obterDisparosEmail()

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Send}
        title="Disparos de email"
        description="Placar do disparo automático diário (timer da máquina, seg a sex de manhã). Respostas dos leads chegam no Gmail monitorado, não aqui."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Send} label="Enviados hoje" value={String(hoje.enviados)} />
        <StatCard icon={MailCheck} label="Entregues hoje" value={String(hoje.entregues)} tone="info" />
        <StatCard icon={MailOpen} label="Abertos hoje" value={String(hoje.abertos)} tone="success" />
        <StatCard
          icon={MailX}
          label="Bounces hoje"
          value={String(hoje.bounces)}
          tone={hoje.bounces > 0 ? "danger" : "primary"}
          hint={hoje.reclamacoes > 0 ? `${hoje.reclamacoes} marcaram spam` : undefined}
        />
      </div>

      <Panel
        icon={Inbox}
        title="Últimos disparos"
        description="Um lead por linha; o pior evento define o estado (bounce ganha de aberto)."
        bodyClassName="p-0"
      >
        {envios.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Nenhum disparo registrado ainda. Quando o timer da máquina rodar, os envios aparecem aqui.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Lead</th>
                  <th className="px-4 py-2.5 font-medium">Cidade</th>
                  <th className="px-4 py-2.5 font-medium">Nicho</th>
                  <th className="px-4 py-2.5 font-medium">Var.</th>
                  <th className="px-4 py-2.5 font-medium">Assunto</th>
                  <th className="px-4 py-2.5 font-medium">Enviado</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {envios.slice(0, 60).map((e) => (
                  <tr key={e.place_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">
                      <Link href={`/app/prospeccao/${encodeURIComponent(e.place_id)}`} className="hover:underline">
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.uf}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.niche ?? "?"}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex size-5 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                        {e.variante}
                      </span>
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-2.5 text-muted-foreground" title={e.assunto ?? undefined}>
                      {e.assunto ?? "?"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-muted-foreground">
                      {formatDataHora(e.enviado_em)}
                    </td>
                    <td className="px-4 py-2.5">
                      <EstadoBadge estado={e.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel icon={CalendarDays} title="Placar por dia" description="Leads únicos por evento, no fuso da empresa." bodyClassName="p-0">
          {porDia.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Sem histórico ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Dia</th>
                    <th className="px-4 py-2.5 text-right font-medium">Enviados</th>
                    <th className="px-4 py-2.5 text-right font-medium">Entregues</th>
                    <th className="px-4 py-2.5 text-right font-medium">Abertos</th>
                    <th className="px-4 py-2.5 text-right font-medium">Bounces</th>
                  </tr>
                </thead>
                <tbody>
                  {porDia.slice(0, 14).map((d) => (
                    <tr key={d.dia} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums">{formatData(d.dia)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{d.enviados}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{d.entregues}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{d.abertos}</td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${d.bounces ? "font-medium text-danger" : "text-muted-foreground"}`}>
                        {d.bounces || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          icon={Package}
          title="Estoque pronto"
          description={`${estoqueTotal} leads com isca aprovada aguardando disparo (mesma régua do disparador).`}
          bodyClassName="p-0"
        >
          {estoque.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Sem estoque pronto. A máquina precisa verificar e gerar iscas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Cidade</th>
                    <th className="px-4 py-2.5 font-medium">Nicho</th>
                    <th className="px-4 py-2.5 text-right font-medium">Prontos</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((l) => (
                    <tr key={`${l.uf}-${l.niche}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{l.uf}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.niche}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{l.prontos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
