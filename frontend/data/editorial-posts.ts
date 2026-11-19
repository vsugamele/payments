import extraNewsRaw from "@/data/noticias-extras.json";

export type EditorialCategory =
  | "Regulação"
  | "Bandeiras"
  | "Pix & BCB"
  | "Intercâmbio"
  | "Autorização & Risco";

export interface EditorialNewsArticle {
  slug: string;
  href: string;
  kind: "noticia" | "artigo";
  series?: string;
  category: EditorialCategory;
  dateISO: string;
  dateShort: string;
  dateFull: string;
  year: string;
  readTime: string;
  title: string;
  summary: string;
  featured?: boolean;
  visualType?: "split2027" | "visabrl" | "mastercardreg";
  sourceNote?: string;
  effectiveWindow?: string;
  keyTakeaways?: string[];
  sections?: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    callout?: {
      label: string;
      text: string;
    };
  }[];
  relatedLabHref?: string;
  relatedLabLabel?: string;
}

const CORE_EDITORIAL_POSTS: EditorialNewsArticle[] = [
  {
    slug: "split-payment-reforma-tributaria-2027",
    href: "/noticias/split-payment-reforma-tributaria-2027",
    kind: "noticia",
    category: "Regulação",
    dateISO: "2026-11-18",
    dateShort: "18 nov",
    dateFull: "18 de novembro de 2026",
    year: "2026",
    readTime: "7 min",
    featured: true,
    visualType: "split2027",
    title: "Split Payment da Reforma Tributária: o que muda na agenda de recebíveis e no clearing",
    summary:
      "A Lei Complementar 214/2025 coloca adquirentes, subcredenciadoras e PSPs no meio da arrecadação da CBS e do IBS. O impacto vai além do imposto retido na liquidação: altera a base livre para antecipação na B3 e na CERC.",
    sourceNote: "Lei Complementar nº 214/2025 (Arts. 31 a 35) · Reforma Tributária do Consumo",
    effectiveWindow: "Transição regulatória em 2026 · entrada operacional da CBS a partir de 2027",
    keyTakeaways: [
      "O pagamento deixa de ser liquidado pelo valor cheio antes do imposto: a parcela de CBS e IBS sai separada na liquidação financeira.",
      "Para segregar o valor correto, a transação precisa conversar com o documento fiscal eletrônico (NF-e ou NFC-e).",
      "Na agenda de recebíveis (Resolução BCB 264), o teto disponível para cessão e antecipação passa a ser o valor já descontado do tributo (Art. 34).",
    ],
    sections: [
      {
        heading: "O dinheiro que hoje passa inteiro pela liquidação",
        paragraphs: [
          "Quando uma venda de R$ 1.000,00 é capturada no cartão hoje, o caminho financeiro é relativamente previsível. A adquirente desconta o MDR, registra a agenda do lojista como Unidade de Recebível na B3, na CERC ou na TAG, e o dinheiro segue para o domicílio bancário ou para quem comprou aquele recebível em antecipação. O imposto sobre a venda é apurado e pago depois, em outra trilha, direto entre o lojista e o Fisco.",
          "É justamente essa separação entre o pagamento e o tributo que a Lei Complementar nº 214/2025 começa a redesenhar. Nos artigos 31 a 35, a lei cria o Split Payment: o recolhimento automático da CBS (federal) e do IBS (estadual e municipal) no momento da liquidação financeira.",
        ],
      },
      {
        heading: "Onde aperta a engenharia de pagamentos",
        paragraphs: [
          "Muita gente ainda lê o Split Payment como um assunto da área fiscal. Na prática, o peso operacional cai direto sobre os times de captura, clearing, liquidação e conciliação das adquirentes, subcredenciadoras e instituições do Pix.",
          "Para saber quanto segregar em cada venda, o meio de pagamento precisa amarrar a transação à chave da NF-e ou da NFC-e — ou consultar o valor do imposto junto aos sistemas da Receita Federal e do Comitê Gestor do IBS antes de fechar o repasse.",
        ],
        bullets: [
          "Na captura: terminais, gateways e ERPs passam a trafegar a referência fiscal vinculada à transação.",
          "Na liquidação: a grade precisa dividir o fluxo entre a conta do Fisco e a conta do estabelecimento, sem quebrar a conciliação diária.",
          "Nas devoluções e chargebacks: se a compra é cancelada ou contestada depois da liquidação, entra o fluxo de devolução do imposto já segregado.",
        ],
      },
      {
        heading: "O efeito direto na antecipação de recebíveis",
        paragraphs: [
          "Para quem opera crédito sobre agenda de cartão, este é o ponto que merece conta na ponta do lápis antes de 2027. O artigo 34 da LC 214/2025 deixa claro que a parcela destinada ao pagamento dos tributos não pode ser usada como base de garantia ou antecipação pelo lojista.",
          "Na prática, a Unidade de Recebível que vai a registro na registradora precisa refletir o valor livre do tributo. Um lojista que hoje antecipa 97% do valor bruto de uma venda parcelada vai ter uma base menor disponível para liquidez imediata, porque parte daquele fluxo já nasce comprometida com o Fisco.",
        ],
        callout: {
          label: "Na prática, o que acompanhar agora",
          text: "Antes da entrada operacional da CBS em 2027, vale mapear dois pontos internos: como o seu gateway vincula o identificador da transação ao documento fiscal do estabelecimento e como o motor de agenda de recebíveis separa a parcela livre de ônus na comunicação com B3, CERC e TAG.",
        },
      },
    ],
    relatedLabHref: "/jornada?track=regras_2027_tempo&split2027=1",
    relatedLabLabel: "Simular o Split Tributário 2027 no Laboratório",
  },
  {
    slug: "aprovou-00-margem-sumiu-no-clearing",
    href: "/noticias/aprovou-00-margem-sumiu-no-clearing",
    kind: "noticia",
    series: "Na prática, por que quebrou?",
    category: "Intercâmbio",
    dateISO: "2026-11-17",
    dateShort: "17 nov",
    dateFull: "17 de novembro de 2026",
    year: "2026",
    readTime: "5 min",
    title: "A venda aprovou com 00, mas a margem sumiu no clearing",
    summary:
      "O caso clássico de quem olha só para a taxa de aprovação: a compra passa sem erro na autorização, o cliente leva o produto, mas no fechamento da semana a tarifa de intercâmbio veio 80 bps mais cara.",
    sourceNote: "Visa Base II Clearing Specifications · Mastercard GCMS / IPM · Elo Serviço 10",
    effectiveWindow: "Nota prática de operação · autorização × clearing",
    keyTakeaways: [
      "Autorização aprovada com código 00 nunca garante qualificação tarifária no clearing noturno.",
      "Os três vazamentos mais frequentes são: perder o ECI/CAVV entre o gateway e o Outgoing, capturar fora da janela da bandeira ou mandar o identificador da transação (Transaction ID / Banknet Reference) desalinhado.",
      "A conciliação de intercâmbio precisa cruzar o IRD/PID esperado contra o cobrado todo mês — sem isso o downgrade corre meses sem ninguém notar.",
    ],
    sections: [
      {
        heading: "O sintoma que só aparece no fechamento do mês",
        paragraphs: [
          "Em quase toda operação de adquirência ou subadquirência que acompanho, o alarme toca quando alguém do Financeiro compara a margem projetada com o extrato real de liquidação. O volume bate, a taxa de aprovação subiu, o lojista recebeu no prazo — e mesmo assim sobrou menos dinheiro na conta.",
          "Quando você abre o arquivo de retorno da bandeira (o VSS-130 na Visa ou os relatórios de qualificação no GCMS da Mastercard), o motivo costuma ter nome curto: downgrade de intercâmbio.",
        ],
      },
      {
        heading: "Onde o campo se perde no meio do caminho",
        paragraphs: [
          "Na hora da venda online, o cliente passou pelo 3DS 2.2 sem atrito, o emissor devolveu um criptograma válido e a transação foi aprovada com RC 00. Até aí, tudo certo. O problema acontece horas depois, quando o motor de Outgoing monta o lote noturno para enviar à bandeira.",
          "Se o sistema de captura grava os dados da autorização em uma tabela e o lote de clearing lê de outra sem replicar o ECI, o CAVV/UCAF ou o Transaction Identifier da autorização original, a bandeira olha para aquele registro e trata a compra como se nunca tivesse sido autenticada — ou pior, como se não batesse com a autorização.",
        ],
        bullets: [
          "Perda de ECI / CAVV no Outgoing (TCR 5 na Visa ou DE 48 / PDS na Mastercard): derruba a venda para a faixa não autenticada.",
          "Captura atrasada: autorizou na segunda e só apresentou no clearing na semana seguinte, estourando a janela de qualificação.",
          "MCC genérico no credenciamento (como 5999) em vez do setor real do lojista: faz a operação perder faixas reduzidas em supermercados, combustíveis ou serviços.",
        ],
      },
      {
        heading: "O teste mais barato para achar o vazamento",
        paragraphs: [
          "Antes de abrir um projeto grande de refatoração, o caminho mais rápido é pegar uma amostra de 50 transações que caíram em tarifa padrão ou punitiva (EIRF / Standard) no último fechamento e colocar lado a lado o log da 0100/0110 e a linha correspondente do arquivo de clearing enviado.",
          "Em mais da metade das vezes que fiz esse exercício com times de engenharia, a diferença estava em dois ou três campos que existiam na autorização e simplesmente não estavam sendo mapeados no lote noturno.",
        ],
        callout: {
          label: "Na prática",
          text: "Em um volume de R$ 50 milhões por mês, deixar 8% das vendas sofrerem um downgrade de 0,40% custa R$ 16 mil todos os meses — R$ 192 mil por ano saindo em silêncio sem nenhum erro aparecer na tela do cliente.",
        },
      },
    ],
    relatedLabHref: "/guia#intercambio",
    relatedLabLabel: "Ler o capítulo de Intercâmbio no Guia de Pagamentos",
  },
  {
    slug: "med-2-rastreio-multinivel",
    href: "/noticias/med-2-rastreio-multinivel",
    kind: "noticia",
    category: "Pix & BCB",
    dateISO: "2026-11-16",
    dateShort: "16 nov",
    dateFull: "16 de novembro de 2026",
    year: "2026",
    readTime: "5 min",
    title: "MED 2.0: por que travar apenas a primeira conta deixou de resolver golpes no Pix",
    summary:
      "Com a Resolução BCB 493/2025 em vigor desde fevereiro de 2026, o rastreamento do Mecanismo Especial de Devolução avança sobre camadas seguintes de contas laranja e impõe autoatendimento padronizado nos apps.",
    sourceNote: "Resolução BCB nº 493/2025 (MED 2.0) · Resoluções BCB nº 103/2021 e 147/2021",
    effectiveWindow: "Em vigor desde 02/02/2026 com implantação escalonada 2026–2027",
    keyTakeaways: [
      "No MED original, o bloqueio alcançava apenas a 1ª conta recebedora — que fraudadores costumavam esvaziar em segundos.",
      "O MED 2.0 cria o rastreio em grafo multinível para alcançar saldos pulverizados em contas de nível 2 e 3.",
      "Todos os PSPs precisam oferecer botão padronizado de contestação direto no app, sem obrigar o pagador a abrir protocolo por telefone.",
    ],
    sections: [
      {
        heading: "A corrida de segundos depois de um golpe",
        paragraphs: [
          "Quem acompanha prevenção a fraudes no Pix sabe qual era o gargalo do MED original. Quando a vítima percebia que tinha caído em um golpe e acionava o banco, o dinheiro já não estava mais na conta que recebeu o Pix. Em menos de um minuto, o saldo tinha sido quebrado em três ou quatro transferências para outras contas laranja em instituições diferentes.",
          "Como o mecanismo anterior só bloqueava a conta de destino imediata, a taxa de recuperação ficava baixa mesmo quando a fraude era confirmada rapidamente.",
        ],
      },
      {
        heading: "O que muda com o grafo multinível",
        paragraphs: [
          "A Resolução BCB nº 493/2025 ataca exatamente esse ponto. Com o MED 2.0, a notificação de infração e o pedido de bloqueio percorrem o rastro das transferências seguintes, permitindo bloquear valores que já pularam para contas de segundo e terceiro níveis no SPI.",
          "Ao mesmo tempo, a contestação deixa de depender de fila de atendimento humano para começar: o botão de autoatendimento no extrato do app aciona o fluxo padronizado no DICT e dispara o bloqueio cautelar enquanto as instituições analisam as evidências.",
        ],
      },
    ],
    relatedLabHref: "/jornada?track=med_seguranca",
    relatedLabLabel: "Acompanhar o fluxo do MED 2.0 passo a passo",
  },
  {
    slug: "taxa-aprovacao-caiu-depois-do-release",
    href: "/noticias/taxa-aprovacao-caiu-depois-do-release",
    kind: "noticia",
    series: "Na prática, por que quebrou?",
    category: "Autorização & Risco",
    dateISO: "2026-11-14",
    dateShort: "14 nov",
    dateFull: "14 de novembro de 2026",
    year: "2026",
    readTime: "6 min",
    title: "Por que a taxa de aprovação cai de uma semana para outra depois de um release?",
    summary:
      "Ninguém mudou o motor antifraude e o emissor diz que está tudo normal, mas a conversão caiu 1,8 ponto percentual. Quase sempre a resposta está em um detalhe de mensageria ISO 8583 ou tokenização.",
    sourceNote: "ISO 8583 · Visa / Mastercard / Elo Semi-Annual Releases · 3DS 2.2",
    effectiveWindow: "Nota prática de operação · troubleshooting de autorização",
    keyTakeaways: [
      "Queda súbita de aprovação por BIN ou por bandeira quase nunca é comportamento do cliente — é sinal de mudança de regra, campo truncado ou chave criptográfica desatualizada.",
      "Quebrar as recusas por código de retorno (DE 39), canal (DE 22) e bandeira isola a causa em horas em vez de semanas.",
      "Em e-commerce recorrente, enviar cobrança com cartão salvo como se fosse digitação manual (DE 22 = 01 em vez de 10/81) derruba a aprovação na hora.",
    ],
    sections: [
      {
        heading: "A reunião da segunda-feira de manhã",
        paragraphs: [
          "A cena se repete em quase toda adquirente ou grande operação digital: na sexta-feira a aprovação estava em 91%, na segunda amanheceu em 89,2%. O time comercial liga perguntando se o antifraude apertou a régua, o time de risco jura que não tocou em nada, e o dashboard agregado só mostra mais códigos 05 (Não Autorizada).",
          "Olhar para a taxa média geral esconde o problema. Quando você abre o recorte por bandeira, por emissor e por modo de entrada (DE 22), quase sempre aparece um desenho muito mais específico: a queda está concentrada em uma única bandeira, em transações tokenizadas ou em compras autenticadas com 3DS.",
        ],
      },
      {
        heading: "Os quatro culpados que mais vejo em campo",
        paragraphs: [
          "Nos últimos anos trabalhando entre bandeira, adquirente e emissores, quatro causas explicam a maioria dessas quedas silenciosas logo após viradas de release ou atualizações de gateway:",
        ],
        bullets: [
          "DE 22 (POS Entry Mode) preenchido errado em recorrência ou token: o sistema manda a venda como digitação manual em vez de credencial salva ou token e-commerce, disparando recusa preventiva no emissor.",
          "Indicadores CIT/MIT fora do padrão: cobrança recorrente enviada sem o identificador da transação inicial aprovada pelo portador.",
          "Atualização criptográfica em 3DS ou chip (como a migração para CAVV v9 AES ou chaves CAPK vencidas no terminal): a mensagem sai montada, mas falha na validação do HSM ou do ACS.",
          "Retentativas em cima de Hard Decline: insistir em cartão cancelado ou bloqueado piora o score do estabelecimento nos filtros dos emissores e gera encargo de retentativa excessiva.",
        ],
      },
      {
        heading: "Como encurtar o diagnóstico",
        paragraphs: [
          "Em vez de perguntar genericamente ao emissor por que ele está negando mais, leve três exemplos reais com NSU, data/hora, BIN mascarado, DE 22, DE 39 e os subcampos de autenticação enviados. Com três payloads completos na mesa, o time do emissor e o suporte técnico da bandeira conseguem apontar a linha exata da recusa no mesmo dia.",
        ],
      },
    ],
    relatedLabHref: "/jornada?track=cartao",
    relatedLabLabel: "Injetar falhas de autorização no Laboratório",
  },
  {
    slug: "visa-tarifas-brl-cavv-v9",
    href: "/noticias/visa-tarifas-brl-cavv-v9",
    kind: "noticia",
    category: "Bandeiras",
    dateISO: "2026-11-12",
    dateShort: "12 nov",
    dateFull: "12 de novembro de 2026",
    year: "2026",
    readTime: "5 min",
    featured: true,
    visualType: "visabrl",
    title: "Visa no Brasil em Real (BRL) e 3DS 2.2 em CAVV v9 AES: o que muda na fatura e no HSM",
    summary:
      "A migração das billing lines domésticas de USD para BRL tirou o ruído da PTAX do fechamento mensal no VSS, enquanto o CAVV v9 em AES exigiu revisão real nos HSMs de emissores e na conferência do Outgoing.",
    sourceNote: "Visa Fee Schedule Brazil (vigência 01/05/2026) · Visa Business News · Especificações 3DS 2.2",
    effectiveWindow: "Em vigor desde 01/05/2026 (Release 26.1)",
    keyTakeaways: [
      "Linhas domésticas de cobrança da Visa no Brasil passaram de dólar para real em 01/05/2026 — por exemplo, registros que eram cobrados em USD passaram a valores fixos em R$.",
      "A auditoria de fatura VSS-110 e VSS-120 precisa separar a vigência exata: antes de 30/04/2026 vale a tabela em USD; a partir de 01/05/2026 vale a tabela em BRL.",
      "No e-commerce autenticado, a troca do CAVV v7 (3DES) para v9 (AES-128) cobra suporte de key block AES nos HSMs para não perder aprovação nem proteção de liability shift.",
    ],
    sections: [
      {
        heading: "Fim da loteria cambial nas billing lines domésticas",
        paragraphs: [
          "Quem já fechou fatura de bandeira no fim do mês sabe o trabalho que dá explicar para o Financeiro por que uma tarifa doméstica subiu 6% sem nenhuma mudança de volume. Durante anos, diversas linhas do Visa Fee Schedule no Brasil eram precificadas em dólar e convertidas pela PTAX no faturamento.",
          "A partir de 1º de maio de 2026, a Visa converteu as billing lines domésticas do Brasil para Real (BRL). Um exemplo concreto de como a vigência importa na auditoria: a taxa de Third Party Agent, que era de USD 5.000 até 30/04/2026, passou a R$ 32.000 em 01/05/2026. Quem compara dois meses seguidos sem travar a data de referência lê a variação errado.",
        ],
      },
      {
        heading: "A outra metade do pacote: CAVV v9 em AES-128",
        paragraphs: [
          "Enquanto o Financeiro ajusta planilhas de conciliação do VSS-110 e VSS-120, o time de autorização e segurança lida com a migração criptográfica do 3-D Secure 2.2. O CAVV versão 7, apoiado em 3DES, deu lugar ao CAVV versão 9 em AES-128.",
          "Parece detalhe de laboratório até aparecer na taxa de aprovação do e-commerce. Quando o servidor ACS do emissor gera um criptograma v9 e algum elo da cadeia não valida a chave AES direito — ou o campo chega truncado no TCR 5 do Base II — o resultado costuma aparecer de duas formas: recusa indevida na autorização ou perda de qualificação e de liability shift no clearing.",
        ],
        bullets: [
          "Emissores e ACS: validar suporte a Key Block AES (TR-31) nos HSMs de produção e contingência.",
          "Adquirentes: checar o repasse íntegro dos campos 3DS da autorização (0100) para o arquivo de Outgoing (Base II TCR 5).",
          "Financeiro e auditoria: manter histórico separado por data de vigência na conferência das billing lines do VSS.",
        ],
      },
    ],
    relatedLabHref: "/jornada?track=cartao",
    relatedLabLabel: "Ver o fluxo 3DS 2.2 com CAVV v9 no Laboratório",
  },
  {
    slug: "cobranca-nova-fatura-mcbs-vss-waiver",
    href: "/noticias/cobranca-nova-fatura-mcbs-vss-waiver",
    kind: "noticia",
    series: "Na prática, por que quebrou?",
    category: "Bandeiras",
    dateISO: "2026-11-08",
    dateShort: "08 nov",
    dateFull: "8 de novembro de 2026",
    year: "2026",
    readTime: "6 min",
    title: "De onde saiu essa cobrança nova na fatura da bandeira — e quando cabe waiver?",
    summary:
      "Faturas MCBS (Mastercard) e VSS (Visa) misturam tarifas de rede previsíveis com encargos de exceção e Data Integrity. Saber separar uma coisa da outra evita pagar duas vezes pelo mesmo erro técnico.",
    sourceNote: "Mastercard Consolidated Billing System (MCBS) · Visa Settlement Service (VSS-110/120)",
    effectiveWindow: "Nota prática de operação · auditoria de billing e waivers",
    keyTakeaways: [
      "Nunca leia a fatura da bandeira apenas pelo valor total mensal: separe sempre tarifa recorrente de volume (scheme fee normal) de encargo de não conformidade ou Data Integrity.",
      "Encargo de Data Integrity raramente é pontual — se a causa na mensageria não for corrigida, a cobrança volta no mês seguinte e escala.",
      "Pedido de waiver só ganha tração junto à bandeira quando traz causa raiz provada, data de correção em produção e evidência de que o problema parou de gerar erro.",
    ],
    sections: [
      {
        heading: "O susto no fechamento do MCBS e do VSS",
        paragraphs: [
          "Na maioria das empresas, a fatura consolidada das bandeiras chega para o Financeiro com centenas de códigos alfanuméricos — Service IDs no MCBS da Mastercard e Billing Lines no VSS da Visa. Se o total ficou perto do orçamento, ninguém abre linha por linha. O problema é que uma cobrança de exceção de R$ 25 mil some fácil no meio de uma fatura milionária, até virar R$ 150 mil no trimestre.",
          "Por isso, a conferência de fatura precisa ser feita a quatro mãos entre Financeiro e o time técnico de Bandeiras. O Financeiro vê a variação de preço e câmbio; o time de Bandeiras reconhece em cinco minutos se aquele código é uma tarifa normal de processamento ou uma multa por campo incorreto no arquivo.",
        ],
      },
      {
        heading: "Três perguntas antes de pagar uma linha nova",
        paragraphs: [
          "Quando aparece um código novo ou um salto fora da curva no MCBS ou no VSS, vale passar por três checagens rápidas:",
        ],
        bullets: [
          "A tarifa mudou de tabela ou de moeda naquela data? (Como aconteceu na virada da tabela Visa Brasil de USD para BRL em 01/05/2026.)",
          "É uma cobrança de uso normal que cresceu por volume — como autorização, tokenização ou consulta AVS — ou é um encargo de Data Integrity / retentativa excessiva?",
          "Se for encargo de exceção, a causa técnica no switch ou no Outgoing já foi corrigida?",
        ],
      },
      {
        heading: "Quando um pedido de waiver realmente funciona",
        paragraphs: [
          "Pedir dispensa ou redução de uma multa (waiver) funciona melhor quando a instituição trata a conversa com transparência técnica. Em vez de mandar um pedido genérico alegando impacto financeiro, monte um dossiê objetivo: qual foi o erro na mensageria, em que data começou, qual patch corrigiu em produção e o gráfico mostrando a queda dos eventos a zero depois da correção.",
          "Mesmo quando o waiver é parcial, esse trabalho impede que a mesma linha continue drenando caixa pelos seis meses seguintes.",
        ],
      },
    ],
    relatedLabHref: "/guia#intercambio",
    relatedLabLabel: "Ver a diferença entre Intercâmbio e Scheme Fees no Guia",
  },
  {
    slug: "mastercard-reg-2026-risco-credito",
    href: "/noticias/mastercard-reg-2026-risco-credito",
    kind: "noticia",
    category: "Bandeiras",
    dateISO: "2026-11-05",
    dateShort: "05 nov",
    dateFull: "5 de novembro de 2026",
    year: "2026",
    readTime: "8 min",
    featured: true,
    visualType: "mastercardreg",
    title: "Mastercard REG 2026.03 e Manual de Risco (BCB 522): onde estão os pontos mais duros para o mercado",
    summary:
      "As consultas públicas de 2026 consolidam 26 seções de regras operacionais e um novo modelo de risco em quatro tiers (T1 a T4). Para facilitadores e credenciadores, três cláusulas concentram o maior impacto operacional.",
    sourceNote: "Consultas Públicas Mastercard Brasil — REG 2026.03 e Manual de Gestão de Risco de Crédito e Liquidez (Res. BCB nº 522)",
    effectiveWindow: "Consultas publicadas em 02/04/2026 · vigência proposta a partir de 02/05/2026",
    keyTakeaways: [
      "Facilitadores de pagamento precisam de autorização do Banco Central ou volume anual mínimo de R$ 5 bilhões, mantendo responsabilidade solidária com o credenciador.",
      "O Manual de Risco classifica participantes de T1 a T4, exigindo cessão fiduciária e conta controlada obrigatórias a partir de T3.",
      "Cláusulas de medidas corretivas sem aviso prévio e de suspensão imediata acenderam alerta jurídico sobre proporcionalidade e direito de defesa.",
    ],
    sections: [
      {
        heading: "Por que essas consultas importam mesmo depois do prazo",
        paragraphs: [
          "Muita instituição só olha para um regulamento de bandeira quando recebe uma notificação ou um encargo na fatura. No Brasil, porém, o Banco Central obriga os instituidores de arranjo a submeter mudanças relevantes a consulta pública antes da vigência. É a janela em que adquirentes, emissores e facilitadores conseguem apontar desequilíbrios antes de a regra virar contrato fechado.",
          "No pacote submetido pela Mastercard em abril de 2026 — combinando o REG 2026.03 (26 seções cobrindo os 12 arranjos no país) e o Manual de Gestão de Risco de Crédito e Liquidez (em resposta à Resolução BCB 522) — aparecem exigências que redesenham a relação entre credenciadores, subcredenciadores e BaaS.",
        ],
      },
      {
        heading: "Os três pontos que merecem atenção imediata",
        paragraphs: [
          "O primeiro ponto está nos critérios de entrada para facilitadores de pagamento: autorização prévia do Banco Central ou volume anual igual ou superior a R$ 5 bilhões. Como o arcabouço atual do BC não prevê autorização específica para subcredenciadores abaixo dos limiares de instituição de pagamento, a régua de R$ 5 bilhões tende a fechar a porta para entrantes menores.",
          "O segundo ponto é a governança de terceiros e BaaS. Prestadores patrocinados em modelos de BaaS não podem deter, custodiar nem liquidar recursos do arranjo, e os contratos com terceiros precisam prever poderes explícitos de supervisão e rescisão unilateral pelo participante licenciado.",
          "O terceiro ponto está na assimetria das medidas corretivas do Manual de Risco. A escala de T1 a T4 impõe cessão fiduciária de recebíveis e conta controlada obrigatórias nos níveis T3 e T4, mas o texto também permite restringir ou suspender operações sem aviso prévio e sem prazo máximo vinculante para revisão após a regularização.",
        ],
        callout: {
          label: "Leitura completa das consultas",
          text: "Os resumos executivos completos — incluindo as sugestões formais de manifestação sobre o REG 2026.03, o Manual de Risco de Crédito e o Manual de Segurança — estão organizados na aba Consultas.",
        },
      },
    ],
    relatedLabHref: "/consultas/mastercard-regras-operacionais-2026",
    relatedLabLabel: "Ler o resumo executivo completo da consulta REG 2026.03",
  },
  {
    slug: "pix-automatico-e-aproximacao-jsr",
    href: "/noticias/pix-automatico-e-aproximacao-jsr",
    kind: "noticia",
    category: "Pix & BCB",
    dateISO: "2026-10-29",
    dateShort: "29 out",
    dateFull: "29 de outubro de 2026",
    year: "2026",
    readTime: "6 min",
    title: "Pix Automático e Pix por Aproximação (JSR): onde o cartão perde espaço e onde segura margem",
    summary:
      "A combinação de recorrência nativa (pain.009/pain.013) com aproximação NFC sem redirecionamento (Res. BCB 406) ataca duas fortalezas antigas dos cartões: assinaturas mensais e o débito na maquininha.",
    sourceNote: "Resoluções BCB nº 396/2024, 406/2024 e 429/2024 · Open Finance JSR",
    effectiveWindow: "JSR em vigor desde 14/11/2024 · escala nacional do Pix Automático e NFC em 2026–2027",
    keyTakeaways: [
      "O Pix Automático substitui o QR Code mensal por uma autorização única do pagador, entrando direto no território das assinaturas recorrentes (MIT/SCOF).",
      "O Pix por Aproximação usa credencial biométrica FIDO2 na Jornada Sem Redirecionamento (JSR), eliminando o atrito de abrir o app do banco na fila do caixa.",
      "O cartão de crédito ainda preserva duas vantagens fortes no Brasil: limite de crédito no ato e parcelamento sem juros — que o Pix Parcelado só começa a disputar de forma regulada a partir de 2027.",
    ],
    sections: [
      {
        heading: "O atrito era a maior defesa do cartão presencial",
        paragraphs: [
          "Na maquininha do dia a dia, o Pix sempre teve uma desvantagem de experiência frente ao cartão por aproximação. Enquanto no cartão basta encostar o celular ou o plástico e sair andando em dois segundos, pagar com Pix no balcão exigia desbloquear o telefone, abrir o app do banco, ler o QR Code, conferir o valor e confirmar a senha.",
          "Com a Jornada Sem Redirecionamento (JSR) do Open Finance — regulada pelas Resoluções BCB 396 e 406 — esse atrito desaparece. O cliente vincula sua conta à carteira digital uma única vez usando biometria FIDO2. Nas compras seguintes, encosta o celular na maquininha e pronto.",
        ],
      },
      {
        heading: "E na recorrência?",
        paragraphs: [
          "No modelo de assinaturas, o Pix Automático mira diretamente o custo de aceitação e o churn involuntário de cartões vencidos ou cancelados. O pagador autoriza a recorrência uma vez (com teto de valor definido) e as cobranças seguintes entram agendadas com retentativas padronizadas quando falta saldo.",
          "Para adquirentes e bandeiras, a disputa real de margem nos próximos dois anos está em dois lados opostos: no débito presencial e nas cobranças recorrentes de contas fixas, o Pix avança rápido; no crédito parcelado e nas compras de ticket maior, a combinação de limite, proteção de disputa e Network Tokens com Click to Pay ainda mantém o cartão na frente.",
        ],
      },
    ],
    relatedLabHref: "/jornada?track=pix_auto_nfc",
    relatedLabLabel: "Explorar Pix Automático & NFC no Laboratório",
  },

  // ── Artigos Técnicos Existentes (em /artigos/*) ──────────────────────────
  {
    slug: "quando-a-ia-responde-quem-realmente-sabe",
    href: "/artigos/quando-a-ia-responde-quem-realmente-sabe",
    kind: "artigo",
    category: "Autorização & Risco",
    dateISO: "2026-09-24",
    dateShort: "24 set",
    dateFull: "24 de setembro de 2026",
    year: "2026",
    readTime: "6 min",
    title: "Quando a IA responde, quem realmente sabe?",
    summary:
      "O risco de trocar a leitura dos boletins e o debate técnico por respostas prontas: o que se perde em repertório quando o atrito de aprender desaparece dos times de pagamentos.",
  },
  {
    slug: "intercambio-guia-completo",
    href: "/artigos/intercambio-guia-completo",
    kind: "artigo",
    category: "Intercâmbio",
    dateISO: "2026-04-28",
    dateShort: "28 abr",
    dateFull: "28 de abril de 2026",
    year: "2026",
    readTime: "12 min",
    title: "Intercâmbio: guia completo para adquirentes e subadquirentes",
    summary:
      "A cascata de cinco decisões que define qual tarifa entra em cada transação, por que o downgrade acontece em silêncio no clearing e como conferir se a operação está pagando o correto.",
  },
  {
    slug: "compelling-evidence-3-0",
    href: "/artigos/compelling-evidence-3-0",
    kind: "artigo",
    category: "Autorização & Risco",
    dateISO: "2026-04-28",
    dateShort: "28 abr",
    dateFull: "28 de abril de 2026",
    year: "2026",
    readTime: "10 min",
    title: "Compelling Evidence 3.0: como a Visa combate fraude amigável",
    summary:
      "Critérios de elegibilidade, campos Base II, reason codes 10.4 e 13.1, comparativo com o CE 2.0 e fluxo prático de defesa.",
  },
  {
    slug: "passo-a-passo-transacao",
    href: "/artigos/passo-a-passo-transacao",
    kind: "artigo",
    category: "Autorização & Risco",
    dateISO: "2026-02-08",
    dateShort: "08 fev",
    dateFull: "8 de fevereiro de 2026",
    year: "2026",
    readTime: "15 min",
    title: "Passo a passo de uma transação de pagamento",
    summary:
      "Do credenciamento do lojista até a liquidação financeira: autorização ISO 8583, chip EMV, Dual Message, clearing noturno e chargeback explicados do zero.",
  },
  {
    slug: "vdcap-taf-scof",
    href: "/artigos/vdcap-taf-scof",
    kind: "artigo",
    category: "Bandeiras",
    dateISO: "2025-04-12",
    dateShort: "12 abr",
    dateFull: "12 de abril de 2025",
    year: "2025",
    readTime: "12 min",
    title: "Visa VDCAP e Mastercard TAF/SCOF: autenticação silenciosa com token",
    summary:
      "Como Visa e Mastercard combinam Network Tokens e credenciais salvas para autenticar compras sem empurrar desafio 3DS ao cliente — com os campos técnicos de cada bandeira.",
  },
];

type ExtraNewsInput = Omit<EditorialNewsArticle, "href" | "kind"> & {
  href?: string;
  kind?: "noticia" | "artigo";
};

const EXTRA_POSTS: EditorialNewsArticle[] = (
  Array.isArray(extraNewsRaw) ? (extraNewsRaw as ExtraNewsInput[]) : []
).map((item) => ({
  ...item,
  kind: "noticia" as const,
  href: item.href || `/noticias/${item.slug}`,
}));

export const EDITORIAL_POSTS: EditorialNewsArticle[] = [
  ...EXTRA_POSTS,
  ...CORE_EDITORIAL_POSTS,
].sort((a, b) => b.dateISO.localeCompare(a.dateISO));

export const EDITORIAL_THEMES: {
  id: string;
  title: string;
  description: string;
  categoryFilter: EditorialCategory;
  slugs: string[];
}[] = [
  {
    id: "bandeiras",
    title: "Bandeiras & Releases",
    description:
      "Mudanças de regra de Visa, Mastercard, Elo e Amex, faturas MCBS/VSS, waivers e consultas públicas.",
    categoryFilter: "Bandeiras",
    slugs: [
      "visa-tarifas-brl-cavv-v9",
      "cobranca-nova-fatura-mcbs-vss-waiver",
      "mastercard-reg-2026-risco-credito",
    ],
  },
  {
    id: "regulacao-pix",
    title: "Banco Central, Pix & 2027",
    description:
      "Reforma Tributária (Split Payment), MED 2.0, Pix Automático, Open Finance sem redirecionamento e agenda do BC.",
    categoryFilter: "Pix & BCB",
    slugs: [
      "split-payment-reforma-tributaria-2027",
      "med-2-rastreio-multinivel",
      "pix-automatico-e-aproximacao-jsr",
    ],
  },
  {
    id: "intercambio",
    title: "Intercâmbio & Tarifas",
    description:
      "Como a cascata de qualificação forma o custo da compra, onde nasce o downgrade silencioso e como fechar a conta.",
    categoryFilter: "Intercâmbio",
    slugs: [
      "aprovou-00-margem-sumiu-no-clearing",
      "intercambio-guia-completo",
      "visa-tarifas-brl-cavv-v9",
    ],
  },
  {
    id: "autorizacao-risco",
    title: "Autorização, Clearing & Disputas",
    description:
      "Mensageria ISO 8583, quedas de aprovação pós-release, defesa de chargeback com CE 3.0 e repertório de time.",
    categoryFilter: "Autorização & Risco",
    slugs: [
      "taxa-aprovacao-caiu-depois-do-release",
      "compelling-evidence-3-0",
      "passo-a-passo-transacao",
    ],
  },
];

export function getNewsPostBySlug(slug: string): EditorialNewsArticle | undefined {
  return EDITORIAL_POSTS.find((p) => p.kind === "noticia" && p.slug === slug);
}

export function getAllNewsPosts(): EditorialNewsArticle[] {
  return EDITORIAL_POSTS.filter((p) => p.kind === "noticia");
}
