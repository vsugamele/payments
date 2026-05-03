"use client";

import { useState } from "react";
import { List, Calculator } from "lucide-react";
import McbsCalculator from "@/components/mcbs/McbsCalculator";
import { motion, AnimatePresence } from "framer-motion";

export default function McbsTabs({ catalogContent }: { catalogContent: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<"catalogo" | "calculadora">("catalogo");

  return (
    <div className="space-y-8">
      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("catalogo")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "catalogo" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <List size={16} /> Catálogo de Fees
        </button>
        <button
          onClick={() => setActiveTab("calculadora")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "calculadora" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Calculator size={16} /> Calculadora de Fatura
        </button>
      </div>

      {/* Tabs Content */}
      <AnimatePresence mode="wait">
        {activeTab === "catalogo" && (
          <motion.div
            key="catalogo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {catalogContent}
          </motion.div>
        )}
        
        {activeTab === "calculadora" && (
          <motion.div
            key="calculadora"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <McbsCalculator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
