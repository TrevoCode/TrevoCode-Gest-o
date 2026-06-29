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

const hoje = () => new Date().toISOString().slice(0, 10)
const agora = () => new Date().toISOString()

// ---------- Pipeline ----------
export async function moverDeal(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "deal_id")
  const etapa = s(fd, "etapa")
  if (!id || !etapa) return
  await supabase.from("deals").update({ etapa, ultima_atividade: agora() }).eq("id", id)
  revalidatePath("/app/pipeline")
}

export async function criarDeal(fd: FormData) {
  const supabase = await createClient()
  const titulo = s(fd, "titulo")
  const cliente_id = s(fd, "cliente_id")
  if (!titulo || !cliente_id) return
  await supabase.from("deals").insert({ titulo, cliente_id, valor: num(fd, "valor") ?? 0, etapa: s(fd, "etapa") ?? "novo", probabilidade: Number(s(fd, "probabilidade") ?? "0") || 0, fechamento_esperado: s(fd, "fechamento_esperado"), responsavel: s(fd, "responsavel") })
  revalidatePath("/app/pipeline")
  redirect("/app/pipeline")
}

// ---------- Faturas ----------
export async function marcarFatura(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "fatura_id")
  const status = s(fd, "status")
  if (!id || !status) return
  const patch: Record<string, unknown> = { status }
  if (status === "paga") patch.pago_em = hoje()
  if (status === "enviada") patch.emitida_em = hoje()
  await supabase.from("faturas").update(patch).eq("id", id)
  revalidatePath("/app/financeiro")
  revalidatePath("/app/cobranca")
}

export async function criarFatura(fd: FormData) {
  const supabase = await createClient()
  const descricao = s(fd, "descricao")
  const cliente_id = s(fd, "cliente_id")
  const vencimento = s(fd, "vencimento")
  if (!descricao || !cliente_id || !vencimento) return
  await supabase.from("faturas").insert({ descricao, cliente_id, projeto_id: s(fd, "projeto_id"), valor: num(fd, "valor") ?? 0, status: s(fd, "status") ?? "rascunho", vencimento, emitida_em: s(fd, "emitida_em") })
  revalidatePath("/app/financeiro")
  revalidatePath("/app/cobranca")
  redirect("/app/financeiro")
}

// ---------- Contas a pagar / despesas ----------
export async function pagarConta(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "conta_id")
  if (!id) return
  await supabase.from("contas_a_pagar").update({ pago_em: hoje() }).eq("id", id)
  revalidatePath("/app/financeiro")
}

export async function criarDespesa(fd: FormData) {
  const supabase = await createClient()
  const descricao = s(fd, "descricao")
  if (!descricao) return
  await supabase.from("despesas").insert({ descricao, categoria: s(fd, "categoria") ?? "outros", valor: num(fd, "valor") ?? 0, data: s(fd, "data") ?? hoje(), recorrente: s(fd, "recorrente") === "on" })
  revalidatePath("/app/financeiro")
  redirect("/app/financeiro")
}

// ---------- Projeto: tarefas e marcos ----------
export async function moverTarefa(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "tarefa_id")
  const status = s(fd, "status")
  if (!id || !status) return
  await supabase.from("tarefas").update({ status }).eq("id", id)
  const pid = s(fd, "projeto_id")
  if (pid) revalidatePath(`/app/projetos/${pid}`)
}

export async function criarTarefa(fd: FormData) {
  const supabase = await createClient()
  const titulo = s(fd, "titulo")
  const projeto_id = s(fd, "projeto_id")
  if (!titulo || !projeto_id) return
  await supabase.from("tarefas").insert({ titulo, projeto_id, status: "todo", responsavel: s(fd, "responsavel") })
  revalidatePath(`/app/projetos/${projeto_id}`)
}

export async function toggleMarco(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "marco_id")
  if (!id) return
  const concluido = s(fd, "concluido") === "true"
  await supabase.from("marcos").update({ concluido: !concluido }).eq("id", id)
  const pid = s(fd, "projeto_id")
  if (pid) revalidatePath(`/app/projetos/${pid}`)
}

export async function criarMarco(fd: FormData) {
  const supabase = await createClient()
  const titulo = s(fd, "titulo")
  const projeto_id = s(fd, "projeto_id")
  const data = s(fd, "data")
  if (!titulo || !projeto_id || !data) return
  await supabase.from("marcos").insert({ titulo, projeto_id, data, concluido: false })
  revalidatePath(`/app/projetos/${projeto_id}`)
}

// ---------- Edição ----------
export async function editarCliente(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "id")
  const nome = s(fd, "nome")
  if (!id || !nome) return
  await supabase.from("clientes").update({ nome, cnpj: s(fd, "cnpj"), segmento: s(fd, "segmento"), status: s(fd, "status") ?? "lead", origem: s(fd, "origem"), observacoes: s(fd, "observacoes") }).eq("id", id)
  revalidatePath("/app/clientes")
  revalidatePath(`/app/clientes/${id}`)
  redirect(`/app/clientes/${id}`)
}

export async function editarProjeto(fd: FormData) {
  const supabase = await createClient()
  const id = s(fd, "id")
  const nome = s(fd, "nome")
  if (!id || !nome) return
  await supabase.from("projetos").update({ nome, tipo: s(fd, "tipo") ?? "one_off", valor: num(fd, "valor"), custo: num(fd, "custo"), status: s(fd, "status") ?? "proposta", data_inicio: s(fd, "data_inicio"), descricao: s(fd, "descricao") }).eq("id", id)
  revalidatePath("/app/projetos")
  revalidatePath(`/app/projetos/${id}`)
  redirect(`/app/projetos/${id}`)
}
