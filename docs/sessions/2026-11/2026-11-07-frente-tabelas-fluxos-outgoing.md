# Sessão 07/11/2026 — Frente de Tabelas & Fluxos de Outgoing (Clearing / Remessa de Liquidação)

## Escopo e Objetivo
Construção de uma frente dedicada (`/compliance/outgoing`) para desenhar e documentar, de forma separada:
1. **Cada tabela/registro de Outgoing** nas três bandeiras (**Visa Base II CTF**, **Elo Mensageria de Liquidação 26.2** e **Mastercard GCMS / IPM Dual Message**):
   - O que é cada tabela, direção, tamanho físico e fonte normativa;
   - Regras de presença: quando a tabela inteira é **Obrigatória `[M]`** vs **Condicional `[C]`**;
   - O que tem nela (blocos funcionais agrupados + régua posicional interativa);
   - Layout completo campo a campo (`Posição`, `Tamanho`, `Formato`, `Status M/C`, `Regra Exata de Condicionalidade`, `Descrição e Exemplo` e `Impacto de Ausência/Erro`).
2. **Desenho de cada fluxo operacional de Outgoing (8 cenários separados)**:
   - `Fluxo 01`: Compra Presencial à Vista (Chip EMV Contato & Contactless NFC)
   - `Fluxo 02`: Compra Parcelada Brasil (Parcelado Lojista s/ Juros vs Emissor / Crediário — `TCR 2 BR pos 40–41 = parcelas + 10` vs `Elo Reg 00/01/02 Tipo 990–995` vs `Mastercard PDS 0195 SF2=04/03`)
   - `Fluxo 03`: Compra E-Commerce Autenticada (`3DS 2.2 + Tokenização VTS / MDES / PTE`)
   - `Fluxo 04`: Subcredenciador (`PayFac`), Marketplace ou Carteira Digital Transacional (`TCR E` vs `Elo Reg 01 CNPJ Subcred + Reg 02 Campos 140/150 EC Final` vs `Mastercard PDS 0176 + PDS 0208 + PDS 0220`)
   - `Fluxo 05`: Estorno / Crédito ao Portador (`TC 06 / TE06 / 1240 DE 3=20`) & Reversão (`TC 25 / TE25`)
   - `Fluxo 06`: Transferência de Fundos & Push Payments (`Visa OCT/AFT TCR D Format OC · Elo Proc 53 Registro 03 P2P/CSB/DSB · MoneySend`)
   - `Fluxo 07`: Companhias Aéreas IATA & Setores Especiais (`TCR 3 Format AI · Elo Registro 08 IATA + Taxa Embarque 992/995 · MTI 1644 Addendum`)
   - `Fluxo 08`: Pós-Venda: Disputa (`Chargeback TC 15 / TE15 / MTI 1442`), Ajuste Financeiro (`TC 10/20 · TE10/20 · MTI 1740`) & Rejeição Parcial (`Elo TE01 Registro 09 · Mastercard T112 PDS 0205`)
3. **Matriz Cruzada (`Tabelas × 8 Fluxos`: `M`, `C`, `O`, `-`)** com inspeção interativa da regra por célula.

## Fontes Normativas Consultadas
- **Elo**: *Manual de Mensageria de Liquidação, Transferência de Fundos e Reporte de Fraude Internacional — Versão 26.2* (Vigência: `30/04/2026`, págs. 15–21, 35–38, 69–95, 202–203).
- **Visa**: *BASE II Clearing Interchange Formats, TC 01 to TC 49 & TC 50 to TC 92 — Release 26.1 / 26.2* (Vigência: `18 April 2026`, págs. 44–87, 127–248, 347–365).
- **Mastercard**: *Mastercard Network Processing Dual Message Clearing System Guide — Release 26.2* (Vigência: `25 August 2026`, págs. 98–190).

## Arquivos Criados e Atualizados
- [`frontend/data/outgoing-tables-flows.ts`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/data/outgoing-tables-flows.ts): Base estruturada com 28 tabelas/blocos de Outgoing separados (10 Visa, 10 Elo, 8 Mastercard), 8 fluxos operacionais por bandeira e matriz cruzada.
- [`frontend/app/compliance/outgoing/OutgoingDeveloperDiagrams.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingDeveloperDiagrams.tsx): Componentes visuais inspirados no **Mastercard Developers** e **Visa Developer Center**:
  1. `OutgoingArchitectureBlueprint` (Anatomia física do registro na rede `168-byte ASCII` vs `1014-byte RDW + ISO 8583 Bitmap + PDS TLV` e pipeline em 4 camadas);
  2. `InteractiveWireInspector` (Inspetor split-pane com fita posicional `168-byte` / mapa `Bitmap + PDS TLV`, stream raw interativo e JSON decodificado);
  3. `InteractiveSwimlaneDiagram` (Diagrama de sequência Dual-Message em 5 raias de atores e 3 fases cronológicas);
  4. `InteractiveRuleSandbox` (Playground interativo de gatilhos onde o usuário liga/desliga atributos da transação e vê em tempo real quais tabelas e campos `[C]` viram `[M]`).
- [`frontend/app/compliance/outgoing/OutgoingBitmapExplorer.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingBitmapExplorer.tsx): **Aba 5 — Mapa de Bits (Bitmap 1–128): Autorização (`0100/0110`) × Clearing (`MTI 1240` / `Base II TCR` / `Elo 26.2`)**, com cálculo em tempo real do Primary & Secondary Bitmap em Hexadecimal, 3 modos visuais (`Comparado Auth × Clearing`, `Só Autorização 0100/0110`, `Só Clearing / Outgoing`), 6 presets operacionais, grade interativa de 128 bits e inspetor de transformação `Auth ➔ Clearing` por bit.
- [`frontend/app/compliance/outgoing/OutgoingReportsExplorer.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingReportsExplorer.tsx): **Aba 6 — Relatórios & Conciliação do Outgoing no Dia a Dia (Reports)**, cobrindo as 4 etapas diárias (`T+0 Crítica & Rejeição`, `T+0 Coleta & Inclusão`, `D+1 Liquidação Tesouraria SLC/B3` e `D+1/Mensal Auditoria de Intercâmbio, Downgrades e Data Integrity`) com catálogo detalhado de relatórios oficiais Visa (`VCX VX-100A/111C/120F/204A/220` e `VSS-110/115/120/130/140/900` + `TC 46 / V22120`), Elo (`Retorno TE01 Reg 09`, `Agenda do Credenciador Cap. 5 Registros E0/E1/E2/E3/E9`, `Cap. 6 Originador` e `Cap. 7 Standard/Special Fee Versão 261`) e Mastercard (`T112 / IP857010-AA`, `IP714010-AA Accepted Errors & IP714010-BB Updated Merchant Values`, `IP727020 / IP728010`, `IP776010 / T461 / T464` e `IP755020 / IP755120`).
- [`frontend/app/compliance/outgoing/OutgoingProgramsExplorer.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingProgramsExplorer.tsx): **Aba 7 — Lista Completa de Programas das Bandeiras (Visa, Elo & Mastercard)** organizada em 5 famílias (`1. Data Integrity & Qualidade de Mensageria`, `2. Qualificação de Intercâmbio & Downgrade`, `3. Retentativas de Autorização & CIT/MIT`, `4. Monitoramento de Fraude & Chargeback` e `5. Integridade de Marca, MCC & Subcredenciadores`), detalhando para cada programa a fórmula oficial, a conexão direta com os campos de Autorização e Outgoing, os thresholds/multas e o playbook de prevenção e pedido de Waiver.
- [`frontend/app/compliance/outgoing/OutgoingEducationTrack.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingEducationTrack.tsx) e [`frontend/data/trilhas.json`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/data/trilhas.json): **Aba 8 — Trilha Educativa Passo a Passo (5 Módulos do Zero ao Especialista)** com progresso salvo no navegador, comparativo prático entre as 3 bandeiras, Caso Real de Produção (`Erro Clássico × Consequência × Solução`), Quiz interativo com gabarito comentado e botão de salto direto para praticar nos simuladores.
- [`frontend/app/compliance/outgoing/OutgoingClient.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/OutgoingClient.tsx): Interface interativa com 8 abas principais (`1. Tabelas Separadas`, `2. Desenho de Cada Fluxo`, `3. Matriz Tabelas × Fluxos`, `4. Sandbox Gatilhos [C ➔ M]`, `5. Mapa de Bits`, `6. Relatórios do Dia a Dia`, `7. Lista de Programas das Bandeiras` e `8. Trilha Educativa Passo a Passo`) e **Progressive Disclosure (Sub-abas de leitura focada)**.
- [`frontend/app/compliance/outgoing/page.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/outgoing/page.tsx): Página da rota `/compliance/outgoing` com cabeçalho editorial espaçado.
- [`frontend/app/layout.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/layout.tsx) e [`frontend/app/globals.css`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/globals.css): **Redesign Editorial Clean (Modo Claro Leitura por padrão + Escala Tipográfica Ampliada)** — substitui o fundo preto cansativo (`#020617` / `#030711`) e as fontes cinzas pequenas (`10px`/`11px`) por papel editorial claro (`#f6f7f9`), cards brancos nítidos (`#ffffff`), tinta de alto contraste (`#0f172a` / `#334155`) e ampliação global dos tamanhos de fonte (`.text-[10px]` ➔ `12.5px`, `.text-[11px]` ➔ `13.2px`, `.text-xs` ➔ `14.2px`, `.text-sm` ➔ `15.5px`), mantendo o botão de alternância `☀️ / 🌙` no topo.
- [`frontend/lib/adminModulesCatalog.ts`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/lib/adminModulesCatalog.ts): Registro do módulo `outgoing-arquitetura` no catálogo do Cockpit.
- [`frontend/app/admin/page.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/admin/page.tsx): Inclusão do módulo nos favoritos padrão do Cockpit, filtro por categoria (para visualizar uma categoria por vez sem poluição visual), painel Raio-X recolhível sob demanda e cards estáveis (sem pular ao passar o mouse).
- [`frontend/app/compliance/arquivos/page.tsx`](file:///c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend/app/compliance/arquivos/page.tsx): Atalho de navegação cruzada para `/compliance/outgoing`.

## Validação
- `npx tsc --noEmit` executado em `frontend/` com **0 erros** (`TSC_EXIT=0`).

## Limites e Próximos Passos
- Caso deseje aprofundar ramos setoriais específicos adicionales (Locadoras de Veículos, Hotelaria/Lodging, Frotas/Combustível ou Seguro Saúde), novos registros (`TCR 3 Formats CA/HL/FL` e sub-blocos `MTI 1644`) podem ser adicionados na mesma estrutura.
