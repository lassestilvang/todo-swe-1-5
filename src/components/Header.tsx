"use client";

import { ReactNode } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Mobile menu button or left content */}
      <div className="flex items-center space-x-4">
        {children}
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <SearchBar />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
