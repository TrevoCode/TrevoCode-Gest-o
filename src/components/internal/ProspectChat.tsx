"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, Loader2, Paperclip, Mic } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { enviarMensagem } from "@/lib/prospect-actions"
import type { Conversa } from "@/lib/db/prospect"

// CRM de WhatsApp ao vivo: thread de `prospect.conversations` do lead, com
// Realtime (INSERT). `lead` (recebida) à esquerda; `sdr` (IA) à direita.
// O histórico inicial vem do servidor (`inicial`) — daí o Realtime assume.
export function ProspectChat({
  placeId,
  inicial,
  className,
}: {
  placeId: string
  inicial: Conversa[]
  /** Sobrescreve a altura do container. Default: h-[28rem]. Ex: "h-full". */
  className?: string
}) {
  const [msgs, setMsgs] = useState<Conversa[]>(inicial)
  const fimRef = useRef<HTMLDivElement>(null)
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault()
    const t = texto.trim()
    if (!t || enviando) return
    setEnviando(true)
    setAviso(null)
    const res = await enviarMensagem(placeId, t)
    setEnviando(false)
    if (!res.ok) {
      setAviso(res.error ?? "Falha ao enviar.")
      return
    }
    setTexto("")
    const entregue = (res.data as { delivered?: boolean } | undefined)?.delivered
    if (entregue === false) {
      setAviso("Mensagem salva, mas o WhatsApp ainda não está conectado — não foi entregue ao lead.")
    }
  }

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel(`prospect-chat-${placeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "prospect",
          table: "conversations",
          filter: `place_id=eq.${placeId}`,
        },
        (payload) => {
          const nova = payload.new as Conversa
          setMsgs((m) => (m.some((x) => x.id === nova.id) ? m : [...m, nova]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [placeId])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [msgs.length])

  const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={`flex flex-col ${className ?? "h-[28rem]"}`}>
      <div className="flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4">
        {msgs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageCircle className="mb-2 size-6 opacity-40" />
            Sem mensagens ainda. A conversa aparece aqui ao vivo quando o lead responder.
          </div>
        ) : (
          msgs.map((m) => {
            const meu = m.role === "sdr"
            return (
              <div key={m.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-xs ${
                    meu
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      meu ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {hora(m.at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={fimRef} />
      </div>

      {aviso && (
        <p className="border-t border-border bg-warning/5 px-3 py-1.5 text-[11px] text-warning">
          {aviso}
        </p>
      )}

      {/* Caixa de digitar — envia via máquina; entrega no WhatsApp quando a Cloud API estiver ligada. */}
      <form onSubmit={enviar} className="flex items-end gap-1.5 border-t border-border bg-card p-2">
        <button
          type="button"
          disabled
          title="Anexar arquivo — disponível quando o WhatsApp estiver conectado"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground disabled:opacity-40"
        >
          <Paperclip className="size-4" />
        </button>
        <button
          type="button"
          disabled
          title="Áudio — disponível quando o WhatsApp estiver conectado"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground disabled:opacity-40"
        >
          <Mic className="size-4" />
        </button>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void enviar()
            }
          }}
          rows={1}
          placeholder="Escreva uma mensagem…"
          className="max-h-28 min-h-9 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          aria-label="Enviar"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </div>
  )
}
