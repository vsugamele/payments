"use client";

import Link from "next/link";
import { ExternalLink, Mail, FileDown, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background text-muted-foreground mt-16">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Assinatura */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block text-sm tracking-tight text-foreground">
              <span className="font-semibold">vinícius</span>
              <span className="font-normal text-muted-foreground"> sugamele</span>
            </Link>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-sm">
              Notícias comentadas, regras de bandeira e bastidores de meios de pagamento — escritos
              a partir de mais de 16 anos em EcommIT, Bandeira Elo, Getnet e Verifone / American
              Express.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-full border border-border bg-card hover:border-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20site%20e%20gostaria%20de%20conversar."
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-full border border-border bg-card hover:border-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
                title="WhatsApp ((11) 97654-6714)"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href="mailto:vsugamele@gmail.com"
                className="size-8 rounded-full border border-border bg-card hover:border-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                aria-label="E-mail"
                title="vsugamele@gmail.com"
              >
                <Mail size={14} />
              </a>
              <a
                href="/Curriculo_Vinicius_Sugamele.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-full border border-border bg-card hover:border-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                aria-label="Currículo em PDF"
                title="Baixar Currículo PDF"
              >
                <FileDown size={14} />
              </a>
            </div>
          </div>

          {/* Leitura */}
          <div className="space-y-3">
            <p className="section-eyebrow">Leitura</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Página inicial
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-foreground transition-colors">
                  Notícias e notas
                </Link>
              </li>
              <li>
                <Link href="/artigos" className="hover:text-foreground transition-colors">
                  Artigos técnicos
                </Link>
              </li>
              <li>
                <Link href="/consultas" className="hover:text-foreground transition-colors">
                  Consultas públicas
                </Link>
              </li>
              <li>
                <Link href="/jornada" className="hover:text-foreground transition-colors">
                  Laboratório (O Pagamento por Dentro)
                </Link>
              </li>
            </ul>
          </div>

          {/* Currículo & Contato */}
          <div className="space-y-3">
            <p className="section-eyebrow">Currículo</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curriculo" className="hover:text-foreground transition-colors">
                  Quem sou e trajetória
                </Link>
              </li>
              <li>
                <a
                  href="/Curriculo_Vinicius_Sugamele.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Baixar CV em PDF
                </a>
              </li>
              <li>
                <a
                  href="mailto:vsugamele@gmail.com"
                  className="hover:text-foreground transition-colors"
                >
                  vsugamele@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20site%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  (11) 97654-6714
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Vinícius Sugamele · Todos os direitos reservados
            <span className="mx-2 opacity-50">·</span>
            <Link
              href="/admin"
              className="hover:text-foreground transition-colors"
              title="Área interna do proprietário"
            >
              Área interna
            </Link>
          </p>
          <p>São Paulo, Brasil</p>
        </div>
      </div>
    </footer>
  );
}
