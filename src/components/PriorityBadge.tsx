"use client";

import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Priority = "High" | "Medium" | "Low" | "None";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig = {
  High: {
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    iconColor: "text-red-500",
  },
  Medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    iconColor: "text-yellow-500",
  },
  Low: {
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    iconColor: "text-blue-500",
  },
  None: {
    color: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700",
    iconColor: "text-gray-400",
  },
};

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  if (priority === "None") {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center space-x-1 font-medium",
        config.color,
        className
      )}
    >
      {showIcon && <Flag className={cn("h-3 w-3", config.iconColor)} />}
      <span>{priority}</span>
    </Badge>
  );
}
