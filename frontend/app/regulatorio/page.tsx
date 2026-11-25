import MapaRegulatorioClient from "./MapaRegulatorioClient";
import { JsonLd } from "@/components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildDatasetJsonLd,
  buildPageMetadata,
  buildWebApplicationJsonLd,
} from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Mapa Regulatório do Cartão (202 Atos BCB/CMN)",
  description:
    "Árvore visual interativa com 202 normas do Banco Central, CMN e leis de cartões ligadas a Visa, Mastercard e Elo, com obrigações por papel e cadeia normativa.",
  path: "/regulatorio",
  keywords: [
    "mapa regulatório cartão",
    "normas BCB meios de pagamento",
    "Resolução BCB 150",
    "Resolução BCB 304",
    "Resolução BCB 264",
    "LC 214 Split Payment",
    "regras CMN cartões",
  ],
});

export default function RegulatorioPage() {
  return (
    <>
      <JsonLd
        data={[
          buildDatasetJsonLd({
            name: "Mapa Regulatório do Cartão no Brasil (202 Atos BCB, CMN e Leis)",
            description:
              "Catálogo estruturado de 202 atos normativos brasileiros (137 BCB, 50 CMN, 7 BCB/CMN, Leis Federais e Reforma Tributária) organizados em 24 temas, com 88 atos do núcleo de cartões e 69 vinculados a regras de bandeiras.",
            path: "/regulatorio",
            temporalCoverage: "2013/2026-11-19",
            keywords: [
              "Banco Central do Brasil",
              "Conselho Monetário Nacional",
              "Arranjos de Pagamento",
              "Cartões de Crédito e Débito",
              "Split Payment",
              "Intercâmbio",
              "Registro de Recebíveis",
            ],
          }),
          buildWebApplicationJsonLd({
            name: "Mapa Regulatório Interativo do Cartão",
            description:
              "Ferramenta visual com árvore pan & zoom e filtros por papel regulatório (emissor, credenciador, subcredenciador, instituidor, registradora e IP).",
            path: "/regulatorio",
          }),
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Mapa Regulatório do Cartão", path: "/regulatorio" },
          ]),
        ]}
      />
      <MapaRegulatorioClient />
    </>
  );
}
