import MatchClient from "./MatchClient";
import { AlertOctagon } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "MATCH Pro Simulator — VS Payments",
  description: "Simulador da API do MATCH Pro da Mastercard para prevenção de integração de Merchants de alto risco.",
};

export default function MatchPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* ── Page title bar ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--code-bg)",
          padding: "1rem 1.5rem",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/compliance"
              className="flex items-center justify-center rounded-lg border border-border bg-input transition-colors hover:bg-muted"
              style={{ width: 32, height: 32 }}
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <AlertOctagon size={16} className="text-red-500" />
                <h1 className="text-sm font-semibold text-foreground">MATCH Pro Simulator</h1>
              </div>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Mastercard Alert to Control High-risk Merchants
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-4">
          <div className="mt-1 bg-orange-500/20 text-orange-500 p-2 rounded-lg">
            <AlertOctagon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-500 mb-1">Explore a fundo o significado dos Inquéritos (MATCH Reason Codes)</h4>
            <p className="text-xs text-orange-500/80 mb-3 max-w-3xl">
               O simulador abaixo emula a comunicação de API (HIT / NO MATCH). Se quiser aprofundar seu conhecimento sobre as restrições jurídicas e as multas envolvidas caso decida transacionar com um lojista listado (Identity Theft, Excessive Chargebacks, PCI Violations), consulte o Dossiê completo.
            </p>
            <Link href="/compliance/match/reasons" className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-md hover:bg-orange-600 transition-colors">
              Acessar Dossiê de Reason Codes (Deep Dive)
            </Link>
          </div>
        </div>
      </div>

      <MatchClient />
    </div>
  );
}
