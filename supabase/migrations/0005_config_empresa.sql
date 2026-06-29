-- Dados da empresa (singleton) usados em propostas, contratos e faturas.
create table if not exists public.config_empresa (
  id            int primary key default 1 check (id = 1),
  razao_social  text,
  nome_fantasia text,
  cnpj          text,
  regime        text,
  email         text,
  endereco      text,
  atualizado_em timestamptz not null default now()
);

alter table public.config_empresa enable row level security;

-- permissiva base + restritiva por allowlist (mesmo padrão das demais tabelas)
drop policy if exists config_empresa_rw on public.config_empresa;
create policy config_empresa_rw on public.config_empresa
  for all to authenticated using (true) with check (true);

drop policy if exists membros_only on public.config_empresa;
create policy membros_only on public.config_empresa
  as restrictive for all to authenticated
  using (public.is_membro()) with check (public.is_membro());
