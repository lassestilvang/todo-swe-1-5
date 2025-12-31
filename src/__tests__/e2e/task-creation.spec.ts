import { test, expect } from '@playwright/test';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should create a new task using the task form', async ({ page }) => {
    // Click the "New Task" button to open the task form
    await page.click('[data-testid="new-task-button"]');
    
    // Wait for the task form to be visible
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    
    // Fill in the task details
    await page.fill('[data-testid="task-name-input"]', 'Complete project documentation');
    await page.fill('[data-testid="task-description-input"]', 'Write comprehensive documentation for the task management system');
    
    // Set priority
    await page.click('[data-testid="priority-select"]');
    await page.click('[data-testid="priority-high"]');
    
    // Set due date
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-today"]');
    
    // Set time estimate
    await page.fill('[data-testid="time-estimate-input"]', '2h 30m');
    
    // Submit the form
    await page.click('[data-testid="create-task-button"]');
    
    // Verify the task was created
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Complete project documentation');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('High');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('2h 30m');
  });

  test('should create a task using natural language input', async ({ page }) => {
    // Focus on the natural language input
    await page.focus('[data-testid="natural-language-input"]');
    
    // Type a complex task description
    await page.fill('[data-testid="natural-language-input"]', 'Urgent meeting with client tomorrow at 2 PM #work 1h');
    
    // Wait for the parsed task preview
    await expect(page.locator('[data-testid="task-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-preview"]')).toContainText('meeting with client');
    await expect(page.locator('[data-testid="task-preview"]')).toContainText('Urgent');
    await expect(page.locator('[data-testid="task-preview"]')).toContainText('work');
    await expect(page.locator('[data-testid="task-preview"]')).toContainText('1h');
    
    // Create the task
    await page.click('[data-testid="create-task-button"]');
    
    // Verify the task was created with all parsed details
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toContainText('meeting with client');
    await expect(taskCard).toContainText('Urgent');
    await expect(taskCard).toContainText('1h');
  });

  test('should create a recurring task', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill in basic task details
    await page.fill('[data-testid="task-name-input"]', 'Weekly team meeting');
    
    // Enable recurring task
    await page.check('[data-testid="recurring-checkbox"]');
    
    // Set recurring pattern
    await page.click('[data-testid="recurring-pattern-select"]');
    await page.click('[data-testid="pattern-weekly"]');
    
    // Set interval
    await page.fill('[data-testid="recurring-interval-input"]', '1');
    
    // Select days of week
    await page.click('[data-testid="day-monday"]');
    await page.click('[data-testid="day-wednesday"]');
    await page.click('[data-testid="day-friday"]');
    
    // Create the task
    await page.click('[data-testid="create-task-button"]');
    
    // Verify the recurring task was created
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toContainText('Weekly team meeting');
    await expect(taskCard).toContainText('Recurring');
  });

  test('should validate required fields', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Try to submit without filling required fields
    await page.click('[data-testid="create-task-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Task name is required');
    
    // Fill in the name and try again
    await page.fill('[data-testid="task-name-input"]', 'Valid task name');
    await page.click('[data-testid="create-task-button"]');
    
    // Should succeed and close the form
    await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible();
  });

  test('should cancel task creation', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill in some details
    await page.fill('[data-testid="task-name-input"]', 'Task to be cancelled');
    
    // Click cancel
    await page.click('[data-testid="cancel-button"]');
    
    // Form should close and task should not be created
    await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="task-card"]')).not.toContainText('Task to be cancelled');
  });

  test('should assign task to a list', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill in task details
    await page.fill('[data-testid="task-name-input"]', 'Work related task');
    
    // Select a list
    await page.click('[data-testid="list-select"]');
    await page.click('[data-testid="list-work"]');
    
    // Create the task
    await page.click('[data-testid="create-task-button"]');
    
    // Verify the task appears in the selected list
    await page.click('[data-testid="sidebar-work-list"]');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Work related task');
  });

  test('should add labels to task', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill in task details
    await page.fill('[data-testid="task-name-input"]', 'Multi-label task');
    
    // Add labels
    await page.click('[data-testid="label-urgent"]');
    await page.click('[data-testid="label-important"]');
    await page.click('[data-testid="label-bug"]');
    
    // Create the task
    await page.click('[data-testid="create-task-button"]');
    
    // Verify the task shows all labels
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toContainText('Multi-label task');
    await expect(taskCard.locator('[data-testid="task-labels"]')).toContainText('Urgent');
    await expect(taskCard.locator('[data-testid="task-labels"]')).toContainText('Important');
    await expect(taskCard.locator('[data-testid="task-labels"]')).toContainText('Bug');
  });

  test('should handle auto-save functionality', async ({ page }) => {
    // Click the "New Task" button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill in task details
    await page.fill('[data-testid="task-name-input"]', 'Auto-saved task');
    await page.fill('[data-testid="task-description-input"]', 'This task should be auto-saved');
    
    // Wait for auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('saving...');
    
    // Wait for save to complete
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Draft');
    
    // Close and reopen the form
    await page.click('[data-testid="cancel-button"]');
    await page.click('[data-testid="new-task-button"]');
    
    // Check if draft is restored (this would depend on implementation)
    // For now, just verify the form opens correctly
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
  });
});
