import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeiUIProvider, useWeiUI } from "../WeiUIProvider";

function LocaleConsumer() {
  const { locale } = useWeiUI();
  return <span>{locale.dialog?.close ?? "default"}</span>;
}

describe("WeiUIProvider", () => {
  it("renders children", () => {
    render(<WeiUIProvider><span>hello</span></WeiUIProvider>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("provides default locale", () => {
    render(<WeiUIProvider><LocaleConsumer /></WeiUIProvider>);
    expect(screen.getByText("default")).toBeInTheDocument();
  });

  it("provides custom locale", () => {
    render(
      <WeiUIProvider locale={{ dialog: { close: "Fermer" } }}>
        <LocaleConsumer />
      </WeiUIProvider>,
    );
    expect(screen.getByText("Fermer")).toBeInTheDocument();
  });
});
