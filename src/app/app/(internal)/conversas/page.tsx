import Link from "next/link"
import { MessagesSquare, ArrowUpRight } from "lucide-react"
import { listarConversas, obterLead, obterConversas } from "@/lib/prospeccao"
import { ProspectChat } from "@/components/internal/ProspectChat"
import { CrmConversaList } from "@/components/internal/CrmConversaList"
import { SituacaoSelect } from "@/components/internal/SituacaoSelect"

export default async function ConversasPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>
}) {
  const { lead } = await searchParams
  const threads = await listarConversas()

  const selId = lead ? decodeURIComponent(lead) : (threads[0]?.place_id ?? null)
  const [selLead, selConversas] = selId
    ? await Promise.all([obterLead(selId), obterConversas(selId)])
    : [null, []]
  const selStatus = threads.find((t) => t.place_id === selId)?.status ?? null

  if (threads.length === 0) {
    return (
      <div className="flex h-[calc(100svh-9rem)] items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <div>
          <MessagesSquare className="mx-auto mb-3 size-7 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhuma conversa ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Quando a máquina começar a falar com os leads pelo WhatsApp, cada conversa
            aparece aqui, estilo WhatsApp Web.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-[calc(100svh-9rem)] overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[300px_1fr]">
      {/* Lista de conversas (esquerda) — busca + filtros + aguardando */}
      <div className="hidden md:block">
        <CrmConversaList threads={threads} selId={selId} />
      </div>

      {/* Thread selecionado (direita) */}
      <div className="flex h-full min-w-0 flex-col">
        {selLead ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{selLead.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {selLead.niche}
                  {selLead.city ? ` · ${selLead.city}` : ""}
                  {selLead.phone ? ` · ${selLead.phone}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SituacaoSelect placeId={selLead.place_id} atual={selStatus} />
                <Link
                  href={`/app/prospeccao/${encodeURIComponent(selLead.place_id)}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Ver lead <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ProspectChat placeId={selLead.place_id} inicial={selConversas} className="h-full" />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Selecione uma conversa à esquerda.
          </div>
        )}
      </div>
    </div>
  )
}
