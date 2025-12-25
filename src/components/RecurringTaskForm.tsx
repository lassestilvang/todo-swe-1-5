"use client";

import { useState } from "react";
import { Calendar, Clock, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RecurringTaskConfig, RecurringPattern, getRecurringPatternText } from "@/lib/recurring-tasks";
import { format } from "date-fns";

interface RecurringTaskFormProps {
  config: RecurringTaskConfig;
  onConfigChange: (config: RecurringTaskConfig) => void;
  taskDate?: Date;
}

export function RecurringTaskForm({ config, onConfigChange, taskDate }: RecurringTaskFormProps) {
  const [showEndDate, setShowEndDate] = useState(!!config.endDate);

  const updateConfig = (updates: Partial<RecurringTaskConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const toggleRecurring = () => {
    if (config.isRecurring) {
      onConfigChange({
        isRecurring: false,
        pattern: 'daily',
        interval: 1,
        endDate: undefined,
        daysOfWeek: undefined,
        dayOfMonth: undefined,
      });
    } else {
      onConfigChange({
        isRecurring: true,
        pattern: 'daily',
        interval: 1,
        endDate: undefined,
        daysOfWeek: undefined,
        dayOfMonth: taskDate?.getDate() || 1,
      });
    }
  };

  const handlePatternChange = (pattern: RecurringPattern) => {
    const updates: Partial<RecurringTaskConfig> = { pattern };
    
    if (pattern === 'custom') {
      updates.daysOfWeek = taskDate ? [taskDate.getDay()] : [1]; // Default to Monday
    } else if (pattern === 'monthly') {
      updates.dayOfMonth = taskDate?.getDate() || 1;
    } else {
      updates.daysOfWeek = undefined;
      updates.dayOfMonth = undefined;
    }
    
    updateConfig(updates);
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = config.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    updateConfig({ daysOfWeek: newDays });
  };

  const weekDays = [
    { id: 0, name: 'S', label: 'Sunday' },
    { id: 1, name: 'M', label: 'Monday' },
    { id: 2, name: 'T', label: 'Tuesday' },
    { id: 3, name: 'W', label: 'Wednesday' },
    { id: 4, name: 'T', label: 'Thursday' },
    { id: 5, name: 'F', label: 'Friday' },
    { id: 6, name: 'S', label: 'Saturday' },
  ];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Repeat className="h-4 w-4" />
          <Label className="text-sm font-medium">Recurring Task</Label>
        </div>
        <Button
          type="button"
          variant={config.isRecurring ? "default" : "outline"}
          size="sm"
          onClick={toggleRecurring}
        >
          {config.isRecurring ? "Enabled" : "Disabled"}
        </Button>
      </div>

      {config.isRecurring && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Pattern</Label>
              <Select value={config.pattern} onValueChange={handlePatternChange}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label className="text-xs text-muted-foreground">Interval</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={config.interval}
                  onChange={(e) => updateConfig({ interval: parseInt(e.target.value) || 1 })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  {config.pattern === 'daily' ? 'day(s)' :
                   config.pattern === 'weekly' ? 'week(s)' :
                   config.pattern === 'monthly' ? 'month(s)' :
                   config.pattern === 'yearly' ? 'year(s)' : 'period(s)'}
                </span>
              </div>
            </div>
          </div>

          {config.pattern === 'monthly' && (
            <div>
              <Label className="text-xs text-muted-foreground">Day of Month</Label>
              <Select 
                value={config.dayOfMonth?.toString() || "1"} 
                onValueChange={(value) => updateConfig({ dayOfMonth: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.pattern === 'custom' && (
            <div>
              <Label className="text-xs text-muted-foreground">Days of Week</Label>
              <div className="flex space-x-2">
                {weekDays.map(day => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={config.daysOfWeek?.includes(day.id) ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => toggleDayOfWeek(day.id)}
                  >
                    {day.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-end-date"
              checked={showEndDate}
              onCheckedChange={(checked) => {
                setShowEndDate(checked as boolean);
                if (!checked) {
                  updateConfig({ endDate: undefined });
                }
              }}
            />
            <Label htmlFor="show-end-date" className="text-sm">
              End on specific date
            </Label>
          </div>

          {showEndDate && (
            <div>
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={config.endDate ? format(config.endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  updateConfig({ endDate: date });
                }}
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {getRecurringPatternText(config)}
          </div>
        </div>
      )}
    </div>
  );
}
