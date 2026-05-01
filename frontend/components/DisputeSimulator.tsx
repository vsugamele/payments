"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Scale, AlertTriangle, ArrowRight, BookOpen, Fingerprint, Cpu } from "lucide-react";
import AIAssistant from "./AIAssistant";

const SCENARIOS = [
  { id: "cnp_3ds", name: "E-commerce (CNP) com 3DS Autenticado", eci: "05", auth: "3DS", brand: "ambas" },
  { id: "cnp_frictionless", name: "E-commerce (CNP) Frictionless (Tentativa)", eci: "06", auth: "3DS", brand: "ambas" },
  { id: "cnp_no_3ds", name: "E-commerce (CNP) sem Autenticação", eci: "07", auth: "None", brand: "ambas" },
  { id: "pos_chip", name: "Presencial (POS) com Chip EMV", eci: null, auth: "Chip", brand: "ambas" },
  { id: "pos_fallback", name: "Presencial (POS) Fallback (Tarja)", eci: null, auth: "Fallback", brand: "ambas" },
];

const REASONS = [
  { code: "10.1", mc: "4837", name: "Fraude: Transação não reconhecida", cat: "Fraude" },
  { code: "12.5", mc: "4853", name: "Produto não entregue", cat: "Serviço" },
  { code: "12.3", mc: "4831", name: "Duplicidade de processamento", cat: "Processamento" },
];

export default function DisputeSimulator() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [reason, setReason] = useState(REASONS[0]);
  const [brand, setBrand] = useState<"visa" | "mastercard">("visa");

  const getLiability = () => {
    if (scenario.auth === "3DS" && scenario.eci === "05") return { winner: "Emissor", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", msg: "Liability Shift ativo. O Banco Emissor assume o prejuízo financeiro da fraude." };
    if (scenario.auth === "None") return { winner: "Adquirente", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", msg: "Sem autenticação forte. O Adquirente (e consequentemente o Lojista) assume todo o risco." };
    if (scenario.auth === "Chip") return { winner: "Emissor", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", msg: "Chip validado (ARQC). O banco emissor é o responsável final." };
    if (scenario.auth === "Fallback") return { winner: "Adquirente", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", msg: "Fallback técnico gera inversão de liability para o Adquirente imediatamente." };
    return { winner: "Condicional", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", msg: "Depende da documentação apresentada na defesa (Representação)." };
  };

  const liability = getLiability();

  return (
    <div className="bg-code-bg border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">Simulador de Liability Shift</h2>
            <p className="text-[10px] text-muted-foreground">Preveja o desfecho da disputa baseando-se no cenário técnico.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Configurator */}
        <div className="p-6 space-y-5 border-r border-border">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">1. Bandeira</label>
            <div className="flex gap-2">
              {["visa", "mastercard"].map((b) => (
                <button 
                  key={b}
                  onClick={() => setBrand(b as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all uppercase ${brand === b ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2. Cenário de Captura</label>
            <div className="grid gap-2">
              {SCENARIOS.map((s) => (
                <button 
                  key={s.id}
                  onClick={() => setScenario(s)}
                  className={`text-left p-3 rounded-xl text-xs border transition-all flex items-center justify-between ${scenario.id === s.id ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'}`}
                >
                  <div className="flex items-center gap-2">
                    {s.auth === '3DS' ? <ShieldCheck size={14} /> : s.auth === 'Chip' ? <Cpu size={14} /> : <AlertTriangle size={14} />}
                    {s.name}
                  </div>
                  {s.eci && <span className="font-mono font-bold opacity-60">ECI {s.eci}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">3. Reason Code</label>
            <select 
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              value={reason.code}
              onChange={(e) => setReason(REASONS.find(r => r.code === e.target.value)!)}
            >
              {REASONS.map(r => (
                <option key={r.code} value={r.code}>{brand === 'visa' ? r.code : r.mc} - {r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="p-6 bg-muted/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diagnóstico Forense</p>
              <div className={`p-5 rounded-2xl border ${liability.bg} ${liability.border} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-black uppercase tracking-tighter ${liability.color}`}>
                    {liability.winner} Assume
                  </span>
                  {liability.winner === 'Emissor' ? <ShieldCheck className="text-green-400" /> : <ShieldAlert className="text-red-400" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {liability.msg} Para o código <strong>{brand === 'visa' ? reason.code : reason.mc}</strong>, as evidências necessárias incluem logs técnicos de {scenario.auth}.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Próximos Passos (Defesa)</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <ArrowRight size={12} className="mt-0.5 text-primary" />
                  Gere o ARN da transação original.
                </li>
                <li className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <ArrowRight size={12} className="mt-0.5 text-primary" />
                  {scenario.auth === '3DS' ? 'Extraia o CAVV/UCAF do log de autorização.' : 'Verifique se o Terminal estava configurado para Chip.'}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <AIAssistant 
              toolName="Simulador de Disputas"
              triggerLabel="Análise Normativa da Disputa"
              context={`Bandeira: ${brand}, Cenário: ${scenario.name}, Reason Code: ${brand === 'visa' ? reason.code : reason.mc} (${reason.name}). Analise quem assume a liability e quais são as chances de sucesso na representação.`}
              placeholder="Quais documentos são aceitos para este reason code?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
