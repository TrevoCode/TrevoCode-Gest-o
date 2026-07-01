-- Recria a tabela public.leads (inbox do site), removida do banco num
-- DROP CASCADE anterior. Sem ela, /app/leads e as server actions
-- promoverLead/editarLead/mudarStatusLead quebram em runtime.
-- RLS já no modelo consolidado (0008): uma policy permissiva por is_membro().
-- Inserts do site público entram via service-role (ignora RLS).

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  email             text,
  telefone          text,
  empresa           text,
  mensagem          text,
  prefere_conversar boolean not null default false,
  melhor_horario    text,
  melhor_canal      text,
  origem            text not null default 'site',
  status            text not null default 'novo'
                      check (status in ('novo','em_contato','qualificado','descartado','convertido')),
  cliente_id        uuid references public.clientes (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_data_idx   on public.leads (created_at desc);

alter table public.leads enable row level security;
drop policy if exists membros_only on public.leads;
create policy membros_only on public.leads
  as permissive for all to authenticated
  using (public.is_membro()) with check (public.is_membro());
