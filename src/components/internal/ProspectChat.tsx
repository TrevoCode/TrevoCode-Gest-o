"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Conversa } from "@/lib/db/prospect"

// CRM de WhatsApp ao vivo: thread de `prospect.conversations` do lead, com
// Realtime (INSERT). `lead` (recebida) à esquerda; `sdr` (IA) à direita.
// O histórico inicial vem do servidor (`inicial`) — daí o Realtime assume.
export function ProspectChat({
  placeId,
  inicial,
}: {
  placeId: string
  inicial: Conversa[]
}) {
  const [msgs, setMsgs] = useState<Conversa[]>(inicial)
  const fimRef = useRef<HTMLDivElement>(null)

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
    <div className="flex h-[28rem] flex-col">
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
    </div>
  )
}
