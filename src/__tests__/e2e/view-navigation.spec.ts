import { test, expect } from '@playwright/test';

test.describe('View Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Create test tasks with different dates
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Today task');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-today"]');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Tomorrow task');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-tomorrow"]');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Next week task');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-next-week"]');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'No date task');
    await page.click('[data-testid="create-task-button"]');
  });

  test('should navigate between different views', async ({ page }) => {
    // Start in Today view
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Today');
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Today task');
    
    // Navigate to Week view
    await page.click('[data-testid="view-toggle"] button:has-text("Week")');
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Week');
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Today task');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Tomorrow task');
    
    // Navigate to Upcoming view
    await page.click('[data-testid="view-toggle"] button:has-text("Upcoming")');
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Upcoming');
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Today task');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Tomorrow task');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Next week task');
    
    // Navigate to All Tasks view
    await page.click('[data-testid="view-toggle"] button:has-text("All Tasks")');
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('All Tasks');
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(4);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('No date task');
  });

  test('should show task counts in navigation', async ({ page }) => {
    // Check task counts in view toggle
    const todayButton = page.locator('[data-testid="view-toggle"] button:has-text("Today")');
    await expect(todayButton).toContainText('1');
    
    const weekButton = page.locator('[data-testid="view-toggle"] button:has-text("Week")');
    await expect(weekButton).toContainText('2');
    
    const upcomingButton = page.locator('[data-testid="view-toggle"] button:has-text("Upcoming")');
    await expect(upcomingButton).toContainText('3');
    
    const allTasksButton = page.locator('[data-testid="view-toggle"] button:has-text("All Tasks")');
    await expect(allTasksButton).toContainText('4');
  });

  test('should filter completed tasks', async ({ page }) => {
    // Complete one task
    await page.click('[data-testid="task-checkbox"]:first');
    
    // Toggle show completed
    await page.click('[data-testid="show-completed-toggle"]');
    
    // Should still show all tasks including completed
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(4);
    await expect(page.locator('[data-testid="task-card"].completed')).toHaveCount(1);
    
    // Hide completed tasks
    await page.click('[data-testid="show-completed-toggle"]');
    
    // Should hide completed tasks
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="task-card"].completed')).toHaveCount(0);
  });

  test('should filter by priority', async ({ page }) => {
    // Create tasks with different priorities
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'High priority task');
    await page.click('[data-testid="priority-select"]');
    await page.click('[data-testid="priority-high"]');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Low priority task');
    await page.click('[data-testid="priority-select"]');
    await page.click('[data-testid="priority-low"]');
    await page.click('[data-testid="create-task-button"]');
    
    // Filter by High priority
    await page.click('[data-testid="priority-filter"]');
    await page.click('[data-testid="filter-high"]');
    
    // Should only show high priority tasks
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('High priority task');
    
    // Clear priority filter
    await page.click('[data-testid="priority-filter"]');
    await page.click('[data-testid="filter-all"]');
    
    // Should show all tasks again
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(6);
  });

  test('should filter by list', async ({ page }) => {
    // Create tasks in different lists
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Work task');
    await page.click('[data-testid="list-select"]');
    await page.click('[data-testid="list-work"]');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Personal task');
    await page.click('[data-testid="list-select"]');
    await page.click('[data-testid="list-personal"]');
    await page.click('[data-testid="create-task-button"]');
    
    // Filter by Work list
    await page.click('[data-testid="sidebar-work-list"]');
    
    // Should only show work tasks
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Work task');
    
    // Filter by Personal list
    await page.click('[data-testid="sidebar-personal-list"]');
    
    // Should only show personal tasks
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Personal task');
    
    // Go back to All Tasks
    await page.click('[data-testid="sidebar-all-tasks"]');
    
    // Should show all tasks
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(8);
  });

  test('should handle date range filtering', async ({ page }) => {
    // Open date range filter
    await page.click('[data-testid="date-range-filter"]');
    
    // Set custom date range
    await page.click('[data-testid="start-date-picker"]');
    await page.click('[data-testid="calendar-today"]');
    await page.click('[data-testid="end-date-picker"]');
    await page.click('[data-testid="calendar-tomorrow"]');
    await page.click('[data-testid="apply-date-filter"]');
    
    // Should only show tasks within the date range
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Today task');
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Tomorrow task');
    
    // Clear date filter
    await page.click('[data-testid="date-range-filter"]');
    await page.click('[data-testid="clear-date-filter"]');
    
    // Should show all tasks again
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(6);
  });

  test('should highlight overdue tasks', async ({ page }) => {
    // Create an overdue task
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Overdue task');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-yesterday"]');
    await page.click('[data-testid="create-task-button"]');
    
    // Should show overdue indicator
    const overdueTask = page.locator('[data-testid="task-card"]:has-text("Overdue task")');
    await expect(overdueTask.locator('[data-testid="overdue-indicator"]')).toBeVisible();
    await expect(overdueTask).toHaveClass(/overdue/);
  });

  test('should maintain view state across navigation', async ({ page }) => {
    // Navigate to Week view
    await page.click('[data-testid="view-toggle"] button:has-text("Week")');
    
    // Apply a filter
    await page.click('[data-testid="show-completed-toggle"]');
    
    // Navigate to another page and come back
    await page.goto('http://localhost:3000/settings');
    await page.goBack();
    
    // Should maintain the view and filter state
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Week');
    await expect(page.locator('[data-testid="show-completed-toggle"]')).toBeChecked();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test keyboard shortcuts for view navigation
    await page.keyboard.press('Alt+1'); // Today view
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Today');
    
    await page.keyboard.press('Alt+2'); // Week view
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Week');
    
    await page.keyboard.press('Alt+3'); // Upcoming view
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('Upcoming');
    
    await page.keyboard.press('Alt+4'); // All Tasks view
    await expect(page.locator('[data-testid="view-toggle"] [data-active="true"]')).toContainText('All Tasks');
  });

  test('should show empty states for different views', async ({ page }) => {
    // Delete all tasks
    await page.locator('[data-testid="task-card"]').first().hover();
    await page.click('[data-testid="task-delete-button"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Repeat for all tasks
    while (await page.locator('[data-testid="task-card"]').count() > 0) {
      await page.locator('[data-testid="task-card"]').first().hover();
      await page.click('[data-testid="task-delete-button"]');
      await page.click('[data-testid="confirm-delete"]');
    }
    
    // Should show empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No tasks found');
    
    // Create a task for tomorrow
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-name-input"]', 'Future task');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-tomorrow"]');
    await page.click('[data-testid="create-task-button"]');
    
    // Today view should be empty
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    
    // Week view should show the task
    await page.click('[data-testid="view-toggle"] button:has-text("Week")');
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
  });
});
