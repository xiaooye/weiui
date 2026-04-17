import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline, TimelineItem } from "../Timeline";

describe("Timeline", () => {
  it("renders items", () => {
    render(
      <Timeline>
        <TimelineItem title="Event 1" />
        <TimelineItem title="Event 2" />
      </Timeline>,
    );
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });
});
