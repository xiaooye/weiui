import Link from "next/link";
import { Header } from "../components/chrome/Header";
import { Footer } from "../components/landing/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--wui-spacing-6)",
          minBlockSize: "70vh",
          paddingInline: "var(--wui-spacing-4)",
          textAlign: "center",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--wui-font-family-display)",
            fontSize: "var(--wui-font-size-5xl)",
            color: "var(--wui-color-muted-foreground)",
            lineHeight: 1,
          }}
        >
          404
        </span>
        <div style={{ maxInlineSize: "42rem" }}>
          <h1
            className="wui-display"
            style={{
              fontSize: "var(--wui-font-size-4xl)",
              marginBlockEnd: "var(--wui-spacing-3)",
              lineHeight: 1.1,
            }}
          >
            Page not found.
          </h1>
          <p
            style={{
              color: "var(--wui-color-muted-foreground)",
              fontSize: "var(--wui-font-size-lg)",
              margin: 0,
            }}
          >
            The page you were looking for doesn&apos;t exist, or has moved. Try the docs
            index or one of the featured components below.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--wui-spacing-3)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href="/" className="wui-button wui-button--solid wui-button--lg">
            Back to home
          </Link>
          <Link
            href="/docs/getting-started"
            className="wui-button wui-button--outline wui-button--lg"
          >
            Getting started
          </Link>
          <Link
            href="/docs/components"
            className="wui-button wui-button--ghost wui-button--lg"
          >
            Components
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
