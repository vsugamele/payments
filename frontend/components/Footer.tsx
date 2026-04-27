import Link from "next/link";
import { Activity, ExternalLink, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "#030711",
        marginTop: "6rem",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 32,
                  width: 32,
                  borderRadius: "0.5rem",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                }}
              >
                <Activity size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-white">VS Payments</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)", maxWidth: 260 }}>
              Especialista em meios de pagamento com mais de 16 anos de experiência em bandeiras,
              adquirentes e emissores.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 36,
                  width: 36,
                  borderRadius: "0.5rem",
                  border: "1px solid #1e293b",
                  background: "#0d1117",
                  color: "var(--muted-foreground)",
                  transition: "all 0.2s",
                }}
              >
                <ExternalLink size={15} />
              </a>
              <a
                href="mailto:vsugamele@gmail.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 36,
                  width: 36,
                  borderRadius: "0.5rem",
                  border: "1px solid #1e293b",
                  background: "#0d1117",
                  color: "var(--muted-foreground)",
                  transition: "all 0.2s",
                }}
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <p className="section-eyebrow">Navegação</p>
            <div className="space-y-2">
              {[
                { href: "/simulador", label: "Simulador de Intercâmbio" },
                { href: "/solucoes",  label: "Soluções"                 },
                { href: "/artigos",   label: "Artigos"                  },
                { href: "/sobre",     label: "Sobre"                    },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ display: "block", fontSize: "0.875rem", color: "var(--muted-foreground)", transition: "color 0.15s" }}
                  className="hover:text-slate-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="section-eyebrow">Contato</p>
            <div className="space-y-3">
              <a
                href="mailto:vsugamele@gmail.com"
                style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", display: "block" }}
                className="hover:text-slate-200 transition-colors"
              >
                vsugamele@gmail.com
              </a>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>São Paulo, Brasil</p>
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.875rem", color: "var(--primary)", display: "block" }}
                className="hover:text-blue-400 transition-colors"
              >
                linkedin.com/in/vinicius-sugamele
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--border)" }}>
            &copy; {new Date().getFullYear()} Vinícius Sugamele. Todos os direitos reservados.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--border)" }}>
            Visa · Mastercard · Elo · American Express
          </p>
        </div>
      </div>
    </footer>
  );
}
