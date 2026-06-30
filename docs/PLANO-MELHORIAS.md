# Plano de melhorias — TrevoCode Gestão

Consolidado de 3 auditorias (UX/fluxos · segurança/arquitetura · completude/produto), 06/2026.

## Veredito
Base sólida e segura (RLS por allowlist, fail-closed, defesa em profundidade; zero crítico de segurança). Domínio bem modelado, fluxo feliz (lead→cliente→projeto→proposta→contrato→fatura) funciona. Falta o **eixo operacional** (editar, excluir, filtrar, paginar) e a **saída para o cliente** (PDF, cobrança real, NFS-e).

## Falhas mapeadas (severidade)
| # | Falha | Sev |
|---|---|---|
| 1 | Nada é excluível/arquivável | 🔴 |
| 2 | Reuniões: sem marcar realizada/cancelar/editar (enum existe no banco) | 🔴 |
| 3 | Timezone — datas em UTC podem aparecer 1 dia erradas | 🔴 |
| 4 | Cobrança: botão "Conciliar" e upload OFX mortos | 🔴 |
| 5 | Prospecção some no menu mobile | 🔴 |
| 6 | Sem editar deal/proposta/fatura/despesa/membro | 🟠 |
| 7 | Contatos do cliente não editáveis | 🟠 |
| 8 | Busca com injeção de sintaxe no `.or()` | 🟠 |
| 9 | Actions sem `assertMembro()` (confiam só na RLS) | 🟠 |
| 10 | A11y: login/busca/contatos sem label; busca some no mobile | 🟠 |
| 11 | Sem paginação; filtros só em Clientes; sem exportação | 🟠 |
| 12 | Enums sem validação; erro vira 500 cru | 🟡 |
| 13 | Comentários de dev na UI; saldo de caixa chumbado (28.500); N+1 via `mapaClientes` | 🟡 |
| 14 | Sem PDF real, NFS-e, assinatura, cobrança ativa, Pix/boleto | projeto |
| 15 | Sem automação (recorrência→fatura; deal ganho→projeto; time tracking) | projeto |

## Fases
### Fase 0 — Destravar uso diário (~1 dia)
- `atualizarReuniao` (realizada/cancelada/reagendar) + editar reunião
- Excluir/arquivar registros (+ confirmação)
- Corrigir timezone (`America/Sao_Paulo`)
- MobileNav: adicionar Prospecção
- Remover UI morta da cobrança + comentários de dev; empty states no financeiro; projetos clicáveis no detalhe do cliente

### Fase 1 — Segurança & robustez (~0,5–1 dia)
- `requireMembro()` no topo de toda server action
- Sanitizar busca; validar enums + erros amigáveis; reautenticar no "alterar senha"; corrigir open-redirect `?next`; tipos gerados; saldo real

### Fase 2 — CRUD completo & filtros (~1–2 dias)
- Editar deal/proposta/fatura/despesa/membro; descartar/editar lead; gerir contatos; metas editáveis; filtros+busca por módulo; paginação; prazo/% de projeto; a11y

### Fase 3 — Saída para o cliente (projeto)
- PDF real · NFS-e · cobrança ativa (e-mail/WhatsApp) + Pix/boleto · assinatura eletrônica

### Fase 4 — Automação & inteligência (projeto)
- Faturas recorrentes (cron) · deal ganho→projeto · time tracking faturável · export CSV · anexos (Storage) · conciliação OFX · relatórios com período · auditoria · notificações persistentes

## Pendência paralela
Deploy da captura de leads do site (`trevocode-plataforma`).
