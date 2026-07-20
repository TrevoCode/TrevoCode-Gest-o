// ─────────────────────────────────────────────────────────────────────────
// Leitura da PROSPECÇÃO (schema `prospect`, escrito pela máquina).
// Único ponto que conhece a origem. Lê com a sessão do membro (RLS via cookie
// anon client) e `.schema("prospect")`. SOMENTE leitura — nunca grava aqui
// (ações vão pela API da máquina, ver lib/prospect-actions.ts).
// Degrada com elegância: se o schema ainda não existir / a máquina não rodou,
// retorna vazio em vez de estourar a tela.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server"
import { diaSP, hojeISO } from "@/lib/datas"
import type { ProspectLead, Outreach, Conversa, Run, OutreachStatus, EmailEvento } from "@/lib/db/prospect"

async function px() {
  const supabase = await createClient()
  return supabase.schema("prospect")
}

// Junta o estágio de outreach (status, toques) em cada lead, p/ a lista.
export type LeadView = ProspectLead & {
  status: OutreachStatus | null
  touch_index: number | null
  next_action_at: string | null
}

export type LeadFiltros = { niche?: string; status?: string }

export async function listarLeads(filtros: LeadFiltros = {}): Promise<LeadView[]> {
  const db = await px()
  const [{ data: leads }, { data: out }] = await Promise.all([
    db.from("leads").select("*").order("pain_score", { ascending: false }),
    db.from("outreach").select("place_id,status,touch_index,next_action_at"),
  ])
  const pipe = new Map((out ?? []).map((o) => [o.place_id as string, o as Outreach]))
  let rows: LeadView[] = (leads ?? []).map((l) => {
    const o = pipe.get((l as ProspectLead).place_id)
    return {
      ...(l as ProspectLead),
      status: o?.status ?? null,
      touch_index: o?.touch_index ?? null,
      next_action_at: o?.next_action_at ?? null,
    }
  })
  if (filtros.niche) rows = rows.filter((l) => l.niche === filtros.niche)
  if (filtros.status) rows = rows.filter((l) => l.status === filtros.status)
  return rows
}

// Nichos distintos (para o filtro da lista).
export async function listarNichos(): Promise<string[]> {
  const db = await px()
  const { data } = await db.from("leads").select("niche")
  const set = new Set<string>()
  for (const r of data ?? []) if (r.niche) set.add(r.niche as string)
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"))
}

export async function obterLead(placeId: string): Promise<ProspectLead | null> {
  const db = await px()
  const { data } = await db.from("leads").select("*").eq("place_id", placeId).maybeSingle()
  return (data as ProspectLead) ?? null
}

export async function obterOutreach(placeId: string): Promise<Outreach | null> {
  const db = await px()
  const { data } = await db.from("outreach").select("*").eq("place_id", placeId).maybeSingle()
  return (data as Outreach) ?? null
}

// Histórico inicial do chat (Realtime assume daqui — ver ProspectChat).
export async function obterConversas(placeId: string): Promise<Conversa[]> {
  const db = await px()
  const { data } = await db
    .from("conversations")
    .select("id,place_id,role,text,at")
    .eq("place_id", placeId)
    .order("at")
  return (data as Conversa[]) ?? []
}

// Pipeline (cadência): leads agrupados pelo status do outreach.
const ORDEM_STATUS: OutreachStatus[] = ["active", "replied", "booked", "exhausted", "optout"]
const LABEL_STATUS: Record<OutreachStatus, string> = {
  active: "Em cadência",
  replied: "Respondeu",
  booked: "Reunião marcada",
  exhausted: "Esgotado",
  optout: "Opt-out",
}

export type ColunaCadencia = {
  status: OutreachStatus
  label: string
  itens: LeadView[]
}

export async function obterCadencia(): Promise<{ colunas: ColunaCadencia[]; emCampanha: number }> {
  const leads = await listarLeads()
  const comOutreach = leads.filter((l) => l.status)
  const colunas = ORDEM_STATUS.map((status) => ({
    status,
    label: LABEL_STATUS[status],
    itens: comOutreach.filter((l) => l.status === status),
  }))
  return { colunas, emCampanha: comOutreach.length }
}

// Placar de nichos: agrega runs por nicho e cruza com leads (fechamentos/ticket).
export type NichoPlacar = {
  niche: string
  captured: number
  qualified: number
  dor: number // qualified / captured (0–1)
  closed: number
  ticket: number
}

export async function obterPlacarNichos(): Promise<NichoPlacar[]> {
  const db = await px()
  const [{ data: runs }, { data: leads }] = await Promise.all([
    db.from("runs").select("niche,captured,qualified"),
    db.from("leads").select("niche,closed,ticket"),
  ])
  const acc = new Map<string, NichoPlacar>()
  const get = (niche: string) => {
    let n = acc.get(niche)
    if (!n) {
      n = { niche, captured: 0, qualified: 0, dor: 0, closed: 0, ticket: 0 }
      acc.set(niche, n)
    }
    return n
  }
  for (const r of (runs ?? []) as Run[]) {
    if (!r.niche) continue
    const n = get(r.niche)
    n.captured += r.captured ?? 0
    n.qualified += r.qualified ?? 0
  }
  for (const l of (leads ?? []) as Pick<ProspectLead, "niche" | "closed" | "ticket">[]) {
    if (!l.niche) continue
    const n = get(l.niche)
    if (l.closed === 1) n.closed += 1
    n.ticket += l.ticket ?? 0
  }
  const lista = [...acc.values()]
  for (const n of lista) n.dor = n.captured ? n.qualified / n.captured : 0
  return lista.sort((a, b) => b.dor - a.dor)
}

// ─── Disparos de email (log da máquina em prospect.email_events) ───────────

// Espelhos de regras da máquina (trevocode-prospect), só p/ EXIBIÇÃO — a
// seleção real de envio é da máquina:
// - variante A/B/C: hash determinístico do nome (src/isca/generate.ts, emailVariantFor)
// - provedores genéricos: mesmo filtro do disparador (enviar-dia.mjs)
export function emailVariantFor(name: string | null): "A" | "B" | "C" {
  const i = [...(name ?? "")].reduce((a, c) => a + c.charCodeAt(0) * 13, 0) % 3
  return (["A", "B", "C"] as const)[i]
}

const PROVEDORES_GENERICOS = new Set([
  "gmail.com", "hotmail.com", "outlook.com", "outlook.com.br", "yahoo.com",
  "yahoo.com.br", "uol.com.br", "bol.com.br", "terra.com.br", "globo.com",
  "live.com", "live.com.br", "icloud.com", "me.com", "msn.com", "ig.com.br",
  "itelefonica.com.br",
])

const ufDe = (city: string | null) => (city?.trim().endsWith("SP") ? "SP" : "BH")

// Estado final de um envio, do pior pro melhor (o pior evento manda no badge).
const PRECEDENCIA = ["complained", "bounced", "clicked", "opened", "delivered", "sent"] as const
export type EstadoEnvio = (typeof PRECEDENCIA)[number]

export type EnvioView = {
  place_id: string
  name: string
  niche: string | null
  city: string | null
  uf: "BH" | "SP"
  variante: "A" | "B" | "C"
  assunto: string | null
  enviado_em: string // ISO do evento `sent`
  estado: EstadoEnvio
}

export type DiaPlacar = {
  dia: string // YYYY-MM-DD (America/Sao_Paulo)
  enviados: number
  entregues: number
  abertos: number
  cliques: number
  bounces: number
  reclamacoes: number
}

export type EstoqueLinha = { uf: "BH" | "SP"; niche: string; prontos: number }

export type DisparosEmail = {
  hoje: DiaPlacar
  porDia: DiaPlacar[] // dias com atividade, mais recente primeiro
  envios: EnvioView[] // últimos envios, mais recente primeiro
  estoque: EstoqueLinha[]
  estoqueTotal: number
}

const diaVazio = (dia: string): DiaPlacar => ({
  dia, enviados: 0, entregues: 0, abertos: 0, cliques: 0, bounces: 0, reclamacoes: 0,
})

export async function obterDisparosEmail(): Promise<DisparosEmail> {
  const db = await px()
  const [{ data: eventos }, { data: leads }] = await Promise.all([
    // Supabase corta em 1000 por padrão; o limite explícito segura a página leve.
    db.from("email_events").select("id,place_id,email,type,at").order("id", { ascending: false }).limit(5000),
    db.from("leads").select("place_id,name,niche,city,email,email_status,isca_email_subj"),
  ])
  const porLead = new Map((leads ?? []).map((l) => [l.place_id as string, l]))

  // Placar por dia: leads únicos por tipo de evento.
  const dias = new Map<string, Record<EstadoEnvio, Set<string>>>()
  const setDe = (dia: string, tipo: EstadoEnvio) => {
    let d = dias.get(dia)
    if (!d) {
      d = { sent: new Set(), delivered: new Set(), opened: new Set(), clicked: new Set(), bounced: new Set(), complained: new Set() }
      dias.set(dia, d)
    }
    return d[tipo]
  }

  // Envios: 1 linha por lead, ancorada no evento `sent`; o pior evento vira o estado.
  const envioPorLead = new Map<string, EnvioView>()
  for (const e of (eventos ?? []) as Pick<EmailEvento, "id" | "place_id" | "email" | "type" | "at">[]) {
    if (!e.place_id || !PRECEDENCIA.includes(e.type as EstadoEnvio)) continue
    setDe(diaSP(e.at), e.type as EstadoEnvio).add(e.place_id)
    let envio = envioPorLead.get(e.place_id)
    if (!envio) {
      const l = porLead.get(e.place_id)
      envio = {
        place_id: e.place_id,
        name: (l?.name as string) ?? e.email ?? e.place_id,
        niche: (l?.niche as string) ?? null,
        city: (l?.city as string) ?? null,
        uf: ufDe((l?.city as string) ?? null),
        variante: emailVariantFor((l?.name as string) ?? null),
        assunto: (l?.isca_email_subj as string) ?? null,
        enviado_em: e.at,
        estado: "sent",
      }
      envioPorLead.set(e.place_id, envio)
    }
    if (e.type === "sent") envio.enviado_em = e.at
    if (PRECEDENCIA.indexOf(e.type as EstadoEnvio) < PRECEDENCIA.indexOf(envio.estado)) {
      envio.estado = e.type as EstadoEnvio
    }
  }

  const porDia: DiaPlacar[] = [...dias.entries()]
    .map(([dia, d]) => ({
      dia,
      enviados: d.sent.size,
      entregues: d.delivered.size,
      abertos: d.opened.size,
      cliques: d.clicked.size,
      bounces: d.bounced.size,
      reclamacoes: d.complained.size,
    }))
    .sort((a, b) => b.dia.localeCompare(a.dia))

  // Estoque pronto: mesma régua do disparador (discovered + isca + provedor genérico).
  const estoqueAcc = new Map<string, EstoqueLinha>()
  let estoqueTotal = 0
  for (const l of leads ?? []) {
    if (l.email_status !== "discovered" || !l.isca_email_subj) continue
    const dominio = ((l.email as string) ?? "").split("@")[1]?.toLowerCase()
    if (!dominio || !PROVEDORES_GENERICOS.has(dominio)) continue
    const uf = ufDe(l.city as string)
    const niche = (l.niche as string) ?? "?"
    const k = `${uf}|${niche}`
    const linha = estoqueAcc.get(k) ?? { uf, niche, prontos: 0 }
    linha.prontos += 1
    estoqueAcc.set(k, linha)
    estoqueTotal += 1
  }

  return {
    hoje: porDia.find((d) => d.dia === hojeISO()) ?? diaVazio(hojeISO()),
    porDia,
    envios: [...envioPorLead.values()].sort((a, b) => b.enviado_em.localeCompare(a.enviado_em)),
    estoque: [...estoqueAcc.values()].sort((a, b) => a.uf.localeCompare(b.uf) || a.niche.localeCompare(b.niche, "pt-BR")),
    estoqueTotal,
  }
}
