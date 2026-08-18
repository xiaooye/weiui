export type WeiAttributeValue = string | number | boolean | null | undefined;
export type WeiStyleValue = string | number | undefined;

/** Small event surface understood by the framework-neutral behavior layer. */
export interface WeiUIEvent {
  key?: string;
  currentTarget?: unknown;
  target?: unknown;
  defaultPrevented?: boolean;
  preventDefault?: () => void;
}

export type WeiEventHandler = (event: WeiUIEvent) => void;

/**
 * Framework-neutral semantic DOM contract. Adapters own event prop names and
 * framework-specific normalization.
 */
export interface WeiDOMProps {
  attributes?: Readonly<Record<string, WeiAttributeValue>>;
  listeners?: Readonly<Record<string, WeiEventHandler>>;
  style?: Readonly<Record<string, WeiStyleValue>>;
}

export interface SemanticPartOptions {
  state?: string;
  disabled?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: string;
  variant?: string;
}

export function semanticPart(
  component: string,
  part: string,
  options: SemanticPartOptions = {},
): Record<string, WeiAttributeValue> {
  const attributes: Record<string, WeiAttributeValue> = {
    "data-wui-component": component,
    "data-part": part,
  };
  if (options.state !== undefined) attributes["data-state"] = options.state;
  if (options.disabled) attributes["data-disabled"] = "";
  if (options.selected) attributes["data-selected"] = "";
  if (options.highlighted) attributes["data-highlighted"] = "";
  if (options.orientation !== undefined) attributes["data-orientation"] = options.orientation;
  if (options.size !== undefined) attributes["data-size"] = options.size;
  if (options.variant !== undefined) attributes["data-variant"] = options.variant;
  return attributes;
}

export function mergeDOMProps(...items: readonly WeiDOMProps[]): WeiDOMProps {
  const attributes: Record<string, WeiAttributeValue> = {};
  const listeners: Record<string, WeiEventHandler> = {};
  const style: Record<string, WeiStyleValue> = {};
  for (const item of items) {
    Object.assign(attributes, item.attributes);
    Object.assign(style, item.style);
    for (const [name, handler] of Object.entries(item.listeners ?? {})) {
      const previous = listeners[name];
      listeners[name] = previous
        ? (event) => {
            previous(event);
            if (!event.defaultPrevented) handler(event);
          }
        : handler;
    }
  }
  return {
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    listeners: Object.keys(listeners).length > 0 ? listeners : undefined,
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}
