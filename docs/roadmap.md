# Roadmap — Plataforma de Gestão TrevoCode

Baseado em benchmark (jun/2026) de ~20 ferramentas: financeiro BR (Nibo, Granatum,
Cora, Flash, Conta Simples, Organizze), gestão de agência/ERP (Operand, Runrun.it,
ContaAzul, Omie, Tiny, GestãoClick, Bitrix24, Pipefy) e CRM/PSA (Pipedrive, RD Station,
Ploomes, HubSpot, Productive, Scoro, Accelo, HoneyBook, Bonsai).

Princípio: **UI-first com dados mock** (camada única `src/lib/data.ts`). Backend (Supabase)
entra depois, trocando só essa camada.

## Já construído
Dashboard · Leads (inbox) · Clientes/CRM (lista+detalhe) · Reuniões · Projetos
(avulso/recorrente) · Financeiro (faturas + despesas por categoria) · Configurações.

## Decisão em aberto — apontamento de horas
Margem **real** por projeto depende de apontar horas (custo-hora × horas) vs. receita.
Decisão atual ("só gestores, sem equipe apontando") → margem fica **estimada** (custo
lançado à mão no projeto). Revisitar se quisermos virar um PSA de verdade (billability,
capacity). É a bifurcação que mais muda o produto.

---

## 🔴 ESSENCIAL

| # | Item | Área | Status | Referência |
|---|------|------|--------|------------|
| E1 | **Pipeline kanban + entidade Deal** (etapas, valor, deal parado) | Comercial | 🟡 em andamento | Pipedrive |
| E2 | **Propostas/Orçamentos** (template → PDF → aceite) | Comercial | ⬜ | Ploomes, HoneyBook |
| E3 | **Tarefas + Kanban no projeto** (execução, não só registro) | Projetos | ⬜ | Runrun.it, Bitrix24 |
| E4 | **Contas a pagar** (vencimento, status a vencer/vencida/paga) | Financeiro | 🟡 em andamento | Nibo, Cora |
| E5 | **Fluxo de caixa projetado** (receber × pagar × recorrências) | Financeiro | 🟡 em andamento | Nibo, Granatum, Cora |

## 🟡 IMPORTANTE

| # | Item | Área | Referência |
|---|------|------|------------|
| I1 | Margem por projeto (custo vs. receita) — depende da decisão de horas | Projetos | Operand, Runrun.it |
| I2 | Cobrança automática (boleto/PIX + régua de lembretes) | Financeiro | Cora, Nibo |
| I3 | Timeline de atividades por cliente/deal | Comercial | Pipedrive |
| I4 | Automação de follow-up / alerta de deal parado | Comercial | RD Station |
| I5 | Recorrência de lançamentos + DRE gerencial | Financeiro | ContaAzul, Nibo |
| I6 | Conciliação bancária (começar por import OFX) | Financeiro | Nibo, Granatum |
| I7 | Forecast de receita (deals × probabilidade) | Comercial | Pipedrive |

## 🟢 NICE-TO-HAVE
Contrato + assinatura eletrônica (Clicksign) · Alocação/capacidade · Gantt/milestones ·
Relatórios/BI · Orçado × Realizado/metas · Aprovação de despesa (Flash) · Cenários de fluxo.

---

## Sequência sugerida
- **Comercial:** Deal+Kanban (E1) → Timeline (I3) → Propostas (E2) → Forecast (I7) → Follow-up (I4)
- **Projetos:** Tarefas/Kanban (E3) → [decisão de horas] → Margem (I1)
- **Financeiro:** Contas a pagar (E4) → Recorrência (I5) → **Fluxo projetado (E5)** → Conciliação OFX (I6) → Cobrança/régua (I2) → DRE (I5)

## Padrões de UX a adotar
Kanban com soma no topo da coluna · card = fonte única + "parado há X dias" · fluxo de caixa
linha sólida→tracejada · dashboard de cobrança em blocos · pendências na home · conversão
1-clique deal→projeto.
