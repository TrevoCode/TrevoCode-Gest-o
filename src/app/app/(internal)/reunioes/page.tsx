import Link from "next/link"
import { CalendarDays, Video, Phone, MapPin, Plus, Pencil, Check, X, type LucideIcon } from "lucide-react"
import { listarReunioes } from "@/lib/data"
import type { ReuniaoComCliente } from "@/lib/data"
import { atualizarReuniao } from "@/lib/actions"
import { formatDataHora, tempoRelativo } from "@/lib/format"
import { StatusBadge } from "@/components/internal/StatusBadge"
import { PageHeader } from "@/components/internal/PageHeader"
import { SubmitButton } from "@/components/internal/SubmitButton"
import { DeleteButton } from "@/components/internal/DeleteButton"

export const metadata = { title: "Reuniões" }

const TIPO: Record<string, { label: string; icon: LucideIcon }> = {
  meet: { label: "Meet", icon: Video },
  ligacao: { label: "Ligação", icon: Phone },
  presencial: { label: "Presencial", icon: MapPin },
}

function Linha({ r }: { r: ReuniaoComCliente }) {
  const t = TIPO[r.tipo] ?? TIPO.meet
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <t.icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.titulo}</p>
          <p className="truncate text-xs text-muted-foreground">
            {r.clienteNome ?? "Sem cliente"} · {formatDataHora(r.data_hora)} · {tempoRelativo(r.data_hora)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <StatusBadge status={r.status} />
        {r.status === "agendada" && (
          <>
            <form action={atualizarReuniao}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="realizada" />
              <SubmitButton className="inline-flex items-center gap-1 rounded-lg bg-success-muted px-2.5 py-1 text-xs font-medium text-success-muted-foreground hover:opacity-90 disabled:opacity-60">
                <Check className="size-3.5" /> Realizada
              </SubmitButton>
            </form>
            <form action={atualizarReuniao}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="cancelada" />
              <SubmitButton className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60">
                <X className="size-3.5" /> Cancelar
              </SubmitButton>
            </form>
          </>
        )}
        <Link
          href={`/app/reunioes/${r.id}/editar`}
          aria-label="Editar reunião"
          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-4" />
        </Link>
        <DeleteButton tabela="reunioes" id={r.id} from="/app/reunioes" iconOnly />
      </div>
    </li>
  )
}

export default async function ReunioesPage() {
  const reunioes = await listarReunioes()
  const agora = new Date().toISOString()
  const proximas = reunioes.filter((r) => r.status === "agendada" && r.data_hora >= agora)
  const anteriores = reunioes
    .filter((r) => !(r.status === "agendada" && r.data_hora >= agora))
    .sort((a, b) => b.data_hora.localeCompare(a.data_hora))

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={CalendarDays}
        title="Reuniões"
        description="Agenda, notas e follow-ups com clientes."
        action={
          <Link href="/app/reunioes/novo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Agendar
          </Link>
        }
      />

      <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold">
        <CalendarDays className="size-4 text-primary" /> Próximas ({proximas.length})
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {proximas.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nada agendado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {proximas.map((r) => <Linha key={r.id} r={r} />)}
          </ul>
        )}
      </div>

      <h2 className="mb-2 mt-8 font-heading text-sm font-semibold text-muted-foreground">Anteriores</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {anteriores.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Sem histórico.</p>
        ) : (
          <ul className="divide-y divide-border">
            {anteriores.map((r) => <Linha key={r.id} r={r} />)}
          </ul>
        )}
      </div>
    </div>
  )
}
