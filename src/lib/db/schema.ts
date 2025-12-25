import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Lists table
export const lists = sqliteTable("lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  emoji: text("emoji"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Tasks table
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  date: integer("date"), // Unix timestamp for date
  deadline: integer("deadline"), // Unix timestamp for datetime
  estimate: text("estimate"), // HH:mm format
  actualTime: text("actual_time"), // HH:mm format
  priority: text("priority").notNull().default("None"), // High, Medium, Low, None
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  listId: integer("list_id").references(() => lists.id),
  isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
  recurringPattern: text("recurring_pattern"), // daily, weekly, monthly, yearly, custom
  recurringInterval: integer("recurring_interval").notNull().default(1), // Every X days/weeks/months
  recurringEndDate: integer("recurring_end_date"), // Unix timestamp when recurrence stops
  recurringDaysOfWeek: text("recurring_days_of_week"), // JSON array for custom patterns
  recurringDayOfMonth: integer("recurring_day_of_month"), // For monthly patterns
  parentRecurringTaskId: integer("parent_recurring_task_id"), // References the original recurring task
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Labels table
export const labels = sqliteTable("labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Task Labels (Many-to-Many)
export const taskLabels = sqliteTable("task_labels", {
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  labelId: integer("label_id").references(() => labels.id).notNull(),
  createdAt: integer("created_at").notNull(),
});

// Subtasks table
export const subtasks = sqliteTable("subtasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Activity Log table
export const activityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  action: text("action").notNull(), // created, updated, deleted, completed
  details: text("details"), // JSON of changes
  timestamp: integer("timestamp").notNull(),
});

// Relations
export const listsRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  subtasks: many(subtasks),
  activityLog: many(activityLog),
  labels: many(taskLabels),
  parentRecurringTask: one(tasks, {
    fields: [tasks.parentRecurringTaskId],
    references: [tasks.id],
  }),
  recurringInstances: many(tasks),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  tasks: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  task: one(tasks, {
    fields: [activityLog.taskId],
    references: [tasks.id],
  }),
}));
