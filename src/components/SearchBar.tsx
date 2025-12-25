"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Tag, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = "Search tasks...", className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state } = useTaskContext();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch?.(query.trim());
        // Add to search history
        if (!searchHistory.includes(query.trim())) {
          setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
        }
      } else {
        onSearch?.("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch, searchHistory]);

  // Filter tasks based on query
  const filteredTasks = state.tasks.filter(task => 
    task.name.toLowerCase().includes(query.toLowerCase()) ||
    task.description?.toLowerCase().includes(query.toLowerCase()) ||
    task.labels?.some(label => label.name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredTasks.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">
                {filteredTasks.length} tasks found
              </div>
              {filteredTasks.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                  onClick={() => {
                    // Handle task selection
                    setQuery(task.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{task.name}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {task.description}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {task.date && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.date}
                          </div>
                        )}
                        {task.priority !== "None" && (
                          <Badge variant="secondary" className="text-xs">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No tasks found
            </div>
          )}

          {/* Search History */}
          {!query && searchHistory.length > 0 && (
            <div className="border-t p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">
                Recent searches
              </div>
              {searchHistory.map((historyItem, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                  onClick={() => {
                    setQuery(historyItem);
                    inputRef.current?.focus();
                  }}
                >
                  <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-sm">{historyItem}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
