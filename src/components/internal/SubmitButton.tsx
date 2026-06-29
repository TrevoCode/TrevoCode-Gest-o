"use client"

import { useFormStatus } from "react-dom"

// Botão de submit que desabilita e mostra "Salvando…" durante a server action.
export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Salvando…" : children}
    </button>
  )
}
