import MapaRegulatorioClient from "./MapaRegulatorioClient";

export const metadata = {
  title: "Mapa Regulatório do Cartão (202 Atos BCB & CMN) — Vinícius Sugamele",
  description:
    "Mapa interativo com 202 atos regulatórios do Banco Central, CMN e leis de meios de pagamento conectados às regras de Visa, Mastercard e Elo, com obrigações por papel e cadeia de alterações.",
};

export default function RegulatorioPage() {
  return <MapaRegulatorioClient />;
}
