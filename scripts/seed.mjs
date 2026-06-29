// Popula o Supabase com os dados de exemplo (os mesmos do modo demo).
// Roda com: node scripts/seed.mjs  (lê .env.local — usa a service_role)
// IDs derivados por hash do id mock ("c1") → uuid estável, preservando as FKs.
import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const uuid = (s) => {
  const h = createHash("md5").update(String(s)).digest("hex")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}
const DIA = 86_400_000
const agora = Date.now()
const iso = (o, h = 10, m = 0) => new Date(new Date(agora + o * DIA).setHours(h, m, 0, 0)).toISOString()
const ds = (o) => new Date(agora + o * DIA).toISOString().slice(0, 10)

// converte id e *_id (mock → uuid)
const conv = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) =>
  (k === "id" || k.endsWith("_id")) && typeof v === "string" ? [k, uuid(v)] : [k, v]))

const clientes = [
  { id: "c1", nome: "Sabor & Cia Delivery", cnpj: "12.345.678/0001-90", segmento: "Restaurantes", status: "ativo", origem: "site", observacoes: "App de delivery próprio + painel de pedidos.", created_at: iso(-120), updated_at: iso(-5) },
  { id: "c2", nome: "AcademiaFit", cnpj: "23.456.789/0001-01", segmento: "Academias", status: "ativo", origem: "indicação", observacoes: "App de treino e ranking de alunos.", created_at: iso(-90), updated_at: iso(-2) },
  { id: "c3", nome: "VelozCar Concessionária", cnpj: null, segmento: "Concessionárias", status: "proposta", origem: "site", observacoes: "Catálogo + agendamento de test-drive.", created_at: iso(-18), updated_at: iso(-3) },
  { id: "c4", nome: "Clínica VidaPlena", cnpj: "34.567.890/0001-12", segmento: "Clínicas", status: "ativo", origem: "outbound", observacoes: "Agendamento, teleconsulta e prontuário.", created_at: iso(-200), updated_at: iso(-10) },
  { id: "c5", nome: "Lar Imóveis", cnpj: null, segmento: "Imobiliárias", status: "qualificado", origem: "site", observacoes: "Busca de imóveis + agendamento de visita.", created_at: iso(-9), updated_at: iso(-1) },
  { id: "c6", nome: "EduTech Cursos", cnpj: "45.678.901/0001-23", segmento: "Educação", status: "inativo", origem: "indicação", observacoes: "Plataforma de cursos. Projeto concluído.", created_at: iso(-400), updated_at: iso(-60) },
]
const contatos = [
  { id: "ct1", cliente_id: "c1", nome: "Carlos Menezes", email: "carlos@saborecia.com", telefone: "(11) 98888-1111", cargo: "Dono", principal: true, created_at: iso(-120) },
  { id: "ct2", cliente_id: "c1", nome: "Paula Reis", email: "paula@saborecia.com", telefone: "(11) 98888-1212", cargo: "Gerente", principal: false, created_at: iso(-100) },
  { id: "ct3", cliente_id: "c2", nome: "Rafael Lima", email: "rafael@academiafit.com", telefone: "(21) 97777-2222", cargo: "CEO", principal: true, created_at: iso(-90) },
  { id: "ct4", cliente_id: "c3", nome: "Bruno Tavares", email: "bruno@velozcar.com", telefone: "(31) 96666-3333", cargo: "Diretor comercial", principal: true, created_at: iso(-18) },
  { id: "ct5", cliente_id: "c4", nome: "Dra. Helena Costa", email: "helena@vidaplena.com", telefone: "(41) 95555-4444", cargo: "Sócia", principal: true, created_at: iso(-200) },
  { id: "ct6", cliente_id: "c5", nome: "Marina Alves", email: "marina@larimoveis.com", telefone: "(51) 94444-5555", cargo: "Proprietária", principal: true, created_at: iso(-9) },
]
const projetos = [
  { id: "p1", cliente_id: "c1", nome: "App de delivery iOS/Android", tipo: "one_off", valor: 48000, custo: 28000, status: "ativo", data_inicio: ds(-110), data_fim: ds(20), descricao: "App nativo + painel de pedidos.", created_at: iso(-110), updated_at: iso(-5) },
  { id: "p2", cliente_id: "c1", nome: "Manutenção e evolução", tipo: "recorrente", valor: 2500, custo: 1200, status: "ativo", data_inicio: ds(-30), data_fim: null, descricao: "Suporte mensal e novas features.", created_at: iso(-30), updated_at: iso(-5) },
  { id: "p3", cliente_id: "c2", nome: "App de treino + ranking", tipo: "one_off", valor: 36000, custo: 21000, status: "ativo", data_inicio: ds(-80), data_fim: ds(40), descricao: "App de treinos e ranking.", created_at: iso(-80), updated_at: iso(-2) },
  { id: "p4", cliente_id: "c3", nome: "Catálogo + test-drive", tipo: "one_off", valor: 28000, custo: 17000, status: "proposta", data_inicio: null, data_fim: null, descricao: "Catálogo e test-drive.", created_at: iso(-18), updated_at: iso(-3) },
  { id: "p5", cliente_id: "c4", nome: "Plataforma de teleconsulta", tipo: "one_off", valor: 60000, custo: 38000, status: "ativo", data_inicio: ds(-180), data_fim: ds(-10), descricao: "Agendamento, vídeo e prontuário.", created_at: iso(-180), updated_at: iso(-10) },
  { id: "p6", cliente_id: "c4", nome: "Sustentação mensal", tipo: "recorrente", valor: 3800, custo: 1800, status: "ativo", data_inicio: ds(-10), data_fim: null, descricao: "SLA de suporte.", created_at: iso(-10), updated_at: iso(-10) },
  { id: "p7", cliente_id: "c6", nome: "Plataforma de cursos", tipo: "one_off", valor: 42000, custo: 26000, status: "concluido", data_inicio: ds(-390), data_fim: ds(-70), descricao: "LMS com certificados.", created_at: iso(-390), updated_at: iso(-70) },
]
const reunioes = [
  { id: "r1", cliente_id: "c5", contato_id: "ct6", titulo: "Fechamento de proposta", data_hora: iso(1, 14), tipo: "meet", status: "agendada", notas: null, follow_up: "Levar escopo e cronograma.", created_at: iso(-2) },
  { id: "r2", cliente_id: "c3", contato_id: "ct4", titulo: "Apresentação do orçamento", data_hora: iso(2, 10), tipo: "meet", status: "agendada", notas: null, follow_up: null, created_at: iso(-3) },
  { id: "r3", cliente_id: "c1", contato_id: "ct1", titulo: "Review de sprint", data_hora: iso(4, 16), tipo: "ligacao", status: "agendada", notas: null, follow_up: null, created_at: iso(-1) },
  { id: "r4", cliente_id: "c2", contato_id: "ct3", titulo: "Alinhamento de roadmap", data_hora: iso(7, 11), tipo: "presencial", status: "agendada", notas: null, follow_up: null, created_at: iso(-1) },
  { id: "r5", cliente_id: "c4", contato_id: "ct5", titulo: "Kickoff sustentação", data_hora: iso(-3, 15), tipo: "meet", status: "realizada", notas: "Definidos SLAs.", follow_up: "Enviar contrato.", created_at: iso(-5) },
  { id: "r6", cliente_id: "c1", contato_id: "ct2", titulo: "Feedback do app", data_hora: iso(-6, 9), tipo: "ligacao", status: "realizada", notas: "Cliente satisfeito.", follow_up: null, created_at: iso(-7) },
]
const leads = [
  { id: "l1", nome: "Joana Prado", email: "joana@petshopamigo.com", telefone: "(11) 91234-5678", empresa: "Pet Shop Amigo", mensagem: "App de agendamento de banho e tosa.", prefere_conversar: false, melhor_horario: "tarde", melhor_canal: "whatsapp", origem: "site", status: "novo", cliente_id: null, created_at: iso(0, 9) },
  { id: "l2", nome: "Eduardo Nunes", email: "eduardo@construtoranun.com", telefone: "(31) 99876-5432", empresa: "Construtora Nunes", mensagem: "Gestão de obras e medições.", prefere_conversar: true, melhor_horario: "manha", melhor_canal: "meet", origem: "site", status: "novo", cliente_id: null, created_at: iso(-1, 16) },
  { id: "l3", nome: "Tatiane Rocha", email: "tati@modaviva.com", telefone: "(48) 98765-1234", empresa: "Moda Viva", mensagem: "E-commerce com fidelidade.", prefere_conversar: false, melhor_horario: "final", melhor_canal: "email", origem: "site", status: "em_contato", cliente_id: null, created_at: iso(-2, 11) },
  { id: "l4", nome: "Sérgio Bastos", email: "sergio@logfast.com", telefone: "(11) 97777-8888", empresa: "LogFast Transportes", mensagem: "App de rastreio de entregas.", prefere_conversar: false, melhor_horario: "tarde", melhor_canal: "ligacao", origem: "site", status: "novo", cliente_id: null, created_at: iso(-4, 14) },
]
const faturas = [
  { id: "f1", cliente_id: "c1", projeto_id: "p1", descricao: "App delivery — marco 2", valor: 16000, status: "paga", emitida_em: ds(-22), vencimento: ds(-12), pago_em: ds(-5), created_at: iso(-22) },
  { id: "f2", cliente_id: "c2", projeto_id: "p3", descricao: "App treino — entrada", valor: 12000, status: "paga", emitida_em: ds(-18), vencimento: ds(-8), pago_em: ds(-2), created_at: iso(-18) },
  { id: "f3", cliente_id: "c4", projeto_id: "p6", descricao: "Sustentação mensal", valor: 3800, status: "enviada", emitida_em: ds(-5), vencimento: ds(5), pago_em: null, created_at: iso(-5) },
  { id: "f4", cliente_id: "c1", projeto_id: "p2", descricao: "Manutenção mensal", valor: 2500, status: "enviada", emitida_em: ds(-3), vencimento: ds(7), pago_em: null, created_at: iso(-3) },
  { id: "f5", cliente_id: "c4", projeto_id: "p5", descricao: "Teleconsulta — saldo final", valor: 20000, status: "atrasada", emitida_em: ds(-40), vencimento: ds(-9), pago_em: null, created_at: iso(-40) },
  { id: "f6", cliente_id: "c2", projeto_id: "p3", descricao: "App treino — parcela 2", valor: 12000, status: "rascunho", emitida_em: null, vencimento: ds(20), pago_em: null, created_at: iso(-1) },
  { id: "f7", cliente_id: "c1", projeto_id: "p1", descricao: "App delivery — marco 1", valor: 16000, status: "paga", emitida_em: ds(-55), vencimento: ds(-45), pago_em: ds(-44), created_at: iso(-55) },
  { id: "f8", cliente_id: "c4", projeto_id: "p6", descricao: "Sustentação — próximo ciclo", valor: 3800, status: "enviada", emitida_em: ds(-1), vencimento: ds(18), pago_em: null, created_at: iso(-1) },
  { id: "f9", cliente_id: "c1", projeto_id: "p2", descricao: "Manutenção — próximo ciclo", valor: 2500, status: "enviada", emitida_em: ds(-1), vencimento: ds(25), pago_em: null, created_at: iso(-1) },
]
const despesas = [
  { id: "d1", descricao: "Salários da equipe", categoria: "salarios", valor: 38000, data: ds(-5), recorrente: true, created_at: iso(-5) },
  { id: "d2", descricao: "Vercel + Supabase", categoria: "infraestrutura", valor: 1200, data: ds(-4), recorrente: true, created_at: iso(-4) },
  { id: "d3", descricao: "Google Workspace", categoria: "ferramentas", valor: 600, data: ds(-6), recorrente: true, created_at: iso(-6) },
  { id: "d4", descricao: "Anúncios Meta e Google", categoria: "marketing", valor: 2500, data: ds(-3), recorrente: false, created_at: iso(-3) },
  { id: "d5", descricao: "DAS — Simples Nacional", categoria: "impostos", valor: 4200, data: ds(-7), recorrente: true, created_at: iso(-7) },
  { id: "d6", descricao: "Figma + GitHub", categoria: "ferramentas", valor: 450, data: ds(-8), recorrente: true, created_at: iso(-8) },
  { id: "d7", descricao: "Notebook (equipe nova)", categoria: "outros", valor: 7800, data: ds(-2), recorrente: false, created_at: iso(-2) },
]
const deals = [
  { id: "dl1", cliente_id: "c5", titulo: "Portal do corretor — fase 2", valor: 18000, etapa: "novo", probabilidade: 20, fechamento_esperado: ds(30), responsavel: "Yuri", ultima_atividade: iso(0), created_at: iso(-1) },
  { id: "dl2", cliente_id: "c3", titulo: "Integração de estoque", valor: 15000, etapa: "qualificacao", probabilidade: 35, fechamento_esperado: ds(21), responsavel: "Fabrício", ultima_atividade: iso(-3), created_at: iso(-6) },
  { id: "dl3", cliente_id: "c3", titulo: "Catálogo + test-drive", valor: 28000, etapa: "proposta", probabilidade: 50, fechamento_esperado: ds(14), responsavel: "Fabrício", ultima_atividade: iso(-9), created_at: iso(-18) },
  { id: "dl4", cliente_id: "c5", titulo: "Busca + agendamento de visitas", valor: 32000, etapa: "negociacao", probabilidade: 70, fechamento_esperado: ds(10), responsavel: "Yuri", ultima_atividade: iso(-1), created_at: iso(-9) },
  { id: "dl5", cliente_id: "c1", titulo: "Módulo de fidelidade", valor: 12000, etapa: "negociacao", probabilidade: 60, fechamento_esperado: ds(7), responsavel: "Yuri", ultima_atividade: iso(-6), created_at: iso(-12) },
  { id: "dl6", cliente_id: "c2", titulo: "App treino — fase 2", valor: 20000, etapa: "ganho", probabilidade: 100, fechamento_esperado: ds(-2), responsavel: "Fabrício", ultima_atividade: iso(-2), created_at: iso(-15) },
  { id: "dl7", cliente_id: "c6", titulo: "Reativação da plataforma", valor: 25000, etapa: "perdido", probabilidade: 0, fechamento_esperado: ds(-10), responsavel: "Yuri", ultima_atividade: iso(-10), created_at: iso(-30) },
]
const contas_a_pagar = [
  { id: "cp1", descricao: "Folha + PJ da equipe", categoria: "salarios", valor: 38000, vencimento: ds(3), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp2", descricao: "Vercel + Supabase + Cloudflare", categoria: "infraestrutura", valor: 1200, vencimento: ds(8), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp3", descricao: "DAS — Simples Nacional", categoria: "impostos", valor: 4200, vencimento: ds(5), pago_em: null, recorrente: false, created_at: iso(-2) },
  { id: "cp4", descricao: "Google Workspace", categoria: "ferramentas", valor: 600, vencimento: ds(-2), pago_em: null, recorrente: true, created_at: iso(-8) },
  { id: "cp5", descricao: "Anúncios Meta e Google", categoria: "marketing", valor: 2500, vencimento: ds(12), pago_em: null, recorrente: false, created_at: iso(-2) },
  { id: "cp6", descricao: "Contador", categoria: "outros", valor: 950, vencimento: ds(6), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp7", descricao: "Folha + PJ (próximo mês)", categoria: "salarios", valor: 38000, vencimento: ds(33), pago_em: null, recorrente: true, created_at: iso(-1) },
  { id: "cp8", descricao: "Figma + GitHub", categoria: "ferramentas", valor: 450, vencimento: ds(-6), pago_em: ds(-6), recorrente: true, created_at: iso(-8) },
]
const propostas = [
  { id: "pr1", cliente_id: "c3", deal_id: "dl3", titulo: "Catálogo + test-drive", status: "enviada", enviada_em: ds(-8), validade: ds(7), created_at: iso(-8), itens: [{ descricao: "Catálogo de veículos", valor: 16000 }, { descricao: "Agendamento de test-drive", valor: 8000 }, { descricao: "Integração com o site", valor: 4000 }] },
  { id: "pr2", cliente_id: "c5", deal_id: "dl4", titulo: "Busca + agendamento de visitas", status: "enviada", enviada_em: ds(-3), validade: ds(12), created_at: iso(-3), itens: [{ descricao: "Busca de imóveis", valor: 18000 }, { descricao: "Agendamento de visitas", valor: 10000 }, { descricao: "Painel do corretor", valor: 4000 }] },
  { id: "pr3", cliente_id: "c1", deal_id: "dl5", titulo: "Módulo de fidelidade", status: "rascunho", enviada_em: null, validade: null, created_at: iso(-1), itens: [{ descricao: "Programa de pontos", valor: 8000 }, { descricao: "Integração com o app", valor: 4000 }] },
  { id: "pr4", cliente_id: "c2", deal_id: "dl6", titulo: "App treino — fase 2", status: "aceita", enviada_em: ds(-12), validade: ds(-2), created_at: iso(-14), itens: [{ descricao: "Novas telas de evolução", valor: 12000 }, { descricao: "Gamificação", valor: 8000 }] },
  { id: "pr5", cliente_id: "c6", deal_id: null, titulo: "Reativação da plataforma", status: "recusada", enviada_em: ds(-25), validade: ds(-10), created_at: iso(-28), itens: [{ descricao: "Auditoria técnica", valor: 5000 }, { descricao: "Reescrita do core", valor: 20000 }] },
]
const tarefas = [
  { id: "t1", projeto_id: "p1", titulo: "Setup do projeto e CI", status: "done", responsavel: "Yuri" },
  { id: "t2", projeto_id: "p1", titulo: "Tela de cardápio", status: "done", responsavel: "Fabrício" },
  { id: "t3", projeto_id: "p1", titulo: "Checkout + pagamento", status: "doing", responsavel: "Yuri" },
  { id: "t4", projeto_id: "p1", titulo: "Rastreio de pedido", status: "doing", responsavel: "Fabrício" },
  { id: "t5", projeto_id: "p1", titulo: "Testes e publicação nas lojas", status: "todo", responsavel: "Yuri" },
  { id: "t6", projeto_id: "p3", titulo: "Cadastro de treinos", status: "done", responsavel: "Fabrício" },
  { id: "t7", projeto_id: "p3", titulo: "Ranking de alunos", status: "doing", responsavel: "Yuri" },
  { id: "t8", projeto_id: "p3", titulo: "Notificações push", status: "todo", responsavel: "Fabrício" },
  { id: "t9", projeto_id: "p5", titulo: "Sala de vídeo", status: "done", responsavel: "Yuri" },
  { id: "t10", projeto_id: "p5", titulo: "Prontuário eletrônico", status: "done", responsavel: "Fabrício" },
  { id: "t11", projeto_id: "p5", titulo: "Relatórios clínicos", status: "doing", responsavel: "Yuri" },
  { id: "t12", projeto_id: "p1", titulo: "Design das telas do app", status: "doing", responsavel: "Marina" },
  { id: "t13", projeto_id: "p3", titulo: "Build Android + publicação", status: "todo", responsavel: "Lucas" },
  { id: "t14", projeto_id: "p5", titulo: "Ajustes de UX do prontuário", status: "doing", responsavel: "Marina" },
]
const marcos = [
  { id: "ms1", projeto_id: "p1", titulo: "Kickoff e setup", data: ds(-110), concluido: true },
  { id: "ms2", projeto_id: "p1", titulo: "MVP navegável", data: ds(-40), concluido: true },
  { id: "ms3", projeto_id: "p1", titulo: "Beta com pagamento", data: ds(5), concluido: false },
  { id: "ms4", projeto_id: "p1", titulo: "Publicação nas lojas", data: ds(20), concluido: false },
  { id: "ms5", projeto_id: "p3", titulo: "Treinos e ranking", data: ds(-20), concluido: true },
  { id: "ms6", projeto_id: "p3", titulo: "Entrega final", data: ds(40), concluido: false },
  { id: "ms7", projeto_id: "p5", titulo: "Go-live da teleconsulta", data: ds(-10), concluido: true },
]
const solicitacoes_despesa = [
  { id: "sd1", descricao: "Reembolso — domínio e SSL", categoria: "infraestrutura", valor: 320, solicitante: "Marina", data: ds(-1), status: "pendente" },
  { id: "sd2", descricao: "Curso de React Native", categoria: "outros", valor: 890, solicitante: "Lucas", data: ds(-2), status: "pendente" },
  { id: "sd3", descricao: "Plugin de design (Figma)", categoria: "ferramentas", valor: 180, solicitante: "Marina", data: ds(-5), status: "aprovada" },
  { id: "sd4", descricao: "Almoço com cliente", categoria: "marketing", valor: 240, solicitante: "Yuri", data: ds(-8), status: "aprovada" },
]
const contratos = [
  { id: "k1", cliente_id: "c2", titulo: "App treino — fase 2", valor: 20000, tipo: "projeto", status: "assinado", vigencia_inicio: ds(-10), vigencia_fim: ds(80), assinado_em: ds(-9) },
  { id: "k2", cliente_id: "c4", titulo: "Sustentação mensal", valor: 3800, tipo: "recorrente", status: "assinado", vigencia_inicio: ds(-10), vigencia_fim: ds(355), assinado_em: ds(-10) },
  { id: "k3", cliente_id: "c1", titulo: "Manutenção e evolução", valor: 2500, tipo: "recorrente", status: "assinado", vigencia_inicio: ds(-30), vigencia_fim: ds(335), assinado_em: ds(-29) },
  { id: "k4", cliente_id: "c3", titulo: "Catálogo + test-drive", valor: 28000, tipo: "projeto", status: "enviado", vigencia_inicio: null, vigencia_fim: null, assinado_em: null },
  { id: "k5", cliente_id: "c5", titulo: "Busca + agendamento de visitas", valor: 32000, tipo: "projeto", status: "rascunho", vigencia_inicio: null, vigencia_fim: null, assinado_em: null },
]
const membros = [
  { nome: "Yuri", papel: "Sócio · Full-stack", capacidade_semanal: 40, custo_hora: 120 },
  { nome: "Fabrício", papel: "Sócio · Full-stack", capacidade_semanal: 40, custo_hora: 120 },
  { nome: "Marina", papel: "Design de produto", capacidade_semanal: 40, custo_hora: 80 },
  { nome: "Lucas", papel: "Dev mobile", capacidade_semanal: 40, custo_hora: 70 },
]
const metas = [{ mes: ds(0), receita_meta: 45000, despesa_meta: 50000, mrr_meta: 10000 }]

const tabelas = [
  ["clientes", clientes], ["contatos", contatos], ["projetos", projetos], ["reunioes", reunioes],
  ["leads", leads], ["faturas", faturas], ["despesas", despesas], ["deals", deals],
  ["contas_a_pagar", contas_a_pagar], ["propostas", propostas], ["tarefas", tarefas],
  ["marcos", marcos], ["solicitacoes_despesa", solicitacoes_despesa], ["contratos", contratos],
  ["membros", membros], ["metas", metas],
]

let falhou = false
for (const [nome, rows] of tabelas) {
  await supabase.from(nome).delete().neq("id", "00000000-0000-0000-0000-000000000000")
  const payload = rows.map((r) => (r.id || Object.keys(r).some((k) => k.endsWith("_id")) ? conv(r) : r))
  const { error } = await supabase.from(nome).insert(payload)
  if (error) { console.error(`✗ ${nome}: ${error.message}`); falhou = true }
  else console.log(`✓ ${nome}: ${rows.length}`)
}
process.exit(falhou ? 1 : 0)
