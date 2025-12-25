"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TaskCard } from "@/components/TaskCard";
import { ViewToggle } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskForm";
import { useTaskContext } from "@/contexts/TaskContext";
import { useViewContext } from "@/contexts/ViewContext";

// Define TaskFormData interface locally since it's not exported
interface TaskFormData {
  name: string;
  description?: string;
  date?: Date;
  deadline?: Date;
  estimate?: string;
  priority: "High" | "Medium" | "Low" | "None";
  listId?: string;
  labels?: string[];
}

export default function Home() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const { state: taskState, dispatch } = useTaskContext();
  const { state: viewState, dispatch: viewDispatch } = useViewContext();

  // Filter tasks based on current view
  const getFilteredTasks = () => {
    const tasks = taskState.tasks.filter(task => !task.completed);
    
    switch (viewState.currentView) {
      case "today":
        // Filter tasks for today (simplified - you'd implement actual date filtering)
        return tasks.filter(task => task.date === "Today");
      case "week":
        // Filter tasks for this week
        return tasks.filter(task => task.date === "Today" || task.date === "Tomorrow");
      case "upcoming":
        // Filter tasks with dates
        return tasks.filter(task => task.date);
      case "all":
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const handleTaskSubmit = (data: TaskFormData) => {
    // Convert form data to task format and dispatch to context
    const newTask = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      date: data.date?.toISOString().split('T')[0], // Format as YYYY-MM-DD
      deadline: data.deadline?.toISOString(),
      estimate: data.estimate,
      priority: data.priority,
      completed: false,
      listId: data.listId || "default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels: data.labels ? taskState.labels.filter(label => data.labels!.includes(label.id)) : [],
    };

    // Dispatch ADD_TASK action
    dispatch({ type: "ADD_TASK", payload: newTask });
    setIsTaskFormOpen(false);
  };

  const handleViewChange = (view: string) => {
    viewDispatch({ type: "SET_VIEW", payload: view as any });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold capitalize">{viewState.currentView}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTasks.length} tasks remaining
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ViewToggle 
              currentView={viewState.currentView}
              onViewChange={handleViewChange}
            />
            <Button onClick={() => setIsTaskFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks for this view</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsTaskFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first task
              </Button>
            </div>
          )}
        </div>

        {/* Task Form Dialog */}
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleTaskSubmit}
              onCancel={() => setIsTaskFormOpen(false)}
              lists={taskState.lists}
              labels={taskState.labels}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
