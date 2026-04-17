import { PackageManagerTabs } from "../docs/PackageManagerTabs";

export function InstallSnippet() {
  return (
    <section className="wui-home-section wui-home-install">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Get started</span>
        <h2 className="wui-home-section__title">One command.</h2>
        <p className="wui-home-section__sub">
          All you need is the React package — tokens and CSS primitives come along for free.
        </p>
      </header>
      <div className="wui-home-install__wrap">
        <PackageManagerTabs command="@weiui/react" />
      </div>
    </section>
  );
}
