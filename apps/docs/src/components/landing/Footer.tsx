import Link from "next/link";
import { siteConfig } from "../../lib/site-config";

export function Footer() {
  return (
    <footer className="wui-home-footer">
      <div className="wui-home-footer__inner">
        <div className="wui-home-footer__brand">
          <span className="wui-home-footer__logo" aria-hidden="true">◐</span>
          <span>{siteConfig.name}</span>
          <span className="wui-home-footer__version">v{siteConfig.version}</span>
        </div>
        <div className="wui-home-footer__cols">
          <div>
            <h4>Docs</h4>
            <Link href="/docs/getting-started">Installation</Link>
            <Link href="/docs/components">Components</Link>
            <Link href="/docs/typography">Typography</Link>
            <Link href="/docs/colors">Colors</Link>
          </div>
          <div>
            <h4>Tools</h4>
            <Link href="/playground">Playground</Link>
            <Link href="/composer">Composer</Link>
            <Link href="/themes">Theme Builder</Link>
          </div>
          <div>
            <h4>Project</h4>
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/docs/changelog">Changelog</Link>
            <Link href="/docs/migration">Migration</Link>
          </div>
        </div>
      </div>
      <div className="wui-home-footer__bottom">
        <span>© 2026 WeiUI. MIT License.</span>
        <span>Made with WeiUI.</span>
      </div>
    </footer>
  );
}
