# Modo especificação funcional (EF) — padrão de escrita

Use quando o pedido for **escrever, revisar ou detalhar uma especificação funcional** (EF / Change Impact
Analysis / guia de implementação) a partir de um ou mais boletins de bandeira. Consolida o melhor dos modelos
de referência (EFs de DCC Visa/Mastercard, EF de benefícios PAT, guia de implementação PAT, análise de impacto
DCC, fluxo Elo Voucher, guia de monitoria) e corrige o que faltava neles: fonte por afirmação, quem preenche
cada campo, leitura para o Brasil e rastreabilidade RF → CA → BDD.

Teste sempre **uma seção** (normalmente a 8 — campos) e mostre antes de escrever a EF inteira.

---

## 1. Regras que valem para toda a EF

1. **Fonte por afirmação.** Toda regra, campo, valor, prazo ou multa leva a origem entre colchetes:
   `[GLB 13386.2, p. 5]`, `[DMAS Guide 16/06/2026, p. 870]`. Use `consultar_acervo`, `consultar_campo` e
   `consultar_tarifa`. O que não tem fonte vai como **(a confirmar)** e entra na lista de pendências do anexo.
2. **Grau de certeza.** Marque o que não for literal da fonte: **Interpretado** (leitura nossa, com o
   raciocínio) ou **Pendente** (sem fonte). O que não tem marca é Confirmado.
3. **Quem preenche cada campo** — obrigatório em toda linha de campo:
   `Adquirente envia` · `Emissor envia` · `Bandeira preenche` (system-provided, o participante só recebe) ·
   `Não enviar` · `Repassar sem alterar`. Junto com a **direção** (`Credenciador ▶ Mastercard`,
   `Mastercard ▶ Emissor`).
4. **Leitura para o Brasil** — obrigatória na ficha e em cada item: `Impacta Brasil: Sim | Não | Condicional
   (<condição>)`. Quando a regra é de outra região, dizer por que não impacta (ex.: "somente emissores da
   Europa") e se há efeito indireto no Brasil (transação internacional, bandeira global).
5. **Por papel, nunca só pelo credenciador.** Se o item toca o emissor, a coluna do emissor é preenchida;
   se não toca, escreve-se `N/A — <motivo>`. Coluna vazia é erro.
6. **Genérico.** Sem nome de cliente no conteúdo. O perfil (papel, produto, região) descreve a quem se aplica.
7. **Título que diz a conclusão.** Em seções, slides e caixas: "A Mastercard exige PDS 0002, 0027 e 0220 no
   IPM", e não "Clearing Mastercard".
8. **Exemplo numérico sempre que houver valor, moeda, decimal ou saldo** (ex.: compra de R$ 80,00 com saldo
   de R$ 50,00 → DE 39 = 10, DE 6 = 5000; ATM em JPY sem casas decimais).
9. **Siglas e termos.** Nome oficial em inglês na 1ª ocorrência + explicação em português. Mensagens ISO com 4
   dígitos (0100, 1240).

### Postura investigativa (sempre)

Não basta transcrever o boletim. Antes de escrever, investigar:

- **Cruzar fontes**: boletim × manual de mensageria (DMAS/SMS/DMC, V.I.P./BASE II, manuais Elo) × regulamento
  do arranjo × versões anteriores do mesmo boletim × itens relacionados de outras bandeiras. Se duas fontes
  divergem, mostrar a divergência com as duas páginas, não escolher uma em silêncio.
- **Como era antes × como fica agora**, campo a campo e regra a regra: valor antigo, valor novo, desde quando,
  o que deixa de existir (descomissionamento) e o que convive no período de transição.
- **Suspeitar**: data que não bate, campo citado sem manual que o confirme, valor de multa sem condição,
  boletim que diz "obrigatório" mas o manual diz "condicional", exemplo que contradiz a regra, erro de tradução
  entre a versão em inglês e a em português. Toda suspeita vira item em Pendências com o que falta confirmar.
- **Seguir o dado até o fim**: de onde ele nasce (terminal, cadastro, emissor, bandeira), por onde passa
  (autorização, resposta, clearing, liquidação, disputa) e onde é usado (intercâmbio, conciliação, monitoria).
  Um campo que entra na autorização e não tem destino no clearing ou na conciliação é uma pergunta em aberto.
- **Efeitos de segunda ordem**: o que quebra se o participante não fizer (rejeição, recusa, downgrade de
  intercâmbio, multa, perda em disputa) e o que muda para quem não é o alvo direto do boletim.

---

## 2. Estrutura

Mantenha a numeração. Seção sem conteúdo fica com `Não se aplica — <motivo>`, nunca vazia nem com texto do modelo.

**0. Ficha do documento**

| Campo | Conteúdo |
|---|---|
| Bandeira(s) | |
| Boletins / release | IDs com versão (`GLB 13386.2`), título original |
| Publicação | data de cada boletim |
| Vigência | **por item e por sistema** (`10/11/2026 – Autorização`, `CPD 11/11/2026 – Clearing`) |
| Papéis afetados | Adquirente / Emissor / Subcredenciador / Processadora — com obrigatoriedade de cada um |
| Impacta Brasil | Sim / Não / Condicional — com o motivo |
| Classificação | action indicator oficial + leitura operacional (Mandate / Condicional / Opcional / Informativo) |
| Versão da EF / status / histórico | sem sobras de modelo (data, versão e status reais) |

**1. Objetivo** — 1 parágrafo "o que o participante passa a fazer e por quê" + bullets do escopo técnico.

**2. Premissas** — condições que precisam ser verdade para a EF valer (elegibilidade, cadastros, contratos).

**3. Fora de escopo** — o que parece relacionado e não entra, com o motivo e, se houver, onde é tratado.

**4. Escopo por papel + fluxo nível 0**
- Um bloco por papel: Autorização · Clearing · Liquidação · Backoffice/Compliance.
- Fluxo de ida e volta (texto ou diagrama): captura → autorização (ida e resposta) → decisão → clearing →
  liquidação → exceções. Para fluxo visual de uma página, ver a seção 4 deste guia.

**5. Calendário** — duas partes: **datas da bandeira** (publicação, testes/MTF, vigência por sistema, início de
monitoria, cobrança) e **marcos do projeto** (desenvolvimento, homologação, certificação, go-live). Data
desconhecida = `A definir`, nunca linha vazia.

**6. Benefício e risco** — ganho (receita, aprovação, conformidade) e custo de não fazer (multa, rejeição,
recusa), com valor e fonte quando houver.

**7. Plataformas × papel** — matriz sistema × papel com `MANDATÓRIO` / `CONDICIONAL (<quando>)` / `OPCIONAL` /
`N/A`. Sistemas típicos: autorização, clearing, liquidação, cadastro/onboarding, terminais/captura, disputas,
conciliação, APIs.

**8. Descrição do item da bandeira**
- 8.1 Contexto do produto/regra em português claro e **o que muda × como era antes**.
- 8.2 **Tabela de campos por mensagem** (uma por sistema):

  | Campo | Nome oficial | Mensagens | Direção | Quem preenche | Formato | Valores | Regra / condição | Fonte |
  |---|---|---|---|---|---|---|---|---|
  | DE 112 SE 055 SF 01 | ... | 0100 | Credenciador ▶ MC | Adquirente envia | (formato só se na fonte) | Y / N | ... | [AN 8311, p. x] |

- 8.3 **De-Para autorização → clearing**: de onde vem o valor de cada PDS/TCR/registro
  (ex.: DE 112.055.02 da 0110 → PDS 0027 do 1240).
- 8.4 Exemplos numéricos e caixas de alerta (consequência financeira com valor e fonte).

**9. Requisitos funcionais**

| ID | Requisito | Papel / sistema | Obrigatoriedade | Origem |
|---|---|---|---|---|
| RF-001 | verbo no infinitivo, um comportamento por linha | | M / C / O | [boletim, p.] |

**10. Check-list por papel** — cada linha marcada `✓ aplicável` / `N/A`. Nunca entregar a matriz vazia.
Inclui a análise de risco: risco, probabilidade, impacto, mitigação (ou "Nenhum risco relevante identificado").

**11. Compliance e penalidades** — proibições, programas de monitoria e multas. Toda multa passa pelo
`consultar_tarifa`: valor, quem paga, condição de aplicação, quando **não** se aplica, código de cobrança.

**12. Tratamento de exceções**

| Cenário | Tratamento no sistema | Risco financeiro / operacional | Fonte |
|---|---|---|---|

Cobrir: campo ausente, valor desconhecido, formato inválido, reversão/estorno (0400/0420), chargeback,
timeout/stand-in, produto ou BIN não reconhecido, transação fora do Brasil quando a regra é doméstica.

**13. Critérios de aceite**

| ID | Critério verificável | RF de origem | Sistema |
|---|---|---|---|
| CA-01 | | RF-001 | |

**14. Cenários BDD** — `DADO / QUANDO / ENTÃO / E`, cada um apontando os CA que valida. Mínimo: caminho feliz,
recusa/negativa, cada exceção relevante da seção 12 e o fluxo de volta (resposta, clearing, disputa).
Usar valores reais de campo nos cenários.

**15. Anexo**
- 15.1 Fontes: documento, versão, data, páginas usadas.
- 15.2 Pendências (a confirmar): o que falta, quem pode confirmar, impacto se estiver errado.
- 15.3 Glossário dos termos usados.

---

## 3. Guia completo de implementação de um tema (ex.: 3DS, tokenização, DCC, PAT)

Quando o pedido for "como desenvolver X" e não um boletim isolado, o documento cobre **todas as bandeiras e
todos os caminhos**, e é escrito para três leitores: **negócio** (o que é, por que existe, quanto ganha ou
perde), **produto** (jornada do portador e do lojista, decisões, regras) e **tecnologia** (campos, mensagens,
arquivos, testes). Cada seção abre com o resumo em linguagem de negócio e desce ao campo.

**Antes de escrever:** levantar no acervo a versão vigente de cada bandeira (Visa, Mastercard, Elo, e Amex/
Hipercard se o cliente aceita), o histórico (como era antes) e os boletins em aberto que ainda vão mudar o tema.

**Mapa obrigatório de áreas impactadas** — cada área recebe a seção "o que muda / o que desenvolver / quem é
dono", ou `Não impacta — <motivo>`:

| Área | O que olhar |
|---|---|
| Negócio e produto | proposta de valor, receita/custo, responsabilidade por fraude (liability shift), experiência do portador e do lojista, taxa de aprovação |
| Cadastro / onboarding de EC | habilitação do serviço por lojista, MCC, canal, dados obrigatórios (ex.: URL, MCC, ID do lojista no diretório), contratos e termos |
| Terminais e captura | alteração de aplicação POS/TEF/e-commerce/SDK, versão mínima, **atualização do parque de terminais** (quantos, quais modelos, prazo, homologação), telas e comprovantes |
| Gateway / e-commerce / mobile | SDK, integração com servidor (ex.: 3DS Server/MPI), tratamento de desafio (challenge) e frictionless, timeouts, fallback |
| Prevenção a fraudes | regras e scores, dados enviados para análise de risco, exceções/isenções, monitoria de fraude e chargeback |
| Autorização | campos e valores por bandeira e por resultado, resposta do emissor, reversões, stand-in |
| Outgoing / clearing | o que precisa ir no arquivo (IPM, BASE II, ASLC/Núclea), De-Para desde a autorização, rejeições |
| Liquidação e conciliação | efeito no intercâmbio, tarifas, relatórios, conciliação |
| Disputas / chargeback | reason codes afetados, quem fica com a responsabilidade, evidências a guardar e por quanto tempo |
| Compliance e monitoria | programas da bandeira, metas, multas, prazos de adequação |
| Operação e suporte | atendimento ao lojista, rotinas, alertas, documentação |
| Certificação e testes | ambiente, roteiro por bandeira, critérios de aceite, cenários BDD |

**Todos os caminhos**: para cada bandeira, desenhar os ramos possíveis do fluxo (ex.: 3DS — frictionless
autenticado, desafio aprovado, desafio recusado, tentativa/attempt, não suportado pelo emissor, timeout,
isenções, transação recorrente/MIT, versão de protocolo) e, para cada ramo, o que vai na autorização, no
clearing e na disputa, e quem fica com a responsabilidade pela fraude. Comparar as bandeiras lado a lado no
mesmo ramo.

## 4. Planilha de impacto multi-bandeira

Quando o tema atravessa bandeiras (ex.: DCC, PAT), além da EF gere a matriz **bandeira × tema** com colunas
`Autorização | Clearing | Liquidação | Tipo (M/C/O)` e uma linha por tema (produto e identificação, interface,
recibo, clearing, disputas, compliance). Cada célula técnica segue o formato da planilha da release
(Mensagens / Campos ENVIAR–RECEBER / O que desenvolver).

## 5. Fluxo visual de uma página

Estrutura que funciona (modelo Elo Voucher): 1 Captura (canais) → 2 Autorização (identificação e regras: cada
campo com número e valor) → 3 Decisão de roteamento (losango com SIM/NÃO) → 4 Clearing (registro, campo,
posição, conteúdo) → 5 Liquidação (prazo) → 6 Exceções → 7 Sistemas impactados → 8 Legenda → 9 Regras
principais → rodapé com as referências. Cada caixa de campo diz **quem preenche**; o rodapé cita boletim e
regulamento **com versão e vigência**. Nenhum dado do fluxo pode existir só no desenho: tudo precisa estar na
EF com fonte.

---

## 6. Checklist de qualidade antes de entregar

- [ ] Fontes cruzadas (boletim × manual × regulamento × versão anterior) e divergências expostas?
- [ ] "Como era antes × como fica agora" por campo e por regra?
- [ ] Suspeitas registradas em Pendências, nenhuma resolvida em silêncio?
- [ ] Guia de tema: todas as bandeiras, todos os ramos do fluxo e todas as áreas do mapa (ou `Não impacta — motivo`)?
- [ ] Legível para negócio e produto, não só para tecnologia?

Erros que já apareceram nos modelos de referência e que não podem se repetir:

- [ ] **Sem sobras de modelo**: copyright, datas, status "v1.0 ·" vazio, seção em inglês não preenchida,
  instrução do modelo ("Preencher com MANDATÓRIO...") ainda no texto.
- [ ] **Nenhuma matriz vazia**: check-list e plataformas com todas as células marcadas.
- [ ] **Sem contradição interna**: o mesmo prazo, valor ou campo é igual em todas as seções (ex.: prazo de
  registro anual que aparecia como julho numa seção e agosto no anexo).
- [ ] **Exemplos coerentes com a regra**: lista de "não autorizados" não pode trazer códigos que o anexo diz
  serem autorizados.
- [ ] **Programa atribuído ao dono certo**: Data Integrity, MCC Performance, VIRP, BRAM são da bandeira; não
  atribuir ao Banco Central o que é programa da bandeira, nem o contrário.
- [ ] Toda regra, campo, prazo e multa com fonte `[documento, página]` ou marcada (a confirmar).
- [ ] Toda linha de campo com **direção** e **quem preenche**.
- [ ] **Impacta Brasil** respondido na ficha e em cada item regional.
- [ ] Emissor e adquirente tratados (ou `N/A — <motivo>`).
- [ ] Vigência por item e por sistema, não só a data da release.
- [ ] RF → CA → BDD rastreáveis pelos IDs; todo CA tem pelo menos um BDD.
- [ ] Multas e tarifas conferidas no `consultar_tarifa` com condição de aplicação.
- [ ] Fluxo visual (se houver) sem dado que não esteja na EF.
- [ ] Nenhum nome de cliente no conteúdo.
