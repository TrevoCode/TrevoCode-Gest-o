// ─────────────────────────────────────────────────────────────────────────
// Camada de acesso a dados — ÚNICO ponto que conhece a origem dos dados.
// Hoje devolve MOCKS (para construir a UI sem backend). Quando ligar o
// Supabase, basta reescrever o corpo destas funções; as telas não mudam.
// As assinaturas já são async de propósito (igual serão as queries reais).
// ─────────────────────────────────────────────────────────────────────────
import type {
  Cliente, Contato, Projeto, Reuniao, Lead, Fatura, Despesa, Deal, DealEtapa,
  ContaPagar, Proposta, Atividade, AtividadeTipo, Tarefa,
  Membro, Meta, Marco, SolicitacaoDespesa, Contrato,
} from "@/lib/db/types"

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
  { id: "p1", cliente_id: "c1", nome: "App de delivery iOS/Android", tipo: "one_off", valor: 48000, custo: 28000, status: "ativo", data_inicio: dataSimples(-110), data_fim: dataSimples(20), descricao: "App nativo + painel de pedidos em tempo real.", created_at: iso(-110), updated_at: iso(-5) },
  { id: "p2", cliente_id: "c1", nome: "Manutenção e evolução", tipo: "recorrente", valor: 2500, custo: 1200, status: "ativo", data_inicio: dataSimples(-30), data_fim: null, descricao: "Suporte mensal e novas features.", created_at: iso(-30), updated_at: iso(-5) },
  { id: "p3", cliente_id: "c2", nome: "App de treino + ranking", tipo: "one_off", valor: 36000, custo: 21000, status: "ativo", data_inicio: dataSimples(-80), data_fim: dataSimples(40), descricao: "App de treinos, evolução e ranking de alunos.", created_at: iso(-80), updated_at: iso(-2) },
  { id: "p4", cliente_id: "c3", nome: "Catálogo + test-drive", tipo: "one_off", valor: 28000, custo: 17000, status: "proposta", data_inicio: null, data_fim: null, descricao: "Catálogo de veículos e agendamento de test-drive.", created_at: iso(-18), updated_at: iso(-3) },
  { id: "p5", cliente_id: "c4", nome: "Plataforma de teleconsulta", tipo: "one_off", valor: 60000, custo: 38000, status: "ativo", data_inicio: dataSimples(-180), data_fim: dataSimples(-10), descricao: "Agendamento, vídeo e prontuário eletrônico.", created_at: iso(-180), updated_at: iso(-10) },
  { id: "p6", cliente_id: "c4", nome: "Sustentação mensal", tipo: "recorrente", valor: 3800, custo: 1800, status: "ativo", data_inicio: dataSimples(-10), data_fim: null, descricao: "SLA de suporte e melhorias contínuas.", created_at: iso(-10), updated_at: iso(-10) },
  { id: "p7", cliente_id: "c6", nome: "Plataforma de cursos", tipo: "one_off", valor: 42000, custo: 26000, status: "concluido", data_inicio: dataSimples(-390), data_fim: dataSimples(-70), descricao: "LMS com aulas, certificados e pagamentos.", created_at: iso(-390), updated_at: iso(-70) },
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
  { id: "f8", cliente_id: "c4", projeto_id: "p6", descricao: "Sustentação — próximo ciclo", valor: 3800, status: "enviada", emitida_em: dataSimples(-1), vencimento: dataSimples(18), pago_em: null, created_at: iso(-1) },
  { id: "f9", cliente_id: "c1", projeto_id: "p2", descricao: "Manutenção — próximo ciclo", valor: 2500, status: "enviada", emitida_em: dataSimples(-1), vencimento: dataSimples(25), pago_em: null, created_at: iso(-1) },
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

const deals: Deal[] = [
  { id: "dl1", cliente_id: "c5", titulo: "Portal do corretor — fase 2", valor: 18000, etapa: "novo", probabilidade: 20, fechamento_esperado: dataSimples(30), responsavel: "Yuri", ultima_atividade: iso(0), created_at: iso(-1) },
  { id: "dl2", cliente_id: "c3", titulo: "Integração de estoque", valor: 15000, etapa: "qualificacao", probabilidade: 35, fechamento_esperado: dataSimples(21), responsavel: "Fabrício", ultima_atividade: iso(-3), created_at: iso(-6) },
  { id: "dl3", cliente_id: "c3", titulo: "Catálogo + test-drive", valor: 28000, etapa: "proposta", probabilidade: 50, fechamento_esperado: dataSimples(14), responsavel: "Fabrício", ultima_atividade: iso(-9), created_at: iso(-18) },
  { id: "dl4", cliente_id: "c5", titulo: "Busca + agendamento de visitas", valor: 32000, etapa: "negociacao", probabilidade: 70, fechamento_esperado: dataSimples(10), responsavel: "Yuri", ultima_atividade: iso(-1), created_at: iso(-9) },
  { id: "dl5", cliente_id: "c1", titulo: "Módulo de fidelidade", valor: 12000, etapa: "negociacao", probabilidade: 60, fechamento_esperado: dataSimples(7), responsavel: "Yuri", ultima_atividade: iso(-6), created_at: iso(-12) },
  { id: "dl6", cliente_id: "c2", titulo: "App treino — fase 2", valor: 20000, etapa: "ganho", probabilidade: 100, fechamento_esperado: dataSimples(-2), responsavel: "Fabrício", ultima_atividade: iso(-2), created_at: iso(-15) },
  { id: "dl7", cliente_id: "c6", titulo: "Reativação da plataforma", valor: 25000, etapa: "perdido", probabilidade: 0, fechamento_esperado: dataSimples(-10), responsavel: "Yuri", ultima_atividade: iso(-10), created_at: iso(-30) },
]

const contasPagar: ContaPagar[] = [
  { id: "cp1", descricao: "Folha + PJ da equipe", categoria: "salarios", valor: 38000, vencimento: dataSimples(3), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp2", descricao: "Vercel + Supabase + Cloudflare", categoria: "infraestrutura", valor: 1200, vencimento: dataSimples(8), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp3", descricao: "DAS — Simples Nacional", categoria: "impostos", valor: 4200, vencimento: dataSimples(5), pago_em: null, recorrente: false, created_at: iso(-2) },
  { id: "cp4", descricao: "Google Workspace", categoria: "ferramentas", valor: 600, vencimento: dataSimples(-2), pago_em: null, recorrente: true, created_at: iso(-8) },
  { id: "cp5", descricao: "Anúncios Meta e Google", categoria: "marketing", valor: 2500, vencimento: dataSimples(12), pago_em: null, recorrente: false, created_at: iso(-2) },
  { id: "cp6", descricao: "Contador", categoria: "outros", valor: 950, vencimento: dataSimples(6), pago_em: null, recorrente: true, created_at: iso(-2) },
  { id: "cp7", descricao: "Folha + PJ (próximo mês)", categoria: "salarios", valor: 38000, vencimento: dataSimples(33), pago_em: null, recorrente: true, created_at: iso(-1) },
  { id: "cp8", descricao: "Figma + GitHub", categoria: "ferramentas", valor: 450, vencimento: dataSimples(-6), pago_em: dataSimples(-6), recorrente: true, created_at: iso(-8) },
]

const propostas: Proposta[] = [
  { id: "pr1", cliente_id: "c3", deal_id: "dl3", titulo: "Catálogo + test-drive", status: "enviada", enviada_em: dataSimples(-8), validade: dataSimples(7), created_at: iso(-8), itens: [
    { descricao: "Catálogo de veículos", valor: 16000 }, { descricao: "Agendamento de test-drive", valor: 8000 }, { descricao: "Integração com o site", valor: 4000 },
  ] },
  { id: "pr2", cliente_id: "c5", deal_id: "dl4", titulo: "Busca + agendamento de visitas", status: "enviada", enviada_em: dataSimples(-3), validade: dataSimples(12), created_at: iso(-3), itens: [
    { descricao: "Busca de imóveis", valor: 18000 }, { descricao: "Agendamento de visitas", valor: 10000 }, { descricao: "Painel do corretor", valor: 4000 },
  ] },
  { id: "pr3", cliente_id: "c1", deal_id: "dl5", titulo: "Módulo de fidelidade", status: "rascunho", enviada_em: null, validade: null, created_at: iso(-1), itens: [
    { descricao: "Programa de pontos", valor: 8000 }, { descricao: "Integração com o app", valor: 4000 },
  ] },
  { id: "pr4", cliente_id: "c2", deal_id: "dl6", titulo: "App treino — fase 2", status: "aceita", enviada_em: dataSimples(-12), validade: dataSimples(-2), created_at: iso(-14), itens: [
    { descricao: "Novas telas de evolução", valor: 12000 }, { descricao: "Gamificação", valor: 8000 },
  ] },
  { id: "pr5", cliente_id: "c6", deal_id: null, titulo: "Reativação da plataforma", status: "recusada", enviada_em: dataSimples(-25), validade: dataSimples(-10), created_at: iso(-28), itens: [
    { descricao: "Auditoria técnica", valor: 5000 }, { descricao: "Reescrita do core", valor: 20000 },
  ] },
]

const tarefas: Tarefa[] = [
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

const notas: Atividade[] = [
  { id: "n1", cliente_id: "c1", tipo: "nota", descricao: "Cliente elogiou o app e pediu relatório de pedidos.", data: iso(-6, 17) },
  { id: "n2", cliente_id: "c5", tipo: "nota", descricao: "Negociação avançando — decisor engajado.", data: iso(-1, 11) },
  { id: "n3", cliente_id: "c3", tipo: "nota", descricao: "Aguardando retorno da proposta enviada.", data: iso(-7, 9) },
  { id: "n4", cliente_id: "c4", tipo: "nota", descricao: "Renovou sustentação por mais 12 meses.", data: iso(-10, 15) },
]

const membros: Membro[] = [
  { id: "m1", nome: "Yuri", papel: "Sócio · Full-stack", capacidadeSemanal: 40, custoHora: 120 },
  { id: "m2", nome: "Fabrício", papel: "Sócio · Full-stack", capacidadeSemanal: 40, custoHora: 120 },
  { id: "m3", nome: "Marina", papel: "Design de produto", capacidadeSemanal: 40, custoHora: 80 },
  { id: "m4", nome: "Lucas", papel: "Dev mobile", capacidadeSemanal: 40, custoHora: 70 },
]

const meta: Meta = { receitaMeta: 45000, despesaMeta: 50000, mrrMeta: 10000 }

const marcos: Marco[] = [
  { id: "ms1", projeto_id: "p1", titulo: "Kickoff e setup", data: dataSimples(-110), concluido: true },
  { id: "ms2", projeto_id: "p1", titulo: "MVP navegável", data: dataSimples(-40), concluido: true },
  { id: "ms3", projeto_id: "p1", titulo: "Beta com pagamento", data: dataSimples(5), concluido: false },
  { id: "ms4", projeto_id: "p1", titulo: "Publicação nas lojas", data: dataSimples(20), concluido: false },
  { id: "ms5", projeto_id: "p3", titulo: "Treinos e ranking", data: dataSimples(-20), concluido: true },
  { id: "ms6", projeto_id: "p3", titulo: "Entrega final", data: dataSimples(40), concluido: false },
  { id: "ms7", projeto_id: "p5", titulo: "Go-live da teleconsulta", data: dataSimples(-10), concluido: true },
]

const solicitacoes: SolicitacaoDespesa[] = [
  { id: "sd1", descricao: "Reembolso — domínio e SSL", categoria: "infraestrutura", valor: 320, solicitante: "Marina", data: dataSimples(-1), status: "pendente" },
  { id: "sd2", descricao: "Curso de React Native", categoria: "outros", valor: 890, solicitante: "Lucas", data: dataSimples(-2), status: "pendente" },
  { id: "sd3", descricao: "Plugin de design (Figma)", categoria: "ferramentas", valor: 180, solicitante: "Marina", data: dataSimples(-5), status: "aprovada" },
  { id: "sd4", descricao: "Almoço com cliente", categoria: "marketing", valor: 240, solicitante: "Yuri", data: dataSimples(-8), status: "aprovada" },
]

const contratos: Contrato[] = [
  { id: "k1", cliente_id: "c2", titulo: "App treino — fase 2", valor: 20000, tipo: "projeto", status: "assinado", vigencia_inicio: dataSimples(-10), vigencia_fim: dataSimples(80), assinado_em: dataSimples(-9) },
  { id: "k2", cliente_id: "c4", titulo: "Sustentação mensal", valor: 3800, tipo: "recorrente", status: "assinado", vigencia_inicio: dataSimples(-10), vigencia_fim: dataSimples(355), assinado_em: dataSimples(-10) },
  { id: "k3", cliente_id: "c1", titulo: "Manutenção e evolução", valor: 2500, tipo: "recorrente", status: "assinado", vigencia_inicio: dataSimples(-30), vigencia_fim: dataSimples(335), assinado_em: dataSimples(-29) },
  { id: "k4", cliente_id: "c3", titulo: "Catálogo + test-drive", valor: 28000, tipo: "projeto", status: "enviado", vigencia_inicio: null, vigencia_fim: null, assinado_em: null },
  { id: "k5", cliente_id: "c5", titulo: "Busca + agendamento de visitas", valor: 32000, tipo: "projeto", status: "rascunho", vigencia_inicio: null, vigencia_fim: null, assinado_em: null },
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

// ───────────────────────── pipeline (comercial) ─────────────────────────
export type DealView = Deal & { clienteNome: string; diasParado: number }

const ETAPAS_PIPE: { etapa: DealEtapa; label: string }[] = [
  { etapa: "novo", label: "Novo" },
  { etapa: "qualificacao", label: "Qualificação" },
  { etapa: "proposta", label: "Proposta" },
  { etapa: "negociacao", label: "Negociação" },
  { etapa: "ganho", label: "Ganho" },
]

function dealView(d: Deal): DealView {
  return {
    ...d,
    clienteNome: nomeCliente(d.cliente_id) ?? "—",
    diasParado: Math.floor((agora - new Date(d.ultima_atividade).getTime()) / DIA),
  }
}

export async function obterPipeline() {
  const colunas = ETAPAS_PIPE.map(({ etapa, label }) => {
    const items = deals.filter((d) => d.etapa === etapa).map(dealView)
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

// ───────────────────────── contas a pagar + fluxo ─────────────────────────
export type ContaPagarView = ContaPagar & { situacao: "a_vencer" | "vencida" | "paga" }

const hojeISO = new Date(agora).toISOString().slice(0, 10)
function situacaoConta(c: ContaPagar): ContaPagarView["situacao"] {
  if (c.pago_em) return "paga"
  return c.vencimento < hojeISO ? "vencida" : "a_vencer"
}

export async function listarContasPagar(): Promise<ContaPagarView[]> {
  return [...contasPagar]
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((c) => ({ ...c, situacao: situacaoConta(c) }))
}

export type SemanaFluxo = { label: string; entradas: number; saidas: number; saldo: number }

// Saldo projetado semana a semana: saldo atual + faturas a receber − contas a pagar.
export async function obterFluxoProjetado(saldoInicial = 28500, semanas = 6) {
  const baseMs = new Date(new Date(agora).setHours(0, 0, 0, 0)).getTime()
  const entradas = faturas
    .filter((f) => f.status === "enviada" || f.status === "atrasada")
    .map((f) => ({ data: f.vencimento, valor: f.valor }))
  const saidas = contasPagar
    .filter((c) => !c.pago_em)
    .map((c) => ({ data: c.vencimento, valor: c.valor }))

  const soma = (arr: { data: string; valor: number }[], ini: string, fim: string) =>
    arr.filter((x) => x.data >= ini && x.data < fim).reduce((s, x) => s + x.valor, 0)

  let saldo = saldoInicial
  const linha: SemanaFluxo[] = []
  for (let i = 0; i < semanas; i++) {
    const ini = new Date(baseMs + i * 7 * DIA).toISOString().slice(0, 10)
    const fim = new Date(baseMs + (i + 1) * 7 * DIA).toISOString().slice(0, 10)
    const e = soma(entradas, ini, fim)
    const s = soma(saidas, ini, fim)
    saldo += e - s
    linha.push({ label: `Sem ${i + 1}`, entradas: e, saidas: s, saldo })
  }
  return { saldoInicial, linha }
}

// ───────────────────────── propostas ─────────────────────────
export type PropostaView = Proposta & { clienteNome: string; total: number }
const totalProposta = (p: Proposta) => p.itens.reduce((s, i) => s + i.valor, 0)

export async function listarPropostas(): Promise<PropostaView[]> {
  return [...propostas]
    .sort((a, b) => (b.enviada_em ?? b.created_at).localeCompare(a.enviada_em ?? a.created_at))
    .map((p) => ({ ...p, clienteNome: nomeCliente(p.cliente_id) ?? "—", total: totalProposta(p) }))
}

export async function obterProposta(id: string): Promise<PropostaView | null> {
  const p = propostas.find((x) => x.id === id)
  if (!p) return null
  return { ...p, clienteNome: nomeCliente(p.cliente_id) ?? "—", total: totalProposta(p) }
}

// ───────────────────────── timeline do cliente ─────────────────────────
const aoMeioDia = (d: string) => `${d}T12:00:00.000Z`

export async function montarTimeline(clienteId: string): Promise<Atividade[]> {
  const itens: Atividade[] = []
  reunioes.filter((r) => r.cliente_id === clienteId).forEach((r) =>
    itens.push({ id: `r-${r.id}`, cliente_id: clienteId, tipo: "reuniao", descricao: `${r.status === "realizada" ? "Reunião realizada" : "Reunião agendada"}: ${r.titulo}`, data: r.data_hora }))
  propostas.filter((p) => p.cliente_id === clienteId && p.enviada_em).forEach((p) =>
    itens.push({ id: `p-${p.id}`, cliente_id: clienteId, tipo: "proposta", descricao: `Proposta ${p.status}: ${p.titulo}`, data: aoMeioDia(p.enviada_em!) }))
  faturas.filter((f) => f.cliente_id === clienteId && f.emitida_em).forEach((f) =>
    itens.push({ id: `f-${f.id}`, cliente_id: clienteId, tipo: "fatura", descricao: `Fatura ${f.status}: ${f.descricao}`, data: aoMeioDia(f.emitida_em!) }))
  notas.filter((n) => n.cliente_id === clienteId).forEach((n) => itens.push(n))
  return itens.sort((a, b) => b.data.localeCompare(a.data))
}

// ───────────────────────── forecast (previsão por mês) ─────────────────────────
export async function obterForecast() {
  const emAberto = deals.filter((d) => d.etapa !== "ganho" && d.etapa !== "perdido")
  const meses = new Map<string, { valor: number; ponderado: number; n: number }>()
  for (const d of emAberto) {
    const mes = d.fechamento_esperado.slice(0, 7)
    const cur = meses.get(mes) ?? { valor: 0, ponderado: 0, n: 0 }
    cur.valor += d.valor
    cur.ponderado += d.valor * (d.probabilidade / 100)
    cur.n += 1
    meses.set(mes, cur)
  }
  return [...meses.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, v]) => ({ mes, valor: v.valor, ponderado: Math.round(v.ponderado), n: v.n }))
}

// ───────────────────────── projeto (detalhe) ─────────────────────────
export type ProjetoDetalhe = Projeto & {
  clienteNome: string
  tarefas: Tarefa[]
  margem: number | null
  margemPct: number | null
}

export async function obterProjeto(id: string): Promise<ProjetoDetalhe | null> {
  const p = projetos.find((x) => x.id === id)
  if (!p) return null
  const margem = p.valor != null && p.custo != null ? p.valor - p.custo : null
  const margemPct = margem != null && p.valor ? Math.round((margem / p.valor) * 100) : null
  return {
    ...p,
    clienteNome: nomeCliente(p.cliente_id) ?? "—",
    tarefas: tarefas.filter((t) => t.projeto_id === id),
    margem,
    margemPct,
  }
}

// ───────────────────────── relatórios ─────────────────────────
const CATS_DESPESA = ["salarios", "infraestrutura", "ferramentas", "marketing", "impostos", "outros"] as const

// DRE gerencial do mês (regime de caixa simplificado).
export async function obterDRE() {
  const receita = faturas
    .filter((f) => f.status === "paga" && noMes(f.pago_em))
    .reduce((s, f) => s + f.valor, 0)
  const custos = CATS_DESPESA
    .map((cat) => ({ categoria: cat, total: despesas.filter((d) => noMes(d.data) && d.categoria === cat).reduce((s, d) => s + d.valor, 0) }))
    .filter((c) => c.total > 0)
  const totalCustos = custos.reduce((s, c) => s + c.total, 0)
  const resultado = receita - totalCustos
  return { receita, custos, totalCustos, resultado, margem: receita ? Math.round((resultado / receita) * 100) : 0 }
}

// Receita recorrente (MRR) vs custo fixo mensal.
export async function obterRecorrencias() {
  const receitas = projetos
    .filter((p) => p.tipo === "recorrente" && p.status === "ativo")
    .map((p) => ({ nome: p.nome, cliente: nomeCliente(p.cliente_id) ?? "—", valor: p.valor ?? 0 }))
  const custos = despesas
    .filter((d) => d.recorrente)
    .map((d) => ({ nome: d.descricao, categoria: d.categoria, valor: d.valor }))
  const mrr = receitas.reduce((s, r) => s + r.valor, 0)
  const custoFixo = custos.reduce((s, c) => s + c.valor, 0)
  return { mrr, custoFixo, resultadoRecorrente: mrr - custoFixo, receitas, custos }
}

// Funil de vendas: distribuição por etapa + taxa de ganho.
export async function obterFunilVendas() {
  const etapas: { etapa: DealEtapa; label: string }[] = [
    { etapa: "novo", label: "Novo" },
    { etapa: "qualificacao", label: "Qualificação" },
    { etapa: "proposta", label: "Proposta" },
    { etapa: "negociacao", label: "Negociação" },
    { etapa: "ganho", label: "Ganho" },
    { etapa: "perdido", label: "Perdido" },
  ]
  const porEtapa = etapas.map((e) => {
    const ds = deals.filter((d) => d.etapa === e.etapa)
    return { ...e, n: ds.length, valor: ds.reduce((s, d) => s + d.valor, 0) }
  })
  const ganhos = deals.filter((d) => d.etapa === "ganho").length
  const fechados = deals.filter((d) => d.etapa === "ganho" || d.etapa === "perdido").length
  return { porEtapa, ganhos, fechados, taxaGanho: fechados ? Math.round((ganhos / fechados) * 100) : 0 }
}

// ───────────────────────── tesouraria (cobrança + conciliação) ─────────────────────────
const addDias = (d: string, n: number) =>
  new Date(new Date(`${d}T12:00:00`).getTime() + n * DIA).toISOString().slice(0, 10)

export async function obterTesouraria() {
  const cobrancas = faturas
    .filter((f) => f.status === "enviada" || f.status === "atrasada")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((f) => ({
      id: f.id,
      descricao: f.descricao,
      clienteNome: nomeCliente(f.cliente_id) ?? "—",
      valor: f.valor,
      vencimento: f.vencimento,
      status: f.status,
      lembretes: [
        { label: "3 dias antes", data: addDias(f.vencimento, -3) },
        { label: "No vencimento", data: f.vencimento },
        { label: "3 dias após", data: addDias(f.vencimento, 3) },
        { label: "7 dias após", data: addDias(f.vencimento, 7) },
      ].map((l) => ({ ...l, enviado: l.data < hojeISO })),
    }))

  const transacoes = [
    { id: "tx1", data: dataSimples(-5), descricao: "PIX recebido — Sabor & Cia", valor: 16000, tipo: "entrada" as const, match: "App delivery — marco 2" },
    { id: "tx2", data: dataSimples(-2), descricao: "PIX recebido — AcademiaFit", valor: 12000, tipo: "entrada" as const, match: "App treino — entrada" },
    { id: "tx3", data: dataSimples(-6), descricao: "Débito — Google Workspace", valor: 600, tipo: "saida" as const, match: "Google Workspace" },
    { id: "tx4", data: dataSimples(-3), descricao: "TED — Anúncios Meta e Google", valor: 2500, tipo: "saida" as const, match: null },
    { id: "tx5", data: dataSimples(-1), descricao: "PIX recebido — não identificado", valor: 3800, tipo: "entrada" as const, match: null },
  ]
  return { cobrancas, transacoes }
}

// ───────────────────────── equipe & capacidade ─────────────────────────
export async function obterEquipe() {
  return membros.map((m) => {
    const doing = tarefas.filter((t) => t.responsavel === m.nome && t.status === "doing").length
    const todo = tarefas.filter((t) => t.responsavel === m.nome && t.status === "todo").length
    const dealsAbertos = deals.filter((d) => d.responsavel === m.nome && d.etapa !== "ganho" && d.etapa !== "perdido").length
    const projetos = new Set(tarefas.filter((t) => t.responsavel === m.nome).map((t) => t.projeto_id)).size
    return { ...m, doing, todo, dealsAbertos, projetos, ocupacao: Math.min(100, doing * 32 + todo * 12) }
  })
}

// ───────────────────────── planejamento (metas + cenários) ─────────────────────────
export async function obterPlanejamento() {
  const receitaReal = faturas.filter((f) => f.status === "paga" && noMes(f.pago_em)).reduce((s, f) => s + f.valor, 0)
  const despesaReal = despesas.filter((d) => noMes(d.data)).reduce((s, d) => s + d.valor, 0)
  const mrrReal = projetos.filter((p) => p.tipo === "recorrente" && p.status === "ativo").reduce((s, p) => s + (p.valor ?? 0), 0)
  return {
    receita: { meta: meta.receitaMeta, real: receitaReal },
    despesa: { meta: meta.despesaMeta, real: despesaReal },
    mrr: { meta: meta.mrrMeta, real: mrrReal },
  }
}

// Saldo projetado final em 3 cenários (ajuste de recebimentos).
export async function obterCenarios() {
  const base = await obterFluxoProjetado()
  const saldoFinal = base.linha[base.linha.length - 1]?.saldo ?? base.saldoInicial
  const totalEntradas = base.linha.reduce((s, l) => s + l.entradas, 0)
  return {
    pessimista: saldoFinal - Math.round(totalEntradas * 0.3),
    realista: saldoFinal,
    otimista: saldoFinal + Math.round(totalEntradas * 0.15),
  }
}

export async function listarSolicitacoes(): Promise<SolicitacaoDespesa[]> {
  return [...solicitacoes].sort((a, b) => b.data.localeCompare(a.data))
}

// ───────────────────────── marcos & contratos ─────────────────────────
export async function listarMarcos(projetoId: string): Promise<Marco[]> {
  return marcos.filter((m) => m.projeto_id === projetoId).sort((a, b) => a.data.localeCompare(b.data))
}

export type ContratoView = Contrato & { clienteNome: string }
export async function listarContratos(): Promise<ContratoView[]> {
  return [...contratos]
    .sort((a, b) => (b.assinado_em ?? "0").localeCompare(a.assinado_em ?? "0"))
    .map((k) => ({ ...k, clienteNome: nomeCliente(k.cliente_id) ?? "—" }))
}
