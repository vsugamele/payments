export interface GuiaChapter {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  actors: string;
  paragraphs: string[];
  keyPoints: string[];
  officialSources: string[];
  labHref: string;
  labLabel: string;
  relatedArticleHref?: string;
  relatedArticleLabel?: string;
}

export const GUIA_CHAPTERS: GuiaChapter[] = [
  {
    id: "cartao",
    number: "01",
    shortTitle: "Cartão",
    title: "Cartão: quem participa e como a compra é aprovada",
    subtitle: "Do toque na maquininha ou checkout online até o código de retorno 00.",
    summary:
      "Em menos de dois segundos, uma compra no cartão atravessa terminal ou gateway, adquirente, bandeira e banco emissor — e cada papel responde por uma fatia do risco e da taxa.",
    actors: "Portador → Estabelecimento → Adquirente (ou Subadquirente) → Bandeira → Emissor",
    paragraphs: [
      "Para quem está no balcão da loja, pagar no cartão parece uma conversa direta entre a maquininha e o banco. Na prática, quatro ou cinco instituições trocam mensagens padronizadas em ISO 8583 antes de o comprovante sair impresso.",
      "O estabelecimento vende e envia os dados da compra para o adquirente (ou passa antes por um subadquirente/facilitador). O adquirente valida a captura, protege o PIN ou criptograma via HSM e entrega a mensagem para a bandeira — Visa, Mastercard, Elo ou American Express. A bandeira identifica o banco que emitiu aquele BIN e encaminha o pedido de autorização. Quem diz sim ou não, olhando limite, saldo e risco de fraude, é o emissor.",
    ],
    keyPoints: [
      "Quatro partes: adquirente, bandeira e emissor são instituições separadas (modelo predominante em Visa, Mastercard e Elo).",
      "Subadquirente / PayFac: opera abaixo de um adquirente credenciado, agregando lojistas menores e assumindo gestão operacional da ponta comercial.",
      "Fluxo de dados ≠ fluxo de dinheiro: a autorização reserva o limite em segundos; o dinheiro só muda de mão na liquidação.",
    ],
    officialSources: [
      "Lei nº 12.865/2013 (Arranjos de pagamento sob supervisão do Banco Central)",
      "ISO 8583-1 (Mensagens financeiras de cartão)",
    ],
    labHref: "/jornada?track=cartao",
    labLabel: "Ver Cartão passo a passo no Laboratório",
    relatedArticleHref: "/artigos/passo-a-passo-transacao",
    relatedArticleLabel: "Ler: Passo a passo de uma transação",
  },
  {
    id: "clearing",
    number: "02",
    shortTitle: "Clearing e Liquidação",
    title: "Clearing, Outgoing e liquidação (SLC / B3)",
    subtitle: "Como a venda autorizada vira dinheiro na conta do estabelecimento.",
    summary:
      "A autorização não transfere dinheiro. Horas depois, a adquirente monta arquivos em lote (Base II, IPM, Serviço 10 ou CAS), registra as Unidades de Recebíveis e liquida as posições via CIP/Núclea e STR.",
    actors: "Adquirente → Bandeira (Clearing) → Emissor · Registradora (B3/CERC/TAG) · CIP/STR",
    paragraphs: [
      "Muita falha cara em pagamentos nasce da confusão entre autorização e liquidação. No modelo Dual Message (padrão do crédito e de boa parte das compras no Brasil), a autorização apenas bloqueia o limite. A cobrança real acontece no clearing, quando o adquirente envia o arquivo noturno de Outgoing para a bandeira.",
      "Cada bandeira usa um formato próprio: Base II (.CTF de 168 bytes) na Visa, GCMS IPM (.IPM em TLV) na Mastercard, Serviço 10 (.TXT) na Elo e CAS na American Express. Com o lote aceito, a agenda de recebíveis do lojista é registrada como Unidade de Recebível (UR) em registradora autorizada (B3, CERC ou TAG), permitindo que o lojista negocie antecipação ou garantia onde escolher antes da liquidação multilateral no SLC.",
    ],
    keyPoints: [
      "Crítica T+0: erros de sintaxe ou campo ausente no Outgoing geram rejeições (EP747, VCX, T112, Reg 09) e atrasam o repasse.",
      "Registro obrigatório de recebíveis (Res. BCB 264): quebrou a trava bancária exclusiva e exige consulta de ônus antes da liquidação.",
      "Prazos típicos no Brasil: débito liquida em D+1; crédito à vista e parcelas em ciclos de ~30 dias, salvo antecipação.",
    ],
    officialSources: [
      "Resolução BCB nº 264/2022 (Registro de recebíveis de arranjos de pagamento)",
      "Grade SLC / CIP (arquivos ASLC026, ASLC028 e ASLC031)",
    ],
    labHref: "/jornada?track=clearing_slc",
    labLabel: "Ver Liquidação e SLC/B3 no Laboratório",
  },
  {
    id: "intercambio",
    number: "03",
    shortTitle: "Intercâmbio e MDR",
    title: "Intercâmbio, MDR e tarifas de bandeira",
    subtitle: "Para onde vai cada centavo da taxa descontada do lojista.",
    summary:
      "O MDR cobrado do estabelecimento se divide em três camadas distintas: intercâmbio (vai para o emissor), scheme fee (vai para a bandeira) e margem do adquirente. Misturar as três impede qualquer diagnóstico de margem.",
    actors: "Lojista paga MDR → Adquirente repassa Intercâmbio ao Emissor e Scheme Fees à Bandeira",
    paragraphs: [
      "A identidade básica de precificação em cartões é simples: MDR ≈ Intercâmbio + Tarifa de Bandeira + Margem do Adquirente. O intercâmbio remunera o banco emissor pelo risco de crédito, custo de funding e benefícios do plástico; a tarifa de bandeira (faturada em MCBS na Mastercard e VSS na Visa) remunera o uso da rede.",
      "No Brasil, o Banco Central regula o teto do intercâmbio no débito (máximo de 0,50% por transação) e no pré-pago (máximo de 0,70%), enquanto o crédito segue em livre mercado e varia conforme produto, canal, autenticação e MCC.",
    ],
    keyPoints: [
      "Resolução BCB nº 304/2023 (em vigor desde 01/04/2023): teto de 0,50% no débito e 0,70% no pré-pago.",
      "Downgrade silencioso: quando um campo de autenticação, produto ou prazo falha no clearing, a venda cai para uma faixa de intercâmbio mais cara sem avisar na autorização.",
      "Faturas de rede: conferir mensalmente MCBS e VSS separa custo legítimo de volume de encargos evitáveis de Data Integrity.",
    ],
    officialSources: [
      "Resolução BCB nº 246/2022 e Resolução BCB nº 304/2023 (Tetos de intercâmbio)",
      "Visa Fee Schedule Brazil (BRL desde 01/05/2026) · Mastercard MCBS",
    ],
    labHref: "/jornada?track=cartao",
    labLabel: "Simular divisão do dinheiro no Laboratório",
    relatedArticleHref: "/artigos/intercambio-guia-completo",
    relatedArticleLabel: "Ler: Intercâmbio — guia completo",
  },
  {
    id: "disputas",
    number: "04",
    shortTitle: "Contestação e CE 3.0",
    title: "Contestação, chargeback e Compelling Evidence 3.0",
    subtitle: "Quando o portador não reconhece a compra e o jogo vira disputa de evidência.",
    summary:
      "O chargeback nasceu para proteger o consumidor contra fraude e desacordo comercial, mas virou também uma frente financeira crítica com programas punitivos das bandeiras (VAMP e ECP).",
    actors: "Portador → Emissor → Bandeira (VROL / MCOM) → Adquirente → Estabelecimento",
    paragraphs: [
      "Quando o titular contesta uma compra na fatura, o emissor classifica o motivo sob um Reason Code específico e envia a disputa pela rede da bandeira até o adquirente. Se o estabelecimento não apresenta defesa válida dentro do prazo, o valor é debitado da agenda.",
      "No e-commerce, duas proteções mudam completamente a equação: autenticação 3-D Secure 2.2 (que transfere a responsabilidade por fraude não reconhecida para o emissor via Liability Shift) e, nos casos sem 3DS na Visa, o Compelling Evidence 3.0 — que permite ao lojista derrubar fraude amigável comprovando compras anteriores não contestadas com o mesmo dispositivo ou IP.",
    ],
    keyPoints: [
      "Liability Shift (ECI 05 / 02): autenticar no 3DS 2.2 protege o lojista contra disputas de fraude CNP.",
      "Compelling Evidence 3.0 (Visa): exige histórico de transações anteriores sem disputa vinculadas por identificadores consistentes.",
      "Programas de monitoria (Visa VAMP / Mastercard ECP): ultrapassar os limiares mensais de fraude ou chargeback dispara planos de ação e penalidades.",
    ],
    officialSources: [
      "Visa Dispute Management Guidelines & Compelling Evidence 3.0",
      "Mastercard Chargeback Guide & Excessive Chargeback Program (ECP)",
    ],
    labHref: "/jornada?track=contestacao_ce3",
    labLabel: "Ver Disputa e CE 3.0 no Laboratório",
    relatedArticleHref: "/artigos/compelling-evidence-3-0",
    relatedArticleLabel: "Ler: Compelling Evidence 3.0",
  },
  {
    id: "pix",
    number: "05",
    shortTitle: "Pix e MED 2.0",
    title: "Pix, Pix Automático, JSR e MED 2.0",
    subtitle: "Liquidação bruta em tempo real no Banco Central e a evolução de recorrência e segurança.",
    summary:
      "Diferente do cartão, o Pix liquida em segundos direto nas Contas PI do Banco Central via ISO 20022 (pacs.008). Com Pix Automático, aproximação NFC (JSR) e MED 2.0, o arranjo avança sobre recorrência, balcão e combate a golpes.",
    actors: "Pagador → PSP Pagador → DICT / SPI (Banco Central) → PSP Recebedor → Recebedor",
    paragraphs: [
      "No Pix, não existe clearing noturno nem janela de 30 dias: o PSP pagador consulta a chave no DICT, checa limites e antifraude (incluindo o limite noturno de R$ 1.000 entre pessoas físicas) e dispara a ordem pacs.008 para o SPI. O Banco Central movimenta as Contas PI em tempo real e confirma com pacs.002.",
      "Três evoluções recentes mudam o tabuleiro competitivo: a Jornada Sem Redirecionamento (JSR — Res. BCB 406) permite aproximar o celular na maquininha com biometria FIDO2 sem abrir o app do banco; o Pix Automático leva cobrança recorrente para assinaturas; e o MED 2.0 (Res. BCB 493/2025) estende o bloqueio de golpes para além da primeira conta laranja.",
    ],
    keyPoints: [
      "Resolução BCB nº 142/2021: limite noturno de R$ 1.000 das 20h às 6h entre pessoas físicas.",
      "Resolução BCB nº 406/2024: Pix sem redirecionamento (JSR) com credencial FIDO2 em carteiras digitais.",
      "Resolução BCB nº 493/2025 (MED 2.0): autoatendimento de contestação no app e rastreio multinível no grafo de transferências.",
    ],
    officialSources: [
      "Resolução BCB nº 1/2020 (Regulamento do Pix)",
      "Resolução BCB nº 406/2024 (JSR) e Resolução BCB nº 493/2025 (MED 2.0)",
    ],
    labHref: "/jornada?track=pix_spi",
    labLabel: "Ver Pix SPI e MED 2.0 no Laboratório",
    relatedArticleHref: "/noticias/med-2-rastreio-multinivel",
    relatedArticleLabel: "Ler: MED 2.0 e rastreio multinível",
  },
  {
    id: "boleto",
    number: "06",
    shortTitle: "Boleto NPC e BolePix",
    title: "Boleto registrado, BolePix, SILOC e STR",
    subtitle: "Do registro obrigatório na base centralizada até a compensação em D+1 ou tempo real.",
    summary:
      "O boleto deixou de ser um título solto em papel: hoje precisa nascer registrado na base centralizada da CIP/Núclea (ADDA101), aceita pagamento híbrido via Pix e muda de câmara conforme o valor.",
    actors: "Beneficiário → Banco Emissor → Base Centralizada (Núclea/NPC) → Banco Pagador → SILOC / STR",
    paragraphs: [
      "Todo boleto emitido no Brasil precisa ser registrado na Nova Plataforma de Cobrança (CIP/Núclea) com dados completos do pagador, do beneficiário, valor, vencimento e regras de juros e desconto. É essa base única que permite pagar o boleto em qualquer banco e alimenta o DDA (Débito Direto Autorizado).",
      "Na liquidação, o valor define a trilha: boletos abaixo de R$ 250 mil compensam de forma multilateral no SILOC em D+1; já boletos de valor igual ou superior a R$ 250 mil (VLB-Cobrança) liquidam individualmente em tempo real no STR (D+0, mensagem STR0039) para reduzir risco sistêmico entre bancos.",
    ],
    keyPoints: [
      "Fator de vencimento Febraban: reiniciou em 22/02/2025 voltando para 1000 — sistemas legados que não trataram a virada erram a data de vencimento.",
      "SILOC vs STR: abaixo de R$ 250 mil vai na grade multilateral (D+1); a partir de R$ 250 mil vai bruto em tempo real no STR (D+0).",
      "Resolução BCB nº 443/2024 e nº 587/2026: consolidam o boleto dinâmico e a cobrança híbrida (Pix Cobrança que também pode ser paga como boleto, com vigência em 01/02/2027).",
    ],
    officialSources: [
      "Resolução BCB nº 443/2024 (Arranjo do boleto e base centralizada)",
      "Resolução BCB nº 587/2026 (Cobrança híbrida a partir de 01/02/2027) · Regulamento SILOC/STR",
    ],
    labHref: "/jornada?track=boleto_npc",
    labLabel: "Ver Boleto NPC e BolePix no Laboratório",
  },
  {
    id: "open-finance",
    number: "07",
    shortTitle: "Open Finance e JSR",
    title: "Open Finance, consentimento e Jornada Sem Redirecionamento",
    subtitle: "Como APIs padronizadas movem dados bancários e iniciam pagamentos fora do app do banco.",
    summary:
      "No Open Finance, o cliente autoriza que outra instituição leia seus dados ou inicie um Pix em seu nome. Com a JSR e o consentimento desacoplado, a experiência perde o atrito de pular entre aplicativos.",
    actors: "Cliente → Instituição Receptora / Iniciadora (ITP) → Diretório → Instituição Transmissora / Detentora",
    paragraphs: [
      "A primeira fase do Open Finance focou em compartilhamento de cadastro, saldos e extrato mediante consentimento explícito com escopo e prazo definidos pelo cliente. Na camada de pagamentos, entrou a figura do Iniciador de Transação de Pagamento (ITP), que dispara um Pix a partir da conta mantida em outro banco.",
      "Durante os primeiros anos, o gargalo foi o redirecionamento: o usuário precisava sair do checkout, abrir o app do banco, fazer login e voltar. A Resolução BCB nº 406/2024 resolveu isso com a Jornada Sem Redirecionamento (JSR), vinculando o dispositivo com biometria FIDO2/WebAuthn para aprovar pagamentos no próprio checkout ou por aproximação NFC.",
    ],
    keyPoints: [
      "Consentimento auditável: toda chamada passa por certificados do Diretório do Open Finance, com finalidade e prazo controlados pelo titular.",
      "JSR (Res. BCB 406/2024): dispensa o redirecionamento ao app do banco após o vínculo inicial com Passkey / FIDO2.",
      "Horizonte 2027 (Res. BCB 603/2026): iniciadoras passam a poder ofertar crédito integrado na hora do Pix a partir de 01/07/2027.",
    ],
    officialSources: [
      "Resolução Conjunta nº 1/2020 (Estrutura do Open Finance)",
      "Resolução BCB nº 406/2024 (JSR) e Resolução Conjunta nº 21/2026",
    ],
    labHref: "/jornada?track=open_finance_drex",
    labLabel: "Ver Open Finance e JSR no Laboratório",
    relatedArticleHref: "/noticias/pix-automatico-e-aproximacao-jsr",
    relatedArticleLabel: "Ler: Pix Automático e Aproximação (JSR)",
  },
  {
    id: "abertura-de-conta",
    number: "08",
    shortTitle: "Abertura de Conta e KYC",
    title: "Abertura de conta, PLD/FT, BaaS e BC Protege+",
    subtitle: "O que acontece nos bastidores antes de uma conta digital ou cartão virtual nascer.",
    summary:
      "Abrir uma conta pelo celular parece instantâneo, mas exige checagem biométrica, consulta à Receita Federal, trava preventiva no BC Protege+ e triagem contra lavagem de dinheiro antes de emitir a primeira chave Pix.",
    actors: "Cliente → App da IP / Banco → Validação Biométrica / CPF → BC Protege+ / PLD → Conta PI / Cartão",
    paragraphs: [
      "Antes de liberar uma conta de pagamento pré-paga (regida pela Resolução BCB nº 96/2021) ou conta de depósitos bancária (Resolução CMN nº 4.753/2019), a instituição precisa confirmar a identidade do titular, validar prova de vida (liveness 3D), checar a situação cadastral na Receita Federal e rodar filtros de prevenção à lavagem de dinheiro (PEP e listas restritivas — Circular 3.978/2020).",
      "Outro controle que entrou na rotina de onboarding é o BC Protege+, sistema do Banco Central em que qualquer pessoa ou empresa pode ativar um bloqueio gratuito contra abertura de contas em seu CPF ou CNPJ. Sem consultar essa trava, a instituição assume risco direto de conta fraudulenta.",
    ],
    keyPoints: [
      "IP vs Banco: em conta de pagamento pré-paga (Res. BCB 96), o saldo fica separado do patrimônio da instituição (no BC ou em títulos públicos) e não pode ser emprestado.",
      "BC Protege+: consulta preventiva obrigatória para impedir abertura de contas laranja com documentos vazados.",
      "BaaS regulado (Res. Conjunta nº 16/2025): define responsabilidades formais entre a instituição regulada prestadora de BaaS e o parceiro tomador do serviço.",
    ],
    officialSources: [
      "Resolução BCB nº 96/2021 (Contas de pagamento) e Circular nº 3.978/2020 (PLD/FT)",
      "Resolução Conjunta nº 16/2025 (Banking as a Service) · Sistema BC Protege+",
    ],
    labHref: "/jornada?track=abertura_conta_kyc",
    labLabel: "Ver Abertura de Conta e BC Protege+ no Laboratório",
  },
  {
    id: "reforma-2027",
    number: "09",
    shortTitle: "Reforma 2027 e Split",
    title: "Reforma Tributária 2027+ e o Split Payment",
    subtitle: "A maior mudança estrutural de liquidação da década no Brasil.",
    summary:
      "A Lei Complementar nº 214/2025 (Arts. 31 a 35) introduz a segregação automática da CBS e do IBS na liquidação financeira, alterando captura, conciliação e o volume de recebíveis livres para antecipação.",
    actors: "Estabelecimento / ERP (NF-e) → Meios de Pagamento (Adquirente / PSP) → Fisco + Lojista",
    paragraphs: [
      "Até hoje, o meio de pagamento calcula MDR, intercâmbio e repasse sem precisar saber qual é o tributo da nota fiscal emitida pelo lojista. Com o Split Payment da Reforma Tributária, a infraestrutura de liquidação passa a conversar com o documento fiscal para separar a parcela de CBS e IBS antes de creditar o estabelecimento.",
      "O impacto vai além de um campo extra na mensagem: muda o capital de giro do comércio e exige que o registro de Unidades de Recebíveis nas registradoras (B3, CERC e TAG) respeite o teto líquido do tributo previsto no Art. 34 da lei.",
    ],
    keyPoints: [
      "LC 214/2025 (Arts. 31 a 35): define as modalidades de Split Payment inteligente e simplificado.",
      "Art. 34: a parcela destinada ao pagamento de IBS/CBS não pode ser onerada nem antecipada como recebível livre.",
      "Cronograma: preparação técnica em 2026 com entrada operacional da CBS a partir de 2027 e transição gradual do IBS.",
    ],
    officialSources: [
      "Lei Complementar nº 214/2025 (Arts. 31 a 35 — Split Payment)",
      "Resolução BCB nº 264/2022 (Interoperabilidade com registradoras de recebíveis)",
    ],
    labHref: "/jornada?track=regras_2027_tempo&split2027=1",
    labLabel: "Simular o Split 2027 no Laboratório",
    relatedArticleHref: "/noticias/split-payment-reforma-tributaria-2027",
    relatedArticleLabel: "Ler: Split Payment na Reforma Tributária",
  },
];

export function getGuiaChapterBySlug(slug: string): GuiaChapter | undefined {
  return GUIA_CHAPTERS.find((c) => c.id === slug);
}
