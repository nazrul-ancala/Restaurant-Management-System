import { Page, Locator, expect } from '@playwright/test';
import { escapeRegExp } from './text';

export type TableOverrides = Partial<{
  name: string;
  capacity: number | string;
}>;

export interface CreatedTable {
  name: string;
  capacity: number;
}

export async function createTable(
  page: Page,
  overrides: TableOverrides = {}
): Promise<CreatedTable> {
  const table = {
    name: overrides.name ?? `E2E Table ${Date.now()}`,
    capacity: Number(overrides.capacity ?? 4),
  };

  await page.goto('/tables');
  await page.getByRole('button', { name: 'Add Table' }).click();

  const modalForm = page.locator('form').filter({ has: page.locator('#name') });

  await modalForm.locator('#name').fill(table.name);
  await modalForm.locator('#capacity').fill(String(table.capacity));

  await modalForm.getByRole('button', { name: 'Add Table' }).click();
  await expect(modalForm).toBeHidden();

  return table;
}

export function findTableCard(page: Page, name: string): Locator {
  return page.locator('.card').filter({ hasText: new RegExp(escapeRegExp(name)) });
}

// Caller must already be on /tables with the card rendered.
export async function deleteTable(page: Page, name: string): Promise<void> {
  const card = findTableCard(page, name);
  await card.getByTitle('Delete').click();
  await page.getByRole('button', { name: 'Yes, Delete It!' }).click();
  await expect(findTableCard(page, name)).toHaveCount(0);
}
