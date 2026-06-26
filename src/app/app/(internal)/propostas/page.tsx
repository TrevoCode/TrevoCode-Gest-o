import Link from "next/link"
import { Plus, FileText, ChevronRight } from "lucide-react"
import { listarPropostas } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"

export const metadata = { title: "Propostas" }

export default async function PropostasPage() {
  const propostas = await listarPropostas()
  const emAberto = propostas.filter((p) => p.status === "enviada").reduce((s, p) => s + p.total, 0)
  const aceitas = propostas.filter((p) => p.status === "aceita").reduce((s, p) => s + p.total, 0)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Propostas"
        description="Orçamentos enviados aos clientes — do rascunho ao aceite."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Nova proposta
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <FileText className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(emAberto)}</p>
          <p className="text-sm text-muted-foreground">Em aberto (enviadas)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <FileText className="size-5 text-green-600" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(aceitas)}</p>
          <p className="text-sm text-muted-foreground">Aceitas</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {propostas.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/propostas/${p.id}`}
                className="grid grid-cols-1 gap-1 px-5 py-3.5 transition-colors hover:bg-muted/50 sm:grid-cols-[2fr_1.4fr_1fr_auto] sm:items-center sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.enviada_em ? `enviada ${formatData(p.enviada_em)}` : "rascunho"}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{p.clienteNome}</span>
                <span className="text-sm tabular-nums">{formatBRL(p.total)}</span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
