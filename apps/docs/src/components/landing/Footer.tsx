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
          <nav aria-labelledby="wui-footer-docs-heading">
            <h4 id="wui-footer-docs-heading">Docs</h4>
            <ul>
              <li><Link href="/docs/getting-started">Installation</Link></li>
              <li><Link href="/docs/components">Components</Link></li>
              <li><Link href="/docs/typography">Typography</Link></li>
              <li><Link href="/docs/colors">Colors</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="wui-footer-tools-heading">
            <h4 id="wui-footer-tools-heading">Tools</h4>
            <ul>
              <li><Link href="/playground">Playground</Link></li>
              <li><Link href="/composer">Composer</Link></li>
              <li><Link href="/themes">Theme Builder</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="wui-footer-project-heading">
            <h4 id="wui-footer-project-heading">Project</h4>
            <ul>
              <li><a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">GitHub</a></li>
              <li><Link href="/docs/changelog">Changelog</Link></li>
              <li><Link href="/docs/migration">Migration</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="wui-home-footer__bottom">
        <span>© 2026 WeiUI. MIT License.</span>
        <span>Made with WeiUI.</span>
      </div>
    </footer>
  );
}
