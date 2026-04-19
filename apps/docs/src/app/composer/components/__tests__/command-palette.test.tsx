import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  usePathname: () => "/composer",
}));

vi.mock("../../../../components/chrome/Header", () => ({
  Header: () => null,
}));

import ComposerPage from "../../page";

describe("Composer command palette", () => {
  it("Cmd+K opens the palette", async () => {
    const user = userEvent.setup();
    render(<ComposerPage />);
    await user.keyboard("{Meta>}k{/Meta}");
    expect(
      await screen.findByPlaceholderText(/Type a command/i),
    ).toBeInTheDocument();
  });
});
