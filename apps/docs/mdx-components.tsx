import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./src/components/mdx/CodeBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock {...props} />,
  };
}
