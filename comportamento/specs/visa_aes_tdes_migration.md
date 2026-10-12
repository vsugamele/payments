# Visa — Migração de Criptografia TDES → AES

**Bandeira:** Visa · **Região:** Global (com ações para Brasil) · **Tema:** substituição do
Triple DES (TDES) pelo Advanced Encryption Standard (AES) em chip/PIN e CNP (CAVV/3DS).
**Fonte:** PicPay_Overview_Consolidado, aba Visa (6 itens). `⚠️ verificar` = não confirmado na fonte.

---

## 1. Cronologia

| # | Data pub. | Item | Classificação | O que trouxe |
|---|-----------|------|---------------|--------------|
| 1 | 16/01/2025 | **AI14825** Preparing for Implementation of the AES in Transaction Processing | Informativo | Aviso: Visa vai migrar TDES→AES; transição longa e faseada; AES e TDES coexistirão; sem ação imediata. |
| 2 | 20/03/2025 | **AI15046** Essential Steps for AES Readiness | Informativo | Boas práticas; lista preliminar das **16 chaves** a migrar; avaliar HSMs e atualizar a ZCMK. Caixa AESMigration@visa.com. |
| 3 | 04/09/2025 | **AI15277** Guidance for a Timely Migration to AES | **Mandatório** | **Cronograma oficial:** iniciar migração até fim de **2030**; **2031** = fim do TDES. Chip + PIN online. |
| 4 | 25/09/2025 | **Item 4.2** Changes to Support a New Version of CAVV Data | Opcional | Spec do **CAVV Version 9** (algoritmo AES) no **Field 126.9**; vigência 17/04/2026. |
| 5 | 06/11/2025 | **AI15765** Visa Secure DS Will Support New CAVV Version | Informativo | O Visa Secure **DS passa a gerar CAVV v9**; adesão emissor opcional; sem ação para adquirente. Vigência 26.Q2. |
| 6 | ~02/2026 | **AES Migration Documentation** | Informativo | Visa publica **guias de migração** no Visa Access (POS/ATM, EMV, PIN, CAVV v9). Vigência 23/10/2026. |

**Marcos derivados:**
- **Abr/2026 (26.Q2):** CAVV Version 9 disponível (DS gera; emissor opcional).
- **Out/2026 (26.Q4):** guias de migração publicados (Visa Access).
- **Fim de 2030:** participantes devem **iniciar** a migração.
- **2031:** **descontinuidade total do TDES** — proibido emitir/operar cartões e chaves TDES.

---

## 2. Especificação

### 2.1 Escopo e motivação
Substituir o TDES pelo AES em todo o ecossistema Visa: cartões com chip (EMV),
PIN online (POS/ATM) e criptografia CNP (CAVV/3-D Secure). Motivação: AES usa chaves
de **128/192/256 bits** (vs ~chaves menores do TDES), maior resistência a ataques e
preparação para computação quântica; NIST recomenda aposentar o TDES; alinhamento PCI/EMVCo.

### 2.2 Chaves a migrar (lista preliminar — AI15046, 16 chaves)
ZCMK (Zone Control Master Key), AWK (Acquirer Working Key), IWK (Issuer Working Key),
AEK (Acquirer Online Exchange Key), IEK (Issuer Online Exchange Key), AC-MDK (MDK-Cryptogram),
MDK-MAC, MDK-ENC, CVK, CVK2, PVK (PIN Verification Key), BDK (Base Derivation Key),
CAVK (CAVV Key), CAAV Key, WSD Key, KUD (Data Encryption Key). `⚠️ lista sujeita a revisão pela Visa.`

### 2.3 Componente CNP — CAVV Version 9 (Field 126.9)
- **Onde:** Field **126.9** (Usage 3 – 3-D Secure CAVV), mensagens **0100/0120** e **0200/0220** no V.I.P. (Authorization Only e Full Service).
- **O que muda:** novo **algoritmo AES** + novo **layout (bytes 1–20)**. Destaques:
  - Byte 1: 3DS Authentication Results Code (inalterado).
  - Byte 2: Authentication Method A.
  - Bytes 4–9: reorganizados (Seed Value / Supplemental Data).
  - Bytes 10–15: Supplemental Data (valor de autenticação 3 bytes hex; código de moeda 1,5 byte BCD; data juliana UTC 1,5 byte BCD).
  - **Byte 16:** versão **"9"** do CAVV (algoritmo AES) + protocolo EMV 3DS ("5"=2.2.x, "6"=2.3.x).
  - Byte 17: Authentication Method B ("00"=N/A).
  - Bytes 18–20: Informational Data (Merchant Identifier = 6 primeiros dígitos do hash do nome do comerciante; Authentication Request Type: 0=N/A, 1=recorrente, 2=parcelado).
- **Inalterados:** Field 44.13 (CAVV Results Code) e Field 126.20 (3DS Indicator).
- **Adesão:** geração inicial só pelo **Visa Secure DS**; pelos **ACS dos emissores** depois.
  Obrigatoriedade do emissor **adiada → opcional (recomendada)**. CAVV v7 continua válido.

### 2.4 Componente chip / PIN (AI15277)
- Cartões novos ou de substituição geram **criptogramas EMV com AES**.
- Adquirentes com **PIN online (POS/ATM)**: atualizar **HSMs**, sistemas, aplicações e
  processos de **gestão de chaves**.
- **AES e TDES coexistem** durante a transição.
- **Visa Chip Authenticate** validará criptogramas AES.

### 2.5 Ações por papel
- **Adquirente:** roadmap de renovação de **terminais POS/ATM** com suporte AES; atualizar
  HSMs; validar com fornecedores HW/SW; se **Visa Secure**, reconhecer **CAVV v9** e tratar
  os novos subcampos do Field 126.9; incorporar AES no planejamento de certificação.
- **Emissor:** chips compatíveis com AES; HSMs; revisar validação de PIN e CAVV v9;
  (ACS gerando CAVV v9 — fase futura).
- **Bandeira (Visa):** DS gera CAVV v9; Visa Chip Authenticate valida AES; guias no Visa Access;
  suporte AESMigration@visa.com.

### 2.6 Custos e classificação
- **Custos:** sem tarifas adicionais (segue o padrão de migrações anteriores entre chaves TDES).
- **Classificação do programa:** majoritariamente **Informativo/Readiness**; **1 item Mandatório**
  (AI15277 — o cronograma); **CAVV v9 = Opcional** para emissor / **condicional** para adquirente Visa Secure.

### 2.7 ⚠️ Verificar
- Lista final das 16 chaves (preliminar) e tamanhos de chave por serviço.
- Posição/sub-bytes exatos do Field 126.9 contra o manual V.I.P. vigente.
- Datas internas de adequação (Brasil) por participante.
