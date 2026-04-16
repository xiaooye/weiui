import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "../Breadcrumb";

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
});
