// ─────────────────────────────────────────────────────────────────────────
// Camada de acesso a dados — ÚNICO ponto que conhece a origem dos dados.
// Agora lê do Supabase (RLS: usuário autenticado). As telas não mudam.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server"
import type {
  Cliente, Contato, Projeto, Reuniao, Lead, Fatura, Despesa, Deal, DealEtapa,
  ContaPagar, Proposta, Atividade, Tarefa, Membro, Marco, SolicitacaoDespesa, Contrato,
} from "@/lib/db/types"

const DIA = 86_400_000
const hojeISO = () => new Date().toISOString().slice(0, 10)
const agoraISO = () => new Date().toISOString()
const db = () => createClient()

async function mapaClientes(): Promise<Map<string, string>> {
  const supabase = await db()
  const { data } = await supabase.from("clientes").select("id, nome")
  return new Map((data ?? []).map((c) => [c.id as string, c.nome as string]))
}
const nome = (m: Map<string, string>, id: string | null) => (id ? m.get(id) ?? null : null)

// ───────────────────────── tipos de view ─────────────────────────
export type ClienteResumo = Cliente & { projetosAtivos: number; receitaRecorrente: number }
export type ClienteDetalhe = Cliente & { contatos: Contato[]; projetos: Projeto[]; reunioes: Reuniao[] }
export type ProjetoComCliente = Projeto & { clienteNome: string }
export type ReuniaoComCliente = Reuniao & { clienteNome: string | null }

// ───────────────────────── clientes ─────────────────────────
export async function listarClientes(opts?: { status?: Cliente["status"]; busca?: string }): Promise<ClienteResumo[]> {
  const supabase = await db()
  let query = supabase.from("clientes").select("*").order("nome")
  if (opts?.status) query = query.eq("status", opts.status)
  if (opts?.busca) query = query.or(`nome.ilike.%${opts.busca}%,segmento.ilike.%${opts.busca}%`)
  const [{ data: clientes }, { data: projetos }] = await Promise.all([
    query,
    supabase.from("projetos").select("cliente_id, tipo, status, valor"),
  ])
  return (clientes ?? []).map((c) => {
    const ps = (projetos ?? []).filter((p) => p.cliente_id === c.id)
    return {
      ...(c as Cliente),
      projetosAtivos: ps.filter((p) => p.status === "ativo").length,
      receitaRecorrente: ps.filter((p) => p.tipo === "recorrente" && p.status === "ativo").reduce((s, p) => s + (p.valor ?? 0), 0),
    }
  })
}

export async function obterCliente(id: string): Promise<ClienteDetalhe | null> {
  const supabase = await db()
  const { data: c } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle()
  if (!c) return null
  const [{ data: contatos }, { data: projetos }, { data: reunioes }] = await Promise.all([
    supabase.from("contatos").select("*").eq("cliente_id", id),
    supabase.from("projetos").select("*").eq("cliente_id", id),
    supabase.from("reunioes").select("*").eq("cliente_id", id).order("data_hora", { ascending: false }),
  ])
  return { ...(c as Cliente), contatos: (contatos ?? []) as Contato[], projetos: (projetos ?? []) as Projeto[], reunioes: (reunioes ?? []) as Reuniao[] }
}

export async function listarLeads(): Promise<Lead[]> {
  const supabase = await db()
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false })
  return (data ?? []) as Lead[]
}

export async function listarProjetos(): Promise<ProjetoComCliente[]> {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("projetos").select("*").order("created_at", { ascending: false }), mapaClientes()])
  return (data ?? []).map((p) => ({ ...(p as Projeto), clienteNome: nome(mapa, p.cliente_id) ?? "—" }))
}

export async function listarReunioes(): Promise<ReuniaoComCliente[]> {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("reunioes").select("*").order("data_hora"), mapaClientes()])
  return (data ?? []).map((r) => ({ ...(r as Reuniao), clienteNome: nome(mapa, r.cliente_id) }))
}

// ───────────────────────── dashboard ─────────────────────────
export async function obterDashboard() {
  const supabase = await db()
  const [{ data: clientes }, { data: projetos }, { data: leads }, { data: reunioes }, mapa] = await Promise.all([
    supabase.from("clientes").select("status"),
    supabase.from("projetos").select("tipo, status, valor"),
    supabase.from("leads").select("*"),
    supabase.from("reunioes").select("*"),
    mapaClientes(),
  ])
  const proximas = (reunioes ?? [])
    .filter((r) => r.status === "agendada" && r.data_hora >= agoraISO())
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .slice(0, 5)
    .map((r) => ({ ...(r as Reuniao), clienteNome: nome(mapa, r.cliente_id) }))
  return {
    kpis: {
      leadsNovos: (leads ?? []).filter((l) => l.status === "novo").length,
      clientesAtivos: (clientes ?? []).filter((c) => c.status === "ativo").length,
      projetosAtivos: (projetos ?? []).filter((p) => p.status === "ativo").length,
      reunioesProximas: proximas.length,
      recorrenteMensal: (projetos ?? []).filter((p) => p.tipo === "recorrente" && p.status === "ativo").reduce((s, p) => s + (p.valor ?? 0), 0),
    },
    proximasReunioes: proximas,
    leadsRecentes: [...(leads ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4) as Lead[],
  }
}

// ───────────────────────── financeiro ─────────────────────────
export type FaturaComCliente = Fatura & { clienteNome: string }
const noMes = (d: string | null) => !!d && d.slice(0, 7) === new Date().toISOString().slice(0, 7)
const CATS = ["ferramentas", "infraestrutura", "salarios", "marketing", "impostos", "outros"] as const

export async function listarFaturas(): Promise<FaturaComCliente[]> {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("faturas").select("*"), mapaClientes()])
  return (data ?? [])
    .sort((a, b) => (b.emitida_em ?? b.created_at).localeCompare(a.emitida_em ?? a.created_at))
    .map((f) => ({ ...(f as Fatura), clienteNome: nome(mapa, f.cliente_id) ?? "—" }))
}

export async function listarDespesas(): Promise<Despesa[]> {
  const supabase = await db()
  const { data } = await supabase.from("despesas").select("*").order("data", { ascending: false })
  return (data ?? []) as Despesa[]
}

export async function obterFinanceiro() {
  const supabase = await db()
  const [faturas, despesas] = await Promise.all([listarFaturas(), listarDespesas()])
  const aReceber = faturas.filter((f) => f.status === "enviada" || f.status === "atrasada").reduce((s, f) => s + f.valor, 0)
  const atrasado = faturas.filter((f) => f.status === "atrasada").reduce((s, f) => s + f.valor, 0)
  const recebidoMes = faturas.filter((f) => f.status === "paga" && noMes(f.pago_em)).reduce((s, f) => s + f.valor, 0)
  const despesasMes = despesas.filter((d) => noMes(d.data)).reduce((s, d) => s + d.valor, 0)
  const porCategoria = CATS.map((cat) => ({ categoria: cat, total: despesas.filter((d) => noMes(d.data) && d.categoria === cat).reduce((s, d) => s + d.valor, 0) })).filter((c) => c.total > 0)
  void supabase
  return { kpis: { aReceber, atrasado, recebidoMes, despesasMes, resultadoMes: recebidoMes - despesasMes }, faturas, despesas, porCategoria }
}

// ───────────────────────── pipeline ─────────────────────────
export type DealView = Deal & { clienteNome: string; diasParado: number }
const ETAPAS: { etapa: DealEtapa; label: string }[] = [
  { etapa: "novo", label: "Novo" }, { etapa: "qualificacao", label: "Qualificação" },
  { etapa: "proposta", label: "Proposta" }, { etapa: "negociacao", label: "Negociação" }, { etapa: "ganho", label: "Ganho" },
]
function dealView(d: Deal, mapa: Map<string, string>): DealView {
  return { ...d, clienteNome: nome(mapa, d.cliente_id) ?? "—", diasParado: Math.floor((Date.now() - new Date(d.ultima_atividade).getTime()) / DIA) }
}

export async function obterPipeline() {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("deals").select("*"), mapaClientes()])
  const deals = (data ?? []) as Deal[]
  const colunas = ETAPAS.map(({ etapa, label }) => {
    const items = deals.filter((d) => d.etapa === etapa).map((d) => dealView(d, mapa))
    return { etapa, label, items, total: items.reduce((s, d) => s + d.valor, 0) }
  })
  const emAberto = deals.filter((d) => d.etapa !== "ganho" && d.etapa !== "perdido")
  return {
    colunas,
    totalAberto: emAberto.reduce((s, d) => s + d.valor, 0),
    ponderado: Math.round(emAberto.reduce((s, d) => s + d.valor * (d.probabilidade / 100), 0)),
    ganhoMes: deals.filter((d) => d.etapa === "ganho").reduce((s, d) => s + d.valor, 0),
    emAberto: emAberto.length,
  }
}

export async function obterForecast() {
  const supabase = await db()
  const { data } = await supabase.from("deals").select("etapa, valor, probabilidade, fechamento_esperado")
  const emAberto = (data ?? []).filter((d) => d.etapa !== "ganho" && d.etapa !== "perdido")
  const meses = new Map<string, { valor: number; ponderado: number; n: number }>()
  for (const d of emAberto) {
    const mes = (d.fechamento_esperado ?? hojeISO()).slice(0, 7)
    const cur = meses.get(mes) ?? { valor: 0, ponderado: 0, n: 0 }
    cur.valor += d.valor; cur.ponderado += d.valor * (d.probabilidade / 100); cur.n += 1
    meses.set(mes, cur)
  }
  return [...meses.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([mes, v]) => ({ mes, valor: v.valor, ponderado: Math.round(v.ponderado), n: v.n }))
}

// ───────────────────────── contas a pagar + fluxo ─────────────────────────
export type ContaPagarView = ContaPagar & { situacao: "a_vencer" | "vencida" | "paga" }
function situacao(c: ContaPagar): ContaPagarView["situacao"] {
  if (c.pago_em) return "paga"
  return c.vencimento < hojeISO() ? "vencida" : "a_vencer"
}
export async function listarContasPagar(): Promise<ContaPagarView[]> {
  const supabase = await db()
  const { data } = await supabase.from("contas_a_pagar").select("*").order("vencimento")
  return (data ?? []).map((c) => ({ ...(c as ContaPagar), situacao: situacao(c as ContaPagar) }))
}

export type SemanaFluxo = { label: string; entradas: number; saidas: number; saldo: number }
export async function obterFluxoProjetado(saldoInicial = 28500, semanas = 6) {
  const supabase = await db()
  const [{ data: faturas }, { data: contas }] = await Promise.all([
    supabase.from("faturas").select("status, vencimento, valor"),
    supabase.from("contas_a_pagar").select("vencimento, valor, pago_em"),
  ])
  const entradas = (faturas ?? []).filter((f) => f.status === "enviada" || f.status === "atrasada").map((f) => ({ data: f.vencimento, valor: f.valor }))
  const saidas = (contas ?? []).filter((c) => !c.pago_em).map((c) => ({ data: c.vencimento, valor: c.valor }))
  const soma = (arr: { data: string; valor: number }[], ini: string, fim: string) => arr.filter((x) => x.data >= ini && x.data < fim).reduce((s, x) => s + x.valor, 0)
  const base = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  let saldo = saldoInicial
  const linha: SemanaFluxo[] = []
  for (let i = 0; i < semanas; i++) {
    const ini = new Date(base + i * 7 * DIA).toISOString().slice(0, 10)
    const fim = new Date(base + (i + 1) * 7 * DIA).toISOString().slice(0, 10)
    const e = soma(entradas, ini, fim); const s = soma(saidas, ini, fim)
    saldo += e - s
    linha.push({ label: `Sem ${i + 1}`, entradas: e, saidas: s, saldo })
  }
  return { saldoInicial, linha }
}

// ───────────────────────── propostas ─────────────────────────
export type PropostaView = Proposta & { clienteNome: string; total: number }
const totalProposta = (p: Proposta) => p.itens.reduce((s, i) => s + i.valor, 0)

export async function listarPropostas(): Promise<PropostaView[]> {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("propostas").select("*"), mapaClientes()])
  return (data ?? [])
    .sort((a, b) => (b.enviada_em ?? b.created_at).localeCompare(a.enviada_em ?? a.created_at))
    .map((p) => ({ ...(p as Proposta), clienteNome: nome(mapa, p.cliente_id) ?? "—", total: totalProposta(p as Proposta) }))
}

export async function obterProposta(id: string): Promise<PropostaView | null> {
  const supabase = await db()
  const { data: p } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle()
  if (!p) return null
  const mapa = await mapaClientes()
  return { ...(p as Proposta), clienteNome: nome(mapa, p.cliente_id) ?? "—", total: totalProposta(p as Proposta) }
}

// ───────────────────────── timeline ─────────────────────────
const aoMeioDia = (d: string) => `${d}T12:00:00.000Z`
export async function montarTimeline(clienteId: string): Promise<Atividade[]> {
  const supabase = await db()
  const [{ data: reunioes }, { data: propostas }, { data: faturas }] = await Promise.all([
    supabase.from("reunioes").select("*").eq("cliente_id", clienteId),
    supabase.from("propostas").select("*").eq("cliente_id", clienteId),
    supabase.from("faturas").select("*").eq("cliente_id", clienteId),
  ])
  const itens: Atividade[] = []
  ;(reunioes ?? []).forEach((r) => itens.push({ id: `r-${r.id}`, cliente_id: clienteId, tipo: "reuniao", descricao: `${r.status === "realizada" ? "Reunião realizada" : "Reunião agendada"}: ${r.titulo}`, data: r.data_hora }))
  ;(propostas ?? []).filter((p) => p.enviada_em).forEach((p) => itens.push({ id: `p-${p.id}`, cliente_id: clienteId, tipo: "proposta", descricao: `Proposta ${p.status}: ${p.titulo}`, data: aoMeioDia(p.enviada_em) }))
  ;(faturas ?? []).filter((f) => f.emitida_em).forEach((f) => itens.push({ id: `f-${f.id}`, cliente_id: clienteId, tipo: "fatura", descricao: `Fatura ${f.status}: ${f.descricao}`, data: aoMeioDia(f.emitida_em) }))
  return itens.sort((a, b) => b.data.localeCompare(a.data))
}

// ───────────────────────── projeto (detalhe) ─────────────────────────
export type ProjetoDetalhe = Projeto & { clienteNome: string; tarefas: Tarefa[]; margem: number | null; margemPct: number | null }
export async function obterProjeto(id: string): Promise<ProjetoDetalhe | null> {
  const supabase = await db()
  const { data: p } = await supabase.from("projetos").select("*").eq("id", id).maybeSingle()
  if (!p) return null
  const [{ data: tarefas }, mapa] = await Promise.all([supabase.from("tarefas").select("*").eq("projeto_id", id), mapaClientes()])
  const proj = p as Projeto
  const margem = proj.valor != null && proj.custo != null ? proj.valor - proj.custo : null
  const margemPct = margem != null && proj.valor ? Math.round((margem / proj.valor) * 100) : null
  return { ...proj, clienteNome: nome(mapa, proj.cliente_id) ?? "—", tarefas: (tarefas ?? []) as Tarefa[], margem, margemPct }
}

export async function listarMarcos(projetoId: string): Promise<Marco[]> {
  const supabase = await db()
  const { data } = await supabase.from("marcos").select("*").eq("projeto_id", projetoId).order("data")
  return (data ?? []) as Marco[]
}

// ───────────────────────── relatórios ─────────────────────────
export async function obterDRE() {
  const supabase = await db()
  const [{ data: faturas }, { data: despesas }] = await Promise.all([
    supabase.from("faturas").select("status, pago_em, valor"),
    supabase.from("despesas").select("categoria, data, valor"),
  ])
  const receita = (faturas ?? []).filter((f) => f.status === "paga" && noMes(f.pago_em)).reduce((s, f) => s + f.valor, 0)
  const custos = CATS.map((cat) => ({ categoria: cat, total: (despesas ?? []).filter((d) => noMes(d.data) && d.categoria === cat).reduce((s, d) => s + d.valor, 0) })).filter((c) => c.total > 0)
  const totalCustos = custos.reduce((s, c) => s + c.total, 0)
  const resultado = receita - totalCustos
  return { receita, custos, totalCustos, resultado, margem: receita ? Math.round((resultado / receita) * 100) : 0 }
}

export async function obterRecorrencias() {
  const supabase = await db()
  const [{ data: projetos }, { data: despesas }, mapa] = await Promise.all([
    supabase.from("projetos").select("nome, tipo, status, valor, cliente_id"),
    supabase.from("despesas").select("descricao, categoria, valor, recorrente"),
    mapaClientes(),
  ])
  const receitas = (projetos ?? []).filter((p) => p.tipo === "recorrente" && p.status === "ativo").map((p) => ({ nome: p.nome, cliente: nome(mapa, p.cliente_id) ?? "—", valor: p.valor ?? 0 }))
  const custos = (despesas ?? []).filter((d) => d.recorrente).map((d) => ({ nome: d.descricao, categoria: d.categoria, valor: d.valor }))
  const mrr = receitas.reduce((s, r) => s + r.valor, 0)
  const custoFixo = custos.reduce((s, c) => s + c.valor, 0)
  return { mrr, custoFixo, resultadoRecorrente: mrr - custoFixo, receitas, custos }
}

export async function obterFunilVendas() {
  const supabase = await db()
  const { data } = await supabase.from("deals").select("etapa, valor")
  const deals = data ?? []
  const etapas: { etapa: DealEtapa; label: string }[] = [
    { etapa: "novo", label: "Novo" }, { etapa: "qualificacao", label: "Qualificação" }, { etapa: "proposta", label: "Proposta" },
    { etapa: "negociacao", label: "Negociação" }, { etapa: "ganho", label: "Ganho" }, { etapa: "perdido", label: "Perdido" },
  ]
  const porEtapa = etapas.map((e) => { const ds = deals.filter((d) => d.etapa === e.etapa); return { ...e, n: ds.length, valor: ds.reduce((s, d) => s + d.valor, 0) } })
  const ganhos = deals.filter((d) => d.etapa === "ganho").length
  const fechados = deals.filter((d) => d.etapa === "ganho" || d.etapa === "perdido").length
  return { porEtapa, ganhos, fechados, taxaGanho: fechados ? Math.round((ganhos / fechados) * 100) : 0 }
}

// ───────────────────────── tesouraria (cobrança + conciliação) ─────────────────────────
const addDias = (d: string, n: number) => new Date(new Date(`${d}T12:00:00`).getTime() + n * DIA).toISOString().slice(0, 10)
export async function obterTesouraria() {
  const [faturas, mapa] = await Promise.all([listarFaturas(), mapaClientes()])
  void mapa
  const cobrancas = faturas
    .filter((f) => f.status === "enviada" || f.status === "atrasada")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((f) => ({
      id: f.id, descricao: f.descricao, clienteNome: f.clienteNome, valor: f.valor, vencimento: f.vencimento, status: f.status,
      lembretes: [
        { label: "3 dias antes", data: addDias(f.vencimento, -3) }, { label: "No vencimento", data: f.vencimento },
        { label: "3 dias após", data: addDias(f.vencimento, 3) }, { label: "7 dias após", data: addDias(f.vencimento, 7) },
      ].map((l) => ({ ...l, enviado: l.data < hojeISO() })),
    }))
  const ds = (o: number) => new Date(Date.now() + o * DIA).toISOString().slice(0, 10)
  const transacoes = [
    { id: "tx1", data: ds(-5), descricao: "PIX recebido — Sabor & Cia", valor: 16000, tipo: "entrada" as const, match: "App delivery — marco 2" },
    { id: "tx2", data: ds(-2), descricao: "PIX recebido — AcademiaFit", valor: 12000, tipo: "entrada" as const, match: "App treino — entrada" },
    { id: "tx3", data: ds(-6), descricao: "Débito — Google Workspace", valor: 600, tipo: "saida" as const, match: "Google Workspace" },
    { id: "tx4", data: ds(-3), descricao: "TED — Anúncios Meta e Google", valor: 2500, tipo: "saida" as const, match: null },
    { id: "tx5", data: ds(-1), descricao: "PIX recebido — não identificado", valor: 3800, tipo: "entrada" as const, match: null },
  ]
  return { cobrancas, transacoes }
}

// ───────────────────────── equipe ─────────────────────────
export async function obterEquipe() {
  const supabase = await db()
  const [{ data: membros }, { data: tarefas }, { data: deals }] = await Promise.all([
    supabase.from("membros").select("*"),
    supabase.from("tarefas").select("responsavel, status, projeto_id"),
    supabase.from("deals").select("responsavel, etapa"),
  ])
  return (membros ?? []).map((m) => {
    const doing = (tarefas ?? []).filter((t) => t.responsavel === m.nome && t.status === "doing").length
    const todo = (tarefas ?? []).filter((t) => t.responsavel === m.nome && t.status === "todo").length
    const dealsAbertos = (deals ?? []).filter((d) => d.responsavel === m.nome && d.etapa !== "ganho" && d.etapa !== "perdido").length
    const projetos = new Set((tarefas ?? []).filter((t) => t.responsavel === m.nome).map((t) => t.projeto_id)).size
    return {
      id: m.id as string, nome: m.nome as string, papel: m.papel as string,
      capacidadeSemanal: m.capacidade_semanal as number, custoHora: m.custo_hora as number,
      doing, todo, dealsAbertos, projetos, ocupacao: Math.min(100, doing * 32 + todo * 12),
    }
  }) satisfies (Membro & Record<string, unknown>)[]
}

// ───────────────────────── planejamento ─────────────────────────
export async function obterPlanejamento() {
  const supabase = await db()
  const [{ data: faturas }, { data: despesas }, { data: projetos }, { data: metas }] = await Promise.all([
    supabase.from("faturas").select("status, pago_em, valor"),
    supabase.from("despesas").select("data, valor"),
    supabase.from("projetos").select("tipo, status, valor"),
    supabase.from("metas").select("*").limit(1),
  ])
  const m = metas?.[0]
  const meta = { receitaMeta: m?.receita_meta ?? 0, despesaMeta: m?.despesa_meta ?? 0, mrrMeta: m?.mrr_meta ?? 0 }
  const receitaReal = (faturas ?? []).filter((f) => f.status === "paga" && noMes(f.pago_em)).reduce((s, f) => s + f.valor, 0)
  const despesaReal = (despesas ?? []).filter((d) => noMes(d.data)).reduce((s, d) => s + d.valor, 0)
  const mrrReal = (projetos ?? []).filter((p) => p.tipo === "recorrente" && p.status === "ativo").reduce((s, p) => s + (p.valor ?? 0), 0)
  return { receita: { meta: meta.receitaMeta, real: receitaReal }, despesa: { meta: meta.despesaMeta, real: despesaReal }, mrr: { meta: meta.mrrMeta, real: mrrReal } }
}

export async function obterCenarios() {
  const base = await obterFluxoProjetado()
  const saldoFinal = base.linha[base.linha.length - 1]?.saldo ?? base.saldoInicial
  const totalEntradas = base.linha.reduce((s, l) => s + l.entradas, 0)
  return { pessimista: saldoFinal - Math.round(totalEntradas * 0.3), realista: saldoFinal, otimista: saldoFinal + Math.round(totalEntradas * 0.15) }
}

export async function listarSolicitacoes(): Promise<SolicitacaoDespesa[]> {
  const supabase = await db()
  const { data } = await supabase.from("solicitacoes_despesa").select("*").order("data", { ascending: false })
  return (data ?? []) as SolicitacaoDespesa[]
}

// ───────────────────────── contratos ─────────────────────────
export type ContratoView = Contrato & { clienteNome: string }
export async function listarContratos(): Promise<ContratoView[]> {
  const supabase = await db()
  const [{ data }, mapa] = await Promise.all([supabase.from("contratos").select("*"), mapaClientes()])
  return (data ?? [])
    .sort((a, b) => (b.assinado_em ?? "0").localeCompare(a.assinado_em ?? "0"))
    .map((k) => ({ ...(k as Contrato), clienteNome: nome(mapa, k.cliente_id) ?? "—" }))
}

// ───────────────────────── busca + notificações ─────────────────────────
export type ItemBusca = { tipo: string; label: string; sub: string; href: string }
export async function obterIndiceBusca(): Promise<ItemBusca[]> {
  const supabase = await db()
  const [{ data: clientes }, { data: projetos }, { data: propostas }, { data: leads }, mapa] = await Promise.all([
    supabase.from("clientes").select("id, nome, segmento"),
    supabase.from("projetos").select("id, nome, cliente_id"),
    supabase.from("propostas").select("id, titulo, cliente_id"),
    supabase.from("leads").select("nome, empresa"),
    mapaClientes(),
  ])
  const idx: ItemBusca[] = []
  ;(clientes ?? []).forEach((c) => idx.push({ tipo: "Cliente", label: c.nome, sub: c.segmento ?? "—", href: `/app/clientes/${c.id}` }))
  ;(projetos ?? []).forEach((p) => idx.push({ tipo: "Projeto", label: p.nome, sub: nome(mapa, p.cliente_id) ?? "—", href: `/app/projetos/${p.id}` }))
  ;(propostas ?? []).forEach((p) => idx.push({ tipo: "Proposta", label: p.titulo, sub: nome(mapa, p.cliente_id) ?? "—", href: `/app/propostas/${p.id}` }))
  ;(leads ?? []).forEach((l) => idx.push({ tipo: "Lead", label: l.nome, sub: l.empresa ?? "—", href: "/app/leads" }))
  return idx
}

export type Notificacao = { id: string; texto: string; sub: string; href: string; tom: "danger" | "warning" | "info" }
export async function obterNotificacoes(): Promise<Notificacao[]> {
  const supabase = await db()
  const [{ data: faturas }, { data: contas }, { data: deals }, { data: leads }, mapa] = await Promise.all([
    supabase.from("faturas").select("id, cliente_id, descricao, status"),
    supabase.from("contas_a_pagar").select("id, descricao, valor, vencimento, pago_em"),
    supabase.from("deals").select("*"),
    supabase.from("leads").select("status"),
    mapaClientes(),
  ])
  const ns: Notificacao[] = []
  ;(faturas ?? []).filter((f) => f.status === "atrasada").forEach((f) => ns.push({ id: `f-${f.id}`, texto: `Fatura em atraso — ${nome(mapa, f.cliente_id) ?? "—"}`, sub: f.descricao, href: "/app/financeiro", tom: "danger" }))
  ;(contas ?? []).filter((c) => !c.pago_em && c.vencimento < hojeISO()).forEach((c) => ns.push({ id: `cp-${c.id}`, texto: `Conta vencida — ${c.descricao}`, sub: `R$ ${c.valor.toLocaleString("pt-BR")}`, href: "/app/financeiro", tom: "danger" }))
  ;(deals ?? []).filter((d) => d.etapa !== "ganho" && d.etapa !== "perdido").map((d) => dealView(d as Deal, mapa)).filter((d) => d.diasParado > 7).forEach((d) => ns.push({ id: `d-${d.id}`, texto: `Negócio parado há ${d.diasParado} dias`, sub: `${d.titulo} · ${d.clienteNome}`, href: "/app/pipeline", tom: "warning" }))
  const novos = (leads ?? []).filter((l) => l.status === "novo").length
  if (novos > 0) ns.push({ id: "leads", texto: `${novos} leads novos do site`, sub: "aguardando primeiro contato", href: "/app/leads", tom: "info" })
  return ns
}
