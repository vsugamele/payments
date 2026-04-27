import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import MccClient from "./MccClient";
import mccData from "@/data/mcc-list.json";

export const metadata = {
  title: "Tabela de MCCs — Compliance VS Payments",
  description: "Pesquise os 1.300+ Merchant Category Codes (MCCs) da Mastercard. Nome, categoria, TCC e impacto no intercâmbio.",
};

export default function MccPage() {
  return (
    <main className="bg-background pb-24">
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/compliance"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}
          >
            <ArrowLeft size={13} /> Compliance
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div
              style={{
                width: 44, height: 44,
                borderRadius: "0.75rem",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Tag size={20} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-2">Referência Técnica</p>
              <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                Tabela de MCCs — Merchant Category Codes
              </h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {mccData.length.toLocaleString("pt-BR")} códigos com nome, categoria e TCC.
                Fonte: Mastercard MCC Listing — Novembro 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MccClient />
    </main>
  );
}
