"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  toast,
} from "@weiui/react";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className="wui-button wui-button--solid">
        Open Dialog
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
          <DialogClose className="wui-button wui-button--outline">
            Cancel
          </DialogClose>
          <DialogClose
            className="wui-button wui-button--solid wui-button--destructive"
            onClick={() => toast.success("Confirmed")}
          >
            Confirm
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
