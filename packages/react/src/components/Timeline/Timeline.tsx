import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TimelineMode = "default" | "alternate" | "left" | "right";
export type TimelineItemColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  /** Timeline items — typically TimelineItem components. */
  children: ReactNode;
  /**
   * Layout mode.
   * - `default` (default): dots on the start side, content to the end.
   * - `alternate`: odd items on start, even items on end.
   * - `left`: all content on the end (dots on start).
   * - `right`: all content on the start (dots on end).
   */
  mode?: TimelineMode;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, children, mode = "default", ...props }, ref) => (
    <ol
      ref={ref}
      className={cn("civ-timeline", className)}
      data-mode={mode}
      {...props}
    >
      {children}
    </ol>
  ),
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "title"> {
  /** Primary title text of the item. */
  title: ReactNode;
  /** Secondary description text rendered below the title. */
  description?: ReactNode;
  /** Timestamp or time label rendered with the item. */
  time?: ReactNode;
  /** Color of the dot indicator. */
  color?: TimelineItemColor;
  /** Custom dot or icon — replaces the default dot. */
  dot?: ReactNode;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ title, description, time, color = "default", dot, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("civ-timeline-item", className)}
      data-color={color}
      {...props}
    >
      <div className="civ-timeline-item__indicator">
        {dot ? (
          <div className="civ-timeline-item__dot civ-timeline-item__dot--custom">{dot}</div>
        ) : (
          <div className="civ-timeline-item__dot" />
        )}
        <div className="civ-timeline-item__line" aria-hidden="true" />
      </div>
      <div className="civ-timeline-item__content">
        <div className="civ-timeline-item__title">{title}</div>
        {description && <div className="civ-timeline-item__description">{description}</div>}
        {time && <div className="civ-timeline-item__time">{time}</div>}
      </div>
    </li>
  ),
);
TimelineItem.displayName = "TimelineItem";
