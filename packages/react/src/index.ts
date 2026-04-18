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
export { Input, type InputProps, SearchInput, type SearchInputProps } from "./components/Input";
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
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  type AvatarProps,
  type AvatarGroupProps,
} from "./components/Avatar";
export { Code, type CodeProps } from "./components/Code";
export { Kbd } from "./components/Kbd";
export { Skeleton, type SkeletonProps } from "./components/Skeleton";
export { Alert, AlertTitle, AlertDescription, type AlertProps } from "./components/Alert";
export { Spinner, type SpinnerProps } from "./components/Spinner";
export { EmptyState, type EmptyStateProps } from "./components/EmptyState";

// Overlay components (re-exported from headless)
export {
  Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogTitle, DialogDescription, DialogClose,
  type DialogProps, type DialogTriggerProps, type DialogContentProps, type DialogOverlayProps,
  type DialogTitleProps, type DialogDescriptionProps, type DialogCloseProps, type DialogSize,
} from "./components/Dialog";
export {
  Tooltip, TooltipTrigger, TooltipContent, TooltipArrow, TooltipProvider,
  type TooltipProps, type TooltipTriggerProps, type TooltipContentProps,
  type TooltipArrowProps, type TooltipProviderProps,
} from "./components/Tooltip";
export {
  Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverArrow,
  type PopoverProps, type PopoverTriggerProps, type PopoverContentProps,
  type PopoverCloseProps, type PopoverArrowProps,
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
  MenuCheckboxItem, MenuRadioItem, MenuLabel,
  type MenuProps, type MenuTriggerProps, type MenuContentProps,
  type MenuItemProps, type MenuSeparatorProps,
  type MenuCheckboxItemProps, type MenuRadioItemProps, type MenuLabelProps,
} from "./components/Menu";
export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis, type BreadcrumbProps, type BreadcrumbItemProps, type BreadcrumbEllipsisProps } from "./components/Breadcrumb";
export { Link, type LinkProps } from "./components/Link";

// New components
export { Toaster, toast, addToast, updateToast, removeToast, getToasts, subscribe, type ToasterProps, type ToasterPosition, type ToastAction } from "./components/Toast";
export { Chip, type ChipProps } from "./components/Chip";
export { ProgressBar, type ProgressBarProps } from "./components/ProgressBar";

// Advanced input components
export { Slider, type SliderProps } from "./components/Slider";
export { Rating, type RatingProps } from "./components/Rating";
export { InputNumber, type InputNumberProps } from "./components/InputNumber";
export { InputOTP, type InputOTPProps } from "./components/InputOTP";
export { AutoComplete, type AutoCompleteProps } from "./components/AutoComplete";
export { MultiSelect, type MultiSelectProps } from "./components/MultiSelect";
export { FileUpload, type FileUploadProps } from "./components/FileUpload";
export { ColorPicker, type ColorPickerProps } from "./components/ColorPicker";

// Date components
export { Calendar, type CalendarProps } from "./components/Calendar";
export { DatePicker, type DatePickerProps } from "./components/DatePicker";

// Layout components - Sidebar + Drawer
export {
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem,
  SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarSubMenu,
  type SidebarProps, type SidebarItemProps, type SidebarTriggerProps,
  type SidebarGroupProps, type SidebarGroupLabelProps, type SidebarSubMenuProps,
} from "./components/Sidebar";
export {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerClose,
  type DrawerProps, type DrawerTriggerProps, type DrawerContentProps, type DrawerCloseProps,
} from "./components/Drawer";

// Progress + display components
export { Stepper, Step, StepSeparator, type StepperProps, type StepProps, type StepSeparatorProps } from "./components/Stepper";
export { Timeline, TimelineItem, type TimelineProps, type TimelineItemProps } from "./components/Timeline";

// Data components
// DataTable and Chart are exported from dedicated subpaths ("@weiui/react/data-table", "@weiui/react/chart")
// to keep the main barrel free of heavy deps (@tanstack/react-table, recharts).
export { TreeView, type TreeViewProps, type TreeNode } from "./components/TreeView";

// Editor is exported from "@weiui/react/editor" to keep Tiptap out of the main barrel.

// Command Palette
export { CommandPalette, type CommandPaletteProps, type CommandItem } from "./components/CommandPalette";

// Wave 2 components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, type AccordionProps, type AccordionItemProps, type AccordionTriggerProps, type AccordionContentProps } from "./components/Accordion";
export { Pagination, type PaginationProps } from "./components/Pagination";
export { Transfer, type TransferProps, type TransferItem } from "./components/Transfer";
export { Splitter, type SplitterProps, type SplitterSizes } from "./components/Splitter";

// Wave 3 components
export { AppBar, AppBarBrand, AppBarNav, AppBarLink, AppBarActions, type AppBarProps, type AppBarLinkProps } from "./components/AppBar";
export { BottomNav, BottomNavItem, type BottomNavProps, type BottomNavItemProps } from "./components/BottomNav";
export { SpeedDial, type SpeedDialProps, type SpeedDialAction, type SpeedDialDirection, type SpeedDialTrigger } from "./components/SpeedDial";
export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps } from "./components/ToggleGroup";
export { ButtonGroup, type ButtonGroupProps } from "./components/ButtonGroup";
