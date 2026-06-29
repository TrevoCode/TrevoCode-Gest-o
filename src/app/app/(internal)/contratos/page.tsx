import Link from "next/link"
import { FileSignature, CheckCircle2, Clock, Repeat, Send } from "lucide-react"
import { listarContratos } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SectionTabs, TABS_DOCUMENTOS } from "@/components/internal/SectionTabs"
import { StatCard } from "@/components/internal/StatCard"
import { SubmitButton } from "@/components/internal/SubmitButton"
import { mudarStatusContrato } from "@/lib/actions"

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
          {contratos.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhum contrato ainda. Gere um a partir de uma proposta aceita.
            </li>
          )}
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
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm tabular-nums">
                  {formatBRL(k.valor)}
                  {k.tipo === "recorrente" && <span className="text-xs text-muted-foreground">/mês</span>}
                </span>
                <StatusBadge status={k.status} />
                {k.status === "rascunho" && (
                  <form action={mudarStatusContrato}>
                    <input type="hidden" name="contrato_id" value={k.id} />
                    <input type="hidden" name="status" value="enviado" />
                    <SubmitButton className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60">
                      <Send className="size-3.5" /> Enviar
                    </SubmitButton>
                  </form>
                )}
                {k.status === "enviado" && (
                  <form action={mudarStatusContrato}>
                    <input type="hidden" name="contrato_id" value={k.id} />
                    <input type="hidden" name="status" value="assinado" />
                    <SubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-success-muted px-2.5 py-1 text-xs font-medium text-success-muted-foreground hover:opacity-90 disabled:opacity-60">
                      <CheckCircle2 className="size-3.5" /> Assinado
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Assinatura eletrônica (Clicksign/ZapSign) é um próximo passo. Por ora, marque o status conforme avança.
      </p>
    </div>
  )
}
