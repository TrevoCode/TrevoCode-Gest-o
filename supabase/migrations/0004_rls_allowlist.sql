-- Amarra a RLS à allowlist de e-mails (defesa no banco, não só no proxy do Next).
-- As policies originais são PERMISSIVE `using (true) to authenticated` — qualquer
-- usuário autenticado no projeto Supabase teria CRUD via PostgREST. Adicionamos
-- uma policy RESTRICTIVE (AND) por tabela: além das regras existentes, a operação
-- só passa se o e-mail do JWT estiver em public.usuarios_autorizados.

create table if not exists public.usuarios_autorizados (
  email text primary key,
  criado_em timestamptz not null default now()
);

insert into public.usuarios_autorizados (email) values
  ('yuri@trevocode.com'),
  ('fabricio@trevocode.com')
on conflict (email) do nothing;

alter table public.usuarios_autorizados enable row level security;

-- security definer: a função lê a lista ignorando a RLS da própria tabela.
create or replace function public.is_membro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios_autorizados u
    where u.email = (auth.jwt() ->> 'email')
  );
$$;

-- Membros podem ler a própria lista; ninguém mais.
drop policy if exists usuarios_autorizados_select on public.usuarios_autorizados;
create policy usuarios_autorizados_select on public.usuarios_autorizados
  for select to authenticated using (public.is_membro());

-- Policy restritiva em todas as tabelas de dados (AND com as permissivas).
do $$
declare
  t text;
  tabelas text[] := array[
    'clientes','contatos','projetos','reunioes','leads','faturas','despesas',
    'contas_a_pagar','deals','propostas','contratos','tarefas','marcos',
    'membros','metas','solicitacoes_despesa'
  ];
begin
  foreach t in array tabelas loop
    execute format('drop policy if exists membros_only on public.%I', t);
    execute format(
      'create policy membros_only on public.%I as restrictive for all to authenticated using (public.is_membro()) with check (public.is_membro())',
      t
    );
  end loop;
end $$;
