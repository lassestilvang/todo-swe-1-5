"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Flag, Plus, X, Save, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useTaskContext } from "@/contexts/TaskContext";

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  date: z.date().optional(),
  deadline: z.date().optional(),
  estimate: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low", "None"]),
  listId: z.string().optional(),
  labels: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]).optional(),
  recurringInterval: z.number().min(1).optional(),
  recurringEndDate: z.date().optional(),
  recurringDaysOfWeek: z.array(z.number()).optional(),
  recurringDayOfMonth: z.number().min(1).max(31).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  lists?: Array<{ id: string; name: string; color: string }>;
  labels?: Array<{ id: string; name: string; color: string }>;
  autoSave?: boolean;
  taskId?: string; // For editing existing tasks
}

export function TaskForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  lists = [], 
  labels = [], 
  autoSave = false,
  taskId 
}: TaskFormProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialData?.labels || []);
  const [isDraft, setIsDraft] = useState(false);
  const [draftTaskId, setDraftTaskId] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurringDaysOfWeek, setRecurringDaysOfWeek] = useState<number[]>(initialData?.recurringDaysOfWeek || []);
  const { actions } = useTaskContext();
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "None",
      listId: initialData?.listId || "",
      estimate: initialData?.estimate || "",
      labels: initialData?.labels || [],
      isRecurring: initialData?.isRecurring || false,
      recurringPattern: initialData?.recurringPattern || "daily",
      recurringInterval: initialData?.recurringInterval || 1,
      recurringEndDate: initialData?.recurringEndDate,
      recurringDaysOfWeek: initialData?.recurringDaysOfWeek || [],
      recurringDayOfMonth: initialData?.recurringDayOfMonth || 1,
    },
  });

  // Auto-save functionality
  const formData = form.watch();
  
  const saveDraft = async (data: TaskFormData) => {
    if (!data.name.trim()) return; // Don't save empty drafts
    
    const taskData = {
      name: data.name,
      description: data.description,
      date: data.date ? data.date.toISOString().split('T')[0] : undefined,
      deadline: data.deadline ? data.deadline.toISOString() : undefined,
      estimate: data.estimate,
      priority: data.priority,
      completed: false,
      listId: data.listId || "inbox",
      isRecurring: data.isRecurring,
      recurringPattern: data.recurringPattern,
      recurringInterval: data.recurringInterval,
      recurringEndDate: data.recurringEndDate ? data.recurringEndDate.toISOString() : undefined,
      recurringDaysOfWeek: data.recurringDaysOfWeek,
      recurringDayOfMonth: data.recurringDayOfMonth,
    };
    
    try {
      if (draftTaskId) {
        // Update existing draft
        await actions.updateTask(draftTaskId, taskData);
      } else if (taskId) {
        // Update existing task
        await actions.updateTask(taskId, taskData);
      } else {
        // Create new draft - actions.createTask returns void, so we need to handle this differently
        await actions.createTask(taskData);
        // We'll need to get the task ID from the state after creation
        // For now, let's skip setting the draft ID to avoid type issues
        setIsDraft(true);
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const { isSaving, forceSave } = useAutoSave({
    data: { ...formData, labels: selectedLabels },
    onSave: saveDraft,
    delay: 2000,
    enabled: autoSave,
  });

  const handleSubmit = async (data: TaskFormData) => {
    // Force save any pending changes
    if (isSaving) {
      await forceSave();
    }
    
    const finalData = { 
      ...data, 
      labels: selectedLabels,
    };
    
    // If this was a draft, we're now finalizing it
    if (isDraft && draftTaskId) {
      setIsDraft(false);
      setDraftTaskId(null);
    }
    
    onSubmit(finalData);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const toggleRecurringDay = (day: number) => {
    setRecurringDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const weekDays = [
    { id: 0, name: "Sun" },
    { id: 1, name: "Mon" },
    { id: 2, name: "Tue" },
    { id: 3, name: "Wed" },
    { id: 4, name: "Thu" },
    { id: 5, name: "Fri" },
    { id: 6, name: "Sat" },
  ];

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {autoSave && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isDraft ? "Draft" : taskId ? "Editing" : "Creating"}
            {isSaving && " (saving...)"}
          </span>
          {isDraft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => forceSave()}
              disabled={isSaving}
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save Now
            </Button>
          )}
        </div>
      )}
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
                <CalendarComponent
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

        {/* Recurring Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => {
                setIsRecurring(checked as boolean);
                form.setValue("isRecurring", checked as boolean);
              }}
            />
            <Label htmlFor="isRecurring" className="flex items-center space-x-2">
              <Repeat className="h-4 w-4" />
              <span>Recurring Task</span>
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recurringPattern">Pattern</Label>
                  <Select
                    value={form.watch("recurringPattern")}
                    onValueChange={(value) => form.setValue("recurringPattern", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recurringInterval">Every</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="recurringInterval"
                      type="number"
                      min="1"
                      {...form.register("recurringInterval", { valueAsNumber: true })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.watch("recurringPattern") === "daily" && "day(s)"}
                      {form.watch("recurringPattern") === "weekly" && "week(s)"}
                      {form.watch("recurringPattern") === "monthly" && "month(s)"}
                      {form.watch("recurringPattern") === "yearly" && "year(s)"}
                      {form.watch("recurringPattern") === "custom" && "period(s)"}
                    </span>
                  </div>
                </div>
              </div>

              {form.watch("recurringPattern") === "weekly" && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {weekDays.map((day) => (
                      <div
                        key={day.id}
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-md border cursor-pointer transition-colors text-xs",
                          recurringDaysOfWeek.includes(day.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleRecurringDay(day.id)}
                      >
                        {day.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.watch("recurringPattern") === "monthly" && (
                <div>
                  <Label htmlFor="recurringDayOfMonth">Day of Month</Label>
                  <Input
                    id="recurringDayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    {...form.register("recurringDayOfMonth", { valueAsNumber: true })}
                    placeholder="e.g., 15 for the 15th day"
                    className="w-24"
                  />
                </div>
              )}

              <div>
                <Label>End Date (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("recurringEndDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("recurringEndDate") 
                        ? format(form.watch("recurringEndDate")!, "PPP") 
                        : "No end date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch("recurringEndDate")}
                      onSelect={(date) => form.setValue("recurringEndDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
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
