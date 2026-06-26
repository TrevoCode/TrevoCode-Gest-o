import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ICON_TONE, type IconTone } from "@/components/internal/tones"

// Cartão de seção: superfície elevada com cabeçalho destacado (chip de ícone
// colorido + título + descrição do que a seção serve), corpo e rodapé opcional.
export function Panel({
  icon: Icon,
  iconTone = "primary",
  title,
  description,
  action,
  footer,
  children,
  className,
  bodyClassName,
}: {
  icon?: LucideIcon
  iconTone?: IconTone
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  ICON_TONE[iconTone]
                )}
              >
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="font-heading text-sm font-semibold leading-tight">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer}
    </section>
  )
}
