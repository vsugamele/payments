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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findTrilha(slug: string) {
  return trilhasData.trilhas.find((t) => t.id === slug);
}

function flatLicoes(trilha: any): (LicaoMeta & { trilhaId: string })[] {
  if (!trilha) return [];
  return trilha.modulos.flatMap((m: any) =>
    m.licoes.map((l: any) => ({ ...(l as LicaoMeta), trilhaId: trilha.id }))
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

// ─── Conteúdo das lições (Currículo Técnico) ──────────────────────────────────

const CONTEUDO: Record<string, React.ReactNode> = {
  // ── Trilha 1: Fundamentos ──────────────────────────────────────────────────
  atores: (
    <>
      <p>O ecossistema de pagamentos é uma rede interconectada de atores com responsabilidades bem definidas. Entender "quem é quem" é o primeiro passo para navegar na mensageria técnica.</p>
      <h2>1. Adquirente (Acquirer)</h2>
      <p>É a credenciadora que habilita o lojista a aceitar cartões. Ela captura a transação e é a <strong>responsável final</strong> perante a bandeira por todas as ações de seus parceiros.</p>
      <div className="callout">
        <strong>Ponto de Compliance:</strong> Subadquirentes (PF) assumem a gestão de lojistas menores, mas o Adquirente é quem responde pela liquidação e multas perante a bandeira.
      </div>
      <h2>2. Emissor (Issuer)</h2>
      <p>Instituição que emite o cartão para o portador, gere o limite de crédito/saldo e assume o risco de inadimplência.</p>
      <h2>3. Bandeira (Scheme)</h2>
      <p>Rede global (Visa, Mastercard, Elo) que dita as regras do jogo, estabelece os padrões técnicos e opera o roteamento das mensagens.</p>
    </>
  ),

  glossario: (
    <>
      <p>No mundo dos pagamentos, falamos em siglas. Aqui estão as essenciais:</p>
      <ul>
        <li><strong>ICA (Interbank Card Association):</strong> O identificador numérico único de um banco ou adquirente na rede Mastercard.</li>
        <li><strong>BIN (Bank Identification Number):</strong> Os primeiros 6 a 8 dígitos do cartão que identificam a bandeira, o banco emissor e o tipo de produto.</li>
        <li><strong>MCC (Merchant Category Code):</strong> Código de 4 dígitos que classifica o ramo de atividade do lojista (ex: 5812 para Restaurantes).</li>
        <li><strong>TID (Terminal ID):</strong> Identificador único do ponto de venda (POS/Gateway).</li>
      </ul>
    </>
  ),

  arquitetura: (
    <>
      <p>Existem duas arquiteturas principais de processamento de mensagens:</p>
      <h2>Dual Message System (Crédito)</h2>
      <p>A autorização (mensagens 0100/0110) reserva o saldo em tempo real, mas o dinheiro só se move com o envio do arquivo de compensação/Clearing (1240/IPM) em lote.</p>
      <h2>Single Message System (Débito)</h2>
      <p>Usado no débito/Maestro. A autorização e o clearing acontecem na <strong>mesma mensagem</strong> (0200) em tempo real.</p>
    </>
  ),

  // ── Trilha 2: Engenharia ────────────────────────────────────────────────────
  "de-vs-pds": (
    <>
      <p>A mensageria ISO 8583 usa campos chamados <strong>Data Elements (DE)</strong> e sub-campos chamados <strong>Private Data Subelements (PDS)</strong>.</p>
      <ul>
        <li><strong>DE (Data Element):</strong> Usados na autorização online (ex: DE 4 para valor).</li>
        <li><strong>PDS (Private Data):</strong> Viajam no arquivo de Clearing financeiro (1240) agrupados no campo DE 48.</li>
      </ul>
    </>
  ),

  "jabuticabas-clearing": (
    <>
      <p>O Brasil possui regras únicas (Jabuticabas) mandatórias:</p>
      <h2>1. Parcelado Lojista</h2>
      <p>Nasce no <strong>DE 112</strong> (Subelemento 1, valor 70) na Autorização e vira <strong>PDS 0181</strong> no Clearing. Se a soma das parcelas no PDS 0181 não bater com o valor total, o arquivo é rejeitado.</p>
      <h2>2. Compliance Fiscal (CNPJ)</h2>
      <p>Obrigatoriedade de enviar o CNPJ/CPF do lojista no clearing através do <strong>PDS 0220</strong> (Merchant Tax ID).</p>
      <h2>3. Pré-Datado</h2>
      <p>Usa o <strong>PDS 0183</strong>. Define se o emissor garante o saldo (Service Code 30) ou não (Service Code 31).</p>
    </>
  ),

  "vouchers-flex": (
    <>
      <p>Cartões de benefício (Vouchers) no Brasil:</p>
      <ul>
        <li><strong>PDS 0027 (Flex Code):</strong> Identifica a modalidade de benefício no clearing.</li>
        <li><strong>MBM (Refeição) e MBF (Alimentação):</strong> Códigos de produto para roteamento correto.</li>
      </ul>
    </>
  ),

  // ── Trilha 3: Operações ─────────────────────────────────────────────────────
  "ciclo-mastercom": (
    <>
      <p>Disputas na Mastercard (Mastercom):</p>
      <ul>
        <li><strong>First Chargeback (1442):</strong> Rejeição do emissor.</li>
        <li><strong>Representação (1240):</strong> Defesa do adquirente através do Second Presentment.</li>
      </ul>
    </>
  ),

  "regra-de-ouro-prazos": (
    <>
      <p>Timeframes críticos:</p>
      <ul>
        <li><strong>Clearing Normal:</strong> Até 7 dias corridos para enviar a venda.</li>
        <li><strong>MoneySend e Gaming:</strong> Apenas 1 dia corrido para envio do clearing.</li>
      </ul>
    </>
  ),

  "refunds-match": (
    <>
      <p>Segurança e Estornos:</p>
      <h2>Refunds (Proc Code 20)</h2>
      <p>Exige <strong>Autorização Online prévia</strong> para estornos e envio do clearing em até 1 dia.</p>
      <h2>Filtro MATCH</h2>
      <p>Obrigatório consultar antes de credenciar lojistas para garantir que não tragam fraudadores expulsos por outras credenciadoras.</p>
    </>
  ),

  // ── Trilha 4: Inovação ──────────────────────────────────────────────────────
  "mdes-tokenizacao": (
    <>
      <p>Segurança em Carteiras Digitais:</p>
      <ul>
        <li><strong>MDES:</strong> Mascaramento do PAN real.</li>
        <li><strong>Wallet ID 327:</strong> Identifica compras via carteira digital.</li>
      </ul>
    </>
  ),

  "ucaf-criptogramas": (
    <>
      <p>Criptogramas dinâmicos:</p>
      <ul>
        <li><strong>DE 104:</strong> Campo do criptograma de segurança dinâmico.</li>
        <li><strong>DE 48.43 (UCAF):</strong> Transporte da prova de autenticação.</li>
      </ul>
    </>
  ),

  "eci-sli-calculator": (
    <>
      <p>Níveis de Segurança (ECI/SLI):</p>
      <ul>
        <li><strong>ECI 242:</strong> Autenticado com sucesso (Liability Shift).</li>
        <li><strong>ECI 216:</strong> Decisão de risco do Merchant (sem proteção).</li>
      </ul>
    </>
  ),

  // ── Trilha 5: Billing ───────────────────────────────────────────────────────
  "billing-events": (
    <>
      <p>Faturamento Mastercard (MCBS) é baseado em <strong>Eventos de Billing</strong>. A bandeira cobra por cada evento técnico processado na rede.</p>
    </>
  ),

  "tradutor-mcbs": (
    <>
      <p>Tradutor de Eventos Críticos:</p>
      <ul>
        <li><strong>2AB1001:</strong> Taxa de acesso à autorização.</li>
        <li><strong>2PN1011:</strong> Multa por Cut-off fail (perda do horário de corte).</li>
        <li><strong>2AB1116:</strong> Taxa por consulta de saldo (Account Status Inquiry).</li>
      </ul>
    </>
  ),
};

// ─── Conteúdo placeholder ────────────────────────────────────────────────────

const PLACEHOLDER = (titulo: string, descricao: string) => (
  <>
    <p>{descricao}</p>
    <div className="callout">
      <strong>Em construção:</strong> Esta lição — <em>{titulo}</em> — está sendo preparada.
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
      <div className="prose prose-invert max-w-none">
        {conteudo}
      </div>
    </LicaoLayout>
  );
}
