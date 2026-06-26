import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Star,
  FolderKanban,
  CalendarDays,
  Repeat,
  Activity,
} from "lucide-react"
import { obterCliente, montarTimeline } from "@/lib/data"
import { formatBRL, formatData, formatDataHora } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { Panel } from "@/components/internal/Panel"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await obterCliente(id)
  return { title: c ? c.nome : "Cliente" }
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cliente = await obterCliente(id)
  if (!cliente) notFound()
  const timeline = await montarTimeline(id)

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/app/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clientes
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{cliente.nome}</h1>
        <StatusBadge status={cliente.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {cliente.segmento ?? "Sem segmento"} · cliente desde {formatData(cliente.created_at)}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: dados + contatos */}
        <div className="space-y-6">
          <Panel icon={Building2} title="Dados" bodyClassName="p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">CNPJ</dt>
                <dd className="text-right">{cliente.cnpj ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Origem</dt>
                <dd className="text-right capitalize">{cliente.origem ?? "—"}</dd>
              </div>
            </dl>
            {cliente.observacoes && (
              <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                {cliente.observacoes}
              </p>
            )}
          </Panel>

          <Panel title="Contatos">
            <ul className="divide-y divide-border">
              {cliente.contatos.length === 0 && (
                <li className="px-5 py-4 text-sm text-muted-foreground">Nenhum contato.</li>
              )}
              {cliente.contatos.map((ct) => (
                <li key={ct.id} className="px-5 py-3 transition-colors hover:bg-muted/40">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {ct.nome}
                    {ct.principal && <Star className="size-3.5 fill-warning text-warning" />}
                  </p>
                  {ct.cargo && <p className="text-xs text-muted-foreground">{ct.cargo}</p>}
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    {ct.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" /> {ct.email}
                      </span>
                    )}
                    {ct.telefone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" /> {ct.telefone}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Coluna direita (2x): projetos + reuniões */}
        <div className="space-y-6 lg:col-span-2">
          <Panel icon={FolderKanban} title="Projetos">
            <ul className="divide-y divide-border">
              {cliente.projetos.length === 0 && (
                <li className="px-5 py-4 text-sm text-muted-foreground">Nenhum projeto.</li>
              )}
              {cliente.projetos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {p.tipo === "recorrente" ? (
                        <>
                          <Repeat className="size-3.5" /> Recorrente
                        </>
                      ) : (
                        "Projeto avulso"
                      )}
                      {p.data_inicio && ` · início ${formatData(p.data_inicio)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums">
                      {formatBRL(p.valor)}
                      {p.tipo === "recorrente" && (
                        <span className="text-xs text-muted-foreground">/mês</span>
                      )}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel icon={CalendarDays} title="Reuniões">
            <ul className="divide-y divide-border">
              {cliente.reunioes.length === 0 && (
                <li className="px-5 py-4 text-sm text-muted-foreground">Nenhuma reunião.</li>
              )}
              {cliente.reunioes.map((r) => (
                <li key={r.id} className="px-5 py-3.5 transition-colors hover:bg-muted/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{r.titulo}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDataHora(r.data_hora)}</p>
                  {r.notas && <p className="mt-1 text-xs text-muted-foreground">{r.notas}</p>}
                  {r.follow_up && (
                    <p className="mt-1 text-xs text-primary">↳ Follow-up: {r.follow_up}</p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel className="mt-6" icon={Activity} title="Atividade">
        <ol className="ml-6 border-l border-border py-2">
          {timeline.length === 0 && (
            <li className="px-5 py-3 text-sm text-muted-foreground">Sem atividade.</li>
          )}
          {timeline.map((a) => (
            <li key={a.id} className="relative px-5 py-2.5">
              <span className="absolute -left-[7px] top-3.5 size-3 rounded-full border-2 border-card bg-primary" />
              <p className="text-sm">{a.descricao}</p>
              <p className="text-xs text-muted-foreground">{formatDataHora(a.data)}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}
