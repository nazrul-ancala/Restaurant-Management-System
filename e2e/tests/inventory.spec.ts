import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import {
  createInventoryItem,
  deleteInventoryItem,
  findInventoryRow,
  readLowStockCount,
} from '../utils/inventory';

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('admin can add a new inventory item and see it in the table', async ({ page }) => {
    const item = await createInventoryItem(page);

    await page.getByPlaceholder('Search inventory...').fill(item.name);
    const row = findInventoryRow(page, item.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText('25 kg');
    await expect(row).toContainText('RM 12.50');

    await deleteInventoryItem(page, item.name);
  });

  test('admin can edit an inventory item', async ({ page }) => {
    const item = await createInventoryItem(page, { costPerUnit: 12.5 });

    const row = findInventoryRow(page, item.name);
    await row.getByTitle('Edit').click();

    const editForm = page.locator('form').filter({ has: page.locator('#name') });
    await expect(editForm.locator('#quantity')).toHaveCount(0);
    await expect(
      editForm.getByText('To change stock on hand, use the "Adjust Stock" action instead.')
    ).toBeVisible();
    await expect(editForm.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    await editForm.locator('#category').selectOption({ label: '+ Add New Category' });
    const categoryInput = editForm.locator('#category');
    await expect(categoryInput).toBeEditable();
    await categoryInput.fill('E2E Category Edited');
    await editForm.locator('#costPerUnit').fill('99.99');

    await editForm.getByRole('button', { name: 'Save Changes' }).click();
    await expect(editForm).toBeHidden();

    const updatedRow = findInventoryRow(page, item.name);
    await expect(updatedRow).toContainText('E2E Category Edited');
    await expect(updatedRow).toContainText('RM 99.99');

    await deleteInventoryItem(page, item.name);
  });

  test('admin can adjust stock and see it reflected in stock history', async ({ page }) => {
    const item = await createInventoryItem(page, { quantity: 20, unit: 'kg' });

    let row = findInventoryRow(page, item.name);
    await row.getByTitle('Adjust Stock').click();

    const adjustForm = page.locator('form').filter({ has: page.locator('#adjustType') });
    await expect(page.getByText(`Adjust Stock — ${item.name}`)).toBeVisible();

    await adjustForm.locator('#adjustType').selectOption('Purchase');
    await adjustForm.locator('#adjustQuantity').fill('10');
    await adjustForm.getByRole('button', { name: 'Save Adjustment' }).click();
    await expect(page.getByText(`Adjust Stock — ${item.name}`)).toBeHidden();

    row = findInventoryRow(page, item.name);
    await expect(row).toContainText('30 kg');

    await row.getByTitle('History').click();
    const historyModal = page.locator('.modal').filter({ hasText: 'Stock History' });
    await expect(historyModal).toBeVisible();
    await expect(historyModal.getByText('No stock movements yet')).toHaveCount(0);
    await expect(historyModal).toContainText('Purchase');
    await expect(historyModal).toContainText('+10 kg');

    await page.keyboard.press('Escape');
    await expect(historyModal).toBeHidden();

    await deleteInventoryItem(page, item.name);
  });

  test('low-stock alert banner updates when a low-stock item is added and removed', async ({ page }) => {
    // Force the page off PREVIEW_INVENTORY demo data before capturing a baseline,
    // since the low-stock count is global across all real DB items.
    const sentinel = await createInventoryItem(page, { quantity: 1000, reorderThreshold: 1 });
    const baseline = await readLowStockCount(page);

    const lowItem = await createInventoryItem(page, { quantity: 2, reorderThreshold: 5 });
    const afterCreate = await readLowStockCount(page);
    expect(afterCreate).toBe(baseline + 1);

    await deleteInventoryItem(page, lowItem.name);
    const afterDelete = await readLowStockCount(page);
    expect(afterDelete).toBe(baseline);

    await deleteInventoryItem(page, sentinel.name);
  });

  test('shows a validation error when Name is left blank', async ({ page }) => {
    await page.goto('/inventory');
    await page.getByRole('button', { name: 'Add Item' }).click();

    const modalForm = page.locator('form').filter({ has: page.locator('#name') });

    await modalForm.locator('#category').selectOption({ label: '+ Add New Category' });
    const categoryInput = modalForm.locator('#category');
    await expect(categoryInput).toBeEditable();
    await categoryInput.fill('E2E Category');
    await modalForm.locator('#unit').selectOption('kg');
    await modalForm.locator('#quantity').fill('25');
    await modalForm.locator('#reorderThreshold').fill('5');
    await modalForm.locator('#costPerUnit').fill('12.50');

    await modalForm.getByRole('button', { name: 'Add Item' }).click();

    await expect(modalForm.getByText('Name is required')).toBeVisible();
    await expect(modalForm).toBeVisible();
    await expect(modalForm.locator('#name')).toBeVisible();
  });
});
