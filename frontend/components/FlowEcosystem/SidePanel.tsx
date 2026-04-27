import { X, BookOpen, Calculator, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Node } from '@xyflow/react';
import { NodeData } from './nodes';

type SidePanelProps = {
  node: Node<NodeData> | null;
  onClose: () => void;
};

type TrilhaLink = { id: string; licao: string; label: string };

const NODE_META: Record<string, { body: React.ReactNode; trilha?: TrilhaLink }> = {

  lojista: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'atores', label: 'Os 5 atores da transação' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Lojista / POS</strong> é o ponto de origem da transação. No mundo físico, é um terminal POS, PIN pad ou pinhole. No digital, é a página de checkout.</p>
        <p>O lojista captura os dados do cartão (via chip, NFC ou digitação) e os envia para o <strong>Gateway de pagamento</strong>. Ele nunca aprova ou nega — só transmite.</p>
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="font-mono text-xs font-semibold text-foreground mb-1">Identificadores do lojista:</p>
          <ul className="space-y-1 text-xs list-disc pl-4">
            <li><strong>MCC</strong> (DE 18) — tipo de negócio (4 dígitos)</li>
            <li><strong>Merchant ID</strong> (DE 42) — código único no adquirente</li>
            <li><strong>Terminal ID</strong> (DE 41) — identifica o POS específico</li>
          </ul>
        </div>
      </div>
    ),
  },

  gateway: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'autorizacao', label: 'Autorização: menos de 1.5s' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Gateway</strong> traduz os dados do terminal para uma mensagem <strong>ISO 8583</strong> — o protocolo padrão de pagamentos.</p>
        <p>Ele monta o MTI (Message Type Indicator) <code className="text-xs bg-muted px-1 rounded">0100</code> (Authorization Request), preenche os Data Elements e envia para o adquirente.</p>
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="font-mono text-xs font-semibold text-foreground mb-1">Data Elements críticos:</p>
          <ul className="space-y-1 text-xs list-disc pl-4">
            <li><strong>DE 2</strong> — PAN do cartão</li>
            <li><strong>DE 4</strong> — Valor da transação</li>
            <li><strong>DE 22</strong> — POS Entry Mode (chip/NFC/tarja)</li>
            <li><strong>DE 55</strong> — Dados EMV do chip</li>
          </ul>
        </div>
      </div>
    ),
  },

  adquirente: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'atores', label: 'Os 5 atores da transação' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Adquirente</strong> (credenciador) recebe a mensagem ISO 8583 e faz o roteamento baseado no <strong>BIN</strong> do cartão — os primeiros 6–8 dígitos que identificam a bandeira e o emissor.</p>
        <p>Se o BIN é Visa, roteia para a VisaNet. Se é Mastercard, para o Banknet. É o adquirente que paga a <strong>taxa de intercâmbio</strong> ao emissor e cobra o <strong>MDR</strong> do lojista.</p>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-2 font-bold mb-1 text-xs">
            <Calculator size={13} /> Custo do adquirente
          </div>
          <p className="text-xs">MDR cobrado = Intercâmbio pago + Fee Bandeira + Margem própria</p>
        </div>
      </div>
    ),
  },

  visa_switch: {
    trilha: { id: 'visa-deep-dive', licao: 'visanet-e-vbs', label: 'VisaNet e VBS: a espinha dorsal' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">VisaNet</strong> é a rede global de autorização da Visa. O módulo <strong>VIP (Visa Interchange Processing)</strong> recebe a mensagem ISO 8583, valida os campos e roteia para o emissor correto pelo BIN.</p>
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="font-mono text-xs font-semibold text-foreground mb-1">Métricas e proteção:</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>VAA Score (Visa Advanced Authorization)</li>
            <li>Prevenção de ataques de enumeração BIN</li>
            <li><strong>STIP</strong> — Stand-In: Visa aprova se emissor cair</li>
          </ul>
        </div>
        <p className="text-xs">Processa mais de 65.000 transações/segundo no pico global.</p>
      </div>
    ),
  },

  visa_issuer: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'atores', label: 'Os 5 atores da transação' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Emissor Visa</strong> é o banco que emitiu o cartão. Recebe o pedido de autorização da VisaNet e decide: aprovar ou recusar.</p>
        <p>O emissor valida o <strong>ARQC</strong> (criptograma do chip EMV), consulta o limite disponível, aplica regras de fraude e responde com o MTI <code className="text-xs bg-muted px-1 rounded">0110</code>.</p>
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-blue-400">
          <p className="text-xs font-semibold mb-1">Response Codes principais:</p>
          <ul className="text-xs space-y-0.5 list-disc pl-4">
            <li><strong>00</strong> — Aprovado</li>
            <li><strong>05</strong> — Recusado (genérico)</li>
            <li><strong>51</strong> — Saldo insuficiente</li>
            <li><strong>54</strong> — Cartão vencido</li>
          </ul>
        </div>
      </div>
    ),
  },

  visa_clearing: {
    trilha: { id: 'visa-deep-dive', licao: 'vss-e-clearing-visa', label: 'VSS: como o clearing Visa funciona' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">VSS (Visa Settlement Service)</strong> / BASE II processa a compensação financeira noturna (D+1). É aqui que a <strong>Taxa de Intercâmbio Visa</strong> é efetivamente calculada.</p>
        <p>O adquirente envia o arquivo BASE II com todos os campos da transação (PID, AFS, ECI, POS Entry Mode). O VSS faz o lookup na tabela de intercâmbio e devolve o <strong>VCF</strong> com o IRD e valor calculado.</p>
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-primary">
          <div className="flex items-center gap-2 font-bold mb-1 text-xs">
            <Calculator size={13} /> Motor de Intercâmbio
          </div>
          <p className="text-xs">Equivale ao endpoint <code>/calcular/visa/tecnico</code> — lê a planilha Visa e simula o VSS.</p>
        </div>
      </div>
    ),
  },

  mc_switch: {
    trilha: { id: 'intercambio-tecnico', licao: 'irds-mastercard', label: 'IRDs Mastercard: IA, HU, AU e ajustes' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Banknet</strong> é a rede de autorização da Mastercard, equivalente ao VisaNet. Também opera Stand-In (STIP) quando o emissor está indisponível.</p>
        <p>Uma diferença importante: a Mastercard usa o campo <strong>ECSLI</strong> (Mastercard-specific) no lugar do ECI da Visa para indicar o nível de autenticação 3DS.</p>
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs font-semibold text-foreground mb-1">ECSLI → IRD mapping:</p>
          <ul className="text-xs list-disc pl-4 space-y-0.5">
            <li><strong>FRICTIONLESS</strong> → IRD AU (melhor taxa)</li>
            <li><strong>CHALLENGED</strong> → IRD AU/AV</li>
            <li><strong>NOT_AUTH</strong> → IRD HU (maior risco)</li>
          </ul>
        </div>
      </div>
    ),
  },

  mc_issuer: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'clearing-e-settlement', label: 'Clearing e Settlement' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Emissor Mastercard</strong> autoriza a transação e, no clearing, recebe a taxa de intercâmbio calculada pelo IPM.</p>
        <p>No IPM (Integrated Payment Module), os dados do produto do cartão vêm em <strong>PDS tags</strong>: PDS 0043 (tier), PDS 0002 (product code), PDS 0052 (ECSLI).</p>
        <div className="bg-muted/50 rounded-lg p-3 border border-border text-xs">
          <p className="font-semibold text-foreground mb-1">Posição do emissor no MDR:</p>
          <p>Recebe o intercâmbio — maior quando o cartão é premium (black), menor quando é standard. É por isso que emissores estimulam o upgrade de produto.</p>
        </div>
      </div>
    ),
  },

  mc_clearing: {
    trilha: { id: 'visa-deep-dive', licao: 'base-ii-e-ipm', label: 'BASE II vs IPM: os dois formatos' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">Mastercard IPM</strong> (Integrated Payment Module) é a câmara de clearing noturna da Mastercard. Usa formato flexível com PDS tags (Private Data Subelements).</p>
        <p>Os MTIs do IPM: <code className="text-xs bg-muted px-1 rounded">1240</code> (presentment), <code className="text-xs bg-muted px-1 rounded">1442</code> (chargeback), <code className="text-xs bg-muted px-1 rounded">1644</code> (fee collection).</p>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-2 font-bold mb-1 text-xs">
            <Calculator size={13} /> Motor de Intercâmbio
          </div>
          <p className="text-xs">Equivale ao endpoint <code>/calcular/tecnico</code> — aplica a cascata de IRDs do <code>Novo_Intercambio.xlsx</code>.</p>
        </div>
      </div>
    ),
  },

  settlement: {
    trilha: { id: 'do-zero-ao-intercambio', licao: 'clearing-e-settlement', label: 'Clearing e Settlement' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>A <strong className="text-foreground">Liquidação SPB</strong> é a transferência real do dinheiro. No Brasil, ocorre via <strong>CIP (Câmara Interbancária de Pagamentos)</strong> e STR (Sistema de Transferência de Reservas) do Banco Central.</p>
        <p>O adquirente paga uma posição líquida: total de intercâmbio devidos aos emissores, menos o que recebeu. Um único débito/crédito settle milhares de transações.</p>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-500">
          <p className="text-xs font-semibold mb-1">Distribuição do MDR no settlement:</p>
          <ul className="text-xs list-disc pl-4 space-y-0.5">
            <li>Intercâmbio → pago ao Emissor</li>
            <li>Fee de Bandeira → pago à Visa/MC</li>
            <li>Margem → fica com o Adquirente</li>
            <li>Líquido → creditado ao Lojista (EFA)</li>
          </ul>
        </div>
      </div>
    ),
  },

  tds_server: {
    trilha: { id: 'intercambio-tecnico', licao: 'eci-e-autenticacao', label: 'ECI e como a autenticação vira desconto' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">3DS Server</strong> coordena o protocolo Three-Domain Secure entre lojista (domínio 1), bandeira (domínio 2) e emissor (domínio 3).</p>
        <p>O resultado é um <strong>ECI (Electronic Commerce Indicator)</strong> que segue com a transação:</p>
        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-purple-400">
          <ul className="text-xs list-disc pl-4 space-y-1">
            <li><strong>ECI 05</strong> — Autenticado com sucesso → menor taxa</li>
            <li><strong>ECI 06</strong> — Tentativa (emissor não participante) → taxa média</li>
            <li><strong>ECI 07</strong> — Sem autenticação → maior taxa</li>
          </ul>
        </div>
        <p className="text-xs">Modo <strong>Frictionless</strong>: emissor autentica silenciosamente com dados de risco. O portador não percebe, mas o ECI muda de 07 para 05 — economia de até 0,45 p.p. de intercâmbio.</p>
      </div>
    ),
  },

  token_service: {
    trilha: { id: 'visa-deep-dive', licao: 'vts-e-tokenizacao', label: 'VTS: Visa Token Service' },
    body: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>O <strong className="text-foreground">VTS / MDES</strong> (Visa Token Service / Mastercard Digital Enablement Service) substitui o PAN por um <strong>DPAN</strong> específico ao dispositivo.</p>
        <p>Quando o portador adiciona o cartão ao Apple Pay ou Google Pay, o Token Service provisiona um DPAN único. Nos pagamentos NFC subsequentes, o DPAN (e nunca o PAN real) é transmitido.</p>
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-lg text-cyan-400">
          <p className="text-xs font-semibold mb-1">Ciclo do token:</p>
          <ol className="text-xs list-decimal pl-4 space-y-0.5">
            <li>Provisioning — DPAN gerado e ligado ao dispositivo</li>
            <li>Activation — emissor aprova o token</li>
            <li>Uso — pagamento NFC usa DPAN + criptograma dinâmico</li>
            <li>Detokenização — VisaNet converte DPAN → PAN antes do emissor</li>
          </ol>
        </div>
      </div>
    ),
  },
};

export default function SidePanel({ node, onClose }: SidePanelProps) {
  if (!node) return null;

  const data = node.data;
  const meta = NODE_META[node.id];

  return (
    <div className="absolute top-4 bottom-4 right-4 w-96 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div
        className="p-5 border-b flex items-start justify-between"
        style={{ borderBottomColor: `${data.color}20`, background: `linear-gradient(to bottom, ${data.color}10, transparent)` }}
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: data.color }}>
            {data.sub}
          </div>
          <h2 className="text-xl font-bold text-foreground">{data.label}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto flex-1">
        {meta?.body ?? (
          <p className="text-sm text-muted-foreground">
            Detalhes sobre <strong>{data.label}</strong> — componente da arquitetura de pagamentos.
          </p>
        )}

        {/* Link para trilha */}
        {meta?.trilha && (
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen size={12} /> Ver na trilha
            </p>
            <Link
              href={`/trilhas/${meta.trilha.id}/${meta.trilha.licao}`}
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors group"
              style={{ borderColor: `${data.color}25`, background: `${data.color}08` }}
            >
              <span className="text-sm font-medium" style={{ color: data.color }}>
                {meta.trilha.label}
              </span>
              <ChevronRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        )}

        {/* Links estáticos — Acervo */}
        <div className="mt-5 pt-5 border-t border-border">
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
            <ExternalLink size={12} /> Documentação relacionada
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href="/acervo"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-left group text-sm text-muted-foreground"
            >
              Core Rules & VDMG
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-foreground" />
            </a>
            <a
              href="/acervo"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-left group text-sm text-muted-foreground"
            >
              Interchange Compliance
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-foreground" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
