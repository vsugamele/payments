"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticleToc() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(".article-body");
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll("h2"));
    if (nodes.length < 3) return;

    const items: TocItem[] = [];
    const usedIds = new Set<string>();

    nodes.forEach((node, idx) => {
      const text = (node.textContent || "").trim();
      if (!text) return;
      let id = node.id || slugifyHeading(text) || `secao-${idx + 1}`;
      if (usedIds.has(id)) id = `${id}-${idx + 1}`;
      usedIds.add(id);
      node.id = id;
      (node as HTMLElement).style.scrollMarginTop = "5.5rem";
      items.push({ id, text });
    });

    setHeadings(items);
    if (items[0]) setActiveId(items[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0.1 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 3) return null;

  return (
    <aside
      aria-label="Neste texto"
      className="hidden xl:block w-56 shrink-0 sticky top-24 self-start pl-6 border-l border-border"
    >
      <p className="section-eyebrow mb-3">Neste texto</p>
      <ul className="space-y-2 text-xs">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block leading-snug transition-colors ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
