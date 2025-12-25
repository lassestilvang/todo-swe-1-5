"use client";

import { ReactNode } from "react";

interface MainPanelProps {
  children: ReactNode;
  title?: string;
}

export function MainPanel({ children, title }: MainPanelProps) {
  return (
    <div className="flex-1 overflow-auto">
      {title && (
        <div className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
