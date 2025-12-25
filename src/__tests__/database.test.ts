import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { db } from "@/lib/db";
import { tasks, lists, labels } from "@/lib/db/schema";
import { tasksOps, listsOps, labelsOps } from "@/lib/db/operations";
import { RecurringTaskService } from "@/lib/recurring-task-service";

describe("Database Operations", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(tasks);
    await db.delete(labels);
    await db.delete(lists);
  });

  describe("Task Operations", () => {
    it("should create a new task", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        priority: "High" as const,
        listId: "inbox",
        completed: false,
      };

      const createdTask = await tasksOps.create(taskData);

      expect(createdTask).toBeDefined();
      expect(createdTask.name).toBe(taskData.name);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.priority).toBe(taskData.priority);
      expect(createdTask.completed).toBe(false);
    });

    it("should update an existing task", async () => {
      // Create a task first
      const taskData = {
        name: "Original Task",
        priority: "Medium" as const,
        listId: "inbox",
        completed: false,
      };
      const createdTask = await tasksOps.create(taskData);

      // Update the task
      const updates = { name: "Updated Task", priority: "High" as const };
      const updatedTask = await tasksOps.update(createdTask.id, updates);

      expect(updatedTask.name).toBe(updates.name);
      expect(updatedTask.priority).toBe(updates.priority);
    });

    it("should delete a task", async () => {
      // Create a task first
      const taskData = {
        name: "Task to Delete",
        priority: "Low" as const,
        listId: "inbox",
        completed: false,
      };
      const createdTask = await tasksOps.create(taskData);

      // Delete the task
      await tasksOps.delete(createdTask.id);

      // Try to get the task (should fail)
      const allTasks = await tasksOps.getAll();
      expect(allTasks.find(t => t.id === createdTask.id)).toBeUndefined();
    });

    it("should toggle task completion", async () => {
      const taskData = {
        name: "Task to Toggle",
        priority: "None" as const,
        listId: "inbox",
        completed: false,
      };
      const createdTask = await tasksOps.create(taskData);

      // Toggle to completed
      const toggledTask = await tasksOps.toggle(createdTask.id);
      expect(toggledTask.completed).toBe(true);

      // Toggle back to incomplete
      const toggledBackTask = await tasksOps.toggle(createdTask.id);
      expect(toggledBackTask.completed).toBe(false);
    });
  });

  describe("List Operations", () => {
    it("should create a new list", async () => {
      const listData = {
        name: "Test List",
        color: "#3b82f6",
        isDefault: false,
        order: 0,
      };

      const createdList = await listsOps.create(listData);

      expect(createdList).toBeDefined();
      expect(createdList.name).toBe(listData.name);
      expect(createdList.color).toBe(listData.color);
      expect(createdList.isDefault).toBe(false);
    });

    it("should update a list", async () => {
      const listData = {
        name: "Original List",
        color: "#ef4444",
        isDefault: false,
        order: 0,
      };
      const createdList = await listsOps.create(listData);

      const updates = { name: "Updated List", color: "#10b981" };
      const updatedList = await listsOps.update(createdList.id, updates);

      expect(updatedList.name).toBe(updates.name);
      expect(updatedList.color).toBe(updates.color);
    });

    it("should reorder lists", async () => {
      // Create multiple lists
      const list1 = await listsOps.create({ name: "List 1", color: "#3b82f6", isDefault: false, order: 0 });
      const list2 = await listsOps.create({ name: "List 2", color: "#ef4444", isDefault: false, order: 1 });
      const list3 = await listsOps.create({ name: "List 3", color: "#10b981", isDefault: false, order: 2 });

      // Reorder them
      const newOrder = [list3.id, list1.id, list2.id];
      await listsOps.reorder(newOrder);

      const allLists = await listsOps.getAll();
      const reorderedLists = allLists.filter(l => newOrder.includes(l.id)).sort((a, b) => a.order - b.order);
      
      expect(reorderedLists[0].id).toBe(list3.id);
      expect(reorderedLists[1].id).toBe(list1.id);
      expect(reorderedLists[2].id).toBe(list2.id);
    });
  });

  describe("Label Operations", () => {
    it("should create a new label", async () => {
      const labelData = {
        name: "Test Label",
        color: "#f59e0b",
      };

      const createdLabel = await labelsOps.create(labelData);

      expect(createdLabel).toBeDefined();
      expect(createdLabel.name).toBe(labelData.name);
      expect(createdLabel.color).toBe(labelData.color);
    });

    it("should not create duplicate labels", async () => {
      const labelData = {
        name: "Unique Label",
        color: "#8b5cf6",
      };

      await labelsOps.create(labelData);

      // Try to create the same label again
      await expect(labelsOps.create(labelData)).toThrow();
    });
  });
});

describe("Recurring Tasks", () => {
  beforeEach(async () => {
    await db.delete(tasks);
    await db.delete(labels);
    await db.delete(lists);
  });

  it("should create a recurring task", async () => {
    const recurringTaskData = {
      name: "Daily Standup",
      priority: "High" as const,
      listId: "inbox",
      completed: false,
      isRecurring: true,
      recurringPattern: "daily" as const,
      recurringInterval: 1,
      date: new Date().toISOString().split('T')[0],
    };

    const createdTask = await tasksOps.create(recurringTaskData);

    expect(createdTask.isRecurring).toBe(true);
    expect(createdTask.recurringPattern).toBe("daily");
    expect(createdTask.recurringInterval).toBe(1);
  });

  it("should generate recurring instances", async () => {
    // Create a parent recurring task
    const parentTask = await tasksOps.create({
      name: "Weekly Meeting",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      isRecurring: true,
      recurringPattern: "weekly" as const,
      recurringInterval: 1,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    });

    // Generate instances
    await RecurringTaskService.generateRecurringInstances();

    // Check if instances were created
    const allTasks = await tasksOps.getAll();
    const instances = allTasks.filter(t => t.parentRecurringTaskId === parentTask.id);

    expect(instances.length).toBeGreaterThan(0);
    expect(instances[0].name).toBe(parentTask.name);
    expect(instances[0].isRecurring).toBe(false);
  });

  it("should complete recurring instance and create next one", async () => {
    // Create a parent recurring task
    const parentTask = await tasksOps.create({
      name: "Daily Exercise",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      isRecurring: true,
      recurringPattern: "daily" as const,
      recurringInterval: 1,
      date: new Date().toISOString().split('T')[0],
    });

    // Create an instance
    const instance = await tasksOps.create({
      name: "Daily Exercise",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      parentRecurringTaskId: parentTask.id,
      date: new Date().toISOString().split('T')[0],
    });

    // Complete the instance
    await RecurringTaskService.completeRecurringInstance(instance.id);

    // Check if next instance was created
    const allTasks = await tasksOps.getAll();
    const newInstances = allTasks.filter(t => 
      t.parentRecurringTaskId === parentTask.id && 
      t.id !== instance.id &&
      !t.completed
    );

    expect(newInstances.length).toBeGreaterThan(0);
  });
});

describe("Task Filtering and Views", () => {
  beforeEach(async () => {
    await db.delete(tasks);
    await db.delete(labels);
    await db.delete(lists);
  });

  it("should filter tasks by date range", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create tasks with different dates
    await tasksOps.create({
      name: "Today Task",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      date: today.toISOString().split('T')[0],
    });

    await tasksOps.create({
      name: "Yesterday Task",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      date: yesterday.toISOString().split('T')[0],
    });

    await tasksOps.create({
      name: "Tomorrow Task",
      priority: "Medium" as const,
      listId: "inbox",
      completed: false,
      date: tomorrow.toISOString().split('T')[0],
    });

    const allTasks = await tasksOps.getAll();
    const todayTasks = allTasks.filter(t => t.date === today.toISOString().split('T')[0]);

    expect(todayTasks.length).toBe(1);
    expect(todayTasks[0].name).toBe("Today Task");
  });

  it("should filter tasks by priority", async () => {
    await tasksOps.create({ name: "High Priority Task", priority: "High" as const, listId: "inbox", completed: false });
    await tasksOps.create({ name: "Medium Priority Task", priority: "Medium" as const, listId: "inbox", completed: false });
    await tasksOps.create({ name: "Low Priority Task", priority: "Low" as const, listId: "inbox", completed: false });

    const allTasks = await tasksOps.getAll();
    const highPriorityTasks = allTasks.filter(t => t.priority === "High");

    expect(highPriorityTasks.length).toBe(1);
    expect(highPriorityTasks[0].name).toBe("High Priority Task");
  });

  it("should filter completed tasks", async () => {
    await tasksOps.create({ name: "Completed Task", priority: "Medium" as const, listId: "inbox", completed: true });
    await tasksOps.create({ name: "Incomplete Task", priority: "Medium" as const, listId: "inbox", completed: false });

    const allTasks = await tasksOps.getAll();
    const completedTasks = allTasks.filter(t => t.completed);
    const incompleteTasks = allTasks.filter(t => !t.completed);

    expect(completedTasks.length).toBe(1);
    expect(incompleteTasks.length).toBe(1);
    expect(completedTasks[0].name).toBe("Completed Task");
    expect(incompleteTasks[0].name).toBe("Incomplete Task");
  });
});
