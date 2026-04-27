import BRAMClient from "./BRAMClient";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, Crosshair } from "lucide-react";

export const metadata = {
  title: "Auditor BRAM, QMAP e Alto Risco | VS Payments",
  description: "Verifique as regras de compliance e multas de US$ 100 mil da Mastercard e Visa para indústrias restritas como Farmácias, Apostas e Tabaco.",
};

export default function BRAMPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Risco & Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 text-red-500 flex items-center justify-center shrink-0">
              <Crosshair size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">BRAM & Registro de Alto Risco (QMAP)</h1>
                <RuleReference
                  manual="Mastercard Security Rules / Visa GBPP"
                  ruleId="BRAM Program"
                  description="Comerciantes atuando em violação às leis aplicáveis ou que geram danos graves à imagem da Bandeira enfrentam encerramento e Assessments de até $100.000 mensais."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed mt-2">
                Credenciar lojistas exige extrema responsabilidade fiduciária. Ferramentas que vendem bens ilegais, pornografia ou medicamentos restritos disparam o severo <strong>Business Risk Assessment and Mitigation (BRAM)</strong>. Use o auditor abaixo para verificar se o negócio-alvo é Proibido (Match obrigatório) ou Regrado (Exige taxa de $500 anuais e auditorias perante a Bandeira).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <section>
          <BRAMClient />
        </section>
      </div>
    </div>
  );
}
