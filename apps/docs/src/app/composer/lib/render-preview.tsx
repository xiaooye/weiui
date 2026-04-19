"use client";
import type { ReactNode } from "react";
import { renderComponent } from "../../playground/lib/render-component";
import type { ComponentNode } from "./tree";

export function renderTree(nodes: ComponentNode[]): ReactNode {
  return nodes.map((node) => renderNode(node));
}

function renderNode(node: ComponentNode): ReactNode {
  const renderedChildren: ReactNode =
    node.children.length > 0 ? renderTree(node.children) : node.text;
  return renderComponent(node.type, {
    key: node.id,
    ...node.props,
    children: renderedChildren,
  });
}
