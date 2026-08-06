// ─────────────────────────────────────────────────────────────────────────
// Helpers do cockpit de LIGAÇÕES — funções PURAS (sem IO), seguras em
// client components. A divisão de operador aqui é pelo DDD do TELEFONE
// (31 = Fabrício; demais = Nobre), diferente da aba WhatsApp (praça por
// cidade) — pedido do Fabricio em 05/ago.
// ─────────────────────────────────────────────────────────────────────────
import type { FilaWhatsappItem } from "@/lib/prospeccao"
import { cidadeCurta, nichoLabel, nomeDisplay, verdito } from "@/lib/whatsapp-copy"

export function dddDe(phone: string | null): string {
  let d = String(phone ?? "").replace(/\D/g, "").replace(/^0+/, "")
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2)
  return d.slice(0, 2)
}

// "fonte: ... | início 2015-03-10 | porte 1 | ..." → ano no mercado
export function anoInicio(reasons: string | null): string | null {
  const m = String(reasons ?? "").match(/in[íi]cio (\d{4})/)
  return m ? m[1] : null
}

const PORTES: Record<string, string> = { "1": "ME", "01": "ME", "3": "EPP", "03": "EPP", "5": "médio/grande", "05": "médio/grande" }
export function porteLabel(reasons: string | null): string | null {
  const m = String(reasons ?? "").match(/porte (\d+)/)
  return m ? (PORTES[m[1]] ?? null) : null
}

// Site do lead: por regra da captura ou não existe ou é só rede social.
export function siteInfo(item: Pick<FilaWhatsappItem, "website" | "reasons">): {
  rotulo: string
  url: string | null
  tem: boolean
} {
  if (item.website && verdito(item.reasons) === "so_social")
    return { rotulo: "Só rede social", url: item.website, tem: false }
  if (item.website) return { rotulo: "Tem site", url: item.website, tem: true }
  return { rotulo: "Sem site", url: null, tem: false }
}

// Link oficial do Google Maps por place_id (não precisa de coluna nova).
export function mapsUrl(item: Pick<FilaWhatsappItem, "place_id" | "name">): string {
  const q = encodeURIComponent(nomeDisplay(item.name) || "empresa")
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${item.place_id}`
}

// Primeiro nome do dono, pra abrir a ligação chamando a pessoa.
export function primeiroNome(owner: string | null): string | null {
  const p = String(owner ?? "").trim().split(/\s+/)[0]
  return p && p.length > 1 ? p : null
}

// Abertura de 10 segundos, personalizada com o caso do lead (mesmo roteiro
// da aba WhatsApp, preenchido). Ler natural, não decorar palavra a palavra.
export function aberturaLigacao(item: FilaWhatsappItem, sender: string): string {
  const nome = nomeDisplay(item.name)
  const nicho = nichoLabel(item.niche)
  const cidade = cidadeCurta(item.city)
  const dono = primeiroNome(item.owner_name)
  const alo = dono ? `Oi, falo com ${dono}? ` : "Oi, tudo bem? Consigo falar com quem cuida da parte comercial? "
  const caso = verdito(item.reasons) === "so_social"
    ? `quem procura acha os concorrentes, e o link de vocês leva só pro Instagram`
    : `quem aparece é concorrente, a ${nome} não aparece`
  return (
    `${alo}Sou o ${sender}, da Trevo Code. Te ligo por um motivo só: pesquisei ${nicho} aqui em ${cidade} no Google e ${caso}. Consegue falar 1 minuto?`
  )
}

export const RESULTADOS = [
  { valor: "", rotulo: "Registrar resultado" },
  { valor: "nao_atendeu", rotulo: "Não atendeu" },
  { valor: "caixa_postal", rotulo: "Caixa postal" },
  { valor: "ligar_depois", rotulo: "Pediu pra ligar depois" },
  { valor: "quer_previa", rotulo: "Atendeu: quer a prévia" },
  { valor: "sem_interesse", rotulo: "Atendeu: sem interesse" },
  { valor: "numero_errado", rotulo: "Número errado" },
] as const

export type ResultadoLigacao = (typeof RESULTADOS)[number]["valor"]
