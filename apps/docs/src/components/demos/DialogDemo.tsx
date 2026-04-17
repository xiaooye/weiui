"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
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
          <Button variant="solid" color="destructive">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
