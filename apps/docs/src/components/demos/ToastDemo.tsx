"use client";

import { toast, Button } from "@weiui/react";

export function ToastDemo() {
  return (
    <div style={{ display: "flex", gap: "var(--wui-spacing-2)", flexWrap: "wrap" }}>
      <Button variant="soft" onClick={() => toast("Default toast")}>
        Default
      </Button>
      <Button variant="soft" onClick={() => toast.success("Saved!")}>
        Success
      </Button>
      <Button variant="soft" onClick={() => toast.error("Something failed")}>
        Error
      </Button>
      <Button variant="soft" onClick={() => toast.warning("Heads up")}>
        Warning
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast("Undo?", {
            action: { label: "Undo", onClick: () => toast.success("Undone") },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast.promise(
            new Promise<string>((resolve, reject) => {
              setTimeout(
                () => (Math.random() > 0.2 ? resolve("saved") : reject(new Error("Network error"))),
                1500,
              );
            }),
            {
              loading: "Saving…",
              success: "Saved successfully",
              error: (e) => (e as Error).message,
            },
          )
        }
      >
        Promise
      </Button>
    </div>
  );
}
