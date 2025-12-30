import { tasks, lists, labels } from '@/lib/db/schema';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays, differenceInDays } from 'date-fns';

// Type definitions
type Task = typeof tasks.$inferSelect;
type List = typeof lists.$inferSelect;
type Label = typeof labels.$inferSelect;

export interface SmartSuggestion {
  id: string;
  type: 'scheduling' | 'priority' | 'productivity' | 'workload';
  title: string;
  description: string;
  action?: {
    label: string;
    taskIds?: number[];
    data?: any;
  };
  priority: 'low' | 'medium' | 'high';
}

export interface ProductivityInsight {
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface WorkloadAnalysis {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  estimatedTotalTime: number; // in minutes
  averageCompletionTime: number; // in minutes
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'overwhelming';
}

export function generateSmartSuggestions(
  tasks: Task[],
  lists: List[],
  labels: Label[]
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(addDays(today, 1));

  // Scheduling suggestions
  const unscheduledTasks = tasks.filter(task => !task.date && !task.completed);
  if (unscheduledTasks.length > 0) {
    suggestions.push({
      id: 'schedule-unscheduled',
      type: 'scheduling',
      title: 'Schedule Unscheduled Tasks',
      description: `You have ${unscheduledTasks.length} unscheduled tasks. Consider scheduling them to stay organized.`,
      action: {
        label: 'Review Tasks',
        taskIds: unscheduledTasks.map(t => t.id),
      },
      priority: 'medium',
    });
  }

  // Overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.date || task.completed) return false;
    return isBefore(new Date(task.date), today);
  });

  if (overdueTasks.length > 0) {
    suggestions.push({
      id: 'overdue-tasks',
      type: 'scheduling',
      title: 'Overdue Tasks Need Attention',
      description: `You have ${overdueTasks.length} overdue tasks that need immediate attention.`,
      action: {
        label: 'Review Overdue',
        taskIds: overdueTasks.map(t => t.id),
      },
      priority: 'high',
    });
  }

  // Priority suggestions
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'High' && !task.completed
  );

  if (highPriorityTasks.length > 3) {
    suggestions.push({
      id: 'too-many-high-priority',
      type: 'priority',
      title: 'Too Many High Priority Tasks',
      description: `You have ${highPriorityTasks.length} high priority tasks. Consider re-evaluating priorities to focus on what's most important.`,
      action: {
        label: 'Review Priorities',
        taskIds: highPriorityTasks.map(t => t.id),
      },
      priority: 'medium',
    });
  }

  // Workload suggestions
  const analysis = analyzeWorkload(tasks);
  if (analysis.workloadLevel === 'overwhelming') {
    suggestions.push({
      id: 'heavy-workload',
      type: 'workload',
      title: 'Heavy Workload Detected',
      description: `Your current workload is overwhelming. Consider breaking down large tasks or postponing non-urgent items.`,
      priority: 'high',
    });
  }

  // Productivity insights
  const insights = generateProductivityInsights(tasks);
  if (insights.some(i => i.trend === 'down')) {
    suggestions.push({
      id: 'productivity-down',
      type: 'productivity',
      title: 'Productivity Trending Down',
      description: 'Your task completion rate has decreased. Consider reviewing your workflow or taking breaks.',
      priority: 'medium',
    });
  }

  // Label-based suggestions
  const workTasks = tasks.filter(task => {
    // This would need to be implemented based on how labels are associated with tasks
    // For now, we'll skip this suggestion
    return false;
  });

  if (workTasks.length > 0 && isAfter(new Date(), endOfDay(today))) {
    suggestions.push({
      id: 'work-life-balance',
      type: 'productivity',
      title: 'Work-Life Balance Reminder',
      description: `You have ${workTasks.length} work-related tasks. Remember to maintain work-life balance.`,
      priority: 'low',
    });
  }

  // Time-based suggestions
  const tasksWithoutEstimate = tasks.filter(task => !task.estimate && !task.completed);
  if (tasksWithoutEstimate.length > 5) {
    suggestions.push({
      id: 'add-time-estimates',
      type: 'productivity',
      title: 'Add Time Estimates',
      description: `You have ${tasksWithoutEstimate.length} tasks without time estimates. Adding estimates helps with better planning.`,
      priority: 'low',
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

export function analyzeWorkload(tasks: Task[]): WorkloadAnalysis {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overdueTasks = tasks.filter(task => {
    if (!task.date || task.completed) return false;
    return isBefore(new Date(task.date), startOfDay(new Date()));
  }).length;

  const today = startOfDay(new Date());
  const weekFromNow = addDays(today, 7);
  const upcomingTasks = tasks.filter(task => {
    if (!task.date || task.completed) return false;
    const taskDate = new Date(task.date);
    return isAfter(taskDate, today) && isBefore(taskDate, weekFromNow);
  }).length;

  // Calculate estimated time
  const estimatedTotalTime = tasks.reduce((total, task) => {
    if (!task.estimate || task.completed) return total;
    // Parse estimate like "2h 30m" to minutes
    const hours = task.estimate.match(/(\d+)h/);
    const minutes = task.estimate.match(/(\d+)m/);
    let taskTime = 0;
    if (hours) taskTime += parseInt(hours[1]) * 60;
    if (minutes) taskTime += parseInt(minutes[1]);
    return total + taskTime;
  }, 0);

  // Calculate average completion time
  const completedTasksWithEstimate = tasks.filter(task => 
    task.completed && task.estimate && task.actualTime
  );
  
  const averageCompletionTime = completedTasksWithEstimate.length > 0
    ? completedTasksWithEstimate.reduce((total, task) => {
        // Parse actual time like "2h 30m" to minutes
        const hours = task.actualTime!.match(/(\d+)h/);
        const minutes = task.actualTime!.match(/(\d+)m/);
        let taskTime = 0;
        if (hours) taskTime += parseInt(hours[1]) * 60;
        if (minutes) taskTime += parseInt(minutes[1]);
        return total + taskTime;
      }, 0) / completedTasksWithEstimate.length
    : 0;

  // Determine workload level
  let workloadLevel: WorkloadAnalysis['workloadLevel'] = 'light';
  if (estimatedTotalTime > 2400) { // More than 40 hours
    workloadLevel = 'overwhelming';
  } else if (estimatedTotalTime > 1200) { // More than 20 hours
    workloadLevel = 'heavy';
  } else if (estimatedTotalTime > 600) { // More than 10 hours
    workloadLevel = 'moderate';
  }

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
    estimatedTotalTime,
    averageCompletionTime,
    workloadLevel,
  };
}

export function generateProductivityInsights(tasks: Task[]): ProductivityInsight[] {
  const insights: ProductivityInsight[] = [];
  const today = startOfDay(new Date());
  const lastWeek = addDays(today, -7);
  const twoWeeksAgo = addDays(today, -14);

  // Completion rate this week vs last week
  const thisWeekCompleted = tasks.filter(task => 
    task.completed && task.updatedAt && 
    isAfter(new Date(task.updatedAt), lastWeek)
  ).length;

  const lastWeekCompleted = tasks.filter(task => 
    task.completed && task.updatedAt && 
    isAfter(new Date(task.updatedAt), twoWeeksAgo) && 
    isBefore(new Date(task.updatedAt), lastWeek)
  ).length;

  insights.push({
    metric: 'Tasks Completed This Week',
    value: thisWeekCompleted,
    trend: thisWeekCompleted > lastWeekCompleted ? 'up' : 
            thisWeekCompleted < lastWeekCompleted ? 'down' : 'stable',
    description: `Completed ${thisWeekCompleted} tasks this week${lastWeekCompleted > 0 ? ` (vs ${lastWeekCompleted} last week)` : ''}`,
  });

  // Average tasks per day
  const daysWithCompletedTasks = new Set(
    tasks.filter(task => task.completed && task.updatedAt)
      .map(task => format(new Date(task.updatedAt!), 'yyyy-MM-dd'))
  ).size;

  const avgTasksPerDay = daysWithCompletedTasks > 0 ? thisWeekCompleted / 7 : 0;
  insights.push({
    metric: 'Average Tasks Per Day',
    value: avgTasksPerDay.toFixed(1),
    trend: 'stable',
    description: `You complete an average of ${avgTasksPerDay.toFixed(1)} tasks per day`,
  });

  // On-time completion rate
  const tasksWithDeadlines = tasks.filter(task => task.date && task.completed);
  const onTimeTasks = tasksWithDeadlines.filter(task => {
    if (!task.date || !task.updatedAt) return false;
    return isBefore(new Date(task.updatedAt), endOfDay(new Date(task.date)));
  });

  const onTimeRate = tasksWithDeadlines.length > 0 
    ? (onTimeTasks.length / tasksWithDeadlines.length) * 100 
    : 0;

  insights.push({
    metric: 'On-Time Completion Rate',
    value: `${onTimeRate.toFixed(0)}%`,
    trend: onTimeRate >= 80 ? 'up' : onTimeRate >= 60 ? 'stable' : 'down',
    description: `${onTimeRate.toFixed(0)}% of tasks with deadlines are completed on time`,
  });

  return insights;
}

export function suggestOptimalSchedule(
  tasks: Task[],
  availableHours: number = 8
): { suggestedTasks: Task[]; reasoning: string } {
  const unscheduledTasks = tasks.filter(task => !task.date && !task.completed);
  
  // Sort by priority and estimated time
  const prioritizedTasks = unscheduledTasks
    .filter(task => task.estimate)
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1, None: 0 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, prefer shorter tasks
      const aTime = parseTimeEstimate(a.estimate!);
      const bTime = parseTimeEstimate(b.estimate!);
      return aTime - bTime;
    });

  const suggestedTasks: Task[] = [];
  let totalMinutes = 0;
  const maxMinutes = availableHours * 60;

  for (const task of prioritizedTasks) {
    const taskMinutes = parseTimeEstimate(task.estimate!);
    if (totalMinutes + taskMinutes <= maxMinutes) {
      suggestedTasks.push(task);
      totalMinutes += taskMinutes;
    }
  }

  const reasoning = `Selected ${suggestedTasks.length} tasks totaling ${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m based on priority and time estimates.`;

  return { suggestedTasks, reasoning };
}

function parseTimeEstimate(estimate: string): number {
  const hours = estimate.match(/(\d+)h/);
  const minutes = estimate.match(/(\d+)m/);
  let totalMinutes = 0;
  if (hours) totalMinutes += parseInt(hours[1]) * 60;
  if (minutes) totalMinutes += parseInt(minutes[1]);
  return totalMinutes;
}
