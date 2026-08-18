import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CivariaProvider, useCivaria } from "../CivariaProvider";

function LocaleConsumer() {
  const { locale } = useCivaria();
  return <span>{locale.dialog?.close ?? "default"}</span>;
}

describe("CivariaProvider", () => {
  it("renders children", () => {
    render(<CivariaProvider><span>hello</span></CivariaProvider>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("provides default locale", () => {
    render(<CivariaProvider><LocaleConsumer /></CivariaProvider>);
    expect(screen.getByText("default")).toBeInTheDocument();
  });

  it("provides custom locale", () => {
    render(
      <CivariaProvider locale={{ dialog: { close: "Fermer" } }}>
        <LocaleConsumer />
      </CivariaProvider>,
    );
    expect(screen.getByText("Fermer")).toBeInTheDocument();
  });
});
