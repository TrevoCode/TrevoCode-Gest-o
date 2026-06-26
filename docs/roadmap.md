# Roadmap — Plataforma de Gestão TrevoCode

Baseado em benchmark (jun/2026) de ~20 ferramentas: financeiro BR (Nibo, Granatum,
Cora, Flash, Conta Simples, Organizze), gestão de agência/ERP (Operand, Runrun.it,
ContaAzul, Omie, Tiny, GestãoClick, Bitrix24, Pipefy) e CRM/PSA (Pipedrive, RD Station,
Ploomes, HubSpot, Productive, Scoro, Accelo, HoneyBook, Bonsai).

Princípio: **UI-first com dados mock** (camada única `src/lib/data.ts`). Backend (Supabase)
entra depois, trocando só essa camada. Visual: design system **Trevo Clean** (tokens
semânticos + dark mode), componentes `Panel`/`StatCard`/`PageHeader`/`StatusBadge`.

## Telas
Dashboard · Leads · **Pipeline** · **Propostas** · Clientes (lista/detalhe + timeline) ·
Reuniões · Projetos (lista/**detalhe + tarefas + margem**) · Financeiro (faturas, contas a
pagar, **fluxo projetado**) · **Cobrança & conciliação** · **Relatórios (DRE/MRR/funil)** ·
Configurações.

## Decisão em aberto — apontamento de horas
Margem hoje é **estimada** (campo `custo` no projeto). Para margem **real** (billability,
capacity) seria preciso apontar horas (custo-hora × horas). Revisitar se virarmos um PSA.

---

## 🔴 ESSENCIAL — concluído

| # | Item | Status |
|---|------|--------|
| E1 | Pipeline kanban + entidade Deal | ✅ |
| E2 | Propostas/Orçamentos (itens, status, aceite) | ✅ |
| E3 | Tarefas + Kanban no projeto | ✅ |
| E4 | Contas a pagar (vencimento/situação) | ✅ |
| E5 | Fluxo de caixa projetado | ✅ |

## 🟡 IMPORTANTE — concluído (alguns visuais até o backend)

| # | Item | Status |
|---|------|--------|
| I1 | Margem por projeto (custo vs. receita) | ✅ (estimada) |
| I2 | Cobrança/régua de lembretes | ✅ visual — envio real (boleto/PIX) requer backend + cron |
| I3 | Timeline de atividades do cliente | ✅ |
| I4 | Alerta de deal parado | ✅ |
| I5 | DRE gerencial + recorrência (MRR) | ✅ |
| I6 | Conciliação bancária | ✅ visual — leitura OFX/Open Finance requer backend |
| I7 | Forecast de receita | ✅ |

## 🟢 NICE-TO-HAVE

| Item | Status |
|------|--------|
| Contrato + assinatura eletrônica | parcial (botão "gerar contrato" na proposta; e-sign requer Clicksign) |
| Relatórios (vendas + financeiro) | ✅ |
| Orçado × Realizado / metas | ⬜ |
| Alocação / capacidade de equipe | ⬜ (depende de apontamento de horas) |
| Gantt / milestones / dependências | ⬜ |
| BI / report builder | ⬜ |
| Aprovação de despesa (estilo Flash) | ⬜ |
| Cenários de fluxo (otimista/pessimista) | ⬜ |

---

## Pendências para "ligar" de verdade (backend)
1. **Supabase**: aplicar migrations (`0001`, `0002`) + trocar `src/lib/data.ts` por queries reais.
2. **Captura de leads do site**: rota `/api/leads` no repositório do site, gravando no mesmo Supabase.
3. **Cobrança real** (I2): gateway boleto/PIX + cron de régua de lembretes.
4. **Conciliação real** (I6): parser OFX ou agregador Open Finance (Pluggy/Belvo).
5. **Margem real** (I1): decisão de apontamento de horas + custo-hora por pessoa.
