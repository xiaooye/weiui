"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  toast,
} from "@weiui/react";

export function CardDemo() {
  return (
    <Card style={{ maxWidth: "320px", width: "100%" }}>
      <CardHeader>
        <strong>Project update</strong>
      </CardHeader>
      <CardContent>
        <p
          style={{
            margin: 0,
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Your build finished in 3.2s. All 128 tests passed.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" onClick={() => toast.success("Deploying…")}>
          Deploy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Dismissed")}
        >
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
