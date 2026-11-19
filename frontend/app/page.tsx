import consultas from "@/data/consultas-publicas.json";
import { HomeEditorialClient, type ConsultaResumoItem } from "@/components/HomeEditorialClient";

export const metadata = {
  title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação",
  description:
    "Notícias comentadas, análises técnicas e bastidores sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central — por Vinícius Sugamele, Head de Bandeiras com mais de 16 anos no setor.",
};

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
