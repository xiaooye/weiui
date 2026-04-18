import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("fires onChange with accepted files", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload onChange={onChange} />);
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const file = new File(["abc"], "ok.txt", { type: "text/plain" });
    await user.upload(input, file);
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "ok.txt" })]);
  });

  it("renders hint text when provided", () => {
    render(<FileUpload hint="PNG or JPG, up to 5MB" />);
    expect(screen.getByText("PNG or JPG, up to 5MB")).toBeInTheDocument();
  });

  it("sets data-disabled when disabled", () => {
    const { container } = render(<FileUpload disabled />);
    const dropzone = container.querySelector(".wui-file-upload");
    expect(dropzone).toHaveAttribute("data-disabled");
    expect(dropzone).toHaveAttribute("tabindex", "-1");
  });

  it("shows drag-over state on dragOver", () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector(".wui-file-upload")!;
    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveAttribute("data-dragover");
    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveAttribute("data-dragover");
  });

  it("fires onError when dropping more than maxFiles", () => {
    const onError = vi.fn();
    const { container } = render(<FileUpload multiple maxFiles={1} onError={onError} />);
    const dropzone = container.querySelector(".wui-file-upload")!;
    const fileA = new File(["a"], "a.txt", { type: "text/plain" });
    const fileB = new File(["b"], "b.txt", { type: "text/plain" });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [fileA, fileB] },
    });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "count" }),
    );
  });
});
