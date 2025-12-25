"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Flag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  date: z.date().optional(),
  deadline: z.date().optional(),
  estimate: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low", "None"]),
  listId: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  lists?: Array<{ id: string; name: string; color: string }>;
  labels?: Array<{ id: string; name: string; color: string }>;
}

export function TaskForm({ onSubmit, onCancel, initialData, lists = [], labels = [] }: TaskFormProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialData?.labels || []);
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "None",
      listId: initialData?.listId || "",
      estimate: initialData?.estimate || "",
      labels: initialData?.labels || [],
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    onSubmit({ ...data, labels: selectedLabels });
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Task Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter task name"
            className={cn(form.formState.errors.name && "border-red-500")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Add task description (optional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date") ? format(form.watch("date")!, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => form.setValue("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="deadline">Deadline Time</Label>
            <Input
              id="deadline"
              type="time"
              {...form.register("deadline")}
              placeholder="Set deadline time"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">
                  <div className="flex items-center space-x-2">
                    <Flag className="h-4 w-4 text-red-500" />
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center space-x-2">
                    <Flag className="h-4 w-4 text-yellow-500" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="Low">
                  <div className="flex items-center space-x-2">
                    <Flag className="h-4 w-4 text-blue-500" />
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="None">
                  <div className="flex items-center space-x-2">
                    <Flag className="h-4 w-4 text-gray-400" />
                    <span>None</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimate">Time Estimate</Label>
            <Input
              id="estimate"
              {...form.register("estimate")}
              placeholder="e.g., 2h 30m"
              className="font-mono"
            />
          </div>
        </div>

        {lists.length > 0 && (
          <div>
            <Label htmlFor="listId">List</Label>
            <Select
              value={form.watch("listId")}
              onValueChange={(value) => form.setValue("listId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                      <span>{list.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {labels.length > 0 && (
          <div>
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className={cn(
                    "flex items-center space-x-1 px-2 py-1 rounded-md border cursor-pointer transition-colors",
                    selectedLabels.includes(label.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => toggleLabel(label.id)}
                >
                  <Checkbox
                    checked={selectedLabels.includes(label.id)}
                    onChange={() => {}}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(handleSubmit)}>
          {initialData ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </div>
  );
}
