-- Saldo de caixa atual (ponto de partida do fluxo projetado) — antes era um
-- número fixo no código (R$ 28.500). Passa a ser informado em Configurações.
alter table public.config_empresa
  add column if not exists saldo_caixa numeric(14, 2) not null default 0;
