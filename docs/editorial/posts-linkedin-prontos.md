# 3 Posts Prontos para o LinkedIn (Voz Direta · Sem Clichê)

Estes textos já estão calibrados para publicação direta no LinkedIn, apontando para as páginas abertas do site. Ajuste apenas o domínio final no link caso use outra URL.

---

## Post 1 — Downgrade silencioso no clearing
**Link de apoio:** `/noticias/aprovou-00-margem-sumiu-no-clearing`

> A transação aprovou com código 00. O cliente saiu com a compra, o lojista recebeu no prazo e o dashboard de aprovação fechou no verde.
>
> Três semanas depois, o Financeiro abre o fechamento mensal e a conta não fecha: a margem veio 40 a 80 bps abaixo do esperado.
>
> Em quase toda operação de adquirência ou subadquirência que acompanho, o motivo tem nome curto: downgrade de intercâmbio no clearing.
>
> O problema é que o downgrade não derruba a venda na maquininha nem no checkout. Ele acontece horas depois, no lote noturno enviado para a bandeira (Base II na Visa, IPM na Mastercard, Serviço 10 na Elo).
>
> Os três vazamentos mais comuns que vejo em campo:
> 1. O gateway capturou o ECI e o CAVV do 3DS na autorização, mas o motor de Outgoing esqueceu de levar esses campos para o arquivo de clearing.
> 2. A captura saiu fora da janela de qualificação da bandeira.
> 3. O lojista foi cadastrado com MCC genérico (tipo 5999) em vez do setor real.
>
> Em um portfólio de R$ 50 milhões por mês, deixar 8% das vendas caírem 0,40% de tarifa custa R$ 16 mil todos os meses — R$ 192 mil por ano saindo sem nenhum erro aparecer na tela.
>
> Escrevi uma nota curta explicando o teste mais barato (com uma amostra de 50 transações) para achar esse vazamento antes do próximo fechamento:
> https://vinicius-sugamele.com/noticias/aprovou-00-margem-sumiu-no-clearing

---

## Post 2 — Split Payment da Reforma Tributária e antecipação de recebíveis
**Link de apoio:** `/noticias/split-payment-reforma-tributaria-2027`

> Muita gente ainda trata o Split Payment da Reforma Tributária como um tema só da área fiscal.
>
> Na prática, quem vai sentir o peso primeiro na engenharia são os times de captura, liquidação e agenda de recebíveis das adquirentes, subcredenciadoras e PSPs do Pix.
>
> Pelos artigos 31 a 35 da Lei Complementar 214/2025, a parcela de CBS (a partir de 2027) e de IBS passa a ser segregada na própria liquidação financeira, conversando com a chave da NF-e ou NFC-e.
>
> Mas tem um efeito no artigo 34 que merece conta na ponta do lápis agora: a parte destinada ao Fisco não pode ser usada como garantia nem antecipada como recebível livre na B3, na CERC ou na TAG.
>
> Um lojista que hoje antecipa ~97% do valor bruto de uma venda parcelada vai ter uma base menor disponível para liquidez imediata, porque parte daquela agenda já nasce comprometida com o imposto.
>
> Organizei os pontos principais da LC 214/2025 e deixei um simulador aberto para visualizar a diferença na liquidação:
> https://vinicius-sugamele.com/noticias/split-payment-reforma-tributaria-2027

---

## Post 3 — Guia Geral de Pagamentos (9 capítulos abertos)
**Link de apoio:** `/guia`

> Quando alguém entra para trabalhar em produto, tecnologia ou operações de pagamentos, o primeiro susto quase sempre é o mesmo: os manuais têm centenas de páginas e cada área enxerga só um pedaço do caminho.
>
> O comercial vê o MDR. A engenharia vê o log ISO 8583. O financeiro vê a fatura MCBS ou VSS no fim do mês. O atendimento vê o chargeback.
>
> Organizei um guia aberto, em 9 capítulos curtos e diretos ao ponto, cobrindo o caminho inteiro no Brasil:
> - Cartão (4 partes, subadquirente, On-Us e 3 partes)
> - Clearing, Outgoing e liquidação (SLC / B3 / Res. BCB 264)
> - Intercâmbio, tetos do BCB (0,50% débito / 0,70% pré-pago) e tarifas de bandeira
> - Contestação, Liability Shift e Compelling Evidence 3.0
> - Pix, Pix Automático, aproximação NFC (JSR) e MED 2.0
> - Boleto registrado (NPC, SILOC e STR acima de R$ 250 mil)
> - Open Finance e abertura de conta (KYC, PLD e BC Protege+)
> - Reforma Tributária 2027 e Split Payment
>
> Cada capítulo tem link próprio para compartilhar com o time, cita as normas oficiais e abre direto no simulador passo a passo:
> https://vinicius-sugamele.com/guia
