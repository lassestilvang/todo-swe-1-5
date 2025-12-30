import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Create database connection for server-side use only
const sqlite = new Database("todo-app.db");
export const db = drizzle(sqlite, { schema });

// Export for use in server components and API routes
export { schema };
