# Modo planilha de release — linhas da "Planilha de Controle de Itens – Bandeiras"

Use quando o pedido for **preencher/gerar linhas da planilha de controle** de uma release (abas
Adquirente e Emissor). Consolida: as colunas reais da planilha (ex.: Visa Abril 2027 27.Q2 – AR), o
formato técnico **aprovado em 11–12/10/2026** (sem emoji), o `GUIA_ESCRITA_TECNICA.md` e a regra de
profundidade da descrição. Teste sempre **1 item** e mostre antes de gerar o lote.

---

## 1. Antes de escrever

1. Ler o artigo inteiro na fonte (`consultar_acervo`, ou o PDF): visão de negócio, condições, tabelas de
   regras, mensagens, VSS/relatórios, testes. Anotar página de cada fato.
2. Confirmar posições e nomes oficiais com `consultar_campo` (registro, posição, página).
3. Se houver tarifa/programa: `consultar_tarifa` — valor, quem paga, **condição e "não se aplica"**.
4. Separar o que é de cada papel (filtrar o "ruído" voltado ao outro papel).

**No Invention:** formato/tamanho só se estiver no PDF; o que não estiver confirmado vai como
"(a confirmar)". Análise **genérica** — nunca nome de cliente no conteúdo.

---

## 2. Colunas

Aba **Adquirente** (cabeçalho na linha 5, dados a partir da linha 6):

| Col | Cabeçalho | Quem preenche |
|---|---|---|
| A | Bandeira | análise |
| B | Item / Ref. Doc | análise — `[Article 3.5]` + quebra + `APR27-2157` |
| C | Título Original | análise — título em inglês, exato |
| D | ref alan | fórmula `=B<linha>` |
| E | Obrigatoriedade | análise (por papel) |
| F | Escopo / Região | análise |
| G | Sistema Impactado | análise |
| H | Descrição (produto, contexto, o que muda) | análise — parecer, sem parte técnica |
| I | Impacto 53-MTP (Autorizador) | análise — formato técnico |
| J | Impacto 53-Clearing | análise — formato técnico |
| K | Impacto Outros (Disputas / Liquidação / Infra / Tabelas) | análise — formato técnico |
| L | Impacto Financeiro | análise — BAIXO / MÉDIO / ALTO |
| M | Assunto / Tags | análise |
| N | Data de Vigência | análise |
| O–Z | Status (AM 53), Pedido BS2 Clearing, Pedido BS2 Autorizador, Planilha Felipe, ID-BS2, Demandante BS2, Considerações, Consideração Clearing, Consideração Autorização, Tem Desenvolvimento, (vazia), BS2 Full | **cliente — deixar em branco** |

Aba **Emissor**: A Bandeira · B Item / Ref. Doc · C Título Original · D Obrigatoriedade · E Escopo / Região ·
F Sistema Impactado · G Descrição · H Impacto 53-MTP (Autorizador) · I Impacto 53-Clearing ·
J Impacto Outros · K Impacto Financeiro · L Assunto / Tags · M **Data de Publicação** · N Data de Vigência ·
O Status (cliente — em branco).

O mesmo artigo entra **nas duas abas**, com obrigatoriedade e impactos **do papel daquela aba**.

---

## 3. Regras por coluna

**Obrigatoriedade** (por papel): `M — Mandatório` · `C — Condicional (<condição>)` · `O — Opcional (<nota>)`
· `I — Informativo` · `N/A — <motivo>` (ex.: `N/A — Sem impacto para emissor`, `N/A — Somente adquirentes da Europa`).
"Mandatory if Participating" da bandeira vira `C — Condicional (<quem participa>)`.

**Escopo / Região:** `Global (AP, Canadá, CEMEA, Europa, LAC, EUA)` ou a lista da fonte, linha em branco,
`Impacta Brasil: Sim | Não | Condicional (<condição>)`.

**Sistema Impactado:** sistemas separados por espaço, como na fonte (ex.: `Autorização (V.I.P.) Liquidação (VSS)`).

**Descrição (parecer)** — sem campos técnicos (eles ficam só nas colunas técnicas); profundidade igual à das colunas técnicas:
- Resumo de 1–3 linhas abrindo com **"A <Bandeira> está <verbo contínuo> ..."**.
- Seções com título em **negrito** e linha em branco antes e depois, nesta ordem, só as que tiverem conteúdo:
  `CONTEXTO` (o produto/serviço em português claro) · `O QUE MUDA x COMO ERA ANTES` (bullets "Antes: / Agora:") ·
  `CALENDÁRIO` · `LEITURA PARA O BRASIL` (quando a regra é regional) · `IMPACTO FINANCEIRO` (quando a nota for MÉDIO/ALTO por tarifa ou receita — valor, quem paga, condição, fonte) ·
  `AÇÕES RECOMENDADAS` (concretas e acionáveis, por papel) · `RISCO SE NÃO CUMPRIR`.
- Listas com significado de negócio (MCC 5816 = Bens Digitais – Jogos), exceções e sub-regras explícitas.
- Siglas: inglês na 1ª ocorrência + explicação entre parênteses. Mensagens ISO com 4 dígitos.

**Colunas técnicas (Autorizador / Clearing / Outros)** — formato aprovado, sem emoji, blocos nesta ordem
(rótulos em **negrito**, linha em branco entre blocos):

```
Mensagens: 0110 / 0410 / 0430 (Visa ▶ Credenciador)

Campos:
RECEBER — 0110, 0210, 0410, 0430 (Visa ▶ Credenciador):
• Field 111 – Additional Transaction Specific Data, Dataset ID 56, Tag 8B – Embedded Payment Account Indicator | AN 1, EBCDIC | Y | Visa preenche
ENVIAR — 0100, 0200 (Credenciador ▶ Visa):
• NÃO ENVIAR a Tag 8B (a Visa descarta)

O que desenvolver:
1. (Condicional) <tarefa — o que fazer com o dado: parser, gravar, regra, clearing>

Tratamento de exceções:
• <cenário>: <comportamento>

Testes:
• <onde/como testar, da seção de testes do artigo>
```

- Bullet de campo: `Field/DE – nome oficial | formato e tamanho (só se no PDF) | valores | quem preenche`.
- Verbos: ENVIAR · NÃO ENVIAR quando … · RECEBER · RECEBER e REPASSAR · POPULAR com … · IGNORAR sem rejeição.
- Sem impacto: exatamente `Sem Impacto.` (nada mais na célula).
- Na aba Emissor, a direção é `(Visa ▶ Emissor)` / `(Emissor ▶ Visa)`.

**Impacto Financeiro:** só `BAIXO`, `MÉDIO` ou `ALTO` na célula (a justificativa vai na seção `IMPACTO FINANCEIRO`
da Descrição). Critério **proposto, a validar com o usuário**: ALTO = nova tarifa/encargo sobre o papel, perda de
receita ou risco de parada de processamento; MÉDIO = desenvolvimento necessário sem efeito financeiro direto;
BAIXO = só conhecimento/sem desenvolvimento para o papel.

**Assunto / Tags:** 4–8 termos em minúsculas separados por ` / ` (produto, campo, sistema, tema regulatório).

**Datas:** Vigência como na fonte, com sistema (`1000 GMT 23/04/2027 (V.I.P.)`, `CPD 24/04/2027 (BASE II)`,
`Imediato`); itens fora da release levam a data própria. Publicação (aba Emissor) = data da carta/boletim (dd/mm/aaaa).

---

## 4. Gerar o arquivo

1. Montar o JSON do item (ver `scripts/exemplo_item.json`) — um bloco `comum` e um por papel.
2. `python scripts/gerar_planilha_release.py --modelo "<planilha da release>.xlsx" --itens itens.json --saida "<nova>.xlsx"`
   — copia cabeçalho e estilos do modelo, apaga as linhas de dados da cópia, grava os itens com negrito real
   nos títulos e rótulos. **Nunca sobrescreve o modelo.**
3. Validar no Excel instalado: `python scripts/gerar_planilha_release.py --validar "<nova>.xlsx"` (abre via COM
   somente leitura e exporta PDF da aba). Ler com openpyxl não prova que o Excel abre.

## 5. Checklist antes de entregar

- [ ] Descrição abre com "A <Bandeira> está…" e não tem campo técnico?
- [ ] Seções em negrito, com linha em branco antes/depois; sem emoji nem separador decorativo?
- [ ] Colunas técnicas: Mensagens / Campos (ENVIAR/RECEBER com direção) / O que desenvolver (numerado, com obrigatoriedade) / exceções / testes?
- [ ] Cada campo com nome oficial e, se citado, posição conferida no `consultar_campo` (página)?
- [ ] Tarifa citada passou pelo `consultar_tarifa` e a condição se aplica ao papel/Brasil?
- [ ] Obrigatoriedade e impactos diferentes por aba quando o papel muda?
- [ ] Colunas do cliente em branco? Nenhum nome de cliente no conteúdo?
- [ ] Arquivo abriu no Excel (validação COM) sem reparo?
