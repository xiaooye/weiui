interface Lib {
  name: string;
  cells: Record<string, boolean | string>;
}

const ROWS = [
  "AAA enforced",
  "CSS-only tier",
  "Headless tier",
  "Design tokens",
  "Designer contribution path",
  "RTL support",
  "Framework-agnostic CSS",
  "Copy-paste ownership",
] as const;

const LIBS: Lib[] = [
  {
    name: "WeiUI",
    cells: {
      "AAA enforced": true,
      "CSS-only tier": true,
      "Headless tier": true,
      "Design tokens": true,
      "Designer contribution path": true,
      "RTL support": true,
      "Framework-agnostic CSS": true,
      "Copy-paste ownership": true,
    },
  },
  {
    name: "shadcn/ui",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": "via Radix",
      "Design tokens": "limited",
      "Designer contribution path": false,
      "RTL support": "partial",
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": true,
    },
  },
  {
    name: "HeroUI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": false,
      "Design tokens": true,
      "Designer contribution path": false,
      "RTL support": true,
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
  {
    name: "Headless UI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": true,
      "Design tokens": false,
      "Designer contribution path": false,
      "RTL support": "partial",
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
  {
    name: "Radix UI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": true,
      "Design tokens": "via Themes",
      "Designer contribution path": false,
      "RTL support": true,
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true)  return <span className="wui-home-compare__yes" aria-label="Yes">●</span>;
  if (value === false) return <span className="wui-home-compare__no"  aria-label="No">○</span>;
  return <span className="wui-home-compare__partial">{value}</span>;
}

export function Comparison() {
  return (
    <section className="wui-home-section wui-home-compare">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Comparison</span>
        <h2 className="wui-home-section__title">Where WeiUI fits.</h2>
        <p className="wui-home-section__sub">
          Every library has tradeoffs. These are ours, plotted against the closest peers.
        </p>
      </header>
      <div className="wui-home-compare__wrap">
        <table className="wui-home-compare__table">
          <thead>
            <tr>
              <th scope="col"><span className="wui-sr-only">Feature</span></th>
              {LIBS.map((lib) => <th key={lib.name} scope="col">{lib.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {LIBS.map((lib) => <td key={lib.name}><Cell value={lib.cells[row] ?? false} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
