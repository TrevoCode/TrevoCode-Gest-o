-- Completa o schema: comercial (deals/propostas/contratos), execução
-- (tarefas/marcos/equipe), planejamento (metas/aprovações) e contas a pagar.
-- Padrão das anteriores: RLS com CRUD total para usuários autenticados.

-- projetos ganham custo estimado (margem = valor − custo)
alter table public.projetos add column if not exists custo numeric(14,2);

-- ───────────────────────── contas a pagar ─────────────────────────
create table public.contas_a_pagar (
  id         uuid primary key default gen_random_uuid(),
  descricao  text not null,
  categoria  text not null default 'outros'
               check (categoria in ('ferramentas','infraestrutura','salarios','marketing','impostos','outros')),
  valor      numeric(14,2) not null,
  vencimento date not null,
  pago_em    date,
  recorrente boolean not null default false,
  created_at timestamptz not null default now()
);
create index contas_a_pagar_venc_idx on public.contas_a_pagar (vencimento);

-- ───────────────────────── deals (pipeline) ─────────────────────────
create table public.deals (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references public.clientes (id) on delete cascade,
  titulo              text not null,
  valor               numeric(14,2) not null default 0,
  etapa               text not null default 'novo'
                        check (etapa in ('novo','qualificacao','proposta','negociacao','ganho','perdido')),
  probabilidade       int not null default 0 check (probabilidade between 0 and 100),
  fechamento_esperado date,
  responsavel         text,
  ultima_atividade    timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index deals_cliente_idx on public.deals (cliente_id);
create index deals_etapa_idx   on public.deals (etapa);

-- ───────────────────────── propostas ─────────────────────────
create table public.propostas (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  deal_id    uuid references public.deals (id) on delete set null,
  titulo     text not null,
  itens      jsonb not null default '[]',  -- [{ descricao, valor }]
  status     text not null default 'rascunho'
               check (status in ('rascunho','enviada','aceita','recusada')),
  enviada_em date,
  validade   date,
  created_at timestamptz not null default now()
);
create index propostas_cliente_idx on public.propostas (cliente_id);

-- ───────────────────────── contratos ─────────────────────────
create table public.contratos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes (id) on delete restrict,
  titulo          text not null,
  valor           numeric(14,2) not null default 0,
  tipo            text not null default 'projeto' check (tipo in ('projeto','recorrente')),
  status          text not null default 'rascunho' check (status in ('rascunho','enviado','assinado')),
  vigencia_inicio date,
  vigencia_fim    date,
  assinado_em     date,
  created_at      timestamptz not null default now()
);
create index contratos_cliente_idx on public.contratos (cliente_id);

-- ───────────────────────── tarefas (projeto) ─────────────────────────
create table public.tarefas (
  id          uuid primary key default gen_random_uuid(),
  projeto_id  uuid not null references public.projetos (id) on delete cascade,
  titulo      text not null,
  status      text not null default 'todo' check (status in ('todo','doing','done')),
  responsavel text,
  created_at  timestamptz not null default now()
);
create index tarefas_projeto_idx on public.tarefas (projeto_id);

-- ───────────────────────── marcos (milestones) ─────────────────────────
create table public.marcos (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references public.projetos (id) on delete cascade,
  titulo     text not null,
  data       date not null,
  concluido  boolean not null default false
);
create index marcos_projeto_idx on public.marcos (projeto_id);

-- ───────────────────────── equipe ─────────────────────────
create table public.membros (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  papel              text,
  capacidade_semanal int not null default 40,
  custo_hora         numeric(10,2) not null default 0,
  created_at         timestamptz not null default now()
);

-- ───────────────────────── metas (orçado) ─────────────────────────
create table public.metas (
  id           uuid primary key default gen_random_uuid(),
  mes          date,
  receita_meta numeric(14,2) not null default 0,
  despesa_meta numeric(14,2) not null default 0,
  mrr_meta     numeric(14,2) not null default 0
);

-- ───────────────────────── solicitações de despesa ─────────────────────────
create table public.solicitacoes_despesa (
  id          uuid primary key default gen_random_uuid(),
  descricao   text not null,
  categoria   text not null default 'outros'
                check (categoria in ('ferramentas','infraestrutura','salarios','marketing','impostos','outros')),
  valor       numeric(14,2) not null,
  solicitante text,
  data        date not null,
  status      text not null default 'pendente' check (status in ('pendente','aprovada','rejeitada')),
  created_at  timestamptz not null default now()
);

-- ───────────────────────── RLS ─────────────────────────
alter table public.contas_a_pagar       enable row level security;
alter table public.deals                 enable row level security;
alter table public.propostas             enable row level security;
alter table public.contratos             enable row level security;
alter table public.tarefas               enable row level security;
alter table public.marcos                enable row level security;
alter table public.membros               enable row level security;
alter table public.metas                 enable row level security;
alter table public.solicitacoes_despesa  enable row level security;

create policy contas_a_pagar_authenticated      on public.contas_a_pagar      for all to authenticated using (true) with check (true);
create policy deals_authenticated               on public.deals               for all to authenticated using (true) with check (true);
create policy propostas_authenticated           on public.propostas           for all to authenticated using (true) with check (true);
create policy contratos_authenticated           on public.contratos           for all to authenticated using (true) with check (true);
create policy tarefas_authenticated             on public.tarefas             for all to authenticated using (true) with check (true);
create policy marcos_authenticated              on public.marcos              for all to authenticated using (true) with check (true);
create policy membros_authenticated             on public.membros             for all to authenticated using (true) with check (true);
create policy metas_authenticated               on public.metas               for all to authenticated using (true) with check (true);
create policy solicitacoes_despesa_authenticated on public.solicitacoes_despesa for all to authenticated using (true) with check (true);
