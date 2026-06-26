-- Financeiro: faturamento e despesas (Fase 2)
-- Mantém o padrão da 0001: RLS com CRUD para autenticados.

-- ───────────────────────── faturas ─────────────────────────
create table public.faturas (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  projeto_id uuid references public.projetos (id) on delete set null,
  descricao  text not null,
  valor      numeric(14,2) not null,
  status     text not null default 'rascunho'
               check (status in ('rascunho','enviada','paga','atrasada','cancelada')),
  emitida_em date,
  vencimento date not null,
  pago_em    date,
  created_at timestamptz not null default now()
);
create index faturas_cliente_idx on public.faturas (cliente_id);
create index faturas_status_idx  on public.faturas (status);
create index faturas_venc_idx    on public.faturas (vencimento);

-- ───────────────────────── despesas ─────────────────────────
create table public.despesas (
  id         uuid primary key default gen_random_uuid(),
  descricao  text not null,
  categoria  text not null default 'outros'
               check (categoria in ('ferramentas','infraestrutura','salarios','marketing','impostos','outros')),
  valor      numeric(14,2) not null,
  data       date not null,
  recorrente boolean not null default false,
  created_at timestamptz not null default now()
);
create index despesas_data_idx      on public.despesas (data);
create index despesas_categoria_idx on public.despesas (categoria);

-- ───────────────────────── RLS ─────────────────────────
alter table public.faturas  enable row level security;
alter table public.despesas enable row level security;

create policy faturas_authenticated on public.faturas
  for all to authenticated using (true) with check (true);
create policy despesas_authenticated on public.despesas
  for all to authenticated using (true) with check (true);
