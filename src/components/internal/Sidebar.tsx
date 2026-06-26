"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Inbox,
  Users,
  CalendarDays,
  FolderKanban,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

const PRINCIPAL: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/leads", label: "Leads", icon: Inbox },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/reunioes", label: "Reuniões", icon: CalendarDays },
  { href: "/app/projetos", label: "Projetos", icon: FolderKanban },
]

const GESTAO: NavItem[] = [
  { href: "/app/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/app/config", label: "Configurações", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app"
  return pathname === href || pathname.startsWith(href + "/")
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon className="size-4.5 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <Link
        href="/app"
        className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold"
      >
        <span className="text-primary">🍀</span>
        TrevoCode
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {PRINCIPAL.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <p className="mt-4 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Gestão
        </p>
        {GESTAO.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  )
}
