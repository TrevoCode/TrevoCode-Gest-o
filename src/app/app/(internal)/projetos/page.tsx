import Link from "next/link"
import { FolderKanban, Repeat, Plus } from "lucide-react"
import { listarProjetos } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"

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
        title="Projetos"
        description="Contratos por cliente: avulsos e recorrentes."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Novo projeto
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <FolderKanban className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{ativos.length}</p>
          <p className="text-sm text-muted-foreground">Projetos ativos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Repeat className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(recorrenteMes)}</p>
          <p className="text-sm text-muted-foreground">Recorrente / mês</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <FolderKanban className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatBRL(carteiraAvulsa)}</p>
          <p className="text-sm text-muted-foreground">Em contratos avulsos ativos</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
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
              className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[2fr_1.2fr_1fr_1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <Link href={`/app/clientes/${p.cliente_id}`} className="truncate font-medium hover:text-primary">
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
