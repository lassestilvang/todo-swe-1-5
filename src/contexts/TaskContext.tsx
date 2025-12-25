"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { tasksOps, listsOps, labelsOps, subtasksOps, activityLogsOps } from "@/lib/db/operations";

// Types
export interface Task {
  id: string;
  name: string;
  description?: string;
  date?: string;
  deadline?: string;
  estimate?: string;
  actualTime?: string;
  priority: "High" | "Medium" | "Low" | "None";
  completed: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
  subtasks?: Subtask[];
}

export interface List {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  action: "created" | "updated" | "deleted" | "completed";
  details?: string;
  timestamp: string;
}

// State
interface TaskState {
  tasks: Task[];
  lists: List[];
  labels: Label[];
  subtasks: Subtask[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

// Actions
type TaskAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "SET_LISTS"; payload: List[] }
  | { type: "ADD_LIST"; payload: List }
  | { type: "UPDATE_LIST"; payload: List }
  | { type: "DELETE_LIST"; payload: string }
  | { type: "SET_LABELS"; payload: Label[] }
  | { type: "ADD_LABEL"; payload: Label }
  | { type: "UPDATE_LABEL"; payload: Label }
  | { type: "DELETE_LABEL"; payload: string }
  | { type: "SET_SUBTASKS"; payload: Subtask[] }
  | { type: "ADD_SUBTASK"; payload: Subtask }
  | { type: "UPDATE_SUBTASK"; payload: Subtask }
  | { type: "DELETE_SUBTASK"; payload: string }
  | { type: "TOGGLE_SUBTASK"; payload: string }
  | { type: "SET_ACTIVITY_LOGS"; payload: ActivityLog[] }
  | { type: "ADD_ACTIVITY_LOG"; payload: ActivityLog }
  | { type: "LOAD_INITIAL_DATA"; payload: { tasks?: Task[]; lists?: List[]; labels?: Label[]; subtasks?: Subtask[]; activityLogs?: ActivityLog[] } };

// Initial state
const initialState: TaskState = {
  tasks: [],
  lists: [],
  labels: [],
  subtasks: [],
  activityLogs: [],
  loading: false,
  error: null,
};

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    
    case "SET_TASKS":
      return { ...state, tasks: action.payload, loading: false };
    
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    
    case "SET_LISTS":
      return { ...state, lists: action.payload };
    
    case "ADD_LIST":
      return { ...state, lists: [...state.lists, action.payload] };
    
    case "UPDATE_LIST":
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
      };
    
    case "DELETE_LIST":
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
      };
    
    case "SET_LABELS":
      return { ...state, labels: action.payload };
    
    case "ADD_LABEL":
      return { ...state, labels: [...state.labels, action.payload] };
    
    case "UPDATE_LABEL":
      return {
        ...state,
        labels: state.labels.map(label =>
          label.id === action.payload.id ? action.payload : label
        ),
      };
    
    case "DELETE_LABEL":
      return {
        ...state,
        labels: state.labels.filter(label => label.id !== action.payload),
      };
    
    case "SET_SUBTASKS":
      return { ...state, subtasks: action.payload };
    
    case "ADD_SUBTASK":
      return { ...state, subtasks: [...state.subtasks, action.payload] };
    
    case "UPDATE_SUBTASK":
      return {
        ...state,
        subtasks: state.subtasks.map(subtask =>
          subtask.id === action.payload.id ? action.payload : subtask
        ),
      };
    
    case "DELETE_SUBTASK":
      return {
        ...state,
        subtasks: state.subtasks.filter(subtask => subtask.id !== action.payload),
      };
    
    case "TOGGLE_SUBTASK":
      return {
        ...state,
        subtasks: state.subtasks.map(subtask =>
          subtask.id === action.payload
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        ),
      };
    
    case "SET_ACTIVITY_LOGS":
      return { ...state, activityLogs: action.payload };
    
    case "ADD_ACTIVITY_LOG":
      return { ...state, activityLogs: [...state.activityLogs, action.payload] };
    
    case "LOAD_INITIAL_DATA":
      return {
        ...state,
        tasks: action.payload.tasks || [],
        lists: action.payload.lists || [],
        labels: action.payload.labels || [],
        subtasks: action.payload.subtasks || [],
        activityLogs: action.payload.activityLogs || [],
        loading: false,
      };
    
    default:
      return state;
  }
}

// Context
const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  actions: {
    createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    createList: (list: Omit<List, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateList: (id: string, data: Partial<List>) => Promise<void>;
    deleteList: (id: string) => Promise<void>;
    createLabel: (label: Omit<Label, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateLabel: (id: string, data: Partial<Label>) => Promise<void>;
    deleteLabel: (id: string) => Promise<void>;
    createSubtask: (subtask: Omit<Subtask, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateSubtask: (id: string, data: Partial<Subtask>) => Promise<void>;
    deleteSubtask: (id: string) => Promise<void>;
    toggleSubtask: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
  };
} | null>(null);

// Provider
export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load initial data
  const loadInitialData = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [tasks, lists, labels, subtasks, activityLogs] = await Promise.all([
        tasksOps.getAll(),
        listsOps.getAll(),
        labelsOps.getAll(),
        // We'll load subtasks and activity logs per task as needed
        Promise.resolve([]),
        Promise.resolve([]),
      ]);
      
      // Create default inbox if it doesn't exist
      if (lists.length === 0 || !lists.some(l => l.isDefault)) {
        const inboxList = await listsOps.create({
          name: "Inbox",
          color: "#3b82f6",
          isDefault: true,
        });
        lists.push(inboxList);
      }
      
      dispatch({ 
        type: "LOAD_INITIAL_DATA", 
        payload: { tasks, lists, labels, subtasks, activityLogs } 
      });
    } catch (error) {
      console.error("Failed to load initial data:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Actions
  const actions = {
    createTask: async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newTask = await tasksOps.create(task);
        dispatch({ type: "ADD_TASK", payload: newTask });
      } catch (error) {
        console.error("Failed to create task:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create task" });
      }
    },

    updateTask: async (id: string, data: Partial<Task>) => {
      try {
        const updatedTask = await tasksOps.update(id, data);
        dispatch({ type: "UPDATE_TASK", payload: updatedTask });
      } catch (error) {
        console.error("Failed to update task:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update task" });
      }
    },

    deleteTask: async (id: string) => {
      try {
        await tasksOps.delete(id);
        dispatch({ type: "DELETE_TASK", payload: id });
      } catch (error) {
        console.error("Failed to delete task:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete task" });
      }
    },

    toggleTask: async (id: string) => {
      try {
        const updatedTask = await tasksOps.toggle(id);
        dispatch({ type: "UPDATE_TASK", payload: updatedTask });
      } catch (error) {
        console.error("Failed to toggle task:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to toggle task" });
      }
    },

    createList: async (list: Omit<List, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newList = await listsOps.create(list);
        dispatch({ type: "ADD_LIST", payload: newList });
      } catch (error) {
        console.error("Failed to create list:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create list" });
      }
    },

    updateList: async (id: string, data: Partial<List>) => {
      try {
        const updatedList = await listsOps.update(id, data);
        dispatch({ type: "UPDATE_LIST", payload: updatedList });
      } catch (error) {
        console.error("Failed to update list:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update list" });
      }
    },

    deleteList: async (id: string) => {
      try {
        await listsOps.delete(id);
        dispatch({ type: "DELETE_LIST", payload: id });
      } catch (error) {
        console.error("Failed to delete list:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete list" });
      }
    },

    createLabel: async (label: Omit<Label, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newLabel = await labelsOps.create(label);
        dispatch({ type: "ADD_LABEL", payload: newLabel });
      } catch (error) {
        console.error("Failed to create label:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create label" });
      }
    },

    updateLabel: async (id: string, data: Partial<Label>) => {
      try {
        const updatedLabel = await labelsOps.update(id, data);
        dispatch({ type: "UPDATE_LABEL", payload: updatedLabel });
      } catch (error) {
        console.error("Failed to update label:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update label" });
      }
    },

    deleteLabel: async (id: string) => {
      try {
        await labelsOps.delete(id);
        dispatch({ type: "DELETE_LABEL", payload: id });
      } catch (error) {
        console.error("Failed to delete label:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete label" });
      }
    },

    createSubtask: async (subtask: Omit<Subtask, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newSubtask = await subtasksOps.create(subtask);
        dispatch({ type: "ADD_SUBTASK", payload: newSubtask });
      } catch (error) {
        console.error("Failed to create subtask:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create subtask" });
      }
    },

    updateSubtask: async (id: string, data: Partial<Subtask>) => {
      try {
        const updatedSubtask = await subtasksOps.update(id, data);
        dispatch({ type: "UPDATE_SUBTASK", payload: updatedSubtask });
      } catch (error) {
        console.error("Failed to update subtask:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update subtask" });
      }
    },

    deleteSubtask: async (id: string) => {
      try {
        await subtasksOps.delete(id);
        dispatch({ type: "DELETE_SUBTASK", payload: id });
      } catch (error) {
        console.error("Failed to delete subtask:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete subtask" });
      }
    },

    toggleSubtask: async (id: string) => {
      try {
        const updatedSubtask = await subtasksOps.toggle(id);
        dispatch({ type: "UPDATE_SUBTASK", payload: updatedSubtask });
      } catch (error) {
        console.error("Failed to toggle subtask:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to toggle subtask" });
      }
    },

    refreshData: async () => {
      await loadInitialData();
    },
  };

  return (
    <TaskContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </TaskContext.Provider>
  );
}

// Hook
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
