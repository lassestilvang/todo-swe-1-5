"use client";

import { useState } from "react";
import { Calendar, Clock, Flag, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    name: string;
    description?: string;
    date?: string;
    deadline?: string;
    estimate?: string;
    priority: "High" | "Medium" | "Low" | "None";
    completed: boolean;
    listName?: string;
    labels?: Array<{ name: string; color: string }>;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const [isChecked, setIsChecked] = useState(task.completed);

  const priorityColors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    Low: "bg-green-100 text-green-800 border-green-200",
    None: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      isChecked && "opacity-60"
    )}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 p-0 h-5 w-5"
          onClick={() => setIsChecked(!isChecked)}
        >
          <div className={cn(
            "h-4 w-4 rounded border-2 flex items-center justify-center",
            isChecked 
              ? "bg-primary border-primary" 
              : "border-muted-foreground"
          )}>
            {isChecked && (
              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </Button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium truncate",
                isChecked && "line-through text-muted-foreground"
              )}>
                {task.name}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              {/* Metadata */}
              <div className="flex items-center space-x-4 mt-2">
                {task.date && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.date}
                  </div>
                )}
                {task.estimate && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.estimate}
                  </div>
                )}
                {task.listName && (
                  <div className="text-xs text-muted-foreground">
                    {task.listName}
                  </div>
                )}
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.labels.map((label) => (
                    <Badge
                      key={label.name}
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: label.color + '20', color: label.color }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {task.priority !== "None" && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", priorityColors[task.priority])}
                >
                  <Flag className="h-2 w-2 mr-1" />
                  {task.priority}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
