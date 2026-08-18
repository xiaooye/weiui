"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  toast,
} from "civaria";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className="civ-button civ-button--solid">
        Open Dialog
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
          <DialogClose className="civ-button civ-button--outline">
            Cancel
          </DialogClose>
          <DialogClose
            className="civ-button civ-button--solid civ-button--destructive"
            onClick={() => toast.success("Confirmed")}
          >
            Confirm
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
