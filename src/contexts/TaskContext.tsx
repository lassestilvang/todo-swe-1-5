"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

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
  | { type: "ADD_ACTIVITY_LOG"; payload: ActivityLog };

// Initial state
const initialState: TaskState = {
  tasks: [],
  lists: [
    {
      id: "inbox",
      name: "Inbox",
      color: "#3b82f6",
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
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
    
    default:
      return state;
  }
}

// Context
const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
} | null>(null);

// Provider
export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
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
