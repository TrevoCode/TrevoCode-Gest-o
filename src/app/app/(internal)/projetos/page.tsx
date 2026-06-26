import Link from "next/link"
import { FolderKanban, Repeat, Plus } from "lucide-react"
import { listarProjetos } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"

export const metadata = { title: "Projetos" }

export default async function ProjetosPage() {
  const projetos = await listarProjetos()
  const ativos = projetos.filter((p) => p.status === "ativo")
  const recorrenteMes = ativos
    .filter((p) => p.tipo === "recorrente")
    .reduce((s, p) => s + (p.valor ?? 0), 0)
  const carteiraAvulsa = ativos
    .filter((p) => p.tipo === "one_off")
    .reduce((s, p) => s + (p.valor ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={FolderKanban}
        title="Projetos"
        description="Contratos por cliente: avulsos e recorrentes."
        action={
          <Link href="/app/projetos/novo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Novo projeto
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FolderKanban} label="Projetos ativos" value={String(ativos.length)} />
        <StatCard
          icon={Repeat}
          tone="success"
          label="Recorrente / mês"
          value={formatBRL(recorrenteMes)}
        />
        <StatCard
          icon={FolderKanban}
          label="Em contratos avulsos ativos"
          value={formatBRL(carteiraAvulsa)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Projeto</span>
          <span>Cliente</span>
          <span>Tipo</span>
          <span className="text-right">Valor</span>
          <span>Status</span>
        </div>
        <ul className="divide-y divide-border">
          {projetos.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-1 gap-1 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:grid-cols-[2fr_1.2fr_1fr_1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <Link href={`/app/projetos/${p.id}`} className="truncate font-medium hover:text-primary">
                  {p.nome}
                </Link>
                {p.data_inicio && (
                  <p className="text-xs text-muted-foreground">início {formatData(p.data_inicio)}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{p.clienteNome}</span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {p.tipo === "recorrente" ? (
                  <><Repeat className="size-3.5" /> Recorrente</>
                ) : (
                  "Avulso"
                )}
              </span>
              <span className="text-sm tabular-nums sm:text-right">
                {formatBRL(p.valor)}
                {p.tipo === "recorrente" && <span className="text-xs text-muted-foreground">/mês</span>}
              </span>
              <span><StatusBadge status={p.status} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
