"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Info } from "lucide-react"

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
const labelCls = "text-sm font-medium"

export default function NovoProjetoPage() {
  const [salvo, setSalvo] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvo(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/projetos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Projetos
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Novo projeto</h1>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        Protótipo — o projeto será salvo quando o banco for conectado.
      </div>

      {salvo ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="size-6" />
          </div>
          <p className="font-medium">Projeto criado (simulado)</p>
          <Link href="/app/projetos" className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Voltar aos projetos
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6">
          <label className="block space-y-1.5">
            <span className={labelCls}>Nome do projeto *</span>
            <input name="nome" required placeholder="Ex.: App de delivery iOS/Android" className={inputCls} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className={labelCls}>Cliente *</span>
              <input name="cliente" required placeholder="Nome do cliente" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Tipo</span>
              <select name="tipo" defaultValue="one_off" className={inputCls}>
                <option value="one_off">Projeto avulso</option>
                <option value="recorrente">Recorrente (mensal)</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Valor (R$)</span>
              <input name="valor" type="number" min="0" step="100" placeholder="0,00" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Status</span>
              <select name="status" defaultValue="proposta" className={inputCls}>
                <option value="proposta">Proposta</option>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Início</span>
              <input name="data_inicio" type="date" className={inputCls} />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className={labelCls}>Descrição</span>
            <textarea name="descricao" rows={3} placeholder="Escopo do projeto…" className={`${inputCls} h-auto py-2`} />
          </label>
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Link href="/app/projetos" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              Cancelar
            </Link>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Criar projeto
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
