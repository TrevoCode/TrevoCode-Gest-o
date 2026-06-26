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
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <Icon className="size-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium">Módulo em construção</p>
        {fase && <p className="mt-1 text-xs text-muted-foreground">{fase}</p>}
      </div>
    </div>
  )
}
