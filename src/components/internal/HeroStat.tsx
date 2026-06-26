import { type ReactNode } from "react"
import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// KPI em destaque com o degradê da marca (verde → esmeralda). Para a métrica
// principal de uma tela (MRR, em aberto, a receber). Usar 1 por tela.
export function HeroStat({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: ReactNode
  href?: string
}) {
  const body = (
    <>
      <span className="grid size-9 place-items-center rounded-lg bg-white/20 text-white">
        <Icon className="size-4.5" />
      </span>
      <p className="mt-4 font-heading text-[1.6rem] font-semibold leading-none tracking-tight tabular-nums text-white">
        {value}
      </p>
      <p className="mt-0.5 text-sm font-medium text-white/90">{label}</p>
      {hint && <p className="mt-1 text-xs text-white/75">{hint}</p>}
    </>
  )
  const base = "bg-brand-gradient rounded-xl p-5 shadow-sm"
  return href ? (
    <Link href={href} className={cn(base, "block transition-transform hover:-translate-y-px")}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  )
}
