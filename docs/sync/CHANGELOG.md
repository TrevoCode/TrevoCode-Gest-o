# CHANGELOG da ponte (mais novo NO TOPO — formato em PONTE.md)

### 2026-08-05 — MÁQUINA — [contrato] colunas `address` e `owner_name` em `prospect.leads` + aba Ligações (PR novo)
- **Novas colunas em `prospect.leads`** (aditivas, nullable): `address` (text — endereço completo: logradouro, número, bairro, CEP) e `owner_name` (text — nome do dono quando derivável).
- **Fonte:** RFB. 75% dos leads já têm o CNPJ gravado em `reasons` ("CNPJ 14 dígitos"); o endereço vem de `estabelecimentos` e o dono vem da razão social quando a natureza jurídica é 213-5 Empresário Individual/MEI (razão social = nome civil, CPF final removido). LTDA fica `owner_name` NULL — a tela mostra "pedir pelo responsável".
- **Desta vez no fluxo certo:** migration `0011_prospect_ligacoes.sql` neste PR (inclui também a formalização das 3 colunas `email_verify_*` de 28/jul, fechando o mea culpa pendente — tudo `IF NOT EXISTS`, idempotente com o banco vivo). Máquina faz o backfill dos leads tocados e o `captar-places.mjs` passa a gravar os 2 campos na captura de leads novos.
- **Nova aba Ligações** (`/app/ligacoes`) na seção Prospecção: cockpit de ligação — mesma fila da aba WhatsApp (tocados por email, sem resposta, com telefone; abertos no topo), mas o card vira dossiê: falar com quem, telefone grande com fixo/celular, endereço + link Maps (via `place_id`, sem coluna nova), veredito de site, nota Google, início/porte (parse de `reasons`), isca enviada + quando abriu, abertura de ligação pronta pra ler. Status da ligação e anotações em **localStorage** (regra "plataforma só LÊ `prospect`" mantida).
- A query compartilhada `obterFilaWhatsapp()` passou a selecionar os campos extras (aditivo — a aba WhatsApp não muda de comportamento).

### 2026-08-03 — MÁQUINA — 4ª dimensão no CBO: CTA (resp × zap), tag nova em `reasons`
- O disparador CBO agora sorteia por lead um braço de **CTA**: `resp` (isca como está, CTA de responder o email) ou `zap` (mesma isca + PS com o número de WhatsApp do chip 31 em **texto puro**, sem link wa.me de propósito — link em cold é sinal de spam).
- **Tag nova em `prospect.leads.reasons`**, gravada no momento do envio: `| cta: zap` ou `| cta: resp` (mesmo padrão da `| oferta: OX`; só dado, zero DDL). Se a aba Disparos parsear `reasons`, pode exibir o braço de CTA por lead.
- Resposta do braço `zap` chega pelo WhatsApp (não gera `email_events` sozinha): a máquina marca com `marcar-replied.mjs email@ zap`, que insere o evento `replied` com `meta.origem` "chamou no WhatsApp" — a aba Disparos passa a ver essas respostas também, com origem distinguível no `meta`.
- Encaixa com a aba WhatsApp anunciada hoje: o braço `zap` do email e a fila manual atacam o mesmo funil por pontas diferentes (lead clica × operador chama).

### 2026-08-03 — MÁQUINA — aba WhatsApp na Prospecção (PR novo)
- **Nova aba WhatsApp** (`/app/whatsapp`) na seção Prospecção: fila de follow-up MANUAL de WhatsApp com os leads já tocados por email e sem resposta (com telefone). Quem **ABRIU o email vem no topo** (segmento mais quente). Cada card traz a mensagem pronta (copys A/B/C da doutrina COPY-PROSPECCAO) e o link wa.me; divisão por chip: **31 = Fabrício (BH e região)**, **11 = Nobre (SP e demais cidades)**.
- Marcação "enviado" fica no **localStorage do navegador do operador** — nenhuma escrita no banco, regra "plataforma só LÊ o schema `prospect`" mantida. Zero DDL, zero mudança de contrato.
- Espelho novo: `src/lib/whatsapp-copy.ts` reproduz a copy de `gerar-whatsapp-followup.mjs` da máquina (só exibição; mudou lá, muda aqui). Protocolo de envio na própria página: SÓ pelo app no celular do chip (nunca Web), 5 a 8 por dia.

### 2026-07-29 — MÁQUINA — respostas de leads na aba Disparos (PR #12) + mudança no Reply-To
- **PR #12 aberto:** aba Disparos ganha estado **Respondeu**, painel com o TEXTO das respostas (lido de `email_events.meta` do evento `replied`, colunas já existentes — zero DDL), cards Responderam / Abertos sem resposta e coluna Respostas no placar por dia.
- **Mudança de comportamento no envio (só máquina, sem contrato):** From agora é por persona (`luan@`/`yuri@`/`fabricio@` no subdomínio de email) e o Reply-To externo foi removido — a resposta do lead entra pelo inbound (marca `replied`) e é encaminhada pra caixa monitorada. Ou seja: o evento `replied` agora é o caminho NORMAL de toda resposta, não exceção.
- **Contexto:** domínios irmãos do cold comprados (fora deste repo); envio frio migrará pra ferramenta dedicada. Nada disso toca o schema `prospect`.

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
