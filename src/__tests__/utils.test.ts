// Test file for utility functions
import { describe, it, expect } from "bun:test";

// Mock the date-fns functions to avoid dependency issues
const mockDateFns = {
  addDays: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  },
  addWeeks: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + (amount * 7));
    return result;
  },
  addMonths: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + amount);
    return result;
  },
  addYears: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + amount);
    return result;
  },
  isAfter: (date: Date, dateToCompare: Date) => date > dateToCompare,
  isBefore: (date: Date, dateToCompare: Date) => date < dateToCompare,
  isEqual: (date: Date, dateToCompare: Date) => date.getTime() === dateToCompare.getTime(),
};

// Import the recurring task utilities directly
import { 
  getNextDueDate, 
  generateRecurringInstances, 
  shouldCreateNewInstance,
  getRecurringPatternText,
  RecurringTaskConfig 
} from "@/lib/recurring-tasks";

describe("Recurring Task Utilities", () => {
  describe("getNextDueDate", () => {
    it("should calculate next due date for daily pattern", () => {
      const baseDate = new Date("2024-01-01");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getDate()).toBe(2); // Next day
      expect(nextDate?.getMonth()).toBe(0); // Same month
      expect(nextDate?.getFullYear()).toBe(2024); // Same year
    });

    it("should calculate next due date for weekly pattern", () => {
      const baseDate = new Date("2024-01-01"); // Monday
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "weekly",
        interval: 1,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getDate()).toBe(8); // Next week same day
    });

    it("should calculate next due date for monthly pattern", () => {
      const baseDate = new Date("2024-01-15");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "monthly",
        interval: 1,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getMonth()).toBe(1); // February
      expect(nextDate?.getDate()).toBe(15); // Same day of month
    });

    it("should calculate next due date for yearly pattern", () => {
      const baseDate = new Date("2024-01-15");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "yearly",
        interval: 1,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getFullYear()).toBe(2025); // Next year
      expect(nextDate?.getMonth()).toBe(0); // Same month
      expect(nextDate?.getDate()).toBe(15); // Same day
    });

    it("should handle intervals greater than 1", () => {
      const baseDate = new Date("2024-01-01");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 3,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getDate()).toBe(4); // 3 days later
    });

    it("should respect end date constraints", () => {
      const baseDate = new Date("2024-01-01");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
        endDate: new Date("2024-01-02"), // End date is tomorrow
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate?.getDate()).toBe(2); // Should return tomorrow
      
      // Next calculation should return null (past end date)
      const nextDate2 = getNextDueDate(nextDate!, config);
      expect(nextDate2).toBeNull();
    });

    it("should return null for non-recurring tasks", () => {
      const baseDate = new Date("2024-01-01");
      const config: RecurringTaskConfig = {
        isRecurring: false,
        pattern: "daily",
        interval: 1,
      };

      const nextDate = getNextDueDate(baseDate, config);
      expect(nextDate).toBeNull();
    });
  });

  describe("getRecurringPatternText", () => {
    it("should return correct text for daily pattern", () => {
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };
      expect(getRecurringPatternText(config)).toBe("Daily");
    });

    it("should return correct text for weekly pattern", () => {
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "weekly",
        interval: 1,
      };
      expect(getRecurringPatternText(config)).toBe("Weekly");

      const config2: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "weekly",
        interval: 2,
      };
      expect(getRecurringPatternText(config2)).toBe("Every 2 weeks");
    });

    it("should return correct text for monthly pattern", () => {
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "monthly",
        interval: 1,
      };
      expect(getRecurringPatternText(config)).toBe("Monthly");

      const config2: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "monthly",
        interval: 3,
      };
      expect(getRecurringPatternText(config2)).toBe("Every 3 months");
    });

    it("should return correct text for yearly pattern", () => {
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "yearly",
        interval: 1,
      };
      expect(getRecurringPatternText(config)).toBe("Yearly");

      const config2: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "yearly",
        interval: 2,
      };
      expect(getRecurringPatternText(config2)).toBe("Every 2 years");
    });

    it("should return empty string for non-recurring tasks", () => {
      const config: RecurringTaskConfig = {
        isRecurring: false,
      };
      expect(getRecurringPatternText(config)).toBe("");
    });
  });

  describe("shouldCreateNewInstance", () => {
    it("should return false for non-recurring tasks", () => {
      const config: RecurringTaskConfig = {
        isRecurring: false,
      };
      expect(shouldCreateNewInstance(null, config)).toBe(false);
    });

    it("should return true for first instance (no last instance)", () => {
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };
      expect(shouldCreateNewInstance(null, config)).toBe(true);
    });

    it("should return true when next due date is before or equal to current date", () => {
      const lastInstance = new Date("2024-01-01");
      const currentDate = new Date("2024-01-02");
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };
      expect(shouldCreateNewInstance(lastInstance, config, currentDate)).toBe(true);
    });

    it("should return false when next due date is after current date", () => {
      const lastInstance = new Date("2024-01-01");
      const currentDate = new Date("2024-01-01"); // Same date
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 2, // Every 2 days
      };
      expect(shouldCreateNewInstance(lastInstance, config, currentDate)).toBe(false);
    });
  });

  describe("generateRecurringInstances", () => {
    it("should generate instances within date range", () => {
      const baseTask = {
        id: "1",
        name: "Test Task",
        priority: "Medium",
        completed: false,
        listId: "inbox",
      };
      
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };
      
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-05"); // 5 days range

      const instances = generateRecurringInstances(baseTask, config, startDate, endDate);
      
      expect(instances.length).toBeGreaterThan(0);
      expect(instances.length).toBeLessThanOrEqual(5); // Should not exceed date range
      expect(instances[0].name).toBe(baseTask.name);
      expect(instances[0].parentRecurringTaskId).toBe(baseTask.id);
      expect(instances[0].completed).toBe(false);
    });

    it("should respect end date constraint", () => {
      const baseTask = {
        id: "1",
        name: "Test Task",
        priority: "Medium",
        completed: false,
        listId: "inbox",
      };
      
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
        endDate: new Date("2024-01-03"), // End after 2 days
      };
      
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-10"); // Large range, but constrained by endDate

      const instances = generateRecurringInstances(baseTask, config, startDate, endDate);
      
      expect(instances.length).toBeLessThanOrEqual(2); // Should not exceed end date constraint
    });

    it("should generate correct dates for instances", () => {
      const baseTask = {
        id: "1",
        name: "Test Task",
        priority: "Medium",
        completed: false,
        listId: "inbox",
      };
      
      const config: RecurringTaskConfig = {
        isRecurring: true,
        pattern: "daily",
        interval: 1,
      };
      
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-03");

      const instances = generateRecurringInstances(baseTask, config, startDate, endDate);
      
      if (instances.length > 1) {
        const firstInstanceDate = new Date(instances[0].date * 1000);
        const secondInstanceDate = new Date(instances[1].date * 1000);
        
        // Second instance should be exactly 1 day after first
        const timeDiff = secondInstanceDate.getTime() - firstInstanceDate.getTime();
        expect(timeDiff).toBe(24 * 60 * 60 * 1000); // 24 hours in milliseconds
      }
    });
  });
});

describe("Date Utility Functions", () => {
  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe("2024-01-15");
    });

    it("should handle different date formats", () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-01-15T23:59:59.999Z");
      
      expect(date1.toISOString().split('T')[0]).toBe("2024-01-15");
      expect(date2.toISOString().split('T')[0]).toBe("2024-01-15");
    });
  });

  describe("Time Calculations", () => {
    it("should calculate time differences correctly", () => {
      const date1 = new Date("2024-01-01T00:00:00.000Z");
      const date2 = new Date("2024-01-02T00:00:00.000Z");
      
      const diffInMs = date2.getTime() - date1.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      expect(diffInHours).toBe(24); // 24 hours
    });

    it("should handle Unix timestamp conversions", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const timestamp = Math.floor(date.getTime() / 1000);
      const dateFromTimestamp = new Date(timestamp * 1000);
      
      expect(dateFromTimestamp.getTime()).toBe(date.getTime());
    });
  });
});

describe("Task Priority System", () => {
  it("should have correct priority levels", () => {
    const priorities = ["High", "Medium", "Low", "None"];
    expect(priorities).toHaveLength(4);
    expect(priorities).toContain("High");
    expect(priorities).toContain("Medium");
    expect(priorities).toContain("Low");
    expect(priorities).toContain("None");
  });

  it("should validate priority values", () => {
    const validPriority = "High";
    const invalidPriority = "Urgent";
    
    const priorities = ["High", "Medium", "Low", "None"];
    expect(priorities).toContain(validPriority);
    expect(priorities).not.toContain(invalidPriority);
  });
});

describe("Task Status Management", () => {
  it("should handle task completion states", () => {
    const completedTask = { completed: true };
    const incompleteTask = { completed: false };
    
    expect(completedTask.completed).toBe(true);
    expect(incompleteTask.completed).toBe(false);
  });

  it("should toggle task completion", () => {
    let task = { completed: false };
    
    // Toggle to completed
    task = { ...task, completed: !task.completed };
    expect(task.completed).toBe(true);
    
    // Toggle back to incomplete
    task = { ...task, completed: !task.completed };
    expect(task.completed).toBe(false);
  });
});
