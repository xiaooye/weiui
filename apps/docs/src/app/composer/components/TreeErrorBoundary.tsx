"use client";
import { Component, type ReactNode } from "react";
import { EmptyState, Button } from "@weiui/react";

interface State {
  error: Error | null;
  key: number;
}

export class TreeErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, key: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.warn("Composer render error:", error);
  }

  reset = () => {
    this.setState((s) => ({ error: null, key: s.key + 1 }));
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <EmptyState
          size="sm"
          title="This component failed to render"
          description={this.state.error.message}
          action={
            <Button size="sm" variant="outline" onClick={this.reset}>
              Retry
            </Button>
          }
        />
      );
    }
    return <div key={this.state.key}>{this.props.children}</div>;
  }
}
