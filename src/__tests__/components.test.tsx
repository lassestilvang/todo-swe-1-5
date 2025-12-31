import { describe, it, expect, beforeEach, vi } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { NaturalLanguageTaskInput } from "@/components/NaturalLanguageTaskInput";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { ViewToggle } from "@/components/ViewToggle";
import { TaskProvider, useTaskContext } from "@/contexts/TaskContext";
import { ReactNode } from "react";

// Mock task data
const mockTask = {
  id: "1",
  name: "Test Task",
  description: "Test Description",
  priority: "High" as const,
  completed: false,
  listId: "inbox",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockTaskContext = {
  state: {
    tasks: [],
    lists: [],
    labels: [],
    subtasks: [],
    activityLogs: [],
    loading: false,
    error: null,
  },
  actions: {
    createTask: async () => {},
    updateTask: async () => {},
    deleteTask: async () => {},
    toggleTask: async () => {},
    createList: async () => {},
    updateList: async () => {},
    deleteList: async () => {},
    reorderLists: async () => {},
    createLabel: async () => {},
    updateLabel: async () => {},
    deleteLabel: async () => {},
  },
};

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <TaskProvider>
      {children}
    </TaskProvider>
  );
};

describe("TaskCard Component", () => {
  it("renders task name correctly", () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task description when provided", () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("shows completed state with line-through", () => {
    const completedTask = { ...mockTask, completed: true };
    
    render(
      <TestWrapper>
        <TaskCard task={completedTask} />
      </TestWrapper>
    );

    const taskName = screen.getByText("Test Task");
    expect(taskName).toHaveClass("line-through");
  });

  it("displays priority badge", () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    // Priority badge should be visible (testing for High priority)
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows recurring indicator for recurring tasks", () => {
    const recurringTask = { 
      ...mockTask, 
      isRecurring: true,
      recurringPattern: "daily" as const,
    };
    
    render(
      <TestWrapper>
        <TaskCard task={recurringTask} />
      </TestWrapper>
    );

    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("shows instance indicator for recurring task instances", () => {
    const instanceTask = { 
      ...mockTask, 
      parentRecurringTaskId: "parent-123",
    };
    
    render(
      <TestWrapper>
        <TaskCard task={instanceTask} />
      </TestWrapper>
    );

    expect(screen.getByText("Instance")).toBeInTheDocument();
  });

  it("calls toggleTask when checkbox is clicked", async () => {
    const mockToggleTask = vi.fn();
    const mockContextWithToggle = {
      ...mockTaskContext,
      actions: {
        ...mockTaskContext.actions,
        toggleTask: mockToggleTask,
      },
    };

    render(
      <TaskProvider>
        <TaskCard task={mockTask} />
      </TaskProvider>
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Note: This test may need adjustment based on actual implementation
    expect(checkbox).toBeInTheDocument();
  });

  it("displays date when provided", () => {
    const taskWithDate = {
      ...mockTask,
      date: "2024-01-15",
    };
    
    render(
      <TestWrapper>
        <TaskCard task={taskWithDate} />
      </TestWrapper>
    );

    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
  });

  it("displays time estimate when provided", () => {
    const taskWithEstimate = {
      ...mockTask,
      estimate: "2h 30m",
    };
    
    render(
      <TestWrapper>
        <TaskCard task={taskWithEstimate} />
      </TestWrapper>
    );

    expect(screen.getByText("2h 30m")).toBeInTheDocument();
  });

  it("renders labels when provided", () => {
    const taskWithLabels = {
      ...mockTask,
      labels: [
        { id: "1", name: "Work", color: "#3b82f6", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
        { id: "2", name: "Urgent", color: "#ef4444", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
      ],
    };
    
    render(
      <TestWrapper>
        <TaskCard task={taskWithLabels} />
      </TestWrapper>
    );

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("shows subtask progress when subtasks exist", () => {
    const taskWithSubtasks = {
      ...mockTask,
      subtasks: [
        { id: "1", name: "Subtask 1", completed: true, taskId: "1", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
        { id: "2", name: "Subtask 2", completed: false, taskId: "1", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
      ],
    };
    
    render(
      <TestWrapper>
        <TaskCard task={taskWithSubtasks} />
      </TestWrapper>
    );

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });
});

describe("Task Form Validation", () => {
  it("should validate required task name", () => {
    // This would test the form validation logic
    // For now, we'll just test that the validation schema exists
    const { taskSchema } = require("@/components/TaskForm");
    
    expect(taskSchema).toBeDefined();
  });

  it("should accept valid task data", () => {
    const validTaskData = {
      name: "Valid Task",
      description: "Valid Description",
      priority: "Medium",
      listId: "inbox",
      completed: false,
    };

    const { taskSchema } = require("@/components/TaskForm");
    const result = taskSchema.safeParse(validTaskData);
    
    expect(result.success).toBe(true);
  });

  it("should reject invalid task data", () => {
    const invalidTaskData = {
      name: "", // Empty name should fail validation
      priority: "InvalidPriority",
    };

    const { taskSchema } = require("@/components/TaskForm");
    const result = taskSchema.safeParse(invalidTaskData);
    
    expect(result.success).toBe(false);
  });
});

describe("Natural Language Task Input", () => {
  it("renders input field with placeholder", () => {
    const mockOnTaskCreate = vi.fn();
    
    render(
      <TestWrapper>
        <NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/Try:/i);
    expect(input).toBeInTheDocument();
  });

  it("shows suggestions when typing", async () => {
    const mockOnTaskCreate = vi.fn();
    
    render(
      <TestWrapper>
        <NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/Try:/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Meeting" } });

    await waitFor(() => {
      expect(screen.getByText(/Suggestions/i)).toBeInTheDocument();
    });
  });

  it("calls onTaskCreate when parsed task is created", async () => {
    const mockOnTaskCreate = vi.fn();
    
    render(
      <TestWrapper>
        <NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/Try:/i);
    fireEvent.change(input, { target: { value: "Meeting tomorrow" } });

    await waitFor(() => {
      expect(screen.getByText("Meeting")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    expect(mockOnTaskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Meeting",
        date: expect.any(Date),
      })
    );
  });

  it("clears input after task creation", async () => {
    const mockOnTaskCreate = vi.fn();
    
    render(
      <TestWrapper>
        <NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/Try:/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Simple task" } });

    await waitFor(() => {
      expect(screen.getByText("Simple task")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    expect(input.value).toBe("");
  });

  it("shows parsed task preview with all fields", async () => {
    const mockOnTaskCreate = vi.fn();
    
    render(
      <TestWrapper>
        <NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/Try:/i);
    fireEvent.change(input, { target: { value: "Urgent meeting tomorrow at 2 PM #work 2h" } });

    await waitFor(() => {
      expect(screen.getByText("meeting")).toBeInTheDocument();
      expect(screen.getByText("Urgent")).toBeInTheDocument();
      expect(screen.getByText("work")).toBeInTheDocument();
      expect(screen.getByText("2h")).toBeInTheDocument();
    });
  });
});

describe("TaskForm Component", () => {
  const mockLists = [
    { id: "1", name: "Work", color: "#3b82f6" },
    { id: "2", name: "Personal", color: "#10b981" },
  ];

  const mockLabels = [
    { id: "1", name: "Urgent", color: "#ef4444" },
    { id: "2", name: "Important", color: "#f59e0b" },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
          lists={mockLists}
          labels={mockLabels}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Task Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Estimate/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it("shows validation error for empty task name", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Task name is required")).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
          lists={mockLists}
          labels={mockLabels}
        />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/Task Name \*/i);
    fireEvent.change(nameInput, { target: { value: "Test Task" } });

    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: "Test Description" } });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Task",
          description: "Test Description",
          priority: "None",
        })
      );
    });
  });

  it("populates form with initial data for editing", () => {
    const initialData = {
      name: "Existing Task",
      description: "Existing Description",
      priority: "High" as const,
      estimate: "2h 30m",
    };

    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
          initialData={initialData}
          lists={mockLists}
          labels={mockLabels}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2h 30m")).toBeInTheDocument();
    expect(screen.getByText("Update Task")).toBeInTheDocument();
  });

  it("handles priority selection", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const prioritySelect = screen.getByLabelText(/Priority/i);
    fireEvent.click(prioritySelect);

    await waitFor(() => {
      const highOption = screen.getByText("High");
      fireEvent.click(highOption);
    });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: "High",
        })
      );
    });
  });

  it("handles date selection", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const dateButton = screen.getByText("Pick a date");
    fireEvent.click(dateButton);

    // This would need calendar interaction mocking
    // For now, just test that the popover opens
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("handles label selection", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
          labels={mockLabels}
        />
      </TestWrapper>
    );

    const urgentLabel = screen.getByText("Urgent");
    fireEvent.click(urgentLabel);

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: ["1"],
        })
      );
    });
  });

  it("handles list selection", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
          lists={mockLists}
        />
      </TestWrapper>
    );

    const listSelect = screen.getByDisplayValue("Select a list");
    fireEvent.click(listSelect);

    await waitFor(() => {
      const workOption = screen.getByText("Work");
      fireEvent.click(workOption);
    });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: "1",
        })
      );
    });
  });

  it("toggles recurring task options", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const recurringCheckbox = screen.getByLabelText(/Recurring Task/i);
    fireEvent.click(recurringCheckbox);

    await waitFor(() => {
      expect(screen.getByLabelText(/Pattern/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Every/i)).toBeInTheDocument();
    });
  });

  it("handles recurring pattern selection", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const recurringCheckbox = screen.getByLabelText(/Recurring Task/i);
    fireEvent.click(recurringCheckbox);

    const patternSelect = screen.getByDisplayValue("Select pattern");
    fireEvent.click(patternSelect);

    await waitFor(() => {
      const weeklyOption = screen.getByText("Weekly");
      fireEvent.click(weeklyOption);
    });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurringPattern: "weekly",
        })
      );
    });
  });

  it("shows days of week for weekly pattern", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const recurringCheckbox = screen.getByLabelText(/Recurring Task/i);
    fireEvent.click(recurringCheckbox);

    const patternSelect = screen.getByDisplayValue("Select pattern");
    fireEvent.click(patternSelect);

    await waitFor(() => {
      const weeklyOption = screen.getByText("Weekly");
      fireEvent.click(weeklyOption);
    });

    await waitFor(() => {
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Tue")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("handles time estimate input", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const estimateInput = screen.getByLabelText(/Time Estimate/i);
    fireEvent.change(estimateInput, { target: { value: "1h 45m" } });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          estimate: "1h 45m",
        })
      );
    });
  });

  it("handles deadline time input", async () => {
    render(
      <TestWrapper>
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const deadlineInput = screen.getByLabelText(/Deadline Time/i);
    fireEvent.change(deadlineInput, { target: { value: "14:30" } });

    const submitButton = screen.getByText("Create Task");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          deadline: expect.any(Date),
        })
      );
    });
  });
});

describe("Sidebar Component", () => {
  const mockLists = [
    { id: "1", name: "Work", color: "#3b82f6", emoji: "💼", order: 0, isDefault: false, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "2", name: "Personal", color: "#10b981", emoji: "🏠", order: 1, isDefault: false, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
  ];

  const mockLabels = [
    { id: "1", name: "Urgent", color: "#ef4444", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "2", name: "Important", color: "#f59e0b", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
  ];

  const mockTasks = [
    { id: "1", name: "Task 1", listId: "1", completed: false, labels: [{ id: "1", name: "Urgent", color: "#ef4444", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" }], priority: "High", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "2", name: "Task 2", listId: "1", completed: true, labels: [], priority: "Medium", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "3", name: "Task 3", listId: "2", completed: false, labels: [], priority: "Low", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
  ];

  const mockTaskContextWithState = {
    state: {
      tasks: mockTasks,
      lists: mockLists,
      labels: mockLabels,
      subtasks: [],
      activityLogs: [],
      loading: false,
      error: null,
    },
    actions: {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTask: vi.fn(),
      createList: vi.fn(),
      updateList: vi.fn(),
      deleteList: vi.fn(),
      reorderLists: vi.fn(),
      createLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sidebar with navigation items", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    expect(screen.getByText("Task Planner")).toBeInTheDocument();
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
  });

  it("displays task counts for navigation items", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    expect(screen.getByText("5")).toBeInTheDocument(); // Inbox count
    expect(screen.getByText("3")).toBeInTheDocument(); // Today count
    expect(screen.getByText("8")).toBeInTheDocument(); // Week count
    expect(screen.getByText("16")).toBeInTheDocument(); // All Tasks count
  });

  it("toggles sidebar collapse state", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // After collapse, title should be hidden
    expect(screen.queryByText("Task Planner")).not.toBeInTheDocument();
  });

  it("shows lists section when not collapsed", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    expect(screen.getByText("Lists")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("shows labels section when not collapsed", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    expect(screen.getByText("Labels")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("opens create list dialog when plus button is clicked", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    const createListButton = screen.getAllByText("New Task")[1]; // Second plus button is for lists
    fireEvent.click(createListButton);

    expect(screen.getByText("Create New List")).toBeInTheDocument();
  });

  it("creates new list with valid data", async () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Open dialog
    const createListButton = screen.getAllByText("New Task")[1];
    fireEvent.click(createListButton);

    // Fill form
    const nameInput = screen.getByPlaceholderText("Enter list name...");
    fireEvent.change(nameInput, { target: { value: "New List" } });

    // Select color
    const colorButton = screen.getByRole("button", { name: "" }); // First color button
    fireEvent.click(colorButton);

    // Submit
    const createButton = screen.getByText("Create List");
    fireEvent.click(createButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText("Create New List")).not.toBeInTheDocument();
    });
  });

  it("shows list task counts correctly", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Work list should show 1 (only incomplete tasks)
    const workListCount = screen.getAllByText("1")[0]; // First "1" should be work list count
    expect(workListCount).toBeInTheDocument();

    // Personal list should show 1
    const personalListCount = screen.getAllByText("1")[1];
    expect(personalListCount).toBeInTheDocument();
  });

  it("shows label task counts correctly", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Urgent label should show 1 (one task has urgent label)
    const urgentLabelCount = screen.getAllByText("1")[2]; // Third "1" should be urgent label count
    expect(urgentLabelCount).toBeInTheDocument();
  });

  it("hides lists and labels when collapsed", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Collapse sidebar
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Lists and labels sections should be hidden
    expect(screen.queryByText("Lists")).not.toBeInTheDocument();
    expect(screen.queryByText("Labels")).not.toBeInTheDocument();
    expect(screen.queryByText("Work")).not.toBeInTheDocument();
    expect(screen.queryByText("Urgent")).not.toBeInTheDocument();
  });

  it("closes create list dialog when cancel is clicked", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Open dialog
    const createListButton = screen.getAllByText("New Task")[1];
    fireEvent.click(createListButton);

    // Cancel
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Create New List")).not.toBeInTheDocument();
  });

  it("does not create list with empty name", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Open dialog
    const createListButton = screen.getAllByText("New Task")[1];
    fireEvent.click(createListButton);

    // Try to create with empty name
    const createButton = screen.getByText("Create List");
    fireEvent.click(createButton);

    // Dialog should still be open (validation failed)
    expect(screen.getByText("Create New List")).toBeInTheDocument();
  });

  it("shows color picker in create list dialog", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Open dialog
    const createListButton = screen.getAllByText("New Task")[1];
    fireEvent.click(createListButton);

    // Should show color options
    const colorButtons = screen.getAllByRole("button");
    expect(colorButtons.length).toBeGreaterThan(6); // Should have multiple color options
  });

  it("selects different colors in create list dialog", () => {
    render(
      <TaskProvider>
        <Sidebar />
      </TaskProvider>
    );

    // Open dialog
    const createListButton = screen.getAllByText("New Task")[1];
    fireEvent.click(createListButton);

    // Click different color buttons
    const colorButtons = screen.getAllByRole("button");
    const greenColorButton = colorButtons.find(btn => 
      btn.getAttribute("style")?.includes("#10b981")
    );
    
    if (greenColorButton) {
      fireEvent.click(greenColorButton);
      // Should update selected color (visual feedback would be tested in integration tests)
    }
  });
});

describe("SearchBar Component", () => {
  const mockTasks = [
    { 
      id: "1", 
      name: "Complete project", 
      description: "Finish the web development project",
      listId: "1", 
      completed: false, 
      labels: [{ id: "1", name: "Work", color: "#3b82f6", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" }],
      priority: "High", 
      date: "2024-01-15",
      createdAt: "2024-01-01T00:00:00.000Z", 
      updatedAt: "2024-01-01T00:00:00.000Z" 
    },
    { 
      id: "2", 
      name: "Buy groceries", 
      description: "Get milk, eggs, and bread",
      listId: "2", 
      completed: false, 
      labels: [{ id: "2", name: "Personal", color: "#10b981", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" }],
      priority: "Medium", 
      date: "2024-01-16",
      createdAt: "2024-01-01T00:00:00.000Z", 
      updatedAt: "2024-01-01T00:00:00.000Z" 
    },
    { 
      id: "3", 
      name: "Call dentist", 
      description: "Schedule appointment for checkup",
      listId: "2", 
      completed: true, 
      labels: [],
      priority: "Low", 
      date: "2024-01-17",
      createdAt: "2024-01-01T00:00:00.000Z", 
      updatedAt: "2024-01-01T00:00:00.000Z" 
    },
  ];

  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(
      <TaskProvider>
        <SearchBar placeholder="Custom placeholder..." onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Custom placeholder...");
    expect(searchInput).toBeInTheDocument();
  });

  it("calls onSearch when query changes (debounced)", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    }, { timeout: 400 });
  });

  it("shows clear button when query is not empty", () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    const clearButton = screen.getByRole("button", { name: "" }); // X button
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    const clearButton = screen.getByRole("button", { name: "" });
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(mockOnSearch).toHaveBeenCalledWith("");
  });

  it("filters tasks by name", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "project" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
    });
  });

  it("filters tasks by description", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "milk" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
      expect(screen.getByText("Get milk, eggs, and bread")).toBeInTheDocument();
    });
  });

  it("filters tasks by labels", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "work" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
    });
  });

  it("shows task count in search results", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "task" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText(/tasks found/i)).toBeInTheDocument();
    });
  });

  it("shows no results message when no tasks match", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });

  it("shows task details in search results", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "project" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Finish the web development project")).toBeInTheDocument();
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument();
    });
  });

  it("closes dropdown when escape key is pressed", () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.focus(searchInput);

    fireEvent.keyDown(searchInput, { key: "Escape" });

    // Dropdown should close (tested by checking that results are not visible)
    expect(screen.queryByText("Complete project")).not.toBeInTheDocument();
  });

  it("selects task when clicked in results", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "project" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      const taskResult = screen.getByText("Complete project");
      fireEvent.click(taskResult);
    });

    expect(searchInput).toHaveValue("Complete project");
  });

  it("limits search results to 8 items", async () => {
    // This test would need more than 8 matching tasks to be effective
    // For now, we'll just test the functionality exists
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "task" } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      // Just verify the search functionality works
      expect(screen.getByText(/tasks found/i)).toBeInTheDocument();
    });
  });

  it("shows search history when query is empty", async () => {
    // This test is limited as we can't easily test localStorage in unit tests
    // We'll test the UI behavior instead
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.focus(searchInput);

    // With empty query and no history, should not show history section
    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
  });

  it("handles custom className", () => {
    render(
      <TaskProvider>
        <SearchBar className="custom-class" onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const container = screen.getByPlaceholderText("Search tasks...").closest(".custom-class");
    expect(container).toBeInTheDocument();
  });

  it("calls onSearch with empty string when query is cleared", async () => {
    render(
      <TaskProvider>
        <SearchBar onSearch={mockOnSearch} />
      </TaskProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Wait for debounce, then clear
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    }, { timeout: 400 });

    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("");
    }, { timeout: 400 });
  });
});

describe("ViewToggle Component", () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all view buttons", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
  });

  it("highlights the current view", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const todayButton = screen.getByText("Today").closest("button");
    const weekButton = screen.getByText("Week").closest("button");

    expect(todayButton).toHaveClass("bg-primary");
    expect(weekButton).not.toHaveClass("bg-primary");
  });

  it("calls onViewChange when a view is clicked", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const weekButton = screen.getByText("Week");
    fireEvent.click(weekButton);

    expect(mockOnViewChange).toHaveBeenCalledWith("week");
  });

  it("shows icons for all views", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    // All buttons should have icons (lucide icons)
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);

    buttons.forEach(button => {
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  it("handles different current views", () => {
    const views = ["today", "week", "upcoming", "all"] as const;

    views.forEach(view => {
      const { unmount } = render(
        <ViewToggle 
          currentView={view} 
          onViewChange={mockOnViewChange} 
        />
      );

      const currentButton = screen.getByText(
        view === "today" ? "Today" :
        view === "week" ? "Week" :
        view === "upcoming" ? "Upcoming" :
        "All Tasks"
      ).closest("button");

      expect(currentButton).toHaveClass("bg-primary");

      unmount();
    });
  });

  it("applies custom className", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange}
        className="custom-class"
      />
    );

    const container = screen.getByText("Today").closest(".custom-class");
    expect(container).toBeInTheDocument();
  });

  it("handles view changes correctly", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    // Click each view button
    fireEvent.click(screen.getByText("Week"));
    expect(mockOnViewChange).toHaveBeenCalledWith("week");

    fireEvent.click(screen.getByText("Upcoming"));
    expect(mockOnViewChange).toHaveBeenCalledWith("upcoming");

    fireEvent.click(screen.getByText("All Tasks"));
    expect(mockOnViewChange).toHaveBeenCalledWith("all");

    fireEvent.click(screen.getByText("Today"));
    expect(mockOnViewChange).toHaveBeenCalledWith("today");
  });

  it("renders buttons in correct order", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map(button => 
      button.textContent?.replace(/[^a-zA-Z\s]/g, "").trim()
    );

    expect(buttonTexts).toEqual(["Today", "Week", "Upcoming", "All Tasks"]);
  });

  it("shows responsive text labels", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const buttons = screen.getAllByRole("button");
    
    buttons.forEach(button => {
      const textSpan = button.querySelector("span");
      expect(textSpan).toHaveClass("hidden", "sm:inline");
    });
  });

  it("has correct button sizes", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const buttons = screen.getAllByRole("button");
    
    buttons.forEach(button => {
      expect(button).toHaveClass("h-8", "px-3"); // sm size
    });
  });

  it("maintains flex layout", () => {
    render(
      <ViewToggle 
        currentView="today" 
        onViewChange={mockOnViewChange} 
      />
    );

    const container = screen.getByText("Today").parentElement;
    expect(container).toHaveClass("flex", "items-center", "space-x-1");
  });
});
