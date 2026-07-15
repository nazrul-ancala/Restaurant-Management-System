import { Page, Locator, expect } from '@playwright/test';
import { escapeRegExp } from './text';

export type InventoryItemOverrides = Partial<{
  name: string;
  category: string;
  unit: string;
  quantity: number | string;
  reorderThreshold: number | string;
  costPerUnit: number | string;
}>;

export interface CreatedInventoryItem {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderThreshold: number;
  costPerUnit: number;
}

export async function createInventoryItem(
  page: Page,
  overrides: InventoryItemOverrides = {}
): Promise<CreatedInventoryItem> {
  const item = {
    name: overrides.name ?? `E2E Test Item ${Date.now()}`,
    category: overrides.category ?? 'E2E Category',
    unit: overrides.unit ?? 'kg',
    quantity: Number(overrides.quantity ?? 25),
    reorderThreshold: Number(overrides.reorderThreshold ?? 5),
    costPerUnit: Number(overrides.costPerUnit ?? 12.5),
  };

  await page.goto('/inventory');
  await page.getByRole('button', { name: 'Add Item' }).click();

  const modalForm = page.locator('form').filter({ has: page.locator('#name') });

  await modalForm.locator('#name').fill(item.name);

  await modalForm.locator('#category').selectOption({ label: '+ Add New Category' });
  const categoryInput = modalForm.locator('#category');
  await expect(categoryInput).toBeEditable();
  await categoryInput.fill(item.category);

  await modalForm.locator('#unit').selectOption(item.unit);
  await modalForm.locator('#quantity').fill(String(item.quantity));
  await modalForm.locator('#reorderThreshold').fill(String(item.reorderThreshold));
  await modalForm.locator('#costPerUnit').fill(String(item.costPerUnit));

  await modalForm.getByRole('button', { name: 'Add Item' }).click();
  await expect(modalForm).toBeHidden();

  return item;
}

export function findInventoryRow(page: Page, name: string): Locator {
  return page.getByRole('row', { name: new RegExp(escapeRegExp(name)) });
}

export async function deleteInventoryItem(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder('Search inventory...').fill(name);
  const row = findInventoryRow(page, name);
  await row.getByTitle('Delete').click();
  await page.getByRole('button', { name: 'Yes, Delete It!' }).click();
  await expect(page.getByText(name)).toHaveCount(0);
}

export async function readLowStockCount(page: Page): Promise<number> {
  const alert = page.locator('.alert', { hasText: 'low on stock' });
  if ((await alert.count()) === 0) return 0;
  const text = await alert.innerText();
  const match = text.match(/(\d+)\s+item/);
  return match ? Number(match[1]) : 0;
}
