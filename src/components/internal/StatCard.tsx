import Link from "next/link"
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Cartão de KPI padrão: ícone tingido, valor tabular, rótulo e (opcional)
// dica de contexto + chip de tendência. Usado no Dashboard, Pipeline e Financeiro.
type Tone = "primary" | "success" | "warning" | "danger" | "info"

const ICON_TONE: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-muted text-success-muted-foreground",
  warning: "bg-warning-muted text-warning-muted-foreground",
  danger: "bg-danger-muted text-danger-muted-foreground",
  info: "bg-info-muted text-info-muted-foreground",
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "primary",
  trend,
  valueClassName,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  href?: string
  tone?: Tone
  trend?: { dir: "up" | "down"; label: string; good?: boolean }
  valueClassName?: string
}) {
  const good = trend ? (trend.good ?? trend.dir === "up") : false
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            ICON_TONE[tone]
          )}
        >
          <Icon className="size-4.5" />
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
              good
                ? "bg-success-muted text-success-muted-foreground"
                : "bg-danger-muted text-danger-muted-foreground"
            )}
          >
            {trend.dir === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.label}
          </span>
        )}
      </div>
      <p className={cn("mt-4 text-2xl font-semibold tracking-tight tabular-nums", valueClassName)}>
        {value}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
    </>
  )

  const base = "rounded-xl border border-border bg-card p-5 shadow-xs"
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group block transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-sm"
        )}
      >
        {body}
      </Link>
    )
  }
  return <div className={base}>{body}</div>
}
