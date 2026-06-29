"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

// Boundary da área interna: se uma server action ou query falhar, mostra um
// fallback amigável em vez de derrubar a tela (e preserva a navegação).
export default function InternalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-muted">
        <AlertTriangle className="size-6 text-danger-muted-foreground" />
      </span>
      <h1 className="font-heading text-xl font-semibold">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível completar a operação. Tente novamente; se continuar, recarregue a página.
      </p>
      <button
        onClick={reset}
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Tentar de novo
      </button>
    </div>
  )
}
