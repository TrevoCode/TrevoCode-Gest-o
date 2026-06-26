"use client"

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

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <item.icon
        className={`size-4.5 shrink-0 transition-colors ${
          active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
        }`}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
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

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <Link
        href="/app"
        className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4"
      >
        <TrevoMark className="size-7" />
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[15px] font-bold tracking-tight">TrevoCode</span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            Gestão interna
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {PRINCIPAL.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <p className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Gestão
        </p>
        {GESTAO.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
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
      </div>
    </aside>
  )
}
