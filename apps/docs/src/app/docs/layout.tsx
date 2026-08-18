import { Header } from "../../components/chrome/Header";
import { Sidebar } from "../../components/chrome/Sidebar";
import { TableOfContents } from "../../components/chrome/TableOfContents";
import { Breadcrumbs } from "../../components/chrome/Breadcrumbs";
import { DocsPager } from "../../components/chrome/DocsPager";
import { EditOnGitHub } from "../../components/chrome/EditOnGitHub";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="civ-docs-shell">
        <Sidebar />
        <main className="civ-prose civ-docs-main">
          <Breadcrumbs />
          {children}
          <EditOnGitHub />
          <DocsPager />
        </main>
        <TableOfContents />
      </div>
    </>
  );
}
