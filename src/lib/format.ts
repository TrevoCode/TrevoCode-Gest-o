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
  // Datas puras (YYYY-MM-DD) são tratadas em UTC para não deslocar 1 dia.
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function formatDataHora(iso: string | null | undefined): string {
  if (!iso) return "—"
  // Timestamps (com hora) no horário de Brasília — independe do TZ do servidor.
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
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
