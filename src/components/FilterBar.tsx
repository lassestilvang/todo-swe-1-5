"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DateRangeFilter } from "./DateRangeFilter";
import { useViewContext } from "@/contexts/ViewContext";
import { cn } from "@/lib/utils";

export function FilterBar() {
  const { state, dispatch } = useViewContext();

  const hasActiveFilters = 
    state.showCompleted ||
    state.selectedListId ||
    state.selectedLabelIds.length > 0 ||
    state.priorityFilter.length > 0 ||
    state.dateRangeFilter.startDate ||
    state.dateRangeFilter.endDate ||
    state.searchQuery;

  const handleClearAllFilters = () => {
    dispatch({ type: "SET_COMPLETED", payload: false });
    dispatch({ type: "SET_LIST_FILTER", payload: null });
    dispatch({ type: "SET_LABEL_FILTER", payload: [] });
    dispatch({ type: "SET_PRIORITY_FILTER", payload: [] });
    dispatch({ type: "SET_DATE_RANGE_FILTER", payload: { startDate: null, endDate: null } });
    dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
  };

  const getFilterCount = () => {
    let count = 0;
    if (state.showCompleted) count++;
    if (state.selectedListId) count++;
    if (state.selectedLabelIds.length > 0) count++;
    if (state.priorityFilter.length > 0) count++;
    if (state.dateRangeFilter.startDate || state.dateRangeFilter.endDate) count++;
    if (state.searchQuery) count++;
    return count;
  };

  return (
    <div className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center space-x-3">
        <DateRangeFilter />
        
        {/* Show active filter count */}
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} active
          </Badge>
        )}
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}
