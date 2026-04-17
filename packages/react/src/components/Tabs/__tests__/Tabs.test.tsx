import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../Tabs";

describe("Tabs (React re-export)", () => {
  it("renders tab triggers and content", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("content-a")).toBeInTheDocument();
  });
});
