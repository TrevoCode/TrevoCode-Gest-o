import {
  Settings,
  Building2,
  UserCircle,
  ShieldCheck,
  Plug,
  Database,
  CalendarDays,
  Globe,
  KeyRound,
  Save,
} from "lucide-react"
import { ALLOWED_EMAILS } from "@/lib/auth/allowlist"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { obterEmpresa } from "@/lib/data"
import { salvarEmpresa, alterarSenha } from "@/lib/actions"
import { PageHeader } from "@/components/internal/PageHeader"
import { Panel } from "@/components/internal/Panel"
import { Avatar } from "@/components/internal/Avatar"
import { SubmitButton } from "@/components/internal/SubmitButton"

export const metadata = { title: "Configurações" }

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "mb-1 block text-xs font-medium text-muted-foreground"
const salvarCls =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60"

function Pill({ ok, label }: { ok: boolean | "soon"; label: string }) {
  const cls =
    ok === "soon"
      ? "bg-muted text-muted-foreground"
      : ok
        ? "bg-success-muted text-success-muted-foreground"
        : "bg-warning-muted text-warning-muted-foreground"
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export default async function ConfigPage() {
  const membros = ALLOWED_EMAILS.length ? ALLOWED_EMAILS : ["fabricio@trevocode.com", "yuri@trevocode.com"]
  const eu = membros[0]
  const supaOk = isSupabaseConfigured()
  const empresa = await obterEmpresa()

  const integracoes = [
    { icon: Database, nome: "Supabase (banco de dados)", desc: "Persistência de clientes, projetos e financeiro.", pill: <Pill ok={supaOk} label={supaOk ? "Conectado" : "Não conectado"} /> },
    { icon: Globe, nome: "Captura de leads do site", desc: "Formulário do trevocode.com gravando direto no CRM.", pill: <Pill ok="soon" label="Aguardando deploy do site" /> },
    { icon: CalendarDays, nome: "Google Calendar", desc: "Sincronizar reuniões com a agenda da equipe.", pill: <Pill ok="soon" label="Em breve" /> },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={Settings}
        title="Configurações"
        description="Empresa, perfil, equipe e integrações da plataforma."
      />

      {/* Dados da empresa */}
      <Panel icon={Building2} title="Dados da empresa" description="Usados em propostas, contratos e faturas.">
        <form action={salvarEmpresa}>
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelCls}>Razão social</span>
              <input name="razao_social" defaultValue={empresa?.razao_social ?? ""} placeholder="Ex.: TrevoCode Desenvolvimento de Software LTDA" className={inputCls} />
            </label>
            <label>
              <span className={labelCls}>Nome fantasia</span>
              <input name="nome_fantasia" defaultValue={empresa?.nome_fantasia ?? ""} placeholder="TrevoCode" className={inputCls} />
            </label>
            <label>
              <span className={labelCls}>CNPJ</span>
              <input name="cnpj" defaultValue={empresa?.cnpj ?? ""} placeholder="00.000.000/0001-00" className={inputCls} />
            </label>
            <label>
              <span className={labelCls}>Regime tributário</span>
              <select name="regime" defaultValue={empresa?.regime ?? "Simples Nacional"} className={inputCls}>
                <option>Simples Nacional</option>
                <option>Lucro Presumido</option>
                <option>Lucro Real</option>
                <option>MEI</option>
              </select>
            </label>
            <label>
              <span className={labelCls}>E-mail de contato</span>
              <input name="email" type="email" defaultValue={empresa?.email ?? ""} placeholder="contato@trevocode.com" className={inputCls} />
            </label>
            <label className="sm:col-span-2">
              <span className={labelCls}>Endereço</span>
              <input name="endereco" defaultValue={empresa?.endereco ?? ""} placeholder="Cidade, UF" className={inputCls} />
            </label>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-3">
            <SubmitButton className={salvarCls}><Save className="size-4" /> Salvar</SubmitButton>
          </div>
        </form>
      </Panel>

      {/* Meu perfil */}
      <Panel className="mt-6" icon={UserCircle} title="Meu perfil" description="Seus dados de acesso.">
        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar name={eu.split("@")[0]} className="size-12 text-sm" />
          <div>
            <p className="text-sm font-medium">{eu.split("@")[0]}</p>
            <p className="text-xs text-muted-foreground">{eu}</p>
          </div>
        </div>
        <form action={alterarSenha} className="border-t border-border px-5 py-4">
          <label className="block max-w-sm">
            <span className={labelCls}>Nova senha (mín. 8 caracteres)</span>
            <input name="senha" type="password" minLength={8} required placeholder="••••••••" className={inputCls} />
          </label>
          <div className="mt-3 flex justify-start">
            <SubmitButton className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium shadow-xs hover:bg-muted disabled:opacity-60">
              <KeyRound className="size-4" /> Alterar senha
            </SubmitButton>
          </div>
        </form>
      </Panel>

      {/* Equipe (allowlist) */}
      <Panel
        className="mt-6"
        icon={ShieldCheck}
        title="Equipe com acesso"
        description="Quem pode entrar na plataforma."
        footer={
          <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
            Acesso controlado pela allowlist de e-mail (env <code className="rounded bg-muted px-1 py-0.5 text-[11px]">INTERNAL_ALLOWED_EMAILS</code> + tabela <code className="rounded bg-muted px-1 py-0.5 text-[11px]">usuarios_autorizados</code> no banco). Para adicionar/remover alguém, atualize ambos.
          </p>
        }
      >
        <ul className="divide-y divide-border">
          {membros.map((email) => (
            <li key={email} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={email.split("@")[0]} />
                <span className="truncate text-sm">{email}</span>
              </div>
              <Pill ok={true} label="Acesso total" />
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
