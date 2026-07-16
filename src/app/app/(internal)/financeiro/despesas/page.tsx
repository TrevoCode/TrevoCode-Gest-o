import Link from "next/link"
import { ArrowLeft, Receipt, Pencil, Repeat } from "lucide-react"
import { listarDespesas } from "@/lib/data"
import { formatBRL, formatData } from "@/lib/format"
import { DeleteButton } from "@/components/internal/DeleteButton"

export const metadata = { title: "Despesas" }

const CATEGORIA: Record<string, string> = {
  ferramentas: "Ferramentas",
  infraestrutura: "Infraestrutura",
  salarios: "Salários",
  marketing: "Marketing",
  impostos: "Impostos",
  outros: "Outros",
}

export default async function DespesasPage() {
  const despesas = await listarDespesas()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/financeiro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Financeiro
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Despesas</h1>
        <Link href="/app/financeiro/nova-despesa" className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
          + Nova despesa
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <ul className="divide-y divide-border">
          {despesas.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhuma despesa lançada ainda.
            </li>
          )}
          {despesas.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <Receipt className="size-4 shrink-0 text-muted-foreground" />
                  {d.descricao}
                  {d.recorrente && <Repeat className="size-3.5 shrink-0 text-muted-foreground" aria-label="Recorrente" />}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORIA[d.categoria] ?? d.categoria} · {formatData(d.data)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm tabular-nums">{formatBRL(d.valor)}</span>
                <Link
                  href={`/app/financeiro/despesa/${d.id}/editar`}
                  aria-label={`Editar ${d.descricao}`}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </Link>
                <DeleteButton tabela="despesas" id={d.id} from="/app/financeiro/despesas" iconOnly />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
