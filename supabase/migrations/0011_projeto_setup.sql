-- Serviço recorrente tem DOIS números: implementação (setup, uma vez) + mensalidade.
-- Antes existia só `valor` (single). Agora, em projetos recorrentes:
--   valor       = MENSALIDADE (alimenta o MRR — mantém o cálculo correto)
--   valor_setup = IMPLEMENTAÇÃO (taxa única de entrada, não entra no MRR)
-- Em projeto avulso (one_off): valor = total, valor_setup fica nulo.
-- Ex.: Clínica Rotelli — implementação R$ 2.997 + mensalidade R$ 847.
alter table public.projetos
  add column if not exists valor_setup numeric(14,2);

comment on column public.projetos.valor_setup is
  'Taxa única de implementação/setup (só em recorrente). O MRR usa `valor` = mensalidade.';
