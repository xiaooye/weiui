"use client";

import { Timeline, TimelineItem } from "@weiui/react";

export function TimelineAlternateDemo() {
  return (
    <Timeline mode="alternate">
      <TimelineItem
        title="Pushed main"
        description="v1.3.0 deployed to production"
        time="2 hours ago"
        color="success"
      />
      <TimelineItem
        title="Merged PR #482"
        description="feat(react): Stepper clickable state"
        time="5 hours ago"
        color="info"
      />
      <TimelineItem
        title="Build failed"
        description="a11y-tests step exited 1"
        time="Yesterday"
        color="danger"
      />
      <TimelineItem
        title="Opened PR #481"
        description="docs: rewrite /feedback"
        time="2 days ago"
      />
    </Timeline>
  );
}
