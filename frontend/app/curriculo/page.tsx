import { CurriculoView } from "@/components/CurriculoView";
import { JsonLd } from "@/components/JsonLd";
import { AUTHOR_ID, SITE_URL, buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Currículo — Vinícius Sugamele | Head de Bandeiras",
  description:
    "Trajetória de 16+ anos em meios de pagamento e gestão de bandeiras (Visa, Mastercard, Elo e Amex): EcommIT, Bandeira Elo, Getnet e Verifone / Amex.",
  path: "/curriculo",
  type: "profile",
});

export default function CurriculoPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `${SITE_URL}/curriculo`,
            mainEntity: { "@id": AUTHOR_ID },
            inLanguage: "pt-BR",
          },
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Currículo", path: "/curriculo" },
          ]),
        ]}
      />
      <CurriculoView />
    </>
  );
}
