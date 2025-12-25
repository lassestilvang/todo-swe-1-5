"use client";

import { useState } from "react";
import { Plus, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubtaskListProps {
  taskId: string;
  subtasks?: Array<{
    id: string;
    name: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    order?: number; // Add order field for sorting
  }>;
  className?: string;
}

// Sortable subtask item component
function SortableSubtask({ 
  subtask, 
  onToggle, 
  onDelete 
}: {
  subtask: any;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={() => onToggle(subtask.id)}
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
        onClick={() => onDelete(subtask.id)}
        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function SubtaskList({ taskId, subtasks = [], className }: SubtaskListProps) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const { actions } = useTaskContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSubtask = async () => {
    if (newSubtaskName.trim()) {
      const newSubtask = {
        name: newSubtaskName.trim(),
        completed: false,
        taskId,
        order: subtasks.length, // Add at the end
      };
      
      await actions.createSubtask(newSubtask);
      setNewSubtaskName("");
      setIsAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    await actions.toggleSubtask(subtaskId);
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await actions.deleteSubtask(subtaskId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subtasks.findIndex((subtask) => subtask.id === active.id);
      const newIndex = subtasks.findIndex((subtask) => subtask.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
        
        // Update the order field for each subtask
        const updates = newSubtasks.map((subtask, index) => ({
          id: subtask.id,
          order: index,
        }));
        
        // Update each subtask's order
        for (const update of updates) {
          await actions.updateSubtask(update.id, { order: update.order });
        }
      }
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={subtasks.map(st => st.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <SortableSubtask
                key={subtask.id}
                subtask={subtask}
                onToggle={handleToggleSubtask}
                onDelete={handleDeleteSubtask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
