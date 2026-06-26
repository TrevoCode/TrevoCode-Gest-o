"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Inbox,
  Target,
  FileText,
  Users,
  CalendarDays,
  FolderKanban,
  Wallet,
  Banknote,
  BarChart3,
  Goal,
  UsersRound,
  FileSignature,
  Settings,
  PanelLeftClose,
  type LucideIcon,
} from "lucide-react"
import { TrevoMark } from "@/components/internal/TrevoMark"
import { Avatar } from "@/components/internal/Avatar"
import { LogoutButton } from "@/components/internal/LogoutButton"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

const PRINCIPAL: NavItem[] = [
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

const GESTAO: NavItem[] = [
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

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center rounded-lg py-1.5 text-sm font-medium transition-colors ${
        collapsed ? "justify-center px-1.5" : "gap-2.5 px-2"
      } ${
        active ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-md transition-colors ${
          active
            ? "bg-brand-gradient text-white shadow-xs"
            : "text-muted-foreground/70 group-hover:text-foreground"
        }`}
      >
        <item.icon className="size-4.5" />
      </span>
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({
  user,
  demo,
}: {
  user: { name: string; email: string }
  demo: boolean
}) {
  const pathname = usePathname()
  // Recolhida por padrão; lembra a preferência do usuário.
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    if (localStorage.getItem("trevo-sidebar-collapsed") === "false") setCollapsed(false)
  }, [])

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem("trevo-sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header / toggle */}
      {collapsed ? (
        <button
          type="button"
          onClick={toggle}
          title="Expandir menu"
          aria-label="Expandir menu"
          className="flex h-14 w-full items-center justify-center border-b border-sidebar-border transition-colors hover:bg-accent"
        >
          <TrevoMark className="size-7" />
        </button>
      ) : (
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border pl-5 pr-3">
          <Link href="/app" className="flex items-center gap-2.5">
            <TrevoMark className="size-7" />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[15px] font-bold tracking-tight">TrevoCode</span>
              <span className="mt-1 text-[11px] font-medium text-muted-foreground">Gestão interna</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={toggle}
            title="Recolher menu"
            aria-label="Recolher menu"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="size-4.5" />
          </button>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {PRINCIPAL.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}

        {collapsed ? (
          <div className="mx-2 my-2 border-t border-sidebar-border" />
        ) : (
          <p className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Gestão
          </p>
        )}
        {GESTAO.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>

      {/* Perfil / essenciais */}
      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Link
            href="/app/config"
            title={`${user.name} · Configurações`}
            className="flex justify-center rounded-lg py-1 transition-colors hover:bg-accent"
          >
            <Avatar name={user.name} />
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-2 py-1">
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {!demo && (
              <div className="mt-1 px-1">
                <LogoutButton />
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
