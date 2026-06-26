import Link from "next/link"
import { Plus, Search, ChevronRight } from "lucide-react"
import { listarClientes } from "@/lib/data"
import type { Cliente } from "@/lib/db/types"
import { formatBRL } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"

export const metadata = { title: "Clientes" }

const FILTROS: { label: string; value: Cliente["status"] | "" }[] = [
  { label: "Todos", value: "" },
  { label: "Ativos", value: "ativo" },
  { label: "Proposta", value: "proposta" },
  { label: "Qualificado", value: "qualificado" },
  { label: "Lead", value: "lead" },
  { label: "Inativos", value: "inativo" },
]

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>
}) {
  const sp = await searchParams
  const statusAtual = (sp.status ?? "") as Cliente["status"] | ""
  const busca = sp.busca ?? ""
  const clientes = await listarClientes({
    status: statusAtual || undefined,
    busca: busca || undefined,
  })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Clientes"
        description="Pipeline comercial, contatos e contratos."
        action={
          <Link
            href="/app/clientes/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> Novo cliente
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const active = statusAtual === f.value
            const href = f.value ? `/app/clientes?status=${f.value}` : "/app/clientes"
            return (
              <Link
                key={f.label}
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        <form className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          {statusAtual && <input type="hidden" name="status" value={statusAtual} />}
          <input
            type="search"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome ou segmento…"
            className="h-9 w-64 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Cliente</span>
          <span>Segmento</span>
          <span>Status</span>
          <span className="text-right">Recorrente/mês</span>
          <span className="w-4" />
        </div>

        {clientes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {clientes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/clientes/${c.id}`}
                  className="grid grid-cols-1 gap-1 px-5 py-3.5 transition-colors hover:bg-muted/50 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.projetosAtivos} projeto{c.projetosAtivos === 1 ? "" : "s"} ativo
                      {c.projetosAtivos === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{c.segmento ?? "—"}</span>
                  <span><StatusBadge status={c.status} /></span>
                  <span className="text-sm tabular-nums sm:text-right">
                    {c.receitaRecorrente ? formatBRL(c.receitaRecorrente) : "—"}
                  </span>
                  <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
