"use client"

import { Printer } from "lucide-react"

// Gera PDF pela impressão do navegador (Salvar como PDF). Sem dependência externa.
export function ImprimirButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="size-4" /> Imprimir / PDF
    </button>
  )
}
