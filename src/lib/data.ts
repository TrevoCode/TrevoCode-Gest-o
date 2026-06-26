// ─────────────────────────────────────────────────────────────────────────
// Camada de acesso a dados — ÚNICO ponto que conhece a origem dos dados.
// Hoje devolve MOCKS (para construir a UI sem backend). Quando ligar o
// Supabase, basta reescrever o corpo destas funções; as telas não mudam.
// As assinaturas já são async de propósito (igual serão as queries reais).
// ─────────────────────────────────────────────────────────────────────────
import type { Cliente, Contato, Projeto, Reuniao, Lead, Fatura, Despesa } from "@/lib/db/types"

const DIA = 86_400_000
const agora = Date.now()
const iso = (offsetDias: number, hora = 10, min = 0) =>
  new Date(new Date(agora + offsetDias * DIA).setHours(hora, min, 0, 0)).toISOString()
const dataSimples = (offsetDias: number) =>
  new Date(agora + offsetDias * DIA).toISOString().slice(0, 10)

// ───────────────────────── fixtures ─────────────────────────
const clientes: Cliente[] = [
  { id: "c1", nome: "Sabor & Cia Delivery", cnpj: "12.345.678/0001-90", segmento: "Restaurantes", status: "ativo", origem: "site", observacoes: "App de delivery próprio + painel de pedidos.", created_at: iso(-120), updated_at: iso(-5) },
  { id: "c2", nome: "AcademiaFit", cnpj: "23.456.789/0001-01", segmento: "Academias", status: "ativo", origem: "indicação", observacoes: "App de treino e ranking de alunos.", created_at: iso(-90), updated_at: iso(-2) },
  { id: "c3", nome: "VelozCar Concessionária", cnpj: null, segmento: "Concessionárias", status: "proposta", origem: "site", observacoes: "Catálogo + agendamento de test-drive. Proposta enviada.", created_at: iso(-18), updated_at: iso(-3) },
  { id: "c4", nome: "Clínica VidaPlena", cnpj: "34.567.890/0001-12", segmento: "Clínicas", status: "ativo", origem: "outbound", observacoes: "Agendamento, teleconsulta e prontuário.", created_at: iso(-200), updated_at: iso(-10) },
  { id: "c5", nome: "Lar Imóveis", cnpj: null, segmento: "Imobiliárias", status: "qualificado", origem: "site", observacoes: "Busca de imóveis + agendamento de visita. Em negociação.", created_at: iso(-9), updated_at: iso(-1) },
  { id: "c6", nome: "EduTech Cursos", cnpj: "45.678.901/0001-23", segmento: "Educação", status: "inativo", origem: "indicação", observacoes: "Plataforma de cursos. Projeto concluído, sem contrato ativo.", created_at: iso(-400), updated_at: iso(-60) },
]

const contatos: Contato[] = [
  { id: "ct1", cliente_id: "c1", nome: "Carlos Menezes", email: "carlos@saborecia.com", telefone: "(11) 98888-1111", cargo: "Dono", principal: true, created_at: iso(-120) },
  { id: "ct2", cliente_id: "c1", nome: "Paula Reis", email: "paula@saborecia.com", telefone: "(11) 98888-1212", cargo: "Gerente", principal: false, created_at: iso(-100) },
  { id: "ct3", cliente_id: "c2", nome: "Rafael Lima", email: "rafael@academiafit.com", telefone: "(21) 97777-2222", cargo: "CEO", principal: true, created_at: iso(-90) },
  { id: "ct4", cliente_id: "c3", nome: "Bruno Tavares", email: "bruno@velozcar.com", telefone: "(31) 96666-3333", cargo: "Diretor comercial", principal: true, created_at: iso(-18) },
  { id: "ct5", cliente_id: "c4", nome: "Dra. Helena Costa", email: "helena@vidaplena.com", telefone: "(41) 95555-4444", cargo: "Sócia", principal: true, created_at: iso(-200) },
  { id: "ct6", cliente_id: "c5", nome: "Marina Alves", email: "marina@larimoveis.com", telefone: "(51) 94444-5555", cargo: "Proprietária", principal: true, created_at: iso(-9) },
]

const projetos: Projeto[] = [
  { id: "p1", cliente_id: "c1", nome: "App de delivery iOS/Android", tipo: "one_off", valor: 48000, status: "ativo", data_inicio: dataSimples(-110), data_fim: dataSimples(20), descricao: "App nativo + painel de pedidos em tempo real.", created_at: iso(-110), updated_at: iso(-5) },
  { id: "p2", cliente_id: "c1", nome: "Manutenção e evolução", tipo: "recorrente", valor: 2500, status: "ativo", data_inicio: dataSimples(-30), data_fim: null, descricao: "Suporte mensal e novas features.", created_at: iso(-30), updated_at: iso(-5) },
  { id: "p3", cliente_id: "c2", nome: "App de treino + ranking", tipo: "one_off", valor: 36000, status: "ativo", data_inicio: dataSimples(-80), data_fim: dataSimples(40), descricao: "App de treinos, evolução e ranking de alunos.", created_at: iso(-80), updated_at: iso(-2) },
  { id: "p4", cliente_id: "c3", nome: "Catálogo + test-drive", tipo: "one_off", valor: 28000, status: "proposta", data_inicio: null, data_fim: null, descricao: "Catálogo de veículos e agendamento de test-drive.", created_at: iso(-18), updated_at: iso(-3) },
  { id: "p5", cliente_id: "c4", nome: "Plataforma de teleconsulta", tipo: "one_off", valor: 60000, status: "ativo", data_inicio: dataSimples(-180), data_fim: dataSimples(-10), descricao: "Agendamento, vídeo e prontuário eletrônico.", created_at: iso(-180), updated_at: iso(-10) },
  { id: "p6", cliente_id: "c4", nome: "Sustentação mensal", tipo: "recorrente", valor: 3800, status: "ativo", data_inicio: dataSimples(-10), data_fim: null, descricao: "SLA de suporte e melhorias contínuas.", created_at: iso(-10), updated_at: iso(-10) },
  { id: "p7", cliente_id: "c6", nome: "Plataforma de cursos", tipo: "one_off", valor: 42000, status: "concluido", data_inicio: dataSimples(-390), data_fim: dataSimples(-70), descricao: "LMS com aulas, certificados e pagamentos.", created_at: iso(-390), updated_at: iso(-70) },
]

const reunioes: Reuniao[] = [
  { id: "r1", cliente_id: "c5", contato_id: "ct6", titulo: "Fechamento de proposta", data_hora: iso(1, 14), tipo: "meet", status: "agendada", notas: null, follow_up: "Levar escopo e cronograma.", created_at: iso(-2) },
  { id: "r2", cliente_id: "c3", contato_id: "ct4", titulo: "Apresentação do orçamento", data_hora: iso(2, 10), tipo: "meet", status: "agendada", notas: null, follow_up: null, created_at: iso(-3) },
  { id: "r3", cliente_id: "c1", contato_id: "ct1", titulo: "Review de sprint", data_hora: iso(4, 16), tipo: "ligacao", status: "agendada", notas: null, follow_up: null, created_at: iso(-1) },
  { id: "r4", cliente_id: "c2", contato_id: "ct3", titulo: "Alinhamento de roadmap", data_hora: iso(7, 11), tipo: "presencial", status: "agendada", notas: null, follow_up: null, created_at: iso(-1) },
  { id: "r5", cliente_id: "c4", contato_id: "ct5", titulo: "Kickoff sustentação", data_hora: iso(-3, 15), tipo: "meet", status: "realizada", notas: "Definidos SLAs e canais de suporte.", follow_up: "Enviar contrato de sustentação.", created_at: iso(-5) },
  { id: "r6", cliente_id: "c1", contato_id: "ct2", titulo: "Feedback do app", data_hora: iso(-6, 9), tipo: "ligacao", status: "realizada", notas: "Cliente satisfeito; pediu relatório de pedidos.", follow_up: null, created_at: iso(-7) },
]

const leads: Lead[] = [
  { id: "l1", nome: "Joana Prado", email: "joana@petshopamigo.com", telefone: "(11) 91234-5678", empresa: "Pet Shop Amigo", mensagem: "Quero um app de agendamento de banho e tosa.", prefere_conversar: false, melhor_horario: "tarde", melhor_canal: "whatsapp", origem: "site", status: "novo", cliente_id: null, created_at: iso(0, 9) },
  { id: "l2", nome: "Eduardo Nunes", email: "eduardo@construtoranun.com", telefone: "(31) 99876-5432", empresa: "Construtora Nunes", mensagem: "Sistema de gestão de obras e medições.", prefere_conversar: true, melhor_horario: "manha", melhor_canal: "meet", origem: "site", status: "novo", cliente_id: null, created_at: iso(-1, 16) },
  { id: "l3", nome: "Tatiane Rocha", email: "tati@modaviva.com", telefone: "(48) 98765-1234", empresa: "Moda Viva", mensagem: "E-commerce próprio com programa de fidelidade.", prefere_conversar: false, melhor_horario: "final", melhor_canal: "email", origem: "site", status: "em_contato", cliente_id: null, created_at: iso(-2, 11) },
  { id: "l4", nome: "Sérgio Bastos", email: "sergio@logfast.com", telefone: "(11) 97777-8888", empresa: "LogFast Transportes", mensagem: "App de rastreio de entregas para motoristas.", prefere_conversar: false, melhor_horario: "tarde", melhor_canal: "ligacao", origem: "site", status: "novo", cliente_id: null, created_at: iso(-4, 14) },
]

const faturas: Fatura[] = [
  { id: "f1", cliente_id: "c1", projeto_id: "p1", descricao: "App delivery — marco 2", valor: 16000, status: "paga", emitida_em: dataSimples(-22), vencimento: dataSimples(-12), pago_em: dataSimples(-5), created_at: iso(-22) },
  { id: "f2", cliente_id: "c2", projeto_id: "p3", descricao: "App treino — entrada", valor: 12000, status: "paga", emitida_em: dataSimples(-18), vencimento: dataSimples(-8), pago_em: dataSimples(-2), created_at: iso(-18) },
  { id: "f3", cliente_id: "c4", projeto_id: "p6", descricao: "Sustentação mensal", valor: 3800, status: "enviada", emitida_em: dataSimples(-5), vencimento: dataSimples(5), pago_em: null, created_at: iso(-5) },
  { id: "f4", cliente_id: "c1", projeto_id: "p2", descricao: "Manutenção mensal", valor: 2500, status: "enviada", emitida_em: dataSimples(-3), vencimento: dataSimples(7), pago_em: null, created_at: iso(-3) },
  { id: "f5", cliente_id: "c4", projeto_id: "p5", descricao: "Teleconsulta — saldo final", valor: 20000, status: "atrasada", emitida_em: dataSimples(-40), vencimento: dataSimples(-9), pago_em: null, created_at: iso(-40) },
  { id: "f6", cliente_id: "c2", projeto_id: "p3", descricao: "App treino — parcela 2", valor: 12000, status: "rascunho", emitida_em: null, vencimento: dataSimples(20), pago_em: null, created_at: iso(-1) },
  { id: "f7", cliente_id: "c1", projeto_id: "p1", descricao: "App delivery — marco 1", valor: 16000, status: "paga", emitida_em: dataSimples(-55), vencimento: dataSimples(-45), pago_em: dataSimples(-44), created_at: iso(-55) },
]

const despesas: Despesa[] = [
  { id: "d1", descricao: "Salários da equipe", categoria: "salarios", valor: 38000, data: dataSimples(-5), recorrente: true, created_at: iso(-5) },
  { id: "d2", descricao: "Vercel + Supabase", categoria: "infraestrutura", valor: 1200, data: dataSimples(-4), recorrente: true, created_at: iso(-4) },
  { id: "d3", descricao: "Google Workspace", categoria: "ferramentas", valor: 600, data: dataSimples(-6), recorrente: true, created_at: iso(-6) },
  { id: "d4", descricao: "Anúncios Meta e Google", categoria: "marketing", valor: 2500, data: dataSimples(-3), recorrente: false, created_at: iso(-3) },
  { id: "d5", descricao: "DAS — Simples Nacional", categoria: "impostos", valor: 4200, data: dataSimples(-7), recorrente: true, created_at: iso(-7) },
  { id: "d6", descricao: "Figma + GitHub", categoria: "ferramentas", valor: 450, data: dataSimples(-8), recorrente: true, created_at: iso(-8) },
  { id: "d7", descricao: "Notebook (equipe nova)", categoria: "outros", valor: 7800, data: dataSimples(-2), recorrente: false, created_at: iso(-2) },
]

// ───────────────────────── tipos de view ─────────────────────────
export type ClienteResumo = Cliente & {
  projetosAtivos: number
  receitaRecorrente: number // soma dos recorrentes ativos (R$/mês)
}
export type ClienteDetalhe = Cliente & {
  contatos: Contato[]
  projetos: Projeto[]
  reunioes: Reuniao[]
}
export type ProjetoComCliente = Projeto & { clienteNome: string }
export type ReuniaoComCliente = Reuniao & { clienteNome: string | null }

const nomeCliente = (id: string | null) =>
  clientes.find((c) => c.id === id)?.nome ?? null

// ───────────────────────── API de dados ─────────────────────────
export async function listarClientes(opts?: {
  status?: Cliente["status"]
  busca?: string
}): Promise<ClienteResumo[]> {
  let lista = clientes
  if (opts?.status) lista = lista.filter((c) => c.status === opts.status)
  if (opts?.busca) {
    const q = opts.busca.toLowerCase()
    lista = lista.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.segmento ?? "").toLowerCase().includes(q)
    )
  }
  return lista.map((c) => {
    const ps = projetos.filter((p) => p.cliente_id === c.id)
    return {
      ...c,
      projetosAtivos: ps.filter((p) => p.status === "ativo").length,
      receitaRecorrente: ps
        .filter((p) => p.tipo === "recorrente" && p.status === "ativo")
        .reduce((s, p) => s + (p.valor ?? 0), 0),
    }
  })
}

export async function obterCliente(id: string): Promise<ClienteDetalhe | null> {
  const c = clientes.find((x) => x.id === id)
  if (!c) return null
  return {
    ...c,
    contatos: contatos.filter((x) => x.cliente_id === id),
    projetos: projetos.filter((x) => x.cliente_id === id),
    reunioes: reunioes
      .filter((x) => x.cliente_id === id)
      .sort((a, b) => b.data_hora.localeCompare(a.data_hora)),
  }
}

export async function listarLeads(): Promise<Lead[]> {
  return [...leads].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function listarProjetos(): Promise<ProjetoComCliente[]> {
  return projetos.map((p) => ({ ...p, clienteNome: nomeCliente(p.cliente_id) ?? "—" }))
}

export async function listarReunioes(): Promise<ReuniaoComCliente[]> {
  return [...reunioes]
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .map((r) => ({ ...r, clienteNome: nomeCliente(r.cliente_id) }))
}

export async function obterDashboard() {
  const proximas = reunioes
    .filter((r) => r.status === "agendada" && r.data_hora >= new Date(agora).toISOString())
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .slice(0, 5)
    .map((r) => ({ ...r, clienteNome: nomeCliente(r.cliente_id) }))

  const leadsNovos = leads.filter((l) => l.status === "novo")
  const recorrenteMensal = projetos
    .filter((p) => p.tipo === "recorrente" && p.status === "ativo")
    .reduce((s, p) => s + (p.valor ?? 0), 0)

  return {
    kpis: {
      leadsNovos: leadsNovos.length,
      clientesAtivos: clientes.filter((c) => c.status === "ativo").length,
      projetosAtivos: projetos.filter((p) => p.status === "ativo").length,
      reunioesProximas: proximas.length,
      recorrenteMensal,
    },
    proximasReunioes: proximas,
    leadsRecentes: [...leads]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 4),
  }
}

// ───────────────────────── financeiro ─────────────────────────
export type FaturaComCliente = Fatura & { clienteNome: string }

const mesAtual = new Date(agora).toISOString().slice(0, 7) // "YYYY-MM"
const noMes = (d: string | null) => !!d && d.slice(0, 7) === mesAtual

export async function listarFaturas(): Promise<FaturaComCliente[]> {
  return [...faturas]
    .sort((a, b) => (b.emitida_em ?? b.created_at).localeCompare(a.emitida_em ?? a.created_at))
    .map((f) => ({ ...f, clienteNome: nomeCliente(f.cliente_id) ?? "—" }))
}

export async function listarDespesas(): Promise<Despesa[]> {
  return [...despesas].sort((a, b) => b.data.localeCompare(a.data))
}

export async function obterFinanceiro() {
  const aReceber = faturas
    .filter((f) => f.status === "enviada" || f.status === "atrasada")
    .reduce((s, f) => s + f.valor, 0)
  const atrasado = faturas
    .filter((f) => f.status === "atrasada")
    .reduce((s, f) => s + f.valor, 0)
  const recebidoMes = faturas
    .filter((f) => f.status === "paga" && noMes(f.pago_em))
    .reduce((s, f) => s + f.valor, 0)
  const despesasMes = despesas.filter((d) => noMes(d.data)).reduce((s, d) => s + d.valor, 0)

  const categorias = ["ferramentas", "infraestrutura", "salarios", "marketing", "impostos", "outros"] as const
  const porCategoria = categorias
    .map((cat) => ({
      categoria: cat,
      total: despesas.filter((d) => noMes(d.data) && d.categoria === cat).reduce((s, d) => s + d.valor, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  return {
    kpis: { aReceber, atrasado, recebidoMes, despesasMes, resultadoMes: recebidoMes - despesasMes },
    faturas: await listarFaturas(),
    despesas: await listarDespesas(),
    porCategoria,
  }
}
