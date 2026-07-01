-- ─────────────────────────────────────────────────────────────────────────
-- Canais de email + Instagram na prospecção (contrato prospect.*).
--
-- Contexto: os leads vêm do Google Places, que NÃO devolve email nem @ do
-- Instagram. A máquina passa a DESCOBRIR o email varrendo o site do lead e a
-- guardar o @ quando disponível. Este migration adiciona as colunas de canal +
-- a tabela de eventos de email (aberturas/cliques/bounces do Resend).
--
-- REGRA DE OURO (inalterada): a MÁQUINA escreve (conexão direta/service_role,
-- ignora RLS); a PLATAFORMA só LÊ (RLS is_membro). Mudança combinada via
-- INTEGRACAO-SYNC.md (CHANGELOG).
--
-- Tipos seguem o contrato: "booleanos" = integer 0/1; timestamps = text ISO-8601.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Colunas de canal em prospect.leads ───────────────────────────────────
alter table prospect.leads
  add column if not exists email          text,   -- descoberto do site (mailto/contato)
  add column if not exists email_status   text,   -- none|discovered|sent|delivered|opened|clicked|bounced|complained|unsubscribed
  add column if not exists email_sent_at  text,   -- ISO, 1º envio
  add column if not exists email_event_at text,   -- ISO, último evento (abertura/clique/bounce)
  add column if not exists instagram      text,   -- @handle (sem automação — DM manual)
  add column if not exists ig_status      text,   -- none|sent|replied
  add column if not exists ig_sent_at     text;   -- ISO, quando o operador mandou a DM

-- ── Eventos de email (log do webhook do Resend + envios) ──────────────────
create table if not exists prospect.email_events (
  id        bigint generated always as identity primary key,
  place_id  text references prospect.leads(place_id) on delete cascade,
  email     text,
  type      text not null,   -- sent|delivered|opened|clicked|bounced|complained|unsubscribed
  at        text not null,   -- ISO-8601
  meta      jsonb            -- payload extra do provedor (opcional)
);
create index if not exists idx_prospect_email_events_place on prospect.email_events(place_id, id);

-- ── Grants (a máquina usa service_role/owner; plataforma lê como authenticated)
grant select on prospect.email_events to authenticated;
grant all on prospect.email_events to service_role;
grant usage, select on all sequences in schema prospect to service_role;

-- ── RLS — só membros leem (mesmo padrão das outras prospect.*) ────────────
alter table prospect.email_events enable row level security;
drop policy if exists membros_leem on prospect.email_events;
create policy membros_leem on prospect.email_events
  for select to authenticated using (public.is_membro());

-- ── Realtime — a UI acompanha aberturas/cliques ao vivo ───────────────────
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table prospect.email_events';
  exception when duplicate_object then null;
  end;
end $$;
