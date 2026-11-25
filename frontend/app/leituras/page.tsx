import LeiturasOrganizedClient from "./LeiturasOrganizedClient";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Leituras e Referências de Pagamentos | Vinícius Sugamele",
  description:
    "Normas do Banco Central (BCB 304, 264, 406, 493, LC 214), manuais oficiais de Visa, Mastercard e Elo e livros de operação e arquitetura.",
  path: "/leituras",
});

export default function LeiturasPage() {
  return (
    <main className="bg-background min-h-dvh">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Leituras e Referências", path: "/leituras" },
        ])}
      />
      <LeiturasOrganizedClient />
    </main>
  );
}
