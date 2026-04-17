"use client";

import { Timeline, TimelineItem } from "@weiui/react";

export function TimelineDemo() {
  return (
    <Timeline>
      <TimelineItem
        title="Application submitted"
        description="Your application was received"
        time="Jan 15, 2026"
      />
      <TimelineItem
        title="Under review"
        description="Currently being reviewed by our team"
        time="Jan 20, 2026"
      />
      <TimelineItem
        title="Interview scheduled"
        description="Video interview booked for next Tuesday"
        time="Jan 25, 2026"
      />
    </Timeline>
  );
}
