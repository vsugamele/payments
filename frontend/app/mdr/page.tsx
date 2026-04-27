import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, ArrowDown,
  Store, CreditCard, Building2, Activity, Landmark,
  TrendingDown, AlertCircle, Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fluxo de Dinheiro — MDR, Intercâmbio e Taxas | VS Payments',
  description:
    'Entenda como R$100 de uma venda se divide entre lojista, adquirente, bandeira e emissor. A lógica financeira completa do ecossistema de pagamentos.',
};

// ─── helpers ────────────────────────────────────────────────────────────────

function Tag({ children, color = '#6366f1' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em',
      textTransform: 'uppercase', color,
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: 999, padding: '0.25rem 0.65rem',
    }}>
      {children}
    </span>
  );
}

function Callout({ color = '#f59e0b', icon: Icon, title, children }: {
  color?: string; icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: `${color}0d`, border: `1px solid ${color}25`,
      borderRadius: 12, padding: '1rem 1.25rem',
      display: 'flex', gap: '0.875rem',
    }}>
      <Icon size={16} style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color, marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function MDRPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 pt-28 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
          <span>/</span>
          <span className="text-foreground">Fluxo de Dinheiro</span>
        </div>

        {/* Hero */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <Tag color="#10b981">Conceito Fundamental</Tag>
            <Tag color="#6366f1">Visão Integrada</Tag>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Para onde vai o dinheiro<br />
            <span style={{ color: '#10b981' }}>de uma venda com cartão?</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Em cada transação, o lojista não recebe o valor cheio. A diferença entre o que
            o portador paga e o que o lojista recebe é o <strong className="text-foreground">MDR</strong> —
            e ele se divide entre três partes. Entender esse fluxo é entender o ecossistema inteiro.
          </p>
        </div>

        {/* ── 1. O FLUXO VISUAL ─────────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            O fluxo em uma transação de R$&nbsp;100
          </h2>

          {/* Actors row */}
          <div className="grid grid-cols-4 gap-3 mb-2">
            {[
              { icon: CreditCard, label: 'Portador',   sub: 'Compra R$100',       color: '#94a3b8' },
              { icon: Store,      label: 'Lojista',    sub: 'Recebe R$97,50',      color: '#10b981' },
              { icon: Building2,  label: 'Adquirente', sub: 'Paga e cobra MDR',    color: '#f59e0b' },
              { icon: Landmark,   label: 'Emissor',    sub: 'Libera o crédito',    color: '#3b82f6' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label} style={{
                  background: `${a.color}0e`, border: `1px solid ${a.color}25`,
                  borderRadius: 12, padding: '1rem', textAlign: 'center',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${a.color}18`, border: `1px solid ${a.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.6rem',
                  }}>
                    <Icon size={18} style={{ color: a.color }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{a.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Settlement flow */}
          <div className="rounded-2xl border border-border overflow-hidden mt-6">
            {/* Header */}
            <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Liquidação (D+1)</span>
            </div>

            <div className="p-6 space-y-3">

              {/* Step 1: Portador → Emissor */}
              <div className="flex items-center gap-3">
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#94a3b810', border: '1px solid #94a3b825',
                  fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8',
                }}>Portador</div>
                <div className="flex-1 flex items-center gap-2">
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #94a3b840, #3b82f660)' }} />
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    background: '#3b82f615', border: '1px solid #3b82f630',
                    color: '#3b82f6', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap',
                  }}>paga R$100 → fatura/débito</div>
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #3b82f660, #3b82f840)' }} />
                </div>
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#3b82f610', border: '1px solid #3b82f625',
                  fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6',
                }}>Emissor</div>
              </div>

              {/* Step 2: Emissor → Adquirente (clearing) */}
              <div className="flex items-center gap-3">
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#3b82f610', border: '1px solid #3b82f625',
                  fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6',
                }}>Emissor</div>
                <div className="flex-1 flex items-center gap-2">
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #3b82f660, #f59e0b60)' }} />
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    background: '#f59e0b15', border: '1px solid #f59e0b30',
                    color: '#f59e0b', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap',
                  }}>R$100 − intercâmbio (R$1,50) → R$98,50</div>
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #f59e0b60, #f59e0b40)' }} />
                </div>
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#f59e0b10', border: '1px solid #f59e0b25',
                  fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b',
                }}>Adquirente</div>
              </div>

              {/* Step 3: Bandeira fee */}
              <div className="flex items-center gap-3 pl-[155px]">
                <div className="flex-1 flex items-center gap-2">
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #a855f760, #a855f760)' }} />
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    background: '#a855f715', border: '1px solid #a855f730',
                    color: '#a855f7', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap',
                  }}>fee bandeira (R$0,07) vai para a Bandeira</div>
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #a855f760, #a855f760)' }} />
                </div>
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#a855f710', border: '1px solid #a855f725',
                  fontSize: '0.8rem', fontWeight: 700, color: '#a855f7',
                }}>Bandeira</div>
              </div>

              {/* Step 4: Adquirente → Lojista */}
              <div className="flex items-center gap-3">
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#f59e0b10', border: '1px solid #f59e0b25',
                  fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b',
                }}>Adquirente</div>
                <div className="flex-1 flex items-center gap-2">
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #f59e0b60, #10b98160)' }} />
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    background: '#10b98115', border: '1px solid #10b98130',
                    color: '#10b981', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap',
                  }}>R$98,50 − fee bandeira − margem → paga R$97,50</div>
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #10b98160, #10b98140)' }} />
                </div>
                <div style={{
                  width: 140, borderRadius: 8, padding: '0.6rem 0.875rem',
                  background: '#10b98110', border: '1px solid #10b98125',
                  fontSize: '0.8rem', fontWeight: 700, color: '#10b981',
                }}>Lojista ✓</div>
              </div>

            </div>
          </div>

          <Callout icon={Info} color="#6366f1" title="Via CIP / STR (Banco Central)">
            O settlement não é uma TED direta entre as partes. As posições líquidas são
            calculadas pela bandeira e liquidadas multilateralmente via CIP, com o Banco
            Central como contraparte. Um único crédito/débito por participante settle
            milhares de transações.
          </Callout>
        </section>

        {/* ── 2. DECOMPOSIÇÃO DO MDR ─────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Anatomia do MDR
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Exemplo: Visa Classic Crédito · Chip + PIN · Varejo geral · Transação R$100
          </p>

          {/* Visual bar */}
          <div className="mb-3">
            <div className="flex rounded-xl overflow-hidden h-10 mb-2">
              <div style={{ flex: 60, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>Intercâmbio 60%</span>
              </div>
              <div style={{ flex: 3, background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white' }}>3%</span>
              </div>
              <div style={{ flex: 37, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>Adquirente 37%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>← Intercâmbio (vai ao Emissor)</span>
              <span>Fee Bandeira</span>
              <span>(fica no Adquirente) →</span>
            </div>
          </div>

          {/* Three cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

            {/* Intercâmbio */}
            <div style={{ background: '#3b82f60e', border: '1px solid #3b82f625', borderRadius: 14, padding: '1.5rem' }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#3b82f618', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Landmark size={16} style={{ color: '#3b82f6' }} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>R$1,50</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#3b82f6', marginBottom: '0.35rem' }}>Intercâmbio</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Vai para o <strong style={{ color: '#93c5fd' }}>Emissor</strong>. Custeia os benefícios do
                portador (pontos, seguros, cashback), o risco de crédito e os dias de float no ciclo de crédito.
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa base (Classic Chip)</span>
                  <span className="font-semibold text-foreground">1,50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Definido por</span>
                  <span className="font-semibold text-foreground">Visa / MC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regulado por</span>
                  <span className="font-semibold text-foreground">BACEN (Circ. 3.887)</span>
                </div>
              </div>
            </div>

            {/* Fee Bandeira */}
            <div style={{ background: '#a855f70e', border: '1px solid #a855f725', borderRadius: 14, padding: '1.5rem' }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#a855f718', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Activity size={16} style={{ color: '#a855f7' }} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>R$0,07</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a855f7', marginBottom: '0.35rem' }}>Fee de Rede</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Vai para a <strong style={{ color: '#d8b4fe' }}>Bandeira</strong> (Visa/MC). Cobre a
                infraestrutura de autorização (VisaNet/Banknet), clearing (BASE II/IPM) e
                os programas de rede.
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Componentes</span>
                  <span className="font-semibold text-foreground">Processing + Service</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cobrado de</span>
                  <span className="font-semibold text-foreground">Adquirente + Emissor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibilidade</span>
                  <span className="font-semibold text-foreground">BASE II / IPM TC10</span>
                </div>
              </div>
            </div>

            {/* Margem Adquirente */}
            <div style={{ background: '#f59e0b0e', border: '1px solid #f59e0b25', borderRadius: 14, padding: '1.5rem' }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#f59e0b18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={16} style={{ color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>R$0,93</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', marginBottom: '0.35rem' }}>Margem Adquirente</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Fica no <strong style={{ color: '#fcd34d' }}>Adquirente</strong>. Cobre o terminal/POS,
                antifraude, gateway, suporte, risco de crédito ao lojista e o lucro
                da operação.
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MDR negociado</span>
                  <span className="font-semibold text-foreground">2,50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo de rede</span>
                  <span className="font-semibold text-foreground">1,57% (int + fee)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem bruta</span>
                  <span className="font-semibold text-foreground">0,93%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FATORES QUE MUDAM A TAXA ──────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            O que muda o intercâmbio — e por quê
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            O intercâmbio não é fixo. Ele é o resultado de uma cascata de regras avaliada no arquivo de clearing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Produto */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-blue-400" />
                <span className="text-sm font-bold text-foreground">Produto (PID / Tier)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Cartões premium (Infinite, Signature) pagam mais intercâmbio porque oferecem benefícios
                mais caros ao portador — o emissor precisa ser ressarcido.
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">Produto</th>
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">PID Visa</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold">Intercâmbio</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { prod: 'Classic',   pid: 'F^',  rate: '1,50%', color: '#94a3b8' },
                    { prod: 'Platinum',  pid: 'P^',  rate: '1,60%', color: '#60a5fa' },
                    { prod: 'Signature', pid: 'C^',  rate: '1,70%', color: '#818cf8' },
                    { prod: 'Infinite',  pid: 'I^',  rate: '1,75%', color: '#a78bfa' },
                  ].map(r => (
                    <tr key={r.prod} className="border-b border-border/50">
                      <td className="py-1.5 font-medium" style={{ color: r.color }}>{r.prod}</td>
                      <td className="py-1.5 text-muted-foreground font-mono">{r.pid}</td>
                      <td className="py-1.5 text-right font-bold" style={{ color: r.color }}>{r.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Canal */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Store size={14} className="text-emerald-400" />
                <span className="text-sm font-bold text-foreground">Canal (POS Entry Mode)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Transações presenciais com chip têm menor risco de fraude — intercâmbio menor.
                CNP (e-commerce) carrega mais risco, portanto taxa maior.
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">Canal</th>
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">POS Mode</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold">Intercâmbio</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { canal: 'Chip + PIN',       mode: '05', rate: '1,50%', color: '#22c55e' },
                    { canal: 'Contactless NFC',  mode: '07', rate: '1,52%', color: '#4ade80' },
                    { canal: 'E-com + 3DS',      mode: '81', rate: '1,65%', color: '#fbbf24' },
                    { canal: 'E-com sem 3DS',    mode: '81', rate: '1,80%', color: '#ef4444' },
                  ].map(r => (
                    <tr key={r.canal} className="border-b border-border/50">
                      <td className="py-1.5 font-medium" style={{ color: r.color }}>{r.canal}</td>
                      <td className="py-1.5 text-muted-foreground font-mono">{r.mode}</td>
                      <td className="py-1.5 text-right font-bold" style={{ color: r.color }}>{r.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3DS e ECI */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-purple-400" />
                <span className="text-sm font-bold text-foreground">Autenticação 3DS (ECI)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                O ECI vem no campo 61 do BASE II / DE 48.42 do IPM. Um ECI 05 (autenticado)
                reduz o intercâmbio CNP e transfere a responsabilidade de fraude ao emissor.
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">ECI</th>
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-1.5 text-muted-foreground font-semibold">Liability</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { eci: '05', status: 'Autenticado',  liability: 'Emissor',    impact: '−0,15%', color: '#22c55e' },
                    { eci: '06', status: 'Tentativa',    liability: 'Emissor',    impact: '−0,08%', color: '#fbbf24' },
                    { eci: '07', status: 'Sem auth',     liability: 'Adquirente', impact: 'Taxa CNP cheia', color: '#ef4444' },
                  ].map(r => (
                    <tr key={r.eci} className="border-b border-border/50">
                      <td className="py-1.5 font-mono font-bold" style={{ color: r.color }}>{r.eci}</td>
                      <td className="py-1.5" style={{ color: r.color }}>{r.status}</td>
                      <td className="py-1.5 text-muted-foreground">{r.liability}</td>
                      <td className="py-1.5 text-right font-bold" style={{ color: r.color }}>{r.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Regulação */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={14} className="text-rose-400" />
                <span className="text-sm font-bold text-foreground">Limite Regulatório (BACEN)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                A Circular BACEN 3.887/2018 limita o intercâmbio médio ponderado para
                emissores regulados (bancos com &gt; 2M cartões ativos). Emissores menores
                podem praticar taxas acima do limite.
              </p>
              <div className="space-y-3">
                {[
                  { tipo: 'Crédito à Vista',    limite: '0,50%', color: '#f87171', obs: 'Média ponderada' },
                  { tipo: 'Crédito Parcelado',  limite: '0,50%', color: '#f87171', obs: 'por emissor' },
                  { tipo: 'Débito',             limite: '0,50%', color: '#fbbf24', obs: 'por transação' },
                  { tipo: 'Pré-pago',           limite: '0,50%', color: '#a78bfa', obs: 'por transação' },
                ].map(r => (
                  <div key={r.tipo} className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{r.tipo}</div>
                      <div className="text-[10px] text-muted-foreground">{r.obs}</div>
                    </div>
                    <div style={{
                      background: `${r.color}15`, border: `1px solid ${r.color}30`,
                      color: r.color, fontSize: '0.82rem', fontWeight: 800,
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                    }}>{r.limite}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Callout icon={AlertCircle} color="#ef4444" title="Regulated vs. Unregulated">
            A tabela de intercâmbio publicada pela Visa/MC tem duas colunas: <strong>Regulated</strong> (para
            emissores sujeitos ao limite BACEN) e <strong>Unregulated</strong> (para emissores menores, sem limite).
            Um adquirente que não identifica corretamente o emissor pode estar pagando intercâmbio errado
            — impactando diretamente o P&amp;L.
          </Callout>
        </section>

        {/* ── 4. CADEIA COMPLETA ────────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            A lógica completa: do POS ao settlement
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-xl overflow-hidden border border-border">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fase</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Momento</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">O que acontece</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Campo-chave</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Impacto financeiro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { fase: 'Autorização',  tempo: 'T+0 (~1s)',   acao: 'Emissor aprova/nega a transação', campo: 'MTI 0110 / Field 39', impacto: 'Reserva de limite — sem fluxo de caixa ainda', cor: '#6366f1' },
                  { fase: 'Captura',      tempo: 'T+0 (fim do dia)', acao: 'Adquirente finaliza a venda no sistema', campo: 'Completion / TC 05', impacto: 'Inicia o ciclo de clearing', cor: '#0ea5e9' },
                  { fase: 'Clearing',     tempo: 'D+1',         acao: 'Troca de arquivos BASE II / IPM entre adquirente e rede', campo: 'PID, AFS, ECI, MCC', impacto: 'Intercâmbio é calculado aqui', cor: '#f59e0b' },
                  { fase: 'Net Position', tempo: 'D+1 (noite)', acao: 'Bandeira calcula posição líquida de cada participante', campo: 'TC 10 / MTI 1740', impacto: 'Fee de rede é cobrado', cor: '#a855f7' },
                  { fase: 'Settlement',   tempo: 'D+1 (23h)',   acao: 'CIP/STR executa débito/crédito multilateral', campo: 'SPB / ISPB', impacto: 'Adquirente recebe efetivo', cor: '#10b981' },
                  { fase: 'Pagamento ao lojista', tempo: 'D+1 a D+30', acao: 'Adquirente credita MDR líquido na conta do lojista', campo: 'EFA / Agenda de recebíveis', impacto: 'Lojista recebe R$97,50', cor: '#22c55e' },
                ].map((r, i) => (
                  <tr key={r.fase} className={`border-b border-border/60 ${i % 2 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 font-bold" style={{ color: r.cor }}>{r.fase}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{r.tempo}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.acao}</td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground/70">{r.campo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.impacto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Cross-references ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Explore mais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/simulador',   label: 'Simular intercâmbio',    color: '#6366f1', desc: 'Calcule com produto e canal real' },
              { href: '/comparativo', label: 'Visa × MC clearing',     color: '#0ea5e9', desc: 'BASE II vs IPM campo a campo' },
              { href: '/arquitetura', label: 'Ver fluxo no diagrama',   color: '#a855f7', desc: 'Tour passo 5: Clearing' },
              { href: '/trilhas/visa-deep-dive/vss-e-clearing-visa', label: 'Trilha: VSS / Clearing', color: '#f59e0b', desc: 'Como a Visa fecha o ciclo' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ background: `${l.color}0a`, border: `1px solid ${l.color}20`, borderRadius: 12, padding: '1rem' }}
                className="block hover:bg-opacity-20 transition-colors group"
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: l.color, marginBottom: '0.3rem' }}>
                  {l.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{l.desc}</div>
                <ArrowRight size={12} style={{ color: l.color, marginTop: '0.75rem', opacity: 0.7 }} />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
