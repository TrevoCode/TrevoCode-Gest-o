import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ICON_TONE, type IconTone } from "@/components/internal/tones"

// Cabeçalho padrão das páginas internas: chip de ícone, título (fonte de
// destaque), descrição do que a tela serve e uma ação opcional.
export function PageHeader({
  icon: Icon,
  iconTone = "primary",
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  iconTone?: IconTone
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              ICON_TONE[iconTone]
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
