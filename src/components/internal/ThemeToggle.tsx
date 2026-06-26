"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

// Alterna claro/escuro mutando a classe `.dark` no <html> e persistindo a
// escolha. O script anti-FOUC no layout aplica o tema antes da hidratação.
export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mounted && dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  )
}
