import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Send, Check, X, FileSignature, ListChecks } from "lucide-react"
import { obterProposta } from "@/lib/data"
import { mudarStatusProposta, gerarContrato } from "@/lib/actions"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { Panel } from "@/components/internal/Panel"
import { SubmitButton } from "@/components/internal/SubmitButton"
import { ImprimirButton } from "@/components/internal/ImprimirButton"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await obterProposta(id)
  return { title: p ? p.titulo : "Proposta" }
}

const acaoCls =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60"
const acaoOutline =
  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-muted disabled:opacity-60"

export default async function PropostaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const p = await obterProposta(id)
  if (!p) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/app/propostas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-4" /> Propostas
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{p.titulo}</h1>
        <StatusBadge status={p.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <Link href={`/app/clientes/${p.cliente_id}`} className="hover:text-foreground">
          {p.clienteNome}
        </Link>
        {p.enviada_em && ` · enviada ${formatData(p.enviada_em)}`}
        {p.validade && ` · válida até ${formatData(p.validade)}`}
      </p>

      <Panel
        className="mt-6"
        icon={ListChecks}
        title="Itens"
        description="O que está incluído nesta proposta."
        footer={
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-semibold tabular-nums text-primary">
              {formatBRL(p.total)}
            </span>
          </div>
        }
      >
        <ul className="divide-y divide-border">
          {p.itens.length === 0 && (
            <li className="px-5 py-6 text-sm text-muted-foreground">Sem itens nesta proposta.</li>
          )}
          {p.itens.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-sm">{item.descricao}</span>
              <span className="text-sm tabular-nums">{formatBRL(item.valor)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
        {p.status === "rascunho" && (
          <form action={mudarStatusProposta}>
            <input type="hidden" name="proposta_id" value={p.id} />
            <input type="hidden" name="status" value="enviada" />
            <SubmitButton className={acaoCls}>
              <Send className="size-4" /> Enviar ao cliente
            </SubmitButton>
          </form>
        )}
        {p.status === "enviada" && (
          <>
            <form action={mudarStatusProposta}>
              <input type="hidden" name="proposta_id" value={p.id} />
              <input type="hidden" name="status" value="aceita" />
              <SubmitButton className={acaoCls}>
                <Check className="size-4" /> Marcar como aceita
              </SubmitButton>
            </form>
            <form action={mudarStatusProposta}>
              <input type="hidden" name="proposta_id" value={p.id} />
              <input type="hidden" name="status" value="recusada" />
              <SubmitButton className={acaoOutline}>
                <X className="size-4" /> Recusada
              </SubmitButton>
            </form>
          </>
        )}
        {p.status === "aceita" && (
          <form action={gerarContrato}>
            <input type="hidden" name="proposta_id" value={p.id} />
            <SubmitButton className={acaoCls}>
              <FileSignature className="size-4" /> Gerar contrato
            </SubmitButton>
          </form>
        )}
        <ImprimirButton className={acaoOutline} />
      </div>
    </div>
  )
}
