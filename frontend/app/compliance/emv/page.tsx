import EMVDecoderClient from "./EMVDecoderClient";
import Link from "next/link";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Decodificador EMV: TVR (Tag 95) | VS Payments",
  description:
    "Entenda a especificação EMV Book 3 (1. Ensinar) e decodifique os 5 bytes do Terminal Verification Results (TVR/Tag 95) bit a bit (2. Demonstrar).",
};

export default function EMVDecoderPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Chip EMV & Criptografia (DE 55)"
        normativeBadge="EMV Book 3 Annex C · Tag 95 (5 Bytes / 40 Bits)"
        title="Decodificador EMV — Terminal Verification Results (TVR Tag 95)"
        subtitle="Cole o valor hexadecimal de 10 dígitos do TVR (Tag 95 dentro do DE 55) para inspecionar bit a bit quais verificações offline (ODA), CVM e regras de risco dispararam no terminal."
        teachConcept="Durante uma compra com chip ou aproximação NFC, o kernel EMV do terminal executa dezenas de checagens de segurança (autenticação offline SDA/DDA/CDA, validade do aplicativo, limite de tentativas de PIN e floor limit) e grava o relatório em 5 bytes (40 bits) na Tag 95 (TVR)."
        teachRule="EMV Integrated Circuit Card Specifications for Payment Systems — Book 3 (Application Specification, Annex C): cada bit igual a 1 sinaliza uma exceção ou condição verificada que compõe o cálculo do criptograma ARQC (Tag 9F26)."
        teachPitfall="Alterar qualquer bit da Tag 95 no switch da adquirente antes de encaminhar o DE 55 ao banco emissor invalida a assinatura criptográfica do ARQC e provoca recusa imediata pelo HSM do emissor."
        demoSteps={[
          "1. No Decodificador abaixo, digite 10 caracteres hexadecimais (ex: 0000048000) ou clique em um dos cenários prontos de produção.",
          "2. Inspecione os 5 Bytes (40 bits) na matriz visual para ver quais flags estão ativos (Bit = 1) e sua severidade.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar o DE 55 e as tags EMV obrigatórias no clearing.",
        ]}
        acervoQuery="EMV Book 3 TVR Tag 95 DE 55 ARQC Tag 9F26 ODA CVM PIN Try Limit"
        lab3dHref="/jornada?track=cartao"
        lab3dLabel="Ver Fluxo EMV & HSM no Lab 3D"
      />

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-10">
        {/* 1. DEMONSTRAR IMEDIATO: Decodificador Interativo */}
        <section>
          <EMVDecoderClient />
        </section>

        {/* 2. ENSINAR LADO A LADO: 3 Caixinhas de Contexto EMV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Lock,
              color: "#2563eb",
              title: "1. Onde encontrar o TVR (Tag 95)",
              desc: "Na mensagem ISO 8583, dentro do DE 55 (ICC Data em formato TLV). Procure pela tag '95' seguida do comprimento '05' e dos 10 caracteres hexadecimais.",
            },
            {
              icon: AlertTriangle,
              color: "#d97706",
              title: "2. Como ler os 40 Bits",
              desc: "Bit 0 = verificação normal; Bit 1 = condição acionada ou falha (ex: SDA failed, Expired Application, PIN Try Limit Exceeded). TVR 0000000000 indica zero alertas.",
            },
            {
              icon: Info,
              color: "#7c3aed",
              title: "3. Impacto no Emissor (ARQC)",
              desc: "O TVR entra no cálculo do criptograma ARQC (Tag 9F26). Flags críticos de ODA ou PIN costumam acionar Response Code 05 (Do Not Honor) ou 75 (PIN Tries Exceeded).",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="p-5 rounded-2xl border border-border bg-card space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} style={{ color: card.color }} />
                  <h3 className="font-semibold text-sm text-foreground">{card.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* 3. Próximos passos lado a lado */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="font-semibold text-foreground">
            Guia Rápido de Diagnóstico pós-TVR (Recusa vs Aprovação com Flags)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-2 rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground text-sm">
                Se o emissor recusou (RC 05 / 04 / 75):
              </p>
              <ul className="space-y-1.5 leading-relaxed">
                <li>▸ Confirme quais bits do TVR estão em 1 para isolar a causa raiz da negativa.</li>
                <li>▸ Se <strong>SDA/DDA/CDA failed</strong>: falha na autenticação offline do chip.</li>
                <li>
                  ▸ Se <strong>PIN Try Limit exceeded</strong>: contador de senha do chip bloqueado;
                  exige script de emissor (Issuer Script Tag 71/72) ou desbloqueio no banco.
                </li>
              </ul>
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground text-sm">
                Se aprovado online com flags ativos (TVR ≠ 0):
              </p>
              <ul className="space-y-1.5 leading-relaxed">
                <li>
                  ▸ Flags como <em>Transaction exceeds floor limit</em> ou{" "}
                  <em>New card</em> são normais e apenas forçam a subida online (ARQC).
                </li>
                <li>
                  ▸ Preserve o DE 55 integral no clearing (TC05 / IPM) para comprovar presença do
                  chip e evitar chargeback de fraude presencial.
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 flex gap-2.5 flex-wrap">
            <Link
              href="/compliance/disputas"
              className="text-xs font-medium text-foreground hover:text-primary border border-border bg-background px-3 py-2 rounded-lg transition-colors"
            >
              → Disputas & Chargebacks
            </Link>
            <Link
              href="/compliance/campos"
              className="text-xs font-medium text-foreground hover:text-primary border border-border bg-background px-3 py-2 rounded-lg transition-colors"
            >
              → Dicionário de Campos DE/Tag
            </Link>
            <Link
              href="/jornada?track=cartao"
              className="text-xs font-medium text-primary border border-primary/30 bg-primary/5 px-3 py-2 rounded-lg transition-colors"
            >
              → Ver Autorização EMV no Lab 3D
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
