import { test, expect } from '@playwright/test';

test('user can add a task and mark it complete', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');

  const task = 'Review regression test cases';
  await page.getByPlaceholder('What needs to be done?').fill(task);
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  const todo = page.getByRole('listitem').filter({ hasText: task });
  await expect(todo).toBeVisible();

  await todo.getByRole('checkbox').check();
  await expect(todo).toHaveClass(/completed/);
});

test('Active filter shows only unfinished tasks', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Write test plan');
  await input.press('Enter');
  await input.fill('Review defects');
  await input.press('Enter');

  const completedTask = page.getByRole('listitem').filter({ hasText: 'Write test plan' });
  await completedTask.getByRole('checkbox').check();

  await page.getByRole('link', { name: 'Active' }).click();

  await expect(page.getByText('Review defects')).toBeVisible();
  await expect(page.getByText('Write test plan')).toBeHidden();
});