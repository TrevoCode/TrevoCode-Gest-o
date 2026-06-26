-- Fundação da plataforma de gestão TrevoCode (Fase 0)
-- Modelo unificado: lead (site) → cliente → projeto · reunião
--
-- Aplicar via Supabase SQL Editor ou `supabase db push`.
-- RLS: a área /app é um cockpit de gestores (a allowlist por e-mail já filtra
-- quem loga). No banco, qualquer usuário AUTENTICADO tem CRUD total; o INSERT
-- de leads vindo do site público entra via service-role (rota /api/leads),
-- que ignora RLS — por isso não há policy de INSERT anônimo aqui.

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── clientes ─────────────────────────
create table public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cnpj        text,
  segmento    text,
  status      text not null default 'lead'
                check (status in ('lead','qualificado','proposta','ativo','inativo')),
  origem      text,                 -- site, indicação, outbound...
  observacoes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index clientes_status_idx on public.clientes (status);

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

-- ───────────────────────── contatos ─────────────────────────
create table public.contatos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  nome       text not null,
  email      text,
  telefone   text,
  cargo      text,
  principal  boolean not null default false,
  created_at timestamptz not null default now()
);
create index contatos_cliente_idx on public.contatos (cliente_id);

-- ───────────────────────── projetos ─────────────────────────
create table public.projetos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes (id) on delete restrict,
  nome        text not null,
  tipo        text not null default 'one_off'
                check (tipo in ('one_off','recorrente')),
  valor       numeric(14,2),        -- valor do contrato (recorrente = por ciclo)
  status      text not null default 'proposta'
                check (status in ('proposta','ativo','pausado','concluido','cancelado')),
  data_inicio date,
  data_fim    date,
  descricao   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index projetos_cliente_idx on public.projetos (cliente_id);
create index projetos_status_idx  on public.projetos (status);

create trigger projetos_set_updated_at
  before update on public.projetos
  for each row execute function public.set_updated_at();

-- ───────────────────────── reuniões ─────────────────────────
create table public.reunioes (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid references public.clientes (id) on delete set null,
  contato_id  uuid references public.contatos (id) on delete set null,
  titulo      text not null,
  data_hora   timestamptz not null,
  tipo        text not null default 'meet'
                check (tipo in ('meet','ligacao','presencial')),
  status      text not null default 'agendada'
                check (status in ('agendada','realizada','cancelada')),
  notas       text,
  follow_up   text,
  created_at  timestamptz not null default now()
);
create index reunioes_data_idx    on public.reunioes (data_hora);
create index reunioes_cliente_idx on public.reunioes (cliente_id);

-- ───────────────────────── leads (inbox do site) ─────────────────────────
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  email             text,
  telefone          text,
  empresa           text,
  mensagem          text,                 -- "ideia" do formulário
  prefere_conversar boolean not null default false,
  melhor_horario    text,                 -- manha, tarde, final
  melhor_canal      text,                 -- whatsapp, ligacao, meet, email
  origem            text not null default 'site',
  status            text not null default 'novo'
                      check (status in ('novo','em_contato','qualificado','descartado','convertido')),
  cliente_id        uuid references public.clientes (id) on delete set null,  -- preenchido ao promover
  created_at        timestamptz not null default now()
);
create index leads_status_idx on public.leads (status);
create index leads_data_idx   on public.leads (created_at desc);

-- ───────────────────────── RLS ─────────────────────────
alter table public.clientes  enable row level security;
alter table public.contatos  enable row level security;
alter table public.projetos  enable row level security;
alter table public.reunioes  enable row level security;
alter table public.leads     enable row level security;

-- Usuário autenticado (equipe que passou pela allowlist) tem CRUD total.
create policy clientes_authenticated on public.clientes
  for all to authenticated using (true) with check (true);
create policy contatos_authenticated on public.contatos
  for all to authenticated using (true) with check (true);
create policy projetos_authenticated on public.projetos
  for all to authenticated using (true) with check (true);
create policy reunioes_authenticated on public.reunioes
  for all to authenticated using (true) with check (true);
create policy leads_authenticated on public.leads
  for all to authenticated using (true) with check (true);
-- INSERT público de leads NÃO tem policy: entra só via service-role (/api/leads).
