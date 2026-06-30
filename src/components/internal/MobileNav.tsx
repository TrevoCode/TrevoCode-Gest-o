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
  Users,
  CalendarDays,
  FolderKanban,
  UsersRound,
  Wallet,
  BarChart3,
  Radar,
  type LucideIcon,
} from "lucide-react"
import { TrevoMark } from "@/components/internal/TrevoMark"

// Navegação mobile (drawer). Espelha a Sidebar — manter os grupos em sincronia.
type Item = { href: string; label: string; icon: LucideIcon }
type Grupo = { titulo: string | null; itens: Item[] }

const GRUPOS: Grupo[] = [
  { titulo: null, itens: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  {
    titulo: "Comercial",
    itens: [
      { href: "/app/leads", label: "Leads", icon: Inbox },
      { href: "/app/pipeline", label: "Pipeline", icon: Target },
      { href: "/app/propostas", label: "Propostas", icon: FileText },
      { href: "/app/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    titulo: "Entrega",
    itens: [
      { href: "/app/reunioes", label: "Reuniões", icon: CalendarDays },
      { href: "/app/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/app/equipe", label: "Equipe", icon: UsersRound },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { href: "/app/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    titulo: "Prospecção",
    itens: [{ href: "/app/prospeccao", label: "Prospecção", icon: Radar }],
  },
]

const SUB_PARA_PAI: Record<string, string> = {
  "/app/contratos": "/app/propostas",
  "/app/cobranca": "/app/financeiro",
  "/app/planejamento": "/app/relatorios",
  "/app/cadencia": "/app/prospeccao",
  "/app/nichos": "/app/prospeccao",
}

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app"
  const base = "/" + (pathname.split("/")[1] ?? "") + "/" + (pathname.split("/")[2] ?? "")
  const p = SUB_PARA_PAI[base] ?? pathname
  return p === href || p.startsWith(href + "/")
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
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} aria-hidden />
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
              {GRUPOS.map((g, gi) => (
                <div key={gi} className={gi > 0 ? "mt-3" : ""}>
                  {g.titulo && (
                    <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {g.titulo}
                    </p>
                  )}
                  {g.itens.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
