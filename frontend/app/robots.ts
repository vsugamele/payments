import type { MetadataRoute } from "next";

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
          "/trilhas",
          "/billing",
          "/chargeback",
          "/mdr",
        ],
      },
    ],
    sitemap: "https://vinicius-sugamele.com/sitemap.xml",
  };
}
