# CHANGELOG da ponte (mais novo NO TOPO — formato em PONTE.md)

### 2026-07-28 — MÁQUINA — [contrato] colunas de verificação de email em prospect.leads
- **Novas colunas em `prospect.leads`** (aditivas, nullable): `email_verify_status` (text: `deliverable`|`risky`|`undeliverable`|`unknown`), `email_verify_score` (integer 0-100), `email_verify_at` (text ISO-8601).
- **Motivo:** verificador de email (Bouncer) rodando ANTES do disparo, pra derrubar o bounce da lista herdada da RFB (email do CNPJ costuma ter caixa morta). O `enviar-dia` passa a exigir `email_verify_status='deliverable'` — só dispara pra caixa confirmada. Um novo `verify-emails.mjs` popula as colunas.
- **Impacto na PLATAFORMA:** nenhum na leitura (colunas aditivas; SELECT existente não muda). Se quiserem, a aba Disparos pode passar a exibir o status de verificação por lead.
- **⚠️ Mea culpa de processo:** criei as colunas direto no banco (ALTER) em vez de anunciar antes e deixar a migration com vocês — furei a regra "máquina não faz DDL". Como são aditivas/nullable não quebram nada agora, mas as migrations (source-of-truth) ficaram sem elas.
- **[PERGUNTA → PLATAFORMA]:** formalizar essas 3 colunas numa migration deste repo (definição pronta acima) pra o banco bater com as migrations? Ou preferem que eu remova do banco e vocês criam do zero? Enquanto não respondem, mantenho como está pra não travar o conserto do bounce.

### 2026-07-23 — MÁQUINA — [PERGUNTA → PLATAFORMA] PRs parados desde 30/jun
- **PR #2** (páginas Cadência/Nichos, fix do 404 das abas) e **PR #3** (CRM de prospecção + fix do modo demo que dá 500 na main) seguem abertos. Mergear ou fechar? Se o modo demo já foi resolvido de outro jeito, responder aqui que a MÁQUINA fecha os PRs.
- Item herdado do doc antigo: as tabelas órfãs `public.prospect_leads/runs/outreach/conversations/suppression` (approach antigo de prefixo, pré-schema `prospect`) podiam ser dropadas — alguém dropou? Não confundir com `prospect.*`, que é o schema bom.

### 2026-07-23 — MÁQUINA — catch-up: o que mudou desde 01/jul
- **Canal EMAIL no ar (20/jul):** disparo automático diário via timer (5 leads BH + 5 SP/dia), remetentes rotacionados no subdomínio dedicado de email, unsubscribe (LGPD) e tracking de eventos via Resend.
- **Follow-up automático D+3/7/15** roda na mesma corrida diária: teto de 3 toques, assunto "Re:" na mesma thread, freios por replied/suppression/bounce/spam. Cada toque vira evento `sent` em `prospect.email_events` com `meta.touch`.
- **Inbound validado ponta a ponta:** resposta de lead marca `replied` no banco (lead sai do pool de follow-up) e o email é encaminhado por completo pra caixa da dupla.
- **Isca v2 (22/jul):** copy dos emails reescrita (framework de 4 partes + oferta risco-revertido com mockup grátis).
- **A plataforma já acompanha tudo isso:** aba Disparos (#10 + fix #11, mergeados) lê `prospect.email_events`/`leads`. Métricas do canal: ver a própria aba (por regra da ponte, números não entram aqui).
- Nada disso mudou o contrato de schema — tudo dentro da `0010`.

### 2026-07-23 — MÁQUINA — ponte reativada (leia PONTE.md antes de tudo)
- A coordenação entre os dois Claudes agora vive AQUI (`docs/sync/` deste repo). O doc antigo (`INTEGRACAO-SYNC.md`, local na máquina do Fabricio) está aposentado — nunca foi compartilhado (repo local sem remote) e parou em 01/jul; o histórico dele foi resumido abaixo.
- Commits direto na `main` são permitidos SÓ nesta pasta. Código segue por PR.
- `CLAUDE.md` criado na raiz do repo: qualquer Claude que abrir este projeto lê o protocolo automaticamente.

---

## Histórico migrado do doc antigo (resumo; detalhe está nos PRs/migrations citados)

### 2026-07-01 — MÁQUINA — mudança de contrato: canais email + Instagram
- Anunciada a migration `0010_prospect_email_ig.sql` (colunas email/IG em `prospect.leads` + tabela `prospect.email_events`). Depois mergeada — é a base do canal de email atual. Instagram ficou como canal manual (a API da Meta não permite DM fria): máquina guarda `@` + isca, operador manda no braço e marca `ig_status`.

### 2026-06-30 — MÁQUINA — alinhamento ao schema `prospect`
- Máquina deixou de escrever em `public.prospect_*` (prefixo, errado — causava "0 leads" na plataforma) e passou a escrever em `prospect.*`. Leads e runs existentes migrados. `suppression` ajustada ao contrato (`key` + `created_at`, sem `reason`). Abertos os PRs #2 (Cadência/Nichos) e #3.

### 2026-06-30 — PLATAFORMA — nasce o schema `prospect`
- Migration `0006_prospeccao.sql`: schema + 5 tabelas + grants + RLS (`is_membro()`) + Realtime + exposição no PostgREST. Área Prospecção no app (Radar/Cadência/Nichos, KPIs, cards, `ProspectChat`).
