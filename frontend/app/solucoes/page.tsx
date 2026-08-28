import Link from "next/link";
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  Layers,
  Users,
  Bell,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react";

const SOLUTIONS = [
  {
    icon: RefreshCw,
    title: "Otimização de Autorização & Smart Retries",
    badge: "Solução Estratégica",
    desc: "Diagnóstico profundo de decline codes, classificação de recusas (Hard vs Soft), esteira de retentativas inteligentes sincronizada com datas salariais e recuperação de receita.",
    items: [
      "Análise forense de Decline Codes (51, 05, 54, 14, 65, 82)",
      "Smart Retries sincronizados com 5º e 20º dias úteis",
      "Gatilhos automáticos para Account Updater (VAU / ABU)",
      "Recuperação de até 35% de transações recorrentes recusadas",
    ],
    cta: { label: "Testar Suite de Billing & Retries", href: "/billing" },
    highlight: true,
  },
  {
    icon: Cpu,
    title: "Engenharia de Autorização & Visa DAF",
    badge: "Alta Performance",
    desc: "Arquitetura avançada de mensageria ISO 8583, implementação de Visa DAF, STIP Switch On-Behalf e parametrização correta de POS Entry Mode (DE 22).",
    items: [
      "Visa DAF & MDES DAA para aprovação acima de 97%",
      "Parametrização do POS Entry Mode (DE 22) e CAT Levels",
      "Otimização de STIP para evitar erros de timeout (91/96)",
      "Zero-Dollar Account Verification para validação de trials",
    ],
    cta: { label: "Ver Engenharia de Autorização", href: "/billing" },
    highlight: true,
  },
  {
    icon: Calculator,
    title: "Motor de Intercâmbio & Pricing",
    badge: "Motor Proprietário",
    desc: "Simulador de taxas em tempo real para Visa, Mastercard e Maestro. Motor com cascata de regras, debug completo e lookup de 224k+ ranges de BINs reais (MPE IP0040T1).",
    items: [
      "Cálculo por PID, AFS, canal e MCC",
      "Cascata de avaliação por prioridade (waterfall)",
      "Caps regulatórios do Banco Central (0.50% / 0.70%)",
      "Auditoria de tarifas de processamento MCBS e VSS",
    ],
    cta: { label: "Acessar Simulador de Intercâmbio", href: "/simulador" },
    highlight: false,
  },
  {
    icon: ShieldCheck,
    title: "Blindagem de Chargeback & Compliance",
    badge: "Proteção de Bandeira",
    desc: "Monitoramento contínuo de Dispute Ratio (CTR) e Fraud Ratio para manter o merchant fora dos programas punitivos Visa VDMP/VFMP e Mastercard ECP.",
    items: [
      "Calculadora de limiares Early Warning e Standard Warning",
      "Estimativa de multas e custos de arbitragem",
      "Implementação de 3DS 2.2 com Liability Shift (ECI 05)",
      "Estratégia de defesa com Compelling Evidence 3.0",
    ],
    cta: { label: "Ver Monitor de Compliance", href: "/chargeback" },
    highlight: false,
  },
  {
    icon: Layers,
    title: "Implementação & Releases de Bandeiras",
    badge: "Projetos Críticos",
    desc: "Liderança técnica em homologação de releases semestrais e projetos de grande porte: Tokenização de Bandeira, ABU, QR Code, Marketplace e Split.",
    items: [
      "Rollout de Network Tokens (VTS, MDES e Elo Token)",
      "Governança e homologação de releases semestrais",
      "Arquitetura de Split de Pagamento e Marketplace",
      "Integração de gateways, PSPs e subadquirentes",
    ],
    cta: { label: "Ver Trajetória & Cases", href: "/sobre" },
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Auditoria Financeira & Revenue Recovery",
    badge: "Gestão de Receita",
    desc: "Simulação de impacto financeiro em SaaS e assinaturas através da redução de churn involuntário, queda de decline rate e expansão de LTV.",
    items: [
      "Simulador de ARR recuperado por alavanca",
      "Modelagem de LTV e redução de churn involuntário",
      "Auditoria de faturas e desvios de liquidação",
      "Relatórios executivos para C-Level e investidores",
    ],
    cta: { label: "Simular Revenue Recovery", href: "/billing" },
    highlight: false,
  },
];

export const metadata = {
  title: "Soluções — Otimização de Pagamentos & Billing | VS Payments",
  description: "Soluções especializadas em autorização, smart retries, análise de recusas, motor de intercâmbio, mitigação de chargebacks e engenharia de pagamentos.",
};

export default function SolucoesPage() {
  return (
    <main className="bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)",
          padding: "5.5rem 1.5rem 4.5rem",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="section-eyebrow">Soluções & Consultoria</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pronto para Escala
            </span>
          </div>
          
          <h1 className="font-black text-foreground mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}>
            Soluções em Meios de Pagamento, <br />
            <span className="text-blue-500">Autorização & Billing</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Da engenharia de mensageria ISO 8583 e otimização de taxas de aprovação até a auditoria de intercâmbio e mitigação de chargebacks. Soluções práticas para empresas que exigem máxima eficiência financeira.
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="card-hover flex flex-col rounded-2xl border p-7 relative transition-all"
                style={{
                  background: s.highlight ? "rgba(37,99,235,0.06)" : "var(--card)",
                  borderColor: s.highlight ? "rgba(59,130,246,0.35)" : "var(--border)",
                }}
              >
                {s.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-1px",
                      left: "1.5rem",
                      right: "1.5rem",
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                      borderRadius: "0 0 2px 2px",
                    }}
                  />
                )}

                {/* Top header with badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                    {s.badge}
                  </span>
                </div>

                <h2 className="font-bold text-foreground text-lg mb-2">
                  {s.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                  {s.desc}
                </p>

                {/* Items */}
                <ul className="space-y-2 flex-1 mb-6">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="pt-4 border-t border-border mt-auto">
                  <Link
                    href={s.cta.href}
                    className={`inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      s.highlight
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                        : "bg-muted/60 hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{s.cta.label}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-4xl px-6 pt-20 text-center">
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent p-8 sm:p-12">
          <h2 className="font-bold text-foreground text-xl sm:text-2xl mb-3">
            Precisa de uma análise personalizada para sua operação?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Diagnóstico de declínios, otimização de retentativas, auditoria de intercâmbio ou integração de novos processadores e bandeiras.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/billing" className="btn-primary inline-flex items-center gap-2">
              Explorar Suite de Billing
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2"
            >
              Falar no LinkedIn
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
