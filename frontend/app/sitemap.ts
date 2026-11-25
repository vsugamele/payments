import type { MetadataRoute } from "next";
import { EDITORIAL_POSTS } from "@/data/editorial-posts";
import { GUIA_CHAPTERS } from "@/data/guia-pagamentos";
import consultas from "@/data/consultas-publicas.json";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/curriculo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/noticias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/artigos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/guia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/jornada`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/regulatorio`, lastModified: new Date("2026-11-24T12:00:00Z"), changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/trilhas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/glossario`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/consultas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/leituras`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  ];

  const guiaRoutes: MetadataRoute.Sitemap = GUIA_CHAPTERS.map((ch) => ({
    url: `${SITE_URL}/guia/${ch.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = EDITORIAL_POSTS.map((post) => ({
    url: `${SITE_URL}${post.href}`,
    lastModified: new Date(`${post.dateISO}T12:00:00Z`),
    changeFrequency: "monthly",
    priority: post.kind === "noticia" ? 0.85 : 0.8,
  }));

  const consultaRoutes: MetadataRoute.Sitemap = consultas.map((c) => ({
    url: `${SITE_URL}/consultas/${c.slug}`,
    lastModified: new Date(c.publicacao),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guiaRoutes, ...postRoutes, ...consultaRoutes];
}
