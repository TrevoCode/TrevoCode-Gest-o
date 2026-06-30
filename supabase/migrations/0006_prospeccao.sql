-- ─────────────────────────────────────────────────────────────────────────
-- Integração com a "máquina de prospecção" (app Node separado).
--
-- REGRA DE OURO: a MÁQUINA escreve estas tabelas; a PLATAFORMA só LÊ (display
-- + Realtime). Por isso elas vivem num schema próprio, `prospect`, com RLS que
-- libera apenas SELECT para membros — a plataforma fisicamente não consegue
-- gravar aqui. A máquina escreve via service_role / conexão direta (ignora RLS).
--
-- Por que schema separado (e não `public.leads`): o CRM já tem `public.leads`
-- (contatos do site, que a plataforma ESCREVE). São entidades diferentes; manter
-- a prospecção em `prospect.*` evita colisão e deixa o "dono da escrita" explícito.
-- A máquina deve ser configurada para apontar para o schema `prospect`.
--
-- Tipos seguem o contrato do brief LITERALMENTE: "booleanos" são integer 0/1 e
-- timestamps são text ISO-8601 (ordenáveis como string). Não mudar sem alinhar
-- com a máquina, senão as escrituras dela quebram.
-- ─────────────────────────────────────────────────────────────────────────

create schema if not exists prospect;

-- ── leads — o card de cada lead prospectado ──────────────────────────────
create table if not exists prospect.leads (
  place_id          text primary key,            -- id único (Google)
  name              text,
  niche             text,
  city              text,
  phone             text,
  website           text,
  pain_score        integer not null default 0,  -- 0–100 (oportunidade)
  reasons           text,                         -- gargalos, separados por " | "
  channels          text,                         -- canais, separados por ","
  rating            double precision,
  reviews_count     integer,
  captured_at       text,                         -- ISO-8601
  -- funil →
  contacted         integer not null default 0,
  replied           integer not null default 0,
  positive          integer not null default 0,
  call_booked       integer not null default 0,
  closed            integer not null default 0,
  ticket            double precision,             -- R$ fechado, se houver
  -- isca Nível 1 (mensagens prontas) →
  isca_whatsapp     text,
  isca_instagram    text,
  isca_email_subj   text,
  isca_email_body   text,
  isca_at           text,                         -- ISO, null = sem isca
  -- isca Nível 2 (artefatos visuais, URLs do Storage) →
  isca2_mockup_url  text,
  isca2_demo_url    text
);

-- ── outreach — estágio no pipeline (1 linha por lead em campanha) ─────────
create table if not exists prospect.outreach (
  place_id        text primary key references prospect.leads(place_id) on delete cascade,
  status          text,        -- active | replied | booked | optout | exhausted
  touch_index     integer not null default 0,
  next_action_at  text,        -- ISO, null = sem próximo toque agendado
  last_touch_at   text,
  created_at      text,
  updated_at      text
);

-- ── conversations — CRM de WhatsApp (thread de cada lead) ─────────────────
create table if not exists prospect.conversations (
  id        bigint generated always as identity primary key,
  place_id  text,
  role      text,   -- lead (recebida) | sdr (enviada pela IA)
  text      text,
  at        text    -- ISO
);
create index if not exists conversations_place_at_idx
  on prospect.conversations (place_id, at);

-- ── runs — placar de nicho (agregado de captação) ────────────────────────
create table if not exists prospect.runs (
  id         bigint generated always as identity primary key,
  niche      text,
  captured   integer not null default 0,
  qualified  integer not null default 0,
  ran_at     text
);

-- ── suppression — opt-outs (não recontatar). key = telefone só dígitos ────
create table if not exists prospect.suppression (
  key        text primary key,
  created_at text
);

-- ── Grants ───────────────────────────────────────────────────────────────
-- Plataforma (anon/authenticated via PostgREST) só LÊ. Máquina (service_role) escreve.
grant usage on schema prospect to anon, authenticated, service_role;
grant select on all tables in schema prospect to authenticated;
grant all on all tables in schema prospect to service_role;
grant usage, select on all sequences in schema prospect to service_role;
alter default privileges in schema prospect grant select on tables to authenticated;
alter default privileges in schema prospect grant all on tables to service_role;

-- ── RLS — só membros da allowlist leem (reusa public.is_membro() do 0004) ──
do $$
declare t text;
begin
  foreach t in array array['leads','outreach','conversations','runs','suppression'] loop
    execute format('alter table prospect.%I enable row level security', t);
    execute format('drop policy if exists membros_leem on prospect.%I', t);
    execute format(
      'create policy membros_leem on prospect.%I for select to authenticated using (public.is_membro())',
      t
    );
  end loop;
end $$;

-- ── Realtime — publica as tabelas que a UI assina ao vivo ────────────────
do $$
declare t text;
begin
  foreach t in array array['conversations','outreach','leads'] loop
    begin
      execute format('alter publication supabase_realtime add table prospect.%I', t);
    exception when duplicate_object then null;  -- já publicada
    end;
  end loop;
end $$;

-- ── Expor o schema `prospect` na API (PostgREST) para o supabase-js ───────
-- Equivale a Dashboard → Settings → API → "Exposed schemas".
-- Assume os schemas padrão do Supabase; ajuste se o projeto expuser outros.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, prospect';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
