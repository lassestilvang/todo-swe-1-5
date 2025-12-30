import { Task } from "@/contexts/TaskContext";
import { ViewState } from "@/contexts/ViewContext";
import { parseISO, isAfter, isBefore, startOfDay, endOfDay, isEqual } from "date-fns";

export function filterTasks(tasks: Task[], viewState: ViewState): Task[] {
  return tasks.filter(task => {
    // Search filter
    if (viewState.searchQuery) {
      const searchLower = viewState.searchQuery.toLowerCase();
      const matchesSearch = task.name.toLowerCase().includes(searchLower) ||
                           (task.description && task.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Completed filter
    if (!viewState.showCompleted && task.completed) return false;

    // List filter
    if (viewState.selectedListId && task.listId !== viewState.selectedListId) return false;

    // Label filter
    if (viewState.selectedLabelIds.length > 0) {
      const taskLabelIds = task.labels?.map(label => label.id) || [];
      const hasMatchingLabel = viewState.selectedLabelIds.some((labelId: string) => 
        taskLabelIds.includes(labelId)
      );
      if (!hasMatchingLabel) return false;
    }

    // Priority filter
    if (viewState.priorityFilter.length > 0 && !viewState.priorityFilter.includes(task.priority)) {
      return false;
    }

    // Date range filter
    if (viewState.dateRangeFilter.startDate || viewState.dateRangeFilter.endDate) {
      const taskDate = task.date ? parseISO(task.date) : null;
      const taskDeadline = task.deadline ? parseISO(task.deadline) : null;
      
      // Use the earliest of task date or deadline for filtering
      const relevantDate = taskDate && taskDeadline 
        ? (taskDate < taskDeadline ? taskDate : taskDeadline)
        : taskDate || taskDeadline;

      if (!relevantDate) return false; // No date to filter by

      if (viewState.dateRangeFilter.startDate) {
        const startDate = startOfDay(parseISO(viewState.dateRangeFilter.startDate));
        if (isBefore(relevantDate, startDate)) return false;
      }

      if (viewState.dateRangeFilter.endDate) {
        const endDate = endOfDay(parseISO(viewState.dateRangeFilter.endDate));
        if (isAfter(relevantDate, endDate)) return false;
      }
    }

    // View-based filtering (today, week, upcoming, all)
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (viewState.currentView) {
      case "today":
        if (task.date) {
          const taskDate = startOfDay(parseISO(task.date));
          return isEqual(taskDate, today);
        }
        return false;
      case "week":
        if (task.date) {
          const taskDate = parseISO(task.date);
          return (taskDate >= today && taskDate <= nextWeek) || isEqual(taskDate, today);
        }
        return false;
      case "upcoming":
        if (task.date) {
          const taskDate = startOfDay(parseISO(task.date));
          return isAfter(taskDate, today);
        }
        return false;
      case "all":
      default:
        return true;
    }
  });
}
