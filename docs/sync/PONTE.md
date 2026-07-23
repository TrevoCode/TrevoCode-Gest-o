# PONTE — comunicação entre os dois Claudes da TrevoCode

> **O que é:** o canal oficial de coordenação entre os DOIS assistentes de IA que trabalham no sistema de prospecção/gestão:
> - **MÁQUINA** — Claude do Fabricio, no repo local `trevocode-prospect` (fora do GitHub). Capta, qualifica, dispara email, faz follow-up e **ESCREVE** os dados.
> - **PLATAFORMA** — Claude do Nobre, neste repo `TrevoCode-Gest-o` (Next.js). **LÊ** e mostra: Radar, Cadência, Nichos, Disparos, CRM.
>
> **A ponte é 100% git — só os arquivos desta pasta (`docs/sync/`).** O Supabase NÃO é canal de comunicação (é só onde os dados moram) e nenhum servidor/API participa da ponte.

## Protocolo (os dois lados seguem)

1. **Antes de mexer** em qualquer coisa de integração (schema `prospect`, colunas, leitura, páginas de Prospecção, disparos, inbound): `git pull` e leia este arquivo + o topo do `CHANGELOG.md`.
2. **Depois de mexer** em algo que afeta o outro lado: escreva uma entrada no `CHANGELOG.md` (formato abaixo) e **commite direto na `main`** — permitido SÓ para `docs/sync/**`. Código continua indo por PR.
3. **Mudança de contrato** (tabela/coluna do schema `prospect`, convenção): anuncie ANTES no CHANGELOG — não edite e conte depois. Quebra o outro lado.
4. **Perguntas:** marque a entrada com `[PERGUNTA → PLATAFORMA]` ou `[PERGUNTA → MÁQUINA]`. O outro lado responde com entrada nova no topo, citando a data da pergunta.
5. Dúvida sobre o que o outro lado fez? O CHANGELOG é a fonte. Se não está lá, **não assuma — pergunte**.
6. **PROIBIDO nesta pasta:** segredos, tokens, senhas, chaves, dados de leads (nome/telefone/email de terceiros) e métricas de negócio. O repo é acessível fora da dupla — números e dados ficam no banco/plataforma (atrás de login), aqui só coordenação técnica.

## Formato da entrada no CHANGELOG

```
### AAAA-MM-DD — MÁQUINA|PLATAFORMA — título curto
- O que mudou; impacto no outro lado; o que o outro lado precisa fazer (se algo).
```

Mais novo **no topo**. Nunca editar entrada antiga (só acrescentar).

## Contrato (fonte da verdade)

- **Schema `prospect`** (`leads`, `outreach`, `conversations`, `runs`, `suppression`, `email_events`): definido pelas **migrations deste repo** — `supabase/migrations/0006_prospeccao.sql`, `0009_recria_leads.sql`, `0010_prospect_email_ig.sql`. **Não duplicar colunas aqui** — foi o que matou o doc antigo (desatualizou em uma semana). Mudou o schema? Migration nova neste repo + anúncio prévio no CHANGELOG.
- **Regra de ouro:** a MÁQUINA **escreve** `prospect.*` (conexão direta como owner). A PLATAFORMA **só lê** (`supabase.schema("prospect")` com sessão de membro, RLS `is_membro()`). A plataforma nunca faz INSERT/UPDATE/DELETE em `prospect.*`.
- Convenções: "booleanos" = `integer` 0/1; timestamps = `text` ISO-8601.
- A antiga "API HTTP da máquina" está **fora da ponte** e fora do ar — se um dia subir, anunciar aqui primeiro.

## Quem é dono de quê

| Área | Dono |
|---|---|
| Schema `prospect` (migrations, RLS, grants, PostgREST) | **PLATAFORMA** (este repo) |
| Escrita dos dados `prospect.*` (captação, disparos, follow-up, inbound) | **MÁQUINA** |
| UI de Prospecção (Radar/Cadência/Nichos/Disparos), leitura, Realtime | **PLATAFORMA** |
| `docs/sync/` (esta pasta) | os dois — append no CHANGELOG |
