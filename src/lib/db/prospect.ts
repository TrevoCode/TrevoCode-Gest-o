// Tipos do domínio de PROSPECÇÃO (schema `prospect` — escrito pela máquina).
// Espelham supabase/migrations/0006_prospeccao.sql. A plataforma só LÊ.
// Convenção do contrato: "booleanos" são integer 0/1; timestamps são text ISO.

export type Flag = 0 | 1

export type OutreachStatus = "active" | "replied" | "booked" | "optout" | "exhausted"
export type ConvRole = "lead" | "sdr"

// `prospect.leads` — o card de cada lead prospectado.
export type ProspectLead = {
  place_id: string
  name: string | null
  niche: string | null
  city: string | null
  phone: string | null
  website: string | null
  pain_score: number
  reasons: string | null
  channels: string | null
  rating: number | null
  reviews_count: number | null
  captured_at: string | null
  // funil
  contacted: Flag
  replied: Flag
  positive: Flag
  call_booked: Flag
  closed: Flag
  ticket: number | null
  // isca Nível 1
  isca_whatsapp: string | null
  isca_instagram: string | null
  isca_email_subj: string | null
  isca_email_body: string | null
  isca_at: string | null
  // isca Nível 2
  isca2_mockup_url: string | null
  isca2_demo_url: string | null
  // canais (migration 0010)
  email: string | null
  email_status: string | null // discovered|proxy|cnpj_jovem|sent|delivered|opened|bounced|...
  email_sent_at: string | null
  email_event_at: string | null
  instagram: string | null
  ig_status: string | null
  ig_sent_at: string | null
}

// `prospect.email_events` — log do webhook do Resend + envios (migration 0010).
export type EmailEvento = {
  id: number
  place_id: string | null
  email: string | null
  type: string // sent|delivered|opened|clicked|bounced|complained|unsubscribed
  at: string // ISO-8601
  meta: Record<string, unknown> | null
}

// `prospect.outreach` — estágio no pipeline (1 linha por lead em campanha).
export type Outreach = {
  place_id: string
  status: OutreachStatus | null
  touch_index: number
  next_action_at: string | null
  last_touch_at: string | null
  created_at: string | null
  updated_at: string | null
}

// `prospect.conversations` — thread de WhatsApp.
export type Conversa = {
  id: number
  place_id: string
  role: ConvRole
  text: string
  at: string
}

// `prospect.runs` — placar de captação por nicho.
export type Run = {
  id: number
  niche: string
  captured: number
  qualified: number
  ran_at: string | null
}
