"use client";

import { format } from "date-fns";
import { Clock, Edit, Trash2, Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  const sortedActivities = activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-4 w-4" />
        <h3 className="font-semibold">Activity Log</h3>
        <Badge variant="secondary" className="text-xs">
          {activities.length}
        </Badge>
      </div>

      <div className="h-64 overflow-y-auto">
        {sortedActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((activity) => (
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
