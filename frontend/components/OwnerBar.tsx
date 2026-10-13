"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, LayoutDashboard, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export function OwnerBar() {
  const [isOwner, setIsOwner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkCookie = () => {
      const hasCookie = typeof document !== "undefined" && 
        document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
      setIsOwner(hasCookie);
    };
    checkCookie();
  }, [pathname]);

  if (!isOwner || pathname === "/admin") return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md shadow-xl text-xs text-white">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-[11px] text-emerald-300 font-mono">
          Proprietário
        </span>
        <Link
          href="/admin"
          className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
        >
          <LayoutDashboard size={11} />
          <span>Cockpit</span>
        </Link>
        <button
          onClick={() => {
            document.cookie = "vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/?logout=1";
          }}
          className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
          title="Bloquear e voltar ao modo público"
        >
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}
