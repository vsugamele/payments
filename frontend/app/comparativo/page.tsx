import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Comparativo Visa × Mastercard | VS Payments',
  description:
    'Tabela comparativa completa entre Visa e Mastercard: clearing, autorização, tokenização, 3DS e liquidação.',
};

// ── helpers ─────────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary inline-block" />
        {title}
      </h2>
      {children}
    </section>
  );
}

type Row = { aspecto: string; visa: string; mc: string; nota?: string };

function CompTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[220px]">
              Aspecto
            </th>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider w-[260px]"
                style={{ color: '#3b82f6' }}>
              Visa
            </th>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider w-[260px]"
                style={{ color: '#ef4444' }}>
              Mastercard
            </th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              Nota
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
              <td className="px-4 py-3 font-medium text-foreground align-top">{r.aspecto}</td>
              <td className="px-4 py-3 text-muted-foreground align-top">{r.visa}</td>
              <td className="px-4 py-3 text-muted-foreground align-top">{r.mc}</td>
              <td className="px-4 py-3 text-muted-foreground/60 text-xs align-top hidden lg:table-cell">
                {r.nota ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── dados ────────────────────────────────────────────────────────────────────

const autorizacao: Row[] = [
  { aspecto: 'Rede de roteamento',   visa: 'VisaNet (VIP)',           mc: 'Banknet',              nota: 'Ambas são redes globais redundantes' },
  { aspecto: 'Stand-In Processing',  visa: 'STIP (VisaNet)',          mc: 'STIP (Banknet)',        nota: 'Autoriza offline quando emissor indisponível' },
  { aspecto: 'MTI de autorização',   visa: '0100 (req) / 0110 (res)', mc: '0100 (req) / 0110 (res)', nota: 'ISO 8583 idêntico' },
  { aspecto: 'Código de resposta',   visa: 'Field 39 (2 dígitos)',    mc: 'Field 39 (2 dígitos)', nota: '00 = aprovado; 51 = sem limite' },
  { aspecto: 'Validação de chip',    visa: 'CAM (Card Auth Method)',  mc: 'M/Chip CDA/DDA',       nota: 'ARQC gerado pelo chip em ambos' },
  { aspecto: 'Token de wallet',      visa: 'VTS / DPAN',             mc: 'MDES / DPAN',          nota: 'PAN nunca trafega após tokenização' },
];

const clearing: Row[] = [
  { aspecto: 'Arquivo de clearing',  visa: 'BASE II',                mc: 'IPM (Integrated Payment Module)', nota: 'Ambos baseados em ISO 8583-87' },
  { aspecto: 'Formato',              visa: 'ISO 8583-87 bitstream',  mc: 'ISO 8583-87 bitstream',           nota: 'Diferem nos campos proprietários' },
  { aspecto: 'Identificador de tx',  visa: 'TC (Transaction Code)',  mc: 'MTI',                             nota: '' },
  { aspecto: 'Venda crédito',        visa: 'TC 05',                  mc: 'MTI 1240',                        nota: 'Financial Request' },
  { aspecto: 'Crédito/estorno',      visa: 'TC 06',                  mc: 'MTI 1240 + DE 25 = 20',           nota: '' },
  { aspecto: 'Fee Collection',       visa: 'TC 10 (adquirente → rede)', mc: 'MTI 1740',                   nota: 'Fee da bandeira cobrado aqui' },
  { aspecto: 'Arquivo final',        visa: 'VCF (Visa Clearing File)', mc: 'IPM nativo',                  nota: 'VCF gerado pelo VSS após clearing' },
  { aspecto: 'Timing envio',         visa: 'D+1 (até 23:59 UTC)',    mc: 'D+1 (até 23:59 UTC)',             nota: 'Window configurable por adquirente' },
  { aspecto: 'Reprocessamento',      visa: 'BASE II resubmit',       mc: 'IPM resubmit',                    nota: 'Permitido até D+30 em disputas' },
];

const settlement: Row[] = [
  { aspecto: 'Sistema',              visa: 'VSS (Visa Settlement Service)', mc: 'MCBS (Mastercard Billing & Settlement)', nota: '' },
  { aspecto: 'Método',               visa: 'Net settlement multilateral',   mc: 'Net settlement multilateral',           nota: 'Um único crédito/débito por participante' },
  { aspecto: 'Ciclo BR',             visa: 'D+1 via CIP/STR',               mc: 'D+1 via CIP/STR',                       nota: 'Banco Central — Câmara Interbancária' },
  { aspecto: 'Moeda',                visa: 'BRL (transações locais)',        mc: 'BRL (transações locais)',               nota: 'USD para cross-border' },
  { aspecto: 'Distribição',          visa: 'Bandeira retém fee → repassa intercâmbio ao emissor', mc: 'Mesmo fluxo', nota: 'Adquirente recebe líquido' },
  { aspecto: 'SPB',                  visa: 'TED via STR ao participante',    mc: 'TED via STR ao participante',           nota: 'Banco Central como contraparte central' },
];

const intercambio: Row[] = [
  { aspecto: 'Identificador produto',  visa: 'PID (Product ID)',         mc: 'Código de produto / PDS Tag 63', nota: '' },
  { aspecto: 'Exemplo crédito básico', visa: 'F^ — Classic',             mc: '101 — Standard',                nota: 'PIDs variam por país/emissor' },
  { aspecto: 'Campo qualificador',     visa: 'AFS (Field 61.5)',          mc: 'AIF (Tag 9F01)',                 nota: 'Define funding source' },
  { aspecto: 'Campo de canal',         visa: 'POS Entry Mode (Field 22)', mc: 'POS Entry Mode (Field 22)',      nota: '05=chip, 07=contactless, 81=e-comm' },
  { aspecto: 'Autenticação online',    visa: 'ECI (Field 61)',            mc: 'ECI (Field 48.42)',              nota: '05=autenticado, 07=sem auth' },
  { aspecto: 'SETTL_FLAG',             visa: 'Sim (define netting)',       mc: 'Sim (define netting)',           nota: '' },
  { aspecto: 'MCC',                    visa: 'Field 26 no clearing',      mc: 'DE 26',                         nota: 'Mesma tabela ISO 18245' },
  { aspecto: 'Taxa diferenciada',      visa: 'Regulated / Unregulated',   mc: 'Regulated / Unregulated',       nota: 'Limite de emissores regulados (BACEN)' },
];

const tds: Row[] = [
  { aspecto: 'Protocolo',             visa: '3DS 2.x (EMVCo)',           mc: '3DS 2.x (EMVCo)',         nota: 'Interoperável pela spec EMVCo' },
  { aspecto: 'ACS proprietário',      visa: 'Visa ACS',                  mc: 'Mastercard ACS',          nota: 'Cada bandeira mantém seu ACS' },
  { aspecto: 'Programa',              visa: 'Visa Secure',               mc: 'Mastercard Identity Check', nota: 'Nomes de marca do programa 3DS' },
  { aspecto: 'ECI 05',                visa: 'Autenticado c/ sucesso',     mc: 'Autenticado c/ sucesso',  nota: 'Menor taxa — liability shift' },
  { aspecto: 'ECI 06',                visa: 'Tentativa (frictionless)',   mc: 'Tentativa (frictionless)', nota: 'Partial liability shift' },
  { aspecto: 'ECI 07',                visa: 'Sem autenticação (CNP)',     mc: 'Sem autenticação (CNP)',   nota: 'Maior taxa — liability no adquirente' },
  { aspecto: 'Campo no clearing',     visa: 'Field 61 (ECI)',            mc: 'DE 48.42',                nota: '' },
  { aspecto: 'Frictionless rate BR',  visa: '~65-70% das transações',    mc: '~65-70% das transações',  nota: 'Varia por emissor / BIN' },
];

const tokenizacao: Row[] = [
  { aspecto: 'Sistema',               visa: 'VTS (Visa Token Service)',   mc: 'MDES (Digital Enablement Service)', nota: '' },
  { aspecto: 'Token (DPAN)',          visa: '16 dígitos, BIN 4xxxxx',    mc: '16 dígitos, BIN 5xxxxx',           nota: 'Não trafega no PAN real' },
  { aspecto: 'DCV (Domain Control)',  visa: 'Sim — ligado ao device',    mc: 'Sim — ligado ao device',           nota: 'Token inválido fora do domínio' },
  { aspecto: 'Wallets suportadas',    visa: 'Apple Pay, GPay, Samsung',  mc: 'Apple Pay, GPay, Samsung',         nota: 'Mesmas wallets, TSP diferente' },
  { aspecto: 'Ciclo de vida',         visa: 'Provision → Activate → Suspend → Delete', mc: 'Provision → Activate → Suspend → Delete', nota: '' },
  { aspecto: 'Campo de identificação', visa: 'Field 63 (Token Indicator)', mc: 'DE 48.33',                      nota: 'Informa se a tx usa token' },
];

// ── Fees de rede ──────────────────────────────────────────────────────────────

const feesRede: Row[] = [
  { aspecto: 'Sistema de billing',        visa: 'VSS (Visa Settlement Service) + programas', mc: 'MCBS (Mastercard Consolidated Billing System)', nota: 'MC detalha por Service ID; Visa embute em programas' },
  { aspecto: 'Coleta principal',          visa: 'TC10 no BASE II (clearing)',                 mc: 'IPM MTI 1740 via GCMS',                         nota: 'Equivalentes funcionais — ambos no ciclo D+1' },
  { aspecto: 'Coleta alternativa',        visa: 'Fatura direta Visa',                         mc: 'DDA/ACH (Company ID: 1952536378)',               nota: 'MC mandatória salvo impossibilidade regional' },
  { aspecto: 'Fee auth doméstico (max)',  visa: 'VisaNet Switching Fee (similar)',            mc: 'BRL 0.117/txn (> BRL 90) — Service AA',         nota: 'MC usa 5 tiers por valor de txn; Visa por produto' },
  { aspecto: 'Fee auth doméstico (min)',  visa: 'VisaNet Switching Fee (similar)',            mc: 'BRL 0.00196/txn (≤ BRL 10) — 2AB1006P',         nota: 'Micro-transações têm fee reduzido em ambas' },
  { aspecto: 'E-comm sem 3DS (adquirente)',visa:'FANF + multas VAMP/EFM',                    mc: 'BRL 0.00029/BRL + cap BRL 12 — 2AB3006M',        nota: 'MC cobra diretamente; Visa via programas compliance' },
  { aspecto: 'Validação 3DS',             visa: 'Incluso no fee de rede (VTS)',               mc: 'BRL 0.015501/txn — 2AB1790 (AAV validation)',   nota: 'MC cobra fee separado para validar o CAVV/AAV' },
  { aspecto: 'AVS (address verification)',visa: 'VSS — comparável por txn',                  mc: 'BRL 0.028682 dom / BRL 0.19128 intl — 2AV3006',  nota: 'Internacional 6× mais caro em ambas' },
  { aspecto: 'Tokenização contactless',   visa: 'VTS — incluso no programa',                 mc: 'BRL 0.019/txn NFC — 2AB1706',                   nota: 'MC detalha mapping PAN↔contactless separadamente' },
  { aspecto: 'MDES/VTS Lite (CNP)',       visa: 'Incluso no acordo VTS/DPAN',                mc: 'BRL 0.0002/BRL transacionado — 2AB2600',         nota: 'MC cobra amount-based; Visa inclui no contrato VTS' },
  { aspecto: 'Conectividade (mínimo)',    visa: 'VisaNet — similar por bytes',               mc: 'Mín. BRL 1.375/semana — 2CF1001/2001',           nota: 'Progressivo por volume de bytes em ambas' },
  { aspecto: 'Billing Updater',           visa: 'VAU (Visa Account Updater)',                mc: 'BRL 0.046/reg (mín. BRL 4.400/mês) — BU/2BU6600',nota: 'Reduz declínios em recorrência — ambas cobram' },
  { aspecto: 'Chargeback/representação',  visa: 'VROL — USD 15–25 por disputa',              mc: 'BRL 114.74 por item — 2CI201716',                nota: 'MC em BRL via MCBS; Visa em USD via VROL' },
  { aspecto: 'AML/compliance anual',      visa: 'Incluso em fees de compliance',             mc: 'BRL 16.000/ano (principal) — 2A81000S',          nota: 'ACAMS Risk Assessment obrigatório para novos membros MC' },
];

// ── TOC ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'autorizacao',  label: 'Autorização' },
  { id: 'clearing',     label: 'Clearing' },
  { id: 'settlement',   label: 'Settlement' },
  { id: 'intercambio',  label: 'Intercâmbio' },
  { id: '3ds',          label: '3DS' },
  { id: 'tokenizacao',  label: 'Tokenização' },
  { id: 'fees',         label: 'Fees de Rede' },
];

// ── page ─────────────────────────────────────────────────────────────────────

export default function ComparativoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 pt-28">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <span className="text-foreground">Comparativo</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Comparativo{' '}
            <span className="text-blue-400">Visa</span>
            {' '}×{' '}
            <span className="text-red-400">Mastercard</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Referência técnica lado a lado para autorização, clearing, liquidação,
            intercâmbio, 3DS e tokenização. Útil para análises de BIN, onboarding
            de emissores e certificação em ambas as redes.
          </p>
        </div>

        <div className="flex gap-10 items-start">

          {/* Sticky TOC (desktop) */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-28 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Seções
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {s.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              <Link href="/arquitetura"
                className="block text-xs text-primary hover:underline">
                → Ver Diagrama
              </Link>
              <Link href="/trilhas/visa-deep-dive/visanet-e-vbs"
                className="block text-xs text-primary hover:underline">
                → Trilha Visa
              </Link>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-12 min-w-0">

            <Section id="autorizacao" title="Autorização">
              <CompTable rows={autorizacao} />
            </Section>

            <Section id="clearing" title="Clearing (D+1)">
              <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400/90">
                <strong>BASE II vs IPM:</strong> apesar de ambos usarem ISO 8583-87, os campos proprietários
                (Field 62/63 na Visa; DE 48 subtags na MC) diferem completamente — um arquivo não é intercambiável.
              </div>
              <CompTable rows={clearing} />
            </Section>

            <Section id="settlement" title="Settlement">
              <CompTable rows={settlement} />
            </Section>

            <Section id="intercambio" title="Intercâmbio">
              <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400/90">
                <strong>Regra de ouro:</strong> o intercâmbio é determinado no clearing, não na autorização.
                PID/Produto, AFS, ECI, MCC e POS Entry Mode devem estar corretos no BASE II / IPM para a
                taxa correta ser aplicada.
              </div>
              <CompTable rows={intercambio} />
            </Section>

            <Section id="3ds" title="3DS — Autenticação Online">
              <CompTable rows={tds} />
            </Section>

            <Section id="tokenizacao" title="Tokenização">
              <CompTable rows={tokenizacao} />
            </Section>

            <Section id="fees" title="Fees de Rede — MCBS × VSS">
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400/90">
                <strong>Fonte MCBS:</strong> tarifas Mastercard extraídas do{' '}
                <span className="font-mono">MCBS_Pricing_Guide_BRA_20241119.pdf</span> (Nov 2024).
                Mastercard usa Service IDs granulares; Visa embute fees em programas (FANF, VAMP, VTS).{' '}
                <Link href="/mcbs" className="underline hover:text-red-300">Ver guia MCBS completo →</Link>
              </div>
              <CompTable rows={feesRede} />
            </Section>

            {/* Footer links */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-sm">
              <Link href="/mcbs"
                className="text-primary hover:underline">
                Guia MCBS completo →
              </Link>
              <Link href="/arquitetura"
                className="text-primary hover:underline">
                Ver fluxo no diagrama de arquitetura →
              </Link>
              <Link href="/trilhas/visa-deep-dive/base-ii-e-ipm"
                className="text-primary hover:underline">
                Aula: BASE II e IPM em detalhe →
              </Link>
              <Link href="/simulador"
                className="text-primary hover:underline">
                Simular intercâmbio →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
