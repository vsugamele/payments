# Session Log — 2026-11-15 — Governança de Fontes ("Nada é Escolhido em Silêncio") & Trava de Vigência Vencida

- **Data:** 2026-11-15
- **Escopo:** `engine/comportamento.py`, `frontend/app/api/admin/boletins/route.ts`, `frontend/app/compliance/boletins/page.tsx`
- **Objetivo:** Adotar o padrão normativo de transparência radical no motor de boletins e na tela `/compliance/boletins`:
  1. **Conflito Explícito entre Fontes (`conflitos_abertos`):** quando o `action_indicator` oficial da bandeira diverge da `classificacao` operacional (ex.: `Mandated: Issuer` vs `Condicional`) ou quando dois boletins tocam o mesmo campo técnico (`DE` / `PDS` / `Billing Code`) com escopo/papel distinto, o sistema exibe as duas leituras lado a lado em vez de escolher em silêncio.
  2. **Aviso Prévio de Fonte Única / Lacuna (`aviso_fonte_unica`):** alerta explícito sempre que a regra se apoia em PDF único sem manual base cruzado ou possui itens pendentes em `verificar`.
  3. **Trava Automática de Dado / Vigência Vencida (`etapa_travada`):** quando a última data de vigência/comply-by já passou e há pendências abertas em `verificar`, bloqueia a emissão direta de parecer para o Doc Studio (`/editor`) até confirmação explícita de revalidação com ressalva auditável injetada no HTML exportado.
- **Validação:** `ComportamentoEngine.auditar_integridade_fontes` testado em Python (`GLB 13315.1`, `GLB 6409.2`, `ELO R27.1-PACOTE`) + `npx tsc --noEmit` no `frontend/`.
