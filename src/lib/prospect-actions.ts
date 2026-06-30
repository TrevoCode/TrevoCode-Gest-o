"use server"

// ─────────────────────────────────────────────────────────────────────────
// Ações de PROSPECÇÃO (plataforma → máquina). A plataforma NUNCA escreve nas
// tabelas `prospect.*`; toda mutação é um POST na API HTTP da máquina, que
// reflete nas tabelas → a UI atualiza via Realtime.
//
// Server Actions (não um proxy [...path] aberto): o token PROSPECT_API_TOKEN
// fica só no servidor e cada rota é explícita/tipada. Toda ação revalida o
// membro (defesa: o proxy do Next gateia /app, mas Server Actions também são
// alvo direto, então conferimos a allowlist aqui).
// ─────────────────────────────────────────────────────────────────────────
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isDemoMode } from "@/lib/supabase/config"

export type AcaoResultado = { ok: boolean; error?: string; data?: unknown }

async function assertMembro(): Promise<string | null> {
  if (isDemoMode()) return "Ação indisponível no modo demonstração."
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!isAllowed(user?.email)) return "Não autorizado."
  return null
}

// Chama a API da máquina. `path` já sem a barra inicial (ex.: "leads/X/isca").
async function callMaquina(path: string, body?: unknown): Promise<AcaoResultado> {
  const base = process.env.PROSPECT_API_URL
  const token = process.env.PROSPECT_API_TOKEN
  if (!base || !token) {
    return { ok: false, error: "Máquina de prospecção não configurada (PROSPECT_API_URL/TOKEN)." }
  }
  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/api/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    })
    const txt = await r.text()
    let json: unknown = undefined
    try {
      json = txt ? JSON.parse(txt) : undefined
    } catch {
      /* resposta não-JSON */
    }
    if (!r.ok) {
      const msg =
        (json as { error?: string } | undefined)?.error ?? `Máquina respondeu ${r.status}.`
      return { ok: false, error: msg }
    }
    return { ok: true, data: json }
  } catch (e) {
    return { ok: false, error: `Não consegui falar com a máquina: ${(e as Error).message}` }
  }
}

const enc = (placeId: string) => encodeURIComponent(placeId)

async function acao(path: string, body: unknown, revalidate: string[]): Promise<AcaoResultado> {
  const erro = await assertMembro()
  if (erro) return { ok: false, error: erro }
  const res = await callMaquina(path, body)
  if (res.ok) for (const p of revalidate) revalidatePath(p)
  return res
}

const detalhe = (placeId: string) => [`/app/prospeccao/${placeId}`, "/app/prospeccao"]

// Capta + qualifica um nicho/cidade.
export async function capturar(niche: string, city: string): Promise<AcaoResultado> {
  return acao("capture", { niche, city }, ["/app/prospeccao", "/app/nichos"])
}

// Gera as 3 mensagens de isca (Nível 1).
export async function gerarIsca(placeId: string): Promise<AcaoResultado> {
  return acao(`leads/${enc(placeId)}/isca`, undefined, detalhe(placeId))
}

// Gera mockup + demo do bot (Nível 2) e grava as URLs no lead.
export async function gerarIsca2(placeId: string): Promise<AcaoResultado> {
  return acao(`leads/${enc(placeId)}/isca2`, undefined, detalhe(placeId))
}

// Põe o lead na fila de outreach (cadência).
export async function enfileirar(placeId: string, channel?: string): Promise<AcaoResultado> {
  return acao(
    `leads/${enc(placeId)}/enqueue`,
    channel ? { channel } : {},
    [...detalhe(placeId), "/app/cadencia"]
  )
}

// Registra um toque enviado (avança a cadência).
export async function registrarToque(placeId: string): Promise<AcaoResultado> {
  return acao(`leads/${enc(placeId)}/send`, undefined, [...detalhe(placeId), "/app/cadencia"])
}

// Marca desfecho (fechamento, ticket, etc.).
export async function marcarDesfecho(
  placeId: string,
  body: { closed?: boolean; ticket?: number; call_booked?: boolean; positive?: boolean }
): Promise<AcaoResultado> {
  return acao(`leads/${enc(placeId)}/outcome`, body, [...detalhe(placeId), "/app/cadencia", "/app/nichos"])
}

// Suprime o contato (opt-out, não recontatar).
export async function optout(placeId: string): Promise<AcaoResultado> {
  return acao(`leads/${enc(placeId)}/optout`, undefined, [...detalhe(placeId), "/app/cadencia"])
}
