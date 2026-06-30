// ─────────────────────────────────────────────────────────────────────────
// Leitura da PROSPECÇÃO (schema `prospect`, escrito pela máquina).
// Único ponto que conhece a origem. Lê com a sessão do membro (RLS via cookie
// anon client) e `.schema("prospect")`. SOMENTE leitura — nunca grava aqui
// (ações vão pela API da máquina, ver lib/prospect-actions.ts).
// Degrada com elegância: se o schema ainda não existir / a máquina não rodou,
// retorna vazio em vez de estourar a tela.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server"
import type { ProspectLead, Outreach, Conversa, Run, OutreachStatus } from "@/lib/db/prospect"

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
