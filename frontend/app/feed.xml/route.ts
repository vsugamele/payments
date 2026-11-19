import { EDITORIAL_POSTS } from "@/data/editorial-posts";

const SITE_URL = "https://vinicius-sugamele.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const itemsXml = EDITORIAL_POSTS.map((post) => {
    const link = `${SITE_URL}${post.href}`;
    const pubDate = new Date(`${post.dateISO}T12:00:00Z`).toUTCString();
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.summary)}</description>
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação</title>
    <link>${SITE_URL}</link>
    <description>Notícias comentadas, mudanças regulatórias e artigos técnicos sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central.</description>
    <language>pt-BR</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
