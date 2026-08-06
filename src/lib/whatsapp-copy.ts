// ─────────────────────────────────────────────────────────────────────────
// Copy do follow-up de WHATSAPP — ESPELHO de trevocode-prospect/
// gerar-whatsapp-followup.mjs (doutrina COPY-PROSPECCAO: dor primeiro,
// copys A/B/C, prova verificada). Mudou lá, muda aqui.
// Funções PURAS (sem IO) — seguras em client components.
// ─────────────────────────────────────────────────────────────────────────

export function nomeDisplay(raw: string | null): string {
  return String(raw ?? "")
    .replace(/^[\d.\/-]+\s+/, "")
    .replace(/\s+[\d.\/-]{8,}$/, "")
    .replace(/\s+(ltda|s\/s|s\.a\.?|me|epp|eireli)\.?$/i, "")
    .trim()
}

function nomeCurto(raw: string | null): string {
  const base = nomeDisplay(raw).split(/\s+[-–|]\s+/)[0].trim()
  return base.split(/\s+/).slice(0, 4).join(" ")
}

export function nichoLabel(n: string | null): string {
  const s = String(n ?? "").toLowerCase()
  if (/odonto|dentist/.test(s)) return "dentista"
  if (/academia|muscula|crossfit|gin[áa]st/.test(s)) return "academia"
  if (/pet|veterin|banho/.test(s)) return "pet shop"
  return s || "o negócio"
}

export const cidadeCurta = (c: string | null) => String(c ?? "").split(",")[0].trim()

export function verdito(reasons: string | null): "so_social" | "sem_site" {
  const r = String(reasons ?? "").toLowerCase()
  if (/s[óo] rede social|linktree/.test(r)) return "so_social"
  return "sem_site"
}

export type FoneWa = { wa: string; display: string; fixo: boolean }

export function foneWa(raw: string | null): FoneWa | null {
  let d = String(raw ?? "").replace(/\D/g, "").replace(/^0+/, "")
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2)
  if (d.length < 10) return null
  const ddd = d.slice(0, 2)
  let local = d.slice(2)
  const fixo = /^[2-5]/.test(local)
  if (local.length === 8 && /^[6-9]/.test(local)) local = "9" + local
  return {
    wa: "55" + ddd + local,
    display: `(${ddd}) ${local.length === 9 ? local.slice(0, 5) + "-" + local.slice(5) : local.slice(0, 4) + "-" + local.slice(4)}`,
    fixo,
  }
}

const TERMOS: Record<string, [string, string]> = {
  "pet shop": ["pet shop perto de mim", "banho e tosa"],
  dentista: ["dentista perto de mim", "dentista"],
  academia: ["academia perto de mim", "academia"],
}
const termosDe = (nicho: string, cidade: string): [string, string] => {
  const [t1, t2] = TERMOS[nicho] ?? [`${nicho} perto de mim`, nicho]
  return [t1, `${t2} ${cidade}`.trim()]
}

export type LeadCopy = {
  name: string | null
  niche: string | null
  city: string | null
  reasons: string | null
}

export function mensagemWhatsapp(l: LeadCopy, copy: "A" | "B" | "C", sender: string): string {
  const nome = nomeCurto(l.name)
  const nicho = nichoLabel(l.niche)
  const cidade = cidadeCurta(l.city)
  const v = verdito(l.reasons)
  const [t1, t2] = termosDe(nicho, cidade)
  const provaCurta = v === "so_social"
    ? `o da ${nome} que aparece leva só pro Instagram`
    : `não achei site da ${nome} nessas buscas`
  const provaLonga = v === "so_social"
    ? `o link da ${nome} leva só pro Instagram, enquanto quem tem site aparece na frente`
    : `a ${nome} não tem site aparecendo pra essas pessoas`
  if (copy === "B")
    return `Oi, tudo bem? Pergunta rápida: quantos clientes novos chegam na ${nome} pelo Google por mês?\n\nPergunto porque tem milhares de buscas por "${t1}" e "${t2}" todo mês na região, e hoje ${provaLonga}.\n\nSou o ${sender}, da Trevo Code. Coloco negócio local na frente dessas buscas. Antes de qualquer papo comercial: monto uma prévia do site de vocês, do meu bolso, e você só avalia.\n\nSe eu te mandar essa prévia até sexta, você dá uma olhada?`
  if (copy === "C")
    return `Oi! ${sender} aqui, da Trevo Code.\n\nTem gente procurando ${nicho} no Google em ${cidade} agora, nesse momento, e ${provaLonga}.\n\nQuero te mostrar isso resolvido, de graça: monto uma prévia do site de vocês e te mando pronta. Zero compromisso, você só olha.\n\nTopa que eu te envie?`
  return `Oi! Fiz uma busca rápida aqui: quem digita "${t1}" ou "${t2}" no Google encontra os concorrentes da região, e ${provaCurta}.\n\nIsso é cliente novo todo dia indo pra outro ${nicho} sem nem saber que vocês existem.\n\nSou o ${sender}, da Trevo Code. Monto sem custo nenhum uma prévia de como ficaria o site de vocês pra essas buscas. Você olha pronta, na tela, e decide se faz sentido. Sem compromisso mesmo.\n\nPosso te mandar essa prévia essa semana?`
}
