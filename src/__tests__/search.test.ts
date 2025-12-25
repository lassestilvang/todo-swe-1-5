import { describe, it, expect } from "bun:test";

// Mock search functionality tests
describe("Search Functionality", () => {
  it("should search across task names", () => {
    const tasks = [
      { name: "Buy groceries", description: "Milk, eggs, bread" },
      { name: "Call mom", description: "Weekly check-in" },
      { name: "Finish project", description: "Complete the task manager" },
    ];

    const searchTerm = "buy";
    const results = tasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Buy groceries");
  });

  it("should search across task descriptions", () => {
    const tasks = [
      { name: "Meeting", description: "Discuss project timeline" },
      { name: "Call mom", description: "Weekly check-in" },
      { name: "Groceries", description: "Buy milk and eggs" },
    ];

    const searchTerm = "project";
    const results = tasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Meeting");
  });

  it("should handle empty search term", () => {
    const tasks = [
      { name: "Task 1", description: "Description 1" },
      { name: "Task 2", description: "Description 2" },
    ];

    const searchTerm = "";
    const results = tasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(2); // Should return all tasks
  });

  it("should be case insensitive", () => {
    const tasks = [
      { name: "IMPORTANT Meeting", description: "Team sync" },
      { name: "Regular Task", description: "Daily work" },
    ];

    const searchTerm = "important";
    const results = tasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("IMPORTANT Meeting");
  });
});
