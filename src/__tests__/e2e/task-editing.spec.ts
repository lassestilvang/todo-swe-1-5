import { test, expect } from '@playwright/test';

test.describe('Task Editing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Create a test task first
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Task to be edited');
    await page.fill('[data-testid="task-description-input"]', 'Original description');
    await page.click('[data-testid="create-task-button"]');
    
    // Wait for task to be created
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Task to be edited');
  });

  test('should edit basic task information', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Wait for edit form to open
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-name-input"]')).toHaveValue('Task to be edited');
    
    // Edit the task name
    await page.fill('[data-testid="task-name-input"]', 'Edited task name');
    
    // Edit the description
    await page.fill('[data-testid="task-description-input"]', 'Updated description');
    
    // Change priority
    await page.click('[data-testid="priority-select"]');
    await page.click('[data-testid="priority-medium"]');
    
    // Save the changes
    await page.click('[data-testid="update-task-button"]');
    
    // Verify the changes
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Edited task name');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Updated description');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Medium');
  });

  test('should edit task date and time', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Set a due date
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-tomorrow"]');
    
    // Set a deadline time
    await page.fill('[data-testid="deadline-time-input"]', '14:30');
    
    // Update time estimate
    await page.fill('[data-testid="time-estimate-input"]', '3h 15m');
    
    // Save the changes
    await page.click('[data-testid="update-task-button"]');
    
    // Verify the changes
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toContainText('3h 15m');
  });

  test('should edit task labels', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Add labels
    await page.click('[data-testid="label-urgent"]');
    await page.click('[data-testid="label-bug"]');
    
    // Save the changes
    await page.click('[data-testid="update-task-button"]');
    
    // Verify the labels
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard.locator('[data-testid="task-labels"]')).toContainText('Urgent');
    await expect(taskCard.locator('[data-testid="task-labels"]')).toContainText('Bug');
  });

  test('should edit recurring task settings', async ({ page }) => {
    // Create a recurring task first
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Recurring task to edit');
    await page.check('[data-testid="recurring-checkbox"]');
    await page.click('[data-testid="recurring-pattern-select"]');
    await page.click('[data-testid="pattern-daily"]');
    await page.click('[data-testid="create-task-button"]');
    
    // Edit the recurring task
    await page.click('[data-testid="task-card"]:has-text("Recurring task to edit")');
    
    // Change recurring pattern
    await page.click('[data-testid="recurring-pattern-select"]');
    await page.click('[data-testid="pattern-weekly"]');
    
    // Select specific days
    await page.click('[data-testid="day-tuesday"]');
    await page.click('[data-testid="day-thursday"]');
    
    // Set end date
    await page.click('[data-testid="recurring-end-date"]');
    await page.click('[data-testid="calendar-next-month"]');
    await page.click('[data-testid="calendar-15th"]');
    
    // Save the changes
    await page.click('[data-testid="update-task-button"]');
    
    // Verify the recurring pattern changed
    const taskCard = page.locator('[data-testid="task-card"]:has-text("Recurring task to edit")');
    await expect(taskCard).toContainText('Recurring');
  });

  test('should cancel editing without saving changes', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Make some changes
    await page.fill('[data-testid="task-name-input"]', 'Changed name');
    await page.fill('[data-testid="task-description-input"]', 'Changed description');
    
    // Cancel editing
    await page.click('[data-testid="cancel-button"]');
    
    // Verify original task is unchanged
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Task to be edited');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Original description');
    await expect(page.locator('[data-testid="task-card"]')).not.toContainText('Changed name');
  });

  test('should toggle task completion', async ({ page }) => {
    // Mark task as complete
    await page.click('[data-testid="task-checkbox"]');
    
    // Verify task is marked as complete
    await expect(page.locator('[data-testid="task-card"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="task-card"]')).toHaveCSS('text-decoration', 'line-through');
    
    // Toggle back to incomplete
    await page.click('[data-testid="task-checkbox"]');
    
    // Verify task is incomplete again
    await expect(page.locator('[data-testid="task-card"]')).not.toHaveClass(/completed/);
    await expect(page.locator('[data-testid="task-card"]')).not.toHaveCSS('text-decoration', 'line-through');
  });

  test('should delete a task', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Click delete button
    await page.click('[data-testid="delete-task-button"]');
    
    // Confirm deletion in dialog
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify task is deleted
    await expect(page.locator('[data-testid="task-card"]')).not.toContainText('Task to be edited');
  });

  test('should handle validation during editing', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Clear the task name
    await page.fill('[data-testid="task-name-input"]', '');
    
    // Try to save
    await page.click('[data-testid="update-task-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Task name is required');
    
    // Fill in valid name and save
    await page.fill('[data-testid="task-name-input"]', 'Valid edited name');
    await page.click('[data-testid="update-task-button"]');
    
    // Should succeed
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Valid edited name');
  });

  test('should manage subtasks during editing', async ({ page }) => {
    // Click on the task to edit
    await page.click('[data-testid="task-card"]');
    
    // Add subtasks
    await page.click('[data-testid="add-subtask-button"]');
    await page.fill('[data-testid="subtask-input-0"]', 'First subtask');
    await page.click('[data-testid="add-subtask-button"]');
    await page.fill('[data-testid="subtask-input-1"]', 'Second subtask');
    
    // Mark first subtask as complete
    await page.check('[data-testid="subtask-checkbox-0"]');
    
    // Save the task
    await page.click('[data-testid="update-task-button"]');
    
    // Verify subtasks
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard.locator('[data-testid="subtask-progress"]')).toContainText('1/2');
    await expect(taskCard.locator('[data-testid="subtask-list"]')).toContainText('First subtask');
    await expect(taskCard.locator('[data-testid="subtask-list"]')).toContainText('Second subtask');
  });
});
