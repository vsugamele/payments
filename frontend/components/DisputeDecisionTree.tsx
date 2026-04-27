import { useState } from "react";
import { GitMerge, CheckCircle, ChevronRight, FileText, ArrowRight, ShieldAlert, Cpu, ShoppingBag, TerminalSquare } from "lucide-react";

export default function DisputeDecisionTree({ onCodeSelected }: { onCodeSelected: (code: string) => void }) {
  const [viewMode, setViewMode] = useState<"wizard" | "tree">("wizard");
  const [step, setStep] = useState(1);
  const [selectedNature, setSelectedNature] = useState<string | null>(null);

  // Mapeamento das alternativas para os Reason Codes base
  const handleNatureSelect = (natureId: string, code: string) => {
    setSelectedNature(natureId);
    setStep(2);
    setTimeout(() => {
      onCodeSelected(code);
    }, 600);
  };

  return (
    <div style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-background/50">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
          <GitMerge size={16} className="text-purple-500" />
          Árvore de Decisão de Disputas
        </h2>
        <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
          <button
            onClick={() => setViewMode("wizard")}
            className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "wizard" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Interativo
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "tree" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mapa Lógico Textual
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        {viewMode === "wizard" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {step === 1 && (
                <div>
                   <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-4">
                     Passo 1: Qual a natureza da alegação do consumidor?
                   </label>
                   <div className="space-y-3">
                     {[
                        { id: "fraud", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", title: "Fraude / Não Reconhecimento", desc: "O portador afirma que o cartão foi usado sem autorização.", code: "4837" },
                        { id: "processing", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", title: "Erro de Processamento", desc: "Cobrança dupla, valor divergente ou cancelamento ignorado.", code: "4834" },
                        { id: "consumer", icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", title: "Desacordo Comercial", desc: "Mercadoria não entregue, com defeito ou recusa na devolução.", code: "4853" },
                        { id: "auth", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", title: "Falha de Autorização", desc: "Transação autorizada offline, ou ausência de aprovação online válida.", code: "4808" },
                        { id: "liability", icon: TerminalSquare, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", title: "Liability Shift (Terminal)", desc: "Transação tarja inserida em terminal EMV, alegando falha de leitura magnética.", code: "4870" },
                     ].map(op => (
                        <button
                           key={op.id}
                           onClick={() => handleNatureSelect(op.id, op.code)}
                           className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-4 ${
                              selectedNature === op.id ? `border-border bg-input` : "border-border bg-background hover:bg-input/50"
                           }`}
                        >
                           <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${op.bg} ${op.color} ${op.border} border`}>
                             <op.icon size={16} />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-foreground">{op.title}</h4>
                             <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{op.desc}</p>
                           </div>
                           <ChevronRight size={16} className="text-muted-foreground ml-auto opacity-50 mt-2" />
                        </button>
                     ))}
                   </div>
                </div>
             )}
             {step === 2 && (
                <div className="text-center py-8">
                   <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                     <CheckCircle size={24} />
                   </div>
                   <h3 className="text-foreground font-bold mb-2">Diagnóstico Concluído!</h3>
                   <p className="text-xs text-muted-foreground w-3/4 mx-auto mb-6">
                     Reason Code identificado e regras normativas aplicadas no painel lateral de Representment.
                   </p>
                   <button 
                     onClick={() => { setStep(1); setSelectedNature(null); }}
                     className="text-xs bg-input border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted font-medium"
                   >
                     Recomeçar Árvore
                   </button>
                </div>
             )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-[#0a1120] border border-border rounded-xl p-5 overflow-x-auto text-[11px] font-mono leading-relaxed text-blue-300/80">
<pre>{`[1] A transação possuía AUTENTICAÇÃO FORTE 3DS (ECI 02 ou 05)?
 ├── SIM: O Lojista está protegido por Liability Shift em fraudes.
 │    └── DISPUTA IMPROCEDENTE (EXCETO PARA DESACORDOS COMERCIAIS)
 │
 └── NÃO: (Prossiga para a Alegação do Portador)
      │
      ├── FRAUDE (O Portador não autorizou a transação)
      │    └── Reason Code 4837 (Mastercard) / 10.4 (Visa)
      │         ├── Compelling Evidence: IP Login, Device Fingerprint
      │         └── Aprovador: Lojista que vendeu sem garantia 3DS
      │
      ├── ERRO DE PROCESSAMENTO (Ex: Foi cobrado duas vezes)
      │    └── Reason Code 4834 (Mastercard) / 11.2 (Visa)
      │         └── Compelling Evidence: Os dois comprovantes assinados
      │
      ├── DESACORDO COMERCIAL / CONSUMIDOR (Mercadoria defeituosa)
      │    └── Reason Code 4853 (Mastercard) / 13.1 (Visa)
      │         └── Compelling Evidence: Assinatura de entrega, Logs de uso
      │
      ├── AUTORIZAÇÃO (Transação passou sem resposta online do Emissor)
      │    └── Reason Code 4808 (Mastercard) / 11.3 (Visa)
      │         └── Compelling Evidence: Authorization Log/Trace ISO
      │
      └── FALHA TÉCNICA EMV (Terminal físico recusou leitura de Chip)
           └── Reason Code 4870 (Mastercard) / 10.5 (Visa)
                └── Compelling Evidence: Fallback justificado no DE 22`}</pre>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
