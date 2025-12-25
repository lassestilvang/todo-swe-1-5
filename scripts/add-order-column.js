const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'todo-app.db');
const db = new Database(dbPath);

try {
  // Add the order column to subtasks table
  const stmt = db.prepare('ALTER TABLE subtasks ADD COLUMN order INTEGER DEFAULT 0 NOT NULL');
  stmt.run();
  console.log('Successfully added order column to subtasks table');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Order column already exists');
  } else {
    console.error('Error adding order column:', error);
  }
} finally {
  db.close();
}
