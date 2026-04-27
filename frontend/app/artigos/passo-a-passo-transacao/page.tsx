import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata = {
  title: "Passo a Passo de uma Transação de Pagamento — VS Payments",
  description:
    "Do credenciamento do lojista até a liquidação: fluxo completo de uma transação Mastercard, com ISO 8583, EMV, clearing e chargeback.",
};

export default function ArtigoPasso() {
  return (
    <ArticleLayout
      title="Passo a Passo de uma Transação de Pagamento"
      tag="Educacional"
      tagColor="rgba(34,197,94,0.12)"
      tagText="#4ade80"
      date="8 de fevereiro de 2026"
      readTime="15 min"
    >
      <p>
        Esse material foi elaborado com base nas regras da Bandeira <strong>Mastercard</strong>. Optei
        dessa maneira para não ficar muito confuso para as pessoas que queiram iniciar nesse mercado
        ou entender um pouco mais sobre o fluxo de uma transação, sem se perder nas peculiaridades
        de cada bandeira.
      </p>

      <p>
        Toda vez que alguém faz um pagamento com cartão em um terminal POS, ocorre uma operação
        silenciosa que acontece em menos de 2 segundos. Nesse intervalo, mensagens padronizadas
        cruzam redes privadas, passam por no mínimo 4 entidades diferentes, são analisadas por
        dezenas de regras de fraude, roteadas entre processadores e devolvidas com um código de dois
        dígitos que decide se a compra vai ou não acontecer.
      </p>

      <div className="callout">
        <strong>Escala do mercado:</strong> No Brasil, isso se repete 128 milhões de vezes por dia.
        Só no primeiro semestre de 2025, foram R$ 2,2 trilhões transacionados em cartões (Abecs) e
        73% das compras presenciais já são feitas por aproximação. Em 2024, o setor ultrapassou
        R$ 4,1 trilhões anuais pela primeira vez.
      </div>

      {/* ── 1. Participantes ───────────────────────────────────────────────── */}
      <h2>Os participantes do ecossistema</h2>

      <p>
        Antes de entrar no fluxo técnico, é preciso mapear quem é quem. Uma transação de cartão
        envolve, no mínimo, cinco participantes diretos.
      </p>

      <h3>Portador do cartão</h3>
      <p>
        A pessoa que está pagando. Do ponto de vista técnico, o portador é representado pelo{" "}
        <strong>PAN (Primary Account Number)</strong> e pelo conjunto de dados do chip — não pela
        pessoa física em si.
      </p>

      <h3>Estabelecimento Comercial (EC)</h3>
      <p>
        O lojista. Identificado pelo código do estabelecimento (<code>DE 42</code>) e pelo terminal
        utilizado (<code>DE 41</code>). O <strong>MCC (Merchant Category Code)</strong> define regras
        de intercâmbio, restrições de uso e elegibilidade para parcelamento ou vouchers PAT.
      </p>

      <h3>Credenciador (Acquirer)</h3>
      <p>
        A empresa que habilitou o lojista a aceitar cartões. Cielo, Rede, Stone, Getnet, PagSeguro,
        entre outros. O credenciador captura a transação no terminal, monta a mensagem ISO 8583,
        roteia para a bandeira e liquida o valor ao lojista. É quem assume o risco de crédito perante
        o EC.
      </p>

      <h3>Bandeira (Card Scheme/Network)</h3>
      <p>
        Visa, Mastercard, Elo, Amex, Hiper. Opera a rede que conecta credenciadores e emissores.
        Define as regras do jogo: especificações técnicas de mensageria, tabelas de intercâmbio,
        prazos de liquidação, regras de chargeback, programas de compliance.{" "}
        <strong>A bandeira não empresta dinheiro — ela é a infraestrutura.</strong>
      </p>

      <h3>Emissor (Issuer)</h3>
      <p>
        O banco ou instituição que emitiu o cartão. É quem conhece o portador, sabe seu limite, seu
        score de risco, seu histórico. É o emissor que autoriza ou nega a transação.
      </p>

      <h3>Processador (6º participante)</h3>
      <p>
        Empresas como Fiserv, FIS, TSYS (Global Payments), CSU e Dock operam a infraestrutura
        tecnológica utilizada por emissores e/ou credenciadores. Muitos emissores ou adquirentes
        terceirizam para um processador que faz a tradução, o roteamento, o gerenciamento de chaves
        criptográficas e a conexão com as bandeiras.
      </p>

      {/* ── 2. Onboarding ─────────────────────────────────────────────────── */}
      <h2>Onboarding do lojista: antes da primeira venda</h2>

      <p>
        É responsabilidade do Adquirente garantir a legitimidade e a idoneidade de cada parceiro
        comercial. A ferramenta central nesse processo é o{" "}
        <strong>MATCH (Member Alert to Control High-Risk Merchants)</strong>.
      </p>

      <div className="callout">
        <strong>O que é o MATCH?</strong> Pense no MATCH como uma "lista negra" global e
        compartilhada entre os participantes da rede. Antes de credenciar qualquer lojista, o
        Adquirente tem a obrigação de consultar essa base para verificar se o comerciante ou seus
        sócios já foram descredenciados por outro adquirente. Essa é uma via de mão dupla: se um
        adquirente encerra um contrato por motivos de alto risco, tem a obrigação de reportar esse
        lojista ao MATCH.
      </div>

      <p>
        Além da consulta ao MATCH, o Adquirente deve conduzir um rigoroso processo de{" "}
        <strong>KYC (Know Your Customer)</strong>: verificar se o negócio é legítimo ("Bona Fide"),
        analisar sua estrutura societária e realizar triagens de sanções.
      </p>

      <h3>Parceiros estratégicos</h3>
      <ul>
        <li>
          <strong>Payment Facilitator (PF / Subadquirente):</strong> Empresas que credenciam
          "sub-comerciantes" em nome do Adquirente. O PF gerencia o contrato e o repasse financeiro,
          mas o Adquirente principal é o responsável final. (A normativa 522 do Banco Central coloca
          a bandeira também como responsável e garantidora em alguns pontos desse processo.)
        </li>
        <li>
          <strong>Gateway de Pagamento (MPG):</strong> Conecta o site do lojista ao sistema do
          Adquirente, transportando os dados do cartão de forma segura e criptografada, sem tocar
          nos fundos da transação.
        </li>
      </ul>

      <h3>BRAM — monitoramento contínuo</h3>
      <p>
        Enquanto o MATCH olha para o <em>passado</em> do lojista, o{" "}
        <strong>BRAM</strong> monitora o <em>presente</em>. É um programa mandatório que exige que o
        Adquirente monitore proativamente sua carteira para garantir que nenhum estabelecimento
        esteja vendendo produtos ilegais (drogas ilícitas, produtos falsificados, pornografia
        infantil) ou conteúdo danoso à marca (jogos de azar ilegais, tabaco em jurisdições
        proibidas).
      </p>

      {/* ── 3. POI / POS ──────────────────────────────────────────────────── */}
      <h2>Ponto de Interação (POI / POS)</h2>

      <h3>Card-Present (presencial)</h3>
      <ul>
        <li>
          <strong>POS Dual Interface:</strong> terminais que suportam Chip (EMV) e Contactless
          (NFC).
        </li>
        <li>
          <strong>Mobile POS (mPOS):</strong> celular ou tablet vira terminal. Identificado com{" "}
          <code>DE 61 = 9</code> nas mensagens de autorização.
        </li>
        <li>
          <strong>QR Code:</strong> "Consumer-Presented QR", onde o consumidor lê o QR no app/POS do
          lojista.
        </li>
      </ul>

      <h3>Card-Not-Present (não presencial)</h3>
      <ul>
        <li>
          <strong>E-commerce:</strong> compra pela internet sem o cartão físico, apenas seus dados.
        </li>
        <li>
          <strong>Credential on File (CoF):</strong> cartão salvo para compras futuras. O Adquirente
          deve sinalizar isso na transação (<code>DE 22 = 10</code>) para diferenciar de uma compra
          digitada manualmente.
        </li>
      </ul>

      {/* ── 4. Dual Message ───────────────────────────────────────────────── */}
      <h2>O Dual Message System</h2>

      <p>
        O ciclo de vida de uma transação de crédito no sistema Mastercard é um processo de duas
        fases, conhecido como <strong>Dual Message System</strong>.
      </p>

      <h3>Fase 0: Captura dos dados no terminal (EMV)</h3>
      <p>
        Quando o portador aproxima ou insere o cartão, o terminal inicia uma conversa com o chip. No
        caso de EMV contact, o terminal lê os <strong>AIDs (Application Identifiers)</strong>{" "}
        disponíveis e seleciona o aplicativo apropriado. O chip e o terminal trocam dados em formato{" "}
        <strong>TLV (Tag-Length-Value)</strong>.
      </p>

      <p>Tags EMV críticas nesse momento:</p>
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Nome</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["9F26", "Application Cryptogram", "Criptograma gerado pelo chip (ARQC)"],
            ["9F27", "Cryptogram Information Data", "Indica se o chip gerou ARQC, TC ou AAC"],
            ["9F10", "Issuer Application Data", "Dados proprietários do emissor"],
            ["9F37", "Unpredictable Number", "Aleatório para evitar replay attacks"],
            ["9F36", "Application Transaction Counter", "Contador sequencial"],
            ["9F1A", "Terminal Country Code", "Código do país do terminal"],
            ["5F2A", "Transaction Currency Code", "Código da moeda"],
          ].map(([tag, name, desc]) => (
            <tr key={tag}>
              <td>{tag}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{name}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="callout">
        <strong>O ARQC:</strong> O chip gera um <em>Authorization Request Cryptogram</em> calculado
        com base nos dados da transação e em chaves derivadas únicas do cartão. Esse criptograma é a
        prova de que aquele cartão físico estava presente naquele terminal, naquele momento, para
        aquele valor. Nenhum dado clonado de tarja consegue reproduzir isso.
      </div>

      <div className="callout">
        <strong>Curiosidade:</strong> Para transações contactless (NFC) abaixo do limite de CVM
        (R$ 200 no Brasil), o chip gera o criptograma em um único comando, sem exigir PIN ou
        assinatura.
      </div>

      <h3>Fase 1: Autorização (mensagem 0100)</h3>
      <p>
        Esta fase ocorre em segundos, enquanto o cliente aguarda na maquininha ou no checkout do
        site. Seu único objetivo é verificar se o portador tem fundos ou limite disponível.
      </p>
      <ol>
        <li>
          <strong>Captura e Envio:</strong> O Adquirente captura os dados e envia a mensagem{" "}
          <code>0100</code> (authorization request) para a rede Mastercard.
        </li>
        <li>
          <strong>Roteamento:</strong> A Mastercard identifica o banco Emissor com base nos primeiros
          dígitos do cartão (BIN) e encaminha a solicitação.
        </li>
        <li>
          <strong>Decisão do Emissor:</strong> Verifica limite/saldo, validade, score de risco e
          responde com aprovação (<code>00</code>) ou negativa (ex: <code>51</code> = saldo
          insuficiente).
        </li>
        <li>
          <strong>Resposta:</strong> A resposta <code>0110</code> retorna pelo mesmo caminho até o
          Adquirente.
        </li>
      </ol>

      <div className="callout-warning">
        <strong>Importante:</strong> Na autorização, o dinheiro ainda não mudou de mãos. A
        autorização apenas <em>reserva</em> o valor no limite do cliente, garantindo ao lojista que
        os fundos estão disponíveis.
      </div>

      <h3>A mensagem ISO 8583</h3>
      <p>
        O terminal transforma todos os dados em uma mensagem padronizada ISO 8583. Ela é composta
        por três partes fundamentais:
      </p>

      <h4>1. Message Type Indicator (MTI)</h4>
      <p>
        Um código de 4 dígitos que define a natureza da mensagem. Para uma autorização de compra, o
        MTI típico é <code>0100</code> (versão 1987) ou <code>1100</code> (versão 2003).
      </p>
      <table>
        <thead>
          <tr>
            <th>Dígito</th>
            <th>Significado</th>
            <th>Exemplo</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1º", "Versão do padrão", "0 = 1987, 1 = 1993, 2 = 2003"],
            ["2º", "Classe da mensagem", "1 = autorização, 2 = financeira, 4 = reversal"],
            ["3º", "Função", "0 = request, 1 = response, 2 = advice"],
            ["4º", "Origem", "0 = acquirer, 1 = acquirer repeat, 2 = issuer"],
          ].map(([d, s, e]) => (
            <tr key={d}>
              <td>{d}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{s}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{e}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Então <code>0100</code> = padrão 1987, classe autorização, request, originada pelo
        credenciador. E <code>0110</code> é a respectiva resposta do emissor.
      </p>

      <h4>2. Bitmap</h4>
      <p>
        Um mapa de bits (primário de 64 bits + secundário opcional de 64 bits) que indica quais Data
        Elements estão presentes na mensagem. Se o bit 2 está "ligado", o DE 2 (PAN) está presente.
        Isso permite que a mensagem seja variável e transporte apenas os campos relevantes.
      </p>

      <h4>3. Data Elements (DE) — campos principais</h4>
      <p>
        Dois campos merecem atenção especial no Brasil:
      </p>
      <ul>
        <li>
          <strong>DE 55:</strong> onde viaja o criptograma EMV (ARQC), o ATC, o TVR (Terminal
          Verification Results), o IAD (Issuer Application Data) e outras tags do chip — tudo
          serializado em TLV.
        </li>
        <li>
          <strong>DE 112 (Additional Data — National Use):</strong> o campo mais "estratégico" para
          o nosso mercado. É nele que viajam informações de parcelamento, consultas de CDC,
          identificação fiscal e outras especificidades nacionais.
        </li>
      </ul>

      {/* ── 5. Clearing & Settlement ──────────────────────────────────────── */}
      <h2>Fase 2: Clearing e Settlement</h2>

      <p>
        Esta é a fase em que a cobrança efetiva acontece, geralmente processada em lote (Batch).{" "}
        <strong>Sem ela, o lojista nunca recebe o dinheiro.</strong>
      </p>

      <h3>Envio do lote (Clearing)</h3>
      <p>
        Ao final do dia, o Adquirente agrupa todas as transações autorizadas em um arquivo no formato{" "}
        <strong>IPM (Integrated Product Messages)</strong> e o envia para a Mastercard. A mensagem
        principal é a <code>1240</code> (First Presentment). No Brasil, é obrigatório que cada
        transação contenha o CNPJ do estabelecimento no campo <code>PDS 0220</code>.
      </p>

      <h3>Janelas de processamento (Clearing Cycles)</h3>
      <p>
        O sistema global da Mastercard (GCMS) opera em <strong>6 ciclos de processamento diários</strong>,
        baseados no fuso horário de St. Louis (EUA). A estratégia do Adquirente para submeter os
        arquivos de clearing impacta diretamente sua liquidez diária.
      </p>

      <h3>Liquidação (Settlement)</h3>
      <p>
        Após processar o arquivo de clearing, a Mastercard calcula os valores devidos, desconta as
        taxas de intercâmbio (valor pago pelo Adquirente ao Emissor) e outras taxas da rede, e
        comanda a movimentação financeira. Finalmente, o Adquirente repassa o valor ao lojista
        conforme os prazos contratuais.
      </p>

      {/* ── 6. Segurança ──────────────────────────────────────────────────── */}
      <h2>Camadas de segurança</h2>

      <h3>EMV (Chip)</h3>
      <p>
        O chip gera um criptograma único para cada transação. Mesmo que os dados sejam
        interceptados, o criptograma não pode ser reutilizado — tornando a clonagem de cartões em
        transações presenciais praticamente impossível.
      </p>

      <h3>3-D Secure (Identity Check)</h3>
      <p>
        Protocolo que adiciona uma etapa de verificação no e-commerce, onde o Emissor autentica o
        portador (via app, biometria ou senha). Sua maior vantagem é o{" "}
        <strong>Liability Shift</strong>: quando a transação é autenticada com sucesso, a
        responsabilidade por um eventual chargeback de fraude é transferida do
        comerciante/Adquirente para o Emissor. A prova de autenticação viaja nos campos{" "}
        <code>DE 48.42/43</code> (UCAF). Os Adquirentes têm a obrigação de suportar a versão{" "}
        <strong>EMV 3DS 2.2</strong>.
      </p>

      <h3>Tokenização (MDES)</h3>
      <p>
        O <strong>MDES (Mastercard Digital Enablement Service)</strong> substitui o PAN real por um
        token digital exclusivo para aquele dispositivo ou comerciante. Em caso de vazamento de
        dados, apenas o token é exposto — inútil fora de seu contexto específico.
      </p>

      <div className="callout">
        <strong>Score de fraude:</strong> A Mastercard retorna na mensagem de autorização um score
        de fraude no campo <code>DE 48.75</code>, indicando a probabilidade de a transação ser
        criminosa — permitindo que o Adquirente aplique verificações extras se necessário.
      </div>

      {/* ── 7. Disputas ───────────────────────────────────────────────────── */}
      <h2>Ciclo de disputas (Chargeback)</h2>

      <p>
        O chargeback é um processo formal e regulado pela Bandeira para resolver desacordos entre
        portador e comerciante. Todo o ciclo é gerenciado pela plataforma <strong>MasterCom</strong>.
      </p>

      <h3>1. First Chargeback (1442)</h3>
      <p>
        O portador contata seu banco para contestar uma cobrança. O Emissor envia uma mensagem{" "}
        <code>1442</code> para o Adquirente, debitando imediatamente o valor da conta do Adquirente
        (que por sua vez o debita do lojista). A mensagem vem acompanhada de um código de motivo
        ("Fraude", "Mercadoria não Recebida", etc.).
      </p>

      <h3>2. Representação (Second Presentment — 1240)</h3>
      <p>
        O Adquirente notifica o lojista, que tem a oportunidade de se defender. Se possuir
        evidências (comprovante de entrega assinado, registro de login, dados de autenticação 3DS),
        o Adquirente reapresenta a transação usando a mensagem <code>1240</code> para reverter o
        chargeback.
      </p>

      <h3>3. Arbitragem</h3>
      <p>
        Se o Emissor não aceitar as evidências da representação, a disputa escala para arbitragem.
        A própria Mastercard atua como juiz, analisando as evidências de ambos os lados e emitindo
        uma decisão final e vinculante.
      </p>

      {/* ── 8. Programas de compliance ────────────────────────────────────── */}
      <h2>Programas de compliance</h2>

      <ul>
        <li>
          <strong>ECP (Excessive Chargeback Program):</strong> Monitora estabelecimentos com volume
          de chargebacks acima dos limites permitidos. O Adquirente é multado e obrigado a apresentar
          um plano de remediação.
        </li>
        <li>
          <strong>Monitoria de Lojistas (MM):</strong> Obriga o Adquirente a monitorar
          continuamente seus clientes para coibir venda de produtos ilegais e{" "}
          <em>Transaction Laundering</em> (lavagem de transações).
        </li>
        <li>
          <strong>QMR (Quarterly Mastercard Report):</strong> Relatório trimestral obrigatório com
          volumes, número de cartões e informações operacionais para cálculo de taxas e licenciamento.
        </li>
        <li>
          <strong>Integridade de dados:</strong> Enviar MCC, CEP ou CNPJ incorretos gera multas
          específicas. O <em>Clearing Optimizer</em> pré-valida os arquivos antes do envio oficial.
        </li>
      </ul>

      {/* ── 9. Especificidades BR ─────────────────────────────────────────── */}
      <h2>Especificidades técnicas locais ("jabuticabas")</h2>

      <h3>Parcelado Lojista</h3>
      <p>
        O "Parcelado Lojista" (sem juros) exige que o Adquirente informe o plano de pagamento
        completo em cada etapa. Na autorização, os dados viajam no <code>DE 112</code>. No clearing,
        no campo <code>PDS 0181</code>.
      </p>

      <h3>Crediário (CDC)</h3>
      <p>Crédito Direto ao Consumidor, onde o Emissor define a taxa de juros. O fluxo no Single Message é:</p>
      <ol>
        <li>
          <strong>Consulta (Inquiry):</strong> O terminal solicita planos de financiamento ao
          Emissor.
        </li>
        <li>
          <strong>Resposta:</strong> O Emissor retorna até 4 opções, com número de parcelas, valor,
          taxa e <strong>CET (Custo Efetivo Total)</strong> — obrigatório por lei.
        </li>
        <li>
          <strong>Efetivação (Purchase):</strong> O terminal envia a transação final com os dados do
          plano selecionado.
        </li>
      </ol>

      <h3>Pré-Datado (Post-Dated)</h3>
      <p>
        Funciona como um "cheque pré-datado eletrônico". A autorização ocorre no momento da venda,
        mas a liquidação é agendada para uma data futura acordada. Implementado inteiramente no
        fluxo de clearing via <code>PDS 0183 (Brazil Post-Dated Transaction Data)</code>.
      </p>

      <h3>CNPJ obrigatório</h3>
      <p>
        É mandatório que o Adquirente envie o CNPJ do estabelecimento em todas as transações
        financeiras. No Dual Message: campo <code>PDS 0220</code>. No Single Message:{" "}
        <code>DE 112</code> (subelemento 029 ou 042) ou <code>DE 124</code> subfield 1.
      </p>

      <h3>Vouchers e Flex Cards (PAT)</h3>
      <p>
        O Brasil possui um ecossistema de cartões de benefícios regulamentados pelo PAT. No arquivo
        de compensação, o <code>PDS 0027 (Flex Code)</code> é obrigatório para indicar qual
        benefício foi utilizado:
      </p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Produto</th>
            <th>Uso</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["MBM", "Mastercard Refeição (Meal)", "Restaurantes e lanchonetes"],
            ["MBF", "Mastercard Alimentação (Food)", "Supermercados e mercearias"],
            ["VP01", "Mastercard Pedágio (Toll)", "Pagamento em pedágios"],
          ].map(([code, product, use]) => (
            <tr key={code}>
              <td>{code}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{product}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Glossário ──────────────────────────────────────────────────────── */}
      <h2>Glossário — Sopa de Letrinhas</h2>

      <table>
        <thead>
          <tr>
            <th>Sigla</th>
            <th>Nome completo</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["MCC", "Merchant Category Code", "Código de 4 dígitos que define o ramo de atividade do lojista"],
            ["DE", "Data Element", "Campo de dados em mensagem ISO 8583"],
            ["PDS", "Private Data Subelement", "Campo de dados específico da Mastercard no arquivo de clearing"],
            ["ARN", "Acquirer Reference Number", "O 'RG' de uma transação: número único para rastreá-la em todo o ciclo de vida"],
            ["MIP", "Mastercard Interface Processor", "Servidor/conexão que liga o Adquirente à rede global da Mastercard"],
            ["GCMS", "Global Clearing Management System", "Sistema central da Mastercard que processa os arquivos de compensação"],
            ["MDES", "Mastercard Digital Enablement Service", "Serviço de tokenização para carteiras digitais"],
            ["ECP", "Excessive Chargeback Program", "Programa que monitora e multa adquirentes por comerciantes com excesso de disputas"],
            ["IPM", "Integrated Product Messages", "Formato padrão do arquivo em lote (batch) para clearing"],
            ["ICA", "Interbank Card Association", "Número de identificação único de uma instituição na rede Mastercard"],
          ].map(([sigla, nome, desc]) => (
            <tr key={sigla}>
              <td>{sigla}</td>
              <td style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)" }}>{nome}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ArticleLayout>
  );
}
