import { BookOpen, Database, RefreshCw, CheckCircle2, Clock, FileText, AlertTriangle } from "lucide-react";

const INDEXED_MANUALS = [
  { id: "vcr", name: "Visa Core Rules (VCR)", date: "2024-05-01", pages: 1250, status: "indexed" },
  { id: "vdmg", name: "Visa Dispute Management Guide", date: "2024-05-01", pages: 845, status: "indexed" },
  { id: "mc_rules", name: "Mastercard Rules", date: "2024-05-02", pages: 412, status: "indexed" },
  { id: "mc_chargeback", name: "Mastercard Chargeback Guide", date: "2024-05-02", pages: 380, status: "indexed" },
  { id: "pci_v4", name: "PCI DSS v4.0", date: "2024-04-15", pages: 356, status: "indexed" },
  { id: "bacen", name: "Resoluções BACEN (Intercâmbio)", date: "2024-04-10", pages: 45, status: "indexed" },
  { id: "elo", name: "Regulamento Elo", date: "2024-03-20", pages: 120, status: "outdated" }
];

export default function RagStatusPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-12 pb-24 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Database className="text-blue-500" size={32} /> 
          Status do Conhecimento (RAG)
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Painel de controle para a base vetorial do Cérebro Normativo. Acompanhe quais manuais e documentações já foram processados pela IA.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest relative z-10">
            <BookOpen size={14} className="text-blue-500" /> Total de Manuais
          </div>
          <div className="text-4xl font-black text-white relative z-10">
            {INDEXED_MANUALS.length}
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest relative z-10">
            <FileText size={14} className="text-emerald-500" /> Páginas Vetorizadas
          </div>
          <div className="text-4xl font-black text-white relative z-10">
            {INDEXED_MANUALS.reduce((acc, curr) => acc + curr.pages, 0).toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
             Ações
          </div>
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm">
            <RefreshCw size={16} /> Sincronizar Base
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Database size={16} className="text-slate-500" /> Repositório Supabase (pgvector)
          </h2>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
            Conectado
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Páginas</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Última Sincronização</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {INDEXED_MANUALS.map((doc, idx) => (
                <tr key={doc.id} className={`border-b border-slate-800/50 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-slate-400" />
                      </div>
                      <span className="font-bold text-white text-sm">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                    {doc.pages}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={12} /> {doc.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.status === "indexed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Indexado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle size={12} /> Desatualizado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
