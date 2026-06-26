import {
  Settings,
  Building2,
  UserCircle,
  ShieldCheck,
  Plug,
  Database,
  CalendarDays,
  Globe,
  UserPlus,
  KeyRound,
  Trash2,
  Save,
} from "lucide-react"
import { ALLOWED_EMAILS } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { PageHeader } from "@/components/internal/PageHeader"
import { Panel } from "@/components/internal/Panel"
import { Avatar } from "@/components/internal/Avatar"

export const metadata = { title: "Configurações" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "mb-1 block text-xs font-medium text-muted-foreground"
const salvarCls =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90"

const PAPEIS = ["Gestor", "Financeiro", "Comercial", "Desenvolvimento"]

function Pill({ ok, label }: { ok: boolean | "soon"; label: string }) {
  const cls =
    ok === "soon"
      ? "bg-muted text-muted-foreground"
      : ok
        ? "bg-success-muted text-success-muted-foreground"
        : "bg-warning-muted text-warning-muted-foreground"
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export default function ConfigPage() {
  const membros = ALLOWED_EMAILS.length ? ALLOWED_EMAILS : ["fabricio@trevocode.com", "yuri@trevocode.com"]
  const eu = membros[0]
  const supaOk = isSupabaseConfigured()

  const integracoes = [
    { icon: Database, nome: "Supabase (banco de dados)", desc: "Persistência de clientes, projetos e financeiro.", pill: <Pill ok={supaOk} label={supaOk ? "Conectado" : "Não conectado"} /> },
    { icon: Globe, nome: "Captura de leads do site", desc: "Formulário do trevocode.com gravando direto no CRM.", pill: <Pill ok={supaOk} label={supaOk ? "Ativa" : "Pendente"} /> },
    { icon: CalendarDays, nome: "Google Calendar", desc: "Sincronizar reuniões com a agenda da equipe.", pill: <Pill ok="soon" label="Em breve" /> },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={Settings}
        title="Configurações"
        description="Empresa, perfil, equipe e integrações da plataforma."
      />

      <p className="mb-6 rounded-lg border border-warning-muted bg-warning-muted/50 px-4 py-2 text-xs text-warning-muted-foreground">
        Protótipo — os formulários abaixo serão salvos quando o backend (Supabase) for conectado.
      </p>

      {/* Dados da empresa */}
      <Panel icon={Building2} title="Dados da empresa" description="Usados em propostas, contratos e faturas.">
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelCls}>Razão social</span>
            <input className={inputCls} defaultValue="TrevoCode Desenvolvimento de Software LTDA" />
          </label>
          <label>
            <span className={labelCls}>Nome fantasia</span>
            <input className={inputCls} defaultValue="TrevoCode" />
          </label>
          <label>
            <span className={labelCls}>CNPJ</span>
            <input className={inputCls} defaultValue="50.123.456/0001-78" />
          </label>
          <label>
            <span className={labelCls}>Regime tributário</span>
            <select className={inputCls} defaultValue="Simples Nacional">
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
              <option>MEI</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>E-mail de contato</span>
            <input className={inputCls} defaultValue="contato@trevocode.com" />
          </label>
          <label className="sm:col-span-2">
            <span className={labelCls}>Endereço</span>
            <input className={inputCls} defaultValue="São Paulo, SP" />
          </label>
        </div>
        <div className="flex justify-end border-t border-border px-5 py-3">
          <button className={salvarCls}><Save className="size-4" /> Salvar</button>
        </div>
      </Panel>

      {/* Meu perfil */}
      <Panel className="mt-6" icon={UserCircle} title="Meu perfil" description="Seus dados de acesso.">
        <div className="px-5 py-4">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={eu.split("@")[0]} className="size-12 text-sm" />
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium shadow-xs hover:bg-muted">
              Trocar foto
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelCls}>Nome</span>
              <input className={inputCls} defaultValue={eu.split("@")[0]} />
            </label>
            <label>
              <span className={labelCls}>E-mail</span>
              <input className={inputCls} defaultValue={eu} disabled />
            </label>
          </div>
        </div>
        <div className="flex justify-between border-t border-border px-5 py-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium shadow-xs hover:bg-muted">
            <KeyRound className="size-4" /> Alterar senha
          </button>
          <button className={salvarCls}><Save className="size-4" /> Salvar</button>
        </div>
      </Panel>

      {/* Equipe e permissões */}
      <Panel
        className="mt-6"
        icon={ShieldCheck}
        title="Equipe e permissões"
        description="Quem acessa e o que cada um pode ver."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-muted">
            <UserPlus className="size-3.5" /> Convidar
          </button>
        }
        footer={
          <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
            Acesso por allowlist de e-mail (<code className="rounded bg-muted px-1 py-0.5 text-[11px]">INTERNAL_ALLOWED_EMAILS</code>).
            Papéis definem o que cada pessoa vê — aplicados quando o backend entrar.
          </p>
        }
      >
        <ul className="divide-y divide-border">
          {membros.map((email, i) => (
            <li key={email} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={email.split("@")[0]} />
                <span className="truncate text-sm">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none" defaultValue={i === 0 ? "Gestor" : "Comercial"}>
                  {PAPEIS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <button
                  aria-label={`Remover ${email}`}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-danger-muted hover:text-danger-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Integrações */}
      <Panel className="mt-6" icon={Plug} iconTone="info" title="Integrações" description="Serviços conectados ao sistema.">
        <ul className="divide-y divide-border">
          {integracoes.map((i) => (
            <li key={i.nome} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <i.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{i.nome}</p>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                </div>
              </div>
              {i.pill}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
