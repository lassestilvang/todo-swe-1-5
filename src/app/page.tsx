"use client";

import { AppLayout } from "@/components/AppLayout";
import { TaskCard } from "@/components/TaskCard";

// Mock data for demonstration
const mockTasks = [
  {
    id: "1",
    name: "Complete project documentation",
    description: "Write comprehensive documentation for the new feature set",
    date: "Today",
    priority: "High" as const,
    completed: false,
    listName: "Work",
    labels: [
      { name: "documentation", color: "#3b82f6" },
      { name: "urgent", color: "#ef4444" }
    ]
  },
  {
    id: "2", 
    name: "Review pull requests",
    description: "Check and approve pending PRs from the team",
    date: "Today",
    priority: "Medium" as const,
    completed: false,
    listName: "Work",
    labels: [{ name: "code-review", color: "#10b981" }]
  },
  {
    id: "3",
    name: "Buy groceries",
    description: "Milk, eggs, bread, vegetables",
    date: "Today", 
    priority: "Low" as const,
    completed: false,
    listName: "Personal",
    labels: []
  },
  {
    id: "4",
    name: "Team meeting preparation",
    description: "Prepare slides and agenda for tomorrow's meeting",
    date: "Tomorrow",
    priority: "High" as const,
    completed: false,
    listName: "Work",
    labels: [{ name: "meeting", color: "#f59e0b" }]
  }
];

export default function Home() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Today</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {mockTasks.filter(t => !t.completed).length} tasks remaining
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {mockTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {mockTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks for today</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
