import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { addToast, removeToast, getToasts, subscribe } from "../toast-store";
import { toast } from "../toast-store";
import { Toaster } from "../Toaster";

// Reset store state between tests
function clearToasts() {
  getToasts().forEach((t) => removeToast(t.id));
}

describe("toast-store", () => {
  beforeEach(() => {
    clearToasts();
  });

  it("addToast adds to the store", () => {
    addToast({ title: "Hello", variant: "default" });
    expect(getToasts()).toHaveLength(1);
    expect(getToasts()[0].title).toBe("Hello");
  });

  it("removeToast removes from store", () => {
    const id = addToast({ title: "Hello", variant: "default" });
    removeToast(id);
    expect(getToasts()).toHaveLength(0);
  });

  it("subscribe notifies listeners on add", () => {
    const listener = vi.fn();
    const unsub = subscribe(listener);
    addToast({ title: "Hello", variant: "default" });
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("subscribe returns an unsubscribe function", () => {
    const listener = vi.fn();
    const unsub = subscribe(listener);
    unsub();
    addToast({ title: "Hello", variant: "default" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("toast.success sets variant to success", () => {
    toast.success("Done");
    const toasts = getToasts();
    expect(toasts[toasts.length - 1].variant).toBe("success");
  });

  it("toast.error sets variant to destructive", () => {
    toast.error("Failed");
    const toasts = getToasts();
    expect(toasts[toasts.length - 1].variant).toBe("destructive");
  });

  it("toast.warning sets variant to warning", () => {
    toast.warning("Be careful");
    const toasts = getToasts();
    expect(toasts[toasts.length - 1].variant).toBe("warning");
  });

  it("defaults duration to 5000", () => {
    addToast({ title: "Hello", variant: "default" });
    const toasts = getToasts();
    expect(toasts[toasts.length - 1].duration).toBe(5000);
  });
});

describe("Toaster", () => {
  beforeEach(() => {
    clearToasts();
  });

  it("renders toast items with role=alert", () => {
    act(() => {
      addToast({ title: "Test toast", variant: "default" });
    });
    render(<Toaster />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Test toast")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    act(() => {
      addToast({ title: "Hello", description: "A description", variant: "default" });
    });
    render(<Toaster />);
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("renders close button with aria-label", () => {
    act(() => {
      addToast({ title: "Hello", variant: "default" });
    });
    render(<Toaster />);
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });

  it("auto-dismisses after duration", async () => {
    vi.useFakeTimers();
    act(() => {
      addToast({ title: "Auto dismiss", variant: "default", duration: 1000 });
    });
    render(<Toaster />);
    expect(screen.getByText("Auto dismiss")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Auto dismiss")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders action button when action option set, fires onClick and dismisses", async () => {
    const onClick = vi.fn();
    act(() => {
      addToast({
        title: "Saved",
        variant: "default",
        action: { label: "Undo", onClick },
      });
    });
    render(<Toaster />);
    const btn = screen.getByRole("button", { name: "Undo" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("wui-toast__action");
    act(() => {
      btn.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("applies position modifier class on Toaster root", () => {
    render(<Toaster position="top-left" />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass("wui-toaster--top-left");
    expect(region).toHaveAttribute("data-position", "top-left");
  });

  it("defaults to bottom-right position", () => {
    render(<Toaster />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass("wui-toaster--bottom-right");
  });
});
