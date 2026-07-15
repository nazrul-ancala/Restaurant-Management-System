import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import { createTable, deleteTable, findTableCard } from '../utils/tables';

test.describe('Tables', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('admin can add a new table and see it in the grid', async ({ page }) => {
    const table = await createTable(page);
    const card = findTableCard(page, table.name);

    await expect(card).toBeVisible();
    await expect(card).toContainText(`Seats ${table.capacity}`);
    await expect(card).toContainText('available');
    await expect(card.locator('select')).toHaveValue('available');

    await deleteTable(page, table.name);
  });

  test('admin can edit a table', async ({ page }) => {
    const table = await createTable(page, { capacity: 4 });
    const card = findTableCard(page, table.name);
    await card.getByTitle('Edit').click();

    const editForm = page.locator('form').filter({ has: page.locator('#name') });
    await expect(editForm.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    const newName = `${table.name} Edited`;
    await editForm.locator('#name').fill(newName);
    await editForm.locator('#capacity').fill('8');

    await editForm.getByRole('button', { name: 'Save Changes' }).click();
    await expect(editForm).toBeHidden();

    const updatedCard = findTableCard(page, newName);
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard).toContainText('Seats 8');

    await deleteTable(page, newName);
  });

  test("admin can change a table's status and it persists", async ({ page }) => {
    const table = await createTable(page);
    const card = findTableCard(page, table.name);
    const statusSelect = card.locator('select');

    await expect(statusSelect).toHaveValue('available');
    await statusSelect.selectOption('reserved');

    await expect(statusSelect).toHaveValue('reserved');
    await expect(card).toContainText('reserved');

    await page.reload();
    const reloadedCard = findTableCard(page, table.name);
    await expect(reloadedCard.locator('select')).toHaveValue('reserved');

    await deleteTable(page, table.name);
  });

  test('View QR modal shows the correct table and a Print button', async ({ page }) => {
    const table = await createTable(page);
    const card = findTableCard(page, table.name);

    await card.getByRole('button', { name: 'View QR' }).click();

    const qrModal = page.locator('.modal').filter({ hasText: `${table.name} — Order QR` });
    await expect(qrModal).toBeVisible();
    await expect(qrModal.getByRole('button', { name: 'Print' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(qrModal).toBeHidden();

    await deleteTable(page, table.name);
  });

  test('shows validation errors for invalid name/capacity input', async ({ page }) => {
    await page.goto('/tables');
    await page.getByRole('button', { name: 'Add Table' }).click();
    const modalForm = page.locator('form').filter({ has: page.locator('#name') });

    // blank name, valid capacity -> "Name is required"
    await modalForm.locator('#capacity').fill('4');
    await modalForm.getByRole('button', { name: 'Add Table' }).click();
    await expect(modalForm.getByText('Name is required')).toBeVisible();

    // valid name, blank capacity -> "Capacity is required"
    await modalForm.locator('#name').fill('E2E Validation Table');
    await modalForm.locator('#capacity').fill('');
    await modalForm.getByRole('button', { name: 'Add Table' }).click();
    await expect(modalForm.getByText('Capacity is required')).toBeVisible();

    // capacity = 0 -> "Capacity must be greater than 0"
    await modalForm.locator('#capacity').fill('0');
    await modalForm.getByRole('button', { name: 'Add Table' }).click();
    await expect(modalForm.getByText('Capacity must be greater than 0')).toBeVisible();

    // capacity = 1.5 -> "Whole numbers only"
    await modalForm.locator('#capacity').fill('1.5');
    await modalForm.getByRole('button', { name: 'Add Table' }).click();
    await expect(modalForm.getByText('Whole numbers only')).toBeVisible();

    // never submitted successfully throughout -> no table was created
    await expect(modalForm).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modalForm).toBeHidden();
  });
});
