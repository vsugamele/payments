---
name: analise-boletim-bandeira
description: "Analisar boletim, EF ou item de release de Visa, Mastercard e Elo em comportamentos rastreaveis: campos, papeis, obrigatoriedade, impactos, datas, autorizacao e clearing. Usar para analisar boletins, preencher planilhas de controle de release (abas Adquirente e Emissor) e escrever ou revisar especificacoes funcionais, Change Impact Analysis e guias de implementacao. Compor com bandeiras-intercambio e o motor de comportamento. Para conceitos gerais, usar bandeiras-intercambio; para campo ja catalogado, consultar a CLI do motor."
---

# Análise de Boletim de Bandeira → Comportamento

Procedimento repetível para transformar um boletim/EF de bandeira em dado
estruturado e rastreável. Carrega junto o conhecimento de `bandeiras-intercambio`
(atores, subdomínios, notação ▶Envia/◀Recebe, terminologia Mandate/Obrigatório).

**Princípio No Invention:** só afirme o que está na fonte. Tudo que for inferência
(formato de campo, response code, posição) entra na lista `⚠️ verificar`.

**Padrões fixos (sempre):**
- **Genérico, sem cliente nomeado** — descreva o impacto por perfil (papel/produto/
  bandeira/região); a projeção usa perfil ad-hoc, nunca uma entidade nomeada.
- **Sempre detalhar** — negócio, impactos, datas, **o que muda × como era antes**;
  explique inline os termos (0100/0110/0200/0400, clearing, opcional/condicional via
  glossário) e sinalize **cross-bandeira** (item da bandeira X que atende a bandeira Y).

---

## Passo a passo

**1. Identificar**
- Bandeira; ID no formato `REGIÃO NNNNN.versão` (ex.: `GLB 13429.1`); título original;
  vigência (lembrar: a vigência é por item, não só do release); é release
  (Jan/Abr/Jul/Out p/ MC, trimestral; Visa semestral) ou contínuo ("Não é Release"); fonte.

**2. Classificar** (taxonomia do tracker + gabarito do Consolidado MÃE)
- **Classificação em 2 camadas:** (a) *action indicator* oficial da bandeira
  (ex.: "Mandated: Issuer") e (b) classificação operacional ➤ (Informativo | Opcional
  | Mandate | Condicional). Podem divergir — numa análise GENÉRICA prefira "Condicional"
  (mandatório SE...) a copiar a leitura de um único participante.
- **Impacta Brasil?** (Sim | Não | condicional) — campo central da consultoria BR.
- **Subdomínio(s)/Sistemas:** autorizacao, clearing, liquidacao, intercambio, pricing,
  backoffice, chargeback, fraude, produtos, seguranca, operacoes, compliance, governanca.
- **Criticidade:** Baixo | Médio | Alto. **Impacto Financeiro:** Perda | Ganho | Neutro | N/A.
- **Regulatório:** Sim | Não. **Região:** Global | Brasil | LAC | ...
- Responda sempre **"O que a bandeira está fazendo?"** e registre o **histórico de
  versões do parecer** (V2/V3) quando a bandeira republicar. (Ver [[referencia-template-consolidado-mae]].)

**3. Extrair campos** (a ponte para o motor)
- Liste todo `DE`, `PDS`, `SE`/`SF` e tabela `MPE` (IPnnnnTn) que o boletim toca.
  É por esses campos que o motor é indexado.

**4. Mapear por papel** (Adquirente e Emissor; Bandeira se relevante)
- Para cada papel: **obrigatoriedade POR PAPEL** (pode diferir — ex.: Adquirente
  Mandatório, Emissor Opcional), **▶ Envia**, **◀ Recebe**, **🔧 Desenvolver**
  (sempre nos dois níveis: funcional + campo técnico).

**5. Fluxo ida-e-volta**
- **Auth IDA** → **o que retorna** (response, DE 39); **Clearing** → **o que volta**
  (apresentação/retorno/chargeback/relatório). Validações/rejeições (hard reject,
  under-provisioning). **Cálculo/IRD** se aplicável.

**6. Alimentar o motor de comportamento** (quando no projeto Tabelasintercambio)
- Sempre criar o **registro do boletim**: `comportamento/boletins/<id>.json` com as
  **3 lentes** (`tecnica` → campos; `normativa` → regra/compliance; `negocio` →
  exposição financeira, risco competitivo, esforço/prazo) e os `gatilhos`
  (papeis, produtos, bandeiras, regioes) + `acoes` por papel.
- Se houver campo técnico, criar/atualizar `comportamento/campos/<bandeira>_<campo>.json`
  e somar o boletim ao array `boletins`.
- Validar: `python comportamento_cli.py boletim "<id>"` e `--list`.

**6b. Projetar por perfil** (genérico, sem cliente)
- `python comportamento_cli.py boletim "<id>" --papel emissor --produtos moneysend,transfer`
  (também `--bandeira`, `--regiao`).
- A projeção responde: impacta? por quê (qual atributo do perfil casou)? criticidade
  ajustada • ações • prazo. Nunca cita cliente — é aplicável a qualquer um com o perfil.
- Glossário: `python comportamento_cli.py glossario 0100` (ou `clearing`, `condicional`...).

**7. Output — ficha + projeções**
- Entregue a ficha do boletim (3 lentes) e, quando pedido, as projeções por cliente.
  Honre No Invention: campo/regra/cliente sem fonte confirmada vai em `⚠️ verificar`.

**8. Modo planilha de release** (quando o pedido for preencher/gerar linhas da "Planilha de
Controle de Itens – Bandeiras", abas Adquirente e Emissor)
- Seguir [reference/planilha-release.md](reference/planilha-release.md): colunas por aba, regras por
  coluna, formato técnico aprovado (sem emoji: Mensagens / Campos ENVIAR–RECEBER / O que desenvolver /
  Tratamento de exceções / Testes; `Sem Impacto.` exato) e checklist.
- Evidência: `consultar_acervo` (artigo inteiro, com página), `consultar_campo` (posição e nome oficial),
  `consultar_tarifa` (valor, quem paga, condição e "não se aplica" — justifica o Impacto Financeiro).
- Gerar com `scripts/gerar_planilha_release.py` (modelo = planilha da release; nunca sobrescreve) e
  validar no Excel com `--validar`. Exemplo de entrada: `scripts/exemplo_item.json` (Article 3.5, Abr/2027).
- Testar 1 item e mostrar ao usuário antes do lote.

**9. Modo especificação funcional** (quando o pedido for escrever, revisar ou detalhar uma EF / Change Impact
Analysis / guia de implementação / fluxo visual a partir de boletins)
- Seguir [reference/especificacao-funcional.md](reference/especificacao-funcional.md): estrutura de 16 seções
  (ficha + 1–15), fonte `[documento, página]` por afirmação, **quem preenche** e direção em toda linha de campo,
  **Impacta Brasil** na ficha e por item, De-Para autorização → clearing, rastreabilidade RF → CA → BDD e
  checklist de qualidade antes de entregar.
- Escrever 1 seção (normalmente a 8 — campos) e mostrar antes da EF inteira.
- Sempre com a **postura investigativa** (cruzar fontes, antes × agora, suspeitar, seguir o dado até o fim).
- Pedido de tema inteiro ("como desenvolver 3DS", tokenização, DCC): **guia completo** — todas as bandeiras,
  todos os ramos do fluxo, mapa de áreas (negócio/produto, cadastro, terminais e parque, gateway, fraude,
  autorização, outgoing, liquidação, disputas, compliance, operação, certificação), legível para negócio e produto.

---

## Schema do catálogo (motor)

```json
{
  "id": "<BANDEIRA>-<CAMPO>-<SUBCAMPO>",
  "bandeira": "Mastercard | Visa | Elo",
  "campo": "DE 063", "subcampo": "SF1",
  "nome": "...", "fase": "autorizacao",
  "subdominios": ["autorizacao", "produtos"],
  "mensagens": ["Authorization Request (0100)"],
  "descricao_funcional": "...",
  "formato": "... (⚠️ verificar no manual)",
  "papeis": {
    "adquirente": {"acao": "envia|recebe|ambos", "obrigatoriedade": "...",
      "funcional": "...", "campo_tecnico": "...", "desenvolver": ["..."]},
    "emissor": {"acao": "recebe", "obrigatoriedade": "...",
      "funcional": "...", "campo_tecnico": "...", "desenvolver": ["..."]}
  },
  "ida_volta": {"ida": "...", "o_que_retorna": "...", "o_que_volta_clearing": "..."},
  "tabelas_relacionadas": ["IP0016T1"],
  "boletins": ["GLB 13429.1 — ..."],
  "fonte": "...",
  "verificar": ["..."]
}
```

Ver também: skill `bandeiras-intercambio` e o template em
`bandeiras-intercambio/reference/memory-template.md`.
