"use client";

import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  name: string;
  color: string;
  icon?: string;
  className?: string;
  showIcon?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export function LabelBadge({ 
  name, 
  color, 
  icon, 
  className, 
  showIcon = true,
  removable = false,
  onRemove 
}: LabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center space-x-1 border-current",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {showIcon && (
        icon ? (
          <span className="text-xs">{icon}</span>
        ) : (
          <Tag className="h-3 w-3" />
        )
      )}
      <span className="text-sm font-medium">{name}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
