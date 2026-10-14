"use client";

import Link from "next/link";
import { ExternalLink, Mail, MapPin, FileDown, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#030711] text-slate-400 mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
                VS
              </div>
              <span className="text-sm font-black text-white">Vinícius Sugamele</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Head de Bandeiras & Payments Specialist com mais de 16 anos de experiência em ecossistemas de cartões, governança de adquirência, arquitetura de autorização e gestão estratégica de pagamentos.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all"
                title="WhatsApp ((11) 97654-6714)"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                title="LinkedIn"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href="mailto:vsugamele@gmail.com"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                title="Email"
              >
                <Mail size={14} />
              </a>
              <a
                href="/Curriculo_Vinicius_Sugamele.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                title="Baixar Currículo PDF"
              >
                <FileDown size={14} />
              </a>
            </div>
          </div>

          {/* Navegação Rápida */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navegação</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#sobre" className="hover:text-white transition-colors">
                  Sobre & Visão
                </Link>
              </li>
              <li>
                <Link href="/#ecossistema" className="hover:text-white transition-colors">
                  Ecossistema & Parceiros
                </Link>
              </li>
              <li>
                <Link href="/#experiencia" className="hover:text-white transition-colors">
                  Trajetória Profissional
                </Link>
              </li>
              <li>
                <Link href="/#projetos" className="hover:text-white transition-colors">
                  Projetos Estratégicos
                </Link>
              </li>
              <li>
                <Link href="/#solucoes" className="hover:text-white transition-colors">
                  Soluções & Especialidades
                </Link>
              </li>
              <li>
                <Link href="/#competencias" className="hover:text-white transition-colors">
                  Competências
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato Direto */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contato Direto</p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
              >
                (11) 97654-6714 (WhatsApp)
              </a>
              <a
                href="mailto:vsugamele@gmail.com"
                className="block text-slate-300 hover:text-blue-400 transition-colors font-medium"
              >
                vsugamele@gmail.com
              </a>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin size={12} className="text-blue-400 shrink-0" />
                <span>São Paulo, SP · Brasil</span>
              </div>
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors pt-1"
              >
                <span>Conectar no LinkedIn</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} Vinícius Sugamele. Todos os direitos reservados.
            <span className="mx-2 text-slate-700">·</span>
            <Link href="/admin" className="text-slate-700 hover:text-slate-400 transition-colors" title="Área do Proprietário">
              Acesso Restrito
            </Link>
          </p>
          <p>São Paulo, Brasil · Payments & Billing Specialist</p>
        </div>
      </div>
    </footer>
  );
}
