---
name: bandeiras-intercambio
description: "Conhecimento de arranjos de pagamento e rulebooks de Visa, Mastercard, Elo e outras bandeiras. Usar em autorizacao, clearing, liquidacao, intercambio, MDR, scheme fees, BIN, IRD/PID, MCC, MPE/T068, Base II, reconciliacao, disputas, fraude, penalidades e regulacao. Definir atores, fluxo origem-destino, calculo, excecoes, obrigatoriedade, fontes e vigencia de tarifas. Para problemas e decisoes, aplicar roteiro de cenarios com causas, alavancas por ator, custo, risco e recomendacao. Nao usar em marketing ou SaaS sem relacao com pagamentos."
---

# Bandeiras & Intercâmbio — Inteligência de Domínio

Esta skill carrega quando a conversa toca arranjos de pagamento. Ela existe para
duas coisas: (1) dar o vocabulário e o mapa de atores corretos antes de qualquer
análise, e (2) padronizar **como** registramos cada regra na memória, para que o
conhecimento acumule de forma comparável entre bandeiras e entre projetos.

> Regra de terminologia herdada: nunca usar "Mandato". Usar **Mandate** (EN) ou
> **Obrigatório** (PT). É terminologia de arranjos de pagamento.

> Contexto de uso (ver memórias do projeto): o usuário é **consultoria
> multi-player** atuando em duas frentes — (A) clearing + intercâmbio e (B)
> rulebook completo. O objetivo de todo material é **rastreabilidade máxima**:
> quem envia, quem recebe, **como calcula**. Bandeiras no motor: Mastercard,
> Maestro, Visa — **Elo em expansão**; Amex/Hipercard ainda não priorizados.

---

## 0. Subdomínios — a regra pertence a qual ciclo?

O domínio não é só intercâmbio. Toda regra capturada deve declarar a qual etapa
do ciclo de vida da transação pertence (campo `subdominio` na metadata). Taxonomia
validada contra o tracker real ([[referencia-tracker-picpay-taxonomia]]):

| Subdomínio | Cobre | Atores típicos origem→destino |
|------------|-------|-------------------------------|
| **autorizacao** | Aprovação/negação em tempo real, ISO 8583, 3DS, score, fallback | Adquirente → Bandeira → Emissor |
| **clearing** | Apresentação, arquivos (MPE/T068, Base II/TC, IPM) | Adquirente → Bandeira → Emissor |
| **liquidacao** | Settlement, feriados, recebíveis, prazos (≠ clearing) | Bandeira ↔ Adquirente/Emissor |
| **intercambio** | Tarifa de intercâmbio, IRD/PID, MCC, tier, cap | Adquirente paga → Emissor recebe |
| **pricing** | Taxa de bandeira, assessments, fees (≠ intercâmbio) | Bandeira recebe ← Adquirente/Emissor |
| **backoffice** | Reconciliação, financeiro, relatórios | Bandeira ↔ Adquirente/Emissor |
| **chargeback** | Disputa/contestação, reason codes, prazos, ciclos | Emissor → Bandeira → Adquirente → EC |
| **fraude** | Risco, monitoria, programas e penalidades, reporting | Bandeira ↔ Adquirente/Emissor |
| **produtos** | Product codes, novos produtos/serviços | Bandeira → Adquirente/Emissor |
| **seguranca** | Segurança da informação, PCI, tokenização, criptograma | Bandeira ↔ todos |
| **operacoes** | Conectividade, endpoints, portais, processos | Bandeira ↔ Adquirente/Emissor |
| **compliance** | Regulatório (Bacen/CP 522), mandates regulatórios | Regulador → Bandeira → players |
| **governanca** | Boletins gerais da bandeira ("Bandeiras"), bundles de release | Bandeira → todos |

Uma mesma regra pode tocar mais de um subdomínio; registre o principal e cite os
demais no corpo. Classifique também (como no tracker): **Classificação**
(Informativo/Mandatório/Opcional/Condicional), **Criticidade** (Baixo/Médio/Alto),
**Impacto Financeiro** direcional (Perda/Ganho/Neutro/N/A) e **Regulatório** (Sim/Não).

---

## 1. Mapa de atores — quem envia e quem recebe os dados

A pergunta "quem está enviando, quem está recebendo" deve ser respondida para
**todo campo** que analisarmos. O fluxo padrão de uma transação de cartão:

```
Portador  →  Estabelecimento  →  Adquirente/Credenciadora  →  Bandeira/Arranjo  →  Emissor
(cardholder)   (lojista)          (captura a transação)         (roteia)            (autoriza/paga)
```

| Ator | Também chamado | Papel | O que envia | O que recebe |
|------|----------------|-------|-------------|--------------|
| **Portador** | Cardholder, titular | Quem paga com o cartão | Dados do cartão (PAN, validade) | Bem/serviço |
| **Estabelecimento** | Lojista, merchant, EC | Quem vende | Valor, MCC, dados da venda | Liquidação (valor − MDR) |
| **Adquirente** | Credenciadora, acquirer | Credencia o lojista e **captura** | Arquivo da transação → bandeira | Tarifa de intercâmbio a pagar |
| **Subadquirente** | Facilitador, PayFac, gateway | Intermedia lojista↔adquirente | Repassa a transação | Repasse líquido |
| **Bandeira** | Arranjo, scheme, rede | Define regras e **roteia** | Roteamento + tabela de tarifas | Taxa de bandeira |
| **Emissor** | Issuer, banco emissor | Emite o cartão e **autoriza** | Autorização/negação | Tarifa de intercâmbio (recebe) |

**Fluxo financeiro das tarifas (sentido contrário ao dado):**
- **Intercâmbio (interchange):** Adquirente **paga** → Emissor **recebe**. Definido na tabela da bandeira.
- **Taxa de bandeira (scheme fee):** Adquirente/Emissor **pagam** → Bandeira **recebe**.
- **MDR:** Lojista **paga** → Adquirente **retém** (engloba intercâmbio + taxa de bandeira + margem).

> Identidade-chave: **MDR ≈ Intercâmbio + Taxa de bandeira + Margem do adquirente.**
> Ao analisar um número, sempre saber qual dessas três camadas ele representa.

---

## 2. Glossário rápido (não confundir)

- **Adquirente ≠ Subadquirente:** o adquirente é credenciado direto na bandeira;
  o subadquirente/facilitador opera por baixo de um adquirente. A regulação
  CP 522 / arranjos do Bacen trata os papéis de forma distinta.
- **Bandeira ≠ Emissor:** a bandeira (Visa) define as regras; o emissor (banco)
  emite o cartão sob aquela bandeira. Um mesmo BIN aponta para emissor + produto.
- **MCC (Merchant Category Code):** classifica o ramo do lojista; é o principal
  driver da faixa de intercâmbio e de exceções (ex.: supermercado, utilities).
- **BIN range:** faixa de números que identifica emissor + bandeira + produto
  (ex.: débito, crédito, pré-pago, corporativo). Usado para descobrir a tarifa.
- **Arquivos de bandeira:** ex. Mastercard **MPE / T068** carregam parâmetros e
  faixas de intercâmbio. Cada bandeira tem layout próprio (posições fixas).

---

## 3. PROTOCOLO de captura de regra (obrigatório)

Quando uma regra, campo, exceção ou tarifa relevante aparecer, **registre na
memória do projeto** usando o template em
[reference/memory-template.md](reference/memory-template.md). Toda regra deve
responder, sem exceção:

1. **Campo** — nome + posição/coluna no arquivo ou planilha.
2. **Quem envia** — ator de origem e em que momento preenche.
3. **Quem recebe** — ator(es) de destino e para que usa(m).
4. **Bandeira / Adquirente / Emissor** — a quem a regra se aplica (ou "todos").
5. **Regra** — o comportamento normal.
6. **Exceções** — casos especiais (MCC, produto, faixa de valor, região).
7. **Obrigatório/Mandate** — é exigido? A partir de qual release/data?
8. **Fonte** — manual/spec + versão + seção (rastreabilidade).
9. **Detalhes adicionais** — observações que não cabem acima.

Princípio **No Invention:** não invente número de tarifa, posição de campo ou
release. Se não estiver na fonte (planilha, manual da bandeira, regulação),
marque como `⚠️ verificar` em vez de afirmar.

**Valor de tarifa sempre com vigência.** Antes de citar valor, percentual,
billing line ou multa, rode `consultar_tarifa` com `data_referencia` igual à
data de corte da análise (padrão: hoje; para caso passado, a data do fato).
Use o bloco `fee_schedule.versao_na_data` e cite valor, moeda, base, início da
vigência e a data da extração (`fee_schedule_fonte.extraido_em`). A mesma linha
pode mudar de moeda ou valor entre versões (ex.: taxa de Third Party Agent Visa
era USD 5.000 até 30/04/2026 e passou a R$ 32.000 em 01/05/2026). Confira se o
valor está sob o subtítulo do programa citado e não só ao lado do código.
Resultado vazio no fee schedule é "não localizado", não "não existe": a
extração pode ter deixado páginas de fora. O fee schedule cobre a Visa Brasil;
para Mastercard e Elo, use `consultar_acervo` e o manual de tarifas da bandeira.
Se a ferramenta não aceitar `data_referencia` (servidor MCP não reiniciado), a
consulta usa hoje; para outra data, rode
`python indice_tarifas/consultar_tarifas.py --pergunta <BL> --data_referencia AAAA-MM-DD`
na pasta `base_bandeiras_local`.

---

## 4. Tag de domínio na memória

Toda memória deste domínio leva `domain: bandeiras` na metadata. Isso impede que
o conhecimento de meios de pagamento contamine projetos de marketing/SaaS, e
permite filtrar por domínio depois. Veja o template para o frontmatter completo.

---

## 5. Problemas e decisões — roteiro de cenários

Quando a pergunta for um **problema, diferença, incidente ou decisão** (não uma
consulta pura de campo/regra), siga
[reference/roteiro-cenarios.md](reference/roteiro-cenarios.md) antes de
responder. Em resumo:

1. **Enquadrar:** sintoma (fato), escopo, decisão que o cliente precisa tomar.
2. **Evidência:** `consultar_campo` (onde está o dado), `consultar_acervo` (regra,
   boletim) e `consultar_tarifa` com `data_referencia` (valor vigente na data do
   caso); marcar fato com fonte × hipótese.
3. **Causas por camada:** dado enviado → configuração → regra → processamento da
   bandeira → processamento interno → interpretação; cada uma com como confirmar.
4. **Alavancas por ator** e **impacto além do técnico** (tarifa, câmbio, contábil,
   regulatório, risco, comercial).
5. **No mínimo três cenários de naturezas diferentes** (corrigir a causa, tratar o
   dado como vem, mudar acordo/configuração, prevenir/monitorar), com esforço
   relativo — nunca estimativa de tempo.
6. **Recomendação** começando pelo teste mais barato que separa as hipóteses, e as
   perguntas em aberto para o cliente e para a bandeira.
