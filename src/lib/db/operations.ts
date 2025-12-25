import { db, schema } from "./index";
import { eq, and, desc, asc, like } from "drizzle-orm";
import type { Task, List, Label, Subtask, ActivityLog } from "@/contexts/TaskContext";

// Convert database records to app format
const convertTask = (task: any): Task => ({
  id: task.id.toString(),
  name: task.name,
  description: task.description || undefined,
  date: task.date ? new Date(task.date * 1000).toISOString().split('T')[0] : undefined,
  deadline: task.deadline ? new Date(task.deadline * 1000).toISOString() : undefined,
  estimate: task.estimate || undefined,
  actualTime: task.actual_time || undefined,
  priority: task.priority as "High" | "Medium" | "Low" | "None",
  completed: !!task.completed,
  listId: task.listId?.toString() || "inbox",
  createdAt: new Date(task.createdAt * 1000).toISOString(),
  updatedAt: new Date(task.updatedAt * 1000).toISOString(),
});

const convertList = (list: any): List => ({
  id: list.id.toString(),
  name: list.name,
  color: list.color,
  emoji: list.emoji || undefined,
  isDefault: !!list.isDefault,
  order: list.order || 0,
  createdAt: new Date(list.createdAt * 1000).toISOString(),
  updatedAt: new Date(list.updatedAt * 1000).toISOString(),
});

const convertLabel = (label: any): Label => ({
  id: label.id.toString(),
  name: label.name,
  color: label.color,
  icon: label.icon || undefined,
  createdAt: new Date(label.createdAt * 1000).toISOString(),
  updatedAt: new Date(label.updatedAt * 1000).toISOString(),
});

const convertSubtask = (subtask: any): Subtask => ({
  id: subtask.id.toString(),
  name: subtask.name,
  completed: !!subtask.completed,
  taskId: subtask.taskId.toString(),
  order: subtask.order || 0,
  createdAt: new Date(subtask.createdAt * 1000).toISOString(),
  updatedAt: new Date(subtask.updatedAt * 1000).toISOString(),
});

const convertActivityLog = (log: any): ActivityLog => ({
  id: log.id.toString(),
  taskId: log.taskId.toString(),
  action: log.action as "created" | "updated" | "deleted" | "completed",
  details: log.details || undefined,
  timestamp: new Date(log.timestamp * 1000).toISOString(),
});

// LISTS CRUD
export const listsOps = {
  getAll: async (): Promise<List[]> => {
    const result = await db.select().from(schema.lists)
      .orderBy(asc(schema.lists.order));
    return result.map(convertList);
  },

  create: async (data: Omit<List, "id" | "createdAt" | "updatedAt">): Promise<List> => {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.insert(schema.lists).values({
      name: data.name,
      color: data.color,
      emoji: data.emoji,
      isDefault: data.isDefault,
      order: data.order,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return convertList(result[0]);
  },

  update: async (id: string, data: Partial<List>): Promise<List> => {
    const now = Math.floor(Date.now() / 1000);
    const updateData: any = { updatedAt: now };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.order !== undefined) updateData.order = data.order;
    
    const result = await db.update(schema.lists)
      .set(updateData)
      .where(eq(schema.lists.id, parseInt(id)))
      .returning();
    return convertList(result[0]);
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(schema.lists).where(eq(schema.lists.id, parseInt(id)));
  },

  reorder: async (listIds: string[]): Promise<void> => {
    const updates = listIds.map((listId, index) => 
      db.update(schema.lists)
        .set({ order: index, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(schema.lists.id, parseInt(listId)))
    );
    await Promise.all(updates);
  },
};

// TASKS CRUD
export const tasksOps = {
  getAll: async (): Promise<Task[]> => {
    const result = await db.select().from(schema.tasks)
      .orderBy(desc(schema.tasks.createdAt));
    return result.map(convertTask);
  },

  getById: async (id: string): Promise<Task | null> => {
    const result = await db.select().from(schema.tasks)
      .where(eq(schema.tasks.id, parseInt(id)));
    return result.length > 0 ? convertTask(result[0]) : null;
  },

  create: async (data: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.insert(schema.tasks).values({
      name: data.name,
      description: data.description || null,
      date: data.date ? Math.floor(new Date(data.date).getTime() / 1000) : null,
      deadline: data.deadline ? Math.floor(new Date(data.deadline).getTime() / 1000) : null,
      estimate: data.estimate || null,
      actualTime: data.actualTime || null,
      priority: data.priority,
      completed: data.completed,
      listId: data.listId === "inbox" ? null : parseInt(data.listId),
      createdAt: now,
      updatedAt: now,
    }).returning();
    
    const task = convertTask(result[0]);
    
    // Log activity
    await activityLogsOps.create({
      taskId: task.id,
      action: "created",
      details: JSON.stringify({ name: data.name }),
    });
    
    return task;
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const now = Math.floor(Date.now() / 1000);
    const updateData: any = { updatedAt: now };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = data.date ? Math.floor(new Date(data.date).getTime() / 1000) : null;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? Math.floor(new Date(data.deadline).getTime() / 1000) : null;
    if (data.estimate !== undefined) updateData.estimate = data.estimate;
    if (data.actualTime !== undefined) updateData.actualTime = data.actualTime;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.listId !== undefined) updateData.listId = data.listId === "inbox" ? null : parseInt(data.listId);
    
    const result = await db.update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, parseInt(id)))
      .returning();
    
    const task = convertTask(result[0]);
    
    // Log activity
    await activityLogsOps.create({
      taskId: task.id,
      action: "updated",
      details: JSON.stringify(data),
    });
    
    return task;
  },

  delete: async (id: string): Promise<void> => {
    // Log activity before deletion
    const task = await tasksOps.getById(id);
    if (task) {
      await activityLogsOps.create({
        taskId: task.id,
        action: "deleted",
        details: JSON.stringify({ name: task.name }),
      });
    }
    
    await db.delete(schema.tasks).where(eq(schema.tasks.id, parseInt(id)));
  },

  toggle: async (id: string): Promise<Task> => {
    const task = await tasksOps.getById(id);
    if (!task) throw new Error("Task not found");
    
    const updated = await tasksOps.update(id, { completed: !task.completed });
    
    // Log completion
    await activityLogsOps.create({
      taskId: updated.id,
      action: "completed",
      details: JSON.stringify({ completed: updated.completed }),
    });
    
    return updated;
  },
};

// LABELS CRUD
export const labelsOps = {
  getAll: async (): Promise<Label[]> => {
    const result = await db.select().from(schema.labels);
    return result.map(convertLabel);
  },

  create: async (data: Omit<Label, "id" | "createdAt" | "updatedAt">): Promise<Label> => {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.insert(schema.labels).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return convertLabel(result[0]);
  },

  update: async (id: string, data: Partial<Label>): Promise<Label> => {
    const now = Math.floor(Date.now() / 1000);
    const updateData: any = { updatedAt: now };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    
    const result = await db.update(schema.labels)
      .set(updateData)
      .where(eq(schema.labels.id, parseInt(id)))
      .returning();
    return convertLabel(result[0]);
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(schema.labels).where(eq(schema.labels.id, parseInt(id)));
  },
};

// SUBTASKS CRUD
export const subtasksOps = {
  getByTaskId: async (taskId: string): Promise<Subtask[]> => {
    const result = await db.select().from(schema.subtasks)
      .where(eq(schema.subtasks.taskId, parseInt(taskId)))
      .orderBy(asc(schema.subtasks.order));
    return result.map(convertSubtask);
  },

  create: async (data: Omit<Subtask, "id" | "createdAt" | "updatedAt">): Promise<Subtask> => {
    const now = Math.floor(Date.now() / 1000);
    // Get the highest order for this task
    const existingSubtasks = await db.select().from(schema.subtasks)
      .where(eq(schema.subtasks.taskId, parseInt(data.taskId)));
    const maxOrder = existingSubtasks.length > 0 
      ? Math.max(...existingSubtasks.map(st => st.order || 0))
      : -1;
    
    const result = await db.insert(schema.subtasks).values({
      name: data.name,
      completed: data.completed,
      taskId: parseInt(data.taskId),
      order: data.order !== undefined ? data.order : maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return convertSubtask(result[0]);
  },

  update: async (id: string, data: Partial<Subtask>): Promise<Subtask> => {
    const now = Math.floor(Date.now() / 1000);
    const updateData: any = { updatedAt: now };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.order !== undefined) updateData.order = data.order;
    
    const result = await db.update(schema.subtasks)
      .set(updateData)
      .where(eq(schema.subtasks.id, parseInt(id)))
      .returning();
    return convertSubtask(result[0]);
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(schema.subtasks).where(eq(schema.subtasks.id, parseInt(id)));
  },

  toggle: async (id: string): Promise<Subtask> => {
    const subtask = await db.select().from(schema.subtasks)
      .where(eq(schema.subtasks.id, parseInt(id)));
    
    if (subtask.length === 0) throw new Error("Subtask not found");
    
    const updated = await subtasksOps.update(id, { completed: !subtask[0].completed });
    return updated;
  },
};

// ACTIVITY LOGS CRUD
export const activityLogsOps = {
  getByTaskId: async (taskId: string): Promise<ActivityLog[]> => {
    const result = await db.select().from(schema.activityLog)
      .where(eq(schema.activityLog.taskId, parseInt(taskId)))
      .orderBy(desc(schema.activityLog.timestamp));
    return result.map(convertActivityLog);
  },

  create: async (data: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog> => {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.insert(schema.activityLog).values({
      ...data,
      taskId: parseInt(data.taskId),
      timestamp: now,
    }).returning();
    return convertActivityLog(result[0]);
  },

  getAll: async (): Promise<ActivityLog[]> => {
    const result = await db.select().from(schema.activityLog)
      .orderBy(desc(schema.activityLog.timestamp));
    return result.map(convertActivityLog);
  },
};

// TASK LABELS (Many-to-Many)
export const taskLabelsOps = {
  addLabelToTask: async (taskId: string, labelId: string): Promise<void> => {
    const now = Math.floor(Date.now() / 1000);
    await db.insert(schema.taskLabels).values({
      taskId: parseInt(taskId),
      labelId: parseInt(labelId),
      createdAt: now,
    });
  },

  removeLabelFromTask: async (taskId: string, labelId: string): Promise<void> => {
    await db.delete(schema.taskLabels)
      .where(and(
        eq(schema.taskLabels.taskId, parseInt(taskId)),
        eq(schema.taskLabels.labelId, parseInt(labelId))
      ));
  },

  getTaskLabels: async (taskId: string): Promise<Label[]> => {
    const result = await db
      .select({
        label: schema.labels,
      })
      .from(schema.taskLabels)
      .innerJoin(schema.labels, eq(schema.taskLabels.labelId, schema.labels.id))
      .where(eq(schema.taskLabels.taskId, parseInt(taskId)));
    
    return result.map(row => convertLabel(row.label));
  },
};
