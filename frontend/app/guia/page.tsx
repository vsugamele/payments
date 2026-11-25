import GuiaOrganizedClient from "./GuiaOrganizedClient";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Guia de Meios de Pagamento (9 Capítulos) | Vinícius Sugamele",
  description:
    "Cartões, clearing SLC/B3, intercâmbio, chargeback, Pix, MED 2.0, Boleto, Open Finance e Split Payment 2027 explicados lado a lado (Ensinar + Demonstrar).",
  path: "/guia",
});

export default function GuiaPage() {
  return (
    <main className="bg-background min-h-dvh">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Guia de Meios de Pagamento", path: "/guia" },
        ])}
      />
      <GuiaOrganizedClient />
    </main>
  );
}
