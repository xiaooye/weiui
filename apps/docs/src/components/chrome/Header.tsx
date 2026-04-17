import Link from "next/link";
import { siteConfig } from "../../lib/site-config";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";

export function Header() {
  return (
    <header className="wui-docs-header">
      <div className="wui-docs-header__inner">
        <Link href="/" className="wui-docs-header__brand">
          <span className="wui-docs-header__logo" aria-hidden="true">◐</span>
          <span className="wui-docs-header__name">{siteConfig.name}</span>
          <span className="wui-docs-header__version">{siteConfig.version}</span>
        </Link>
        <nav className="wui-docs-header__nav" aria-label="Primary">
          {siteConfig.primaryNav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="wui-docs-header__actions">
          <SearchTrigger />
          <ThemeToggle />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="wui-docs-header__github"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
