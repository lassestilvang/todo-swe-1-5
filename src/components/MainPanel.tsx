"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { TaskCard } from "./TaskCard";
import { useTaskContext } from "@/contexts/TaskContext";
import { cn } from "@/lib/utils";

interface MainPanelProps {
  title?: string;
  view?: "today" | "week" | "upcoming" | "all";
}

export function MainPanel({ title = "All Tasks", view = "all" }: MainPanelProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state, actions } = useTaskContext();

  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (view) {
      case "today":
        if (task.date) {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        }
        return false;
      case "week":
        if (task.date) {
          const taskDate = new Date(task.date);
          return taskDate >= today && taskDate <= nextWeek;
        }
        return false;
      case "upcoming":
        if (task.date) {
          const taskDate = new Date(task.date);
          return taskDate > today;
        }
        return false;
      case "all":
      default:
        return true;
    }
  });

  const handleCreateTask = async (taskData: any) => {
    await actions.createTask({
      ...taskData,
      completed: false,
      listId: taskData.listId || "inbox",
    });
    setIsTaskDialogOpen(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Button onClick={() => setIsTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        {state.loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No tasks found matching your search." : "No tasks found. Create your first task!"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setIsTaskDialogOpen(false)}
            lists={state.lists}
            labels={state.labels}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
