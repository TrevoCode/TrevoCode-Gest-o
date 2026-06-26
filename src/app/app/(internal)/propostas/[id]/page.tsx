import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Send, Check, FileSignature, Download, ListChecks } from "lucide-react"
import { obterProposta } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { Panel } from "@/components/internal/Panel"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await obterProposta(id)
  return { title: p ? p.titulo : "Proposta" }
}

const acaoCls =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90"

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
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
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
          {p.itens.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-sm">{item.descricao}</span>
              <span className="text-sm tabular-nums">{formatBRL(item.valor)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-2">
        {p.status === "rascunho" && (
          <button className={acaoCls}>
            <Send className="size-4" /> Enviar ao cliente
          </button>
        )}
        {p.status === "enviada" && (
          <button className={acaoCls}>
            <Check className="size-4" /> Marcar como aceita
          </button>
        )}
        {p.status === "aceita" && (
          <button className={acaoCls}>
            <FileSignature className="size-4" /> Gerar contrato
          </button>
        )}
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-muted">
          <Download className="size-4" /> Baixar PDF
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Protótipo — envio, aceite, contrato e PDF entram quando o backend for conectado.
      </p>
    </div>
  )
}
