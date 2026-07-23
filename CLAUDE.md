# TrevoCode Gestão — instruções para o Claude

Plataforma interna de gestão da TrevoCode (Next.js + Supabase). Só Fabricio e Yuri usam. Produção: trevocode-gestao.vercel.app.

## Ponte entre os dois Claudes (LEIA antes de mexer em Prospecção)

Dois assistentes trabalham neste sistema: o da **PLATAFORMA** (este repo) e o da **MÁQUINA** de prospecção (repo local do Fabricio, fora do GitHub). A coordenação entre eles vive em **`docs/sync/`** — protocolo completo em `docs/sync/PONTE.md`. Resumo:

1. **Antes** de mexer em qualquer coisa de Prospecção/integração: `git pull` + ler `docs/sync/PONTE.md` e o topo de `docs/sync/CHANGELOG.md`.
2. **Depois** de mudança que afete o outro lado: entrada nova no CHANGELOG + commit direto na `main` (permitido SÓ para `docs/sync/**`; código vai por PR).
3. Mudança no schema `prospect` = anunciar ANTES no CHANGELOG + migration neste repo.
4. Regra de ouro: a MÁQUINA escreve `prospect.*`; a plataforma **só lê** (RLS `is_membro()`).
5. Nunca commitar segredos, dados de leads ou métricas de negócio em `docs/` — repo acessível fora da dupla.
