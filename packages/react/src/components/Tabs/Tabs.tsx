"use client";
import { forwardRef } from "react";
import {
  Tabs as HeadlessTabs,
  TabsList as HeadlessTabsList,
  TabsTrigger as HeadlessTabsTrigger,
  TabsContent as HeadlessTabsContent,
  type TabsProps as HeadlessTabsProps,
  type TabsListProps as HeadlessTabsListProps,
  type TabsTriggerProps as HeadlessTabsTriggerProps,
  type TabsContentProps as HeadlessTabsContentProps,
} from "@weiui/headless";
import { cn } from "../../utils/cn";

export interface TabsProps extends HeadlessTabsProps {}
export interface TabsListProps extends HeadlessTabsListProps {}
export interface TabsTriggerProps extends HeadlessTabsTriggerProps {}
export interface TabsContentProps extends HeadlessTabsContentProps {}

export function Tabs({ className, ...props }: TabsProps) {
  return <HeadlessTabs className={cn("wui-tabs", className)} {...props} />;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, _ref) => (
    <HeadlessTabsList className={cn("wui-tabs__list", className)} {...props} />
  ),
);
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, _ref) => (
    <HeadlessTabsTrigger className={cn("wui-tabs__trigger", className)} {...props} />
  ),
);
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, _ref) => (
    <HeadlessTabsContent className={cn("wui-tabs__content", className)} {...props} />
  ),
);
TabsContent.displayName = "TabsContent";
