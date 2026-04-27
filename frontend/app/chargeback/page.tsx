import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle, Clock, ArrowRight, ArrowLeft, CheckCircle2,
  XCircle, ShieldCheck, FileText, Users, Building2, CreditCard,
  Scale, Timer, AlertOctagon,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chargeback — Ciclo de Disputa | VS Payments',
  description:
    'Guia visual completo do ciclo de disputa: da contestação do portador ao arbitramento, prazos, reason codes Visa × Mastercard e liability shift.',
};

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── Phase timeline ────────────────────────────────────────────────────────────

type Phase = {
  step: number;
  label: string;
  actor: string;
  actorColor: string;
  deadline: string;
  desc: string;
  subItems?: string[];
  warn?: string;
};

const PHASES: Phase[] = [
  {
    step: 1,
    label: 'Contestação do Portador',
    actor: 'Portador / Emissor',
    actorColor: '#6366f1',
    deadline: 'Até 120 dias após a transação',
    desc: 'O portador identifica uma cobrança indevida e aciona o banco emissor. Motivos: fraude (não reconhece), produto não entregue, divergência de valor, processamento duplicado.',
    subItems: [
      'Emissor analisa a reclamação e abre a disputa internamente',
      'Se houver base, inicia o processo formal na rede',
    ],
  },
  {
    step: 2,
    label: 'Retrieval Request (1ª Fase)',
    actor: 'Emissor → Adquirente',
    actorColor: '#0ea5e9',
    deadline: 'Visa: até 30 dias | MC: não obrigatório no 3DS 2.x',
    desc: 'O emissor solicita documentação da transação ao adquirente antes de abrir o chargeback formal. O adquirente tem 30 dias para responder com o comprovante (recibo, log de autorização).',
    warn: 'Falha em responder ao retrieval torna a transação automaticamente chargebackável.',
  },
  {
    step: 3,
    label: 'First Chargeback',
    actor: 'Emissor → Bandeira → Adquirente',
    actorColor: '#f59e0b',
    deadline: 'Visa: até 120 dias | MC: até 120 dias da data de apresentação',
    desc: 'O emissor registra o chargeback formal na rede (VROL/Visa ou MCOM/MC). O valor é debitado do adquirente e creditado provisoriamente ao portador.',
    subItems: [
      'TC 25 no BASE II (Visa) ou MTI 1442 no IPM (Mastercard)',
      'Reason code define o tipo da disputa e os direitos de defesa',
      'Adquirente tem 30–45 dias para representação',
    ],
  },
  {
    step: 4,
    label: 'Representação (2ª Apresentação)',
    actor: 'Adquirente → Bandeira → Emissor',
    actorColor: '#10b981',
    deadline: '30–45 dias após receber o chargeback',
    desc: 'O adquirente contesta o chargeback enviando evidências: comprovante de entrega, log 3DS com ECI 05/06, autorização válida com AVS/CVV, política de reembolso assinada.',
    subItems: [
      'TC 05 na 2ª apresentação com campo 72 indicando "representment"',
      'Se o emissor aceitar, o valor retorna ao adquirente — fim do ciclo',
      'Se rejeitar, escala para pre-arbitration',
    ],
  },
  {
    step: 5,
    label: 'Pre-Arbitration / Second Chargeback',
    actor: 'Emissor → Adquirente',
    actorColor: '#ef4444',
    deadline: 'Visa: 30 dias | MC: 45 dias após representação',
    desc: 'Emissor rejeita a representação e envia um segundo chargeback (Visa) ou inicia o processo de pré-arbitragem (MC). Adquirente tem mais 30 dias para aceitar ou escalar.',
    warn: 'Visa eliminou o 2nd chargeback em 2019 (VCR). MC mantém em casos específicos.',
  },
  {
    step: 6,
    label: 'Arbitragem (Bandeira decide)',
    actor: 'Bandeira (Visa / Mastercard)',
    actorColor: '#8b5cf6',
    deadline: 'Bandeira decide em 30–60 dias',
    desc: 'Bandeira revisa toda a documentação e emite decisão final vinculante. A parte perdedora paga o valor + taxa de arbitragem (USD 500 Visa, USD 250 MC). Não há recurso após arbitragem.',
    subItems: [
      'Taxa de arbitragem é dissuasora — maioria dos casos se resolve antes',
      'Decisão considera compliance dos dois lados com as regras da bandeira',
    ],
  },
];

// ── Reason codes ──────────────────────────────────────────────────────────────

type ReasonCode = { visa: string; mc: string; desc: string; liability: 'emissor' | 'adquirente' | 'condicional' };

const REASON_CODES: ReasonCode[] = [
  { visa: '10.1', mc: '4837', desc: 'Fraude — Transação não reconhecida (CNP)',       liability: 'adquirente' },
  { visa: '10.2', mc: '4849', desc: 'Fraude — Transação com cartão perdido/roubado',  liability: 'adquirente' },
  { visa: '10.3', mc: '4870', desc: 'Fraude — Transação presente (chip/trilha)',       liability: 'adquirente' },
  { visa: '10.4', mc: '4871', desc: 'Fraude — Transação chip mas fallback para trilha', liability: 'adquirente' },
  { visa: '11.1', mc: '4808', desc: 'Autorização — Sem autorização válida',            liability: 'adquirente' },
  { visa: '11.2', mc: '4808', desc: 'Autorização — Limite de garantia expirado',       liability: 'adquirente' },
  { visa: '11.3', mc: '4808', desc: 'Autorização — Declinada mas processada mesmo assim', liability: 'adquirente' },
  { visa: '12.1', mc: '4831', desc: 'Processamento — Valor incorreto',                 liability: 'condicional' },
  { visa: '12.2', mc: '4831', desc: 'Processamento — Número de conta incorreto',       liability: 'condicional' },
  { visa: '12.3', mc: '4853', desc: 'Processamento — Duplicação de transação',         liability: 'adquirente' },
  { visa: '12.4', mc: '4831', desc: 'Processamento — Crédito não processado',          liability: 'adquirente' },
  { visa: '12.5', mc: '4853', desc: 'Serviço — Produto/serviço não entregue',          liability: 'adquirente' },
  { visa: '12.6', mc: '4855', desc: 'Serviço — Mercadoria defeituosa ou diferente',    liability: 'adquirente' },
  { visa: '13.1', mc: '4853', desc: 'Devoluções — Crédito não processado após devolução', liability: 'adquirente' },
  { visa: '13.3', mc: '4853', desc: 'Devoluções — Produto não recebido',               liability: 'adquirente' },
];

// ── Liability shift ───────────────────────────────────────────────────────────

type LiabilityScenario = { cenario: string; eci: string; chip: string; resultado: string; quem: 'emissor' | 'adquirente' | 'split' };

const LIABILITY: LiabilityScenario[] = [
  {
    cenario: 'CNP com 3DS autenticado',
    eci: '05',
    chip: '—',
    resultado: 'Liability shift para o emissor',
    quem: 'emissor',
  },
  {
    cenario: 'CNP sem 3DS / ECI 07',
    eci: '07',
    chip: '—',
    resultado: 'Liability no adquirente (sem proteção)',
    quem: 'adquirente',
  },
  {
    cenario: 'CNP tentativa (frictionless)',
    eci: '06',
    chip: '—',
    resultado: 'Partial shift — emissor absorve em alguns reason codes',
    quem: 'split',
  },
  {
    cenario: 'POS chip EMV válido',
    eci: '—',
    chip: 'Chip OK',
    resultado: 'Liability no emissor (chip autentica o portador)',
    quem: 'emissor',
  },
  {
    cenario: 'POS fallback para trilha (chip falhou)',
    eci: '—',
    chip: 'Fallback',
    resultado: 'Liability no adquirente (deveria rejeitar a transação)',
    quem: 'adquirente',
  },
  {
    cenario: 'POS sem chip (trilha pura)',
    eci: '—',
    chip: 'Mag stripe',
    resultado: 'Liability no adquirente em terminais não-chip',
    quem: 'adquirente',
  },
  {
    cenario: 'Contactless (NFC) válido',
    eci: '—',
    chip: 'Contactless',
    resultado: 'Liability no emissor (ARQC válido)',
    quem: 'emissor',
  },
];

// ── VROL vs MCOM ──────────────────────────────────────────────────────────────

const SISTEMAS = [
  { aspecto: 'Sistema da bandeira',     visa: 'VROL (Visa Resolve Online)',           mc: 'MCOM (Mastercard Dispute Resolution System)' },
  { aspecto: 'Framework vigente',       visa: 'VCR — Visa Claims Resolution (2019+)', mc: 'MDR — MC Dispute Resolution (2020+)' },
  { aspecto: 'TC/MTI de chargeback',    visa: 'BASE II TC 25',                        mc: 'IPM MTI 1442 (DE 25 = 41)' },
  { aspecto: 'TC/MTI representação',    visa: 'BASE II TC 05 (2nd presentment)',       mc: 'IPM MTI 1240 (DE 25 = 01)' },
  { aspecto: 'Prazo máximo (portador)', visa: '120 dias após data de processamento',  mc: '120 dias após data de apresentação' },
  { aspecto: '2nd Chargeback',          visa: 'Eliminado pelo VCR (pre-arb direto)',  mc: 'Mantido em casos específicos (4808, 4853)' },
  { aspecto: 'Custo de arbitragem',     visa: 'USD 500 (perdedor paga)',              mc: 'USD 250 (perdedor paga)' },
  { aspecto: 'Programa de monitoria',   visa: 'VDMP (Dispute Monitoring)',            mc: 'MDMP (Dispute Monitoring)' },
  { aspecto: 'Limite mensal (fraude)',  visa: '> 0,9% txs = Early Warning',           mc: '> 1,5% txs = Early Warning' },
  { aspecto: 'Campo reason code',       visa: 'Field 72 (BASE II)',                   mc: 'DE 71 (IPM)' },
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'ciclo',      label: 'Ciclo de Disputa' },
  { id: 'reason',     label: 'Reason Codes' },
  { id: 'liability',  label: 'Liability Shift' },
  { id: 'sistemas',   label: 'VROL vs MCOM' },
  { id: 'defesa',     label: 'Guia de Defesa' },
];

// ── page ──────────────────────────────────────────────────────────────────────

export default function ChargebackPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 pt-28">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <span className="text-foreground">Chargeback</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Chargeback —{' '}
            <span className="text-amber-400">Ciclo de Disputa</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Do momento em que o portador contesta até o veredito final da bandeira:
            prazos, reason codes, liability shift, VROL×MCOM e estratégias de defesa
            para adquirentes e subadquirentes.
          </p>

          {/* Stats strip */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: Clock,        label: '120 dias',       desc: 'Prazo máximo do portador' },
              { icon: AlertTriangle, label: '6 fases',       desc: 'Do pedido à arbitragem' },
              { icon: Scale,        label: 'USD 500 / 250',  desc: 'Taxa de arbitragem' },
              { icon: ShieldCheck,  label: 'ECI 05',         desc: 'Proteção máxima (3DS)' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                <Icon size={15} className="text-primary shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground leading-none">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-10 items-start">

          {/* Sticky TOC */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-28 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Seções</p>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                {s.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              <Link href="/comparativo" className="block text-xs text-primary hover:underline">→ Comparativo V×MC</Link>
              <Link href="/compliance"  className="block text-xs text-primary hover:underline">→ Compliance</Link>
              <Link href="/mdr"         className="block text-xs text-primary hover:underline">→ Fluxo de Dinheiro</Link>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-14 min-w-0">

            {/* ── 1. Ciclo ─────────────────────────────────────────── */}
            <Section id="ciclo" title="Ciclo Completo de Disputa">

              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400/90">
                <strong>Regra geral:</strong> o chargeback flui de emissor → bandeira → adquirente, sempre pelo clearing
                (BASE II/IPM). Cada fase tem prazo específico — perder o prazo é perder o direito automaticamente.
              </div>

              <div className="space-y-0">
                {PHASES.map((phase, idx) => {
                  const isLast = idx === PHASES.length - 1;
                  return (
                    <div key={phase.step} className="relative flex gap-4">
                      {/* Vertical connector */}
                      {!isLast && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border z-0" />
                      )}

                      {/* Step bubble */}
                      <div className="shrink-0 z-10">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: phase.actorColor }}
                        >
                          {phase.step}
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 pb-6">
                        <div className="rounded-xl border border-border bg-card p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="text-sm font-bold text-foreground">{phase.label}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: `${phase.actorColor}18`, color: phase.actorColor }}
                                >
                                  {phase.actor}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
                              <Timer size={11} />
                              {phase.deadline}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>

                          {phase.subItems && (
                            <ul className="mt-2 space-y-1">
                              {phase.subItems.map((item) => (
                                <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                                  <ArrowRight size={11} className="mt-0.5 shrink-0 text-primary" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}

                          {phase.warn && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                              <AlertOctagon size={12} className="mt-0.5 shrink-0" />
                              {phase.warn}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* ── 2. Reason Codes ──────────────────────────────────── */}
            <Section id="reason" title="Reason Codes — Visa × Mastercard">

              <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400/90">
                <strong>Como ler:</strong> cada disputa nasce de um reason code que define quem tem a carga de prova,
                quais evidências são válidas e quem assume a liability. Codes do grupo 10.x são sempre fraude — os
                de maior volume e risco para e-commerce sem 3DS.
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-blue-400 uppercase tracking-wider w-20">Visa</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-red-400 uppercase tracking-wider w-20">MC</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-40">Liability padrão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REASON_CODES.map((r, i) => (
                      <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-blue-400">{r.visa}</td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-red-400">{r.mc}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{r.desc}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.liability === 'emissor'
                              ? 'bg-green-500/12 text-green-400'
                              : r.liability === 'adquirente'
                              ? 'bg-red-500/12 text-red-400'
                              : 'bg-amber-500/12 text-amber-400'
                          }`}>
                            {r.liability === 'emissor' ? 'Emissor' : r.liability === 'adquirente' ? 'Adquirente' : 'Condicional'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── 3. Liability Shift ───────────────────────────────── */}
            <Section id="liability" title="Liability Shift — Quem Absorve a Fraude">

              <div className="mb-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400/90">
                <strong>Regra fundamental:</strong> quem investiu mais em autenticação absorve menos fraude.
                ECI 05 (3DS autenticado) = emissor assume. Fallback de chip = adquirente assume.
                O liability shift é um incentivo econômico para adoção de tecnologias de segurança.
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Cenário</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">ECI</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-28">Chip/Canal</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Resultado</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-36">Quem paga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LIABILITY.map((r, i) => (
                      <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 font-medium text-foreground">{r.cenario}</td>
                        <td className="px-4 py-3 text-center">
                          {r.eci !== '—' ? (
                            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                              r.eci === '05' ? 'bg-green-500/12 text-green-400'
                              : r.eci === '06' ? 'bg-amber-500/12 text-amber-400'
                              : 'bg-red-500/12 text-red-400'
                            }`}>{r.eci}</span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">{r.chip}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{r.resultado}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            r.quem === 'emissor'
                              ? 'bg-green-500/12 text-green-400'
                              : r.quem === 'adquirente'
                              ? 'bg-red-500/12 text-red-400'
                              : 'bg-amber-500/12 text-amber-400'
                          }`}>
                            {r.quem === 'emissor' ? 'Emissor' : r.quem === 'adquirente' ? 'Adquirente' : 'Compartilhado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ECI visual legend */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { eci: '05', label: 'Autenticado com sucesso', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', shield: true },
                  { eci: '06', label: 'Tentativa (frictionless)', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', shield: false },
                  { eci: '07', label: 'Sem autenticação (CNP)', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', shield: false },
                ].map(({ eci, label, color, bg, border, shield }) => (
                  <div key={eci}
                    className="rounded-xl border p-4 flex flex-col items-center text-center gap-2"
                    style={{ background: bg, borderColor: border }}>
                    <div className="text-2xl font-black" style={{ color }}>ECI {eci}</div>
                    {shield
                      ? <CheckCircle2 size={20} style={{ color }} />
                      : <XCircle size={20} style={{ color }} />
                    }
                    <div className="text-xs text-muted-foreground leading-snug">{label}</div>
                    <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}18`, color }}>
                      {eci === '05' ? 'Emissor assume fraude' : eci === '06' ? 'Shift parcial' : 'Adquirente assume fraude'}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 4. VROL vs MCOM ──────────────────────────────────── */}
            <Section id="sistemas" title="VROL vs MCOM — Sistemas de Gestão de Disputas">

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[220px]">Aspecto</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#3b82f6' }}>Visa (VROL/VCR)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>Mastercard (MCOM/MDR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SISTEMAS.map((r, i) => (
                      <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 font-medium text-foreground align-top">{r.aspecto}</td>
                        <td className="px-4 py-3 text-muted-foreground align-top">{r.visa}</td>
                        <td className="px-4 py-3 text-muted-foreground align-top">{r.mc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── 5. Guia de Defesa ────────────────────────────────── */}
            <Section id="defesa" title="Guia de Defesa — O que Juntar por Reason Code">

              <div className="grid md:grid-cols-2 gap-4">

                {/* Fraude (10.x / 4837) */}
                <div className="rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle size={14} className="text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Fraude — 10.x / 4837</div>
                      <div className="text-xs text-muted-foreground">CNP não reconhecida</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Log de autorização 3DS com ECI 05 e CAVV válido',
                      'Endereço de cobrança (AVS match) e CVV2 correto',
                      'Prova de entrega com assinatura no endereço do portador',
                      'IP do pedido = localização do portador (device fingerprint)',
                      'Histórico de compras anteriores no mesmo cartão sem disputa',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-2 rounded-lg bg-green-500/8 border border-green-500/15 text-[10px] text-green-400">
                    <strong>Melhor defesa:</strong> ECI 05 elimina a razão do chargeback antes de abrir.
                  </div>
                </div>

                {/* Produto não entregue (12.5 / 4853) */}
                <div className="rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <FileText size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Produto Não Entregue — 12.5 / 4853</div>
                      <div className="text-xs text-muted-foreground">Serviço/mercadoria não recebida</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Código de rastreio com confirmação de entrega (Correios/transportadora)',
                      'Assinatura do portador ou comprovante físico de recebimento',
                      'Para digital: log de download/acesso com IP e timestamp',
                      'Comunicação com o portador confirmando recebimento',
                      'Para serviços: log de uso/acesso pós-compra',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Duplicação (12.3) */}
                <div className="rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <CreditCard size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Duplicação — 12.3 / 4831</div>
                      <div className="text-xs text-muted-foreground">Transação cobrada duas vezes</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'ARN (Acquirer Reference Number) distintos para cada transação',
                      'Log de checkout mostrando dois pedidos distintos',
                      'Confirmação de 2 entregas diferentes (nota fiscal separada)',
                      'Tela do sistema mostrando 2 ARNs com datas/horários distintos',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-2 rounded-lg bg-red-500/8 border border-red-500/15 text-[10px] text-red-400">
                    <strong>Atenção:</strong> se foi de fato uma duplicação, estorne antes — evita arbitragem e taxa.
                  </div>
                </div>

                {/* Sem autorização (11.x / 4808) */}
                <div className="rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <ShieldCheck size={14} className="text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Sem Autorização — 11.x / 4808</div>
                      <div className="text-xs text-muted-foreground">Transação sem aprovação do emissor</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Código de aprovação (authorization code) da rede',
                      'ARN com resposta 00 no campo 39',
                      'Timestamp da autorização dentro da janela válida',
                      'Para Stand-In: comprovante do STIP approval com código',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Tip box */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground mb-2">Regra dos 3 Cs de Defesa</div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { c: 'Capturar', desc: 'Preserve todos os logs de autorização, 3DS, AVS/CVV imediatamente após a transação. Dados expiram.' },
                        { c: 'Cruzar', desc: 'Ligue ARN + código de autorização + log 3DS + prova de entrega em um único dossiê coerente.' },
                        { c: 'Cumprir Prazo', desc: 'Resposta ao chargeback fora do prazo = derrota automática, independente de ter razão.' },
                      ].map(({ c, desc }) => (
                        <div key={c}>
                          <div className="text-sm font-bold text-primary mb-1">{c}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Programs de monitoria ────────────────────────────── */}
            <Section id="monitoria" title="Programas de Monitoria — VDMP e MDMP">
              <div className="grid md:grid-cols-2 gap-4">

                {/* Visa VDMP */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Building2 size={14} className="text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-blue-400">Visa VDMP</div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { threshold: 'Early Warning', value: '> 0,65% dispute rate OU > 75 disputes/mês', color: '#f59e0b' },
                      { threshold: 'Standard',      value: '> 0,9% dispute rate OU > 100 disputes/mês', color: '#ef4444' },
                      { threshold: 'Excessive',     value: '> 1,8% dispute rate OU > 1.000 disputes/mês', color: '#dc2626' },
                    ].map(({ threshold, value, color }) => (
                      <div key={threshold} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: color }} />
                        <div>
                          <span className="font-bold text-foreground">{threshold}: </span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-blue-500/15 text-muted-foreground">
                      Penalidade: USD 50–100 por disputa acima do threshold + fines mensais progressivos.
                      Risco de descredenciamento em &quot;Excessive&quot; por 3+ meses.
                    </div>
                  </div>
                </div>

                {/* MC MDMP */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                      <Building2 size={14} className="text-red-400" />
                    </div>
                    <div className="text-sm font-bold text-red-400">Mastercard MDMP</div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { threshold: 'Early Warning',  value: '> 1,5% chargeback ratio OU > 100 chargebacks/mês', color: '#f59e0b' },
                      { threshold: 'Excessive CM',   value: '> 2,0% chargeback ratio OU > 200/mês',             color: '#ef4444' },
                      { threshold: 'High-Risk CM',   value: '> 2,0% + > 1.000 chargebacks/mês',                color: '#dc2626' },
                    ].map(({ threshold, value, color }) => (
                      <div key={threshold} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: color }} />
                        <div>
                          <span className="font-bold text-foreground">{threshold}: </span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-red-500/15 text-muted-foreground">
                      Penalidade: USD 1.000/mês no 1º mês, escala até USD 100.000/mês.
                      MC pode exigir plano de remediação e auditoria presencial.
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Footer links */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-sm">
              <Link href="/comparativo"       className="text-primary hover:underline">Comparativo Visa×MC →</Link>
              <Link href="/compliance"        className="text-primary hover:underline">Compliance completo →</Link>
              <Link href="/mdr"              className="text-primary hover:underline">Fluxo de dinheiro (MDR) →</Link>
              <Link href="/simulador"        className="text-primary hover:underline">Simular intercâmbio →</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
