import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis } from "../Breadcrumb";

describe("Breadcrumb", () => {
  it("renders nav with aria-label='Breadcrumb'", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders ol with items", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>Products</BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("active item has aria-current='page'", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem active>Detail</BreadcrumbItem>
      </Breadcrumb>,
    );
    const activeItem = screen.getByText("Detail").closest("li");
    expect(activeItem).toHaveAttribute("aria-current", "page");
  });

  it("non-active item does not have aria-current", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>,
    );
    const item = screen.getByText("Home").closest("li");
    expect(item).not.toHaveAttribute("aria-current");
  });

  it("separator has aria-hidden", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSeparator />
      </Breadcrumb>,
    );
    const separator = screen.getByText("/");
    expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("separator renders custom children", () => {
    render(
      <Breadcrumb>
        <BreadcrumbSeparator>{">"}</BreadcrumbSeparator>
      </Breadcrumb>,
    );
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  describe("BreadcrumbEllipsis (P1)", () => {
    it("renders with aria-label", () => {
      render(<BreadcrumbEllipsis />);
      expect(screen.getByLabelText(/more items/i)).toBeInTheDocument();
    });
  });

  describe("maxItems truncation (P1)", () => {
    it("renders all items when count <= maxItems", () => {
      render(
        <Breadcrumb maxItems={5}>
          <BreadcrumbItem>A</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>B</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>C</BreadcrumbItem>
        </Breadcrumb>,
      );
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.queryByLabelText(/more items/i)).not.toBeInTheDocument();
    });

    it("collapses middle items when count > maxItems", () => {
      render(
        <Breadcrumb maxItems={3}>
          <BreadcrumbItem>A</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>B</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>C</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>D</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>E</BreadcrumbItem>
        </Breadcrumb>,
      );
      // First + ellipsis + last (maxItems - 1) = last 2 items visible
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByLabelText(/more items/i)).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
      expect(screen.getByText("E")).toBeInTheDocument();
      expect(screen.queryByText("B")).not.toBeInTheDocument();
      expect(screen.queryByText("C")).not.toBeInTheDocument();
    });
  });
});
