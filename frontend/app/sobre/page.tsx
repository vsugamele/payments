import { CurriculoView } from "@/components/CurriculoView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sobre & Currículo — Vinícius Sugamele",
  description:
    "Trajetória, projetos e currículo de Vinícius Sugamele: mais de 16 anos em meios de pagamento entre bandeiras, adquirentes, emissores e processadoras.",
  path: "/sobre",
  canonicalPath: "/curriculo",
  type: "profile",
});

export default function SobrePage() {
  return <CurriculoView />;
}
