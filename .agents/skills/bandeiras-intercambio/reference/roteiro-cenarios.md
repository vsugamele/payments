# Roteiro de cenários — do problema às alternativas

Use quando a pergunta for um **problema, diferença, incidente ou decisão** ("por que liquidou
em dólar?", "como separamos isso?", "o que fazemos com esse boletim?"). Não use para consulta
pura de campo ou regra — aí basta responder com a fonte.

O objetivo é não parar na primeira solução técnica: mapear **quem pode agir, o que custa,
que risco cria e o que confirmar primeiro**, sempre separando fato (com fonte) de hipótese.

---

## Passo 0 — Enquadrar o problema

Responda antes de qualquer cenário:

| Pergunta | Exemplo |
|---|---|
| **Sintoma observado** (fato, não interpretação) | "Transação nacional apareceu liquidada em USD no VSS" |
| **Escopo** | bandeira, produto/BIN, período, volume, quantas transações |
| **Quem percebeu e onde** | contabilidade, conciliação, relatório X, campo Y |
| **O que já se sabe × o que é suposição** | "NNSS = Y e Travel = Y" é fato; "liquida em BRL" é suposição |
| **Decisão que o cliente precisa tomar** | regra contábil, correção de sistema, negociação, nada |

Se faltar o sintoma concreto (qual relatório, qual campo, qual valor), **peça** antes de seguir.

## Passo 1 — Evidência primeiro

- `consultar_campo` para onde o dado está (registro, posição, página) — o resultado já traz
  `tarifas_relacionadas` quando o campo dispara ou concilia uma tarifa curada.
- `consultar_tarifa` para valor, quem paga, linha de faturamento e, sobretudo, **condição de aplicabilidade
  e "não se aplica"** — conferir antes de citar uma tarifa como impacto do caso.
- `consultar_acervo` para a regra e o boletim.
- Marque cada afirmação: **[fonte: doc, página]** ou **[hipótese]** ou **⚠️ verificar**.
- Procure também: tarifa ou programa disparado pelo comportamento, boletim recente que mudou a regra,
  diferença entre publicação e vigência.

## Passo 2 — Causas candidatas, por camada

Percorra a cadeia; cada causa precisa de **como confirmar** (campo, relatório ou pergunta):

| Camada | Pergunta | Exemplo de confirmação |
|---|---|---|
| **Dado enviado** | O que o cliente mandou? | Flag/indicador no arquivo de saída (ex.: Settlement Flag TC05 pos. 150) |
| **Parâmetro / configuração** | Como a bandeira, o emissor ou o cliente estão configurados? | Tabelas de BIN, VSS-100-W, IP0048T1/IP0050T1, contrato |
| **Regra da bandeira** | O que o rulebook manda nessa condição? | Manual, boletim, edit/reject code |
| **Processamento da bandeira** | O que a bandeira de fato aplicou? | Retorno por transação (TC33 CAS, IP755120-AA) |
| **Processamento interno** | Como o sistema do cliente leu e registrou? | Parser, regra contábil, de-para |
| **Interpretação / relatório** | O número visto é efetivo ou de referência? | Moeda de liquidação × moeda convertida para exibição |

## Passo 3 — Alavancas por ator

Para cada ator, quais **ações estão ao alcance** dele:

| Ator | Alavancas típicas |
|---|---|
| **Adquirente / credenciadora** | dado que envia (flags, indicadores), parametrização, retornos que assina (CAS, relatórios), regra de conciliação, monitoramento |
| **Emissor** | configuração de BIN e produto, moeda de faturamento/liquidação, adesão a serviços (NNSS etc.) |
| **Bandeira** | configuração de liquidação, exceção ou waiver, esclarecimento formal (case/suporte), cronograma de mudança |
| **Áreas internas do cliente** | contabilidade (critério), tesouraria (câmbio, caixa), comercial (repasse, negociação), jurídico/regulatório (Bacen), operações |
| **Estabelecimento / subadquirente** | dado de origem (MCC, moeda da venda), contrato, repasse |

## Passo 4 — Dimensões de impacto

Para cada causa ou cenário, olhe além do técnico:

- **Financeiro:** tarifas disparadas (ex.: non-domestic settlement fee), intercâmbio, prazo de liquidação (D+N).
- **Cambial:** exposição a moeda estrangeira, data da taxa, quem absorve a variação.
- **Contábil:** classificação, conciliação, provisão.
- **Operacional:** retrabalho, exceções manuais, dependência de terceiros.
- **Regulatório:** Bacen/arranjo, obrigatoriedade (Mandate), prazos.
- **Risco:** chargeback, fraude, penalidade por dado incorreto.
- **Comercial:** repasse ao EC, argumento de negociação com bandeira ou emissor.

## Passo 5 — Montar os cenários

Monte **pelo menos três cenários de naturezas diferentes**:

1. **Corrigir a causa:** mudar o dado, a configuração ou o processo que gera o problema.
2. **Tratar o dado como vem:** usar a informação que a bandeira devolve (retorno por transação) e ajustar o lado do cliente.
3. **Mudar o acordo ou a configuração com terceiros:** emissor, bandeira, contrato.
4. **Prevenir e monitorar:** alerta, controle ou indicador para o problema não voltar silenciosamente.

Para cada cenário, preencha:

| Campo | Conteúdo |
|---|---|
| **O que muda** | ação concreta |
| **Quem age** | ator e área |
| **Esforço relativo** | baixo / médio / alto (sem estimativa de tempo) |
| **Custo e risco** | tarifas, câmbio, risco operacional ou regulatório |
| **Dependência externa** | precisa de bandeira, emissor, fornecedor? |
| **Evidência que sustenta** | doc + página |
| **O que falta confirmar** | hipótese aberta |

## Passo 6 — Recomendação

- Ordene os cenários e diga **por que** o primeiro vem primeiro.
- Comece pelo **teste mais barato que separa as hipóteses** (ex.: olhar o serviço `001` × `014` de uma transação).
- Separe o que o cliente faz sozinho do que depende de terceiros.
- Liste as **perguntas para o cliente ou para a bandeira** que destravam a decisão.

---

## Formato de saída sugerido

```markdown
## Problema
<sintoma + escopo + decisão necessária>

## Causas candidatas
| Camada | Hipótese | Como confirmar | Evidência |

## Cenários
| # | Cenário | Quem age | Esforço | Custo/risco | Depende de | Evidência |

## Recomendação
1. <primeiro passo de confirmação> — porque <...>
2. ...

## Perguntas em aberto
- <para o cliente> / <para a bandeira>
```

---

## Anti-padrões

- **Inferir comportamento transacional por indicador estático** (BIN, tabela de parâmetro) quando existe retorno por transação.
- **Aplicar um total agregado** (relatório por SRE ou serviço) a transações individuais sem conciliar.
- **Confundir publicação com vigência**, ou edição de manual com data de implantação do item.
- **Entregar um único cenário técnico** sem olhar custo, câmbio, contrato e monitoramento.
- **Inventar tarifa, prazo ou posição** — sem fonte, marcar `⚠️ verificar`.
- **Dar estimativa de tempo** — usar esforço relativo.

---

## Exemplo de referência — liquidação em USD de transação nacional (Visa, out/2026)

**Problema:** emissor, estabelecimento e adquirente no Brasil; transação liquidada em USD no VSS. O BIN tinha NNSS = Y e Travel = Y.

**Causas candidatas:**
- Settlement Flag enviado `0` ou `9` → ISS em vez de NNSS [BASE II Data Codes, p. 105].
- Moeda de origem diferente de BRL → transação inelegível ao NNSS [GTLIG Oct23, p. 356, reason code 48].
- BIN com moeda de liquidação no ISS configurada em USD [AI11474: configuração por BIN].
- Confirmação: serviço `001` × `014` e moeda no VSS-110 (TC46 subgrupo 2, pos. 47–52) ou no TC33 CAS (pos. 123–129).

**Cenários:** (1) contabilizar pelo CAS ou VSS-110 por transação; (2) revisar o Settlement Flag nas faixas elegíveis ao NNSS; (3) perguntar ao emissor ou à Visa se a configuração em USD da faixa é intencional; (4) tratar a exposição cambial na tesouraria; (5) alertar quando transação BR/BR/BRL voltar no serviço `001`.

**Armadilha registrada:** a Non-Domestic Currency Settlement Volume Fee (25 bps, linhas 5VAS03155/5VAS03157) **não** é o custo deste caso — ela incide sobre volume **cross-border** (país do estabelecimento ≠ país do emissor) [AI11474 p. 1; AI15912 p. 1]. Sempre conferir a condição de aplicabilidade da tarifa (`consultar_tarifa`) antes de citá-la como impacto.

**Primeiro passo:** consultar o serviço e a moeda de uma transação real com diferença — isso separa as hipóteses de flag, configuração e moeda de origem.
