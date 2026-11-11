# Sessão 10/11/2026 — Execução das 5 Melhorias Estruturais (Parser Forense de Lote Real, Boletins 2026/2027 + Planilha CSV, Calculadora de Downgrade em R$, 4ª Bandeira Amex e Busca Global Ctrl+K)

## Escopo e Objetivo
Executar as 5 frentes de melhoria mapeadas para o sistema **Payments / Tabelas de Intercâmbio & Outgoing**:

1. **Frente 1 — Parser & Validador Forense de Arquivos Reais de Outgoing (`.ctf` / `.txt` / `.ipm` / `.dat` — 100% Client-Side & PCI Masked)**
   - Evoluída a **Aba 6 (`OutgoingBatchValidator.tsx`)** com modo **Upload / Colagem de Arquivo Real** e 4 lotes completos multi-linha de homologação (**Visa Base II 168B**, **Elo Liquidação 27.1 168B**, **Mastercard IPM MTI 1240/1644** e **American Express GNS/CAS**).
   - **Mascaramento automático PCI-DSS 4.0 de PAN (`6 BIN + ****** + 4 dígitos finais`)** diretamente no navegador.
   - **Auditoria matemática de Trailer (`TC 91/92`, `BZ`, `MTI 1644-695`, `TBT/TFT`)**: compara a soma financeira e a contagem de transações declaradas no Trailer com a soma real calculada nas transações.
   - **Auto-Saneamento e Download do Lote Corrigido (`.txt` / `.ctf`)** com 1 clique.

2. **Frente 2 — Atualização da Central de Boletins (`/compliance/boletins`) com os Releases 2026/2027 + Exportador de Planilha (`.csv` Excel)**
   - Expandido `frontend/data/boletins-bundle.json` de `3` para **`8` Fichas Completas de 3 Lentes** (`tecnica`, `normativa`, `negocio`), `7` campos comportamentais e `385` itens no Radar de Releases:
     - `ELO R27.1-PACOTE`: Boletim + 5 Manuais Elo Release 27.1 (Maio/2027 — `1.401` páginas, `Header B0 Versão 271`, `CNPJ Alfanumérico Reg 01 C45 / Reg 02 C150 / BIT 107 Conj 57`);
     - `VISA AI-15915`: Agentic Commerce, Token Requestor Controls & CAVV v9 Readiness (Abril/2027);
     - `VISA DIRECT-AFT-OCT-26`: Visa Direct Original Credit (OCT) & Account Funding Transaction (AFT) Processing Guide (`342` páginas, `TCR D Format OC`);
     - `MC BRAZIL-FEES-2026`: Manual de Preço da Mastercard Brasil (`m_BrazilFees_pt-br_10_6.pdf` — `205` páginas, `06/10/2026`) & Fatura MCBS `GLB 12332.5 (TN3A)`;
     - `MC LAC-IC-R26.2`: Mastercard LAC Interchange Manual (`3.393` páginas) & Dual Message Clearing R26.2 / Jan 2027 (`PDS 0158`, `PDS 0176/0208/0220`, `PDS 0195`).
   - Adicionados 3 botões de **Exportação em 1 Clique para Planilha de Controle de Release (`.csv` UTF-8 BOM compatível com Excel)**:
     - `📥 Planilha Aba Adquirente (.csv)`
     - `📥 Planilha Aba Emissor (.csv)`
     - `📥 Consolidado MÃE (.csv)`

3. **Frente 3 — Calculadora Financeira de Downgrade de Intercâmbio, Data Integrity & Multas no Outgoing (`R$`)**
   - Criado `frontend/app/compliance/outgoing/OutgoingDowngradeAndAmex.tsx` e integrado em `/compliance/outgoing` (**Aba 14**).
   - Permite simular 8 falhas reais de Outgoing ajustando **TPV Mensal (`R$`)**, **Ticket Médio (`R$`)** e **% de Volume Afetado**, calculando em tempo real:
     1. **Perda mensal por Downgrade de Intercâmbio** (`Tier Qualificado CPS/IRD` vs `EIRF/Standard`, respeitando os tetos regulatórios BCB de `0,50%` Débito e `0,70%` Pré-Pago);
     2. **Custo de Scheme Fees / Data Integrity Billing Lines** (`VSS-130/140`, `MCBS TN3A / GDIP`, `Elo Cap. 7`);
     3. **Exposição adicional a Chargebacks por perda de Liability Shift**;
     4. **Exportação direta da Memória de Cálculo para o Doc Studio / Dossiê de Waiver**.

4. **Frente 4 — Inclusão da 4ª Bandeira no Outgoing: American Express (`Amex GNS / Global Codes / CAS`)**
   - Mapeados os **7 blocos/registros de Outgoing da American Express** (`TFH Header`, `TAB Batch`, `TDR Transaction Detail / MTI 1240`, `TAA Airline Addendum IATA`, `TLA/TRA Lodging & Auto Rental`, `TPF Payment Facilitator / Submerchant` e `TBT/TFT Trailers`) com tabela de equivalência direta entre **Amex × Visa Base II × Elo 27.1 × Mastercard IPM**.

5. **Frente 5 — Busca Global Instantânea (`Ctrl+K`) & Padronização Editorial Clara nas Páginas Internas**
   - Criado `frontend/components/GlobalCommandPalette.tsx` integrado ao `layout.tsx` e `Navbar.tsx` (`Ctrl+K` / `Cmd+K` + botão `🔍 Buscar Ctrl+K` no topo).
   - Estendidas as regras de `frontend/app/globals.css` para que containers legados (`bg-[#02050b]`, `bg-[#050b16]`, `bg-[#080f1e]`, `bg-[#040914]`) em `/compliance/boletins`, `/compliance/campos`, `/compliance/conciliacao` e `/simulador` renderizem com cartões brancos e tipografia de alto contraste no modo claro.

## Arquivos Criados / Modificados
- `frontend/app/compliance/outgoing/OutgoingBatchValidator.tsx`
- `frontend/app/compliance/outgoing/OutgoingDowngradeAndAmex.tsx`
- `frontend/app/compliance/outgoing/OutgoingClient.tsx`
- `frontend/app/compliance/boletins/page.tsx`
- `frontend/data/boletins-bundle.json`
- `frontend/components/GlobalCommandPalette.tsx`
- `frontend/components/Navbar.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `docs/sessions/2026-11/2026-11-10-cinco-melhorias-outgoing-boletins-amex-ctrlk.md`
