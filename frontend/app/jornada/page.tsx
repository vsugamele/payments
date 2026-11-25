import Link from "next/link";
import { ArrowLeft, Route, Layers, Clock, Shield } from "lucide-react";
import JornadaClient from "./JornadaClient";
import { PaygramaInteractiveLab } from "./PaygramaInteractiveLab";
import { JsonLd } from "@/components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildWebApplicationJsonLd,
} from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "O Pagamento por Dentro (Lab 3D & Pix) | Vinícius Sugamele",
  description:
    "Simulador interativo em 3D e milissegundos: Cartão (4 bandeiras), SLC/B3, CE 3.0, Pix SPI, MED 2.0, Boleto NPC, Open Finance e Split Tributário 2027+.",
  path: "/jornada",
});

const PILARES = [
  { icon: Route, label: "10 trilhas interativas", desc: "Cartão, Outgoing, Pix, MED 2.0, Boleto e 2027+" },
  { icon: Layers, label: "Arquitetura ⇄ Sequência", desc: "ISO 8583, 168B/TLV e ISO 20022" },
  { icon: Clock, label: "Injeção de falhas", desc: "STIP, 0400, Downgrade, BCB 304 e BC Protege+" },
  { icon: Shield, label: "Dinheiro, D+1 e LC 214", desc: "Divisão de MDR, antecipação e Split 2027" },
];

export default function JornadaPage() {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={[
          buildWebApplicationJsonLd({
            name: "O Pagamento por Dentro — Laboratório Interativo 3D",
            description:
              "Simulador passo a passo de meios de pagamento no Brasil com projeção isométrica 3D, diagrama de sequência em ms, injeção de falhas e simulador de Split Payment 2027.",
            path: "/jornada",
            featureList: [
              "10 trilhas interativas (Cartão, Outgoing SLC/B3, CE 3.0, Pix SPI, Pix Automático/NFC, MED 2.0, Open Finance JSR, Boleto NPC, BC Protege+ e Split Tributário LC 214/2025)",
              "Alternância entre projeção isométrica 3D e diagrama de sequência cronometrado",
              "Injeção de falhas reais e decomposição de ARN, EndToEndId e código de barras",
            ],
          }),
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Laboratório (O Pagamento por Dentro)", path: "/jornada" },
          ]),
        ]}
      />
      {/* ── Cabeçalho Editorial do Laboratório ── */}
      <section className="dot-grid border-b border-border py-12 px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para a página inicial
          </Link>

          <div className="max-w-3xl space-y-3">
            <p className="section-eyebrow">Laboratório de pagamentos</p>
            <h1
              className="font-semibold text-foreground text-balance"
              style={{
                fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
              }}
            >
              O pagamento, passo a passo por dentro
            </h1>
            <p className="font-serif text-base text-muted-foreground leading-relaxed text-pretty">
              Uma compra leva menos de dois segundos, mas passa por vários participantes. Escolha um
              cenário, injete uma falha se quiser e acompanhe cada mensagem, o caminho do dinheiro e
              a norma oficial que vale naquela etapa.
            </p>
          </div>

          {/* 4 cartões limpos de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {PILARES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="editorial-card p-4 flex items-start gap-3"
                >
                  <Icon size={16} className="text-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-foreground">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {p.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Laboratório Interativo ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <PaygramaInteractiveLab />
      </section>

      {/* ── Enciclopédia Detalhada das 8 Fases ── */}
      <section className="pt-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4">
          <div className="editorial-card px-5 py-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="section-eyebrow">Referência por etapa</p>
              <h2 className="text-base font-semibold text-foreground mt-0.5">
                Anatomia detalhada do ciclo do cartão (captura → autorização → clearing → liquidação → disputas)
              </h2>
            </div>
            <Link
              href="/artigos/passo-a-passo-transacao"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ler guia completo →
            </Link>
          </div>
        </div>
        <JornadaClient />
      </section>
    </main>
  );
}
