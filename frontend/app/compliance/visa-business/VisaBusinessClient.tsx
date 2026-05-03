"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  Search, 
  ArrowRight, 
  Info,
  Layers,
  Zap,
  Cpu,
  Lock,
  Building2,
  Calculator as CalcIcon,
  FileText
} from "lucide-react";
import VisaCalculator from "@/components/visa/VisaCalculator";

export default function VisaBusinessClient() {
  const [searchBin, setSearchBin] = useState("401288");
  const [binResult, setBinResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const simulateVBASS = () => {
    setIsSearching(true);
    setTimeout(() => {
      setBinResult({
        bin: searchBin,
        brand: "Visa",
        type: "Credit",
        product: "Visa Commercial / Corporate",
        level: "L3 Data Required",
        country: "Brasil (BR)",
        issuer: "Banco do Brasil",
        interchangeTier: "Commercial B2B",
        attributes: [
          "Habilitado para B2B Connect",
          "Suporta Tokenização VTS",
          "Obrigatório Level 3 para Taxa Otima"
        ]
      });
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-12">
      {/* ── Hero / Intro ── */}
      <section className="relative p-10 rounded-[3rem] bg-gradient-to-br from-blue-900/20 via-[#0a1120] to-indigo-900/20 border border-blue-500/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -z-10" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            Visa Advanced Solutions
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-6">
            Visa Business & <span className="text-blue-400">Data Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Explorando as soluções além-cartão. Da rede transfronteiriça B2B Connect à inteligência forense do BIN Attribute Sharing, entenda como a Visa escala operações corporativas globais.
          </p>
        </div>
      </section>

      {/* ── Grid de Produtos B2B ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* B2B Connect */}
        <div className="group p-8 rounded-[2.5rem] bg-[#0a1120] border border-slate-800 hover:border-blue-500/40 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Visa B2B Connect</h3>
              <p className="text-xs text-slate-500">Rede Global Não-Cartão</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Uma arquitetura multilateral que permite pagamentos conta-a-conta diretos entre empresas. Ao contrário do Swift legacy, o B2B Connect usa uma rede privada para reduzir taxas e tempo de liquidação para D+0 ou D+1.
          </p>
          <div className="space-y-3">
            {[
              "Pagamentos transfronteiriços de alto valor",
              "Taxas fixas transparentes (sem bancos correspondentes)",
              "Segurança baseada em Identidade Digital"
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-xs text-slate-300">
                <Zap size={14} className="text-blue-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Commercial & Level 3 Data */}
        <div className="group p-8 rounded-[2.5rem] bg-[#0a1120] border border-slate-800 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Commercial Solutions</h3>
              <p className="text-xs text-slate-500">Level 2 & Level 3 Data</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Para cartões corporativos (Purchasing/Fleet), o intercâmbio é otimizado se o lojista enviar dados detalhados da compra. Sem esses dados, o custo para o adquirente sobe drasticamente.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Level 2</p>
              <p className="text-[10px] text-slate-500 leading-tight">Imposto sobre vendas, Código de referência.</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Level 3</p>
              <p className="text-[10px] text-slate-500 leading-tight">Descrição do item, Qtd, Preço unitário.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Simulador VBASS ── */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Visa BIN Attribute Sharing (VBASS)</h2>
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">
              A Inteligência Forense por trás do BIN
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O VBASS permite que lojistas e adquirentes consultem a "identidade real" de um cartão em milissegundos. Isso é vital para aplicar o intercâmbio correto e oferecer fluxos de pagamento dinâmicos.
            </p>
            
            <div className="flex gap-3 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  value={searchBin}
                  onChange={(e) => setSearchBin(e.target.value)}
                  placeholder="Digite os 6 ou 8 primeiros dígitos..."
                  className="w-full bg-[#05080f] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <button 
                onClick={simulateVBASS}
                disabled={isSearching}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
              >
                {isSearching ? "Consultando..." : "Consultar VBASS"}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {binResult ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0a1120] border border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={120} className="text-emerald-500" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tipo de Cartão</p>
                      <h4 className="text-xl font-black text-white">{binResult.product}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Intercâmbio</p>
                      <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                        {binResult.interchangeTier}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Emissor</p>
                      <p className="text-sm text-slate-300 font-medium">{binResult.issuer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">País</p>
                      <p className="text-sm text-slate-300 font-medium">{binResult.country}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Atributos VBASS Detectados</p>
                    <div className="flex flex-wrap gap-2">
                      {binResult.attributes.map((attr: string) => (
                        <span key={attr} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[300px] border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <Cpu size={48} className="opacity-10" />
                  <p className="text-sm text-center max-w-[200px]">Simule uma consulta de inteligência de BIN</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── DAF: Digital Authentication Framework ── */}
      <section className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-900/10 via-[#0a1120] to-purple-900/10 border border-purple-500/10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Lock size={32} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              Next-Gen Auth
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Digital Authentication Framework (DAF)</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              O DAF é a evolução do 3DS para dispositivos confiáveis. Ao contrário do 3DS tradicional que pode exigir uma senha, o DAF utiliza biometria e chaves seguras do próprio dispositivo para autenticar o portador sem fricção, garantindo 100% de liability shift para o lojista.
            </p>
          </div>
        </div>
      </section>

      {/* ── Visa Billing Simulator (Baseado na Planilha) ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400">
              <FileText size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Visa Invoice Mapping</h2>
            </div>
            <h3 className="text-2xl font-black text-white">Simulador de Faturamento (VSS)</h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Data Source: Visa Fee Schedule BRAZIL 2026
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl mb-4">
          Utilizando as <strong>Billing Lines</strong> mapeadas da planilha oficial (5B1106453, 5B1107045, etc.), este simulador projeta o impacto financeiro mensal de uma operação de adquirência Visa no Brasil.
        </p>
        <VisaCalculator />
      </section>

      {/* ── Footer / CTA ── */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[2.5rem] bg-blue-600">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl font-black text-white tracking-tight">Pronto para aprofundar?</h3>
          <p className="text-blue-100 text-sm">Explore os manuais completos da Visa Business na nossa biblioteca.</p>
        </div>
        <button className="px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all flex items-center gap-2">
          Acessar Acervo Técnico <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
