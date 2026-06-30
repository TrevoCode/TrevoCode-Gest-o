// ─────────────────────────────────────────────────────────────────────────
// Camada de acesso aos dados da MÁQUINA DE PROSPECÇÃO (tabelas prospect_*).
// A máquina escreve; aqui só LEMOS. Ações (gerar isca, marcar fechamento) vão
// pela API HTTP da máquina (ver lib/prospect-actions.ts). Mesmo Supabase.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server"

export type ProspectLead = {
  place_id: string
  name: string
  niche: string
  city: string
  phone: string | null
  website: string | null
  pain_score: number
  reasons: string | null // gargalos separados por " | "
  channels: string | null
  contacted: number
  replied: number
  positive: number
  call_booked: number
  closed: number
  ticket: number
  isca_whatsapp: string | null
  isca_instagram: string | null
  isca_email_subj: string | null
  isca_email_body: string | null
  isca_at: string | null
  isca2_mockup_url: string | null
  isca2_demo_url: string | null
  captured_at: string
}

export type ProspectStatus = "active" | "replied" | "booked" | "optout" | "exhausted"
export type ProspectMsg = { role: "lead" | "sdr"; text: string; at: string }
export type ProspectLeadView = ProspectLead & { status: ProspectStatus | null }

// String literal (não concatenar — o supabase-js infere os tipos do literal).
const LEAD_COLS =
  "place_id,name,niche,city,phone,website,pain_score,reasons,channels,contacted,replied,positive,call_booked,closed,ticket,isca_whatsapp,isca_instagram,isca_email_subj,isca_email_body,isca_at,isca2_mockup_url,isca2_demo_url,captured_at"

/** Lista os leads qualificados, maior dor primeiro, com o estágio do outreach. */
export async function listarProspectLeads(niche?: string): Promise<ProspectLeadView[]> {
  const supabase = await createClient()
  let q = supabase
    .from("prospect_leads")
    .select(LEAD_COLS)
    .eq("qualified", 1)
    .order("pain_score", { ascending: false })
  if (niche) q = q.eq("niche", niche)
  const [{ data: leads }, { data: out }] = await Promise.all([
    q,
    supabase.from("prospect_outreach").select("place_id,status"),
  ])
  const outRows = (out ?? []) as unknown as { place_id: string; status: ProspectStatus }[]
  const statusOf = new Map(outRows.map((o) => [o.place_id, o.status]))
  const rows = (leads ?? []) as unknown as ProspectLead[]
  return rows.map((l) => ({ ...l, status: statusOf.get(l.place_id) ?? null }))
}

export type ProspectLeadDetalhe = ProspectLeadView & {
  next_action_at: string | null
  touch_index: number | null
  mensagens: ProspectMsg[]
}

/** Detalhe de um lead: dados + estágio + thread de conversa (CRM de WhatsApp). */
export async function obterProspectLead(placeId: string): Promise<ProspectLeadDetalhe | null> {
  const supabase = await createClient()
  const { data: l } = await supabase
    .from("prospect_leads")
    .select(LEAD_COLS)
    .eq("place_id", placeId)
    .maybeSingle()
  if (!l) return null
  const [{ data: out }, { data: msgs }] = await Promise.all([
    supabase.from("prospect_outreach").select("status,touch_index,next_action_at").eq("place_id", placeId).maybeSingle(),
    supabase.from("prospect_conversations").select("role,text,at").eq("place_id", placeId).order("at"),
  ])
  const o = out as unknown as { status: ProspectStatus; touch_index: number; next_action_at: string | null } | null
  return {
    ...(l as unknown as ProspectLead),
    status: o?.status ?? null,
    touch_index: o?.touch_index ?? null,
    next_action_at: o?.next_action_at ?? null,
    mensagens: (msgs ?? []) as unknown as ProspectMsg[],
  }
}

export type NichoPlacar = {
  niche: string
  captados: number
  dorPct: number
  fila: number
  contatados: number
  responderam: number
  positivos: number
  fechados: number
  receita: number
}

/** Placar de descoberta de nicho: captação/dor (runs) × funil (leads). */
export async function obterProspectPlacar(): Promise<NichoPlacar[]> {
  const supabase = await createClient()
  const [{ data: runsData }, { data: leadsData }] = await Promise.all([
    supabase.from("prospect_runs").select("niche,captured,qualified"),
    supabase.from("prospect_leads").select("niche,contacted,replied,positive,closed,ticket").eq("qualified", 1),
  ])
  const runs = (runsData ?? []) as unknown as { niche: string; captured: number; qualified: number }[]
  const leads = (leadsData ?? []) as unknown as {
    niche: string; contacted: number; replied: number; positive: number; closed: number; ticket: number
  }[]
  const por = new Map<string, NichoPlacar>()
  const get = (n: string) =>
    por.get(n) ??
    por.set(n, { niche: n, captados: 0, dorPct: 0, fila: 0, contatados: 0, responderam: 0, positivos: 0, fechados: 0, receita: 0 }).get(n)!
  const captQual = new Map<string, { cap: number; qual: number }>()
  for (const r of runs ?? []) {
    const c = captQual.get(r.niche) ?? { cap: 0, qual: 0 }
    c.cap += r.captured ?? 0
    c.qual += r.qualified ?? 0
    captQual.set(r.niche, c)
  }
  for (const [n, c] of captQual) {
    const row = get(n)
    row.captados = c.cap
    row.dorPct = c.cap ? Math.round((c.qual / c.cap) * 100) : 0
  }
  for (const l of leads ?? []) {
    const row = get(l.niche)
    row.fila += 1
    row.contatados += l.contacted ?? 0
    row.responderam += l.replied ?? 0
    row.positivos += l.positive ?? 0
    row.fechados += l.closed ?? 0
    row.receita += l.ticket ?? 0
  }
  return [...por.values()].sort((a, b) => b.fechados - a.fechados || b.positivos - a.positivos || b.dorPct - a.dorPct)
}
