"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProspectMsg } from "@/lib/prospect"

// CRM de WhatsApp: thread de um lead, atualizando ao vivo (Supabase Realtime).
// `inicial` vem renderizado do servidor; novas mensagens chegam pelo canal.
export function ProspectChat({ placeId, inicial }: { placeId: string; inicial: ProspectMsg[] }) {
  const [msgs, setMsgs] = useState<ProspectMsg[]>(inicial)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const canal = supabase
      .channel(`prospect-chat-${placeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "prospect_conversations", filter: `place_id=eq.${placeId}` },
        (payload) => {
          const m = payload.new as ProspectMsg
          setMsgs((cur) => [...cur, { role: m.role, text: m.text, at: m.at }])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [placeId])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs])

  if (msgs.length === 0) {
    return (
      <p className="rounded-lg bg-muted/60 px-3 py-6 text-center text-sm text-muted-foreground">
        Nenhuma mensagem ainda. Quando o lead responder, a conversa aparece aqui em tempo real.
      </p>
    )
  }

  return (
    <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-xl bg-muted/40 p-4">
      {msgs.map((m, i) => {
        const meu = m.role === "sdr"
        return (
          <div key={i} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                meu
                  ? "rounded-br-sm bg-brand-gradient text-white"
                  : "rounded-bl-sm border border-border bg-card text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        )
      })}
      <div ref={fimRef} />
    </div>
  )
}
