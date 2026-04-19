"use client";
import { createElement, type ReactNode } from "react";
import { renderComponent } from "../../playground/lib/render-component";
import type { ComponentNode } from "./tree";

export function renderTree(nodes: ComponentNode[]): ReactNode {
  return nodes.map((node) => renderWrapped(node));
}

function renderWrapped(node: ComponentNode): ReactNode {
  const renderedChildren: ReactNode =
    node.children.length > 0 ? renderTree(node.children) : node.text;
  const el = renderComponent(node.type, {
    ...node.props,
    children: renderedChildren,
  });
  // Wrap in a div with display:contents so it doesn't alter layout but is queryable via [data-composer-id].
  return createElement(
    "div",
    {
      key: node.id,
      "data-composer-id": node.id,
      style: { display: "contents" },
    },
    el,
  );
}
