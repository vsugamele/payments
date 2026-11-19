# Como publicar uma notícia comentada em 1 minuto

Para adicionar uma nova notícia ou nota de radar na página principal (`/`), em `/noticias`, no feed `/feed.xml` e no `/sitemap.xml`, basta acrescentar um objeto no arquivo:

`frontend/data/noticias-extras.json`

## Modelo pronto para copiar

```json
[
  {
    "slug": "titulo-curto-sem-acento",
    "category": "Bandeiras",
    "dateISO": "2026-11-25",
    "dateShort": "25 nov",
    "dateFull": "25 de novembro de 2026",
    "year": "2026",
    "readTime": "5 min",
    "title": "Título direto dizendo o que mudou",
    "summary": "Resumo de 2 a 3 linhas explicando o impacto prático para quem opera.",
    "sourceNote": "Resolução BCB nº XXX/2026 ou Boletim Visa/Mastercard/Elo",
    "effectiveWindow": "Vigência a partir de DD/MM/AAAA",
    "keyTakeaways": [
      "Primeiro ponto prático em 1 frase.",
      "Segundo ponto prático em 1 frase."
    ],
    "sections": [
      {
        "heading": "O que mudou na regra",
        "paragraphs": [
          "Primeiro parágrafo começando pela cena concreta do dia a dia.",
          "Segundo parágrafo com o detalhe técnico ou financeiro."
        ]
      },
      {
        "heading": "Na prática, o que acompanhar",
        "paragraphs": [
          "O que adquirentes, emissores ou facilitadores precisam checar antes da vigência."
        ],
        "callout": {
          "label": "Ponto de atenção",
          "text": "Resumo curto do principal risco operacional."
        }
      }
    ],
    "relatedLabHref": "/jornada",
    "relatedLabLabel": "Ver o fluxo no Laboratório"
  }
]
```

## Categorias aceitas
- `"Regulação"`
- `"Bandeiras"`
- `"Pix & BCB"`
- `"Intercâmbio"`
- `"Autorização & Risco"`

Depois de salvar, faça `git commit` e `git push origin main` — o site publica a nota automaticamente na Home, em `/noticias/<slug>`, no `/feed.xml` e no `/sitemap.xml`.
