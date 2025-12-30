import { parseISO, isBefore, startOfDay } from 'date-fns';

export interface TaskWithDates {
  date?: string;
  deadline?: string;
  completed: boolean;
}

export function isTaskOverdue(task: TaskWithDates): boolean {
  if (task.completed) return false;
  
  const now = new Date();
  const today = startOfDay(now);
  
  // Check if the task has a date that's before today
  if (task.date) {
    const taskDate = parseISO(task.date);
    const taskDay = startOfDay(taskDate);
    if (isBefore(taskDay, today)) {
      return true;
    }
  }
  
  // Check if the task has a deadline that's passed
  if (task.deadline) {
    const deadline = parseISO(task.deadline);
    if (isBefore(deadline, now)) {
      return true;
    }
  }
  
  return false;
}

export function getOverdueStatus(task: TaskWithDates): 'overdue' | 'due-soon' | 'normal' {
  if (task.completed) return 'normal';
  
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Check deadline first (more specific)
  if (task.deadline) {
    const deadline = parseISO(task.deadline);
    if (isBefore(deadline, now)) {
      return 'overdue';
    }
    if (isBefore(deadline, tomorrow)) {
      return 'due-soon';
    }
  }
  
  // Then check date
  if (task.date) {
    const taskDate = parseISO(task.date);
    const taskDay = startOfDay(taskDate);
    if (isBefore(taskDay, today)) {
      return 'overdue';
    }
    if (isBefore(taskDay, tomorrow)) {
      return 'due-soon';
    }
  }
  
  return 'normal';
}
