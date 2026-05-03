"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Building2, ShieldAlert, Zap, Globe, FileKey, 
  RotateCcw, Scale, DollarSign, ArrowRight, UserPlus, 
  FileBox, Database, ChevronRight, X, Info, Activity,
  Server, Cpu, Network
} from "lucide-react";

type EcoNode = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  items: { label: string; href?: string; active?: boolean; technical?: string }[];
  color: string;
  bg: string;
  details: string;
  impact: string;
};

const ECO_NODES: EcoNode[] = [
  {
    id: "onboarding",
    title: "1. Onboarding & KYC",
    subtitle: "Risco Prévio e Credenciamento",
    icon: UserPlus,
    color: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    details: "Nesta etapa, o Adquirente avalia o risco do lojista antes de permitir a primeira transação. Erros aqui (como MCC errado) geram multas pesadas de programas como BRAM/MMP.",
    impact: "Define a elegibilidade de Intercâmbio através do MCC.",
    items: [
      { label: "Merchant Category Code (MCC)", href: "/compliance/mcc", active: true, technical: "Determina a Tabela de IC" },
      { label: "Auditor BRAM e QMAP", href: "/compliance/bram", active: true, technical: "Monitoramento de Ilegalidades" },
      { label: "Mastercard MATCH Pro", href: "/compliance/match", active: true, technical: "Blacklist de Lojistas" }
    ],
  },
  {
    id: "capture",
    title: "2. Checkout & Captura",
    subtitle: "Início da Arquitetura do Carrinho",
    icon: Globe,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    details: "Onde o dado sensível nasce. A forma como o dado é capturado (E-com, Físico, Digitado) determina o 'Entry Mode' que define o custo operacional.",
    impact: "Entry Mode (DE 22) define se a taxa será IA ou HU.",
    items: [
      { label: "Canais CP e CNP", href: "/canais", active: true, technical: "Entry Mode (ISO DE 22)" },
      { label: "Escopo de Auditoria PCI DSS", href: "/compliance/pci", active: true, technical: "Segurança de Dados" },
      { label: "Stored Credentials (CIT / MIT)", href: "/compliance/credenciais", active: true, technical: "DE 48 SE 22 / SE 43" }
    ],
  },
  {
    id: "security",
    title: "3. Prevenção & Autenticação",
    subtitle: "Decisão de Risco no Lojista",
    icon: ShieldAlert,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    details: "A camada que protege a margem do adquirente. O uso de 3DS garante o Liability Shift, transferindo a responsabilidade da fraude para o emissor.",
    impact: "Garante o Liability Shift e reduz o custo (Elimina Non-Auth Fee).",
    items: [
      { label: "Protocolo 3DS2", href: "/compliance/3ds", active: true, technical: "ECI 02/05 (Liability Shift)" },
      { label: "Network Tokenization", href: "/compliance/tokenizacao", active: true, technical: "MDES / VTS (Segurança)" },
      { label: "Geração de Valores ECI", href: "/compliance/3ds", active: true, technical: "DE 48 (Authentication Data)" }
    ],
  },
  {
    id: "authorization",
    title: "4. Roteamento (ISO 8583)",
    subtitle: "A Fração de Milissegundo (D+0)",
    icon: Zap,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    details: "A mensagem financeira viaja pelo Switch da Bandeira (Banknet/VIP). Qualquer erro de formatação aqui causa queda por Stand-In.",
    impact: "Definição tática do Response Code (DE 39).",
    items: [
      { label: "Padrão ISO 8583 / MTI 0100", href: "/compliance/campos", active: true, technical: "Mensageria de Autenticação" },
      { label: "Data Elements (DE) & PDS", href: "/compliance/campos", active: true, technical: "Payload de Transação" },
      { label: "Response Codes (DE 39)", href: "/compliance/retentativas", active: true, technical: "Status da Aprovação" }
    ],
  },
  {
    id: "clearing",
    title: "5. Clearing & Custos",
    subtitle: "Consolidação de Arquivos (D+1)",
    icon: FileBox,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    details: "Onde o custo real aparece. A bandeira analisa a autorização e 'carimba' o IRD final no arquivo de clearing (IPM/Base II).",
    impact: "Carimbo do IRD final e cobrança de Scheme Fees (MCBS).",
    items: [
      { label: "Arquivos IPM / Base II", href: "/compliance/settlement", active: true, technical: "Liquidação de Arquivo" },
      { label: "Cálculo de Intercâmbio", href: "/simulador", active: true, technical: "Simulação de Custos" },
      { label: "Scheme Fees (MCBS)", href: "/mcbs", active: true, technical: "Tarifas de Rede" }
    ],
  },
  {
    id: "settlement",
    title: "6. Liquidação Financeira",
    subtitle: "A movimentação de Reserva",
    icon: DollarSign,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    details: "O dinheiro chega na conta. Envolve a liquidação via CIP/STR e a gestão de agendas de recebíveis.",
    impact: "Movimentação real de fundos entre bancos via SPB.",
    items: [
      { label: "Settlement D+x", href: "/compliance/settlement", active: true, technical: "Fluxo de Caixa" },
      { label: "Rede CIP/SPB", href: "/compliance/cip", active: true, technical: "Infraestrutura Central" }
    ],
  },
  {
    id: "disputes",
    title: "7. Disputas & Chargebacks",
    subtitle: "Gestão do Pós-Venda",
    icon: Scale,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    details: "O ciclo se fecha. Se o lojista perde a disputa, o valor é estornado do seu settlement e multas podem ser aplicadas.",
    impact: "Risco de perda total da venda + Multas de Programas (VAMP/ECP).",
    items: [
      { label: "Advogado Digital", href: "/compliance/disputas", active: true, technical: "Defesa Forense" },
      { label: "Programas Bandeira", href: "/compliance/programas", active: true, technical: "Multas por Excesso de Fraude" }
    ],
  }
];

export default function EcosystemClient() {
  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);

  return (
    <div className="mx-auto max-w-6xl w-full relative">
      
      {/* ── Conexão Visual (SVG Line) ── */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
           {/* Linha simplificada conectando o fluxo */}
           <path d="M 200 150 L 500 150 L 800 150 L 800 450 L 500 450 L 200 450 L 200 750 L 500 750" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 8" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {ECO_NODES.map((node, idx) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div 
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer h-full border border-slate-800 rounded-3xl bg-[#0a1120]/60 backdrop-blur-md p-6 hover:border-blue-500/30 transition-all flex flex-col group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner"
                    style={{ background: node.bg, color: node.color, borderColor: `${node.color}30` }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight mb-0.5">{node.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{node.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {node.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-400">{item.label}</span>
                      <ChevronRight size={12} className="text-slate-700" />
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} /> Diagnóstico Técnico
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <ArrowRight size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Modal de Detalhes (O "Google Maps" do Ecossistema) ── */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              layoutId={selectedNode.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Lado Esquerdo: Header & Resumo */}
              <div className="md:w-[40%] p-8 border-b md:border-b-0 md:border-r border-slate-800" style={{ background: `linear-gradient(135deg, ${selectedNode.bg}, transparent)` }}>
                <div 
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 border shadow-2xl"
                  style={{ background: selectedNode.bg, color: selectedNode.color, borderColor: `${selectedNode.color}40` }}
                >
                  <selectedNode.icon size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 leading-tight">{selectedNode.title}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{selectedNode.subtitle}</p>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info size={12} /> O que acontece aqui?
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedNode.details}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Zap size={12} /> Impacto no Compliance
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                      {selectedNode.impact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Links e Ferramentas */}
              <div className="flex-1 p-8 bg-[#0a1120] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ferramentas & Normas</h3>
                  <button onClick={() => setSelectedNode(null)} className="p-2 rounded-xl hover:bg-white/5 text-slate-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {selectedNode.items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href || "#"}
                      className={`group flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all ${!item.active ? "opacity-40 grayscale pointer-events-none" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                          <Network size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.technical}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>

                {/* Mini Diagrama Técnico (Fictício para UX) */}
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Arquitetura da Mensagem</p>
                  <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-blue-400/80 border border-slate-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">INPUT:</span> 
                      <span>{selectedNode.id.toUpperCase()}_REQUEST</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">PROCESS:</span> 
                      <span className="text-emerald-400">NETWORK_VALIDATION</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">OUTPUT:</span> 
                      <span className="text-white">ENRICHED_CLEARING_RECORD</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
