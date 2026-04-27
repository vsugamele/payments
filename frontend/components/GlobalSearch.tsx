"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight, BookOpen, ShieldAlert, Zap, Box, Tag, Key } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import manuaisData from "@/data/manuais.json";

type SearchResultItem = {
  id: string;
  type: "tool" | "manual" | "field" | "program";
  icon: any;
  title: string;
  subtitle: string;
  href: string;
  labels: string[];
};

// "Cérebro" de busca rápida: Indexando as ferramentas e dados chave do sistema
const SEARCH_INDEX: SearchResultItem[] = [
  {
    id: "tool-retentativas",
    type: "tool",
    icon: ShieldAlert,
    title: "Matriz de Retentativas e Response Codes",
    subtitle: "Hard vs Soft Declines (RC 51, RC 05)",
    href: "/compliance/retentativas",
    labels: ["Retry", "Multa", "Hard Decline", "Soft Decline", "RC", "Motivo Negada", "Declines"],
  },
  {
    id: "tool-bram",
    type: "tool",
    icon: ShieldAlert, // O GlobalSearch component does not import Crosshair usually, will reuse ShieldAlert which is available
    title: "Auditor BRAM e QMAP (Apostas, Alta Risco)",
    subtitle: "Risco Legal, Drogas, Adulto",
    href: "/compliance/bram",
    labels: ["BRAM", "QMAP", "Aposta", "Bet", "Cassino", "Gambling", "Pharma", "Multa 100k", "Ilegal"],
  },
  {
    id: "tool-quasicash",
    type: "tool",
    icon: ShieldAlert,
    title: "Cripto & Quasi-cash (Funding)",
    subtitle: "AFT e OCT Arquitetura",
    href: "/compliance/quasicash",
    labels: ["AFT", "OCT", "Cripto", "Crypto", "Bitcoin", "Wallet", "6012", "6051", "6540"],
  },
  {
    id: "tool-3ds",
    type: "tool",
    icon: ShieldAlert,
    title: "Matriz 3DS & ECI",
    subtitle: "Simulador de Liability Shift e Frictionless",
    href: "/compliance/3ds",
    labels: ["Fraude", "E-commerce", "RC 4837", "ECI 05"],
  },
  {
    id: "tool-pci",
    type: "tool",
    icon: Key,
    title: "Calculadora de Escopo PCI DSS",
    subtitle: "Requisitos SAQ A, SAQ D para integrações",
    href: "/compliance/pci",
    labels: ["Segurança", "SAQ", "iFrame", "Tokens"],
  },
  {
    id: "tool-emv",
    type: "tool",
    icon: Zap,
    title: "Decodificador EMV (TVR)",
    subtitle: "Leitura de Tag 95 bit a bit",
    href: "/compliance/emv",
    labels: ["Terminal", "POS", "Tag 95", "Falha Pin"],
  },
  {
    id: "tool-settlement",
    type: "tool",
    icon: Box,
    title: "Timeline de Settlement & Clearing",
    subtitle: "Arquivos IPM, TC46 e D+x",
    href: "/compliance/settlement",
    labels: ["Liquidação", "IPM", "SPB", "D+1"],
  },
  {
    id: "tool-disputas",
    type: "tool",
    icon: ShieldAlert,
    title: "Simulador Forense de Disputas DMAS / VROL",
    subtitle: "Mapas de Representment, Arbitration e CE 3.0",
    href: "/compliance/disputas",
    labels: ["Chargeback", "Fraud", "Mastercom", "RC", "CE 3.0", "VDMG", "4837", "4853", "Forense", "Disputa"],
  },
  {
    id: "tool-risco",
    type: "tool",
    icon: ShieldAlert,
    title: "Programas de Risco (VAMP / ECP)",
    subtitle: "Listagem de Thresholds e Multas",
    href: "/compliance/programas",
    labels: ["VAMP", "ECP", "BRAM", "Fraude", "Chargeback"],
  },
  {
    id: "tool-campos",
    type: "tool",
    icon: Tag,
    title: "Lookup de Campos ISO 8583",
    subtitle: "Dicionário de DEs e PDS Master",
    href: "/compliance/campos",
    labels: ["ISO", "DE", "PDS", "MTI"],
  },
  {
    id: "tool-mcc",
    type: "tool",
    icon: Tag,
    title: "Tabela MCC (Merchant Category Code)",
    subtitle: "Lookup rápido de MCCs Categoria",
    href: "/compliance/mcc",
    labels: ["MCC", "Merchant", "TCC", "Alto Risco"],
  },
  {
    id: "tool-intercambio",
    type: "tool",
    icon: Zap,
    title: "Simulador de Intercâmbio",
    subtitle: "Cálculo de interchange fees SDK/Visa",
    href: "/simulador",
    labels: ["Tarifas", "Custo", "MDR", "Clearing"],
  },
];

export default function GlobalSearch({ isExposed = false }: { isExposed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults: SearchResultItem[] = query.length < 2 ? [] : [
    ...SEARCH_INDEX.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.labels.some(l => l.toLowerCase().includes(query.toLowerCase()))
    ),
    ...(manuaisData as any[]).filter(m => 
      m.titulo.toLowerCase().includes(query.toLowerCase()) || 
      m.bandeira.toLowerCase().includes(query.toLowerCase())
    ).map(m => ({
      id: `manual-${m.id}`,
      type: "manual" as const,
      icon: BookOpen,
      title: m.titulo,
      subtitle: `Manual Oficial ${m.bandeira}`,
      href: `/acervo#${m.id}`,
      labels: ["Manual", "PDF"],
    }))
  ];

  if (isExposed) {
    return (
      <div className="relative w-full">
        <div className="flex items-center w-full px-4 py-3 bg-code-bg border border-border rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search size={18} className="text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder="Pesquisar ferramentas, regras, ISO..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
          />
        </div>
        
        {query.length >= 2 && (
          <div className="absolute top-14 left-0 w-full bg-[#0a0f1c] border border-border rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Nenhum resultado encontrado.</div>
            ) : (
              <ul className="py-2">
                {searchResults.map((res) => {
                  const Icon = res.icon;
                  return (
                    <li key={res.id}>
                      <Link href={res.href} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group">
                        <div className="p-2 bg-background border border-border rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">{res.title}</p>
                          <p className="text-xs text-muted-foreground">{res.subtitle}</p>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Botão Navbar */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center justify-between w-64 px-3 py-1.5 bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-lg text-sm text-muted-foreground transition-all"
      >
        <span className="flex items-center gap-2">
          <Search size={14} /> Pesquisar ferramentas...
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono border border-border/60 px-1.5 py-0.5 rounded bg-background">
          <Command size={10} /> K
        </span>
      </button>

      {/* Modal / Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Search Box */}
          <div className="relative w-full max-w-2xl bg-[#0a0f1c] border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-4 border-b border-border">
              <Search size={20} className="text-muted-foreground mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Busque por Regras, Simuladores, MCC, ISO..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground bg-muted/50 px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.length === 0 ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mb-4">
                    <Command size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Busca Global do Sistema</h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Pesquise por ferramentas (Ex: "Simulador de Intercâmbio"), regulamentações ("PCI", "3DS") ou referências técnicas ("RC 4837", "Tag 95").
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado para "{query}"
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchResults.map((res) => {
                    const Icon = res.icon;
                    return (
                      <li key={res.id}>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            router.push(res.href);
                          }}
                          className="w-full flex items-start gap-3 px-3 py-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors group text-left"
                        >
                          <div className="p-2 bg-background border border-border rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
                            <Icon size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">{res.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">{res.subtitle}</p>
                              <span className="text-[10px] uppercase text-muted-foreground/70 tracking-wider hidden sm:block">• {res.type}</span>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-muted/10 border-t border-border px-4 py-2.5 flex items-center justify-between">
               <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                 <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">↑↓</kbd> Navegar</span>
                 <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">Enter</kbd> Selecionar</span>
               </div>
               <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">VS Payments Omni-Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
