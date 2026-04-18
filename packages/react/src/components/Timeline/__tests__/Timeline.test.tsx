import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline, TimelineItem } from "../Timeline";

describe("Timeline", () => {
  it("renders as an ordered list with items", () => {
    render(
      <Timeline>
        <TimelineItem title="Event 1" />
        <TimelineItem title="Event 2" />
      </Timeline>,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveClass("wui-timeline");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders title text", () => {
    render(
      <Timeline>
        <TimelineItem title="Event 1" />
      </Timeline>,
    );
    expect(screen.getByText("Event 1")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Timeline>
        <TimelineItem title="Deployed" description="Shipped to production" />
      </Timeline>,
    );
    expect(screen.getByText("Shipped to production"))
      .toHaveClass("wui-timeline-item__description");
  });

  it("omits description node when not provided", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Event" />
      </Timeline>,
    );
    expect(container.querySelector(".wui-timeline-item__description")).toBeNull();
  });

  it("renders time when provided", () => {
    render(
      <Timeline>
        <TimelineItem title="Deployed" time="2 hours ago" />
      </Timeline>,
    );
    expect(screen.getByText("2 hours ago"))
      .toHaveClass("wui-timeline-item__time");
  });

  it("renders decorative indicator (dot + line) marked aria-hidden", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Event" />
      </Timeline>,
    );
    expect(container.querySelector(".wui-timeline-item__dot")).not.toBeNull();
    const line = container.querySelector(".wui-timeline-item__line");
    expect(line).not.toBeNull();
    expect(line).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts ReactNode in title, description, and time", () => {
    render(
      <Timeline>
        <TimelineItem
          title={<strong>Bold title</strong>}
          description={<em>italic</em>}
          time={<time dateTime="2024-01-01">Jan 1</time>}
        />
      </Timeline>,
    );
    expect(screen.getByText("Bold title").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
    expect(screen.getByText("Jan 1").tagName).toBe("TIME");
  });

  describe("mode (P1)", () => {
    it("default mode sets data-mode attribute", () => {
      render(
        <Timeline>
          <TimelineItem title="x" />
        </Timeline>,
      );
      expect(screen.getByRole("list")).toHaveAttribute("data-mode", "default");
    });
    it("alternate mode sets data-mode=alternate", () => {
      render(
        <Timeline mode="alternate">
          <TimelineItem title="x" />
        </Timeline>,
      );
      expect(screen.getByRole("list")).toHaveAttribute("data-mode", "alternate");
    });
  });

  describe("color per item (P1)", () => {
    it("applies data-color to the item", () => {
      render(
        <Timeline>
          <TimelineItem title="x" color="success" data-testid="item" />
        </Timeline>,
      );
      expect(screen.getByTestId("item")).toHaveAttribute("data-color", "success");
    });
  });

  describe("custom dot (P1)", () => {
    it("renders custom dot content", () => {
      render(
        <Timeline>
          <TimelineItem title="x" dot={<span data-testid="dot-x">*</span>} />
        </Timeline>,
      );
      expect(screen.getByTestId("dot-x")).toBeInTheDocument();
    });
  });
});
