// Tipos do domínio (espelham supabase/migrations/0001_fundacao.sql).
// Manuais por ora; dá pra trocar por `supabase gen types` quando o projeto crescer.

export type ClienteStatus = "lead" | "qualificado" | "proposta" | "ativo" | "inativo"
export type ProjetoTipo = "one_off" | "recorrente"
export type ProjetoStatus = "proposta" | "ativo" | "pausado" | "concluido" | "cancelado"
export type ReuniaoTipo = "meet" | "ligacao" | "presencial"
export type ReuniaoStatus = "agendada" | "realizada" | "cancelada"
export type LeadStatus = "novo" | "em_contato" | "qualificado" | "descartado" | "convertido"

export type Cliente = {
  id: string
  nome: string
  cnpj: string | null
  segmento: string | null
  status: ClienteStatus
  origem: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export type Contato = {
  id: string
  cliente_id: string
  nome: string
  email: string | null
  telefone: string | null
  cargo: string | null
  principal: boolean
  created_at: string
}

export type Projeto = {
  id: string
  cliente_id: string
  nome: string
  tipo: ProjetoTipo
  valor: number | null
  custo: number | null // custo estimado (margem = valor − custo)
  status: ProjetoStatus
  data_inicio: string | null
  data_fim: string | null
  descricao: string | null
  created_at: string
  updated_at: string
}

export type Reuniao = {
  id: string
  cliente_id: string | null
  contato_id: string | null
  titulo: string
  data_hora: string
  tipo: ReuniaoTipo
  status: ReuniaoStatus
  notas: string | null
  follow_up: string | null
  created_at: string
}

export type Lead = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  empresa: string | null
  mensagem: string | null
  prefere_conversar: boolean
  melhor_horario: string | null
  melhor_canal: string | null
  origem: string
  status: LeadStatus
  cliente_id: string | null
  created_at: string
}

export type FaturaStatus = "rascunho" | "enviada" | "paga" | "atrasada" | "cancelada"
export type Fatura = {
  id: string
  cliente_id: string
  projeto_id: string | null
  descricao: string
  valor: number
  status: FaturaStatus
  emitida_em: string | null
  vencimento: string
  pago_em: string | null
  created_at: string
}

export type DespesaCategoria =
  | "ferramentas"
  | "infraestrutura"
  | "salarios"
  | "marketing"
  | "impostos"
  | "outros"
export type Despesa = {
  id: string
  descricao: string
  categoria: DespesaCategoria
  valor: number
  data: string
  recorrente: boolean
  created_at: string
}

// Negócio/oportunidade no funil comercial (separado do Cliente).
export type DealEtapa = "novo" | "qualificacao" | "proposta" | "negociacao" | "ganho" | "perdido"
export type Deal = {
  id: string
  cliente_id: string
  titulo: string
  valor: number
  etapa: DealEtapa
  probabilidade: number // 0–100
  fechamento_esperado: string // date
  responsavel: string
  ultima_atividade: string // iso — base do "deal parado"
  created_at: string
}

// Conta a pagar (status derivado de vencimento × pago_em).
export type ContaPagar = {
  id: string
  descricao: string
  categoria: DespesaCategoria
  valor: number
  vencimento: string // date
  pago_em: string | null
  recorrente: boolean
  created_at: string
}

// Proposta/orçamento (itens somam o valor).
export type PropostaStatus = "rascunho" | "enviada" | "aceita" | "recusada"
export type PropostaItem = { descricao: string; valor: number }
export type Proposta = {
  id: string
  cliente_id: string
  deal_id: string | null
  titulo: string
  itens: PropostaItem[]
  status: PropostaStatus
  enviada_em: string | null
  validade: string | null
  created_at: string
}

// Atividade na timeline de um cliente (agrega reuniões, propostas, faturas, notas).
export type AtividadeTipo = "reuniao" | "nota" | "proposta" | "fatura" | "etapa"
export type Atividade = {
  id: string
  cliente_id: string
  tipo: AtividadeTipo
  descricao: string
  data: string // iso
}

// Tarefa dentro de um projeto (board de execução).
export type TarefaStatus = "todo" | "doing" | "done"
export type Tarefa = {
  id: string
  projeto_id: string
  titulo: string
  status: TarefaStatus
  responsavel: string | null
}
