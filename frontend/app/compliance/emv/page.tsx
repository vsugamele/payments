import EMVDecoderClient from "./EMVDecoderClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, Cpu, AlertTriangle, Info, Lock } from "lucide-react";

export const metadata = {
  title: "Decodificador EMV: TVR (Tag 95) | VS Payments",
  description: "Decodifique o Terminal Verification Results (TVR/Tag 95) bit a bit, conforme o EMV Book 3. Analise flags de risco de autenticação, CVM, ODA e scripts de emissor.",
};

export default function EMVDecoderPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Decodificador EMV — TVR (Tag 95)</h1>
                <RuleReference
                  manual="EMV Book 3"
                  ruleId="Annex C: Terminal Verification Results"
                  description="Definição oficial de todos os bits do TVR, conforme EMV Book 3 — Application Specification (versão 4.3+)."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                O{" "}
                <TermTooltip
                  term="TVR (Terminal Verification Results)"
                  definition="Campo de 5 bytes (Tag 95) gerado pelo kernel EMV no terminal. Cada bit representa o resultado de uma verificação de segurança: autenticação de dados offline (ODA), CVM, gestão de risco e autenticação do emissor. É enviado dentro do ARQC para o emissor decidir a autorização."
                />{" "}
                é o "cartão de relatório" do chip. Cole o valor hexadecimal de 10 caracteres recebido na mensagem ISO 8583 (DE 55 ou diretamente da tag) para ver exatamente quais verificações passaram, quais falharam — e o nível de risco associado.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">

        {/* Context pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Lock,
              color: "#22d3ee",
              bg: "rgba(34,211,238,0.08)",
              border: "rgba(34,211,238,0.2)",
              title: "Onde encontrar o TVR",
              desc: "Na mensagem ISO 8583, dentro do DE 55 (ICC Data). O DE 55 é um TLV (Tag-Length-Value) onde a Tag 95 contém os 5 bytes do TVR. Em logs de switch, procure por '9500' ou '95 05' seguido de 10 hex chars.",
            },
            {
              icon: AlertTriangle,
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.08)",
              border: "rgba(245,158,11,0.2)",
              title: "Bits = Resultado de Verificação",
              desc: "Bit 1 = verificação FALHOU ou condição ativada. Bit 0 = sem problema. Um TVR zerado (0000000000) é o estado ideal — todas as verificações passaram sem alertas.",
            },
            {
              icon: Info,
              color: "#a78bfa",
              bg: "rgba(167,139,250,0.08)",
              border: "rgba(167,139,250,0.2)",
              title: "Impacto na Autorização",
              desc: "O emissor lê o TVR via ARQC e pode decidir online. Flags críticos (SDA failed, Exception File, PIN Try Limit) quase sempre resultam em Response Code 05 (Do Not Honor) ou RC 04 (Pick Up Card).",
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="p-5 rounded-xl border" style={{ background: card.bg, borderColor: card.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: card.color }} />
                  <h3 className="font-bold text-sm" style={{ color: card.color }}>{card.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Decoder */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Decodificador Interativo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Insira o valor hex do TVR ou escolha um padrão comum. O decoder mostrará cada bit ativo com descrição, severidade e impacto na decisão do emissor.
            </p>
          </div>
          <EMVDecoderClient />
        </section>

        {/* What's next */}
        <div className="p-6 rounded-2xl border border-border bg-code-bg">
          <h3 className="font-bold text-foreground mb-4">Próximos passos depois do TVR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-2">
              <p className="font-bold text-foreground text-sm">Se o emissor recusou (RC 05/04/08/75):</p>
              <ul className="space-y-1.5 leading-relaxed">
                <li>▸ Confirme quais bits do TVR estão em 1 — isto é a causa raiz da recusa</li>
                <li>▸ Se <strong>SDA/DDA/CDA failed</strong>: investigue o cartão (pode ser clonagem)</li>
                <li>▸ Se <strong>PIN Try Limit exceeded</strong>: oriente o portador a desbloquear com o banco emissor</li>
                <li>▸ Se <strong>Exception File</strong>: o cartão está na blacklist do terminal — bloqueie o PAN</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-foreground text-sm">Se aprovado mas com flags (TVR ≠ 0):</p>
              <ul className="space-y-1.5 leading-relaxed">
                <li>▸ Flags de risco médio (floor limit, version mismatch) são comuns e esperados</li>
                <li>▸ Monitore o Tag 9B (TSI) para confirmar quais funções EMV foram executadas</li>
                <li>▸ Flags de ODA + CVM em 1 numa transação aprovada podem gerar chargeback posterior</li>
                <li>▸ Guarde o ARQC completo (DE 55) para evidência em caso de disputa</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/compliance/disputas" className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 px-3 py-2 rounded-lg transition-colors">
              → Disputas & Chargebacks
            </Link>
            <Link href="/compliance/campos" className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 px-3 py-2 rounded-lg transition-colors">
              → Lookup de Campos DE/Tag
            </Link>
            <Link href="/jornada" className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 px-3 py-2 rounded-lg transition-colors">
              → Jornada da Transação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
