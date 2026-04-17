interface Prop {
  title: string;
  body: string;
  glyph: string; // emoji or single char for simplicity — avoids icon-lib dep
}

const PROPS: Prop[] = [
  {
    title: "Three Layers",
    glyph: "◎",
    body: "CSS-only primitives, accessible headless hooks, or fully styled React components. Pick your integration depth.",
  },
  {
    title: "WCAG AAA",
    glyph: "✓",
    body: "7:1 contrast for content text. 44×44 touch targets. Keyboard patterns validated at build time, not in review.",
  },
  {
    title: "OKLCH Tokens",
    glyph: "◐",
    body: "W3C Design Tokens in JSON. Perceptually-uniform color space. Automatic light/dark via relative color functions.",
  },
  {
    title: "Designer-Friendly",
    glyph: "✎",
    body: "Tokens live in JSON, Figma variables, and CSS vars — one source of truth. Designers edit without touching component code.",
  },
  {
    title: "Zero-JS tier",
    glyph: "∅",
    body: "Drop the CSS package into any framework — Vue, Svelte, plain HTML — and get accessible primitives without a bundler.",
  },
  {
    title: "Ownership, not lock-in",
    glyph: "⎘",
    body: "shadcn-style CLI copy-paste for components. Own the code, modify anything, no version-bump fear.",
  },
];

export function ValueProps() {
  return (
    <section className="wui-home-section wui-home-values">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Why WeiUI</span>
        <h2 className="wui-home-section__title">Built for teams that ship serious UI.</h2>
        <p className="wui-home-section__sub">
          Every decision is graded against real production pain: drift, accessibility debt, designer–developer friction.
        </p>
      </header>
      <div className="wui-home-values__grid">
        {PROPS.map((p) => (
          <article key={p.title} className="wui-home-values__card">
            <span className="wui-home-values__glyph" aria-hidden="true">{p.glyph}</span>
            <h3 className="wui-home-values__title">{p.title}</h3>
            <p className="wui-home-values__body">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
