"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

export type ViewType = "today" | "week" | "upcoming" | "all";

interface ViewState {
  currentView: ViewType;
  showCompleted: boolean;
  selectedListId: string | null;
  selectedLabelIds: string[];
  priorityFilter: ("High" | "Medium" | "Low" | "None")[];
  searchQuery: string;
}

type ViewAction =
  | { type: "SET_VIEW"; payload: ViewType }
  | { type: "TOGGLE_COMPLETED" }
  | { type: "SET_LIST_FILTER"; payload: string | null }
  | { type: "SET_LABEL_FILTER"; payload: string[] }
  | { type: "SET_PRIORITY_FILTER"; payload: ("High" | "Medium" | "Low" | "None")[] }
  | { type: "SET_SEARCH_QUERY"; payload: string };

const initialState: ViewState = {
  currentView: "today",
  showCompleted: false,
  selectedListId: null,
  selectedLabelIds: [],
  priorityFilter: [],
  searchQuery: "",
};

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    
    case "TOGGLE_COMPLETED":
      return { ...state, showCompleted: !state.showCompleted };
    
    case "SET_LIST_FILTER":
      return { ...state, selectedListId: action.payload };
    
    case "SET_LABEL_FILTER":
      return { ...state, selectedLabelIds: action.payload };
    
    case "SET_PRIORITY_FILTER":
      return { ...state, priorityFilter: action.payload };
    
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    
    default:
      return state;
  }
}

const ViewContext = createContext<{
  state: ViewState;
  dispatch: React.Dispatch<ViewAction>;
} | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(viewReducer, initialState);

  return (
    <ViewContext.Provider value={{ state, dispatch }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within a ViewProvider");
  }
  return context;
}
