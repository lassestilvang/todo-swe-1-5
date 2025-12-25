"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ContextErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Context Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={cn(
          "p-4 bg-destructive/10 border border-destructive/20 rounded-lg",
          this.props.className
        )}>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Context Error: {this.state.error?.message || "Unknown error"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Some features may not work correctly. Try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
