# Template de memória — regra de bandeira/intercâmbio

Copie um dos blocos abaixo ao salvar uma memória deste domínio. Mantenha os
campos sempre na mesma ordem para que as regras fiquem comparáveis entre
bandeiras. Salve em `memory/` do projeto e adicione a linha-índice em `MEMORY.md`.

---

## A) Regra de campo / tarifa

```markdown
---
name: <bandeira>-<campo>-<exceção-curta>
description: <uma linha — qual campo, qual bandeira, qual efeito>
metadata:
  type: reference
  domain: bandeiras
  subdominio: <autorizacao | clearing | liquidacao | intercambio | pricing | backoffice | chargeback | fraude | produtos | seguranca | operacoes | compliance | governanca>
  bandeira: <Visa | Mastercard | Elo | Amex | Hipercard | todas>
  papel_origem: <adquirente | subadquirente | emissor | bandeira | estabelecimento>
  papel_destino: <emissor | bandeira | adquirente | ...>
---

**Campo:** <nome> — posição/coluna <X> do arquivo/planilha <Y>
**Quem envia:** <ator> (preenche em <momento>)
**Quem recebe:** <ator(es)> (usa para <finalidade>)
**Aplica-se a:** bandeira <...> | adquirente <...> | emissor <...>
**Regra:** <comportamento normal>
**Exceções:** <MCC / produto / faixa de valor / região — ou "nenhuma">
**Obrigatório/Mandate:** <sim/não — a partir de release/data X> [[feedback-terminologia-bandeira]]
**Fonte:** <manual/spec + versão + seção> | ⚠️ verificar
**Detalhes adicionais:** <observações>
```

## B) Fato de fluxo / arquitetura de dados

```markdown
---
name: <fluxo>-<descrição-curta>
description: <uma linha — qual fluxo de dados entre quais atores>
metadata:
  type: reference
  domain: bandeiras
  subdominio: <autorizacao | clearing | liquidacao | intercambio | pricing | backoffice | chargeback | fraude | produtos | seguranca | operacoes | compliance | governanca>
---

**Fluxo:** <Ator A> → <Ator B> → <Ator C>
**Gatilho:** <quando esse fluxo acontece>
**Dado trafegado:** <o que vai no payload/arquivo>
**Arquivo/layout:** <MPE | T068 | planilha | API — versão>
**Sentido financeiro:** <quem paga quem, se aplicável>
**Exceções/condições:** <...>
**Fonte:** <...> | ⚠️ verificar
```

---

## Checklist antes de salvar

- [ ] Respondeu **quem envia** e **quem recebe**?
- [ ] Identificou **bandeira / adquirente / emissor** afetados?
- [ ] Registrou **exceções** (mesmo que "nenhuma")?
- [ ] Marcou **Obrigatório/Mandate** com release/data?
- [ ] Citou a **fonte** (ou marcou `⚠️ verificar`)?
- [ ] Usou **Mandate/Obrigatório**, nunca "Mandato"?
- [ ] Adicionou a linha-índice em `MEMORY.md`?
