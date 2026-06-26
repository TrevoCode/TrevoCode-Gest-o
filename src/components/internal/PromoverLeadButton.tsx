"use client"

import { useState } from "react"
import { UserPlus, Check } from "lucide-react"

// Protótipo: ao conectar o Supabase, isto cria o cliente e marca o lead
// como "convertido". Por ora só simula o feedback visual.
export function PromoverLeadButton({ nome }: { nome: string }) {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
        <Check className="size-4" /> {nome.split(" ")[0]} virou cliente (simulado)
      </span>
    )
  }

  return (
    <button
      onClick={() => setDone(true)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
    >
      <UserPlus className="size-4" /> Promover a cliente
    </button>
  )
}
