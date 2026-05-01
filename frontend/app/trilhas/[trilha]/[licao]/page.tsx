import { notFound } from "next/navigation";
import trilhasData from "@/data/trilhas.json";
import { LicaoLayout } from "@/components/LicaoLayout";
import type { Metadata } from "next";

// ─── Tipos locais ──────────────────────────────────────────────────────────────

type LicaoMeta = {
  id: string;
  titulo: string;
  descricao: string;
  tempo: string;
  tipo: string;
  termos?: string[];
  simulador?: { label: string; href: string };
};

type NavItem = { id: string; titulo: string; trilhaId: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findTrilha(slug: string) {
  return trilhasData.trilhas.find((t) => t.id === slug);
}

function flatLicoes(trilha: ReturnType<typeof findTrilha>): (LicaoMeta & { trilhaId: string })[] {
  if (!trilha) return [];
  return trilha.modulos.flatMap((m) =>
    m.licoes.map((l) => ({ ...(l as LicaoMeta), trilhaId: trilha.id }))
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ trilha: string; licao: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trilha: trilhaSlug, licao: licaoSlug } = await params;
  const trilha = findTrilha(trilhaSlug);
  if (!trilha) return { title: "Lição não encontrada" };
  const all = flatLicoes(trilha);
  const licao = all.find((l) => l.id === licaoSlug);
  if (!licao) return { title: "Lição não encontrada" };
  return {
    title: `${licao.titulo} — ${trilha.titulo} · VS Payments`,
    description: licao.descricao,
  };
}

export function generateStaticParams() {
  return trilhasData.trilhas.flatMap((t) =>
    t.modulos.flatMap((m) =>
      m.licoes.map((l) => ({ trilha: t.id, licao: l.id }))
    )
  );
}

// ─── Conteúdo das lições ──────────────────────────────────────────────────────

const CONTEUDO: Record<string, React.ReactNode> = {
  // ── Trilha 1: Do Zero ao Intercâmbio ─────────────────────────────────────

  atores: (
    <>
      <p>
        Toda transação de pagamento com cartão envolve, no mínimo, <strong>cinco participantes
        distintos</strong>. Cada um tem um papel específico — e entender quem faz o quê é o ponto
        de partida para qualquer coisa nesse mercado.
      </p>

      <h2>1. Portador do Cartão</h2>
      <p>
        É quem paga. Do ponto de vista técnico, o portador é representado pelo{" "}
        <strong>PAN (Primary Account Number)</strong> — o número de 16 dígitos no cartão — e pelos
        dados do chip EMV. O nome na frente do cartão importa pouco; o que o sistema vê é o PAN.
      </p>

      <h2>2. Estabelecimento Comercial (EC / Lojista)</h2>
      <p>
        O negócio que aceita o pagamento. Identificado por dois campos críticos na mensagem:
      </p>
      <ul>
        <li>
          <code>DE 42</code> — Merchant ID (código único do lojista)
        </li>
        <li>
          <code>DE 18</code> — MCC (Merchant Category Code), que define o tipo de negócio
        </li>
      </ul>
      <p>
        O MCC é mais importante do que parece: ele determina quais regras de intercâmbio se
        aplicam, se o lojista pode parcelar, e se aceita vouchers PAT.
      </p>

      <h2>3. Credenciador (Adquirente)</h2>
      <p>
        A empresa que <em>credenciou</em> o lojista — ou seja, assinou contrato com ele para aceitar
        cartões. No Brasil: Cielo, Rede, Stone, Getnet, PagSeguro, Pagsbank, entre dezenas de outros.
      </p>
      <p>O credenciador é responsável por:</p>
      <ul>
        <li>Capturar a transação no terminal POS ou gateway</li>
        <li>Montar e enviar a mensagem ISO 8583 para a bandeira</li>
        <li>Receber a resposta (aprovado / negado)</li>
        <li>Liquidar o valor ao lojista (descontando o MDR)</li>
        <li>Assumir o risco de crédito perante o EC</li>
      </ul>

      <div className="callout">
        <strong>Importante:</strong> O credenciador não é um banco no sentido tradicional. Ele é um
        intermediário financeiro que opera sob regulação do Banco Central, mas não capta depósitos.
        Quem tem o dinheiro do portador é o emissor.
      </div>

      <h2>4. Emissor</h2>
      <p>
        O banco ou instituição financeira que emitiu o cartão para o portador. É o emissor que:
      </p>
      <ul>
        <li>Conhece o portador, seu limite, score de risco e histórico</li>
        <li>Autoriza ou nega a transação em menos de 1 segundo</li>
        <li>Arca com prejuízos em caso de fraude não autenticada</li>
        <li>Recebe a taxa de intercâmbio como remuneração pelo risco</li>
      </ul>
      <p>
        Itaú, Bradesco, Nubank, C6, Inter, Caixa — todos são emissores quando você usa o cartão
        deles.
      </p>

      <h2>5. Bandeira (Card Network / Scheme)</h2>
      <p>
        Visa, Mastercard, Elo, Amex. A bandeira <strong>não empresta dinheiro</strong> — ela opera
        a rede que conecta credenciadores e emissores ao redor do mundo.
      </p>
      <p>Responsabilidades da bandeira:</p>
      <ul>
        <li>Definir as regras técnicas (mensageria, EMV, tokenização)</li>
        <li>Estabelecer as tabelas de intercâmbio</li>
        <li>Rotear a mensagem entre adquirente e emissor em milissegundos</li>
        <li>Aplicar penalidades a quem viola as regras (VAMP, ECP, MATCH)</li>
        <li>Gerir o clearing e coordenar o settlement</li>
      </ul>

      <h2>O 6º participante: Processador</h2>
      <p>
        Frequentemente esquecido, o processador é a empresa de tecnologia que opera a infraestrutura
        para emissores e/ou adquirentes. Fiserv, FIS, TSYS (Global Payments), CSU, Dock.
      </p>
      <p>
        Um banco emissor pode não ter equipe técnica para se conectar diretamente à rede Visa —
        ele contrata um processador que faz isso. O mesmo vale para adquirentes menores.
      </p>

      <h2>Como eles se conectam</h2>
      <div className="callout">
        <strong>Fluxo simplificado:</strong>
        <br />
        <code>Portador → Terminal do EC → Adquirente → Bandeira → Emissor</code>
        <br />
        <br />
        A resposta percorre o caminho inverso. Todo esse ciclo acontece em menos de 1.5 segundos.
        Na próxima lição, vamos ver exatamente o que circula nesse caminho.
      </div>
    </>
  ),

  "o-que-o-cartao-carrega": (
    <>
      <p>
        Quando você aproxima um cartão do terminal, o que está sendo transmitido? Muito mais do que
        um número. O cartão carrega um conjunto estruturado de dados que permite identificar o
        portador, o produto, o emissor e verificar autenticidade — tudo em milissegundos.
      </p>

      <h2>O PAN: Primary Account Number</h2>
      <p>
        O PAN é o número principal — aquele com 16 dígitos na frente do cartão. Não é aleatório:
        cada segmento tem significado.
      </p>

      <table>
        <thead>
          <tr>
            <th>Posição</th>
            <th>Nome</th>
            <th>O que informa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1º dígito</td>
            <td>MII (Major Industry Identifier)</td>
            <td>4 = Visa, 5 = Mastercard, 6 = Elo/Discover</td>
          </tr>
          <tr>
            <td>1–6 dígitos</td>
            <td>BIN (Bank Identification Number)</td>
            <td>Identifica emissor, bandeira e produto</td>
          </tr>
          <tr>
            <td>7–15 dígitos</td>
            <td>Account Number</td>
            <td>Número da conta do portador no emissor</td>
          </tr>
          <tr>
            <td>Último dígito</td>
            <td>Check digit (Luhn)</td>
            <td>Validação matemática do número</td>
          </tr>
        </tbody>
      </table>

      <h2>O BIN: o DNA do cartão</h2>
      <p>
        Os primeiros 6 dígitos (ou 8, no padrão IIN estendido adotado desde 2022) identificam o
        emissor, a bandeira e o tipo de produto. A partir do BIN, qualquer sistema sabe:
      </p>
      <ul>
        <li>Qual bandeira rotear (Visa, Mastercard, Elo)</li>
        <li>Qual emissor vai responder</li>
        <li>Se é crédito, débito ou pré-pago</li>
        <li>Qual produto (Classic, Platinum, Black, Corporativo)</li>
        <li>Se é nacional ou internacional</li>
      </ul>

      <div className="callout">
        <strong>Exemplo:</strong> BIN 516220 → Mastercard, Bradesco, Crédito, Produto Gold.
        O terminal sabe disso antes mesmo de transmitir qualquer dado para a bandeira.
      </div>

      <h2>CVV, CVV2 e CVC2</h2>
      <p>
        O código de verificação existe em dois lugares distintos, com valores diferentes:
      </p>
      <ul>
        <li>
          <strong>CVV / CVC1</strong>: gravado na tarja magnética. Usado em transações físicas com
          swipe. Nunca aparece na fatura.
        </li>
        <li>
          <strong>CVV2 / CVC2</strong>: impresso no verso do cartão (3 dígitos). Usado em
          transações CNP (e-commerce). Não fica armazenado nos sistemas do lojista por norma PCI.
        </li>
      </ul>
      <p>
        Se um atacante rouba o número do cartão mas não tem o CVV2, a transação online tende a ser
        negada — por isso ele é impresso, não armazenado.
      </p>

      <h2>Chip EMV</h2>
      <p>
        EMV (Europay, Mastercard, Visa) é o padrão global para cartões com chip. O chip armazena:
      </p>
      <ul>
        <li>O PAN (igual ao embossado)</li>
        <li>Chaves criptográficas para gerar o <strong>ARQC</strong> (código único por transação)</li>
        <li>Contadores de transação (TAC, ATC)</li>
        <li>Regras offline de risco (CDOL, TDOL)</li>
      </ul>
      <p>
        A grande vantagem do chip: cada transação gera um código criptográfico único (ARQC) que o
        emissor valida. Mesmo que alguém copie os dados, não consegue clonar o chip — o código
        seguinte seria inválido.
      </p>

      <h2>Tokenização: o DPAN</h2>
      <p>
        Quando você adiciona um cartão ao Apple Pay ou Google Pay, o número real (PAN) não é
        armazenado no celular. Em vez disso, uma rede de tokenização (Visa Token Service ou
        Mastercard MDES) gera um <strong>DPAN (Device PAN)</strong> — um número substituto, válido
        apenas para aquele dispositivo.
      </p>
      <p>
        Na transação, o DPAN vai para a bandeira, que faz a "destokenização" e repassa o PAN
        real ao emissor. O lojista nunca vê o número verdadeiro.
      </p>

      <div className="callout">
        <strong>Por que importa?</strong> O produto do cartão (derivado do BIN) é um dos
        principais inputs para o cálculo do intercâmbio. Um Visa Infinite paga taxa diferente de
        um Visa Classic no mesmo estabelecimento. Na próxima lição, você vai ver como esse dado
        percorre a mensagem de autorização.
      </div>
    </>
  ),

  autorizacao: (
    <>
      <p>
        Você aproxima o cartão. Em menos de 1.5 segundos, a compra é aprovada ou negada. O que
        acontece nesse intervalo é uma das operações mais sofisticadas do sistema financeiro —
        mensagens padronizadas cruzando no mínimo quatro sistemas distintos, com validações em
        paralelo.
      </p>

      <h2>ISO 8583: a língua do pagamento</h2>
      <p>
        Todas as mensagens de autorização seguem o padrão <strong>ISO 8583</strong>. É um protocolo
        binário (ou ASCII, dependendo da implementação) que define exatamente quais campos existem,
        em qual posição, com qual tamanho.
      </p>
      <p>
        A estrutura básica de uma mensagem ISO 8583:
      </p>
      <table>
        <thead>
          <tr>
            <th>Componente</th>
            <th>O que é</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>MTI (Message Type Indicator)</td>
            <td>4 dígitos que definem o tipo e direção da mensagem</td>
          </tr>
          <tr>
            <td>Bitmap</td>
            <td>Mapa binário indicando quais Data Elements (DEs) estão presentes</td>
          </tr>
          <tr>
            <td>Data Elements (DEs)</td>
            <td>Os campos com os dados reais da transação</td>
          </tr>
        </tbody>
      </table>

      <h2>MTI: quatro dígitos que dizem tudo</h2>
      <p>
        O MTI identifica a mensagem. Os mais comuns em autorização:
      </p>
      <ul>
        <li><code>0100</code> — Authorization Request (adquirente → bandeira → emissor)</li>
        <li><code>0110</code> — Authorization Response (emissor → bandeira → adquirente)</li>
        <li><code>0400</code> — Reversal Request</li>
        <li><code>0800</code> — Network Management (heartbeat, echo)</li>
      </ul>

      <h2>Os campos que importam (DEs-chave)</h2>
      <table>
        <thead>
          <tr>
            <th>DE</th>
            <th>Nome</th>
            <th>Exemplo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DE 2</td>
            <td>PAN</td>
            <td>5162201234567890</td>
          </tr>
          <tr>
            <td>DE 4</td>
            <td>Transaction Amount</td>
            <td>000000010000 (R$ 100,00)</td>
          </tr>
          <tr>
            <td>DE 18</td>
            <td>Merchant Category Code (MCC)</td>
            <td>5812 (restaurante)</td>
          </tr>
          <tr>
            <td>DE 22</td>
            <td>POS Entry Mode</td>
            <td>051 (chip + PIN)</td>
          </tr>
          <tr>
            <td>DE 37</td>
            <td>Retrieval Reference Number</td>
            <td>ID único da transação</td>
          </tr>
          <tr>
            <td>DE 39</td>
            <td>Response Code</td>
            <td>00 = aprovado</td>
          </tr>
          <tr>
            <td>DE 41</td>
            <td>Terminal ID</td>
            <td>ID do POS</td>
          </tr>
          <tr>
            <td>DE 42</td>
            <td>Merchant ID</td>
            <td>ID do lojista no adquirente</td>
          </tr>
        </tbody>
      </table>

      <h2>O fluxo passo a passo</h2>

      <h3>1. Captura (0–200ms)</h3>
      <p>
        O terminal lê o chip, coleta o PIN se necessário, monta a mensagem 0100 e a envia ao
        adquirente via rede dedicada (VPN, MPLS ou internet). O ARQC do chip é incluído no
        DE 55.
      </p>

      <h3>2. Roteamento no Adquirente (200–400ms)</h3>
      <p>
        O adquirente recebe o 0100, valida o formato, enriquece com dados próprios (MDR,
        parcelamento) e roteia para a bandeira correta com base no BIN.
      </p>

      <h3>3. Rede da Bandeira (400–700ms)</h3>
      <p>
        A bandeira recebe e valida: BIN existe? Emissor está ativo? Aplica regras
        de roteamento inteligente (para redundância). Repassa ao emissor.
      </p>

      <h3>4. Decisão do Emissor (700–1200ms)</h3>
      <p>
        O emissor — ou seu processador — verifica:
      </p>
      <ul>
        <li>Limite disponível</li>
        <li>Cartão não bloqueado</li>
        <li>Score de risco (engine antifraude)</li>
        <li>ARQC válido (autenticidade do chip)</li>
        <li>Regras de uso (país, MCC, valor)</li>
      </ul>
      <p>
        Resultado: <code>DE 39 = 00</code> (aprovado) ou código de negativa (51 = saldo
        insuficiente, 05 = não honre, 14 = cartão inválido, etc.).
      </p>

      <h3>5. Retorno (1200–1500ms)</h3>
      <p>
        A mensagem 0110 percorre o caminho inverso: emissor → bandeira → adquirente → terminal.
        O terminal exibe "Aprovado" ou "Negado".
      </p>

      <div className="callout">
        <strong>Dual Message vs Single Message:</strong> O que acabamos de descrever é o modelo{" "}
        <em>Dual Message</em> (usado por Mastercard e Visa em crédito): a autorização e o
        clearing são mensagens separadas. No modelo{" "}
        <em>Single Message</em> (débito, Maestro), autorização e liquidação financeira acontecem
        na mesma mensagem. Na próxima lição, veremos o que acontece depois da aprovação.
      </div>
    </>
  ),

  "clearing-e-settlement": (
    <>
      <p>
        A autorização aprovou a compra — mas o dinheiro ainda não se moveu. A aprovação é apenas
        uma <em>promessa</em>. O dinheiro de fato se transfere durante o{" "}
        <strong>clearing</strong> e o <strong>settlement</strong>, que acontecem horas ou dias
        depois.
      </p>

      <h2>O que é Clearing</h2>
      <p>
        Clearing é o processo de <strong>compensação</strong>: todos os adquirentes e emissores
        trocam os registros de transações do dia para descobrir quem deve quanto a quem.
      </p>
      <p>
        Imagine que o Emissor X aprovou 50.000 transações do Adquirente A hoje. Em vez de fazer
        50.000 transferências individuais, eles fazem o clearing e chegam a um único número líquido.
      </p>

      <h2>Base II (Mastercard) e IPM (Visa)</h2>
      <p>
        Cada bandeira tem seu próprio sistema de clearing:
      </p>
      <ul>
        <li>
          <strong>Base II</strong> (Mastercard): arquivo batch enviado até 3x ao dia.
          As transações são submetidas em TC (Transaction Code). TC01 = compra, TC05 =
          chargeback, TC33 = ajuste.
        </li>
        <li>
          <strong>IPM — Integrated Payment System</strong> (Visa): arquivo VCF (Visa Clearing File)
          com os registros de clearing. Suporta transações domésticas e internacionais.
        </li>
      </ul>

      <div className="callout">
        <strong>Prazo de submissão:</strong> O adquirente tem um prazo (geralmente 1–5 dias
        corridos) para submeter a transação ao clearing após a autorização. Se não submeter no
        prazo, pode perder o direito de receber — e ainda ser penalizado pela bandeira. Esse
        prazo é chamado de <em>timeliness</em>.
      </div>

      <h2>O que é Settlement</h2>
      <p>
        Settlement é a <strong>liquidação financeira efetiva</strong> — a transferência real do
        dinheiro entre as partes. No Brasil, o ciclo principal:
      </p>
      <table>
        <thead>
          <tr>
            <th>Participante</th>
            <th>Recebe / Paga</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Emissor</td>
            <td>Recebe taxa de intercâmbio</td>
            <td>D+1 (dia seguinte)</td>
          </tr>
          <tr>
            <td>Bandeira</td>
            <td>Recebe fee de processamento</td>
            <td>D+1</td>
          </tr>
          <tr>
            <td>Adquirente</td>
            <td>Recebe valor bruto, paga intercâmbio + fee</td>
            <td>D+1</td>
          </tr>
          <tr>
            <td>Lojista</td>
            <td>Recebe valor líquido (descontado MDR)</td>
            <td>D+1 a D+30 (depende do contrato)</td>
          </tr>
        </tbody>
      </table>

      <h2>CIP: Câmara Interbancária de Pagamentos</h2>
      <p>
        No Brasil, o settlement entre adquirentes e emissores passa pela{" "}
        <strong>CIP (Câmara Interbancária de Pagamentos)</strong>, que é a câmara de compensação
        regulada pelo Banco Central. A CIP garante que o netting (compensação líquida) seja feito
        com segurança e que todos os participantes sejam liquidados mesmo em caso de
        inadimplência de um participante (garantia via FGC e colateral).
      </p>

      <h2>O ciclo completo resumido</h2>
      <div className="callout">
        <strong>D+0:</strong> Portador faz a compra → Autorização aprovada em 1.5s. Nenhum
        dinheiro se move.
        <br /><br />
        <strong>D+1:</strong> Adquirente submete o clearing ao Base II / IPM. A bandeira processa
        e calcula o net position de cada participante. CIP liquida o interbancário.
        <br /><br />
        <strong>D+1 ao D+30:</strong> Lojista recebe o valor líquido na conta (prazo varia por
        contrato com o adquirente).
        <br /><br />
        <strong>30 dias depois:</strong> Começa a janela de chargeback — o portador pode contestar
        a compra até ~120 dias, dependendo do motivo.
      </div>

      <p>
        Com isso, o ciclo básico está completo. Mas quanto cada um ganha? É aqui que entra o
        intercâmbio — o assunto da próxima lição.
      </p>
    </>
  ),

  intercambio: (
    <>
      <p>
        Toda vez que um portador usa o cartão, uma taxa flui silenciosamente entre os bastidores.
        Essa taxa é o <strong>intercâmbio</strong> — e entender como ela funciona é entender a
        economia de todo o mercado de cartões.
      </p>

      <h2>Definição</h2>
      <p>
        Intercâmbio é a taxa paga pelo <strong>Adquirente ao Emissor</strong> como compensação
        pelo risco e pelos custos que o emissor assume ao aprovar a transação.
      </p>
      <div className="callout">
        <strong>Fluxo financeiro:</strong>
        <br />
        Portador paga R$ 100 ao lojista.
        <br />
        Lojista recebe R$ 98 (descontado o MDR de 2%).
        <br />
        Adquirente repassa ao Emissor ~R$ 1,50 de intercâmbio.
        <br />
        Adquirente fica com ~R$ 0,50 de margem.
        <br />
        Bandeira cobra ~R$ 0,05 de fee de processamento.
      </div>

      <h2>Por que o intercâmbio existe?</h2>
      <p>
        O emissor assume riscos e custos que ninguém mais assume:
      </p>
      <ul>
        <li>
          <strong>Crédito:</strong> em cartão de crédito, o emissor está emprestando dinheiro
          ao portador. Se o portador não pagar, o emissor perde — não o lojista.
        </li>
        <li>
          <strong>Fraude:</strong> se o cartão for fraudado e a transação não tiver autenticação
          adequada, o emissor absorve o prejuízo.
        </li>
        <li>
          <strong>Benefícios:</strong> milhas, cashback, seguro de viagem — o emissor financia
          tudo isso com a receita de intercâmbio.
        </li>
        <li>
          <strong>Infraestrutura:</strong> manter sistemas 24/7 autorizando em milissegundos
          não é barato.
        </li>
      </ul>

      <h2>Quem define as taxas?</h2>
      <p>
        A <strong>bandeira</strong> (Visa, Mastercard, Elo) publica as tabelas de intercâmbio.
        São tabelas complexas com centenas de regras — o valor exato depende de:
      </p>
      <ul>
        <li><strong>Produto do cartão:</strong> Classic, Platinum, Infinite, Corporate</li>
        <li><strong>Canal:</strong> físico (POS), contactless, e-commerce, e-commerce com 3DS</li>
        <li><strong>MCC do lojista:</strong> supermercado tem taxa diferente de restaurante</li>
        <li><strong>Número de parcelas:</strong> à vista vs. parcelado</li>
        <li><strong>Pessoa:</strong> PF vs. PJ</li>
        <li><strong>Autenticação:</strong> com ou sem 3DS</li>
      </ul>

      <h2>IRD: o código da regra</h2>
      <p>
        Cada combinação de critérios leva a um <strong>IRD (Interchange Rate Designator)</strong>
        — o código que identifica qual taxa se aplica. Para Mastercard:
      </p>
      <ul>
        <li><code>IA</code> — Consumer Card Present (compra física padrão)</li>
        <li><code>HU</code> — Consumer Card Not Present sem autenticação</li>
        <li><code>AU</code> — Consumer Card Not Present com 3DS autenticado</li>
        <li><code>JA</code> — Consumer Contactless</li>
      </ul>
      <p>
        Para Visa, a lógica é parecida mas usa outros identificadores (PID, AFS, ECI) — assunto da
        trilha de Intercâmbio Técnico.
      </p>

      <div className="callout">
        <strong>Escala:</strong> O mercado brasileiro movimentou R$ 4,1 trilhões em cartões em
        2024. Com taxas de intercâmbio entre 0.5% e 2.5%, estamos falando de dezenas de bilhões
        de reais transferidos de adquirentes para emissores anualmente. É a maior fonte de receita
        dos bancos no segmento de cartões.
      </div>
    </>
  ),

  "mdr-e-custos": (
    <>
      <p>
        O lojista paga uma taxa sobre cada venda. Essa taxa é o <strong>MDR (Merchant Discount
        Rate)</strong>. Mas o MDR não vai inteiro para nenhum participante — ele é distribuído
        entre três camadas, cada uma com seu custo e justificativa.
      </p>

      <h2>A equação do MDR</h2>
      <div className="callout">
        <strong>MDR = Intercâmbio + Fee de Bandeira + Margem do Adquirente</strong>
        <br /><br />
        Exemplo para um cartão Visa Platinum, e-commerce com 3DS, restaurante:
        <br />
        Intercâmbio: 1,50%
        <br />
        Fee Bandeira: 0,10%
        <br />
        Margem Adquirente: 0,40%
        <br />
        <strong>MDR total: 2,00%</strong>
      </div>

      <h2>Cada camada</h2>

      <h3>1. Intercâmbio (~60–80% do MDR)</h3>
      <p>
        A maior fatia. Vai direto para o emissor. Fixado pela bandeira — o adquirente não negocia
        isso. É o custo estrutural, o "piso" do MDR.
      </p>

      <h3>2. Fee de Bandeira (~5–10% do MDR)</h3>
      <p>
        A bandeira cobra pelo uso da rede: roteamento, clearing, garantias, compliance. Geralmente
        0,05% a 0,15% dependendo da bandeira e do volume do adquirente.
      </p>

      <h3>3. Margem do Adquirente (~15–30% do MDR)</h3>
      <p>
        O que o adquirente retém para pagar seus custos operacionais e ter lucro: infraestrutura,
        atendimento, risco de crédito perante o lojista, custo de funding (para o adiantamento
        de recebíveis).
      </p>

      <h2>Por que o MDR varia?</h2>
      <p>
        O MDR não é fixo. O adquirente pode variar a margem conforme:
      </p>
      <ul>
        <li>Volume do lojista (quem vende mais paga menos)</li>
        <li>Segmento (supermercado negocia muito mais que restaurante pequeno)</li>
        <li>Risco do negócio (e-commerce paga mais que físico)</li>
        <li>Prazo de recebimento (antecipação de recebíveis tem custo financeiro)</li>
      </ul>
      <p>
        O intercâmbio, porém, é o mesmo para todos os adquirentes — isso é o que garante a
        competição no mercado. Nenhum adquirente consegue ter vantagem estrutural na camada de
        intercâmbio.
      </p>

      <h2>MDR no parcelamento</h2>
      <p>
        Quando o lojista oferece parcelamento, a complexidade aumenta. O adquirente paga o
        intercâmbio integral na hora (como se fosse uma transação de crédito normal), mas o
        portador vai pagando parcelado ao emissor ao longo dos meses.
      </p>
      <p>
        Isso cria um custo de <em>carregamento de prazo</em> para o adquirente — que geralmente
        é repassado ao lojista via MDR maior ou taxa de parcelamento separada.
      </p>

      <div className="callout">
        <strong>Resumo da trilha:</strong> Você agora entende o ciclo completo. Portador →
        autorização → clearing → settlement → e a distribuição financeira via MDR. A próxima
        trilha — Intercâmbio Técnico — mergulha na mecânica exata de como a taxa é calculada
        para cada cenário.
      </div>
    </>
  ),

// ─── Trilha 2: Intercâmbio Técnico ───────────────────────────────────────────

  "como-a-taxa-e-determinada": (
    <>
      <p>
        Não existe "uma taxa de intercâmbio". Existe uma <strong>regra</strong> que, dado um
        conjunto de atributos da transação, retorna a taxa correta. Entender quais atributos
        importam é a chave para prever custos e entender por que a mesma compra pode ter taxas
        muito diferentes.
      </p>

      <h2>Os 5 fatores que determinam a taxa</h2>

      <h3>1. Produto do cartão</h3>
      <p>
        Um cartão Visa Infinite e um Visa Classic têm taxas completamente diferentes. O produto
        é identificado pelo <strong>BIN</strong> — e dentro da mensagem de clearing, pelo{" "}
        <strong>PID (Product ID)</strong> para Visa ou pelo <strong>PROD_ID</strong> para Mastercard.
      </p>
      <table>
        <thead><tr><th>Produto</th><th>Bandeira</th><th>Identificador</th><th>Tier típico</th></tr></thead>
        <tbody>
          <tr><td>Classic</td><td>Visa</td><td>PID: F^</td><td>Básico</td></tr>
          <tr><td>Platinum</td><td>Visa</td><td>PID: N^</td><td>Premium</td></tr>
          <tr><td>Infinite</td><td>Visa</td><td>PID: I^</td><td>Super-premium</td></tr>
          <tr><td>Standard</td><td>Mastercard</td><td>IRD: IA / tier standard</td><td>Básico</td></tr>
          <tr><td>Black</td><td>Mastercard</td><td>IRD: IA / tier black</td><td>Super-premium</td></tr>
        </tbody>
      </table>

      <h3>2. Canal da transação</h3>
      <p>
        O canal determina risco — e risco determina taxa. Uma compra no POS com chip é mais segura
        que uma compra online sem autenticação. Por isso, a taxa varia:
      </p>
      <ul>
        <li><strong>Físico com chip</strong> — menor risco, menor taxa</li>
        <li><strong>Contactless</strong> — similar ao chip</li>
        <li><strong>E-commerce sem 3DS</strong> — maior risco, maior taxa</li>
        <li><strong>E-commerce com 3DS autenticado</strong> — risco reduzido, taxa menor que CNP padrão</li>
        <li><strong>QR Code</strong> — regras específicas</li>
      </ul>

      <h3>3. MCC do lojista</h3>
      <p>
        O Merchant Category Code define o tipo de negócio. Bandeiras criam "segmentos" de MCC com
        taxas específicas: supermercados (MCC 5411) costumam ter taxas promocionais para estimular
        uso em compras do dia a dia. Postos de combustível (5541) têm regras próprias pelo risco
        de fraude mais alto.
      </p>

      <h3>4. Tipo de transação (crédito, débito, parcelado)</h3>
      <p>
        Crédito à vista, crédito parcelado, débito e pré-pago têm IRDs distintos. O parcelamento
        cria um custo de carregamento de prazo que eleva a taxa.
      </p>

      <h3>5. Autenticação</h3>
      <p>
        Transações autenticadas via 3DS (ECI 05 ou 06) recebem taxas melhores. O emissor assume
        parte do risco de fraude quando o portador é autenticado — e a bandeira precifica isso.
      </p>

      <div className="callout">
        <strong>Resumo prático:</strong> A mesma compra de R$ 200 num restaurante pode ter taxas
        muito diferentes dependendo se o cartão é Classic ou Black, se o canal é físico ou
        e-commerce, e se houve autenticação 3DS. O motor do simulador aplica exatamente essa
        lógica — na próxima lição você verá como ele avalia as regras em cascata.
      </div>
    </>
  ),

  "cascata-de-regras": (
    <>
      <p>
        As tabelas de intercâmbio têm centenas de regras. Como o sistema decide qual aplicar?
        Por <strong>cascata de prioridade</strong> (waterfall): as regras são avaliadas do mais
        específico ao mais genérico, e a primeira que casar com os atributos da transação vence.
      </p>

      <h2>O que é uma regra</h2>
      <p>
        Cada linha da tabela de intercâmbio é uma regra com:
      </p>
      <ul>
        <li><strong>Condições</strong>: combinação de atributos que precisam ser verdadeiros</li>
        <li><strong>Prioridade</strong>: número que define a ordem de avaliação</li>
        <li><strong>IRD / Descriptor</strong>: o identificador da categoria de intercâmbio</li>
        <li><strong>Taxa</strong>: percentual e/ou valor fixo</li>
      </ul>

      <h2>Exemplo de cascata Mastercard</h2>
      <p>
        Para uma compra de crédito no POS, o motor avalia as regras nesta ordem (da mais
        específica para a mais genérica):
      </p>
      <table>
        <thead><tr><th>Prioridade</th><th>Condição</th><th>IRD</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Contactless + MCC Supermercado + PF</td><td>JA (Supermarket)</td></tr>
          <tr><td>2</td><td>Contactless + PF</td><td>JA (Consumer)</td></tr>
          <tr><td>3</td><td>Físico + MCC Supermercado + PF</td><td>IA (Supermarket)</td></tr>
          <tr><td>4</td><td>Físico + PF + Crédito</td><td>IA (Consumer)</td></tr>
          <tr><td>5</td><td>Físico + PJ</td><td>IA (Commercial)</td></tr>
          <tr><td>...</td><td>...</td><td>...</td></tr>
          <tr><td>N</td><td>Qualquer transação doméstica</td><td>IA (Default)</td></tr>
        </tbody>
      </table>
      <p>
        A transação vai descendo até a primeira regra que casar. Se nenhuma casar, é um erro —
        o que na prática não acontece porque há sempre uma regra "catch-all" no final.
      </p>

      <h2>O modo debug no simulador</h2>
      <p>
        O simulador desta plataforma tem um modo <strong>debug</strong> que expõe toda essa
        cascata. Ao ativar, você vê:
      </p>
      <ul>
        <li>Quais regras foram testadas (em ordem)</li>
        <li>Quais falharam e por quê</li>
        <li>Qual regra casou primeiro</li>
        <li>O IRD e a taxa resultante</li>
      </ul>

      <h2>Por que isso importa na prática</h2>
      <div className="callout">
        <strong>Exemplo real:</strong> Um lojista de supermercado (MCC 5411) ativa pagamento por
        aproximação. Antes, as transações dele caíam na regra genérica IA a 1,2%. Com
        contactless, elas passam a cair na regra JA Supermarket a 0,9%. O mesmo cartão, o mesmo
        lojista — canal diferente, regra diferente, taxa diferente.
      </div>
      <p>
        Entender a cascata permite ao adquirente:
      </p>
      <ul>
        <li>Prever o custo de intercâmbio antes de precificar o MDR</li>
        <li>Identificar por que a taxa de um lojista aumentou após uma mudança de terminal</li>
        <li>Auditar se os campos enviados na mensagem estão corretos</li>
      </ul>
    </>
  ),

  "irds-mastercard": (
    <>
      <p>
        Na Mastercard, cada categoria de intercâmbio tem um código de duas letras chamado{" "}
        <strong>IRD (Interchange Rate Designator)</strong>. É o IRD que entra na tabela de taxas
        para buscar o percentual exato. Entender os principais IRDs é entender como a Mastercard
        categoriza transações.
      </p>

      <h2>IRDs de base: a família IA</h2>
      <p>
        <code>IA</code> é o IRD padrão para compras físicas com cartão de crédito no Brasil. A
        maioria das compras presenciais cai aqui. A taxa varia conforme o <strong>tier</strong>{" "}
        (produto do cartão) e o <strong>segmento de MCC</strong>:
      </p>
      <table>
        <thead><tr><th>Tier</th><th>Segmento Base</th><th>Taxa típica</th></tr></thead>
        <tbody>
          <tr><td>Consumer standard</td><td>Base</td><td>~1,1%</td></tr>
          <tr><td>Consumer gold</td><td>Base</td><td>~1,3%</td></tr>
          <tr><td>Consumer platinum</td><td>Base</td><td>~1,5%</td></tr>
          <tr><td>Consumer black</td><td>Base</td><td>~1,7%</td></tr>
        </tbody>
      </table>

      <h2>IRDs de ajuste: HU, AU e família H/A</h2>
      <p>
        Para transações <strong>CNP (Card Not Present)</strong> — e-commerce — existem IRDs
        específicos que partem da taxa IA e somam um <em>ajuste</em> de risco:
      </p>
      <ul>
        <li>
          <code>HU</code> — CNP sem autenticação. Adiciona um spread sobre IA por conta do
          risco maior.
        </li>
        <li>
          <code>AU / AV / AW</code> — CNP com 3DS autenticado (Frictionless ou com desafio).
          Ajuste menor ou nulo, pois o risco foi mitigado.
        </li>
        <li>
          <code>HV / HW</code> — CNP com tentativa de autenticação mas sem sucesso completo.
        </li>
      </ul>

      <div className="callout">
        <strong>Fórmula dos IRDs de ajuste:</strong><br />
        Taxa final = Taxa IA (tier + segmento) + Ajuste do IRD CNP<br /><br />
        Exemplo: IA Consumer platinum = 1,5% + HU ajuste = +0,5% → <strong>2,0% total</strong><br />
        Mas: IA Consumer platinum = 1,5% + AU ajuste = +0,1% → <strong>1,6% total</strong><br />
        Ou seja, autenticar com 3DS economiza 0,4 p.p. nesse cenário.
      </div>

      <h2>IRDs contactless: família JA</h2>
      <p>
        <code>JA</code> (e <code>JV / JW</code> para parcelado contactless) é o IRD de compras
        presenciais por aproximação (NFC/PayPass). Geralmente tem taxa igual ou ligeiramente
        inferior ao IA, pois o risco de fraude é menor.
      </p>

      <h2>IRDs parcelados: família IV / IW</h2>
      <p>
        Para compras parceladas no POS (<code>IV</code> para físico, <code>IW</code> para
        parcelado com mais parcelas), existe um ajuste adicional sobre IA que reflete o custo
        de carregamento do prazo.
      </p>

      <h2>Outros IRDs relevantes</h2>
      <table>
        <thead><tr><th>IRD</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td>IA</td><td>Compra física padrão (base de tudo)</td></tr>
          <tr><td>HU</td><td>E-commerce sem autenticação</td></tr>
          <tr><td>AU/AV/AW</td><td>E-commerce com 3DS autenticado</td></tr>
          <tr><td>JA</td><td>Contactless</td></tr>
          <tr><td>IV/IW</td><td>Parcelado físico</td></tr>
          <tr><td>QA</td><td>QR Code</td></tr>
          <tr><td>DA</td><td>Débito</td></tr>
        </tbody>
      </table>
    </>
  ),

  "tiers-e-segmentos": (
    <>
      <p>
        Dentro de um mesmo IRD, a taxa não é única — ela varia por <strong>tier</strong> (produto
        do cartão) e <strong>segmento de MCC</strong>. Esses dois eixos formam a grade de onde
        a taxa é realmente lida.
      </p>

      <h2>Tiers de produto</h2>
      <p>
        A Mastercard agrupa os produtos em quatro tiers de consumer e categorias comerciais:
      </p>
      <table>
        <thead><tr><th>Tier</th><th>Produtos típicos</th></tr></thead>
        <tbody>
          <tr><td>Consumer standard</td><td>Classic, básico, pré-pago</td></tr>
          <tr><td>Consumer gold</td><td>Gold, intermediário</td></tr>
          <tr><td>Consumer platinum</td><td>Platinum</td></tr>
          <tr><td>Consumer black</td><td>Black, Infinite, Elite, Signature</td></tr>
          <tr><td>Commercial</td><td>Cartões PJ, corporate, frota</td></tr>
        </tbody>
      </table>
      <p>
        O tier é determinado pelo <strong>BIN</strong> do cartão — o adquirente identifica o
        tier quando o portador apresenta o cartão. Na mensagem de clearing MC (IPM), o tier
        aparece codificado em campos PDS.
      </p>

      <h2>Segmentos de MCC</h2>
      <p>
        A Mastercard agrupa MCCs em segmentos com tratamento tarifário diferenciado:
      </p>
      <table>
        <thead><tr><th>Segmento</th><th>MCCs incluídos</th><th>Lógica</th></tr></thead>
        <tbody>
          <tr><td>Supermarket (SPR_MKT)</td><td>5411, 5422, 5451, 5499</td><td>Taxa reduzida para uso cotidiano</td></tr>
          <tr><td>Wholesale (WHOLE)</td><td>5300, 5199, 5912</td><td>Atacado e farmácia</td></tr>
          <tr><td>Micro Merchant (MM)</td><td>742, 1799, 5697, 7230…</td><td>Pequenos negócios</td></tr>
          <tr><td>Government (GOV_SVC)</td><td>9311, 9222, 9399</td><td>Serviços públicos</td></tr>
          <tr><td>Lottery (LOT)</td><td>9406</td><td>Loteria — com teto (cap)</td></tr>
          <tr><td>Base</td><td>Todos os demais</td><td>Regra padrão</td></tr>
        </tbody>
      </table>

      <h2>Como os dois eixos se combinam</h2>
      <p>
        A tabela de taxas é uma grade <code>IRD × Tier × Segmento</code>. Para buscar a taxa:
      </p>
      <ol>
        <li>O motor encontra o IRD via cascata de regras</li>
        <li>Identifica o tier pelo BIN do cartão</li>
        <li>Identifica o segmento pelo MCC do lojista</li>
        <li>Faz o lookup: <code>taxa = tabela[IRD][tier][segmento]</code></li>
      </ol>

      <div className="callout">
        <strong>Fallback de segmento:</strong> Se não existir taxa para o segmento exato, o
        motor tenta "Other" e depois "Base". Na prática, "Base" sempre existe — é o segmento
        default que cobre todos os MCCs não mapeados explicitamente.
      </div>

      <h2>Impacto prático</h2>
      <p>
        Um cartão Black (Consumer black) num supermercado (SPR_MKT) com contactless (JA) pode
        ter taxa de 1,1% — enquanto o mesmo cartão Black num restaurante (Base) tem 1,7%. O
        emissor recebe menos na compra do supermercado porque a bandeira quis estimular o uso
        de cartão no varejo alimentar.
      </p>
    </>
  ),

  "pid-e-afs": (
    <>
      <p>
        A Visa usa uma lógica diferente da Mastercard para identificar transações. Em vez de um
        IRD binário, a Visa usa dois campos principais: <strong>PID</strong> e <strong>AFS</strong>,
        que em conjunto com outros atributos determinam qual regra de intercâmbio se aplica.
      </p>

      <h2>PID: Product Identifier</h2>
      <p>
        O PID é um código de dois caracteres que identifica o produto do cartão Visa. Ele aparece
        no arquivo de clearing VSS (Visa Settlement Service) e no arquivo VCF.
      </p>
      <table>
        <thead><tr><th>PID</th><th>Produto</th><th>Equivalente MC</th></tr></thead>
        <tbody>
          <tr><td>F^</td><td>Visa Classic / Consumer básico</td><td>Consumer standard</td></tr>
          <tr><td>P^</td><td>Visa Gold</td><td>Consumer gold</td></tr>
          <tr><td>N^</td><td>Visa Platinum</td><td>Consumer platinum</td></tr>
          <tr><td>I^</td><td>Visa Infinite</td><td>Consumer black</td></tr>
          <tr><td>I1</td><td>Visa Infinite HNW (High Net Worth)</td><td>Consumer black premium</td></tr>
          <tr><td>C^</td><td>Visa Signature</td><td>Consumer black</td></tr>
          <tr><td>K^</td><td>Visa Business</td><td>Commercial</td></tr>
          <tr><td>S^</td><td>Visa Corporate</td><td>Corporate</td></tr>
          <tr><td>S6</td><td>Visa BNDES</td><td>—</td></tr>
          <tr><td>J3</td><td>Visa Vale</td><td>—</td></tr>
          <tr><td>L^</td><td>Visa Electron (débito)</td><td>—</td></tr>
        </tbody>
      </table>

      <h2>AFS: Account Funding Source</h2>
      <p>
        AFS indica o tipo de conta que financia a transação:
      </p>
      <ul>
        <li><code>C</code> — Credit (crédito)</li>
        <li><code>D</code> — Debit (débito)</li>
        <li><code>P</code> — Prepaid (pré-pago)</li>
      </ul>
      <p>
        AFS é crítico porque crédito e débito têm tabelas de intercâmbio completamente separadas.
        Um cartão Visa Platinum débito tem taxa completamente diferente do Platinum crédito.
      </p>

      <h2>SETTL_FLAG: doméstico vs internacional</h2>
      <p>
        O campo <code>SETTL_FLAG</code> (Settlement Flag) define se a transação é doméstica
        brasileira (<code>8</code> ou <code>9</code>) ou internacional (<code>0</code>). As
        tabelas de intercâmbio doméstico e internacional são completamente separadas — e as
        taxas internacionais são geralmente mais altas.
      </p>

      <h2>Como a Visa monta a regra</h2>
      <p>
        Enquanto a Mastercard usa IRD + tier + segmento, a Visa usa uma expressão booleana sobre
        o contexto da transação. Cada regra na tabela Visa é avaliada como:
      </p>
      <div className="callout">
        <code>
          ctx[SETTL_FLAG] in ['8','9'] AND ctx[PID] == 'N^' AND ctx[AFS] == 'C' AND
          ctx[INST] == 1 AND ctx[POS_ENTRY_MODE] in ['05','07','90','95']
        </code>
        <br /><br />
        → IRD: "BR-DOM-PLATINUM-CP" → Taxa: 1,50%
      </div>
      <p>
        Essa expressão Python é gerada automaticamente a partir da planilha de intercâmbio Visa
        e compilada uma única vez ao carregar o motor — tornando a avaliação muito rápida.
      </p>

      <h2>Diferença fundamental Visa vs Mastercard</h2>
      <table>
        <thead><tr><th>Aspecto</th><th>Mastercard</th><th>Visa</th></tr></thead>
        <tbody>
          <tr><td>Identificador de produto</td><td>Tier (string)</td><td>PID (código 2 chars)</td></tr>
          <tr><td>Tipo de conta</td><td>PRODUCT_TYPE</td><td>AFS</td></tr>
          <tr><td>Doméstico/Internacional</td><td>ACQR/ISSR_COUNTRY</td><td>SETTL_FLAG</td></tr>
          <tr><td>Autenticação</td><td>ECSLI</td><td>ECI</td></tr>
          <tr><td>Parcelado</td><td>INSTALLMENTS</td><td>INST + SPI</td></tr>
        </tbody>
      </table>
    </>
  ),

  "eci-e-autenticacao": (
    <>
      <p>
        ECI significa <strong>Electronic Commerce Indicator</strong>. É um campo de dois dígitos
        que indica o nível de autenticação de uma transação online — e tem impacto direto e
        mensurável na taxa de intercâmbio.
      </p>

      <h2>Os valores de ECI e o que significam</h2>
      <table>
        <thead><tr><th>ECI</th><th>Significado</th><th>Impacto na taxa</th></tr></thead>
        <tbody>
          <tr><td>05</td><td>Autenticação 3DS bem-sucedida (portador autenticou)</td><td>Menor taxa — risco compartilhado com emissor</td></tr>
          <tr><td>06</td><td>Tentativa de autenticação (emissor não participante)</td><td>Taxa intermediária</td></tr>
          <tr><td>07</td><td>Sem autenticação (transação não 3DS)</td><td>Maior taxa — risco 100% do adquirente</td></tr>
          <tr><td>02</td><td>Recorrência (MIT — Merchant Initiated Transaction)</td><td>Regra específica</td></tr>
        </tbody>
      </table>

      <h2>O que é 3DS</h2>
      <p>
        3DS (Three-Domain Secure) é o protocolo de autenticação do e-commerce. Envolve três
        domínios: o domínio do adquirente (lojista), o domínio da bandeira (servidor de diretório)
        e o domínio do emissor (ACS — Access Control Server).
      </p>
      <p>
        Quando o portador passa por 3DS com sucesso (ECI 05), o emissor assume parte da
        responsabilidade por fraude — isso é chamado de <strong>liability shift</strong> (mudança
        de responsabilidade). Como o risco do adquirente cai, a bandeira oferece taxa melhor.
      </p>

      <h2>Frictionless vs Challenge</h2>
      <p>
        Nem todo 3DS exige que o portador faça algo. O protocolo 3DS 2.x tem dois fluxos:
      </p>
      <ul>
        <li>
          <strong>Frictionless:</strong> O emissor analisa dados de risco (dispositivo, IP,
          comportamento) e aprova sem interação do usuário. ECI 05 resultante. Taxa melhor.
          No motor Mastercard, corresponde ao ECSLI = "FRICTIONLESS".
        </li>
        <li>
          <strong>Challenge:</strong> O emissor exige confirmação adicional (código SMS, biometria).
          Mais fricção para o usuário, mas também resulta em ECI 05 se bem-sucedido.
        </li>
      </ul>

      <h2>Impacto numérico</h2>
      <div className="callout">
        <strong>Exemplo Visa Platinum, e-commerce, restaurante:</strong><br /><br />
        Sem 3DS (ECI 07): taxa CNP padrão ~ 2,00%<br />
        Com 3DS frictionless (ECI 05): taxa autenticada ~ 1,55%<br /><br />
        <strong>Diferença: 0,45 p.p.</strong> Em R$ 1 milhão de vendas mensais, são R$ 4.500
        de intercâmbio a menos — que chegam como menor custo no MDR do lojista.
      </div>

      <h2>Por que alguns lojistas não usam 3DS</h2>
      <p>
        Fricção → abandono de carrinho. Cada segundo a mais no checkout reduz conversão. Para
        lojistas com ticket médio baixo ou alta conversão sensível ao atrito, o custo de
        implementar 3DS pode não compensar a economia na taxa.
      </p>
      <p>
        É por isso que o mercado favorece o <strong>frictionless</strong>: autenticação sem
        atrito. Com dados de risco suficientes, o emissor autentica silenciosamente — o portador
        não percebe nada, mas o ECI muda de 07 para 05 e a taxa melhora.
      </p>
    </>
  ),

// ─── Trilha 3: Compliance e Risco ─────────────────────────────────────────────

  "tipos-de-fraude": (
    <>
      <p>
        Fraude em cartões não é um evento único — é um ecossistema de ataques com técnicas,
        alvos e consequências distintas. Entender cada tipo é o primeiro passo para construir
        defesas adequadas.
      </p>

      <h2>1. CNP (Card Not Present) Fraud</h2>
      <p>
        O tipo mais comum no Brasil hoje. Acontece quando o atacante usa dados do cartão (PAN,
        CVV2, validade) para fazer compras online sem ter o cartão físico. Os dados geralmente
        vêm de:
      </p>
      <ul>
        <li>Vazamentos de banco de dados de e-commerces</li>
        <li>Phishing e engenharia social</li>
        <li>Compra de dados no mercado negro (dumps)</li>
      </ul>
      <p>
        Defesa: 3DS, análise de risco comportamental, tokenização.
      </p>

      <h2>2. Card Testing (Teste de Cartão)</h2>
      <p>
        O atacante tem uma lista de PANs roubados e não sabe quais ainda estão ativos. Ele
        faz transações pequenas (R$ 1, R$ 2) em múltiplos lojistas para testar quais são
        aprovadas. Quando encontra um cartão ativo, usa-o para compras maiores.
      </p>
      <p>
        Lojistas com checkout fácil (sem CAPTCHA, sem rate limiting) são alvos preferidos.
        O impacto no lojista é duplo: taxa de aprovação cai, e o MCC deles aparece nos
        relatórios de fraude da bandeira.
      </p>

      <h2>3. Account Takeover (ATO)</h2>
      <p>
        O atacante assume o controle da conta do portador — geralmente via credential stuffing
        (tentativa de senhas vazadas) ou phishing. Com acesso à conta, ele pode:
      </p>
      <ul>
        <li>Alterar dados cadastrais e limite</li>
        <li>Adicionar o cartão a uma wallet (Apple Pay/Google Pay) — gerando um DPAN novo</li>
        <li>Fazer compras ou transferências</li>
      </ul>
      <p>
        A tokenização por si só não protege contra ATO — se o atacante controla a conta do
        portador, pode provisionar novos tokens.
      </p>

      <h2>4. Skimming e Clonagem (Card Present)</h2>
      <p>
        Antes do chip EMV ser universal, o ataque mais comum era capturar os dados da tarja
        magnética (com um leitor instalado no POS ou ATM) e clonar o cartão. Com chip EMV,
        a clonagem da tarja ainda funciona para compras em países que aceitam swipe, mas não
        para compras com chip — pois o ARQC é único por transação.
      </p>

      <h2>5. Friendly Fraud (Chargeback Abusivo)</h2>
      <p>
        O próprio portador faz a compra, recebe o produto e disputa a transação alegando não
        ter reconhecido. É chamado de "friendly" (amigável) ironicamente — é fraude, mas vem
        de quem deveria ser confiável.
      </p>
      <p>
        É um problema crescente no e-commerce. O lojista arca com o chargeback, perde o produto
        e ainda paga taxa de disputa. Alta taxa de friendly fraud pode levar o lojista ao MATCH.
      </p>

      <div className="callout">
        <strong>Impacto sistêmico:</strong> Toda fraude não recuperada é reportada ao sistema
        TC40/SAFE da bandeira. Quando a taxa de fraude de um adquirente ultrapassa o threshold
        da bandeira, ele entra em programas de monitoramento (VAMP, ECP) com penalidades
        financeiras progressivas. É o assunto das próximas lições.
      </div>
    </>
  ),

  "tc40-e-safe": (
    <>
      <p>
        Quando um emissor identifica uma fraude, ele não guarda a informação só para si. Ele
        a reporta para a bandeira via sistemas padronizados — e essa informação alimenta
        programas de monitoramento que podem penalizar adquirentes.
      </p>

      <h2>TC40: o reporte de fraude da Mastercard</h2>
      <p>
        <code>TC40</code> é o Transaction Code para reporte de fraude no sistema de clearing
        da Mastercard (Base II). Quando um emissor Mastercard identifica uma transação como
        fraudulenta, ele submete um TC40 com:
      </p>
      <ul>
        <li>O PAN do cartão comprometido</li>
        <li>O valor e data da transação fraudulenta</li>
        <li>O Merchant ID e MCC do lojista onde ocorreu</li>
        <li>O código de tipo de fraude (roubo, conta comprometida, etc.)</li>
      </ul>
      <p>
        A Mastercard consolida esses reportes e calcula métricas mensais para cada adquirente:
        volume de fraude reportada vs. volume total processado. Quando essa taxa ultrapassa
        thresholds do ECP, começam as penalidades.
      </p>

      <h2>SAFE: o equivalente da Visa</h2>
      <p>
        <strong>SAFE (System to Avoid Fraud Effectively)</strong> é o sistema de reporte de
        fraude da Visa. Funciona de forma análoga ao TC40: emissores reportam transações
        fraudulentas, e a Visa consolida as métricas por adquirente.
      </p>
      <p>
        Os dados SAFE alimentam o programa <strong>VAMP (Visa Acquirer Monitoring Program)</strong>.
      </p>

      <h2>O fluxo do reporte</h2>
      <div className="callout">
        <strong>Linha do tempo típica:</strong><br /><br />
        D+0: Transação fraudulenta aprovada.<br />
        D+1 a D+15: Portador identifica e reporta ao emissor.<br />
        D+15 a D+45: Emissor confirma fraude e submete TC40/SAFE.<br />
        D+30 a D+60: Bandeira consolida métricas mensais.<br />
        D+60+: Adquirente recebe relatório de risco — se acima do threshold, entra em monitoramento.
      </div>

      <h2>Por que isso importa para o adquirente</h2>
      <p>
        Um adquirente não controla diretamente o TC40 — quem emite é o banco emissor. Mas
        ele controla o portfólio de lojistas que credencia. Um lojista com alto índice de
        fraude (por ter sofrido invasão, por praticar friendly fraud estruturado, ou por atrair
        card testing) vai aparecer muito nos reportes TC40/SAFE associados ao adquirente.
      </p>
      <p>
        Isso significa que gestão de risco no credenciamento e monitoramento contínuo de
        lojistas não é apenas boa prática — é condição para não ser penalizado pelas bandeiras.
      </p>
    </>
  ),

  "vamp-e-ecp": (
    <>
      <p>
        VAMP e ECP são os programas pelos quais Visa e Mastercard monitoram adquirentes com
        índices elevados de fraude. Entrar nesses programas significa penalidades financeiras
        mensais crescentes — e potencialmente perder o direito de operar com a bandeira.
      </p>

      <h2>VAMP: Visa Acquirer Monitoring Program</h2>
      <p>
        O VAMP monitora dois indicadores mensais de cada adquirente Visa:
      </p>
      <table>
        <thead><tr><th>Indicador</th><th>Cálculo</th><th>Threshold de entrada</th></tr></thead>
        <tbody>
          <tr>
            <td>Fraud-to-Sales Ratio (FSR)</td>
            <td>Volume de fraude SAFE ÷ Volume total processado</td>
            <td>≥ 0,075% (Early Warning) / ≥ 0,09% (Standard)</td>
          </tr>
          <tr>
            <td>Fraud-to-Transaction Count</td>
            <td>Nº de transações fraudulentas ÷ Nº total de transações</td>
            <td>Combinado com FSR</td>
          </tr>
        </tbody>
      </table>

      <h3>Ciclo de penalidades VAMP</h3>
      <ul>
        <li><strong>Mês 1:</strong> Notificação (Early Warning) — sem penalidade financeira, mas obrigação de plano de ação</li>
        <li><strong>Mês 2–3:</strong> US$ 25.000/mês</li>
        <li><strong>Mês 4–6:</strong> US$ 50.000/mês</li>
        <li><strong>Mês 7+:</strong> US$ 75.000/mês + revisão de contrato</li>
      </ul>

      <div className="callout">
        <strong>Importante:</strong> As penalidades são em dólar e cobradas independente do
        câmbio. Para adquirentes médios, entrar no VAMP por 6 meses pode representar
        US$ 250.000+ de penalidade só na taxa mensal — além do custo operacional de
        responder ao programa.
      </div>

      <h2>ECP: Excessive Chargeback Program (Mastercard)</h2>
      <p>
        O ECP da Mastercard monitora a <strong>taxa de chargeback</strong> de cada adquirente.
        Um adquirente está no ECP quando supera:
      </p>
      <ul>
        <li><strong>Early Warning:</strong> &gt; 1,00% de chargebacks sobre transações do mês anterior</li>
        <li><strong>Standard:</strong> &gt; 1,50%</li>
        <li><strong>Excessive:</strong> &gt; 2,00%</li>
      </ul>
      <p>
        A MC também monitora por <strong>número absoluto</strong> de chargebacks (não só
        percentual). Um lojista que processa pouco mas tem muitos chargebacks pode entrar no
        programa mesmo com percentual abaixo do threshold.
      </p>

      <h2>Outros programas relevantes</h2>
      <table>
        <thead><tr><th>Programa</th><th>Bandeira</th><th>O que monitora</th></tr></thead>
        <tbody>
          <tr><td>EFM (Excessive Fraud Merchant)</td><td>Visa</td><td>Lojistas individuais com alta fraude</td></tr>
          <tr><td>PED (PIN Entry Device)</td><td>Ambas</td><td>Terminais não homologados ou comprometidos</td></tr>
          <tr><td>VIRP</td><td>Visa</td><td>Não-compliance com regras operacionais</td></tr>
          <tr><td>MMP</td><td>Mastercard</td><td>Merchants em monitoramento</td></tr>
        </tbody>
      </table>

      <h2>Como sair do programa</h2>
      <p>
        Para sair do VAMP ou ECP, o adquirente precisa apresentar um plano de ação à bandeira
        e, durante 3 meses consecutivos, manter métricas abaixo dos thresholds. Não é uma
        saída automática — é monitorada manualmente pela equipe de risco da bandeira.
      </p>
    </>
  ),

  "match": (
    <>
      <p>
        MATCH significa <strong>Member Alert to Control High-Risk Merchants</strong>. É um
        banco de dados global mantido pela Mastercard onde adquirentes registram lojistas que
        tiveram contratos encerrados por razões graves. Entrar no MATCH é quase sentença de
        morte para um negócio: nenhum adquirente sério credencia um lojista listado lá.
      </p>

      <h2>Como funciona</h2>
      <p>
        Quando um adquirente encerra o contrato de um lojista por uma das razões qualificadas
        (listadas abaixo), ele tem a <strong>obrigação</strong> de reportar o lojista ao MATCH.
        Não é opcional. Deixar de reportar é violação das regras da Mastercard.
      </p>
      <p>
        O registro inclui: CNPJ/CPF, nome do lojista, nome dos sócios, MCC, razão do
        encerramento e país. A consulta ao MATCH é feita pelo adquirente no momento do
        credenciamento de qualquer novo lojista.
      </p>

      <h2>As razões de inclusão (Reason Codes)</h2>
      <table>
        <thead><tr><th>Código</th><th>Razão</th></tr></thead>
        <tbody>
          <tr><td>01</td><td>Account Data Compromise — lojista sofreu vazamento de dados de cartão</td></tr>
          <tr><td>02</td><td>Common Point of Purchase — lojista identificado como origem de fraudes</td></tr>
          <tr><td>03</td><td>Laundering — suspeita de lavagem de dinheiro via transações de cartão</td></tr>
          <tr><td>04</td><td>Excessive Chargebacks — taxa de chargebacks excessiva por período prolongado</td></tr>
          <tr><td>05</td><td>Excessive Fraud — taxa de fraude excessiva</td></tr>
          <tr><td>07</td><td>Fraud Conviction — condenação criminal relacionada ao uso do cartão</td></tr>
          <tr><td>08</td><td>Mastercard Questionable Merchant Audit Program</td></tr>
          <tr><td>09</td><td>Bankruptcy / Insolvency</td></tr>
          <tr><td>10</td><td>Violation of Standards — violação grave das regras da bandeira</td></tr>
          <tr><td>11</td><td>Merchant Collusion — conluio com fraudadores</td></tr>
          <tr><td>12</td><td>PCI-DSS Non-Compliance — falha em segurança de dados</td></tr>
          <tr><td>13</td><td>Illegal Transactions — transações ilegais processadas</td></tr>
          <tr><td>14</td><td>Identity Theft — uso de identidade falsa para se credenciar</td></tr>
        </tbody>
      </table>

      <h2>BRAM: o MATCH da Visa no Brasil</h2>
      <p>
        A Visa tem um programa equivalente chamado <strong>BRAM (Brazil Merchant Alert)</strong>,
        específico para o mercado brasileiro. Funciona de forma análoga — adquirentes consultam
        antes de credenciar e reportam ao encerrar contratos por razões qualificadas.
      </p>

      <h2>Como sair do MATCH</h2>
      <p>
        Um lojista pode ser removido do MATCH em dois cenários:
      </p>
      <ul>
        <li>
          <strong>Prazo:</strong> registros por Reason Code 04 (Excessive Chargebacks) expiram
          após 5 anos.
        </li>
        <li>
          <strong>Disputa:</strong> o lojista pode contestar o registro se provar que foi incluído
          indevidamente — processo lento e incerto.
        </li>
      </ul>
      <p>
        Para a maioria dos reason codes (fraude, lavagem, violação), não há prazo de expiração
        automático. O lojista fica listado indefinidamente.
      </p>

      <div className="callout">
        <strong>Para o adquirente:</strong> Credenciar um lojista listado no MATCH sem consulta
        prévia é violação das regras da bandeira, podendo resultar em penalidades. Manter a
        disciplina de consulta no onboarding é obrigação, não boa prática.
      </div>
    </>
  ),

// ─── Trilha 4: Visa Deep Dive ─────────────────────────────────────────────────

  "visanet-e-vbs": (
    <>
      <p>
        A Visa opera a maior rede de pagamentos do mundo. Por trás de cada transação aprovada
        em menos de dois segundos existe uma infraestrutura global chamada <strong>VisaNet</strong> —
        e sobre ela, uma camada de serviços chamada <strong>VBS (Visa Business Services)</strong>.
      </p>

      <h2>VisaNet: a rede física</h2>
      <p>
        VisaNet é o nome histórico da rede de telecomunicações da Visa que conecta adquirentes
        e emissores em mais de 200 países. Na prática, quando um terminal POS envia uma mensagem
        de autorização, ela viaja:
      </p>
      <ol>
        <li>Do terminal → Host do adquirente</li>
        <li>Host do adquirente → VisaNet (via conexão dedicada ou IP)</li>
        <li>VisaNet → Host do emissor (identificado pelo BIN)</li>
        <li>Emissor responde → VisaNet → Adquirente → Terminal</li>
      </ol>
      <p>
        Tudo em menos de 1,5 segundo. A VisaNet processa globalmente mais de 65.000 transações
        por segundo no pico.
      </p>

      <h2>VIP: Visa Interchange Processing</h2>
      <p>
        O <strong>VIP (Visa Interchange Processing)</strong> é o módulo de autorização dentro
        da VisaNet. Ele recebe a mensagem ISO 8583, valida os campos, roteia para o emissor e
        devolve a resposta. Quando o emissor está offline (stand-in), o próprio VIP pode
        autorizar a transação usando regras pré-definidas — isso é chamado de{" "}
        <strong>stand-in processing</strong>.
      </p>

      <h2>VBS: Visa Business Services</h2>
      <p>
        VBS é a plataforma de serviços de valor agregado que roda sobre a VisaNet. Inclui:
      </p>
      <table>
        <thead><tr><th>Serviço</th><th>Descrição</th></tr></thead>
        <tbody>
          <tr><td>VSS</td><td>Visa Settlement Service — clearing e settlement</td></tr>
          <tr><td>VTS</td><td>Visa Token Service — tokenização para wallets digitais</td></tr>
          <tr><td>VDS</td><td>Visa Dispute Service — gestão de chargebacks</td></tr>
          <tr><td>VROL</td><td>Visa Risk and Operations — monitoramento de fraude (VAMP)</td></tr>
          <tr><td>VisaNet Connect</td><td>Conectividade IP moderna para adquirentes e emissores</td></tr>
        </tbody>
      </table>

      <h2>Conectividade: como o adquirente se conecta</h2>
      <p>
        No Brasil, adquirentes se conectam à VisaNet de duas formas:
      </p>
      <ul>
        <li>
          <strong>Conexão direta:</strong> linha dedicada ou VPN MPLS para o datacenter da Visa.
          Usada por grandes adquirentes (Cielo, Rede, Stone) com alto volume.
        </li>
        <li>
          <strong>Via processador:</strong> adquirentes menores se conectam por um processador
          certificado Visa (ex: Global Payments, Fiserv) que já tem conexão direta.
        </li>
      </ul>

      <div className="callout">
        <strong>Visa vs Mastercard — rede:</strong> A Mastercard tem estrutura similar (Banknet
        para autorização, Mastercard Connect para serviços). A principal diferença é que a Visa
        centraliza mais o processamento no VIP, enquanto a Mastercard distribui mais para os
        hosts dos adquirentes e emissores. Na prática, para o time de intercâmbio, o que importa
        é o arquivo de clearing — VSS/BASE II para Visa, IPM para Mastercard.
      </div>
    </>
  ),

  "vss-e-clearing-visa": (
    <>
      <p>
        Autorização é só a primeira metade de uma transação. A segunda metade é o{" "}
        <strong>clearing e settlement</strong> — o processo pelo qual o dinheiro realmente muda
        de mãos. Na Visa, esse processo é coordenado pelo{" "}
        <strong>VSS (Visa Settlement Service)</strong>.
      </p>

      <h2>O que é o VSS</h2>
      <p>
        VSS é o sistema de settlement multilateral da Visa. Em vez de cada adquirente acertar
        individualmente com cada emissor (o que seria impraticável com milhares de participantes),
        o VSS centraliza o processo:
      </p>
      <ol>
        <li>Adquirentes enviam arquivos de clearing com as transações do dia para a Visa (BASE II)</li>
        <li>Visa processa, aplica as taxas de intercâmbio e calcula posições líquidas</li>
        <li>Cada participante recebe uma posição única: quanto deve ou vai receber</li>
        <li>O settlement acontece via banco liquidante (no Brasil, via CIP/STR)</li>
      </ol>

      <h2>Ciclos de clearing Visa</h2>
      <p>
        O clearing Visa no Brasil segue janelas definidas:
      </p>
      <table>
        <thead><tr><th>Janela</th><th>Cutoff</th><th>Settlement</th></tr></thead>
        <tbody>
          <tr><td>Ciclo 1</td><td>10h (horário de Brasília)</td><td>D+1 manhã</td></tr>
          <tr><td>Ciclo 2</td><td>16h</td><td>D+1 tarde</td></tr>
          <tr><td>Ciclo 3</td><td>22h</td><td>D+2 manhã</td></tr>
        </tbody>
      </table>
      <p>
        Transações enviadas após o cutoff do Ciclo 3 entram no Ciclo 1 do dia seguinte.
        O adquirente tem interesse em submeter o mais cedo possível para antecipar o recebimento.
      </p>

      <h2>NET settlement</h2>
      <p>
        A Visa usa <strong>net settlement multilateral</strong>: ao invés de liquidar par-a-par,
        cada participante liquida apenas uma posição líquida com a Visa. Se o Adquirente A deve
        R$ 10M aos emissores e vai receber R$ 8M dos emissores, sua posição líquida com a Visa é
        de R$ 2M a pagar. Um único pagamento settle centenas de milhares de transações.
      </p>

      <h2>O arquivo BASE II</h2>
      <p>
        <strong>BASE II</strong> é o formato de arquivo que adquirentes enviam ao VSS com os
        dados de clearing. Cada registro do BASE II corresponde a uma transação e contém:
      </p>
      <ul>
        <li>PAN do cartão (ou token)</li>
        <li>Valor da transação e moeda</li>
        <li>MCC e Merchant ID</li>
        <li>POS Entry Mode e campos de autenticação (ECI)</li>
        <li>PID e AFS para lookup de intercâmbio</li>
        <li>Campos de parcelamento (INST, SPI)</li>
      </ul>

      <h2>VCF: Visa Clearing File</h2>
      <p>
        Após processar o clearing, a Visa devolve para cada adquirente um{" "}
        <strong>VCF (Visa Clearing File)</strong> — um arquivo com todas as transações
        liquidadas e os valores de intercâmbio aplicados. É com o VCF que o adquirente:
      </p>
      <ul>
        <li>Reconcilia o settlement recebido</li>
        <li>Identifica o IRD aplicado a cada transação</li>
        <li>Detecta erros de classificação (campo errado → intercâmbio errado)</li>
        <li>Calcula o custo real do portfólio de lojistas</li>
      </ul>

      <div className="callout">
        <strong>Erro clássico de clearing:</strong> O adquirente envia o POS_ENTRY_MODE errado
        (ex: swipe 02 no lugar de chip 05). A Visa classifica como transação de tarja magnética
        e aplica uma taxa de intercâmbio maior (maior risco). O adquirente só percebe quando
        analisa o VCF e vê o IRD aplicado diferente do esperado.
      </div>
    </>
  ),

  "base-ii-e-ipm": (
    <>
      <p>
        No mundo do clearing de cartões, dois formatos dominam: o <strong>BASE II</strong> da
        Visa e o <strong>IPM (Integrated Payment Module)</strong> da Mastercard. Entender as
        diferenças é fundamental para quem trabalha com processamento e reconciliação.
      </p>

      <h2>BASE II: o sistema da Visa</h2>
      <p>
        BASE II é o sistema de clearing e settlement da Visa desde os anos 1970. O nome vem de
        "BASE" (Bank Americard Service Exchange) — legado do nome original do cartão Visa. Apesar
        da idade, é um sistema robusto e ainda amplamente utilizado.
      </p>
      <p>
        O arquivo BASE II usa um formato de registro fixo (fixed-length records) com campos
        posicionais. Cada registro tem um <strong>Transaction Code (TC)</strong> que define o tipo:
      </p>
      <table>
        <thead><tr><th>TC</th><th>Tipo de registro</th></tr></thead>
        <tbody>
          <tr><td>05</td><td>Transação de compra (Presentment)</td></tr>
          <tr><td>06</td><td>Chargeback</td></tr>
          <tr><td>15</td><td>Reversão de transação</td></tr>
          <tr><td>25</td><td>Representação (re-presentment)</td></tr>
          <tr><td>95</td><td>Fee (taxa de serviço)</td></tr>
        </tbody>
      </table>

      <h2>IPM: o sistema da Mastercard</h2>
      <p>
        <strong>IPM (Integrated Payment Module)</strong> é o formato de clearing da Mastercard.
        Diferente do BASE II, o IPM usa um formato flexível baseado em{" "}
        <strong>PDS (Private Data Subelement)</strong> — campos adicionais que podem ser
        presentes ou ausentes conforme o tipo de transação.
      </p>
      <p>
        O IPM também usa Transaction Codes, mas os chama de MTI (Message Type Indicator) —
        o mesmo identificador usado na mensagem de autorização ISO 8583:
      </p>
      <table>
        <thead><tr><th>MTI</th><th>Tipo</th></tr></thead>
        <tbody>
          <tr><td>1240</td><td>Presentment (compra)</td></tr>
          <tr><td>1442</td><td>Chargeback</td></tr>
          <tr><td>1644</td><td>Fee collection</td></tr>
          <tr><td>1740</td><td>Reversão</td></tr>
        </tbody>
      </table>

      <h2>Comparação direta</h2>
      <table>
        <thead><tr><th>Aspecto</th><th>BASE II (Visa)</th><th>IPM (Mastercard)</th></tr></thead>
        <tbody>
          <tr><td>Formato</td><td>Fixed-length records</td><td>Variable-length com PDS</td></tr>
          <tr><td>Encoding de produto</td><td>PID (2 chars)</td><td>PDS 0043 (tier), PDS 0002 (product)</td></tr>
          <tr><td>Autenticação</td><td>Campo ECI direto</td><td>PDS 0052 (ECSLI)</td></tr>
          <tr><td>Parcelamento</td><td>INST + SPI</td><td>PDS 0059</td></tr>
          <tr><td>País</td><td>SETTL_FLAG</td><td>Acquirer/Issuer Country Code</td></tr>
          <tr><td>Settlement</td><td>VSS</td><td>GRS (Global Reimbursement System)</td></tr>
        </tbody>
      </table>

      <h2>PDS: o diferencial do IPM</h2>
      <p>
        Os PDS são a grande peculiaridade do formato Mastercard. Um PDS tem:
      </p>
      <ul>
        <li><strong>Tag:</strong> 4 dígitos (ex: 0043 = product code)</li>
        <li><strong>Length:</strong> comprimento do valor</li>
        <li><strong>Value:</strong> o dado em si</li>
      </ul>
      <p>
        Isso permite que o IPM carregue dados adicionais sem quebrar o formato base. A
        Mastercard publica uma lista completa de PDS tags — são mais de 200 tags documentadas.
        Para o intercâmbio, os mais críticos são: 0002 (product), 0043 (tier), 0052 (ECSLI),
        0059 (installment data).
      </p>

      <div className="callout">
        <strong>Na prática:</strong> A maioria dos sistemas de intercâmbio no Brasil precisa
        suportar ambos os formatos. A engine lê o BASE II para transações Visa e o IPM para
        Mastercard, extrai os campos relevantes para os mesmos atributos internos (produto,
        canal, autenticação, parcelamento) e aplica a tabela correta. A normalização dos dois
        formatos para uma representação interna comum é uma das partes mais trabalhosas da
        implementação.
      </div>
    </>
  ),

  "vcf-e-campos-criticos": (
    <>
      <p>
        O <strong>VCF (Visa Clearing File)</strong> é o arquivo que a Visa devolve ao adquirente
        após o processamento do clearing. Ele é a fonte de verdade para reconciliação, auditoria
        de intercâmbio e detecção de erros de classificação.
      </p>

      <h2>Estrutura do VCF</h2>
      <p>
        O VCF contém um registro por transação liquidada. Cada registro inclui todos os campos
        enviados pelo adquirente no BASE II, mais campos adicionados pela Visa durante o
        processamento (IRD aplicado, valor de intercâmbio calculado, data de settlement).
      </p>

      <h2>Campos críticos para o intercâmbio</h2>

      <h3>POS_ENTRY_MODE (campo 22 do ISO 8583)</h3>
      <p>
        Define como o cartão foi lido. Determina o canal — e portanto qual regra de intercâmbio
        se aplica.
      </p>
      <table>
        <thead><tr><th>Código</th><th>Canal</th><th>Impacto</th></tr></thead>
        <tbody>
          <tr><td>05</td><td>Chip EMV (contact)</td><td>Menor risco → melhor taxa</td></tr>
          <tr><td>07</td><td>Chip com PIN offline</td><td>Menor risco</td></tr>
          <tr><td>10</td><td>Chip EMV (contactless)</td><td>Menor risco</td></tr>
          <tr><td>90</td><td>Tarja magnética</td><td>Maior risco → taxa maior</td></tr>
          <tr><td>01</td><td>Manual (MOTO)</td><td>CNP — taxa CNP</td></tr>
          <tr><td>81</td><td>E-commerce sem chip</td><td>CNP — taxa CNP</td></tr>
        </tbody>
      </table>

      <h3>ECI (Electronic Commerce Indicator)</h3>
      <p>
        Já visto na Trilha 2. No VCF aparece como campo direto. Para transações físicas, ECI
        geralmente não está presente — a regra é determinada pelo POS_ENTRY_MODE. Para
        e-commerce, ECI 05, 06 ou 07 é obrigatório.
      </p>

      <h3>PID (Product ID) e AFS (Account Funding Source)</h3>
      <p>
        PID identifica o produto; AFS identifica se é crédito (C), débito (D) ou pré-pago (P).
        Esses dois campos juntos determinam qual linha da tabela de intercâmbio usar. Um erro
        de PID ou AFS pode resultar em taxa errada — geralmente mais cara.
      </p>

      <h3>SETTL_FLAG (Settlement Flag)</h3>
      <p>
        Define se a transação é doméstica ou internacional. Valores brasileiros: <code>8</code>{" "}
        (doméstico Visa Brasil) e <code>9</code> (doméstico real-time). Valor <code>0</code>{" "}
        indica internacional. Tabelas doméstica e internacional são completamente separadas —
        uma confusão aqui muda totalmente a taxa.
      </p>

      <h3>INST e SPI (Installment fields)</h3>
      <p>
        <code>INST</code> é o número de parcelas; <code>SPI</code> (Specific Payment Indicator)
        define o tipo de parcelamento. Para crédito à vista: INST=1. Para parcelado: INST=número
        de parcelas, SPI=código do plano. A taxa de intercâmbio parcelada é maior que à vista.
      </p>

      <h2>Como auditar uma transação via VCF</h2>
      <p>
        Quando o adquirente detecta que a taxa de intercâmbio de um lojista está acima do
        esperado, o processo de auditoria pelo VCF é:
      </p>
      <ol>
        <li>Extrair o registro da transação no VCF pelo ARN (Acquirer Reference Number)</li>
        <li>Verificar o IRD aplicado pela Visa (campo INTERCHANGE_RATE_DESIGNATOR)</li>
        <li>Comparar com o IRD esperado dado os atributos da transação</li>
        <li>Identificar qual campo causou a diferença (POS_ENTRY_MODE? ECI? PID?)</li>
        <li>Corrigir o campo no host do adquirente ou no terminal</li>
      </ol>

      <div className="callout">
        <strong>Exemplo de auditoria:</strong> Um lojista de e-commerce com 3DS implementado
        está pagando intercâmbio CNP sem autenticação. Ao auditar o VCF, você vê ECI=07 em
        todas as transações — mas o lojista jura que implementou 3DS. O problema: o gateway de
        pagamento está enviando ECI fixo 07 no lugar de usar o ECI retornado pelo servidor de
        diretório 3DS. Corrigir o gateway muda o ECI para 05 e reduz o intercâmbio.
      </div>
    </>
  ),

  "portfolio-visa-brasil": (
    <>
      <p>
        No Brasil, a Visa opera um portfólio diversificado de produtos — de cartões básicos a
        super-premium, de débito a pré-pago, passando por produtos específicos como BNDES e Vale.
        Cada produto tem um <strong>PID (Product ID)</strong> único que determina, entre outras
        coisas, a taxa de intercâmbio.
      </p>

      <h2>PIDs de crédito consumer</h2>
      <table>
        <thead><tr><th>PID</th><th>Produto</th><th>Posicionamento</th><th>Tier de intercâmbio</th></tr></thead>
        <tbody>
          <tr><td>F^</td><td>Visa Classic</td><td>Entrada</td><td>Standard (menor taxa)</td></tr>
          <tr><td>P^</td><td>Visa Gold</td><td>Intermediário</td><td>Gold</td></tr>
          <tr><td>N^</td><td>Visa Platinum</td><td>Premium</td><td>Platinum</td></tr>
          <tr><td>C^</td><td>Visa Signature</td><td>Super-premium</td><td>Signature</td></tr>
          <tr><td>I^</td><td>Visa Infinite</td><td>Ultra-premium</td><td>Infinite (maior taxa)</td></tr>
          <tr><td>I1</td><td>Visa Infinite HNW</td><td>High Net Worth</td><td>Infinite Premium</td></tr>
        </tbody>
      </table>

      <h2>PIDs de débito</h2>
      <table>
        <thead><tr><th>PID</th><th>Produto</th><th>Observação</th></tr></thead>
        <tbody>
          <tr><td>L^</td><td>Visa Electron</td><td>Débito básico, sem crédito offline</td></tr>
          <tr><td>F^</td><td>Visa Debit (Classic)</td><td>AFS=D distingue do crédito Classic</td></tr>
          <tr><td>N^</td><td>Visa Platinum Debit</td><td>AFS=D — taxa de débito Platinum</td></tr>
        </tbody>
      </table>
      <p>
        Para débito, o PID sozinho não basta — o campo <code>AFS=D</code> é obrigatório para
        a engine buscar na tabela de débito. Sem AFS correto, a transação pode ser classificada
        como crédito (taxa errada).
      </p>

      <h2>PIDs de pré-pago</h2>
      <table>
        <thead><tr><th>PID</th><th>Produto</th></tr></thead>
        <tbody>
          <tr><td>F^</td><td>Visa Prepaid básico (AFS=P)</td></tr>
          <tr><td>B^</td><td>Visa Prepaid Healthcare (benefício saúde)</td></tr>
          <tr><td>J3</td><td>Visa Vale (alimentação/refeição)</td></tr>
          <tr><td>S6</td><td>Visa BNDES (financiamento federal)</td></tr>
        </tbody>
      </table>

      <h2>PIDs comerciais (PJ)</h2>
      <table>
        <thead><tr><th>PID</th><th>Produto</th></tr></thead>
        <tbody>
          <tr><td>K^</td><td>Visa Business (pequenas empresas)</td></tr>
          <tr><td>S^</td><td>Visa Corporate (médias e grandes empresas)</td></tr>
          <tr><td>G^</td><td>Visa Purchasing (compras corporativas)</td></tr>
          <tr><td>H^</td><td>Visa Fleet (frota de veículos)</td></tr>
        </tbody>
      </table>
      <p>
        Cartões PJ têm tabelas de intercâmbio separadas das consumer — geralmente mais altas,
        pois o benefício ao emissor é maior (crédito para empresa tem mais risco e mais valor).
      </p>

      <h2>Impacto no intercâmbio: o spread entre produtos</h2>
      <div className="callout">
        <strong>Exemplo no Brasil (crédito à vista, POS físico, restaurante):</strong><br /><br />
        Visa Classic (F^): ~1,00%<br />
        Visa Gold (P^): ~1,20%<br />
        Visa Platinum (N^): ~1,50%<br />
        Visa Signature (C^): ~1,70%<br />
        Visa Infinite (I^): ~2,00%<br /><br />
        O spread de 1,00 p.p. entre Classic e Infinite reflete o custo maior dos benefícios
        premium que o emissor oferece ao portador — e que o adquirente subsidia indiretamente.
      </div>
    </>
  ),

  "vts-e-tokenizacao": (
    <>
      <p>
        <strong>VTS (Visa Token Service)</strong> é a infraestrutura da Visa para tokenização
        de pagamentos. Quando você adiciona um cartão Visa ao Apple Pay, Google Pay ou Samsung
        Pay, o que acontece por baixo é um processo coordenado pelo VTS — e ele tem impacto
        direto em segurança, intercâmbio e compliance.
      </p>

      <h2>Por que tokenizar?</h2>
      <p>
        O PAN (número do cartão) é o ativo mais valioso para um fraudador. Se ele obtém o PAN,
        pode usá-lo para compras CNP. A tokenização substitui o PAN por um{" "}
        <strong>DPAN (Device PAN)</strong> — um número diferente, vinculado a um dispositivo
        específico, sem valor fora daquele contexto.
      </p>
      <p>
        Mesmo que um atacante intercepte o DPAN, ele não pode usá-lo em outro dispositivo nem
        para compras manuais — o token é inútil fora do seu domínio de uso.
      </p>

      <h2>Ciclo de vida de um token Visa</h2>
      <ol>
        <li>
          <strong>Provisioning:</strong> Portador adiciona o cartão à wallet. O app envia o
          PAN para o VTS. O VTS verifica com o emissor (via "Green Path" ou desafio OTP) e
          gera um DPAN único para aquele dispositivo.
        </li>
        <li>
          <strong>Activation:</strong> O emissor aprova o token. O DPAN fica ativo e pode ser
          usado para pagamentos NFC/in-app.
        </li>
        <li>
          <strong>Uso:</strong> Cada pagamento usa o DPAN + uma <strong>criptografia dinâmica</strong>
          gerada pelo Secure Element do dispositivo (ARQC token-based). O lojista nunca vê o PAN real.
        </li>
        <li>
          <strong>Gestão:</strong> O emissor pode suspender ou revogar tokens individualmente
          sem cancelar o cartão físico. Se o celular for roubado, basta revogar o DPAN daquele
          dispositivo.
        </li>
        <li>
          <strong>Passthrough:</strong> Na autorização, a VisaNet recebe o DPAN e faz o
          detokenizamento — converte de volta para o PAN real antes de enviar ao emissor. O
          emissor continua processando como uma transação normal.
        </li>
      </ol>

      <h2>DCV: Domain Control Verification</h2>
      <p>
        O <strong>DCV (Domain Control Verification)</strong> é o mecanismo que garante que o
        token só funciona no contexto certo. Cada token tem um "domínio" de uso (ex: apenas
        no dispositivo X, apenas para in-app, apenas para e-commerce no merchant Y). O VTS
        valida o domínio na autorização e rejeita transações fora dele.
      </p>

      <h2>Impacto no intercâmbio</h2>
      <p>
        Transações com token Visa podem ter tratamento tarifário diferenciado. No geral:
      </p>
      <ul>
        <li>
          <strong>NFC com token (Apple Pay/Google Pay):</strong> Classificadas como contactless
          (POS_ENTRY_MODE 10) — mesma taxa ou melhor que chip físico.
        </li>
        <li>
          <strong>In-app com token:</strong> Classificadas como e-commerce, mas com campo
          TOKEN_IND = 1. Algumas tabelas oferecem taxa ligeiramente melhor para transações
          tokenizadas vs. PAN bruto, pois o risco é menor.
        </li>
      </ul>

      <h2>Tokenização vs proteção contra ATO</h2>
      <p>
        A tokenização protege o PAN de exposição — mas não protege contra{" "}
        <strong>Account Takeover (ATO)</strong>. Se um atacante assume a conta do portador,
        ele pode provisionar um novo token em um dispositivo seu. O VTS não sabe que o
        portador legítimo foi comprometido — vê apenas um provisionamento aparentemente normal.
      </p>
      <p>
        Por isso, emissores combinam VTS com camadas adicionais: verificação de identidade no
        provisionamento (OTP, biometria), análise comportamental e score de risco em tempo real.
      </p>

      <div className="callout">
        <strong>Dado de mercado:</strong> Transações com token têm taxa de fraude
        significativamente menor que transações com PAN bruto no e-commerce. Isso é o principal
        driver de adoção do VTS pelos emissores — além de ser cada vez mais exigido para
        participação nos programas de wallets (Apple Pay, Google Pay exigem VTS).
      </div>
    </>
  ),

  // ── Trilha 5: Chargeback e Disputas ──────────────────────────────────────────

  "ciclo-de-disputa": (
    <>
      <p>
        Um chargeback começa com uma reclamação. Mas entre a reclamação do portador e o
        encerramento do caso existe um ciclo formal com etapas bem definidas, prazos rígidos
        e responsabilidades distribuídas entre todos os participantes da cadeia.
      </p>

      <h2>Fase 1 — Reclamação do portador</h2>
      <p>
        O portador contata o emissor (banco) e contesta uma transação. Motivos comuns: não
        reconhece a compra, produto não entregue, cobrança duplicada. O emissor registra a
        solicitação e decide se abre a disputa.
      </p>

      <h2>Fase 2 — Retrieval Request (opcional)</h2>
      <p>
        Em alguns casos, antes de abrir o chargeback formal, o emissor envia um{" "}
        <strong>retrieval request</strong> (ou copy request): pede ao adquirente documentação
        da transação (comprovante, recibo). Se o adquirente não responde no prazo, o emissor
        pode converter diretamente em chargeback.
      </p>
      <div className="callout">
        <strong>Prazo típico:</strong> 30 dias corridos para o adquirente responder a um
        retrieval. A não-resposta é considerada confirmação implícita da disputa.
      </div>

      <h2>Fase 3 — Chargeback (First Presentment Reversal)</h2>
      <p>
        O emissor abre o chargeback formal na bandeira. O valor é debitado do adquirente e
        creditado provisoriamente ao portador. A bandeira notifica o adquirente com:
      </p>
      <ul>
        <li>O <strong>reason code</strong> — a razão formal da disputa</li>
        <li>O valor e a data limite para resposta</li>
        <li>O ARN (Acquirer Reference Number) da transação original</li>
      </ul>

      <h2>Fase 4 — Representment (Second Presentment)</h2>
      <p>
        O adquirente — geralmente em nome do lojista — responde ao chargeback com evidências
        que provam que a transação foi válida. Esse processo se chama{" "}
        <strong>representment</strong>. O adquirente reenvia a transação com a documentação
        de defesa pelo arquivo de clearing (BASE II / IPM).
      </p>

      <h2>Fase 5 — Arbitragem</h2>
      <p>
        Se o emissor não aceitar o representment, ele pode escalar para arbitragem da bandeira.
        A Visa ou Mastercard analisa as evidências dos dois lados e decide. A parte perdedora
        paga uma taxa de arbitragem (USD 500 a USD 1.000+). Por isso, casos fracos raramente
        chegam até aqui.
      </p>

      <table>
        <thead>
          <tr>
            <th>Fase</th>
            <th>Quem age</th>
            <th>Prazo típico</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Reclamação</td><td>Portador → Emissor</td><td>Até 120 dias da transação</td></tr>
          <tr><td>Chargeback</td><td>Emissor → Bandeira → Adquirente</td><td>Emissor tem 120 dias</td></tr>
          <tr><td>Representment</td><td>Adquirente</td><td>30 dias após chargeback</td></tr>
          <tr><td>Pré-arbitragem</td><td>Emissor</td><td>30 dias após representment</td></tr>
          <tr><td>Arbitragem</td><td>Bandeira decide</td><td>Sem prazo fixo</td></tr>
        </tbody>
      </table>

      <div className="callout">
        <strong>Regra prática:</strong> A cada chargeback não respondido, o adquirente perde
        o valor automaticamente. Responder com representment, mesmo com chances incertas, quase
        sempre compensa — o custo de não responder é o valor total da transação.
      </div>
    </>
  ),

  "reason-codes-visa": (
    <>
      <p>
        Todo chargeback Visa tem um <strong>reason code</strong> — um código de dois números
        separados por ponto que identifica a razão formal da disputa. Entender os grupos de
        reason codes é o passo mais importante para saber como defender cada caso.
      </p>
      <p>
        A Visa usa quatro grupos, cada um com uma lógica distinta:
      </p>

      <h2>Grupo 10 — Fraude</h2>
      <p>
        Portador alega que não autorizou a transação, ou que houve uso indevido do cartão.
      </p>
      <table>
        <thead>
          <tr><th>Código</th><th>Nome</th><th>Situação típica</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>10.1</code></td>
            <td>EMV Liability Shift – CNP</td>
            <td>Transação CNP com token, mas autenticação inadequada</td>
          </tr>
          <tr>
            <td><code>10.2</code></td>
            <td>EMV Liability Shift – Counterfeit</td>
            <td>Cartão falsificado usado em POS sem chip</td>
          </tr>
          <tr>
            <td><code>10.3</code></td>
            <td>Other Fraud – Card Present</td>
            <td>Fraude em transação física, cartão presente</td>
          </tr>
          <tr>
            <td><code>10.4</code></td>
            <td>Other Fraud – Card Absent</td>
            <td>Fraude em e-commerce / telefone (CNP)</td>
          </tr>
          <tr>
            <td><code>10.5</code></td>
            <td>Visa Fraud Monitoring Program</td>
            <td>Lojista em programa de monitoramento VFMP</td>
          </tr>
        </tbody>
      </table>
      <div className="callout">
        <strong>10.4 é o mais comum</strong> em e-commerce. O CE 3.0 (próxima lição) foi
        criado especificamente para combater chargebacks 10.4 de friendly fraud.
      </div>

      <h2>Grupo 11 — Autorização</h2>
      <p>
        Problemas na autorização: não foi solicitada, foi negada mas processou, ou os dados
        estavam incorretos.
      </p>
      <table>
        <thead>
          <tr><th>Código</th><th>Nome</th><th>Causa</th></tr>
        </thead>
        <tbody>
          <tr><td><code>11.1</code></td><td>Card Recovery Bulletin</td><td>Cartão listado como recuperado/bloqueado</td></tr>
          <tr><td><code>11.2</code></td><td>Declined Authorization</td><td>Transação processada após negativa do emissor</td></tr>
          <tr><td><code>11.3</code></td><td>No Authorization</td><td>Transação sem autorização prévia válida</td></tr>
        </tbody>
      </table>

      <h2>Grupo 12 — Erros de Processamento</h2>
      <p>
        Erros técnicos: valor incorreto, múltipla captura, transação inválida.
      </p>
      <table>
        <thead>
          <tr><th>Código</th><th>Nome</th><th>Causa</th></tr>
        </thead>
        <tbody>
          <tr><td><code>12.1</code></td><td>Late Presentment</td><td>Transação submetida ao clearing fora do prazo</td></tr>
          <tr><td><code>12.2</code></td><td>Incorrect Transaction Code</td><td>Crédito processado como débito (ou vice-versa)</td></tr>
          <tr><td><code>12.3</code></td><td>Incorrect Currency</td><td>Moeda diferente da autorizada</td></tr>
          <tr><td><code>12.6</code></td><td>Duplicate Processing</td><td>Mesma transação enviada ao clearing duas vezes</td></tr>
        </tbody>
      </table>

      <h2>Grupo 13 — Disputas de Serviço</h2>
      <p>
        Portador recebeu o produto/serviço mas tem uma reclamação legítima.
      </p>
      <table>
        <thead>
          <tr><th>Código</th><th>Nome</th><th>Causa</th></tr>
        </thead>
        <tbody>
          <tr><td><code>13.1</code></td><td>Merchandise/Services Not Received</td><td>Produto não entregue ou serviço não prestado</td></tr>
          <tr><td><code>13.2</code></td><td>Cancelled Recurring</td><td>Cobrança recorrente após cancelamento</td></tr>
          <tr><td><code>13.3</code></td><td>Not as Described</td><td>Produto diferente do descrito</td></tr>
          <tr><td><code>13.4</code></td><td>Counterfeit Merchandise</td><td>Produto falsificado entregue</td></tr>
          <tr><td><code>13.6</code></td><td>Credit Not Processed</td><td>Reembolso prometido mas não creditado</td></tr>
          <tr><td><code>13.7</code></td><td>Cancelled Merchandise / Services</td><td>Cobrança após cancelamento do serviço</td></tr>
        </tbody>
      </table>

      <div className="callout">
        <strong>Dica operacional:</strong> O reason code determina a estratégia de defesa. Para
        10.4 e 13.1, o CE 3.0 pode ser o caminho mais rápido. Para 12.6 (duplicata), basta
        provar que a segunda transação é a mesma e solicitar o cancelamento.
      </div>
    </>
  ),

  "representment-pratico": (
    <>
      <p>
        Representment é a resposta formal do adquirente a um chargeback. É a oportunidade de
        apresentar evidências que provem que a transação foi válida — e recuperar o valor debitado.
        Feito corretamente, pode reverter 40–70% dos chargebacks dependendo do setor.
      </p>

      <h2>O que é evidência válida?</h2>
      <p>
        A evidência depende do reason code. Não existe uma resposta universal — cada grupo
        exige um tipo diferente de prova:
      </p>
      <table>
        <thead>
          <tr><th>Reason Code</th><th>Evidências aceitas</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>10.4</code> (fraude CNP)</td>
            <td>CE 3.0 com prior transaction + device ID; prova de entrega no mesmo IP; histórico de uso sem disputas anteriores</td>
          </tr>
          <tr>
            <td><code>13.1</code> (não recebido)</td>
            <td>Rastreamento de entrega com assinatura; confirmação de download/acesso digital; contato do portador confirmando recebimento</td>
          </tr>
          <tr>
            <td><code>13.2</code> (recorrente)</td>
            <td>Termos de serviço assinados; e-mail de aviso de renovação; falta de solicitação de cancelamento</td>
          </tr>
          <tr>
            <td><code>12.6</code> (duplicata)</td>
            <td>Prova de que são transações diferentes (datas distintas, valores, ARNs)</td>
          </tr>
          <tr>
            <td><code>11.2</code> (autorização negada)</td>
            <td>Evidência de nova autorização aprovada para a mesma transação</td>
          </tr>
        </tbody>
      </table>

      <h2>Prazos — a armadilha mais comum</h2>
      <p>
        O prazo para responder um chargeback é rígido e varia por razão. Perder o prazo é
        perder o caso automaticamente, independente da qualidade da defesa.
      </p>
      <div className="callout">
        <strong>Regra geral Visa:</strong> 30 dias corridos a partir da data do chargeback
        para submeter o representment. Após esse prazo, o valor é definitivamente debitado.
      </div>

      <h2>Quando NÃO representar</h2>
      <p>
        Nem todo chargeback vale a pena disputar. Calcule o custo-benefício:
      </p>
      <ul>
        <li>
          <strong>Valor baixo ({"<"} R$ 30):</strong> o custo operacional de montar a defesa
          muitas vezes supera o valor a recuperar.
        </li>
        <li>
          <strong>Sem evidências:</strong> representment sem documentação adequada piora seu
          histórico de disputas — bandeiras monitoram a taxa de reverso de representment.
        </li>
        <li>
          <strong>Erro próprio (12.x):</strong> se você processou em duplicata ou com valor
          errado, a melhor resposta é emitir o crédito proativamente antes do chargeback.
        </li>
        <li>
          <strong>Portador tem razão:</strong> insistir em um caso perdedor leva a arbitragem
          e multa da bandeira (USD 500+).
        </li>
      </ul>

      <h2>Erros que invalidam o representment</h2>
      <ul>
        <li>Documentos ilegíveis ou incompletos</li>
        <li>Evidência fora do escopo do reason code</li>
        <li>Não incluir o ARN ou referência da transação original</li>
        <li>Submeter fora do prazo por 1 dia (sem exceção)</li>
        <li>Reapresentar um caso já arbitrado pela bandeira</li>
      </ul>

      <div className="callout">
        <strong>Best practice:</strong> Automatize a triagem de chargebacks. Classifique por
        reason code, valor e disponibilidade de evidência. Dispute apenas casos com {">"} 60%
        de chance estimada de reverso. Isso maximiza o win rate e protege seu histórico.
      </div>
    </>
  ),

  "compelling-evidence-30": (
    <>
      <p>
        Friendly fraud é quando um portador realiza uma compra legítima e depois contesta
        o débito — alegando que não reconhece a transação. Em e-commerce, estima-se que 35–40%
        dos chargebacks são desse tipo. O{" "}
        <strong>Compelling Evidence 3.0 (CE 3.0)</strong> é a resposta da Visa para esse
        problema.
      </p>

      <h2>A lógica do CE 3.0</h2>
      <p>
        Se um portador já comprou nesse mesmo lojista antes, com o mesmo cartão, no mesmo
        dispositivo, e nunca contestou essas compras anteriores — ele reconhece o lojista.
        O CE 3.0 permite ao lojista usar essas transações anteriores como prova.
      </p>

      <h2>Os 2 critérios obrigatórios</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Critério</th><th>Detalhe</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Prior undisputed transaction</td>
            <td>Ao menos 1 transação anterior, nos últimos 120 dias, mesmo PAN, mesmo MID, não contestada</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Device ID ou IP compartilhado</td>
            <td>A transação anterior e a disputada devem ter o mesmo Device ID ou endereço IP</td>
          </tr>
        </tbody>
      </table>

      <h2>Reason codes elegíveis</h2>
      <ul>
        <li><code>10.4</code> — Other Fraud (Card Absent): portador nega ter autorizado</li>
        <li><code>13.1</code> — Merchandise Not Received: portador alega não ter recebido</li>
      </ul>

      <h2>Campos técnicos (BASE II / PDS)</h2>
      <p>
        O CE 3.0 requer que o adquirente envie campos específicos no arquivo de clearing:
      </p>
      <table>
        <thead>
          <tr><th>Campo</th><th>Conteúdo</th></tr>
        </thead>
        <tbody>
          <tr><td><code>DE 60 / Tag 72</code></td><td>Device fingerprint ou endereço IP da sessão</td></tr>
          <tr><td><code>DE 60 / Tag 75</code></td><td>ARN ou RRN da prior undisputed transaction</td></tr>
          <tr><td><code>DE 60 / Tag 76</code></td><td>Tipo de mercadoria (para RC 13.1)</td></tr>
        </tbody>
      </table>

      <h2>O que mudou do CE 2.0</h2>
      <ul>
        <li>CE 2.0 exigia 2 transações anteriores; CE 3.0 exige apenas 1</li>
        <li>A janela caiu de 365 para 120 dias</li>
        <li>O Device ID/IP se tornou obrigatório (antes era opcional)</li>
        <li>RC 13.1 passou a ser elegível (antes era só 10.4)</li>
      </ul>

      <div className="callout">
        <strong>Pré-requisito operacional:</strong> Para usar CE 3.0, o lojista precisa
        capturar e armazenar Device ID ou IP de cada sessão de compra. Sem esse dado, o
        Critério 2 não pode ser atendido e a defesa é inválida.
      </div>
    </>
  ),

  "reducao-de-chargebacks": (
    <>
      <p>
        O melhor chargeback é o que nunca acontece. Prevenção é mais barata que disputa —
        e garante que você nunca entre nos programas de monitoramento das bandeiras (VAMP,
        VFMP, ECP). Cada ferramenta abaixo age em uma camada diferente do problema.
      </p>

      <h2>1. 3DS 2.x — autenticação forte</h2>
      <p>
        O 3D Secure 2.x é a linha de defesa mais poderosa contra fraude CNP. Quando a
        autenticação tem sucesso (ECI 05), a <strong>responsabilidade pelo chargeback de
        fraude muda para o emissor</strong> — o lojista fica protegido de 10.4.
      </p>
      <div className="callout">
        <strong>ECI 05 + CAVV:</strong> se você transmitir esses dados no clearing, um
        chargeback 10.4 não tem como prosperar contra você. O emissor assumiu a responsabilidade
        ao autenticar.
      </div>

      <h2>2. AVS — Address Verification Service</h2>
      <p>
        O AVS compara o CEP/endereço fornecido pelo portador com o cadastrado no emissor.
        Não é infalível, mas reduz significativamente fraude de cartão roubado em que o
        fraudador não tem os dados de endereço.
      </p>
      <ul>
        <li>Match total (CEP + número): risco muito baixo</li>
        <li>Match parcial: risco médio — avaliar outros sinais</li>
        <li>No match: considerar recusar ou solicitar verificação adicional</li>
      </ul>

      <h2>3. CVV2 em e-commerce</h2>
      <p>
        Exigir o CVV2 (os 3 dígitos do verso) reduz fraude de dados vazados. CVV2 não é
        armazenado por lei (PCI DSS) — então um dado de cartão vazado sem CVV2 tem valor
        muito menor para fraudadores.
      </p>

      <h2>4. Device Fingerprinting</h2>
      <p>
        Capturar um identificador único do dispositivo do comprador permite:
      </p>
      <ul>
        <li>Detectar múltiplas contas usando o mesmo device (fraude de identidade)</li>
        <li>Identificar dispositivos usados em chargebacks anteriores</li>
        <li>Preencher o Critério 2 do CE 3.0 automaticamente</li>
      </ul>
      <p>
        Soluções: Fingerprint.js, Seon, ThreatMetrix, Kount. O dado deve ser armazenado
        vinculado ao ARN de cada transação.
      </p>

      <h2>5. Descritores de fatura claros</h2>
      <p>
        Muitos chargebacks acontecem não por fraude, mas porque o portador não reconhece
        o nome na fatura. Um descritor como <code>LOJA*NOMEABREV</code> ou{" "}
        <code>EMPRESA + 0800XXXXXX</code> reduz drasticamente esse tipo de caso.
      </p>
      <ul>
        <li>Use o nome mais reconhecível do negócio, não a razão social</li>
        <li>Inclua número de contato sempre que possível</li>
        <li>Para assinaturas, inclua a periodicidade: <code>NOME/MES</code></li>
      </ul>

      <h2>6. Comunicação proativa</h2>
      <p>
        Email de confirmação após a compra + notificação de envio + suporte fácil de contato
        = menos chargebacks por "não recebi" ou "não reconheço". Portadores que conseguem
        resolver problemas com o lojista raramente abrem disputa no banco.
      </p>

      <div className="callout">
        <strong>Regra de bolso:</strong> se sua taxa de chargeback ultrapassa 0,9% das
        transações mensais, você já está no radar do VFMP (Visa Fraud Monitoring Program).
        Acima de 1,0%, você entra no programa e começa a pagar penalidades. Prevenção aqui
        é literalmente menos costosa.
      </div>
    </>
  ),
};

// ─── Conteúdo placeholder para lições ainda não escritas ──────────────────────

const PLACEHOLDER = (titulo: string, descricao: string) => (
  <>
    <p>{descricao}</p>
    <div className="callout">
      <strong>Em construção:</strong> Esta lição — <em>{titulo}</em> — está sendo preparada.
      Volte em breve para acessar o conteúdo completo.
    </div>
  </>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LicaoPage({ params }: Props) {
  const { trilha: trilhaSlug, licao: licaoSlug } = await params;

  const trilha = findTrilha(trilhaSlug);
  if (!trilha) notFound();

  const todas = flatLicoes(trilha);
  const licaoIndex = todas.findIndex((l) => l.id === licaoSlug);
  if (licaoIndex === -1) notFound();

  const licao = todas[licaoIndex];
  const anterior = licaoIndex > 0 ? todas[licaoIndex - 1] : undefined;
  const proximo = licaoIndex < todas.length - 1 ? todas[licaoIndex + 1] : undefined;

  const conteudo = CONTEUDO[licaoSlug] ?? PLACEHOLDER(licao.titulo, licao.descricao);

  return (
    <LicaoLayout
      trilhaId={trilha.id}
      trilhaTitulo={trilha.titulo}
      trilhaCor={trilha.cor}
      licaoId={licao.id}
      titulo={licao.titulo}
      tempo={licao.tempo}
      tipo={licao.tipo}
      termos={licao.termos}
      simulador={licao.simulador}
      anterior={anterior}
      proximo={proximo}
    >
      {conteudo}
    </LicaoLayout>
  );
}
