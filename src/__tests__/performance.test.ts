import { describe, it, expect, beforeEach } from "bun:test";
import { filterTasks } from "@/lib/task-filtering";
import { ViewState } from "@/contexts/ViewContext";
import { Task } from "@/contexts/TaskContext";

// Mock task data generator for performance testing
function generateMockTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const priorities: Task["priority"][] = ["High", "Medium", "Low", "None"];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + daysOffset);
    
    tasks.push({
      id: `task-${i}`,
      name: `Task ${i}`,
      description: `Description for task ${i} with some additional content to make it more realistic`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      listId: `list-${Math.floor(Math.random() * 10)}`,
      completed: Math.random() > 0.8,
      date: taskDate.toISOString().split('T')[0],
      deadline: Math.random() > 0.5 ? taskDate.toISOString().split('T')[0] : undefined,
      estimate: Math.random() > 0.5 ? `${Math.floor(Math.random() * 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
      actualTime: Math.random() > 0.7 ? `${Math.floor(Math.random() * 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      labels: Math.random() > 0.6 ? [
        { 
          id: `label-${Math.floor(Math.random() * 5)}`, 
          name: `Label ${Math.floor(Math.random() * 5)}`, 
          color: "#3b82f6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] : [],
      subtasks: Math.random() > 0.7 ? [
        { 
          id: `subtask-${i}-1`, 
          name: `Subtask 1`, 
          completed: Math.random() > 0.5,
          taskId: `task-${i}`,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: `subtask-${i}-2`, 
          name: `Subtask 2`, 
          completed: Math.random() > 0.5,
          taskId: `task-${i}`,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] : [],
    });
  }
  
  return tasks;
}

describe("Performance Tests", () => {
  describe("Large Dataset Performance", () => {
    it("should handle filtering 1000 tasks efficiently", () => {
      const tasks = generateMockTasks(1000);
      
      const startTime = Date.now();
      const filteredTasks = filterTasks(tasks, {
        currentView: "all",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Filtering 1000 tasks took ${duration}ms`);
      expect(duration).toBeLessThan(100); // 100ms
      expect(filteredTasks.length).toBe(1000);
    });

    it("should handle filtering 5000 tasks efficiently", () => {
      const tasks = generateMockTasks(5000);
      
      const startTime = Date.now();
      const filteredTasks = filterTasks(tasks, {
        currentView: "all",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Filtering 5000 tasks took ${duration}ms`);
      expect(duration).toBeLessThan(500); // 500ms
      expect(filteredTasks.length).toBe(5000);
    });

    it("should handle view filtering with large datasets", () => {
      const tasks = generateMockTasks(1000);

      // Test "Today" view performance
      const todayStartTime = Date.now();
      const todayTasks = filterTasks(tasks, {
        currentView: "today",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const todayEndTime = Date.now();
      const todayDuration = todayEndTime - todayStartTime;

      console.log(`"Today" view filtering took ${todayDuration}ms, found ${todayTasks.length} tasks`);
      expect(todayDuration).toBeLessThan(50); // 50ms

      // Test "Week" view performance
      const weekStartTime = Date.now();
      const weekTasks = filterTasks(tasks, {
        currentView: "week",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const weekEndTime = Date.now();
      const weekDuration = weekEndTime - weekStartTime;

      console.log(`"Week" view filtering took ${weekDuration}ms, found ${weekTasks.length} tasks`);
      expect(weekDuration).toBeLessThan(50); // 50ms

      // Test "Upcoming" view performance
      const upcomingStartTime = Date.now();
      const upcomingTasks = filterTasks(tasks, {
        currentView: "upcoming",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const upcomingEndTime = Date.now();
      const upcomingDuration = upcomingEndTime - upcomingStartTime;

      console.log(`"Upcoming" view filtering took ${upcomingDuration}ms, found ${upcomingTasks.length} tasks`);
      expect(upcomingDuration).toBeLessThan(50); // 50ms
    });

    it("should handle complex filtering efficiently", () => {
      const tasks = generateMockTasks(1000);

      const startTime = Date.now();
      const filteredTasks = filterTasks(tasks, {
        currentView: "all",
        showCompleted: false, // Only incomplete tasks
        searchQuery: "task",
        selectedListId: "list-1",
        selectedLabelIds: ["label-1"],
        priorityFilter: ["High", "Medium"],
        dateRangeFilter: { 
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Complex filtering took ${duration}ms, found ${filteredTasks.length} tasks`);
      expect(duration).toBeLessThan(100); // 100ms
    });
  });

  describe("Search Performance", () => {
    let tasks: Task[] = [];

    beforeEach(() => {
      // Generate tasks with varied content for search testing
      const searchTerms = [
        "urgent meeting", "project deadline", "team sync", "code review",
        "documentation", "bug fix", "feature development", "testing",
        "deployment", "client call", "planning session", "research",
        "design review", "performance optimization", "security audit"
      ];

      tasks = generateMockTasks(1000).map((task, index) => ({
        ...task,
        name: `${searchTerms[index % searchTerms.length]} ${index}`,
        description: `Detailed description about ${searchTerms[index % searchTerms.length]} with additional context for task number ${index}`,
      }));
    });

    it("should perform search quickly with large datasets", () => {
      const searchQueries = ["urgent", "meeting", "project", "code", "review"];

      for (const query of searchQueries) {
        const startTime = Date.now();
        const results = filterTasks(tasks, {
          currentView: "all",
          showCompleted: true,
          searchQuery: query,
          selectedListId: null,
          selectedLabelIds: [],
          priorityFilter: [],
          dateRangeFilter: { startDate: null, endDate: null }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Search for "${query}" took ${duration}ms, found ${results.length} results`);
        expect(duration).toBeLessThan(50); // 50ms per search
        expect(results.length).toBeGreaterThan(0);
      }
    });

    it("should handle complex search queries efficiently", () => {
      const complexQueries = [
        "urgent meeting project",
        "code review testing",
        "performance optimization security",
        "client call planning session documentation"
      ];

      for (const query of complexQueries) {
        const startTime = Date.now();
        const results = filterTasks(tasks, {
          currentView: "all",
          showCompleted: true,
          searchQuery: query,
          selectedListId: null,
          selectedLabelIds: [],
          priorityFilter: [],
          dateRangeFilter: { startDate: null, endDate: null }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Complex search for "${query}" took ${duration}ms, found ${results.length} results`);
        expect(duration).toBeLessThan(100); // 100ms for complex searches
      }
    });

    it("should handle fuzzy search efficiently", () => {
      const fuzzyQueries = ["urgetn", "meating", "projekt", "cdoe", "reviw"];

      for (const query of fuzzyQueries) {
        const startTime = Date.now();
        const results = filterTasks(tasks, {
          currentView: "all",
          showCompleted: true,
          searchQuery: query,
          selectedListId: null,
          selectedLabelIds: [],
          priorityFilter: [],
          dateRangeFilter: { startDate: null, endDate: null }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Fuzzy search for "${query}" took ${duration}ms, found ${results.length} results`);
        expect(duration).toBeLessThan(50); // 50ms for fuzzy searches
      }
    });
  });

  describe("Memory Usage", () => {
    it("should handle large task objects efficiently", () => {
      // Create tasks with large descriptions
      const largeDescription = "A".repeat(10000); // 10KB description
      const tasks: Task[] = [];

      for (let i = 0; i < 100; i++) {
        tasks.push({
          id: `large-task-${i}`,
          name: `Large Task ${i}`,
          description: largeDescription,
          priority: "High",
          listId: "list-1",
          completed: false,
          estimate: "2:30",
          actualTime: "1:45",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          labels: [],
          subtasks: [],
        });
      }

      const startTime = Date.now();
      const filteredTasks = filterTasks(tasks, {
        currentView: "all",
        showCompleted: true,
        searchQuery: "",
        selectedListId: null,
        selectedLabelIds: [],
        priorityFilter: [],
        dateRangeFilter: { startDate: null, endDate: null }
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Filtering 100 large tasks took ${duration}ms`);
      expect(duration).toBeLessThan(50); // 50ms
      expect(filteredTasks.length).toBe(100);
    });

    it("should not have memory leaks during repeated operations", () => {
      const tasks = generateMockTasks(1000);
      
      // Get initial memory usage
      const initialMemory = process.memoryUsage();
      console.log("Initial memory usage:", initialMemory);

      // Perform multiple filtering operations
      for (let i = 0; i < 100; i++) {
        filterTasks(tasks, {
          currentView: "all",
          showCompleted: i % 2 === 0,
          searchQuery: i % 10 === 0 ? "task" : "",
          selectedListId: i % 5 === 0 ? `list-${i % 10}` : null,
          selectedLabelIds: i % 3 === 0 ? [`label-${i % 5}`] : [],
          priorityFilter: i % 4 === 0 ? ["High", "Medium"] : [],
          dateRangeFilter: { startDate: null, endDate: null }
        });

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      console.log("Final memory usage:", finalMemory);

      // Memory growth should be reasonable
      const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const heapGrowthMB = heapGrowth / 1024 / 1024;
      
      console.log(`Memory growth: ${heapGrowthMB.toFixed(2)}MB`);
      expect(heapGrowthMB).toBeLessThan(10); // Should not grow more than 10MB
    });
  });

  describe("Animation Performance", () => {
    it("should handle rapid UI updates efficiently", () => {
      const tasks = generateMockTasks(100);
      
      // Simulate rapid UI updates (like typing in search)
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        filterTasks(tasks, {
          currentView: "all",
          showCompleted: true,
          searchQuery: i.toString(), // Simulate typing different characters
          selectedListId: null,
          selectedLabelIds: [],
          priorityFilter: [],
          dateRangeFilter: { startDate: null, endDate: null }
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`50 rapid filter operations took ${duration}ms`);
      expect(duration).toBeLessThan(200); // 200ms for 50 operations
    });

    it("should handle view transitions efficiently", () => {
      const tasks = generateMockTasks(500);
      const views: ViewState["currentView"][] = ["today", "week", "upcoming", "all"];
      
      const startTime = Date.now();
      
      // Simulate rapid view switching
      for (let i = 0; i < 20; i++) {
        const currentView = views[i % views.length];
        filterTasks(tasks, {
          currentView,
          showCompleted: true,
          searchQuery: "",
          selectedListId: null,
          selectedLabelIds: [],
          priorityFilter: [],
          dateRangeFilter: { startDate: null, endDate: null }
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`20 view transitions took ${duration}ms`);
      expect(duration).toBeLessThan(100); // 100ms for 20 view changes
    });
  });
});