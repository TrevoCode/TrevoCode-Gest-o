"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Info } from "lucide-react"

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
const labelCls = "text-sm font-medium"

export default function NovoClientePage() {
  const [salvo, setSalvo] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Protótipo: persistência entra quando o Supabase for conectado.
    setSalvo(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/app/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Novo cliente</h1>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        Protótipo de layout — o cadastro será salvo de verdade quando o banco (Supabase) for conectado.
      </div>

      {salvo ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="size-6" />
          </div>
          <p className="font-medium">Cliente registrado (simulado)</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Na versão conectada, ele apareceria na lista. Por enquanto é só o fluxo visual.
          </p>
          <div className="mt-2 flex gap-2">
            <Link href="/app/clientes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              Voltar à lista
            </Link>
            <button
              onClick={() => setSalvo(false)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Cadastrar outro
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className={labelCls}>Nome / Empresa *</span>
              <input name="nome" required placeholder="Ex.: Restaurante Sabor & Cia" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>CNPJ</span>
              <input name="cnpj" placeholder="00.000.000/0001-00" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Segmento</span>
              <input name="segmento" placeholder="Ex.: Restaurantes" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Status</span>
              <select name="status" defaultValue="lead" className={inputCls}>
                <option value="lead">Lead</option>
                <option value="qualificado">Qualificado</option>
                <option value="proposta">Proposta</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className={labelCls}>Origem</span>
              <input name="origem" placeholder="Site, indicação, outbound…" className={inputCls} />
            </label>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-medium">Contato principal</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="contato_nome" placeholder="Nome" className={inputCls} />
              <input name="contato_email" type="email" placeholder="E-mail" className={inputCls} />
              <input name="contato_telefone" placeholder="Telefone" className={inputCls} />
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className={labelCls}>Observações</span>
            <textarea
              name="observacoes"
              rows={3}
              placeholder="Contexto, necessidade, próximos passos…"
              className={`${inputCls} h-auto py-2`}
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Link href="/app/clientes" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              Cancelar
            </Link>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Salvar cliente
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
