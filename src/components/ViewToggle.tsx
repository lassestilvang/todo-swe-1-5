"use client";

import { Calendar, ListTodo, Inbox, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewType = "today" | "week" | "upcoming" | "all";

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

const views = [
  { id: "today" as ViewType, label: "Today", icon: Calendar },
  { id: "week" as ViewType, label: "Week", icon: Clock },
  { id: "upcoming" as ViewType, label: "Upcoming", icon: Inbox },
  { id: "all" as ViewType, label: "All Tasks", icon: ListTodo },
];

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {views.map((view) => (
        <Button
          key={view.id}
          variant={currentView === view.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.id)}
          className="flex items-center space-x-2"
        >
          <view.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
