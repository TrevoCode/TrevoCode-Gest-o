-- Consolida o RLS num único modelo permissivo por tabela, gated por is_membro().
--
-- CONTEXTO: até aqui cada tabela interna tinha DUAS policies:
--   1) *_authenticated  — PERMISSIVE  using (true)         (base, migrations 0001-0005)
--   2) membros_only     — RESTRICTIVE using (is_membro())  (migration 0004)
-- O efetivo já era seguro (permissive true AND restrictive is_membro = is_membro),
-- mas o modelo de duas camadas é frágil: remover a permissiva `true` sem trocar a
-- restritiva por permissiva deixa a tabela com só a restritiva, que NEGA TUDO
-- (inclusive membros). Este migration deixa UMA policy permissiva por tabela.

-- is_membro(): e-mail case-insensitive (fail-safe = negar).
create or replace function public.is_membro()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios_autorizados u
    where lower(u.email) = lower(auth.jwt() ->> 'email')
  );
$$;

do $$
declare
  t text;
  pol record;
  tabelas text[] := array[
    'clientes','contatos','projetos','reunioes','faturas','despesas',
    'contas_a_pagar','deals','propostas','contratos','tarefas','marcos',
    'membros','metas','solicitacoes_despesa','config_empresa'
  ];
begin
  foreach t in array tabelas loop
    -- 1) remove toda policy permissiva aberta (using true) herdada das migrations base
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t and qual = 'true'
    loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;

    -- 2) recria membros_only como PERMISSIVE (concede acesso só a membros)
    execute format('drop policy if exists membros_only on public.%I', t);
    execute format(
      'create policy membros_only on public.%I as permissive for all to authenticated '
      || 'using (public.is_membro()) with check (public.is_membro())', t);
  end loop;
end $$;

-- Nota: 'leads' (form público do site) foi removida do schema; as server actions
-- que a referenciam (promoverLead/editarLead/mudarStatusLead) precisam ser
-- recriadas ou removidas. prospect_* são geridas pela máquina de prospecção.
