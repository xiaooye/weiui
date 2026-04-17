"use client";

import { useState } from "react";
import { FileUpload } from "@weiui/react";

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "360px",
      }}
    >
      <FileUpload
        accept="image/*"
        multiple
        maxSize={5 * 1024 * 1024}
        onChange={setFiles}
        label="Click or drag images here"
        hint="PNG, JPG up to 5MB"
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {files.length > 0
          ? `${files.length} file(s) ready to upload`
          : "Drop files above to see them listed."}
      </p>
    </div>
  );
}
