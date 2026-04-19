import loginForm from "./login-form.json";
import settingsPage from "./settings-page.json";
import dashboardCard from "./dashboard-card.json";
import pricingGrid from "./pricing-grid.json";
import emptyState from "./empty-state.json";
import type { ComponentNode } from "../tree";

export interface Template {
  id: string;
  label: string;
  description: string;
  tree: ComponentNode[];
}

export const TEMPLATES: Template[] = [
  {
    id: "login",
    label: "Login form",
    description: "Card with heading, two fields, submit button",
    tree: loginForm as ComponentNode[],
  },
  {
    id: "settings",
    label: "Settings page",
    description: "Fields + cancel/save footer",
    tree: settingsPage as ComponentNode[],
  },
  {
    id: "dashboard",
    label: "Dashboard card",
    description: "KPI card with progress + chips",
    tree: dashboardCard as ComponentNode[],
  },
  {
    id: "pricing",
    label: "Pricing grid",
    description: "3-column card grid",
    tree: pricingGrid as ComponentNode[],
  },
  {
    id: "empty",
    label: "Empty state",
    description: "Centered prompt with CTA",
    tree: emptyState as ComponentNode[],
  },
];
