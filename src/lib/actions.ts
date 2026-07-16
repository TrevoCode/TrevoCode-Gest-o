"use server"

import { requireMembro } from "@/lib/auth/guard"
import { hojeISO } from "@/lib/datas"
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
  const supabase = await requireMembro()
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
  const supabase = await requireMembro()
  const nome = s(fd, "nome")
  const cliente_id = s(fd, "cliente_id")
  if (!nome || !cliente_id) return
  const { data, error } = await supabase
    .from("projetos")
    .insert({ nome, cliente_id, tipo: s(fd, "tipo") ?? "one_off", valor: num(fd, "valor"), valor_setup: num(fd, "valor_setup"), custo: num(fd, "custo"), status: s(fd, "status") ?? "proposta", data_inicio: s(fd, "data_inicio"), descricao: s(fd, "descricao") })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  revalidatePath("/app/projetos")
  redirect(`/app/projetos/${data.id}`)
}

export async function criarReuniao(fd: FormData) {
  const supabase = await requireMembro()
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
  const supabase = await requireMembro()
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
  const supabase = await requireMembro()
  const id = s(fd, "solicitacao_id")
  const status = s(fd, "status")
  if (!id || !status) return
  await supabase.from("solicitacoes_despesa").update({ status }).eq("id", id)
  revalidatePath("/app/planejamento")
}

const hoje = hojeISO // fuso da empresa (America/Sao_Paulo) — ver src/lib/datas.ts
const agora = () => new Date().toISOString()

// ---------- Pipeline ----------
export async function moverDeal(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "deal_id")
  const etapa = s(fd, "etapa")
  if (!id || !etapa) return
  await supabase.from("deals").update({ etapa, ultima_atividade: agora() }).eq("id", id)
  revalidatePath("/app/pipeline")
}

export async function criarDeal(fd: FormData) {
  const supabase = await requireMembro()
  const titulo = s(fd, "titulo")
  const cliente_id = s(fd, "cliente_id")
  if (!titulo || !cliente_id) return
  await supabase.from("deals").insert({ titulo, cliente_id, valor: num(fd, "valor") ?? 0, etapa: s(fd, "etapa") ?? "novo", probabilidade: Number(s(fd, "probabilidade") ?? "0") || 0, fechamento_esperado: s(fd, "fechamento_esperado"), responsavel: s(fd, "responsavel") })
  revalidatePath("/app/pipeline")
  redirect("/app/pipeline")
}

// ---------- Faturas ----------
export async function marcarFatura(fd: FormData) {
  const supabase = await requireMembro()
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
  const supabase = await requireMembro()
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
  const supabase = await requireMembro()
  const id = s(fd, "conta_id")
  if (!id) return
  await supabase.from("contas_a_pagar").update({ pago_em: hoje() }).eq("id", id)
  revalidatePath("/app/financeiro")
}

export async function criarDespesa(fd: FormData) {
  const supabase = await requireMembro()
  const descricao = s(fd, "descricao")
  if (!descricao) return
  await supabase.from("despesas").insert({ descricao, categoria: s(fd, "categoria") ?? "outros", valor: num(fd, "valor") ?? 0, data: s(fd, "data") ?? hoje(), recorrente: s(fd, "recorrente") === "on" })
  revalidatePath("/app/financeiro")
  redirect("/app/financeiro")
}

// ---------- Projeto: tarefas e marcos ----------
export async function moverTarefa(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "tarefa_id")
  const status = s(fd, "status")
  if (!id || !status) return
  await supabase.from("tarefas").update({ status }).eq("id", id)
  const pid = s(fd, "projeto_id")
  if (pid) revalidatePath(`/app/projetos/${pid}`)
}

export async function criarTarefa(fd: FormData) {
  const supabase = await requireMembro()
  const titulo = s(fd, "titulo")
  const projeto_id = s(fd, "projeto_id")
  if (!titulo || !projeto_id) return
  await supabase.from("tarefas").insert({ titulo, projeto_id, status: "todo", responsavel: s(fd, "responsavel") })
  revalidatePath(`/app/projetos/${projeto_id}`)
}

export async function toggleMarco(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "marco_id")
  if (!id) return
  const concluido = s(fd, "concluido") === "true"
  await supabase.from("marcos").update({ concluido: !concluido }).eq("id", id)
  const pid = s(fd, "projeto_id")
  if (pid) revalidatePath(`/app/projetos/${pid}`)
}

export async function criarMarco(fd: FormData) {
  const supabase = await requireMembro()
  const titulo = s(fd, "titulo")
  const projeto_id = s(fd, "projeto_id")
  const data = s(fd, "data")
  if (!titulo || !projeto_id || !data) return
  await supabase.from("marcos").insert({ titulo, projeto_id, data, concluido: false })
  revalidatePath(`/app/projetos/${projeto_id}`)
}

// ---------- Edição ----------
export async function editarCliente(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  const nome = s(fd, "nome")
  if (!id || !nome) return
  await supabase.from("clientes").update({ nome, cnpj: s(fd, "cnpj"), segmento: s(fd, "segmento"), status: s(fd, "status") ?? "lead", origem: s(fd, "origem"), observacoes: s(fd, "observacoes") }).eq("id", id)
  revalidatePath("/app/clientes")
  revalidatePath(`/app/clientes/${id}`)
  redirect(`/app/clientes/${id}`)
}

export async function editarProjeto(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  const nome = s(fd, "nome")
  if (!id || !nome) return
  await supabase.from("projetos").update({ nome, tipo: s(fd, "tipo") ?? "one_off", valor: num(fd, "valor"), valor_setup: num(fd, "valor_setup"), custo: num(fd, "custo"), status: s(fd, "status") ?? "proposta", data_inicio: s(fd, "data_inicio"), descricao: s(fd, "descricao") }).eq("id", id)
  revalidatePath("/app/projetos")
  revalidatePath(`/app/projetos/${id}`)
  redirect(`/app/projetos/${id}`)
}

// ---------- Propostas ----------
// Itens: uma linha por item, formato "descrição | valor".
function parseItens(raw: string | null): { descricao: string; valor: number }[] {
  if (!raw) return []
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [desc, val] = l.split("|")
      return {
        descricao: (desc ?? l).trim(),
        valor: Number((val ?? "").replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".")) || 0,
      }
    })
}

export async function criarProposta(fd: FormData) {
  const supabase = await requireMembro()
  const titulo = s(fd, "titulo")
  const cliente_id = s(fd, "cliente_id")
  if (!titulo || !cliente_id) return
  const { data } = await supabase
    .from("propostas")
    .insert({ titulo, cliente_id, itens: parseItens(s(fd, "itens")), status: "rascunho", validade: s(fd, "validade") })
    .select("id")
    .single()
  revalidatePath("/app/propostas")
  redirect(data ? `/app/propostas/${data.id}` : "/app/propostas")
}

export async function mudarStatusProposta(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "proposta_id")
  const status = s(fd, "status")
  if (!id || !status) return
  const patch: Record<string, unknown> = { status }
  if (status === "enviada") patch.enviada_em = hoje()
  await supabase.from("propostas").update(patch).eq("id", id)
  revalidatePath("/app/propostas")
  revalidatePath(`/app/propostas/${id}`)
}

export async function gerarContrato(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "proposta_id")
  if (!id) return
  const { data: prop } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle()
  if (!prop) return
  const itens = (Array.isArray(prop.itens) ? prop.itens : []) as { valor?: number }[]
  const total = itens.reduce((sum, it) => sum + (Number(it?.valor) || 0), 0)
  const { data: c } = await supabase
    .from("contratos")
    .insert({ cliente_id: prop.cliente_id, titulo: prop.titulo, valor: total, tipo: "projeto", status: "rascunho" })
    .select("id")
    .single()
  revalidatePath("/app/contratos")
  redirect(c ? "/app/contratos" : `/app/propostas/${id}`)
}

// ---------- Contratos ----------
export async function mudarStatusContrato(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "contrato_id")
  const status = s(fd, "status")
  if (!id || !status) return
  const patch: Record<string, unknown> = { status }
  if (status === "assinado") patch.assinado_em = hoje()
  await supabase.from("contratos").update(patch).eq("id", id)
  revalidatePath("/app/contratos")
}

// ---------- Configurações ----------
export async function salvarEmpresa(fd: FormData) {
  const supabase = await requireMembro()
  await supabase.from("config_empresa").upsert({
    id: 1,
    razao_social: s(fd, "razao_social"),
    nome_fantasia: s(fd, "nome_fantasia"),
    cnpj: s(fd, "cnpj"),
    regime: s(fd, "regime"),
    email: s(fd, "email"),
    endereco: s(fd, "endereco"),
    saldo_caixa: num(fd, "saldo_caixa") ?? 0,
  })
  revalidatePath("/app/config")
  revalidatePath("/app/financeiro")
}

export async function alterarSenha(fd: FormData) {
  const supabase = await requireMembro()
  const atual = s(fd, "senha_atual")
  const nova = s(fd, "senha")
  if (!atual || !nova || nova.length < 8) return
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return
  // Reautentica com a senha atual antes de trocar (evita troca por sessão sequestrada).
  const { error: reauth } = await supabase.auth.signInWithPassword({ email: user.email, password: atual })
  if (reauth) throw new Error("Senha atual incorreta.")
  await supabase.auth.updateUser({ password: nova })
  revalidatePath("/app/config")
}

// ---------- Reuniões ----------
export async function atualizarReuniao(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  const patch: Record<string, unknown> = {}
  for (const k of ["status", "titulo", "tipo", "cliente_id", "notas", "follow_up", "data_hora"]) {
    if (fd.has(k)) patch[k] = s(fd, k)
  }
  if (Object.keys(patch).length === 0) return
  await supabase.from("reunioes").update(patch).eq("id", id)
  revalidatePath("/app/reunioes")
  const back = s(fd, "back")
  // destino vem do form — só aceita caminho interno (anti open-redirect)
  if (back && back.startsWith("/app")) redirect(back)
}

// ---------- Metas (planejamento) ----------
export async function salvarMeta(fd: FormData) {
  const supabase = await requireMembro()
  const payload = {
    receita_meta: num(fd, "receita_meta") ?? 0,
    despesa_meta: num(fd, "despesa_meta") ?? 0,
    mrr_meta: num(fd, "mrr_meta") ?? 0,
  }
  const { data: existing } = await supabase.from("metas").select("id").limit(1).maybeSingle()
  if (existing) await supabase.from("metas").update(payload).eq("id", existing.id)
  else await supabase.from("metas").insert(payload)
  revalidatePath("/app/planejamento")
}

// ---------- Exclusão (whitelist de tabelas; RLS já restringe a membros) ----------
const TABELAS_EXCLUIVEIS = new Set([
  "clientes", "projetos", "deals", "propostas", "contratos", "reunioes",
  "leads", "despesas", "membros", "tarefas", "marcos", "faturas",
  "contas_a_pagar", "solicitacoes_despesa", "contatos",
])
export async function excluirRegistro(fd: FormData) {
  const supabase = await requireMembro()
  const tabela = s(fd, "tabela")
  const id = s(fd, "id")
  if (!tabela || !id || !TABELAS_EXCLUIVEIS.has(tabela)) return
  const { error } = await supabase.from(tabela).delete().eq("id", id)
  if (error) throw new Error(error.message)
  const from = s(fd, "from")
  // destino vem do form — só aceita caminho interno (anti open-redirect)
  if (from && from.startsWith("/app")) {
    revalidatePath(from)
    redirect(from)
  }
}

export async function mudarStatusLead(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "lead_id")
  const status = s(fd, "status")
  if (!id || !status) return
  await supabase.from("leads").update({ status }).eq("id", id)
  revalidatePath("/app/leads")
}

// ---------- Edições (Fase 2) ----------
export async function editarDeal(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("deals").update({
    titulo: s(fd, "titulo"),
    valor: num(fd, "valor") ?? 0,
    probabilidade: Number(s(fd, "probabilidade") ?? "0") || 0,
    etapa: s(fd, "etapa") ?? "novo",
    fechamento_esperado: s(fd, "fechamento_esperado"),
    responsavel: s(fd, "responsavel"),
  }).eq("id", id)
  revalidatePath("/app/pipeline")
  redirect("/app/pipeline")
}

export async function editarFatura(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("faturas").update({
    descricao: s(fd, "descricao"),
    cliente_id: s(fd, "cliente_id"),
    valor: num(fd, "valor") ?? 0,
    status: s(fd, "status") ?? "rascunho",
    vencimento: s(fd, "vencimento"),
  }).eq("id", id)
  revalidatePath("/app/financeiro")
  revalidatePath("/app/cobranca")
  redirect("/app/financeiro")
}

export async function editarDespesa(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("despesas").update({
    descricao: s(fd, "descricao"),
    categoria: s(fd, "categoria") ?? "outros",
    valor: num(fd, "valor") ?? 0,
    data: s(fd, "data"),
    recorrente: s(fd, "recorrente") === "on",
  }).eq("id", id)
  revalidatePath("/app/financeiro")
  redirect("/app/financeiro")
}

export async function editarMembro(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("membros").update({
    nome: s(fd, "nome"),
    papel: s(fd, "papel"),
    capacidade_semanal: Number(s(fd, "capacidade_semanal") ?? "40") || 40,
    custo_hora: num(fd, "custo_hora") ?? 0,
  }).eq("id", id)
  revalidatePath("/app/equipe")
  redirect("/app/equipe")
}

export async function editarLead(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("leads").update({
    nome: s(fd, "nome"),
    email: s(fd, "email"),
    telefone: s(fd, "telefone"),
    empresa: s(fd, "empresa"),
    mensagem: s(fd, "mensagem"),
    status: s(fd, "status") ?? "novo",
    melhor_canal: s(fd, "melhor_canal"),
    melhor_horario: s(fd, "melhor_horario"),
  }).eq("id", id)
  revalidatePath("/app/leads")
  redirect("/app/leads")
}

// ---------- Contatos do cliente (Fase 2) ----------
export async function criarContato(fd: FormData) {
  const supabase = await requireMembro()
  const cliente_id = s(fd, "cliente_id")
  const nome = s(fd, "nome")
  if (!cliente_id || !nome) return
  await supabase.from("contatos").insert({
    cliente_id, nome, email: s(fd, "email"), telefone: s(fd, "telefone"),
    cargo: s(fd, "cargo"), principal: s(fd, "principal") === "on",
  })
  revalidatePath(`/app/clientes/${cliente_id}`)
}

export async function excluirContato(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  const cliente_id = s(fd, "cliente_id")
  if (!id) return
  await supabase.from("contatos").delete().eq("id", id)
  if (cliente_id) revalidatePath(`/app/clientes/${cliente_id}`)
}

// ---------- Equipe ----------
export async function criarMembro(fd: FormData) {
  const supabase = await requireMembro()
  const nome = s(fd, "nome")
  if (!nome) return
  await supabase.from("membros").insert({
    nome,
    papel: s(fd, "papel"),
    capacidade_semanal: Number(s(fd, "capacidade_semanal") ?? "40") || 40,
    custo_hora: num(fd, "custo_hora") ?? 0,
  })
  revalidatePath("/app/equipe")
  redirect("/app/equipe")
}

// ---------- Solicitações de despesa (o time pede; sócios aprovam no Planejamento) ----------
export async function criarSolicitacao(fd: FormData) {
  const supabase = await requireMembro()
  const descricao = s(fd, "descricao")
  if (!descricao) return
  await supabase.from("solicitacoes_despesa").insert({
    descricao,
    categoria: s(fd, "categoria") ?? "outros",
    valor: num(fd, "valor") ?? 0,
    solicitante: s(fd, "solicitante"),
    data: s(fd, "data") ?? hoje(),
  })
  revalidatePath("/app/planejamento")
  redirect("/app/planejamento")
}

// ---------- Contas a pagar (antes só dava pra marcar como paga — faltava cadastrar) ----------
export async function criarContaPagar(fd: FormData) {
  const supabase = await requireMembro()
  const descricao = s(fd, "descricao")
  if (!descricao) return
  await supabase.from("contas_a_pagar").insert({
    descricao,
    categoria: s(fd, "categoria") ?? "outros",
    valor: num(fd, "valor") ?? 0,
    vencimento: s(fd, "vencimento") ?? hoje(),
    recorrente: s(fd, "recorrente") === "on",
  })
  revalidatePath("/app/financeiro")
  redirect("/app/financeiro")
}

// ---------- Contratos (faltava edição) ----------
export async function editarContrato(fd: FormData) {
  const supabase = await requireMembro()
  const id = s(fd, "id")
  if (!id) return
  await supabase.from("contratos").update({
    titulo: s(fd, "titulo"),
    valor: num(fd, "valor") ?? 0,
    tipo: s(fd, "tipo") ?? "projeto",
    vigencia_inicio: s(fd, "vigencia_inicio") || null,
    vigencia_fim: s(fd, "vigencia_fim") || null,
  }).eq("id", id)
  revalidatePath("/app/contratos")
  redirect("/app/contratos")
}

// ---------- Lead manual (indicação, evento, contato direto — não só o formulário do site) ----------
export async function criarLead(fd: FormData) {
  const supabase = await requireMembro()
  const nome = s(fd, "nome")
  if (!nome) return
  await supabase.from("leads").insert({
    nome,
    email: s(fd, "email"),
    telefone: s(fd, "telefone"),
    empresa: s(fd, "empresa"),
    mensagem: s(fd, "mensagem"),
    melhor_canal: s(fd, "melhor_canal"),
    melhor_horario: s(fd, "melhor_horario"),
    status: s(fd, "status") ?? "novo",
  })
  revalidatePath("/app/leads")
  redirect("/app/leads")
}
