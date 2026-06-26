// Formatadores pt-BR usados nas telas.

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

export function formatBRL(valor: number | null | undefined): string {
  return brl.format(valor ?? 0)
}

export function formatData(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDataHora(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// "há 2 dias", "em 3 dias", "hoje"
export function tempoRelativo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const diff = new Date(iso).getTime() - Date.now()
  const dias = Math.round(diff / 86_400_000)
  if (dias === 0) return "hoje"
  if (dias === 1) return "amanhã"
  if (dias === -1) return "ontem"
  return dias > 0 ? `em ${dias} dias` : `há ${Math.abs(dias)} dias`
}
