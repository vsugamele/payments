"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { reloadTables } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

interface Props {
  health: HealthResponse | null;
  onReload: (h: HealthResponse) => void;
}

export function ReloadButton({ health, onReload }: Props) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleReload() {
    setLoading(true);
    setMsg("");
    try {
      const h = await reloadTables();
      onReload(h);
      setMsg("Tabelas recarregadas!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e: unknown) {
      setMsg("Erro ao recarregar");
    } finally {
      setLoading(false);
    }
  }

  const loadedAt = health?.loaded_at
    ? new Date(health.loaded_at * 1000).toLocaleTimeString("pt-BR")
    : null;

  return (
    <div className="flex items-center gap-3">
      {health && (
        <span className="text-xs text-slate-400">
          MC:{health.regras_mastercard} · Visa:{health.regras_visa} · Maestro:{health.regras_maestro}
          {loadedAt && <> · carregado às {loadedAt}</>}
        </span>
      )}
      {msg && (
        <span className="text-xs text-emerald-400 font-medium">{msg}</span>
      )}
      <button
        onClick={handleReload}
        disabled={loading}
        title="Recarregar tabelas Excel"
        className="flex items-center gap-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50
                   px-3 py-1.5 text-xs font-medium text-white transition-colors"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? "Recarregando…" : "Recarregar tabelas"}
      </button>
    </div>
  );
}
