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
      <div className="wui-docs-shell">
        <Sidebar />
        <main className="wui-prose wui-docs-main">
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
