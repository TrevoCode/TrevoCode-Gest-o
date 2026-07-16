"use client"

import { useState } from "react"

// Bloco de tipo + valores do projeto. Em RECORRENTE mostra dois campos —
// implementação (setup, uma vez) e mensalidade (alimenta o MRR). Em AVULSO,
// um único valor total. O custo estimado é comum aos dois.
const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
const labelCls = "text-sm font-medium"

export function ProjetoValores({
  tipoInicial = "one_off",
  valorInicial,
  setupInicial,
  custoInicial,
}: {
  tipoInicial?: string
  valorInicial?: number | null
  setupInicial?: number | null
  custoInicial?: number | null
}) {
  const [tipo, setTipo] = useState(tipoInicial)
  const recorrente = tipo === "recorrente"

  return (
    <>
      <label className="space-y-1.5">
        <span className={labelCls}>Tipo</span>
        <select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
          <option value="one_off">Projeto avulso</option>
          <option value="recorrente">Recorrente (mensal)</option>
        </select>
      </label>

      {recorrente ? (
        <>
          <label className="space-y-1.5">
            <span className={labelCls}>Implementação / setup (R$)</span>
            <input name="valor_setup" type="number" min="0" step="0.01" defaultValue={setupInicial ?? ""} placeholder="Ex.: 2997,00" className={inputCls} />
            <span className="block text-[11px] text-muted-foreground">Taxa única de entrada — não entra no MRR.</span>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Mensalidade (R$) *</span>
            <input name="valor" type="number" min="0" step="0.01" defaultValue={valorInicial ?? ""} placeholder="Ex.: 847,00" className={inputCls} />
            <span className="block text-[11px] text-muted-foreground">Vira MRR enquanto o projeto estiver ativo.</span>
          </label>
        </>
      ) : (
        <label className="space-y-1.5">
          <span className={labelCls}>Valor total (R$)</span>
          <input name="valor" type="number" min="0" step="0.01" defaultValue={valorInicial ?? ""} placeholder="0,00" className={inputCls} />
        </label>
      )}

      <label className="space-y-1.5">
        <span className={labelCls}>Custo estimado (R$)</span>
        <input name="custo" type="number" min="0" step="0.01" defaultValue={custoInicial ?? ""} placeholder="0,00" className={inputCls} />
      </label>
    </>
  )
}
