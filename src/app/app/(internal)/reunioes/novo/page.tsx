"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Info } from "lucide-react"

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
const labelCls = "text-sm font-medium"

export default function NovaReuniaoPage() {
  const [salvo, setSalvo] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvo(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/reunioes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Reuniões
      </Link>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">Agendar reunião</h1>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning-muted bg-warning-muted px-4 py-3 text-sm text-warning-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        Protótipo — o agendamento será salvo quando o banco for conectado.
      </div>

      {salvo ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="size-6" />
          </div>
          <p className="font-medium">Reunião agendada (simulado)</p>
          <Link href="/app/reunioes" className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Voltar à agenda
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6">
          <label className="block space-y-1.5">
            <span className={labelCls}>Título *</span>
            <input name="titulo" required placeholder="Ex.: Fechamento de proposta" className={inputCls} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className={labelCls}>Cliente</span>
              <input name="cliente" placeholder="Nome do cliente" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Data e hora *</span>
              <input name="data_hora" type="datetime-local" required className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Tipo</span>
              <select name="tipo" defaultValue="meet" className={inputCls}>
                <option value="meet">Meet</option>
                <option value="ligacao">Ligação</option>
                <option value="presencial">Presencial</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className={labelCls}>Notas / pauta</span>
            <textarea name="notas" rows={3} placeholder="O que será tratado…" className={`${inputCls} h-auto py-2`} />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Follow-up</span>
            <input name="follow_up" placeholder="Próximo passo após a reunião" className={inputCls} />
          </label>
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Link href="/app/reunioes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              Cancelar
            </Link>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Agendar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
