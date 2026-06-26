"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// Sub-navegação por abas entre telas irmãs (ex.: Financeiro ↔ Cobrança).
// Mantém as telas separadas, mas agrupadas e fora do menu principal.
export const TABS_DOCUMENTOS = [
  { href: "/app/propostas", label: "Propostas" },
  { href: "/app/contratos", label: "Contratos" },
]
export const TABS_FINANCEIRO = [
  { href: "/app/financeiro", label: "Visão geral" },
  { href: "/app/cobranca", label: "Cobrança" },
]
export const TABS_ANALISE = [
  { href: "/app/relatorios", label: "Relatórios" },
  { href: "/app/planejamento", label: "Planejamento" },
]

export function SectionTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    <div className="mb-6 flex gap-4 border-b border-border">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/")
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
