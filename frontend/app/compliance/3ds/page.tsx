import ThreeDSMatrixClient from "./ThreeDSMatrixClient";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Matriz 3DS Liability Shift & ECI | VS Payments",
  description: "Descubra qual o valor ECI retornado pelo fluxo 3-D Secure (Frictionless, Challenge, Attempts) e entenda quando o Liability Shift é ativado a favor do Lojista.",
};

export default function ThreeDSPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Matriz 3DS & Liability Shift</h1>
                <RuleReference
                  manual="EMVCo 3DS"
                  ruleId="Liability Shift Matrix"
                  description="Regras de inversão do ônus de fraude de CNP da Bandeira. O lojista passa a não ser mais responsável pela contestação."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                O protocolo <strong>3-D Secure (3DS)</strong> não serve apenas para pedir um OTP ao cliente. Ele é um acordo de proteção legal contido na ISO 8583. 
                Sempre que uma transação passar por ele, a rede devolve um <TermTooltip term="ECI" definition="Electronic Commerce Indicator. Informação traficada no DE 48 (Master) ou DE 60 (Visa)." /> e um <code>CAVV</code> / <code>AAV</code> provando que ocorreu uma tentativa. Use a matriz abaixo para descobrir quando o risco de Fraude <strong>sai</strong> das suas costas e vai para o banco (Liability Shift).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-6">Simulador de ECI e Risco</h2>
          <ThreeDSMatrixClient />
        </section>

        {/* Informações Extras de Integração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-code-bg border border-border p-6 rounded-2xl">
            <h3 className="font-bold text-foreground text-sm mb-3">Na ISO 8583: Como Trafegar o ECI</h3>
            <div className="space-y-4">
               <div>
                  <span className="text-xs font-bold text-blue-400">VISA (DE 60.8)</span>
                  <p className="text-xs text-muted-foreground mt-1">O ECI deve ser enviado na posição 8 do DE 60, junto ao CAVV que é trafegado independente em tag própria (Tag 0X).</p>
               </div>
               <div>
                  <span className="text-xs font-bold text-red-400">MASTERCARD (DE 48.42 - UCAF)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mastercard exige os dados dentro do UCAF (Universal Cardholder Authentication Field). 
                    O ECI (02, 01, ou 00) vai no início ou no fim dependendo da versão do UCAF, mas o DE 48 <em>deve</em> carregar a string Base64 do AAV.
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-code-bg border border-border p-6 rounded-2xl flex flex-col justify-center gap-4">
             <h3 className="font-bold text-foreground text-sm">Onde entra a Tokenização Cloud?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Com o <strong>Apple Pay</strong> e Carteiras Digitais via Network Tokens, o 3-D Secure não é sequer invocado. 
               A Bandeira automaticamente aplica o Liability Shift (como se fosse ECI 05) devido à prova de <em>Device Biometrics</em> (FaceID).
             </p>
             <Link href="/compliance/tokenizacao" className="text-xs text-emerald-400 flex items-center gap-1.5 hover:text-emerald-300 transition-colors w-fit">
               Ver Playbook de DAF & Tokenização <ArrowRight size={13} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
