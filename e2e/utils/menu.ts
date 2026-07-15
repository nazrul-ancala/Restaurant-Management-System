import { Page, Locator, expect } from '@playwright/test';
import { escapeRegExp } from './text';

export type MenuItemOverrides = Partial<{
  name: string;
  category: string;
  price: number | string;
  description: string;
}>;

export interface CreatedMenuItem {
  name: string;
  category: string;
  price: number;
  description: string;
}

export async function createMenuItem(
  page: Page,
  overrides: MenuItemOverrides = {}
): Promise<CreatedMenuItem> {
  const item = {
    name: overrides.name ?? `E2E Menu Item ${Date.now()}`,
    category: overrides.category ?? 'E2E Menu Category',
    price: Number(overrides.price ?? 15.9),
    description: overrides.description ?? '',
  };

  await page.goto('/menu');
  await page.getByRole('button', { name: 'Add Item' }).click();

  const modalForm = page.locator('form').filter({ has: page.locator('#name') });

  await modalForm.locator('#name').fill(item.name);

  await modalForm.locator('#category').selectOption({ label: '+ Add New Category' });
  const categoryInput = modalForm.locator('#category');
  await expect(categoryInput).toBeEditable();
  await categoryInput.fill(item.category);

  await modalForm.locator('#price').fill(String(item.price));
  if (item.description) {
    await modalForm.locator('#description').fill(item.description);
  }

  await modalForm.getByRole('button', { name: 'Add Item' }).click();
  await expect(modalForm).toBeHidden();

  return item;
}

export function findMenuRow(page: Page, name: string): Locator {
  return page.getByRole('row', { name: new RegExp(escapeRegExp(name)) });
}

export async function deleteMenuItem(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder('Search menu items...').fill(name);
  const row = findMenuRow(page, name);
  await row.getByTitle('Delete').click();
  await page.getByRole('button', { name: 'Yes, Delete It!' }).click();
  await expect(page.getByText(name)).toHaveCount(0);
}
