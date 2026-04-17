import { describe, it, expect, beforeEach } from "vitest";
import { announce } from "../announce";

describe("announce", () => {
  beforeEach(() => {
    // Clear DOM between tests
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("creates a live region if none exists", () => {
    announce("hello");
    const region = document.getElementById("wui-live-region-polite");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-live")).toBe("polite");
    expect(region?.className).toBe("wui-sr-only");
  });

  it("uses assertive priority when specified", () => {
    announce("urgent", "assertive");
    const region = document.getElementById("wui-live-region-assertive");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("role")).toBe("alert");
  });

  it("reuses existing live region", () => {
    announce("first");
    announce("second");
    const regions = document.querySelectorAll("#wui-live-region-polite");
    expect(regions).toHaveLength(1);
  });
});
