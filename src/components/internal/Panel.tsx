import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Cartão de seção padrão: superfície elevada com cabeçalho (ícone + título +
// ação opcional), corpo e rodapé opcional. Unifica as listas/seções das telas.
export function Panel({
  icon: Icon,
  title,
  action,
  footer,
  children,
  className,
  bodyClassName,
}: {
  icon?: LucideIcon
  title?: ReactNode
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
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            {Icon && <Icon className="size-4 text-primary" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer}
    </section>
  )
}
