import type { Metadata } from "next";
import "@weiui/tokens/tokens.css";
import "@weiui/css";

export const metadata: Metadata = {
  title: "WeiUI — Design System",
  description: "An accessibility-first, layered design system with WCAG AAA enforcement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
