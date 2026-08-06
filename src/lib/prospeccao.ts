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

// Estado final de um envio: resposta ganha de tudo (é o que importa); no resto,
// o pior evento manda no badge (bounce ganha de aberto).
const PRECEDENCIA = ["replied", "complained", "bounced", "clicked", "opened", "delivered", "sent"] as const
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
  respostas: number
}

// Uma resposta de lead (evento 'replied' do inbound; o corpo vem no meta).
export type RespostaView = {
  evento_id: number
  place_id: string
  name: string
  respondido_em: string
  assunto: string | null
  texto: string | null
}

export type EstoqueLinha = { uf: "BH" | "SP"; niche: string; prontos: number }

export type DisparosEmail = {
  hoje: DiaPlacar
  porDia: DiaPlacar[] // dias com atividade, mais recente primeiro
  envios: EnvioView[] // últimos envios, mais recente primeiro
  respostas: RespostaView[] // respostas de leads, mais recente primeiro
  abertosSemResposta: number // leads cujo melhor sinal é abriu/clicou (sem responder)
  estoque: EstoqueLinha[]
  estoqueTotal: number
}

const diaVazio = (dia: string): DiaPlacar => ({
  dia, enviados: 0, entregues: 0, abertos: 0, cliques: 0, bounces: 0, reclamacoes: 0, respostas: 0,
})

export async function obterDisparosEmail(): Promise<DisparosEmail> {
  const db = await px()
  // ⚠️ PostgREST corta QUALQUER select em 1000 linhas em silêncio. prospect.leads
  // já passa de 4 mil — nunca buscar a tabela inteira aqui. Eventos: os 1000 mais
  // recentes cobrem semanas de disparo; leads: só os referenciados nos eventos
  // (busca em lotes) + o estoque já filtrado no servidor (centenas de linhas).
  const { data: eventos } = await db
    .from("email_events")
    .select("id,place_id,email,type,at,meta")
    .order("id", { ascending: false })
    .limit(1000)

  const ids = [...new Set((eventos ?? []).map((e) => e.place_id as string | null).filter(Boolean))] as string[]
  const porLead = new Map<string, Record<string, unknown>>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db
      .from("leads")
      .select("place_id,name,niche,city,isca_email_subj")
      .in("place_id", ids.slice(i, i + 200))
    for (const l of data ?? []) porLead.set(l.place_id as string, l)
  }

  const { data: prontos } = await db
    .from("leads")
    .select("place_id,niche,city,email")
    .eq("email_status", "discovered")
    .not("isca_email_subj", "is", null)
    .limit(1000)

  // Placar por dia: leads únicos por tipo de evento.
  const dias = new Map<string, Record<EstadoEnvio, Set<string>>>()
  const setDe = (dia: string, tipo: EstadoEnvio) => {
    let d = dias.get(dia)
    if (!d) {
      d = { replied: new Set(), sent: new Set(), delivered: new Set(), opened: new Set(), clicked: new Set(), bounced: new Set(), complained: new Set() }
      dias.set(dia, d)
    }
    return d[tipo]
  }

  // Envios: 1 linha por lead, ancorada no evento `sent`; a precedência vira o estado.
  const envioPorLead = new Map<string, EnvioView>()
  const respostas: RespostaView[] = []
  for (const e of (eventos ?? []) as Pick<EmailEvento, "id" | "place_id" | "email" | "type" | "at" | "meta">[]) {
    if (!e.place_id || !PRECEDENCIA.includes(e.type as EstadoEnvio)) continue
    setDe(diaSP(e.at), e.type as EstadoEnvio).add(e.place_id)
    if (e.type === "replied") {
      const meta = (e.meta ?? {}) as { subject?: unknown; text?: unknown }
      respostas.push({
        evento_id: e.id,
        place_id: e.place_id,
        name: (porLead.get(e.place_id)?.name as string) ?? e.email ?? e.place_id,
        respondido_em: e.at,
        assunto: typeof meta.subject === "string" ? meta.subject : null,
        texto: typeof meta.text === "string" ? meta.text : null,
      })
    }
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
      respostas: d.replied.size,
    }))
    .sort((a, b) => b.dia.localeCompare(a.dia))

  // Estoque pronto: mesma régua do disparador (discovered + isca + provedor genérico).
  // Status e isca já filtrados no servidor; o provedor genérico fica no código.
  const estoqueAcc = new Map<string, EstoqueLinha>()
  let estoqueTotal = 0
  for (const l of prontos ?? []) {
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

  const envios = [...envioPorLead.values()].sort((a, b) => b.enviado_em.localeCompare(a.enviado_em))
  return {
    hoje: porDia.find((d) => d.dia === hojeISO()) ?? diaVazio(hojeISO()),
    porDia,
    envios,
    respostas: respostas.sort((a, b) => b.respondido_em.localeCompare(a.respondido_em)),
    abertosSemResposta: envios.filter((e) => e.estado === "opened" || e.estado === "clicked").length,
    estoque: [...estoqueAcc.values()].sort((a, b) => a.uf.localeCompare(b.uf) || a.niche.localeCompare(b.niche, "pt-BR")),
    estoqueTotal,
  }
}

// ─── Fila de follow-up de WHATSAPP (leads tocados por email, sem resposta) ─

// Mesma régua da lista /zap da máquina: email enviado, sem resposta/bounce/
// opt-out, com telefone. Quem ABRIU o email vem primeiro (segmento mais
// quente). Praça decide o chip: BH e região → chip 31 (Fabrício); SP e
// demais cidades → chip 11 (Nobre).
export type ChipZap = "31" | "11"

export type FilaWhatsappItem = {
  place_id: string
  name: string | null
  niche: string | null
  city: string | null
  phone: string
  reasons: string | null
  email_status: string
  email_sent_at: string
  toques: number
  abriu: boolean
  chip: ChipZap
  // dossiê de ligação (migration 0011 + colunas já existentes)
  website: string | null
  address: string | null
  owner_name: string | null
  rating: number | null
  reviews_count: number | null
  isca_email_subj: string | null
  email_event_at: string | null
  // fila premium: lead nunca tocado por email (ligação a frio em alvo grande)
  premium?: boolean
}

const EH_BH = /Belo Horizonte|Contagem|Betim|Nova Lima|Santa Luzia|Sabará|Ribeirão das Neves|Ibirité/i

export async function obterFilaWhatsapp(): Promise<FilaWhatsappItem[]> {
  const db = await px()
  // Fila real hoje = dezenas de leads; o filtro no servidor mantém isso longe
  // do corte silencioso de 1000 linhas do PostgREST.
  const [{ data: leads }, { data: supr }] = await Promise.all([
    db
      .from("leads")
      .select(
        "place_id,name,niche,city,phone,email,reasons,email_status,email_sent_at,website,address,owner_name,rating,reviews_count,isca_email_subj,email_event_at"
      )
      .not("email_sent_at", "is", null)
      .in("email_status", ["sent", "delivered", "opened", "clicked"])
      .not("phone", "is", null)
      .order("email_sent_at")
      .limit(1000),
    db.from("suppression").select("key").limit(1000),
  ])
  const suprimidos = new Set((supr ?? []).map((s) => String(s.key).toLowerCase()))
  const base = (leads ?? []).filter(
    (l) => !suprimidos.has(String(l.email ?? "").toLowerCase())
  )

  // Toques (sent) e abertura por lead, em lotes (PostgREST corta em 1000).
  const ids = base.map((l) => l.place_id as string)
  const toques = new Map<string, number>()
  const abriu = new Set<string>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db
      .from("email_events")
      .select("place_id,type")
      .in("place_id", ids.slice(i, i + 200))
      .in("type", ["sent", "opened", "clicked"])
      .limit(1000)
    for (const e of data ?? []) {
      const id = e.place_id as string
      if (e.type === "sent") toques.set(id, (toques.get(id) ?? 0) + 1)
      else abriu.add(id)
    }
  }

  const fila: FilaWhatsappItem[] = base.map((l) => ({
    place_id: l.place_id as string,
    name: (l.name as string) ?? null,
    niche: (l.niche as string) ?? null,
    city: (l.city as string) ?? null,
    phone: l.phone as string,
    reasons: (l.reasons as string) ?? null,
    email_status: l.email_status as string,
    email_sent_at: l.email_sent_at as string,
    toques: toques.get(l.place_id as string) ?? 1,
    abriu: abriu.has(l.place_id as string),
    chip: EH_BH.test(String(l.city ?? "").split(",")[0]) ? "31" : "11",
    website: (l.website as string) ?? null,
    address: (l.address as string) ?? null,
    owner_name: (l.owner_name as string) ?? null,
    rating: (l.rating as number) ?? null,
    reviews_count: (l.reviews_count as number) ?? null,
    isca_email_subj: (l.isca_email_subj as string) ?? null,
    email_event_at: (l.email_event_at as string) ?? null,
  }))
  return fila.sort(
    (a, b) => Number(b.abriu) - Number(a.abriu) || a.email_sent_at.localeCompare(b.email_sent_at)
  )
}

// ─── Fila PREMIUM de ligação a frio (leads grandes, nunca tocados) ────────

// A fila do email nasceu do filtro "sem site" do captador, que seleciona
// negócio pequeno de bairro (diagnóstico do Fabricio, 06/ago). Aqui é o
// contrário: porte real na RFB (EPP ou maior = faturamento R$360k+/ano) e
// operação viva no Google (50+ avaliações, nota 4,3+). Ligação direta, sem
// depender de email — ordenada do maior movimento pro menor.
export async function obterFilaPremium(): Promise<FilaWhatsappItem[]> {
  const db = await px()
  const { data } = await db
    .from("leads")
    .select(
      "place_id,name,niche,city,phone,reasons,website,address,owner_name,rating,reviews_count"
    )
    .is("email_sent_at", null)
    .not("phone", "is", null)
    .gte("reviews_count", 50)
    .gte("rating", 4.3)
    .or("reasons.like.%porte 03%,reasons.like.%porte 05%")
    .order("reviews_count", { ascending: false })
    .limit(300)
  return (data ?? []).map((l) => ({
    place_id: l.place_id as string,
    name: (l.name as string) ?? null,
    niche: (l.niche as string) ?? null,
    city: (l.city as string) ?? null,
    phone: l.phone as string,
    reasons: (l.reasons as string) ?? null,
    email_status: "",
    email_sent_at: "",
    toques: 0,
    abriu: false,
    chip: EH_BH.test(String(l.city ?? "").split(",")[0]) ? "31" : "11",
    website: (l.website as string) ?? null,
    address: (l.address as string) ?? null,
    owner_name: (l.owner_name as string) ?? null,
    rating: (l.rating as number) ?? null,
    reviews_count: (l.reviews_count as number) ?? null,
    isca_email_subj: null,
    email_event_at: null,
    premium: true,
  }))
}
