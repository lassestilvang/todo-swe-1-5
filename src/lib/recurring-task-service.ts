import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { getNextDueDate, generateRecurringInstances, shouldCreateNewInstance } from "@/lib/recurring-tasks";

export class RecurringTaskService {
  /**
   * Generate new instances of recurring tasks that are due
   */
  static async generateRecurringInstances(): Promise<void> {
    try {
      // Get all parent recurring tasks (tasks that have isRecurring=true but no parent)
      const parentRecurringTasks = await db
        .select()
        .from(tasks)
        .where(and(
          eq(tasks.isRecurring, true),
          isNull(tasks.parentRecurringTaskId)
        ));

      const currentDate = new Date();
      
      for (const parentTask of parentRecurringTasks) {
        await this.generateInstancesForTask(parentTask, currentDate);
      }
    } catch (error) {
      console.error("Failed to generate recurring instances:", error);
    }
  }

  /**
   * Generate instances for a specific recurring task
   */
  private static async generateInstancesForTask(parentTask: any, currentDate: Date): Promise<void> {
    try {
      // Get the latest instance of this recurring task
      const latestInstance = await db
        .select()
        .from(tasks)
        .where(eq(tasks.parentRecurringTaskId, parentTask.id))
        .orderBy(desc(tasks.date))
        .limit(1);

      const lastInstanceDate = latestInstance[0]?.date 
        ? new Date(latestInstance[0].date * 1000) 
        : new Date(parentTask.date * 1000);

      // Create recurring config from parent task
      const recurringConfig = {
        isRecurring: true,
        pattern: parentTask.recurringPattern,
        interval: parentTask.recurringInterval,
        endDate: parentTask.recurringEndDate ? new Date(parentTask.recurringEndDate * 1000) : undefined,
        daysOfWeek: parentTask.recurringDaysOfWeek ? JSON.parse(parentTask.recurringDaysOfWeek) : undefined,
        dayOfMonth: parentTask.recurringDayOfMonth,
      };

      // Check if we need to create new instances
      if (shouldCreateNewInstance(lastInstanceDate, recurringConfig, currentDate)) {
        // Generate instances up to 30 days in the future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const instances = generateRecurringInstances(
          parentTask,
          recurringConfig,
          lastInstanceDate,
          futureDate
        );

        // Insert new instances into database
        for (const instance of instances) {
          await db.insert(tasks).values({
            name: instance.name,
            description: instance.description,
            date: instance.date,
            deadline: instance.deadline,
            estimate: instance.estimate,
            actualTime: instance.actualTime,
            priority: instance.priority,
            completed: instance.completed,
            listId: instance.listId,
            isRecurring: false, // Instances are not recurring themselves
            parentRecurringTaskId: instance.parentRecurringTaskId,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to generate instances for task ${parentTask.id}:`, error);
    }
  }

  /**
   * Complete a recurring task instance and potentially generate the next one
   */
  static async completeRecurringInstance(taskId: string): Promise<void> {
    try {
      // Get the task being completed
      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(taskId)))
        .limit(1);

      if (!task[0]) return;

      const completedTask = task[0];

      // Mark the task as completed
      await db
        .update(tasks)
        .set({ 
          completed: true,
          updatedAt: Math.floor(Date.now() / 1000)
        })
        .where(eq(tasks.id, parseInt(taskId)));

      // If this is a recurring instance, generate the next one
      if (completedTask.parentRecurringTaskId && completedTask.date) {
        const parentTask = await db
          .select()
          .from(tasks)
          .where(eq(tasks.id, completedTask.parentRecurringTaskId))
          .limit(1);

        if (parentTask[0]) {
          const recurringConfig = {
            isRecurring: true,
            pattern: (parentTask[0].recurringPattern || 'daily') as any,
            interval: parentTask[0].recurringInterval || 1,
            endDate: parentTask[0].recurringEndDate ? new Date(parentTask[0].recurringEndDate * 1000) : undefined,
            daysOfWeek: parentTask[0].recurringDaysOfWeek ? JSON.parse(parentTask[0].recurringDaysOfWeek) : undefined,
            dayOfMonth: parentTask[0].recurringDayOfMonth || undefined,
          };

          const completedDate = new Date(completedTask.date * 1000);
          const nextDate = getNextDueDate(completedDate, recurringConfig);

          if (nextDate && (!recurringConfig.endDate || nextDate <= recurringConfig.endDate)) {
            // Create the next instance
            await db.insert(tasks).values({
              name: parentTask[0].name,
              description: parentTask[0].description,
              date: Math.floor(nextDate.getTime() / 1000),
              deadline: parentTask[0].deadline,
              estimate: parentTask[0].estimate,
              actualTime: parentTask[0].actualTime,
              priority: parentTask[0].priority,
              completed: false,
              listId: parentTask[0].listId,
              isRecurring: false,
              parentRecurringTaskId: parentTask[0].id,
              createdAt: Math.floor(Date.now() / 1000),
              updatedAt: Math.floor(Date.now() / 1000),
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to complete recurring instance:", error);
    }
  }

  /**
   * Delete all future instances of a recurring task
   */
  static async deleteFutureInstances(parentTaskId: string): Promise<void> {
    try {
      await db
        .delete(tasks)
        .where(and(
          eq(tasks.parentRecurringTaskId, parseInt(parentTaskId)),
          eq(tasks.completed, false)
        ));
    } catch (error) {
      console.error("Failed to delete future instances:", error);
    }
  }

  /**
   * Update a recurring task and propagate changes to future instances
   */
  static async updateRecurringTask(
    parentTaskId: string, 
    updates: any, 
    updateFutureInstances: boolean = true
  ): Promise<void> {
    try {
      // Update the parent task
      await db
        .update(tasks)
        .set({
          ...updates,
          updatedAt: Math.floor(Date.now() / 1000)
        })
        .where(eq(tasks.id, parseInt(parentTaskId)));

      // If requested, update future uncompleted instances
      if (updateFutureInstances) {
        const { isRecurring, recurringPattern, recurringInterval, recurringEndDate, recurringDaysOfWeek, recurringDayOfMonth, parentRecurringTaskId, ...instanceUpdates } = updates;
        
        await db
          .update(tasks)
          .set({
            ...instanceUpdates,
            updatedAt: Math.floor(Date.now() / 1000)
          })
          .where(and(
            eq(tasks.parentRecurringTaskId, parseInt(parentTaskId)),
            eq(tasks.completed, false)
          ));
      }
    } catch (error) {
      console.error("Failed to update recurring task:", error);
    }
  }
}
