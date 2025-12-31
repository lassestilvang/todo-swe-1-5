import { describe, it, expect, beforeEach, vi } from "bun:test";
import { JSDOM } from "jsdom";

// Set up DOM environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
  resources: "usable",
});

global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLDivElement = dom.window.HTMLDivElement;
global.HTMLSpanElement = dom.window.HTMLSpanElement;
global.HTMLInputElement = dom.window.HTMLInputElement;
global.MouseEvent = dom.window.MouseEvent;
global.Event = dom.window.Event;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ViewToggle } from "@/components/ViewToggle";
import { ReactNode } from "react";

describe("ViewToggle Component", () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = "";
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
