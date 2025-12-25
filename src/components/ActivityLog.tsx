"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Clock, Edit, Trash2, Check, Plus, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ActivityLog } from "@/contexts/TaskContext";

interface ActivityLogProps {
  activities: ActivityLog[];
  className?: string;
}

const actionIcons = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: Check,
};

const actionColors = {
  created: "text-green-600 bg-green-50 dark:bg-green-900/20",
  updated: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  deleted: "text-red-600 bg-red-50 dark:bg-red-900/20",
  completed: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
};

export function ActivityLogViewer({ activities, className }: ActivityLogProps) {
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by action type
    if (selectedAction !== "all") {
      filtered = filtered.filter(activity => activity.action === selectedAction);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= today
      );
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= weekAgo
      );
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= monthAgo
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activities, selectedAction, dateRange]);

  const clearFilters = () => {
    setSelectedAction("all");
    setDateRange("all");
  };

  const hasActiveFilters = selectedAction !== "all" || dateRange !== "all";

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
  };

  const getActionDescription = (activity: ActivityLog) => {
    const Icon = actionIcons[activity.action];
    const colorClass = actionColors[activity.action];

    return (
      <div className="flex items-center space-x-2">
        <div className={cn("p-1 rounded-full", colorClass)}>
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-sm font-medium capitalize">{activity.action}</span>
      </div>
    );
  };

  const formatDetails = (details?: string) => {
    if (!details) return null;
    
    try {
      const parsed = JSON.parse(details);
      return (
        <div className="text-xs text-muted-foreground mt-1">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <span className="font-medium capitalize">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <div className="text-xs text-muted-foreground mt-1">{details}</div>;
    }
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <h3 className="font-semibold">Activity Log</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredActivities.length}
            {hasActiveFilters && ` / ${activities.length}`}
          </Badge>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-4 p-2 bg-muted/30 rounded-md">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-64 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {hasActiveFilters ? "No activities match filters" : "No activity yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                {getActionDescription(activity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      Task {activity.taskId}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  {formatDetails(activity.details)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
