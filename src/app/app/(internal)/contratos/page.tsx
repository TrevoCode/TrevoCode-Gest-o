import Link from "next/link"
import { FileSignature, CheckCircle2, Clock, Repeat, Send } from "lucide-react"
import { listarContratos } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_DOCUMENTOS } from "@/components/internal/SectionTabs"
import { StatCard } from "@/components/internal/StatCard"

export const metadata = { title: "Contratos" }

export default async function ContratosPage() {
  const contratos = await listarContratos()
  const assinados = contratos.filter((k) => k.status === "assinado")
  const aguardando = contratos.filter((k) => k.status === "enviado").length
  const sobContrato = assinados.reduce((s, k) => s + k.valor, 0)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={FileSignature}
        title="Contratos"
        description="Contratos gerados a partir das propostas e status de assinatura."
      />

      <SectionTabs tabs={TABS_DOCUMENTOS} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} tone="success" label="Sob contrato (assinados)" value={formatBRL(sobContrato)} />
        <StatCard icon={FileSignature} label="Contratos assinados" value={String(assinados.length)} />
        <StatCard icon={Clock} tone="warning" label="Aguardando assinatura" value={String(aguardando)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <ul className="divide-y divide-border">
          {contratos.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{k.titulo}</p>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Link href={`/app/clientes/${k.cliente_id}`} className="hover:text-foreground">{k.clienteNome}</Link>
                  <span>·</span>
                  {k.tipo === "recorrente" ? (
                    <span className="inline-flex items-center gap-1"><Repeat className="size-3.5" /> Recorrente</span>
                  ) : (
                    "Projeto"
                  )}
                  {k.vigencia_inicio && k.vigencia_fim && (
                    <><span>·</span><span>vigência {formatData(k.vigencia_inicio)} – {formatData(k.vigencia_fim)}</span></>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm tabular-nums">
                  {formatBRL(k.valor)}
                  {k.tipo === "recorrente" && <span className="text-xs text-muted-foreground">/mês</span>}
                </span>
                {k.status === "enviado" ? (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                    <Send className="size-3.5" /> Lembrar
                  </button>
                ) : (
                  <StatusBadge status={k.status} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Protótipo — geração de PDF e assinatura eletrônica (Clicksign/DocuSign) entram com o backend.
      </p>
    </div>
  )
}
