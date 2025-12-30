"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ContextErrorBoundary } from "@/components/ContextErrorBoundary";

export type ViewType = "today" | "week" | "upcoming" | "all";

export interface ViewState {
  currentView: ViewType;
  showCompleted: boolean;
  selectedListId: string | null;
  selectedLabelIds: string[];
  priorityFilter: ("High" | "Medium" | "Low" | "None")[];
  searchQuery: string;
  dateRangeFilter: {
    startDate: string | null;
    endDate: string | null;
  };
}

type ViewAction =
  | { type: "SET_VIEW"; payload: ViewType }
  | { type: "TOGGLE_COMPLETED" }
  | { type: "SET_COMPLETED"; payload: boolean }
  | { type: "SET_LIST_FILTER"; payload: string | null }
  | { type: "SET_LABEL_FILTER"; payload: string[] }
  | { type: "SET_PRIORITY_FILTER"; payload: ("High" | "Medium" | "Low" | "None")[] }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_DATE_RANGE_FILTER"; payload: { startDate: string | null; endDate: string | null } };

const initialState: ViewState = {
  currentView: "today",
  showCompleted: false,
  selectedListId: null,
  selectedLabelIds: [],
  priorityFilter: [],
  searchQuery: "",
  dateRangeFilter: {
    startDate: null,
    endDate: null,
  },
};

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    
    case "TOGGLE_COMPLETED":
      return { ...state, showCompleted: !state.showCompleted };
    
    case "SET_COMPLETED":
      return { ...state, showCompleted: action.payload };
    
    case "SET_LIST_FILTER":
      return { ...state, selectedListId: action.payload };
    
    case "SET_LABEL_FILTER":
      return { ...state, selectedLabelIds: action.payload };
    
    case "SET_PRIORITY_FILTER":
      return { ...state, priorityFilter: action.payload };
    
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    
    case "SET_DATE_RANGE_FILTER":
      return { ...state, dateRangeFilter: action.payload };
    
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromUrl = useRef(false);

  // Sync state with URL on mount and when search params change
  useEffect(() => {
    const view = (searchParams.get('view') as ViewType) || initialState.currentView;
    const showCompleted = searchParams.get('completed') === 'true';
    const selectedListId = searchParams.get('list');
    const selectedLabelIds = searchParams.get('labels')?.split(',').filter(Boolean) || [];
    const priorityFilter = searchParams.get('priority')?.split(',').filter(Boolean) as ("High" | "Medium" | "Low" | "None")[] || [];
    const searchQuery = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Update state if URL params differ from current state
    if (
      view !== state.currentView ||
      showCompleted !== state.showCompleted ||
      selectedListId !== state.selectedListId ||
      JSON.stringify(selectedLabelIds) !== JSON.stringify(state.selectedLabelIds) ||
      JSON.stringify(priorityFilter) !== JSON.stringify(state.priorityFilter) ||
      searchQuery !== state.searchQuery ||
      startDate !== state.dateRangeFilter.startDate ||
      endDate !== state.dateRangeFilter.endDate
    ) {
      isUpdatingFromUrl.current = true;
      dispatch({ type: "SET_VIEW", payload: view });
      dispatch({ type: "SET_COMPLETED", payload: showCompleted });
      dispatch({ type: "SET_LIST_FILTER", payload: selectedListId });
      dispatch({ type: "SET_LABEL_FILTER", payload: selectedLabelIds });
      dispatch({ type: "SET_PRIORITY_FILTER", payload: priorityFilter });
      dispatch({ type: "SET_SEARCH_QUERY", payload: searchQuery });
      dispatch({ type: "SET_DATE_RANGE_FILTER", payload: { startDate, endDate } });
      isUpdatingFromUrl.current = false;
    }
  }, [searchParams]);

  // Update URL when state changes (but not when updating from URL)
  useEffect(() => {
    if (isUpdatingFromUrl.current) return;

    const params = new URLSearchParams();
    
    if (state.currentView !== initialState.currentView) {
      params.set('view', state.currentView);
    }
    if (state.showCompleted) {
      params.set('completed', 'true');
    }
    if (state.selectedListId) {
      params.set('list', state.selectedListId);
    }
    if (state.selectedLabelIds.length > 0) {
      params.set('labels', state.selectedLabelIds.join(','));
    }
    if (state.priorityFilter.length > 0) {
      params.set('priority', state.priorityFilter.join(','));
    }
    if (state.searchQuery) {
      params.set('search', state.searchQuery);
    }
    if (state.dateRangeFilter.startDate) {
      params.set('startDate', state.dateRangeFilter.startDate);
    }
    if (state.dateRangeFilter.endDate) {
      params.set('endDate', state.dateRangeFilter.endDate);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(newUrl, { scroll: false });
  }, [state, router]);

  return (
    <ContextErrorBoundary>
      <ViewContext.Provider value={{ state, dispatch }}>
        {children}
      </ViewContext.Provider>
    </ContextErrorBoundary>
  );
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within a ViewProvider");
  }
  return context;
}
