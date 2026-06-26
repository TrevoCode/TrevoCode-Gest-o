// Badge de status reutilizável, agora dirigido por tokens semânticos —
// funciona em claro e escuro. Cada status mapeia para um tom; o tom resolve
// as classes (strings completas p/ o Tailwind detectar).

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "purple"

const TONE: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-muted text-info-muted-foreground",
  success: "bg-success-muted text-success-muted-foreground",
  warning: "bg-warning-muted text-warning-muted-foreground",
  danger: "bg-danger-muted text-danger-muted-foreground",
  purple: "bg-purple-muted text-purple-muted-foreground",
}

const DOT: Record<Tone, string> = {
  neutral: "bg-muted-foreground/60",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  purple: "bg-purple-muted-foreground",
}

const MAP: Record<string, { label: string; tone: Tone }> = {
  // cliente
  lead: { label: "Lead", tone: "neutral" },
  qualificado: { label: "Qualificado", tone: "info" },
  proposta: { label: "Proposta", tone: "warning" },
  ativo: { label: "Ativo", tone: "success" },
  inativo: { label: "Inativo", tone: "neutral" },
  // projeto
  pausado: { label: "Pausado", tone: "warning" },
  concluido: { label: "Concluído", tone: "purple" },
  cancelado: { label: "Cancelado", tone: "danger" },
  // lead (inbox)
  novo: { label: "Novo", tone: "success" },
  em_contato: { label: "Em contato", tone: "info" },
  descartado: { label: "Descartado", tone: "neutral" },
  convertido: { label: "Convertido", tone: "success" },
  // reunião
  agendada: { label: "Agendada", tone: "info" },
  realizada: { label: "Realizada", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
  // faturas
  rascunho: { label: "Rascunho", tone: "neutral" },
  enviada: { label: "Enviada", tone: "info" },
  paga: { label: "Paga", tone: "success" },
  atrasada: { label: "Atrasada", tone: "danger" },
  // contas a pagar
  a_vencer: { label: "A vencer", tone: "warning" },
  vencida: { label: "Vencida", tone: "danger" },
  // propostas
  aceita: { label: "Aceita", tone: "success" },
  recusada: { label: "Recusada", tone: "danger" },
  // tarefas
  todo: { label: "A fazer", tone: "neutral" },
  doing: { label: "Em andamento", tone: "info" },
  done: { label: "Concluída", tone: "success" },
}

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  const e = MAP[status] ?? { label: status, tone: "neutral" as Tone }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${TONE[e.tone]}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOT[e.tone]}`} />}
      {e.label}
    </span>
  )
}
