import { addDays, addWeeks, addMonths, addYears, isAfter, isBefore, isEqual } from 'date-fns';

export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurringTaskConfig {
  isRecurring: boolean;
  pattern: RecurringPattern;
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for custom patterns
  dayOfMonth?: number; // 1-31 for monthly patterns
}

export function getNextDueDate(
  baseDate: Date,
  config: RecurringTaskConfig
): Date | null {
  if (!config.isRecurring || !config.pattern) return null;

  let nextDate: Date;

  switch (config.pattern) {
    case 'daily':
      nextDate = addDays(baseDate, config.interval);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, config.interval);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, config.interval);
      break;
    case 'yearly':
      nextDate = addYears(baseDate, config.interval);
      break;
    case 'custom':
      if (config.daysOfWeek && config.daysOfWeek.length > 0) {
        nextDate = getNextCustomDate(baseDate, config.daysOfWeek);
      } else {
        return null;
      }
      break;
    default:
      return null;
  }

  // Check if we've passed the end date
  if (config.endDate && isAfter(nextDate, config.endDate)) {
    return null;
  }

  return nextDate;
}

function getNextCustomDate(baseDate: Date, daysOfWeek: number[]): Date {
  const currentDate = new Date(baseDate);
  const currentDay = currentDate.getDay();
  
  // Find the next occurrence of any of the specified days
  let daysUntilNext = Infinity;
  for (const day of daysOfWeek) {
    let diff = day - currentDay;
    if (diff <= 0) {
      diff += 7; // Next week
    }
    daysUntilNext = Math.min(daysUntilNext, diff);
  }

  return addDays(currentDate, daysUntilNext);
}

export function generateRecurringInstances(
  baseTask: any,
  config: RecurringTaskConfig,
  startDate: Date,
  endDate: Date
): any[] {
  const instances: any[] = [];
  let currentDate = new Date(startDate);

  while (currentDate && isBefore(currentDate, endDate) && (!config.endDate || isBefore(currentDate, config.endDate))) {
    const instance = {
      ...baseTask,
      id: undefined, // Will be set by database
      parentRecurringTaskId: baseTask.id,
      date: Math.floor(currentDate.getTime() / 1000),
      completed: false,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    instances.push(instance);

    // Get next date
    const nextDate = getNextDueDate(currentDate, config);
    if (!nextDate) break;
    currentDate = nextDate;
  }

  return instances;
}

export function shouldCreateNewInstance(
  lastInstance: Date | null,
  config: RecurringTaskConfig,
  currentDate: Date = new Date()
): boolean {
  if (!config.isRecurring) return false;
  if (!lastInstance) return true;

  const nextDate = getNextDueDate(lastInstance, config);
  if (!nextDate) return false;

  return isBefore(nextDate, currentDate) || isEqual(nextDate, currentDate);
}

export function getRecurringPatternText(config: RecurringTaskConfig): string {
  if (!config.isRecurring) return '';

  const interval = config.interval;
  const pattern = config.pattern;

  switch (pattern) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    case 'weekly':
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    case 'monthly':
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;
    case 'yearly':
      return interval === 1 ? 'Yearly' : `Every ${interval} years`;
    case 'custom':
      if (config.daysOfWeek && config.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = config.daysOfWeek.map(day => dayNames[day]).join(', ');
        return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
      }
      return 'Custom';
    default:
      return '';
  }
}
