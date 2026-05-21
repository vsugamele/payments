"use client";

import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import {
  ShieldCheck, Search, BarChart2, BookOpen, ChevronRight,
  AlertTriangle, CheckCircle2, Tag, AlertOctagon, Scale,
  GitCompare, CreditCard, Cpu, DollarSign, Shield, Crosshair,
  Bitcoin, Landmark, Activity, Zap, TrendingUp, Lock,
  Send, Globe, Smartphone, Database, Server, Briefcase
} from "lucide-react";

// ─── Dados ────────────────────────────────────────────────────────────────────

const ALERT_BADGES = [
  { label: "ECP Threshold 2025 atualizado", color: "#f59e0b", dot: true },
  { label: "VAMP: nova janela de avaliação Q1", color: "#60a5fa", dot: true },
  { label: "PCI DSS v4.0 em vigor", color: "#a78bfa", dot: false },
  { label: "Res. BCB 150 — tetos vigentes", color: "#4ade80", dot: false },
];

const HEALTH_STATUS = [
  { sigla: "VAMP",  bandeira: "Visa",       status: "warning", threshold: "0.9%",  desc: "Fraude sobre Vendas" },
  { sigla: "ECP",   bandeira: "Mastercard", status: "danger",  threshold: "1.5%",  desc: "Chargeback sobre Txs" },
  { sigla: "EFM",   bandeira: "Mastercard", status: "warning", threshold: "0.5%",  desc: "Fraude em e-comm" },
  { sigla: "PED",   bandeira: "Elo",        status: "ok",      threshold: "1.0%",  desc: "Chargeback Elo" },
  { sigla: "PEF",   bandeira: "Elo",        status: "ok",      threshold: "0.5%",  desc: "Fraude Elo" },
  { sigla: "MATCH", bandeira: "Mastercard", status: "danger",  threshold: "Listagem permanente", desc: "Risco de onboarding" },
];

const STATUS_CONFIG = {
  ok:      { color: "#10b981", label: "Monitorado",  bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  pulse: false },
  warning: { color: "#f59e0b", label: "Atenção",     bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", pulse: true  },
  danger:  { color: "#ef4444", label: "Alto Risco",  bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",  pulse: true  },
};

const BAND_COLORS: Record<string, { bg: string; text: string }> = {
  Visa:       { bg: "rgba(37,99,235,0.15)",  text: "#60a5fa" },
  Mastercard: { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
  Elo:        { bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
};

const PILLARS = [
  { icon: BarChart2,   href: "/compliance/risco",        title: "Calculadora de Risco",        subtitle: "VAMP · ECP · EFM · PED",          color: "#f59e0b", alert: "Novo threshold Q1 2025", updated: true },
  { icon: Scale,       href: "/compliance/disputas",     title: "Forense de Disputas",         subtitle: "VROL · Mastercom · Intel VCR/DMAS",color: "#8b5cf6", alert: "IA Normativa Ativa",      updated: true },
  { icon: Landmark,    href: "/compliance/intercambio",  title: "Playbook de Intercâmbio",     subtitle: "IRDs · Manuais · Lab Downgrades",  color: "#3b82f6", alert: "Manuais Detalhados (v24.1)", updated: true },
  { icon: Search,      href: "/compliance/campos",       title: "Lookup de Campos",            subtitle: "ISO 8583 · DE / PDS / Tags",       color: "#6366f1", alert: "Mapeamento TCR/PDS",        updated: true },
  { icon: Send,        href: "/compliance/payouts",      title: "Push Payments Lab",           subtitle: "Visa Direct · MC Send · AFT",      color: "#ec4899", alert: "Real-time",            updated: false },
  { icon: Landmark,    href: "/compliance/aft",          title: "Simulador AFT (Funding)",     subtitle: "Indicadores ISO · MCCs · BAIs",    color: "#eab308", alert: "Novo Módulo",          updated: true },
  { icon: Shield,      href: "/comparativo/facilitadores", title: "Facilitadores & Regulação CP 522", subtitle: "Limites · CP 522 · Tarifas Elo", color: "#6366f1", alert: "Novo Módulo",          updated: true },
  { icon: Globe,       href: "/compliance/cross-border", title: "Cross-Border & DCC",          subtitle: "Markup · ISA · IAF",               color: "#0ea5e9", alert: null,                  updated: false },
  { icon: Smartphone,  href: "/compliance/softpos",      title: "Tap to Phone (SoftPOS)",      subtitle: "PCI CPoC · MPoC · Atestação",      color: "#10b981", alert: null,                  updated: false },
  { icon: Database,    href: "/compliance/gcms",         title: "Explorador GCMS",             subtitle: "Clearing · Tabelas T165/T168",     color: "#a855f7", alert: null,                  updated: true },
  { icon: Server,      href: "/compliance/visa-infra",   title: "Infraestrutura Core Visa",    subtitle: "VCX · VSS · Base II",              color: "#3b82f6", alert: null,                  updated: false },
  { icon: Tag,         href: "/compliance/mcc",          title: "Tabela de MCCs",              subtitle: "1.300+ códigos",                   color: "#2dd4bf", alert: null,                  updated: false },
  { icon: AlertOctagon,href: "/compliance/match",        title: "MATCH Pro Simulator",         subtitle: "Onboarding · Reason Codes",        color: "#ef4444", alert: null,                  updated: false },
  { icon: Briefcase,   href: "/compliance/visa-business",title: "Visa Business & Intel",       subtitle: "B2B Connect · VBASS · DAF",        color: "#3b82f6", alert: "Novo Módulo",          updated: false },
  { icon: CreditCard,  href: "/compliance/credenciais",  title: "MIT & CIT Framework",         subtitle: "Stored Credentials · SCOF",        color: "#f59e0b", alert: null,                  updated: false },
  { icon: Cpu,         href: "/compliance/emv",          title: "Decodificador EMV",           subtitle: "TVR Tag 95 · 40 Bits",            color: "#22d3ee", alert: null,                  updated: true },
  { icon: DollarSign,  href: "/compliance/settlement",   title: "Settlement & Clearing",       subtitle: "D+0 · IPM · Base II · EFA",       color: "#4ade80", alert: null,                  updated: true },
  { icon: ShieldCheck, href: "/compliance/3ds",          title: "Matriz 3DS & ECI",            subtitle: "Liability Shift · E-commerce",    color: "#4ade80", alert: null,                  updated: false },
  { icon: Shield,      href: "/compliance/daf",          title: "Visa DAF Simulator",          subtitle: "Digital Authentication · VTS",     color: "#60a5fa", alert: "Novo Módulo",          updated: true },
  { icon: Shield,      href: "/compliance/pci",          title: "Calculadora de Escopo PCI",   subtitle: "SAQ A · SAQ D · v4.0",            color: "#ef4444", alert: "PCI v4.0 vigente",    updated: false },
  { icon: GitCompare,  href: "/compliance/retentativas", title: "Matriz de Retentativas",      subtitle: "Hard vs Soft Declines · MAC",     color: "#f59e0b", alert: null,                  updated: true },
  { icon: Crosshair,   href: "/compliance/bram",         title: "Auditor BRAM e QMAP",         subtitle: "Risco Legal · Multas",            color: "#ef4444", alert: null,                  updated: false },
  { icon: Bitcoin,     href: "/compliance/quasicash",    title: "Cripto & Quasi-cash",         subtitle: "AFT · OCT · Funding",             color: "#eab308", alert: null,                  updated: false },
  { icon: BookOpen,    href: "/compliance/programas",    title: "Diretório de Programas",      subtitle: "Visa · Mastercard · Elo",         color: "#a78bfa", alert: null,                  updated: false },
  { icon: GitCompare,  href: "/canais",                  title: "Matriz de Canais CP/CNP",     subtitle: "Chip · NFC · MOTO · MIT",         color: "#818cf8", alert: null,                  updated: false },
];

const STATS = [
  { value: "17", label: "Módulos ativos",      icon: Zap,        color: "#6366f1" },
  { value: "9",  label: "Programas cobertos",  icon: ShieldCheck, color: "#10b981" },
  { value: "6",  label: "Bandeiras mapeadas",  icon: Activity,   color: "#f59e0b" },
  { value: "3",  label: "Regiões de IC",       icon: TrendingUp, color: "#0ea5e9" },
];

// ─── Animações ────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Componente de Status Pulse ────────────────────────────────────────────────
function PulseDot({ color, pulse }: { color: string; pulse: boolean }) {
  return (
    <span className="relative inline-flex items-center justify-center w-2.5 h-2.5">
      {pulse && (
        <span
          className="absolute inline-flex w-full h-full rounded-full animate-ping opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ComplianceCommandCenter() {
  return (
    <main style={{ background: "#030711", minHeight: "100vh" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden dot-grid"
        style={{
          padding: "5rem 1.5rem 4rem",
          borderBottom: "1px solid #0f1a2e",
        }}
      >
        {/* Glow de fundo */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 85% 30%, rgba(37,99,235,0.10) 0%, transparent 60%)",
        }} />

        <div className="relative mx-auto max-w-6xl">
          {/* Eyebrow Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-6">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "9999px", padding: "0.4rem 1.1rem",
            }}>
              <Lock size={11} style={{ color: "#a78bfa" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Compliance Command Center
              </span>
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-bold text-white text-center mb-4"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", lineHeight: 1.15, letterSpacing: "-0.02em" }}
          >
            Controle seu risco antes que{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              a bandeira controle você
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}
            style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 2.5rem" }}
          >
            Plataforma técnica de referência para adquirentes e emissores: programas de monitoramento,
            IRDs, campos ISO 8583 / IPM e calculadora de enquadramento em penalidades.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Link href="/compliance/risco" className="btn-primary inline-flex items-center gap-2">
              <BarChart2 size={14} /> Calcular Risco
            </Link>
            <Link href="/compliance/campos" className="btn-outline inline-flex items-center gap-2">
              <Search size={14} /> Buscar Campo ISO
            </Link>
          </motion.div>

          {/* Live Alerts Strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              display: "flex", flexWrap: "wrap", gap: "0.625rem", justifyContent: "center",
            }}
          >
            {ALERT_BADGES.map((a) => (
              <span key={a.label} style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.7rem", fontWeight: 600, color: a.color,
                background: `${a.color}10`, border: `1px solid ${a.color}30`,
                borderRadius: "9999px", padding: "0.3rem 0.85rem",
              }}>
                {a.dot && <PulseDot color={a.color} pulse />}
                {a.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid #0f1a2e", background: "#050b18" }}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimatedSection key={s.label} delay={i}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "0.75rem", margin: "0 auto 0.75rem",
                      background: `${s.color}12`, border: `1px solid ${s.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1,
                      background: "linear-gradient(135deg, white 0%, #94a3b8 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {s.value}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>{s.label}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 space-y-16">

        {/* ── Health Monitor ─────────────────────────────────────────────────── */}
        <section>
          <AnimatedSection>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="section-eyebrow mb-1">Monitor de Programas</p>
                <h2 className="font-bold text-white text-lg">Status de Exposição ao Risco</h2>
              </div>
              <Link href="/compliance/programas" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {HEALTH_STATUS.map((prog, i) => {
              const cfg = STATUS_CONFIG[prog.status as keyof typeof STATUS_CONFIG];
              const band = BAND_COLORS[prog.bandeira];
              return (
                <AnimatedSection key={prog.sigla} delay={i * 0.5}>
                  <Link href={`/compliance/programas#${prog.sigla.toLowerCase()}`}>
                    <div style={{
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: "0.875rem", padding: "1.1rem 1.25rem",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                    }}
                      className="group hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <PulseDot color={cfg.color} pulse={cfg.pulse} />
                          <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>{prog.sigla}</span>
                          <span style={{
                            fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                            borderRadius: "9999px", background: band.bg, color: band.text,
                          }}>{prog.bandeira}</span>
                        </div>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                          borderRadius: "9999px", background: `${cfg.color}15`, color: cfg.color,
                          border: `1px solid ${cfg.color}30`,
                        }}>{cfg.label}</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>{prog.desc}</p>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: cfg.color, fontFamily: "monospace" }}>
                        Threshold: {prog.threshold}
                      </p>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ── Ferramentas Grid ───────────────────────────────────────────────── */}
        <section>
          <AnimatedSection>
            <p className="section-eyebrow mb-2">Arsenal de Ferramentas</p>
            <h2 className="font-bold text-white text-lg mb-8">Todos os Módulos de Compliance</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <AnimatedSection key={p.href} delay={i * 0.4}>
                  <Link
                    href={p.href}
                    className="group flex items-center gap-4 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid #0f1a2e",
                      padding: "1.1rem 1.25rem",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: "0.75rem", flexShrink: 0,
                      background: `${p.color}12`, border: `1px solid ${p.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s, border-color 0.2s",
                    }}>
                      <Icon size={18} style={{ color: p.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "white" }} className="truncate">
                          {p.title}
                        </span>
                        {p.alert && (
                          <span style={{
                            fontSize: "0.55rem", fontWeight: 700, padding: "0.15rem 0.45rem",
                            borderRadius: "9999px", background: "rgba(245,158,11,0.15)",
                            color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)",
                            whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {p.alert}
                          </span>
                        )}
                        {p.updated && !p.alert && (
                          <span style={{
                            fontSize: "0.55rem", fontWeight: 700, padding: "0.15rem 0.45rem",
                            borderRadius: "9999px", background: "rgba(74,222,128,0.12)",
                            color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)",
                            whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            ✦ ATUALIZADO
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }} className="truncate block">
                        {p.subtitle}
                      </span>
                    </div>

                    <ChevronRight size={14} style={{ color: p.color, flexShrink: 0, opacity: 0.4 }}
                      className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </section>


        {/* ── Why It Matters (Glassmorphism) ────────────────────────────────── */}
        <section>
          <AnimatedSection>
            <div style={{
              borderRadius: "1.5rem", padding: "2.5rem",
              background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(37,99,235,0.04) 100%)",
              border: "1px solid rgba(139,92,246,0.15)",
              backdropFilter: "blur(16px)",
            }}>
              <p className="section-eyebrow mb-5">Por que isso importa</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: AlertTriangle, color: "#f59e0b", title: "Penalidades acumulam rápido", text: "Um único mês em Excessive VAMP pode custar US$ 10.000–30.000. ECP por 6 meses pode chegar a US$ 60.000 por MID." },
                  { icon: CheckCircle2,  color: "#4ade80", title: "Remediação exige dados corretos", text: "Campos como DE 22, DE 48.61, DE 60.8 e Tag 89 determinam liability shift. Envio incorreto cancela proteção." },
                  { icon: AlertTriangle, color: "#f87171", title: "MCC errado gera intercâmbio errado", text: "QMAP e VIRP auditam continuamente. MCC incorreto afeta intercâmbio, benefícios e conformidade regulatória." },
                  { icon: CheckCircle2,  color: "#60a5fa", title: "MATCH é permanente por 5 anos", text: "Merchant listado não pode ser credenciado por nenhum adquirente. Adquirente que ignora o MATCH responde pelas perdas." },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <AnimatedSection key={item.title} delay={i * 0.3}>
                      <div style={{ display: "flex", gap: "0.875rem", padding: "1.1rem 1.25rem", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.875rem" }}>
                        <Icon size={18} style={{ color: item.color, flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ fontWeight: 700, color: "white", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{item.title}</p>
                          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", lineHeight: 1.65 }}>{item.text}</p>
                        </div>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ── CTA Final ─────────────────────────────────────────────────────── */}
        <AnimatedSection>
          <div style={{
            borderRadius: "1.5rem", padding: "3rem", textAlign: "center",
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.10) 0%, transparent 70%)",
            border: "1px solid rgba(139,92,246,0.18)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "1rem", margin: "0 auto 1.25rem",
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldCheck size={24} style={{ color: "#a78bfa" }} />
            </div>
            <h2 className="font-bold text-white mb-3" style={{ fontSize: "1.5rem" }}>
              Precisa de suporte em compliance de bandeiras?
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", maxWidth: 480, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Consultoria especializada em VAMP, ECP/EFM, programas Elo e estruturação
              de processos de monitoramento para adquirentes.
            </p>
            <Link href="/solucoes" className="btn-primary inline-flex items-center gap-2">
              Ver Soluções de Consultoria <ChevronRight size={13} />
            </Link>
          </div>
        </AnimatedSection>

      </div>
    </main>
  );
}
