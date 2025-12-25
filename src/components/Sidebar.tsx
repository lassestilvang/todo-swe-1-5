"use client";

import { useState } from "react";
import { Menu, X, Plus, List, Tag, Calendar, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { icon: Inbox, label: "Inbox", count: 5 },
    { icon: Calendar, label: "Today", count: 3 },
    { icon: List, label: "Next 7 Days", count: 8 },
    { icon: Tag, label: "All Tasks", count: 16 },
  ];

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Task Planner</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-2">{item.label}</span>
                  {item.count > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Lists Section */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Lists</h3>
              <Button variant="ghost" size="sm">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start px-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span>Personal</span>
                <span className="ml-auto text-xs text-muted-foreground">4</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start px-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <span>Work</span>
                <span className="ml-auto text-xs text-muted-foreground">7</span>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Task</span>}
        </Button>
      </div>
    </div>
  );
}
