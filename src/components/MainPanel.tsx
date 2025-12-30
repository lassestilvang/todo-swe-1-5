"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { TaskCard } from "./TaskCard";
import { FilterBar } from "./FilterBar";
import { NaturalLanguageTaskInput } from "./NaturalLanguageTaskInput";
import { useTaskContext } from "@/contexts/TaskContext";
import { useViewContext } from "@/contexts/ViewContext";
import { filterTasks } from "@/lib/task-filtering";
import { cn } from "@/lib/utils";

interface MainPanelProps {
  title?: string;
  view?: "today" | "week" | "upcoming" | "all";
}

export function MainPanel({ title = "All Tasks", view = "all" }: MainPanelProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { state: taskState, actions } = useTaskContext();
  const { state: viewState } = useViewContext();

  const filteredTasks = filterTasks(taskState.tasks, viewState);

  const handleCreateTask = async (taskData: any) => {
    await actions.createTask({
      ...taskData,
      completed: false,
      listId: taskData.listId || "inbox",
    });
    setIsTaskDialogOpen(false);
  };

  const handleNaturalLanguageTaskCreate = async (parsedTask: any) => {
    // Convert parsed task to the format expected by the API
    const taskData = {
      name: parsedTask.name,
      description: parsedTask.description,
      priority: parsedTask.priority || "None",
      date: parsedTask.date,
      deadline: parsedTask.deadline,
      estimate: parsedTask.estimate,
      listId: "inbox", // Default to inbox
      labels: parsedTask.labels || [],
      completed: false,
      isRecurring: !!parsedTask.recurringPattern,
      recurringPattern: parsedTask.recurringPattern,
      recurringInterval: parsedTask.recurringInterval || 1,
    };

    await actions.createTask(taskData);
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

      {/* Filter Bar */}
      <FilterBar />

      {/* Natural Language Task Input */}
      <div className="px-6 py-4 border-b">
        <NaturalLanguageTaskInput onTaskCreate={handleNaturalLanguageTaskCreate} />
      </div>

      {/* Task List */}
      <div className="p-6">
        {taskState.loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {viewState.searchQuery ? "No tasks found matching your search." : "No tasks found. Create your first task!"}
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
            lists={taskState.lists}
            labels={taskState.labels}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
