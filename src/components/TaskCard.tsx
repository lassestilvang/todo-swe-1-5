"use client";

import { useState } from "react";
import { Calendar, Clock, Flag, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SubtaskList } from "./SubtaskList";
import { PriorityBadge } from "./PriorityBadge";
import { LabelBadge } from "./LabelBadge";
import { useTaskContext } from "@/contexts/TaskContext";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    name: string;
    description?: string;
    date?: string;
    deadline?: string;
    estimate?: string;
    actualTime?: string;
    priority: "High" | "Medium" | "Low" | "None";
    completed: boolean;
    listId: string;
    createdAt: string;
    updatedAt: string;
    labels?: Array<{
      id: string;
      name: string;
      color: string;
      icon?: string;
    }>;
    subtasks?: Array<{
      id: string;
      name: string;
      completed: boolean;
      taskId: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  className?: string;
}

export function TaskCard({ task, className }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { actions } = useTaskContext();
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;

  const handleToggleTask = async () => {
    await actions.toggleTask(task.id);
  };

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 space-y-3 transition-all hover:shadow-md",
        task.completed && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={task.completed}
          className="mt-1"
          onCheckedChange={handleToggleTask}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "font-medium truncate",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.name}
            </h3>
            
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          {task.date && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{task.date}</span>
            </div>
          )}
          
          {task.estimate && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimate}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <LabelBadge
              key={label.id}
              name={label.name}
              color={label.color}
              icon={label.icon}
            />
          ))}
        </div>
      )}

      {/* Subtasks */}
      {hasSubtasks && (
        <div className="border-t pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span>Subtasks ({completedSubtasks}/{totalSubtasks})</span>
          </button>
          
          {isExpanded && (
            <div className="mt-3">
              <SubtaskList
                taskId={task.id}
                subtasks={task.subtasks}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
