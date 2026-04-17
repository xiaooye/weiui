"use client";

import { useState } from "react";
import { Switch } from "@weiui/react";

export function SwitchDemo() {
  const [dark, setDark] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Switch
        label={`Dark mode (${dark ? "on" : "off"})`}
        checked={dark}
        onChange={(e) => setDark(e.target.checked)}
      />
      <Switch
        label={`Notifications (${notifications ? "on" : "off"})`}
        checked={notifications}
        onChange={(e) => setNotifications(e.target.checked)}
      />
      <Switch label="Disabled" disabled />
    </div>
  );
}
