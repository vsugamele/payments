import DisputeSimulatorClient from "./DisputeSimulatorClient";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, Gavel } from "lucide-react";

export const metadata = {
  title: "Simulador Forense de Disputas e Chargebacks | VS Payments",
  description: "Tribunal de disputas. Compare as evidências exigidas pelo manual Visa VDMG e Mastercard Chargeback Guide.",
};

export default function DisputesPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Risco & Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-500 flex items-center justify-center shrink-0">
              <Gavel size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Tribunal de Disputas & Chargebacks</h1>
                <RuleReference
                  manual="Visa VDMG & Mastercard Chargeback Guide"
                  ruleId="Dispute Lifecycle"
                  description="Os laudos da bandeira definindo quem assume a perda financeira (Liability Shift) e quais documentos (Compelling Evidence 3.0) vencem a lide."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed mt-2">
                As disputas (Chargebacks) representam o estágio final e litigioso do ciclo da transação. Neste Simulador Forense, o Adquirente ou Sub-adquirente pode verificar instantaneamente as regras de defesa estabelecidas diretamente pela Visa e Mastercard. Descubra como a documentação exigida (Compelling Evidence) varia drasticamente entre um Desacordo Comercial vs Fraude Amigável, visando salvar seu caixa da conta de Arbitragem (Mastercom ou VROL).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <section>
          <DisputeSimulatorClient />
        </section>
      </div>
    </div>
  );
}
