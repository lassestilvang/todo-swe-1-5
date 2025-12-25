"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";

interface SubtaskListProps {
  taskId: string;
  subtasks?: Array<{
    id: string;
    name: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  className?: string;
}

export function SubtaskList({ taskId, subtasks = [], className }: SubtaskListProps) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const { dispatch } = useTaskContext();

  const handleAddSubtask = () => {
    if (newSubtaskName.trim()) {
      const newSubtask = {
        id: Date.now().toString(),
        name: newSubtaskName.trim(),
        completed: false,
        taskId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Dispatch ADD_SUBTASK action (you'll need to add this to TaskContext)
      dispatch({ type: "ADD_SUBTASK", payload: newSubtask });
      setNewSubtaskName("");
      setIsAddingSubtask(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    // Dispatch TOGGLE_SUBTASK action
    dispatch({ type: "TOGGLE_SUBTASK", payload: subtaskId });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    // Dispatch DELETE_SUBTASK action
    dispatch({ type: "DELETE_SUBTASK", payload: subtaskId });
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtasks</span>
            <span>{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => handleToggleSubtask(subtask.id)}
            />
            <span
              className={cn(
                "flex-1 text-sm",
                subtask.completed && "line-through text-muted-foreground"
              )}
            >
              {subtask.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Subtask */}
      {isAddingSubtask ? (
        <div className="flex items-center space-x-2 p-2">
          <Input
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            placeholder="Enter subtask name..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSubtask();
              } else if (e.key === "Escape") {
                setIsAddingSubtask(false);
                setNewSubtaskName("");
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddSubtask}>
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtaskName("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingSubtask(true)}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3 mr-2" />
          Add subtask
        </Button>
      )}
    </div>
  );
}
