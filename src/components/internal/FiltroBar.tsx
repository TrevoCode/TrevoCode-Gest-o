import Link from "next/link"
import { Search } from "lucide-react"

// Barra de filtro por status (pills) + busca (form GET) reutilizável entre listas.
export function FiltroBar({
  basePath,
  filtros,
  statusAtual,
  busca,
  placeholder,
}: {
  basePath: string
  filtros: { label: string; value: string }[]
  statusAtual: string
  busca: string
  placeholder: string
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {filtros.map((f) => {
          const active = statusAtual === f.value
          const href = f.value ? `${basePath}?status=${f.value}` : basePath
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
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
          aria-label="Buscar"
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:w-64"
        />
      </form>
    </div>
  )
}
