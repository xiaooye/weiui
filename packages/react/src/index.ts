// Provider
export { WeiUIProvider, useWeiUI, type WeiUIProviderProps, type WeiUILocale } from "./provider/WeiUIProvider";

// Typography
export { Heading, type HeadingProps } from "./components/Heading";
export { Text, type TextProps } from "./components/Text";
export { Label, type LabelProps } from "./components/Label";

// Utility
export { VisuallyHidden } from "./components/VisuallyHidden";
export { Portal, type PortalProps } from "./components/Portal";

// Form
export { Field, FieldLabel, FieldDescription, FieldControl, type FieldProps } from "./components/Field";

// Utils
export { cn } from "./utils/cn";

// Variants
export { buttonVariants, type ButtonVariants } from "./variants/button";

// Components
export { Button, type ButtonProps } from "./components/Button";
export { Input, type InputProps } from "./components/Input";
export { Textarea, type TextareaProps } from "./components/Textarea";

// Layout components
export { Container, type ContainerProps } from "./components/Container";
export { Stack, type StackProps } from "./components/Stack";
export { Grid, type GridProps } from "./components/Grid";
export { Divider, type DividerProps } from "./components/Divider";
export { Spacer } from "./components/Spacer";
export { AspectRatio, type AspectRatioProps } from "./components/AspectRatio";
export { Card, CardHeader, CardContent, CardFooter, type CardProps } from "./components/Card";
export { Badge, type BadgeProps } from "./components/Badge";
export { Avatar, AvatarImage, AvatarFallback, type AvatarProps } from "./components/Avatar";
export { Code, type CodeProps } from "./components/Code";
export { Kbd } from "./components/Kbd";
export { Skeleton, type SkeletonProps } from "./components/Skeleton";
export { Alert, AlertTitle, AlertDescription, type AlertProps } from "./components/Alert";
export { Spinner, type SpinnerProps } from "./components/Spinner";
export { EmptyState, type EmptyStateProps } from "./components/EmptyState";

// Overlay components (re-exported from headless)
export {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose,
  type DialogProps, type DialogTriggerProps, type DialogContentProps,
  type DialogTitleProps, type DialogDescriptionProps, type DialogCloseProps,
} from "./components/Dialog";
export {
  Tooltip, TooltipTrigger, TooltipContent,
  type TooltipProps, type TooltipTriggerProps, type TooltipContentProps,
} from "./components/Tooltip";
export {
  Popover, PopoverTrigger, PopoverContent, PopoverClose,
  type PopoverProps, type PopoverTriggerProps, type PopoverContentProps, type PopoverCloseProps,
} from "./components/Popover";

// Form selection components
export { Checkbox, type CheckboxProps } from "./components/Checkbox";
export { Switch, type SwitchProps } from "./components/Switch";
export { RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioGroupItemProps } from "./components/RadioGroup";

// Re-export headless Select for convenience
export {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  type SelectProps, type SelectTriggerProps, type SelectValueProps,
  type SelectContentProps, type SelectItemProps,
} from "@weiui/headless";

// Navigation
export {
  Tabs, TabsList, TabsTrigger, TabsContent,
  type TabsProps, type TabsListProps, type TabsTriggerProps, type TabsContentProps,
} from "./components/Tabs";
export {
  Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator,
} from "./components/Menu";
export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, type BreadcrumbProps, type BreadcrumbItemProps } from "./components/Breadcrumb";
export { Link, type LinkProps } from "./components/Link";

// New components
export { Toaster, toast, addToast, removeToast, getToasts, subscribe } from "./components/Toast";
export { Chip, type ChipProps } from "./components/Chip";
export { ProgressBar, type ProgressBarProps } from "./components/ProgressBar";
