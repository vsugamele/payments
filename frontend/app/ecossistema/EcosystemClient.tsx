"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, ShieldAlert, Zap, Globe, FileKey, 
  RotateCcw, Scale, DollarSign, ArrowRight, UserPlus, FileBox, Database
} from "lucide-react";

type EcoNode = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  items: { label: string; href?: string; active?: boolean }[];
  color: string;
  bg: string;
  colSpan?: number;
};

// "Business View" do ecossistema de pagamentos
const ECO_NODES: EcoNode[] = [
  {
    id: "onboarding",
    title: "1. Onboarding & KYC",
    subtitle: "Risco Prévio e Credenciamento",
    icon: UserPlus,
    color: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    colSpan: 1,
    items: [
      { label: "Merchant Category Code (MCC)", href: "/compliance/mcc", active: true },
      { label: "Auditor BRAM e QMAP", href: "/compliance/bram", active: true },
      { label: "Mastercard MATCH Pro", href: "/compliance/match", active: true },
      { label: "Prevenção Lavagem de Dinheiro (AML)", active: false }
    ],
  },
  {
    id: "capture",
    title: "2. Checkout & Captura",
    subtitle: "Início da Arquitetura do Carrinho",
    icon: Globe,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    colSpan: 1,
    items: [
      { label: "Canais CP e CNP", href: "/canais", active: true },
      { label: "Escopo de Auditoria PCI DSS", href: "/compliance/pci", active: true },
      { label: "Stored Credentials (CIT / MIT)", href: "/compliance/credenciais", active: true },
      { label: "Fluxos Quasi-Cash (Funding AFT/OCT)", href: "/compliance/quasicash", active: true }
    ],
  },
  {
    id: "security",
    title: "3. Prevenção & Autenticação",
    subtitle: "Decisão de Risco no Lojista",
    icon: ShieldAlert,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    colSpan: 1,
    items: [
      { label: "Protocolo 3DS (Frictionless / Challenge)", href: "/compliance/3ds", active: true },
      { label: "Network Tokenization (MDES / VTS)", href: "/compliance/tokenizacao", active: true },
      { label: "Isenção de Autenticação (DAF)", href: "/compliance/tokenizacao", active: true },
      { label: "Geração de Valores ECI", href: "/compliance/3ds", active: true }
    ],
  },
  {
    id: "authorization",
    title: "4. Roteamento & ISO 8583",
    subtitle: "A Fração de Milissegundo (D+0)",
    icon: Zap,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    colSpan: 3, // Ocupa a linha toda para mostrar as partes do T (Gateway -> Adquirente -> Bandeira -> Emissor)
    items: [
      { label: "Padrão ISO 8583 / MTI 0100", href: "/jornada", active: true },
      { label: "Data Elements (DE) & PDS", href: "/compliance/campos", active: true },
      { label: "Decodificador de TVR (EMV)", href: "/compliance/emv", active: true },
      { label: "Verificação Bandeira (STIP/Switch)", href: "/jornada", active: true },
      { label: "Response Codes (DE 39) e Retentativas", href: "/compliance/retentativas", active: true }
    ],
  },
  {
    id: "clearing",
    title: "5. Clearing & Custos (Noturno)",
    subtitle: "D+1 e Consolidação de Arquivos",
    icon: FileBox,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    colSpan: 1,
    items: [
      { label: "Arquivos IPM / Base II (TC46)", href: "/compliance/settlement", active: true },
      { label: "Cálculo de Base Intercâmbio", href: "/simulador", active: true },
      { label: "Avaliação de Downgrade Incorreto", href: "/compliance/downgrade", active: true },
      { label: "Bandeira Scheme Fees (NABU/Cross-border)", href: "/compliance/fees", active: true }
    ],
  },
  {
    id: "settlement",
    title: "6. Liquidação Financeira",
    subtitle: "A movimentação de Reserva",
    icon: DollarSign,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    colSpan: 1,
    items: [
      { label: "Esquema Settlement D+x", href: "/compliance/settlement", active: true },
      { label: "Regras BCB e EFA (Recebíveis)", href: "/compliance/settlement", active: true },
      { label: "Rede CIP/SPB", href: "/compliance/cip", active: true }
    ],
  },
  {
    id: "disputes",
    title: "7. Disputas & Monitoramento",
    subtitle: "Gestão do Pós-Venda (VDMG / Mastercom)",
    icon: Scale,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    colSpan: 1,
    items: [
      { label: "Simulador Forense de Disputas", href: "/compliance/disputas", active: true },
      { label: "Compelling Evidence 3.0 (CE 3.0)", href: "/compliance/disputas", active: true },
      { label: "Programas Bandeira (VAMP/ECP/EFM)", href: "/compliance/programas", active: true },
      { label: "Calculadora de Multas BRAM/MMP", href: "/compliance/risco", active: true }
    ],
  }
];

export default function EcosystemClient() {
  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        
        {ECO_NODES.map((node) => {
          const Icon = node.icon;
          return (
            <div 
              key={node.id} 
              className={`border border-border/60 rounded-2xl bg-code-bg p-6 shadow-sm hover:border-border transition-colors flex flex-col`}
              style={{ gridColumn: node.colSpan === 3 ? "1 / -1" : "auto" }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{ background: node.bg, color: node.color, borderColor: `${node.color}30` }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                    {node.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{node.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-grow bg-background rounded-lg border border-border p-3">
                {node.items.map((item, idx) => (
                  item.active && item.href ? (
                    <Link
                      key={idx}
                      href={item.href}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <span className="text-sm text-foreground/90 font-medium group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 hidden sm:block" />
                    </Link>
                  ) : (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 opacity-50 cursor-not-allowed grayscale"
                    >
                      <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/30">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase border px-1 rounded">Em Breve</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}

        {/* Decorative Grid SVG background elements could go here if wanted */}
      </div>
    </div>
  );
}
