import { beforeEach, vi } from "bun:test";
import { JSDOM } from "jsdom";

// Mock better-sqlite3
vi.mock("better-sqlite3", () => ({
  default: vi.fn(() => ({
    prepare: vi.fn(() => ({
      run: vi.fn(),
      all: vi.fn(() => []),
      get: vi.fn(() => null),
    })),
    exec: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock the database module
vi.mock("@/lib/db/server", () => ({
  db: {
    prepare: vi.fn(() => ({
      run: vi.fn(),
      all: vi.fn(() => []),
      get: vi.fn(() => null),
    })),
    exec: vi.fn(),
    close: vi.fn(),
  },
}));

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
  value: vi.fn().mockImplementation(query => ({
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

// Clean up after each test
beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});
