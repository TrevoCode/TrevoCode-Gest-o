"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  Inbox,
  Target,
  FileText,
  FileSignature,
  Users,
  CalendarDays,
  FolderKanban,
  UsersRound,
  Wallet,
  Banknote,
  Goal,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { TrevoMark } from "@/components/internal/TrevoMark"

// Navegação mobile (drawer). Espelha a Sidebar — manter os itens em sincronia.
type Item = { href: string; label: string; icon: LucideIcon }

const PRINCIPAL: Item[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/leads", label: "Leads", icon: Inbox },
  { href: "/app/pipeline", label: "Pipeline", icon: Target },
  { href: "/app/propostas", label: "Propostas", icon: FileText },
  { href: "/app/contratos", label: "Contratos", icon: FileSignature },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/reunioes", label: "Reuniões", icon: CalendarDays },
  { href: "/app/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/app/equipe", label: "Equipe", icon: UsersRound },
]

const GESTAO: Item[] = [
  { href: "/app/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/app/cobranca", label: "Cobrança", icon: Banknote },
  { href: "/app/planejamento", label: "Planejamento", icon: Goal },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/app/config", label: "Configurações", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app"
  return pathname === href || pathname.startsWith(href + "/")
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function NavLink({ item }: { item: Item }) {
    const active = isActive(pathname, item.href)
    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <item.icon className="size-4.5 shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu de navegação"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <span className="flex items-center gap-2">
                <TrevoMark className="size-6" />
                <span className="font-heading text-[15px] font-bold tracking-tight">TrevoCode</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
              {PRINCIPAL.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
              <p className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Gestão
              </p>
              {GESTAO.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
