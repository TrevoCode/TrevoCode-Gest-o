"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Escrita no Supabase com a sessão do usuário (RLS: authenticated).
const s = (fd: FormData, k: string) => {
  const v = fd.get(k)
  const t = typeof v === "string" ? v.trim() : ""
  return t.length ? t : null
}
const num = (fd: FormData, k: string) => {
  const v = s(fd, k)
  return v ? Number(v.replace(/[^\d.-]/g, "")) : null
}

export async function criarCliente(fd: FormData) {
  const supabase = await createClient()
  const nome = s(fd, "nome")
  if (!nome) return
  const { data, error } = await supabase
    .from("clientes")
    .insert({ nome, cnpj: s(fd, "cnpj"), segmento: s(fd, "segmento"), status: s(fd, "status") ?? "lead", origem: s(fd, "origem"), observacoes: s(fd, "observacoes") })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  const cn = s(fd, "contato_nome")
  if (cn) await supabase.from("contatos").insert({ cliente_id: data.id, nome: cn, email: s(fd, "contato_email"), telefone: s(fd, "contato_telefone"), principal: true })
  revalidatePath("/app/clientes")
  redirect(`/app/clientes/${data.id}`)
}

export async function criarProjeto(fd: FormData) {
  const supabase = await createClient()
  const nome = s(fd, "nome")
  const cliente_id = s(fd, "cliente_id")
  if (!nome || !cliente_id) return
  const { data, error } = await supabase
    .from("projetos")
    .insert({ nome, cliente_id, tipo: s(fd, "tipo") ?? "one_off", valor: num(fd, "valor"), custo: num(fd, "custo"), status: s(fd, "status") ?? "proposta", data_inicio: s(fd, "data_inicio"), descricao: s(fd, "descricao") })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  revalidatePath("/app/projetos")
  redirect(`/app/projetos/${data.id}`)
}

export async function criarReuniao(fd: FormData) {
  const supabase = await createClient()
  const titulo = s(fd, "titulo")
  const data_hora = s(fd, "data_hora")
  if (!titulo || !data_hora) return
  const { error } = await supabase
    .from("reunioes")
    .insert({ titulo, cliente_id: s(fd, "cliente_id"), data_hora, tipo: s(fd, "tipo") ?? "meet", status: "agendada", notas: s(fd, "notas"), follow_up: s(fd, "follow_up") })
  if (error) throw new Error(error.message)
  revalidatePath("/app/reunioes")
  redirect("/app/reunioes")
}

// Converte um lead em cliente (+ contato) e marca o lead como convertido.
export async function promoverLead(fd: FormData) {
  const supabase = await createClient()
  const leadId = s(fd, "lead_id")
  if (!leadId) return
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle()
  if (!lead) return
  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({ nome: lead.empresa || lead.nome, status: "qualificado", origem: "site", observacoes: lead.mensagem })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  if (lead.nome) await supabase.from("contatos").insert({ cliente_id: cliente.id, nome: lead.nome, email: lead.email, telefone: lead.telefone, principal: true })
  await supabase.from("leads").update({ status: "convertido", cliente_id: cliente.id }).eq("id", leadId)
  revalidatePath("/app/leads")
  revalidatePath("/app/clientes")
  redirect(`/app/clientes/${cliente.id}`)
}

export async function decidirSolicitacao(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "solicitacao_id")
  const status = s(fd, "status")
  if (!id || !status) return
  await supabase.from("solicitacoes_despesa").update({ status }).eq("id", id)
  revalidatePath("/app/planejamento")
}
