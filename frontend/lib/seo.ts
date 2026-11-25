import type { Metadata } from "next";

export const SITE_URL = "https://www.vinicius-sugamele.com";
export const SITE_NAME = "Vinícius Sugamele";
export const AUTHOR_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function truncateSeo(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.replace(/[,;:.\-–—\s]+$/, "")}…`;
}

export function buildArticleTitle(rawTitle: string, brandSuffix = "Vinícius Sugamele"): string {
  const clean = rawTitle.replace(/\s+/g, " ").trim();
  const full = `${clean} | ${brandSuffix}`;
  if (full.length <= 65) return full;
  if (clean.length <= 62) return clean;
  return truncateSeo(clean, 60);
}

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  keywords?: string[];
}

export function buildPageMetadata({
  title,
  description,
  path,
  canonicalPath,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  keywords,
}: PageMetadataInput): Metadata {
  const safeDesc = truncateSeo(description, 158);
  const canonical = canonicalPath ?? path;
  const fullUrl = `${SITE_URL}${canonical === "/" ? "" : canonical}`;

  return {
    title,
    description: safeDesc,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: safeDesc,
      url: fullUrl,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type,
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime: modifiedTime ?? publishedTime,
            authors: [SITE_NAME],
            ...(section ? { section } : {}),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: safeDesc,
    },
  };
}

export function buildGlobalGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": AUTHOR_ID,
        name: "Vinícius Sugamele",
        url: SITE_URL,
        image: `${SITE_URL}/vinicius_sugamele.jpg`,
        jobTitle: "Head de Bandeiras e Meios de Pagamento",
        description:
          "Especialista em meios de pagamento com mais de 16 anos de experiência em Visa, Mastercard, Elo, American Express, Pix, Banco Central e liquidação.",
        sameAs: ["https://www.linkedin.com/in/vinicius-sugamele-41136617/"],
        knowsAbout: [
          "Meios de Pagamento",
          "Bandeiras de Cartão (Visa, Mastercard, Elo, American Express)",
          "ISO 8583",
          "EMV e 3-D Secure 2.2",
          "Clearing e Liquidação SLC/B3",
          "Tarifas de Intercâmbio e MDR",
          "Regulação do Banco Central do Brasil (BCB e CMN)",
          "Pix, SPI, MED 2.0 e Open Finance JSR",
          "Reforma Tributária e Split Payment (LC 214/2025)",
        ],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação",
        description:
          "Notícias comentadas, guia prático, laboratório 3D interativo e mapa regulatório de meios de pagamento no Brasil.",
        inLanguage: "pt-BR",
        publisher: { "@id": AUTHOR_ID },
        author: { "@id": AUTHOR_ID },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function buildArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  section,
  isNews = false,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  section?: string;
  isNews?: boolean;
  keywords?: string[];
}) {
  const fullUrl = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": isNews ? "NewsArticle" : "TechArticle",
    headline: title,
    description: truncateSeo(description, 200),
    url: fullUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
    image: [DEFAULT_OG_IMAGE],
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: "pt-BR",
    author: { "@id": AUTHOR_ID },
    publisher: { "@id": AUTHOR_ID },
    ...(section ? { articleSection: section } : {}),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
  };
}

export function buildWebApplicationJsonLd({
  name,
  description,
  path,
  applicationCategory = "FinanceApplication",
  featureList,
}: {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
  featureList?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory,
    operatingSystem: "Web",
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    author: { "@id": AUTHOR_ID },
    ...(featureList ? { featureList } : {}),
  };
}

export function buildDatasetJsonLd({
  name,
  description,
  path,
  temporalCoverage,
  keywords,
}: {
  name: string;
  description: string;
  path: string;
  temporalCoverage?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    creator: { "@id": AUTHOR_ID },
    ...(temporalCoverage ? { temporalCoverage } : {}),
    ...(keywords ? { keywords } : {}),
  };
}

export function buildDefinedTermSetJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "pt-BR",
    creator: { "@id": AUTHOR_ID },
  };
}
