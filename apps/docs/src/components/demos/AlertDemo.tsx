"use client";

import { Alert, AlertTitle, AlertDescription } from "@weiui/react";

export function AlertDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        width: "100%",
        maxWidth: "480px",
      }}
    >
      <Alert variant="info">
        <div>
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>This is an informational message.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="success">
        <div>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your changes have been saved.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="warning">
        <div>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This action cannot be undone.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="destructive">
        <div>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
