import { type LucideIcon } from "lucide-react"

// Placeholder reutilizável para módulos ainda não construídos.
export function PlaceholderModulo({
  icon: Icon,
  titulo,
  descricao,
  fase,
}: {
  icon: LucideIcon
  titulo: string
  descricao: string
  fase?: string
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center shadow-xs">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </span>
        <p className="mt-4 text-sm font-medium">Módulo em construção</p>
        {fase && <p className="mt-1 text-xs text-muted-foreground">{fase}</p>}
      </div>
    </div>
  )
}
