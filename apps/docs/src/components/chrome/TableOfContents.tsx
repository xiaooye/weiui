"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const nodes = main.querySelectorAll("h2, h3");
    const list: Heading[] = [];
    nodes.forEach((node) => {
      if (!node.id) {
        node.id =
          node.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "";
      }
      list.push({
        id: node.id,
        text: node.textContent ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      });
    });
    setHeadings(list);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 1.0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="wui-docs-toc" aria-label="On this page">
      <h4 className="wui-docs-toc__title">On this page</h4>
      <ul className="wui-docs-toc__list">
        {headings.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a
              href={`#${h.id}`}
              className="wui-docs-toc__link"
              data-active={active === h.id || undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
