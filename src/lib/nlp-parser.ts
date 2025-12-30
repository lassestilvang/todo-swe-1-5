import { parse, isValid, setHours, setMinutes, startOfDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';

// Types matching the database schema
export type TaskPriority = "High" | "Medium" | "Low" | "None";
export type RecurringPattern = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface ParsedTask {
  name: string;
  description?: string;
  date?: Date;
  deadline?: Date;
  estimate?: string;
  priority?: TaskPriority;
  labels?: string[];
  recurringPattern?: RecurringPattern;
  recurringInterval?: number;
}

interface ParseResult {
  success: boolean;
  task?: ParsedTask;
  error?: string;
}

// Common time patterns
const TIME_PATTERNS = [
  { regex: /at\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i, extract: extract24HourTime },
  { regex: /at\s*(\d{1,2})\s*(am|pm)/i, extract: extract12HourTime },
  { regex: /(\d{1,2}):(\d{2})\s*(am|pm)?/i, extract: extract24HourTime },
  { regex: /(\d{1,2})\s*(am|pm)/i, extract: extract12HourTime },
  { regex: /noon/i, extract: () => 12 * 60 },
  { regex: /midnight/i, extract: () => 0 },
  { regex: /morning/i, extract: () => 9 * 60 },
  { regex: /afternoon/i, extract: () => 14 * 60 },
  { regex: /evening/i, extract: () => 18 * 60 },
];

// Date patterns
const DATE_PATTERNS = [
  { regex: /today/i, extract: () => startOfDay(new Date()) },
  { regex: /tomorrow/i, extract: () => startOfDay(addDays(new Date(), 1)) },
  { regex: /yesterday/i, extract: () => startOfDay(addDays(new Date(), -1)) },
  { regex: /next week/i, extract: () => startOfDay(addWeeks(new Date(), 1)) },
  { regex: /next month/i, extract: () => startOfDay(addMonths(new Date(), 1)) },
  { regex: /next year/i, extract: () => startOfDay(addYears(new Date(), 1)) },
  { regex: /monday|mon/i, extract: getNextWeekday, weekday: 1 },
  { regex: /tuesday|tue/i, extract: getNextWeekday, weekday: 2 },
  { regex: /wednesday|wed/i, extract: getNextWeekday, weekday: 3 },
  { regex: /thursday|thu/i, extract: getNextWeekday, weekday: 4 },
  { regex: /friday|fri/i, extract: getNextWeekday, weekday: 5 },
  { regex: /saturday|sat/i, extract: getNextWeekday, weekday: 6 },
  { regex: /sunday|sun/i, extract: getNextWeekday, weekday: 0 },
  { regex: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, extract: extractSlashDate },
  { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, extract: extractISODate },
];

// Priority patterns
const PRIORITY_PATTERNS = [
  { regex: /urgent|asap|critical|emergency/i, priority: 'High' as TaskPriority },
  { regex: /important|high/i, priority: 'High' as TaskPriority },
  { regex: /medium|moderate|normal/i, priority: 'Medium' as TaskPriority },
  { regex: /low|minor|casual/i, priority: 'Low' as TaskPriority },
];

// Estimate patterns
const ESTIMATE_PATTERNS = [
  { regex: /(\d+)\s*h(?:ours?)?/i, extract: (fullMatch: string, hours: string, _: string = '') => `${hours}h` },
  { regex: /(\d+)\s*m(?:inutes?)?/i, extract: (fullMatch: string, minutes: string, _: string = '') => `${minutes}m` },
  { regex: /(\d+)\s*h\s*(\d+)\s*m?/i, extract: (fullMatch: string, h: string, m: string) => fullMatch },
];

// Recurring patterns
const RECURRING_PATTERNS = [
  { regex: /daily|every day/i, pattern: 'daily' as RecurringPattern, interval: 1 },
  { regex: /weekly|every week/i, pattern: 'weekly' as RecurringPattern, interval: 1 },
  { regex: /monthly|every month/i, pattern: 'monthly' as RecurringPattern, interval: 1 },
  { regex: /yearly|every year|annually/i, pattern: 'yearly' as RecurringPattern, interval: 1 },
  { regex: /every (\d+) days?/i, extract: (fullMatch: string, interval: string) => ({ pattern: 'daily' as RecurringPattern, interval: parseInt(interval) }) },
  { regex: /every (\d+) weeks?/i, extract: (fullMatch: string, interval: string) => ({ pattern: 'weekly' as RecurringPattern, interval: parseInt(interval) }) },
  { regex: /every (\d+) months?/i, extract: (fullMatch: string, interval: string) => ({ pattern: 'monthly' as RecurringPattern, interval: parseInt(interval) }) },
];

export function parseNaturalLanguageInput(input: string): ParseResult {
  try {
    const cleanedInput = input.trim();
    if (!cleanedInput) {
      return { success: false, error: 'Empty input' };
    }

    const task: ParsedTask = {
      name: cleanedInput,
    };

    let remainingText = cleanedInput;

    // Extract labels (hashtags)
    const labelMatches = remainingText.match(/#\w+/g);
    if (labelMatches) {
      task.labels = labelMatches.map(label => label.slice(1));
      remainingText = remainingText.replace(/#\w+/g, '').trim();
    }

    // Extract time
    let timeMinutes: number | undefined;
    for (const pattern of TIME_PATTERNS) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        timeMinutes = pattern.extract(match);
        remainingText = remainingText.replace(pattern.regex, '').trim();
        break;
      }
    }

    // Extract date
    let taskDate: Date | undefined;
    for (const pattern of DATE_PATTERNS) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        taskDate = pattern.extract(match, (pattern as any).weekday);
        remainingText = remainingText.replace(pattern.regex, '').trim();
        break;
      }
    }

    // Combine date and time
    if (taskDate && timeMinutes !== undefined) {
      taskDate = setMinutes(setHours(taskDate, Math.floor(timeMinutes / 60)), timeMinutes % 60);
      task.date = taskDate;
    } else if (taskDate) {
      task.date = taskDate;
    } else if (timeMinutes !== undefined) {
      // If time but no date, assume today
      const today = new Date();
      task.deadline = setMinutes(setHours(today, Math.floor(timeMinutes / 60)), timeMinutes % 60);
    }

    // Extract priority
    for (const pattern of PRIORITY_PATTERNS) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        task.priority = pattern.priority;
        remainingText = remainingText.replace(pattern.regex, '').trim();
        break;
      }
    }

    // Extract estimate
    for (const pattern of ESTIMATE_PATTERNS) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        // For complex patterns (1h 30m), use the full match
        if (match.length === 3) {
          task.estimate = pattern.extract(match[0], match[1], match[2]);
        } else {
          task.estimate = pattern.extract(match[0], match[1], '');
        }
        remainingText = remainingText.replace(pattern.regex, '').trim();
        break;
      }
    }

    // Extract recurring pattern
    for (const pattern of RECURRING_PATTERNS) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        if (pattern.extract) {
          const result = pattern.extract(match[0], match[1]);
          task.recurringPattern = result.pattern;
          task.recurringInterval = result.interval;
        } else {
          task.recurringPattern = pattern.pattern;
          task.recurringInterval = pattern.interval;
        }
        remainingText = remainingText.replace(pattern.regex, '').trim();
        break;
      }
    }

    // Clean up the task name
    task.name = remainingText.replace(/\s+/g, ' ').trim();
    
    // Extract description (anything after a dash or colon)
    const descMatch = task.name.match(/^(.+?)\s*[-:]\s*(.+)$/);
    if (descMatch) {
      task.name = descMatch[1].trim();
      task.description = descMatch[2].trim();
    }

    return { success: true, task };
  } catch (error) {
    return { success: false, error: 'Failed to parse input' };
  }
}

// Helper functions
function extract24HourTime(match: RegExpMatchArray): number {
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3]?.toLowerCase();
  
  if (period === 'pm' && hours < 12) return (hours + 12) * 60 + minutes;
  if (period === 'am' && hours === 12) return minutes;
  return hours * 60 + minutes;
}

function extract12HourTime(match: RegExpMatchArray): number {
  const hours = parseInt(match[1]);
  const period = match[2].toLowerCase();
  
  if (period === 'pm' && hours < 12) return (hours + 12) * 60;
  if (period === 'am' && hours === 12) return 0;
  return hours * 60;
}

function getNextWeekday(match: RegExpMatchArray, weekday: number): Date {
  const date = new Date();
  const currentDay = date.getDay();
  const daysUntilTarget = (weekday - currentDay + 7) % 7;
  return startOfDay(addDays(date, daysUntilTarget || 7)); // If today, go to next week
}

function extractSlashDate(match: RegExpMatchArray): Date {
  const month = parseInt(match[1]) - 1;
  const day = parseInt(match[2]);
  const year = parseInt(match[3]);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month, day);
}

function extractISODate(match: RegExpMatchArray): Date {
  const year = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);
  return new Date(year, month, day);
}

// Utility function to get suggestions for natural language input
export function getNaturalLanguageSuggestions(input: string): string[] {
  const suggestions: string[] = [];
  const lowerInput = input.toLowerCase();

  if (lowerInput.length < 3) return suggestions;

  // Time suggestions
  if (!lowerInput.match(/\d+:\d+/) && !lowerInput.match(/(am|pm)/i)) {
    suggestions.push('Add time: "2 PM", "14:30", "morning"');
  }

  // Date suggestions
  if (!lowerInput.match(/(today|tomorrow|next|mon|tue|wed|thu|fri|sat|sun)/i)) {
    suggestions.push('Add date: "today", "tomorrow", "Monday", "next week"');
  }

  // Priority suggestions
  if (!lowerInput.match(/(urgent|important|high|medium|low)/i)) {
    suggestions.push('Add priority: "urgent", "important", "low priority"');
  }

  // Label suggestions
  if (!lowerInput.includes('#')) {
    suggestions.push('Add labels: "#work", "#personal", "#urgent"');
  }

  // Estimate suggestions
  if (!lowerInput.match(/\d+\s*[hm]/i)) {
    suggestions.push('Add estimate: "2h", "30m", "1h 30m"');
  }

  // Recurring suggestions
  if (!lowerInput.match(/(daily|weekly|monthly|every)/i)) {
    suggestions.push('Add recurring: "daily", "weekly", "every 2 weeks"');
  }

  return suggestions;
}
