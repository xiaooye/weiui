import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../FileUpload";

describe("FileUpload", () => {
  it("fires onError when file exceeds maxSize", async () => {
    const onError = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload maxSize={10} onError={onError} />);
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const tooBig = new File(["x".repeat(100)], "big.txt", { type: "text/plain" });
    await user.upload(input, tooBig);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "size",
        file: expect.objectContaining({ name: "big.txt" }),
      }),
    );
  });

  it("fires onError when file type is not accepted", async () => {
    const onError = vi.fn();
    const user = userEvent.setup({ applyAccept: false });
    render(<FileUpload accept="image/*" onError={onError} />);
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const wrongType = new File(["x"], "doc.pdf", { type: "application/pdf" });
    await user.upload(input, wrongType);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "type" }),
    );
  });
});
