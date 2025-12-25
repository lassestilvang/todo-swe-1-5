"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
}

type SearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_RESULTS"; payload: any[] }
  | { type: "SET_SEARCHING"; payload: boolean };

const initialState: SearchState = {
  query: "",
  results: [],
  isSearching: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    
    case "SET_RESULTS":
      return { ...state, results: action.payload, isSearching: false };
    
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload };
    
    default:
      return state;
  }
}

const SearchContext = createContext<{
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
} | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  return (
    <SearchContext.Provider value={{ state, dispatch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
