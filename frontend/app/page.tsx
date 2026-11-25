import consultas from "@/data/consultas-publicas.json";
import { HomeEditorialClient, type ConsultaResumoItem } from "@/components/HomeEditorialClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e BCB",
  description:
    "Notícias comentadas, guia prático, laboratório 3D e mapa regulatório sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central — por Vinícius Sugamele.",
  path: "/",
});

export default function HomePage() {
  const consultasRecentes: ConsultaResumoItem[] = consultas.slice(0, 4).map((c) => ({
    slug: c.slug,
    bandeira: c.bandeira,
    titulo: c.titulo,
    publicacao: c.publicacao,
    vigencia: c.vigencia,
  }));

  return <HomeEditorialClient consultasRecentes={consultasRecentes} />;
}
