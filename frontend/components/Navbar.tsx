"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu, X, Sun, Moon, Briefcase, FileDown, Mail,
  ExternalLink, MessageCircle
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_LINKS = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#ecossistema", label: "Ecossistema" },
  { href: "/#experiencia", label: "Trajetória" },
  { href: "/#projetos", label: "Projetos" },
  { href: "/#solucoes", label: "Especialidades" },
  { href: "/#competencias", label: "Competências" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            VS
          </div>
          <div>
            <span className="text-sm font-black text-foreground tracking-tight block group-hover:text-blue-500 transition-colors">
              Vinícius Sugamele
            </span>
            <span className="text-[10px] text-muted-foreground font-medium block">
              Payments & Billing Specialist
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons & Theme */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/Curriculo_Vinicius_Sugamele.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
          >
            <FileDown size={13} className="text-blue-500" />
            <span>Currículo (PDF)</span>
          </a>

          <a
            href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all"
          >
            <MessageCircle size={13} />
            <span>WhatsApp</span>
          </a>

          <a
            href="mailto:vsugamele@gmail.com"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all"
          >
            <Mail size={13} />
            <span>Fale Comigo</span>
          </a>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Alternar tema"
          >
            <Sun size={15} className="hidden dark:block text-amber-400" />
            <Moon size={15} className="block dark:hidden text-slate-700" />
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sun size={15} className="hidden dark:block text-amber-400" />
            <Moon size={15} className="block dark:hidden text-slate-700" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-foreground py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            <a
              href="/Curriculo_Vinicius_Sugamele.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-muted text-foreground border border-border"
            >
              <FileDown size={14} className="text-blue-500" />
              <span>Baixar Currículo em PDF</span>
            </a>

            <a
              href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
            >
              <MessageCircle size={14} />
              <span>Falar no WhatsApp ((11) 97654-6714)</span>
            </a>

            <a
              href="mailto:vsugamele@gmail.com"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
            >
              <Mail size={14} />
              <span>Enviar E-mail</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
