import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  children: ReactNode;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <ol ref={ref} className={cn("wui-timeline", className)} {...props}>
      {children}
    </ol>
  ),
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ title, description, time, className, ...props }, ref) => (
    <li ref={ref} className={cn("wui-timeline-item", className)} {...props}>
      <div className="wui-timeline-item__indicator">
        <div className="wui-timeline-item__dot" />
        <div className="wui-timeline-item__line" aria-hidden="true" />
      </div>
      <div className="wui-timeline-item__content">
        <div className="wui-timeline-item__title">{title}</div>
        {description && <div className="wui-timeline-item__description">{description}</div>}
        {time && <div className="wui-timeline-item__time">{time}</div>}
      </div>
    </li>
  ),
);
TimelineItem.displayName = "TimelineItem";
