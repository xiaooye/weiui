export const siteConfig = {
  name: "WeiUI",
  description: "An accessibility-first, layered design system with WCAG AAA enforcement",
  githubUrl: "https://github.com/xiaooye/weiui",
  version: "0.0.1",
  primaryNav: [
    { href: "/docs/getting-started", label: "Docs" },
    { href: "/docs/components", label: "Components" },
    { href: "/playground", label: "Playground" },
    { href: "/composer", label: "Composer" },
    { href: "/themes", label: "Themes" },
  ],
  sidebarGroups: [
    {
      title: "Getting Started",
      items: [
        { href: "/docs/getting-started", label: "Installation" },
        { href: "/docs/tokens", label: "Design Tokens" },
        { href: "/docs/css", label: "CSS Layer" },
        { href: "/docs/accessibility", label: "Accessibility" },
      ],
    },
    {
      title: "Components",
      items: [
        { href: "/docs/components", label: "Overview" },
        { href: "/docs/components/button", label: "Button" },
        { href: "/docs/components/input", label: "Input" },
        { href: "/docs/components/form", label: "Form Controls" },
        { href: "/docs/components/advanced-inputs", label: "Advanced Inputs" },
        { href: "/docs/components/date-time", label: "Date & Time" },
        { href: "/docs/components/layout", label: "Layout" },
        { href: "/docs/components/sidebar-drawer", label: "Sidebar & Drawer" },
        { href: "/docs/components/data-display", label: "Data Display" },
        { href: "/docs/components/data", label: "Data Components" },
        { href: "/docs/components/overlays", label: "Overlays" },
        { href: "/docs/components/feedback", label: "Feedback" },
        { href: "/docs/components/toast-chip-progress", label: "Toast & Chips" },
        { href: "/docs/components/stepper-timeline", label: "Stepper & Timeline" },
        { href: "/docs/components/navigation", label: "Navigation" },
        { href: "/docs/components/typography", label: "Typography" },
        { href: "/docs/components/editor", label: "Editor" },
        { href: "/docs/components/command-palette", label: "Command Palette" },
        { href: "/docs/components/accordion", label: "Accordion" },
        { href: "/docs/components/wave2-3", label: "More Components" },
      ],
    },
    {
      title: "Tools",
      items: [
        { href: "/playground", label: "Playground" },
        { href: "/composer", label: "Composer" },
        { href: "/themes", label: "Theme Builder" },
      ],
    },
  ],
} as const;

export type SidebarGroup = typeof siteConfig.sidebarGroups[number];
export type SidebarItem = SidebarGroup["items"][number];
