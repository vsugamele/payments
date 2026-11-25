import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/curriculo",
          "/sobre",
          "/noticias",
          "/artigos",
          "/guia",
          "/trilhas",
          "/regulatorio",
          "/glossario",
          "/consultas",
          "/leituras",
          "/jornada",
          "/feed.xml",
        ],
        disallow: [
          "/admin",
          "/compliance",
          "/acervo",
          "/editor",
          "/api",
          "/mcbs",
          "/simulador",
          "/mapa",
          "/arquitetura",
          "/billing",
          "/chargeback",
          "/mdr",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
