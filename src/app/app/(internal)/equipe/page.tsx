import { UsersRound, Clock, Gauge, FolderKanban, ListChecks, Target } from "lucide-react"
import { obterEquipe } from "@/lib/data"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { Avatar } from "@/components/internal/Avatar"

export const metadata = { title: "Equipe" }

function barraTone(o: number) {
  if (o > 85) return "bg-danger"
  if (o >= 50) return "bg-primary"
  return "bg-success"
}

export default async function EquipePage() {
  const equipe = await obterEquipe()
  const capacidade = equipe.reduce((s, m) => s + m.capacidadeSemanal, 0)
  const ocupacaoMedia = equipe.length
    ? Math.round(equipe.reduce((s, m) => s + m.ocupacao, 0) / equipe.length)
    : 0

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={UsersRound}
        title="Equipe"
        description="Capacidade, ocupação e alocação do time."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={UsersRound} label="Pessoas no time" value={String(equipe.length)} />
        <StatCard icon={Clock} tone="info" label="Capacidade total" value={`${capacidade} h/sem`} />
        <StatCard
          icon={Gauge}
          tone={ocupacaoMedia > 85 ? "danger" : "success"}
          label="Ocupação média"
          value={`${ocupacaoMedia}%`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {equipe.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <Avatar name={m.nome} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{m.papel}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{m.ocupacao}%</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${barraTone(m.ocupacao)}`} style={{ width: `${m.ocupacao}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.ocupacao > 85 ? "Sobrecarga" : m.ocupacao < 50 ? "Capacidade disponível" : "Bem alocado"}
              {" · "}{m.capacidadeSemanal} h/sem
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><FolderKanban className="size-3.5" /> {m.projetos} projetos</span>
              <span className="flex items-center gap-1.5"><ListChecks className="size-3.5" /> {m.doing + m.todo} tarefas</span>
              <span className="flex items-center gap-1.5"><Target className="size-3.5" /> {m.dealsAbertos} negócios</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
