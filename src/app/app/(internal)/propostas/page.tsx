import Link from "next/link"
import { Plus, FileText, CheckCircle2, ChevronRight } from "lucide-react"
import { listarPropostas } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"

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
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Nova proposta
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={FileText}
          tone="info"
          label="Em aberto (enviadas)"
          value={formatBRL(emAberto)}
        />
        <StatCard
          icon={CheckCircle2}
          tone="success"
          label="Aceitas"
          value={formatBRL(aceitas)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
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
