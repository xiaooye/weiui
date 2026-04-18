"use client";

import { useEffect, useState } from "react";
import { Heading, Link, Stack } from "@weiui/react";

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const nodes = main.querySelectorAll("h2, h3");
    const list: TocHeading[] = [];
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
    <nav className="wui-docs-toc" aria-label="On this page">
      <Heading level={4} className="wui-docs-toc__title">
        On this page
      </Heading>
      <Stack direction="column" gap={0} role="list" className="wui-docs-toc__list">
        {headings.map((h) => (
          <Link
            key={h.id}
            href={`#${h.id}`}
            underline="none"
            role="listitem"
            className="wui-docs-toc__link"
            data-level={h.level}
            data-active={active === h.id || undefined}
          >
            {h.text}
          </Link>
        ))}
      </Stack>
    </nav>
  );
}
