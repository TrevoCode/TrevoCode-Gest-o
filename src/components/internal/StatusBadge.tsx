// Badge de status reutilizável. Mapa estático (classes completas) para o
// Tailwind detectar as cores. Cobre status de cliente, projeto, lead e reunião.

type Entry = { label: string; cls: string }

const MAP: Record<string, Entry> = {
  // cliente
  lead: { label: "Lead", cls: "bg-slate-100 text-slate-700" },
  qualificado: { label: "Qualificado", cls: "bg-blue-100 text-blue-700" },
  proposta: { label: "Proposta", cls: "bg-amber-100 text-amber-700" },
  ativo: { label: "Ativo", cls: "bg-green-100 text-green-700" },
  inativo: { label: "Inativo", cls: "bg-neutral-100 text-neutral-600" },
  // projeto
  pausado: { label: "Pausado", cls: "bg-orange-100 text-orange-700" },
  concluido: { label: "Concluído", cls: "bg-indigo-100 text-indigo-700" },
  cancelado: { label: "Cancelado", cls: "bg-rose-100 text-rose-700" },
  // lead (inbox)
  novo: { label: "Novo", cls: "bg-emerald-100 text-emerald-700" },
  em_contato: { label: "Em contato", cls: "bg-sky-100 text-sky-700" },
  descartado: { label: "Descartado", cls: "bg-neutral-100 text-neutral-600" },
  convertido: { label: "Convertido", cls: "bg-green-100 text-green-700" },
  // reunião
  agendada: { label: "Agendada", cls: "bg-blue-100 text-blue-700" },
  realizada: { label: "Realizada", cls: "bg-green-100 text-green-700" },
  cancelada: { label: "Cancelada", cls: "bg-neutral-100 text-neutral-600" },
}

export function StatusBadge({ status }: { status: string }) {
  const e = MAP[status] ?? { label: status, cls: "bg-neutral-100 text-neutral-600" }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${e.cls}`}
    >
      {e.label}
    </span>
  )
}
