"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { List } from "@/contexts/TaskContext";

interface DraggableListItemProps {
  list: List;
  isEditing: boolean;
  onEdit: (listId: string) => void;
  onUpdate: (listId: string, newName: string) => void;
  onDelete: (listId: string) => void;
  taskCount: number;
}

export function DraggableListItem({
  list,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  taskCount,
}: DraggableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <div className="group flex items-center px-2">
        <Input
          defaultValue={list.name}
          className="flex-1 h-8 text-sm"
          onBlur={(e) => onUpdate(list.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate(list.id, e.currentTarget.value);
            } else if (e.key === "Escape") {
              onEdit("");
            }
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center",
        isDragging && "opacity-50"
      )}
    >
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <Button variant="ghost" className="flex-1 justify-start px-2 h-8">
        <div
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: list.color }}
        />
        <span className="flex-1 text-left">{list.name}</span>
        <span className="text-xs text-muted-foreground">
          {taskCount}
        </span>
      </Button>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onEdit(list.id)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        {!list.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500"
            onClick={() => onDelete(list.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
