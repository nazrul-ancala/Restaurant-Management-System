import { Page } from '@playwright/test';

export async function login(
  page: Page,
  email = process.env.E2E_ADMIN_EMAIL || 'admin@rms.local',
  password = process.env.E2E_ADMIN_PASSWORD || 'admin123'
) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter email').fill(email);
  await page.getByPlaceholder('Enter Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/dashboard/);
}
