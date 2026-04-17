import Link from "next/link";
import { Header } from "../components/chrome/Header";
import { siteConfig } from "../lib/site-config";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="wui-landing-hero">
          <h1 className="wui-display wui-landing-hero__title">
            A design system that earns its place.
          </h1>
          <p className="wui-landing-hero__sub">
            Three consumption layers. WCAG AAA enforcement. OKLCH tokens. Designer-friendly.
          </p>
          <div className="wui-landing-hero__cta">
            <Link href="/docs/getting-started" className="wui-button wui-button--solid">Get Started</Link>
            <Link href="/docs/components" className="wui-button wui-button--outline">Components</Link>
            <a href={siteConfig.githubUrl} className="wui-button wui-button--ghost" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </section>

        <section className="wui-landing-grid">
          <div className="wui-card">
            <div className="wui-card__header"><h3>Three Layers</h3></div>
            <div className="wui-card__content">CSS-only primitives, headless behavior hooks, and fully styled React components.</div>
          </div>
          <div className="wui-card">
            <div className="wui-card__header"><h3>WCAG AAA</h3></div>
            <div className="wui-card__content">7:1 contrast for content text, 44px touch targets, full keyboard navigation.</div>
          </div>
          <div className="wui-card">
            <div className="wui-card__header"><h3>OKLCH Tokens</h3></div>
            <div className="wui-card__content">W3C Design Tokens in JSON. Auto dark mode. Designer-friendly source of truth.</div>
          </div>
        </section>
      </main>
    </>
  );
}
