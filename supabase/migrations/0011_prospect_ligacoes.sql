-- 0011 — colunas de dossiê de ligação em prospect.leads (anúncio na ponte 2026-08-05)
-- + formaliza as 3 colunas email_verify_* criadas direto no banco em 28/jul (mea culpa da máquina).
-- Tudo aditivo/nullable e IF NOT EXISTS: idempotente com o banco vivo.

alter table prospect.leads add column if not exists address text;
alter table prospect.leads add column if not exists owner_name text;

-- Verificação de email (Bouncer) — colunas já existentes no banco desde 28/jul.
alter table prospect.leads add column if not exists email_verify_status text;
alter table prospect.leads add column if not exists email_verify_score integer;
alter table prospect.leads add column if not exists email_verify_at text;

comment on column prospect.leads.address is 'Endereço completo (RFB estabelecimentos: logradouro, número, bairro, CEP). Escrito pela máquina.';
comment on column prospect.leads.owner_name is 'Nome do dono quando derivável (natureza 213-5 EI/MEI: razão social sem o CPF). NULL = pedir pelo responsável.';
