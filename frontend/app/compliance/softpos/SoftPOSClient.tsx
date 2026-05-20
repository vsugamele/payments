"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  Wifi, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  SmartphoneNfc,
  RefreshCcw,
  Info,
  Layers,
  Key,
  Database,
  ArrowRight
} from "lucide-react";
import softposData from "@/data/softpos.json";

export default function SoftPOSClient() {
  const [step, setStep] = useState<"idle" | "attestation" | "keyExchange" | "tap" | "pin" | "authorizing" | "success">("idle");
  const [amount, setAmount] = useState(250); // R$ (padrão acima do limite de R$200 do Brasil para exigir PIN)
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Teclado PIN randomizado para segurança (padrão MPOC)
  const [pinPadLayout, setPinPadLayout] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const startAttestation = () => {
    setStep("attestation");
    setLogs([]);
    addLog("Iniciando atestação de integridade PCI MPoC...");
    
    setTimeout(() => {
      addLog("Verificando Root & Tamper Detection... OK");
      addLog("Checando assinatura do APK e integridade... OK");
      addLog("Atestação de hardware confirmada pelo Play Integrity API.");
      setStep("keyExchange");
      addLog("Iniciando estabelecimento de canal seguro de comunicação...");
    }, 1800);
  };

  const handleKeyExchange = () => {
    setTimeout(() => {
      addLog("Chave de sessão efêmera gerada via ECDH (TEE do Celular).");
      addLog("Criptografia DUKPT (Derived Unique Key Per Transaction) inicializada.");
      setStep("tap");
      addLog("Aguardando aproximação do cartão NFC...");
    }, 1500);
  };

  const handleTap = () => {
    setStep("tap");
    addLog("Campo NFC ativado. Lendo dados do cartão...");
    
    setTimeout(() => {
      addLog("Comandos APDU enviados: SELECT PPSE [A0000000031010]... OK");
      addLog("Dados lidos: PAN tokenizado e data de validade obtidos.");
      addLog("ARQC (Cryptogram) gerado pelo chip do cartão.");
      
      if (amount > 200) {
        addLog(`Valor da transação (R$ ${amount.toFixed(2)}) excede limite sem PIN (R$ 200,00). Exigindo PIN on Glass.`);
        // Randomizar teclado de acordo com o padrão MPoC
        const shuffled = [...pinPadLayout].sort(() => Math.random() - 0.5);
        setPinPadLayout(shuffled);
        setStep("pin");
      } else {
        addLog("Valor dentro do limite sem senha. Ignorando PIN on Glass.");
        sendToAuthorization();
      }
    }, 1800);
  };

  const pressPinDigit = (num: number) => {
    if (pinDigits.length < 4) {
      const newPin = [...pinDigits, num.toString()];
      setPinDigits(newPin);
      addLog(`Dígito ${newPin.length} do PIN inserido.`);
      
      if (newPin.length === 4) {
        addLog("PIN completo. Criptografando bloco de PIN com a chave do HSM adquirente (DUKPT PEK)...");
        setTimeout(() => {
          sendToAuthorization();
        }, 800);
      }
    }
  };

  const clearPin = () => {
    setPinDigits([]);
    addLog("PIN limpo pelo usuário.");
  };

  const sendToAuthorization = () => {
    setStep("authorizing");
    addLog("Enviando requisição de autorização ISO 8583 para a Adquirente...");
    
    setTimeout(() => {
      addLog("Mensagem 0100 (Request) processada pela bandeira.");
      addLog("Retorno 0110 (Response) recebido: DE 39 = '00' (Aprovado).");
      setStep("success");
      addLog("Transação aprovada com sucesso via SoftPOS!");
    }, 1850);
  };

  const resetSimulator = () => {
    setStep("idle");
    setPinDigits([]);
    setLogs([]);
  };

  return (
    <div className="space-y-12">
      
      {/* ── Simulador de Terminal SoftPOS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* O Celular do Lojista */}
        <div className="lg:col-span-6 flex flex-col items-center py-10 bg-[#0a1120] border border-slate-800 rounded-[3rem] relative overflow-hidden">
           
           {/* Seletor de Valor no topo */}
           <div className="mb-6 z-10 flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Valor:</span>
              <div className="flex items-center gap-1.5">
                 <button 
                   onClick={() => { setAmount(150); resetSimulator(); }}
                   className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${amount === 150 ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                 >
                   R$ 150 (Sem PIN)
                 </button>
                 <button 
                   onClick={() => { setAmount(250); resetSimulator(); }}
                   className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${amount === 250 ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                 >
                   R$ 250 (Exige PIN)
                 </button>
              </div>
           </div>

           <div className="w-72 h-[550px] bg-slate-950 border-[6px] border-slate-800 rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden">
              {/* Top Notch */}
              <div className="h-6 w-32 bg-slate-850 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
              
              {/* App UI */}
              <div className="flex-1 p-6 pt-12 flex flex-col items-center justify-between relative z-10">
                 <div className="w-full text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">EcommIT Pay App</p>
                    <h4 className="text-xs font-black text-white">Terminal MPoC NFC</h4>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center w-full gap-4">
                    <AnimatePresence mode="wait">
                       
                       {/* IDLE STATE */}
                       {step === "idle" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                           <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
                             <SmartphoneNfc size={32} className="text-slate-500" />
                           </div>
                           <div className="space-y-1">
                             <p className="text-lg font-black text-white">R$ {amount.toFixed(2)}</p>
                             <p className="text-[10px] text-slate-500">Pronto para iniciar transação</p>
                           </div>
                           <button 
                             onClick={startAttestation}
                             className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all uppercase tracking-wider"
                           >
                             Cobrar via Cartão
                           </button>
                        </motion.div>
                       )}

                       {/* ATTESTATION STATE */}
                       {step === "attestation" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-center">
                           <div className="relative">
                             <RefreshCcw size={40} className="text-blue-400 animate-spin" />
                           </div>
                           <p className="text-[10px] text-blue-400 font-bold uppercase animate-pulse">Atestando Dispositivo...</p>
                           <div className="w-full space-y-2 px-4">
                              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.8 }} className="h-full bg-blue-500" />
                              </div>
                              <p className="text-[8px] text-slate-500">Verificando segurança do kernel OS...</p>
                           </div>
                        </motion.div>
                       )}

                       {/* KEY EXCHANGE STATE */}
                       {step === "keyExchange" && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          className="flex flex-col items-center gap-4 text-center"
                          onAnimationComplete={handleKeyExchange}
                        >
                           <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                             <Key size={24} className="animate-pulse" />
                           </div>
                           <p className="text-[10px] text-yellow-400 font-bold uppercase">Ativando Chaves Criptográficas...</p>
                           <p className="text-[8px] text-slate-500 max-w-[180px]">Gerando par de chaves ECDH efêmeras para sessão adquirente.</p>
                        </motion.div>
                       )}

                       {/* TAP STATE */}
                       {step === "tap" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 w-full">
                           <div className="relative mx-auto w-24 h-24">
                              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
                              <div className="relative z-10 w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center text-blue-400">
                                 <Wifi size={36} className="rotate-90" />
                              </div>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 mb-2">Aproxime o cartão na traseira do celular</p>
                             <p className="text-[10px] font-bold text-slate-500">R$ {amount.toFixed(2)}</p>
                             <button 
                               onClick={handleTap}
                               className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500"
                             >
                               Simular Aproximação
                             </button>
                           </div>
                        </motion.div>
                       )}

                       {/* PIN ON GLASS STATE (MPOC RANDOMISED KEYPAD) */}
                       {step === "pin" && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full space-y-4">
                           <div className="text-center">
                             <p className="text-[9px] text-slate-500 uppercase tracking-widest">Insira sua senha</p>
                             
                             {/* Visual Masked PIN Bullets */}
                             <div className="flex justify-center gap-2 mt-2">
                               {[0, 1, 2, 3].map((idx) => (
                                 <div 
                                   key={idx} 
                                   className={`w-3 h-3 rounded-full border transition-all ${
                                     pinDigits.length > idx 
                                       ? "bg-blue-400 border-blue-400" 
                                       : "bg-slate-900 border-slate-800"
                                   }`} 
                                 />
                               ))}
                             </div>
                           </div>

                           {/* Random PIN Pad (PCI MPOC compliant) */}
                           <div className="grid grid-cols-3 gap-2 px-6">
                             {pinPadLayout.map((num) => (
                               <button
                                 key={num}
                                 onClick={() => pressPinDigit(num)}
                                 className="h-10 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-sm font-bold text-white font-mono active:scale-95 transition-transform"
                               >
                                 {num}
                               </button>
                             ))}
                             <button 
                               onClick={clearPin}
                               className="col-span-3 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider font-mono text-center"
                             >
                               Limpar Teclado
                             </button>
                           </div>
                           <p className="text-[8px] text-yellow-500/80 text-center leading-relaxed px-4">
                             *Teclado randomizado dinamicamente para impedir leitura de coordenadas na tela.
                           </p>
                        </motion.div>
                       )}

                       {/* AUTHORIZING STATE */}
                       {step === "authorizing" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-center">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                             <Database size={20} className="animate-pulse" />
                           </div>
                           <p className="text-[10px] text-blue-400 font-bold uppercase animate-pulse">Solicitando Autorização...</p>
                           <p className="text-[8px] text-slate-500">Enviando ARQC criptografado + PIN criptografado ao emissor.</p>
                        </motion.div>
                       )}

                       {/* SUCCESS STATE */}
                       {step === "success" && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
                           <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                             <CheckCircle2 size={32} className="text-emerald-500" />
                           </div>
                           <div>
                             <p className="text-lg font-black text-white">R$ {amount.toFixed(2)}</p>
                             <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Aprovado via MPoC</p>
                           </div>
                           <button 
                             onClick={resetSimulator}
                             className="px-4 py-2 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg"
                           >
                             Nova Transação
                           </button>
                        </motion.div>
                       )}

                    </AnimatePresence>
                 </div>

                 {/* Botão de Home (Visual) */}
                 <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto" />
              </div>
           </div>
        </div>

        {/* Detalhes Técnicos & Logs em tempo real */}
        <div className="lg:col-span-6 space-y-6">
           
           {/* Terminal L3 & Crypto Log */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="text-blue-400" size={18} />
                  <h4 className="text-white font-bold text-sm">Crypto & Security Live Console</h4>
                </div>
                <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400">
                  Logs do Kernel L2/L3
                </span>
              </div>

              <div className="h-44 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[9px] text-emerald-500 overflow-y-auto space-y-1.5 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">Console ocioso. Inicie a transação no simulador para capturar os logs criptográficos.</p>
                ) : (
                  logs.map((log, i) => <p key={i} className="leading-normal">{log}</p>)
                )}
              </div>
           </div>

           {/* Caixa informativa MPoC vs CPoC */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 space-y-6">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Info className="text-blue-400" size={16} />
                Diferença PCI MPoC vs CPoC (Ground Truth)
              </h4>
              <div className="space-y-4">
                {softposData.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-900">
                     <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 shrink-0">
                        {item.id === "mpoc" ? <Lock size={16} /> : <Layers size={16} />}
                     </div>
                     <div>
                       <h5 className="text-xs font-bold text-white mb-0.5">{item.name}</h5>
                       <p className="text-[10px] text-slate-500 leading-relaxed mb-1">{item.description}</p>
                       {item.checks && (
                         <div className="flex flex-wrap gap-1.5 mt-1.5">
                           {item.checks.map(c => <span key={c} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">{c}</span>)}
                         </div>
                       )}
                       {item.standard && <span className="text-[8px] text-blue-400/90 font-mono mt-1 block">{item.standard}</span>}
                     </div>
                  </div>
                ))}
              </div>
           </div>

        </div>
      </section>

    </div>
  );
}
