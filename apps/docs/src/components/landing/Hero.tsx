import Link from "next/link";
import { siteConfig } from "../../lib/site-config";

export function Hero() {
  return (
    <section className="wui-landing-hero">
      <span className="wui-landing-hero__badge">v{siteConfig.version} · Pre-release</span>
      <h1 className="wui-display wui-landing-hero__title">
        A design system that earns its place.
      </h1>
      <p className="wui-landing-hero__sub">
        Three consumption layers. WCAG AAA enforcement. OKLCH tokens. Designer-friendly.
      </p>
      <div className="wui-landing-hero__cta">
        <Link href="/docs/getting-started" className="wui-button wui-button--solid wui-button--lg">Get Started</Link>
        <Link href="/docs/components" className="wui-button wui-button--outline wui-button--lg">Components</Link>
        <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="wui-button wui-button--ghost wui-button--lg">GitHub</a>
      </div>
      <div className="wui-landing-hero__metrics">
        <div><strong>65+</strong><span>Components</span></div>
        <div><strong>AAA</strong><span>Contrast</span></div>
        <div><strong>3</strong><span>Layers</span></div>
        <div><strong>0</strong><span>JS required</span></div>
      </div>
    </section>
  );
}
