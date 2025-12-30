"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useViewContext } from "@/contexts/ViewContext";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

export function DateRangeFilter() {
  const { state, dispatch } = useViewContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    state.dateRangeFilter.startDate ? new Date(state.dateRangeFilter.startDate) : undefined
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    state.dateRangeFilter.endDate ? new Date(state.dateRangeFilter.endDate) : undefined
  );

  const handleClear = () => {
    dispatch({
      type: "SET_DATE_RANGE_FILTER",
      payload: { startDate: null, endDate: null }
    });
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setIsOpen(false);
  };

  const handleApply = () => {
    if (tempStartDate || tempEndDate) {
      dispatch({
        type: "SET_DATE_RANGE_FILTER",
        payload: {
          startDate: tempStartDate ? tempStartDate.toISOString().split('T')[0] : null,
          endDate: tempEndDate ? tempEndDate.toISOString().split('T')[0] : null
        }
      });
    }
    setIsOpen(false);
  };

  const hasActiveFilter = state.dateRangeFilter.startDate || state.dateRangeFilter.endDate;

  const formatDateDisplay = (date: string | null) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilter ? "default" : "outline"}
          size="sm"
          className="h-8"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Date Range
          {hasActiveFilter && (
            <span className="ml-1 text-xs">
              {state.dateRangeFilter.startDate && formatDateDisplay(state.dateRangeFilter.startDate)}
              {state.dateRangeFilter.startDate && state.dateRangeFilter.endDate && " - "}
              {state.dateRangeFilter.endDate && formatDateDisplay(state.dateRangeFilter.endDate)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Start Date</div>
            <CalendarComponent
              mode="single"
              selected={tempStartDate}
              onSelect={setTempStartDate}
              initialFocus
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">End Date</div>
            <CalendarComponent
              mode="single"
              selected={tempEndDate}
              onSelect={setTempEndDate}
              initialFocus
              className="rounded-md border"
              disabled={(date) => 
                tempStartDate ? isBefore(date, startOfDay(tempStartDate)) : false
              }
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
