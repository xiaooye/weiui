"use client";

import { useState } from "react";
import { Alert, AlertTitle, AlertDescription, Button } from "@weiui/react";

export function AlertDismissibleDemo() {
  const [shown, setShown] = useState(true);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", width: "100%", maxWidth: 480 }}>
      {shown ? (
        <Alert
          variant="info"
          dismissible
          onDismiss={() => setShown(false)}
          action={<Button size="sm" variant="outline">Undo</Button>}
        >
          <div>
            <AlertTitle>Draft saved</AlertTitle>
            <AlertDescription>We autosaved your changes 12 seconds ago.</AlertDescription>
          </div>
        </Alert>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShown(true)}>
          Bring alert back
        </Button>
      )}
    </div>
  );
}
