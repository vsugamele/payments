# Sessão 2026-11-13 — Payments Intelligence Workbench 2.0 ("Paper & Precision" Design System Completo)

## Escopo e Objetivo
Execução integral dos **5 Pilares** da arquitetura **Payments Intelligence Workbench 2.0 (Padrão Stripe Docs / Adyen / Visa Developer)** em todas as frentes prometidas (`/compliance/outgoing`, `/compliance/boletins`, `/acervo`, `/simulador`, `Navbar.tsx` e `PaymentsWorkbenchShell.tsx`).

## Entregas Realizadas

1. **Pilar 1 & 4 — App Shell Único (`PaymentsWorkbenchShell.tsx` + `Navbar.tsx`) & Persistência Global (`Bandeira` + `Lente / Papel`)**
   - Eliminação da barra duplicada no topo: em todas as rotas técnicas do Workbench (`/compliance*`, `/acervo*`, `/simulador*`, `/mcbs*`, `/editor*`, `/validador*`, `/comparador*`, `/inspecao-tecnica*`, `/liquidacao*`, `/parcelado*`, `/admin*`), `<Navbar />` cede lugar à **Barra Superior Única (`top-0`)** do `PaymentsWorkbenchShell`, que integra:
     - Retorno rápido ao `Portfólio VS` (`/`),
     - Seletor Global Persistente de **Bandeira** (`Todas`, `Visa`, `Mastercard`, `Elo`, `Amex`) salvo em `localStorage` (`vs_workbench_brand`),
     - Seletor Global Persistente de **Lente Operacional** (`Ambos`, `Adquirente / PayFac`, `Emissor`) salvo em `localStorage` (`vs_workbench_role`),
     - Atalho direto para o **Doc Studio (`/editor`)**, Busca Omnibox Global (`Ctrl+K`) e alternância de Tema Claro/Escuro (`Sun / Moon`).
   - Inclusão de todos os módulos técnicos nas **5 Estações Cronológicas da Sidebar Esquerda** (`Cartão Presente EMV`, `Inspeção Técnica ISO/EMV`, `Credenciamento & PayFac`, `Validador de Faturas`, `Comparador de Faturas`, `Simulador de Parcelado`, `Doc Studio & Editor RAG`, `Cockpit de Compliance`).

2. **Pilar 2 — Slide-Over Inspector Drawer Completo (`460px` à direita) + 4ª Bandeira Amex + Lente de Papel em `/compliance/outgoing` (`OutgoingClient.tsx`)**
   - Inclusão da **4ª Bandeira `Amex (GNS / CAS)`** diretamente no Seletor Principal de Bandeiras do Outgoing e sincronização automática com o filtro global `Amex` e com a Lente Operacional (`Adquirente / PayFac` vs `Emissor`).
   - **Slide-Over Inspector Drawer Completo** com os 5 itens prometidos:
     1. Regra completa `Obrigatório [M] vs Condicional [C]`;
     2. Exemplo físico em `168 bytes / Hex / TLV` em terminal escuro isolado (`.dark-terminal`);
     3. **Lastro Oficial no Acervo (`campos.sqlite3` + `SHA-256` + Página Exata do PDF + Edição do Manual)**;
     4. **Diagnóstico do Relatório de Crítica D+0/D+1 (`EP747 / VX-100A / VSS-110`, `TE01 Reg 09 / 20-02`, `IPM T112 / T140 / T461`) e Custo Estimado de Downgrade/Multa**;
     5. **Botão de 1 clique `📝 Enviar Especificação deste Campo para o Doc Studio (/editor)`** via `sendToDocStudio`.

3. **Pilar 5 — Hub de Releases & Comportamento 2.0 (`/compliance/boletins/page.tsx`)**
   - Sincronização automática com o Seletor Global de **Bandeira** e **Lente / Papel** (`Adquirente` vs `Emissor`) no topo.
   - Nova aba **`2. Planilha Ao Vivo de Controle de Release (Aba Adquirente × Aba Emissor)`** permitindo visualizar e comparar lado a lado na tela todas as obrigações de `Adquirente` vs `Emissor` antes de exportar o `.csv`.
   - **Slide-Over Inspector Drawer (`480px` à direita)** para inspecionar qualquer Boletim nas **3 Lentes (`Técnica`, `Normativa`, `Negócio`)**, ações por papel, exportação `.csv` e envio em 1 clique para o **Doc Studio (`/editor`)**.

4. **Pilar 5 — Hub do Acervo & Regulatório 2.0 (`/acervo/page.tsx` + `OutgoingAcervoConnector.tsx`) & Sincronização do Simulador (`SimulatorPage.tsx`)**
   - Cabeçalho editorial limpo **Paper & Precision** em `/acervo`.
   - Sincronização automática de `OutgoingAcervoConnector.tsx` e `SimulatorPage.tsx` com a Barra de Contexto Global (`Bandeira` e `Lente / Papel`).
   - **Slide-Over Inspector Drawer (`460px` à direita)** no Hub do Acervo: clicar em qualquer um dos `17.106` Campos Posicionais (`campos.sqlite3`) abre o Drawer com página exata do PDF, `SHA-256`, edição do manual e botão de 1 clique **`📝 Enviar Citação Auditável (SHA-256 + Pág. PDF) para o Doc Studio (/editor)`**.

## Arquivos Modificados
- `frontend/components/Navbar.tsx`
- `frontend/components/PaymentsWorkbenchShell.tsx`
- `frontend/app/compliance/outgoing/OutgoingClient.tsx`
- `frontend/app/compliance/boletins/page.tsx`
- `frontend/app/acervo/page.tsx`
- `frontend/app/compliance/outgoing/OutgoingAcervoConnector.tsx`
- `frontend/components/SimulatorPage.tsx`
- `docs/sessions/2026-11/2026-11-13-workbench-2-0-design-system.md`

## Validação
- `npx tsc --noEmit` executado sem erros (`TSC_EXIT=0`).
