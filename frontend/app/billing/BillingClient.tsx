"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  Sliders,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Database,
  HelpCircle,
  Cpu,
  ShieldCheck,
  Check,
  AlertOctagon,
  ArrowUpRight,
  KeyRound,
  FileCode2,
} from "lucide-react";

// ── DATA: Decline Codes & Smart Retries ──────────────────────────────────────

type DeclineCategory = "soft" | "hard" | "fraude" | "tecnico";

interface DeclineCodeInfo {
  code: string;
  name: string;
  category: DeclineCategory;
  issuerMeaning: string;
  immediateAction: string;
  dunningChannel: string;
  smartRetryWindow: string;
  recoveryRate: number; // %
  vauAbuEligible: boolean;
  networkTokenEligible: boolean;
  tips: string;
}

const DECLINE_CODES: DeclineCodeInfo[] = [
  {
    code: "51",
    name: "Insufficient Funds / Saldo Insuficiente",
    category: "soft",
    issuerMeaning: "O titular não possui limite ou saldo disponível no momento da cobrança.",
    immediateAction: "Não disparar retry imediato. Enfileirar no algoritmo de Smart Retries.",
    dunningChannel: "WhatsApp / Push amigável após 48h avisando sobre tentativa pendente.",
    smartRetryWindow: "Dias 5, 10, 20 ou 30 (dias de pagamento salarial), entre 06:00 e 09:00.",
    recoveryRate: 42,
    vauAbuEligible: false,
    networkTokenEligible: true,
    tips: "Soft decline clássico. 60% das recuperações ocorrem nas primeiras 72h após o 5º dia útil.",
  },
  {
    code: "05",
    name: "Do Not Honor / Não Autorizado pelo Emissor",
    category: "soft",
    issuerMeaning: "Recusa genérica do emissor por suspeita de segurança, canal incomum ou limite diário.",
    immediateAction: "Tentar fallback de adquirente ou 1 retry com intervalo mínimo de 24 horas.",
    dunningChannel: "E-mail/SMS solicitando autorização no app do banco ou troca de cartão.",
    smartRetryWindow: "D+1 (24h após a primeira tentativa) e D+3.",
    recoveryRate: 28,
    vauAbuEligible: false,
    networkTokenEligible: true,
    tips: "Emissores como Itaú e Bradesco frequentemente aprovam no retry se enviado como Network Token com DAF.",
  },
  {
    code: "54",
    name: "Expired Card / Cartão Expirado",
    category: "hard",
    issuerMeaning: "A data de validade informada na transação já expirou.",
    immediateAction: "STOP em retentativas com os dados atuais. Disparar consulta VAU / ABU.",
    dunningChannel: "E-mail transacional solicitando atualização dos dados do cartão.",
    smartRetryWindow: "Imediato após retorno do VAU/ABU com nova validade.",
    recoveryRate: 65,
    vauAbuEligible: true,
    networkTokenEligible: true,
    tips: "O Account Updater recupera automaticamente até 70% desses cartões com novo expiration date.",
  },
  {
    code: "14",
    name: "Invalid Card Number / Número Inválido",
    category: "hard",
    issuerMeaning: "O cartão foi cancelado, reemitido ou o número é inexistente.",
    immediateAction: "Bloquear retentativas. Acionar ABU/VAU para checar reemissão.",
    dunningChannel: "Dunning urgente via e-mail e link de autosserviço para novo cartão.",
    smartRetryWindow: "Somente se o ABU retornar novo PAN; caso contrário, STOP permanente.",
    recoveryRate: 35,
    vauAbuEligible: true,
    networkTokenEligible: false,
    tips: "Retentar número cancelado gera custos de processamento (MCBS) e pode gerar multas de bandeira.",
  },
  {
    code: "65",
    name: "Activity Count / Exceeded Limit",
    category: "soft",
    issuerMeaning: "Titular excedeu a quantidade de transações ou limite diário permitido.",
    immediateAction: "Aguardar virada do dia para retentativa.",
    dunningChannel: "Nenhum no primeiro momento (evitar atrito com o cliente).",
    smartRetryWindow: "D+1 às 08:00 (após virada do ciclo diário do banco emissor).",
    recoveryRate: 55,
    vauAbuEligible: false,
    networkTokenEligible: false,
    tips: "Altíssima taxa de recuperação no dia seguinte sem necessidade de intervenção do usuário.",
  },
  {
    code: "82",
    name: "Incorrect CVV / Código de Segurança Inválido",
    category: "hard",
    issuerMeaning: "CVV informado diverge do cadastrado no banco.",
    immediateAction: "STOP imediato. Não tentar novamente sem correção pelo cliente.",
    dunningChannel: "E-mail de verificação com formulário seguro para reconfirmar CVV.",
    smartRetryWindow: "Sob demanda após preenchimento do cliente.",
    recoveryRate: 18,
    vauAbuEligible: false,
    networkTokenEligible: true,
    tips: "Usar Network Tokens elimina a necessidade de enviar CVV em renovações recorrentes (MIT).",
  },
  {
    code: "91 / 96",
    name: "System Error / Issuer Timeout / Indisponibilidade",
    category: "tecnico",
    issuerMeaning: "Falha de comunicação temporária com o emissor ou na rede da bandeira.",
    immediateAction: "Disparar Cascata / Fallback para Adquirente Secundária ou retry em 15 minutos.",
    dunningChannel: "Nenhum.",
    smartRetryWindow: "15 min $\\rightarrow$ 2 horas $\\rightarrow$ 6 horas.",
    recoveryRate: 82,
    vauAbuEligible: false,
    networkTokenEligible: false,
    tips: "Falha puramente técnica. Saber configurar STIP na bandeira aprova grande parte dessas transações.",
  },
  {
    code: "MAC 01",
    name: "Merchant Advice Code 01: New Account Info",
    category: "soft",
    issuerMeaning: "Mastercard sinaliza que o titular possui um novo cartão emitido.",
    immediateAction: "Consultar ABU para receber o novo PAN e atualizar base de recorrência.",
    dunningChannel: "Nenhum se o ABU resolver; e-mail de dunning se o ABU falhar.",
    smartRetryWindow: "Processar com as novas credenciais assim que o ABU retornar.",
    recoveryRate: 88,
    vauAbuEligible: true,
    networkTokenEligible: true,
    tips: "MAC padrão da Mastercard para indicar sucesso garantido via Automatic Billing Updater.",
  },
  {
    code: "MAC 03 / 21",
    name: "Merchant Advice Code 03/21: Do Not Try Again",
    category: "hard",
    issuerMeaning: "O cliente cancelou a assinatura ou revogou o consentimento de débito.",
    immediateAction: "CANCELAMENTO IMEDIATO do agendamento. Proibido retentar.",
    dunningChannel: "E-mail de confirmação de cancelamento e pesquisa de churn.",
    smartRetryWindow: "NUNCA (Tentativas geram multas pesadas da Mastercard).",
    recoveryRate: 0,
    vauAbuEligible: false,
    networkTokenEligible: false,
    tips: "Mastercard penaliza comerciantes que realizam mais de 15 retries em 30 dias em cartões com MAC 03.",
  },
];

export default function BillingClient() {
  const [activeTab, setActiveTab] = useState<"decline" | "recovery" | "compliance" | "authorization">("decline");

  // ── ESTADOS DA ABA 1: Decline Codes
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCode, setSelectedCode] = useState<DeclineCodeInfo>(DECLINE_CODES[0]);

  // ── ESTADOS DA ABA 2: Calculadora de Revenue Recovery
  const [mrr, setMrr] = useState<number>(1000000); // R$ 1.000.000
  const [ticketMedio, setTicketMedio] = useState<number>(120); // R$ 120
  const [initialDeclineRate, setInitialDeclineRate] = useState<number>(14); // 14% de recusa inicial
  const [involuntaryChurnRate, setInvoluntaryChurnRate] = useState<number>(18); // 18% churn anual
  
  // Toggles de Otimização
  const [enableNetworkTokens, setEnableNetworkTokens] = useState<boolean>(true);
  const [enableSmartRetries, setEnableSmartRetries] = useState<boolean>(true);
  const [enableAccountUpdater, setEnableAccountUpdater] = useState<boolean>(true);
  const [enableRoutingFallback, setEnableRoutingFallback] = useState<boolean>(true);

  // ── ESTADOS DA ABA 3: Compliance & Multas
  const [monthlyVolume, setMonthlyVolume] = useState<number>(5000000); // R$ 5M
  const [totalTransactions, setTotalTransactions] = useState<number>(45000); // 45k txs
  const [totalDisputes, setTotalDisputes] = useState<number>(360); // 360 disputas
  const [disputeVolumeBRL, setDisputeVolumeBRL] = useState<number>(45000); // R$ 45k

  // ── CÁLCULOS ABA 2: Revenue Recovery
  const totalSubscribers = Math.round(mrr / ticketMedio);
  const monthlyDeclinedMRR = mrr * (initialDeclineRate / 100);

  // Ganhos estimados por alavanca:
  const tokenGainPct = enableNetworkTokens ? 3.0 : 0; // +3.0% aprovação direta
  const retryRecoveryPct = enableSmartRetries ? 30.0 : 0; // 30% dos soft declines recuperados
  const vauRecoveryPct = enableAccountUpdater ? 12.0 : 0; // 12% a mais de retenção de base
  const routingGainPct = enableRoutingFallback ? 2.0 : 0; // +2.0% de aprovação

  // Taxa de recuperação composta dos declínios
  const totalRecoveryRate = (tokenGainPct * 1.5) + (retryRecoveryPct * 0.6) + (vauRecoveryPct * 0.4) + (routingGainPct * 1.2);
  const effectiveRecoveryRate = Math.min(68, totalRecoveryRate); // Cap de 68%
  const monthlyRecoveredBRL = monthlyDeclinedMRR * (effectiveRecoveryRate / 100);
  const annualRecoveredBRL = monthlyRecoveredBRL * 12;
  const savedSubscribers = Math.round(monthlyRecoveredBRL / ticketMedio);
  const newDeclineRate = Math.max(3.5, initialDeclineRate * (1 - (effectiveRecoveryRate / 100)));
  const newInvoluntaryChurn = Math.max(5.0, involuntaryChurnRate * (1 - (effectiveRecoveryRate * 0.008)));

  // ── CÁLCULOS ABA 3: Compliance & Chargeback
  const disputeRatio = totalTransactions > 0 ? (totalDisputes / totalTransactions) * 100 : 0;
  const fraudRatio = monthlyVolume > 0 ? (disputeVolumeBRL / monthlyVolume) * 100 : 0;

  // Status Visa VDMP: Normal (<0.65%), Early Warning (0.65% a 0.89%), Standard (0.90% a 1.79%), Excessive (>=1.80%)
  const getVisaStatus = () => {
    if (disputeRatio < 0.65) return { status: "Saudável", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", fineUSD: 0 };
    if (disputeRatio < 0.90) return { status: "Early Warning (0.65%)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", fineUSD: 0 };
    if (disputeRatio < 1.80) {
      const excess = Math.max(0, totalDisputes - Math.round(totalTransactions * 0.009));
      return { status: "Standard Warning (0.90%)", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", fineUSD: excess * 50 + 2500 };
    }
    const excess = Math.max(0, totalDisputes - Math.round(totalTransactions * 0.009));
    return { status: "Excessive (1.80%+)", color: "text-red-500 font-bold", bg: "bg-red-500/20", border: "border-red-500/50", fineUSD: excess * 100 + 10000 };
  };

  // Status Mastercard ECP / MDMP: Normal (<1.50%), Tier 1 (1.50% a 1.99%), Tier 2 (>=2.00%)
  const getMastercardStatus = () => {
    if (disputeRatio < 1.50) return { status: "Saudável", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", fineUSD: 0 };
    if (disputeRatio < 2.00) return { status: "Tier 1 Warning (1.50%)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", fineUSD: 1000 };
    return { status: "Tier 2 Excessive (2.00%+)", color: "text-red-500 font-bold", bg: "bg-red-500/20", border: "border-red-500/50", fineUSD: 5000 };
  };

  const visaStatus = getVisaStatus();
  const mcStatus = getMastercardStatus();

  // Filtro de Decline codes
  const filteredCodes = DECLINE_CODES.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid border-b border-border pt-28 pb-12 px-6"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <span className="text-foreground">Billing & Revenue Recovery</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="section-eyebrow">Operating Suite</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Infraestrutura de Alta Performance
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground">
                Billing, Retries & <span className="text-blue-500">Revenue Recovery</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                Otimização da esteira de pagamentos: inteligência de recusas (Decline Codes), estratégias de Smart Retries para assinaturas, controle de compliance (VFMP/ECP) e engenharia de autorização (DAF, STIP, DE 22).
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/sobre" className="btn-outline text-xs">
                Ver Background do Especialista
              </Link>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 mt-8 border-b border-border/80 pb-px">
            <button
              onClick={() => setActiveTab("decline")}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === "decline"
                  ? "bg-muted/40 border-blue-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <RefreshCw size={16} className={activeTab === "decline" ? "text-blue-400" : ""} />
              1. Decline Codes & Smart Retries
            </button>

            <button
              onClick={() => setActiveTab("recovery")}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === "recovery"
                  ? "bg-muted/40 border-emerald-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <TrendingUp size={16} className={activeTab === "recovery" ? "text-emerald-400" : ""} />
              2. Calculadora de Revenue Recovery & Assinaturas
            </button>

            <button
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === "compliance"
                  ? "bg-muted/40 border-rose-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <ShieldAlert size={16} className={activeTab === "compliance" ? "text-rose-400" : ""} />
              3. Monitor de Compliance & Multas (VFMP / ECP)
            </button>

            <button
              onClick={() => setActiveTab("authorization")}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === "authorization"
                  ? "bg-muted/40 border-indigo-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <Cpu size={16} className={activeTab === "authorization" ? "text-indigo-400" : ""} />
              4. Engenharia de Autorização & Performance
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-10">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 1: DECLINE CODES & SMART RETRIES */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "decline" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-3">
              <Zap size={18} className="text-blue-400 shrink-0" />
              <span>
                <strong>Princípio de Recuperação:</strong> Nem todo erro pode ser retentado. Separamos <em>Soft Declines</em> (saldo, limite, instabilidade) para retries programados de <em>Hard Declines</em> (cancelado, roubado) que exigem Dunning e Account Updater (VAU/ABU).
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Lista e Filtros */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Buscar código (ex: 51, 05, MAC)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1">
                    {["all", "soft", "hard", "tecnico"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                  {filteredCodes.map((item) => {
                    const isSelected = selectedCode.code === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => setSelectedCode(item)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-blue-500/10 border-blue-500 text-foreground shadow-md shadow-blue-500/5"
                            : "bg-card border-border text-muted-foreground hover:border-blue-500/30 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-primary">
                            Code {item.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.category === "soft"
                                ? "bg-blue-500/15 text-blue-400"
                                : item.category === "hard"
                                ? "bg-rose-500/15 text-rose-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-1">{item.immediateAction}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalhe do Código & Inteligência */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-primary px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          Código {selectedCode.code}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            selectedCode.category === "soft"
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : selectedCode.category === "hard"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {selectedCode.category.toUpperCase()} DECLINE
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-foreground mt-2">{selectedCode.name}</h3>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Recuperação Estimada</p>
                      <p className="text-2xl font-black text-emerald-400">{selectedCode.recoveryRate}%</p>
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-primary" />
                      Significado do Emissor
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border">
                      {selectedCode.issuerMeaning}
                    </p>
                  </div>

                  {/* Ação Imediata & Canal de Dunning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Ação Imediata</p>
                      <p className="text-xs text-foreground font-semibold leading-relaxed">{selectedCode.immediateAction}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Canal de Dunning</p>
                      <p className="text-xs text-foreground font-semibold leading-relaxed">{selectedCode.dunningChannel}</p>
                    </div>
                  </div>

                  {/* Janela de Smart Retry */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                      <Calendar size={15} />
                      Janela Recomendada de Smart Retry
                    </div>
                    <p className="text-xs text-slate-200 font-mono leading-relaxed">{selectedCode.smartRetryWindow}</p>
                  </div>

                  {/* Habilitações Tecnológicas */}
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-xs">
                      {selectedCode.vauAbuEligible ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground/40" />
                      )}
                      <span className={selectedCode.vauAbuEligible ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Account Updater (VAU/ABU)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {selectedCode.networkTokenEligible ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground/40" />
                      )}
                      <span className={selectedCode.networkTokenEligible ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Network Token (VTS/MDES)
                      </span>
                    </div>
                  </div>

                  {/* Dica do Especialista */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                    <strong>Dica de Operação:</strong> {selectedCode.tips}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 2: CALCULADORA DE REVENUE RECOVERY */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "recovery" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
              <TrendingUp size={18} className="text-emerald-400 shrink-0" />
              <span>
                <strong>Impacto Financeiro Comprovado:</strong> Simule o ganho de receita recuperada e redução de churn involuntário ativando as 4 alavancas de infraestrutura: Network Tokens, Smart Retries, Account Updater e Roteamento em Cascata.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Painel de Parâmetros e Alavancas */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    Parâmetros da Operação
                  </h3>

                  {/* MRR */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Faturamento Recorrente Mensal (MRR)</span>
                      <span className="font-bold text-foreground font-mono">
                        {mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={10000000}
                      step={50000}
                      value={mrr}
                      onChange={(e) => setMrr(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Ticket Médio */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Ticket Médio por Assinante</span>
                      <span className="font-bold text-foreground font-mono">
                        {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={1000}
                      step={10}
                      value={ticketMedio}
                      onChange={(e) => setTicketMedio(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Taxa de Recusa Inicial */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Taxa de Recusa Inicial na Renovação</span>
                      <span className="font-bold text-rose-400 font-mono">{initialDeclineRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={0.5}
                      value={initialDeclineRate}
                      onChange={(e) => setInitialDeclineRate(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Churn Involuntário Atual */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Taxa de Churn Involuntário Anual</span>
                      <span className="font-bold text-amber-400 font-mono">{involuntaryChurnRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={0.5}
                      value={involuntaryChurnRate}
                      onChange={(e) => setInvoluntaryChurnRate(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Toggles das 4 Alavancas */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-emerald-400" />
                    Alavancas de Otimização
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50">
                      <div>
                        <p className="text-xs font-bold text-foreground">Network Tokens (VTS / MDES)</p>
                        <p className="text-[11px] text-muted-foreground">+3.0% de aprovação direta no emissor</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableNetworkTokens}
                        onChange={(e) => setEnableNetworkTokens(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50">
                      <div>
                        <p className="text-xs font-bold text-foreground">Smart Retries Multi-janela</p>
                        <p className="text-[11px] text-muted-foreground">Recuperação de 30% dos soft declines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableSmartRetries}
                        onChange={(e) => setEnableSmartRetries(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50">
                      <div>
                        <p className="text-xs font-bold text-foreground">Account Updater (VAU / ABU)</p>
                        <p className="text-[11px] text-muted-foreground">Atualização de cartões expirados/trocados</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableAccountUpdater}
                        onChange={(e) => setEnableAccountUpdater(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50">
                      <div>
                        <p className="text-xs font-bold text-foreground">Roteamento & Fallback PSP</p>
                        <p className="text-[11px] text-muted-foreground">+2.0% de conversão via cascata</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableRoutingFallback}
                        onChange={(e) => setEnableRoutingFallback(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Resultados do Impacto Financeiro */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Cartões Principais de Retorno */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 via-emerald-950/20 to-card border border-emerald-500/30 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Receita Recuperada / Mês</p>
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {monthlyRecoveredBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      +{(effectiveRecoveryRate).toFixed(1)}% de eficácia sobre o valor recusado
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 via-blue-950/20 to-card border border-blue-500/30 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-400">ARR Adicional Recuperado</p>
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {annualRecoveredBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[11px] text-blue-300/80">
                      Impacto anual direto na última linha do faturamento
                    </p>
                  </div>
                </div>

                {/* Métricas Operacionais Comparativas */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Transformação dos Indicadores de Billing
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-[11px] text-muted-foreground mb-1">Assinantes Salvos / Mês</p>
                      <p className="text-2xl font-black text-foreground">{savedSubscribers.toLocaleString("pt-BR")}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">vidas retidas na base</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-[11px] text-muted-foreground mb-1">Decline Rate Final</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs text-rose-400 line-through">{initialDeclineRate}%</span>
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="text-2xl font-black text-emerald-400">{newDeclineRate.toFixed(1)}%</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">recusa real residual</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-[11px] text-muted-foreground mb-1">Churn Involuntário Anual</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs text-amber-400 line-through">{involuntaryChurnRate}%</span>
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="text-2xl font-black text-emerald-400">{newInvoluntaryChurn.toFixed(1)}%</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">retenção blindada</p>
                    </div>
                  </div>

                  {/* Resumo do Plano de Ação */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <p className="text-xs font-bold text-foreground">Como atingir esses números na prática:</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Sincronizar a esteira de retries no 5º e 20º dia do mês antes das 09h da manhã.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Substituir DPAN por Network Tokens da Visa/Mastercard para obter aprovação sem CVV.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Configurar job diário de VAU/ABU para receber alterações de validade e numeração de cartões.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 3: MONITOR DE COMPLIANCE & MULTAS */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "compliance" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-3">
              <ShieldAlert size={18} className="text-rose-400 shrink-0" />
              <span>
                <strong>Blindagem de Bandeiras:</strong> Monitore seus índices de Chargeback (CTR) e Fraude (FSR) para prevenir a entrada no Visa Dispute Monitoring Program (VDMP/VFMP) e Mastercard Excessive Chargeback Program (ECP).
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Inputs de Volume e Disputas */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Dados do Mês em Análise
                  </h3>

                  {/* Volume Transacionado */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Volume de Vendas no Mês</span>
                      <span className="font-bold text-foreground font-mono">
                        {monthlyVolume.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500000}
                      max={50000000}
                      step={500000}
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Quantidade de Transações */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Total de Transações Capturadas</span>
                      <span className="font-bold text-foreground font-mono">{totalTransactions.toLocaleString("pt-BR")} txs</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={500000}
                      step={5000}
                      value={totalTransactions}
                      onChange={(e) => setTotalTransactions(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Quantidade de Chargebacks */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Contestadações / Chargebacks (Qtd)</span>
                      <span className="font-bold text-rose-400 font-mono">{totalDisputes} disputas</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={2000}
                      step={10}
                      value={totalDisputes}
                      onChange={(e) => setTotalDisputes(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Volume Financeiro de Disputas */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Volume Financeiro em Disputa</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {disputeVolumeBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={1000000}
                      step={5000}
                      value={disputeVolumeBRL}
                      onChange={(e) => setDisputeVolumeBRL(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>

                {/* Taxas Calculadas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border text-center">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold">Dispute Ratio (CTR)</p>
                    <p className="text-2xl font-black text-foreground font-mono mt-1">{disputeRatio.toFixed(2)}%</p>
                    <p className="text-[10px] text-muted-foreground">Disputas / Transações</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border text-center">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold">Fraud Ratio (FSR)</p>
                    <p className="text-2xl font-black text-foreground font-mono mt-1">{fraudRatio.toFixed(2)}%</p>
                    <p className="text-[10px] text-muted-foreground">R$ Fraude / R$ Vendas</p>
                  </div>
                </div>
              </div>

              {/* Status das Bandeiras e Estimativa de Multas */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Status Visa VDMP */}
                <div className={`p-6 rounded-2xl border ${visaStatus.border} ${visaStatus.bg} space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-400 text-base">VISA</span>
                      <span className="text-xs font-bold text-muted-foreground">VDMP (Visa Dispute Monitoring Program)</span>
                    </div>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${visaStatus.color} bg-black/20`}>
                      {visaStatus.status}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Limiares: Early Warning = <strong>0.65%</strong> | Standard Warning = <strong>0.90%</strong> | Excessive = <strong>1.80%</strong>.
                  </div>

                  {visaStatus.fineUSD > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
                      ⚠️ <strong>Penalidade Estimada:</strong> USD {visaStatus.fineUSD.toLocaleString("en-US")} (~R$ {(visaStatus.fineUSD * 5.65).toLocaleString("pt-BR")}) por mês enquanto permanecer em excesso.
                    </div>
                  )}
                </div>

                {/* Status Mastercard ECP */}
                <div className={`p-6 rounded-2xl border ${mcStatus.border} ${mcStatus.bg} space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-red-500 text-base">MASTERCARD</span>
                      <span className="text-xs font-bold text-muted-foreground">ECP / MDMP (Excessive Chargeback Program)</span>
                    </div>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${mcStatus.color} bg-black/20`}>
                      {mcStatus.status}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Limiares: Tier 1 Warning = <strong>1.50%</strong> | Tier 2 Excessive = <strong>2.00%</strong> (+100 CBs/mês).
                  </div>

                  {mcStatus.fineUSD > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
                      ⚠️ <strong>Penalidade Estimada:</strong> USD {mcStatus.fineUSD.toLocaleString("en-US")} (~R$ {(mcStatus.fineUSD * 5.65).toLocaleString("pt-BR")}) por mês.
                    </div>
                  )}
                </div>

                {/* Plano de Ação para Sair da Monitoria */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Plano de Remediação & Defesa de Chargebacks
                  </h4>

                  <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <span><strong>Ativação de 3DS 2.2 com ECI 05:</strong> Garante o <em>Liability Shift</em> total para o banco emissor nas transações suspeitas de fraude (eliminando Reason Code 10.1 / 4837).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <span><strong>Compelling Evidence 3.0 (Visa):</strong> Envio automático de comprovantes de compras anteriores sem disputa para cancelamento imediato do chargeback.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">3.</span>
                      <span><strong>Cancelamento Imediato de Clientes Problemáticos:</strong> Bloqueio preventivo no antifraude de cartões e CPFs com disputas recorrentes.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 4: ENGENHARIA DE AUTORIZAÇÃO & PERFORMANCE */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "authorization" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-3">
              <Cpu size={18} className="text-indigo-400 shrink-0" />
              <span>
                <strong>Deep Tech em Pagamentos:</strong> Como a engenharia de mensageria ISO 8583, o Visa DAF, o STIP e o correto envio do POS Entry Mode (DE 22) elevam a taxa de aprovação para patamares superiores a 97%.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1: Visa DAF & Mastercard DAA */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Visa DAF & Mastercard DAA</h3>
                    <p className="text-xs text-primary font-semibold">Digital Authentication Framework</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao vincular a autenticação inicial com 3DS ao <strong>Network Token (VTS/MDES)</strong> na primeira compra (CIT), todas as renovações subsequentes (MIT) recebem as flags oficiais do DAF.
                </p>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Aprovação Média em MIT:</span>
                    <span className="text-emerald-400 font-bold">97.4% a 98.9%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Proteção de Fraude:</span>
                    <span className="text-blue-400 font-bold">Liability Shift Total</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Recusa por &apos;Do Not Honor&apos; (05):</span>
                    <span className="text-emerald-400 font-bold">Bloqueada contratualmente</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                  💡 <strong>Benefício Direto:</strong> O emissor é contratualmente impedido de declinar a transação recorrente por suspeita genérica de fraude.
                </div>
              </div>

              {/* Card 2: Maximização de STIP (Stand-In Processing) */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Otimização de STIP</h3>
                    <p className="text-xs text-amber-400 font-semibold">Stand-In Processing & Switch On-Behalf</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quando o banco emissor entra em timeout (&gt;2.5 segundos), o switch da VisaNet ou Mastercard pode autorizar a transação automaticamente em nome do banco (*On-Behalf*).
                </p>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Requisitos para Aprovação no STIP:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Criptograma dinâmico de Network Token (TAVV / UCAF) válido.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Indicador de validação de CVV Match no payload.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Score de risco da rede dentro da janela de confiança do emissor.</span>
                    </li>
                  </ul>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                  ⚡ <strong>Impacto:</strong> Evita erros `91` (System Error) e recupera de 3% a 5% de autorizações em horários de pico.
                </div>
              </div>

              {/* Card 3: POS Entry Mode (DE 22) & CAT Levels (DE 61) */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileCode2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">POS Entry Mode (DE 22)</h3>
                    <p className="text-xs text-indigo-400 font-semibold">Formatação Rigorosa de Mensageria</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  O campo **DE 22** informa ao motor de risco do emissor a forma exata como o cartão foi capturado.
                </p>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground font-bold">
                      <tr>
                        <th className="p-2.5">Código</th>
                        <th className="p-2.5">Tipo de Captura</th>
                        <th className="p-2.5">Impacto no Emissor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-2.5 font-mono text-primary font-bold">81</td>
                        <td className="p-2.5">Network Token E-commerce</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">Aprovação Máxima (&gt;96%)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-primary font-bold">10</td>
                        <td className="p-2.5">Credencial Salva (COF / MIT)</td>
                        <td className="p-2.5 text-blue-400 font-semibold">Aprovação Alta (~91%)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400 font-bold">01</td>
                        <td className="p-2.5">Digitação Manual (Keyed)</td>
                        <td className="p-2.5 text-rose-400 font-semibold">Alta Fricção e Recusa (72%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                  ⚠️ <strong>Atenção:</strong> Enviar recorrência como `01` faz o emissor tratar como digitação fraudulenta manual.
                </div>
              </div>

              {/* Card 4: Zero-Dollar Auth & Prevenção a Card Testing */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Zero-Dollar Verification</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Validação de Cartões em Trials & Cadastros</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Em vez de debitar e estornar R$ 1,00 (que aciona alarmes de fraude no banco do cliente), utiliza-se o formato oficial de **Account Verification (MTI 0100 com valor zero)**.
                </p>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Benefícios da Verificação Zero-Dollar:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Não deixa registro temporário de cobrança de R$ 1,00 na fatura.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Gera o Token de Bandeira imediatamente no cadastro inicial.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400" />
                      <span>Blindagem contra bots de *Card Testing Attack* através de rate limiting e velocity checks.</span>
                    </li>
                  </ul>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                  🛡️ <strong>Compliance:</strong> Em conformidade com o manual de segurança e autorização da Visa e Mastercard.
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
