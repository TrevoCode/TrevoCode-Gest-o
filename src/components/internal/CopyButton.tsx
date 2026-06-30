"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

// Copia um texto pro clipboard (iscas prontas pra enviar).
export function CopyButton({ texto, label = "Copiar" }: { texto: string; label?: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto)
          setOk(true)
          setTimeout(() => setOk(false), 1500)
        } catch {
          /* clipboard indisponível */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {ok ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      {ok ? "Copiado" : label}
    </button>
  )
}
